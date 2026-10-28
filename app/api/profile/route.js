import { pool } from '@/lib/db.js';
import { guard } from '@/lib/auth.js';
import { handle } from '@/lib/api.js';
import { upsertVector } from '@/lib/vector.js';

export const GET = handle(async () => {
  const { error, session } = await guard('Candidate');
  if (error) return error;
  const [[cand]] = await pool.query('SELECT * FROM Candidate WHERE Candidate_ID = ?', [session.cid]);
  const [skills] = await pool.query(
    `SELECT s.Skill_Name, cs.Proficiency_Level FROM Candidate_Skill cs
     JOIN Skill s ON s.Skill_ID = cs.Skill_ID WHERE cs.Candidate_ID = ?`, [session.cid]);
  const [resumes] = await pool.query(
    'SELECT Resume_ID, Resume_File_Name, Upload_Date FROM Resume WHERE Candidate_ID = ? ORDER BY Upload_Date DESC', [session.cid]);
  return Response.json({ candidate: cand, skills, resumes });
});

export const POST = handle(async (req) => {
  const { error, session } = await guard('Candidate');
  if (error) return error;
  const b = await req.json();
  if (b.action === 'resume') {
    if (!b.fileName || !b.text) return Response.json({ error: 'file name and resume text required' }, { status: 400 });
    const [r] = await pool.query(
      'INSERT INTO Resume (Candidate_ID, Resume_File_Name, Resume_Text, Upload_Date) VALUES (?,?,?,CURDATE())',
      [session.cid, b.fileName, b.text]);
    upsertVector('resumes', r.insertId, b.text, { candidate_id: session.cid, name: session.name })
      .catch((e) => console.error('vector index failed', e.message));
    return Response.json({ Resume_ID: r.insertId }, { status: 201 });
  }
  if (b.action === 'skill') {
    const [s] = await pool.query(
      'INSERT INTO Skill (Skill_Name) VALUES (?) ON DUPLICATE KEY UPDATE Skill_ID = LAST_INSERT_ID(Skill_ID)', [b.name]);
    await pool.query(
      `INSERT INTO Candidate_Skill (Candidate_ID, Skill_ID, Proficiency_Level) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE Proficiency_Level = VALUES(Proficiency_Level)`, [session.cid, s.insertId, b.level]);
    return Response.json({ ok: true }, { status: 201 });
  }
  if (b.action === 'update') {
    await pool.query(
      'UPDATE Candidate SET Phone=?, Experience_Years=?, Qualification=?, Date_of_Birth=? WHERE Candidate_ID=?',
      [b.phone || null, b.experience ?? 0, b.qualification || null, b.dob || null, session.cid]);
    return Response.json({ ok: true });
  }
  return Response.json({ error: 'Unknown action' }, { status: 400 });
});
