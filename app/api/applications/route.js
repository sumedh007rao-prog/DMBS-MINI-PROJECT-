import { pool } from '@/lib/db.js';
import { guard } from '@/lib/auth.js';
import { handle } from '@/lib/api.js';

export const GET = handle(async () => {
  const { error, session } = await guard();
  if (error) return error;
  let scope = '1=1', p = [];
  if (session.role === 'Candidate') { scope = 'a.Candidate_ID = ?'; p = [session.cid]; }
  if (session.role === 'Recruiter') { scope = 'j.Company_ID = ?';   p = [session.coid]; }
  const [rows] = await pool.query(
    `SELECT a.Application_ID, a.Application_Date, a.Application_Status,
            ca.Candidate_ID, ca.Candidate_Name, ca.Experience_Years,
            j.Job_ID, j.Job_Title, c.Company_Name,
            fn_match_percentage(ca.Candidate_ID, j.Job_ID) AS match_pct
     FROM Application a
     JOIN Candidate ca ON ca.Candidate_ID = a.Candidate_ID
     JOIN Job j        ON j.Job_ID = a.Job_ID
     JOIN Company c    ON c.Company_ID = j.Company_ID
     WHERE ${scope} ORDER BY a.Application_Date DESC, a.Application_ID DESC`, p);
  return Response.json(rows);
});

// Candidate applies -> stored procedure (transaction) + triggers enforce business rules.
export const POST = handle(async (req) => {
  const { error, session } = await guard('Candidate');
  if (error) return error;
  const { jobId } = await req.json();
  const [res] = await pool.query('CALL sp_apply_for_job(?, ?)', [session.cid, jobId]);
  return Response.json(res[0][0], { status: 201 });
});

// Recruiter/Admin changes status (trigger writes the audit log)
export const PATCH = handle(async (req) => {
  const { error, session } = await guard('Recruiter', 'Admin');
  if (error) return error;
  const { id, status } = await req.json();
  const [r] = await pool.query(
    `UPDATE Application a JOIN Job j ON j.Job_ID = a.Job_ID
     SET a.Application_Status = ? WHERE a.Application_ID = ? AND (? IS NULL OR j.Company_ID = ?)`,
    [status, id, session.coid ?? null, session.coid ?? null]);
  return r.affectedRows ? Response.json({ ok: true }) : Response.json({ error: 'Application not found' }, { status: 404 });
});
