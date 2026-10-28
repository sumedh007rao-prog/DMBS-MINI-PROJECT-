import { pool } from '@/lib/db.js';
import { guard } from '@/lib/auth.js';
import { handle } from '@/lib/api.js';

export const GET = handle(async () => {
  const { error, session } = await guard();
  if (error) return error;
  let scope = '1=1', p = [];
  if (session.role === 'Candidate') { scope = 'Candidate_ID = ?'; p = [session.cid]; }
  if (session.role === 'Recruiter') { scope = 'Company_ID = ?';   p = [session.coid]; }
  const [rows] = await pool.query(`SELECT * FROM vw_interview_schedule WHERE ${scope} ORDER BY Interview_Date`, p);
  return Response.json(rows);
});

export const POST = handle(async (req) => {
  const { error, session } = await guard('Recruiter', 'Admin');
  if (error) return error;
  const b = await req.json();
  if (session.role === 'Recruiter') {
    const [own] = await pool.query(
      'SELECT 1 FROM Application a JOIN Job j ON j.Job_ID=a.Job_ID WHERE a.Application_ID=? AND j.Company_ID=?',
      [b.applicationId, session.coid]);
    if (!own.length) return Response.json({ error: 'Application not found' }, { status: 404 });
  }
  await pool.query(
    'INSERT INTO Interview (Application_ID, Interviewer_Name, Interview_Date, Interview_Mode) VALUES (?,?,?,?)',
    [b.applicationId, b.interviewer, b.date, b.mode || 'Online']);
  return Response.json({ ok: true }, { status: 201 });
});

export const PATCH = handle(async (req) => {
  const { error } = await guard('Recruiter', 'Admin');
  if (error) return error;
  const { id, status, feedback } = await req.json();
  await pool.query('UPDATE Interview SET Interview_Status = ?, Feedback = ? WHERE Interview_ID = ?',
    [status, feedback || null, id]);
  return Response.json({ ok: true });
});
