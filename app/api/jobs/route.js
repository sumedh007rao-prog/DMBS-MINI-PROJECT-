import { pool } from '@/lib/db.js';
import { guard } from '@/lib/auth.js';
import { handle } from '@/lib/api.js';
import { upsertVector } from '@/lib/vector.js';

// GET: search + filter. Uses FULLTEXT index (MATCH...AGAINST) when ?q= is given.
export const GET = handle(async (req) => {
  const { error, session } = await guard();
  if (error) return error;
  const sp = new URL(req.url).searchParams;
  const q = sp.get('q'), loc = sp.get('location'), type = sp.get('type'), min = sp.get('minSalary');
  const where = [], params = [];
  const isCand = session.role === 'Candidate';
  if (isCand) where.push("j.Status = 'Open'");
  if (session.role === 'Recruiter') { where.push('j.Company_ID = ?'); params.push(session.coid); }
  if (q)    { where.push('MATCH(j.Job_Title, j.Job_Description) AGAINST (? IN NATURAL LANGUAGE MODE)'); params.push(q); }
  if (loc)  { where.push('j.Location LIKE ?'); params.push(`%${loc}%`); }
  if (type) { where.push('j.Job_Type = ?'); params.push(type); }
  if (min)  { where.push('j.Salary >= ?'); params.push(Number(min)); }
  const [rows] = await pool.query(
    `SELECT j.Job_ID, j.Job_Title, j.Job_Description, j.Location, j.Salary, j.Job_Type, j.Status,
            j.Posted_Date, c.Company_Name, d.Dept_Name,
            ${isCand ? 'fn_match_percentage(?, j.Job_ID)' : 'NULL'} AS match_pct,
            (SELECT COUNT(*) FROM Application a WHERE a.Job_ID = j.Job_ID) AS applicants
     FROM Job j JOIN Company c ON c.Company_ID = j.Company_ID
     LEFT JOIN Department d ON d.Dept_ID = j.Dept_ID
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY j.Posted_Date DESC, j.Job_ID DESC LIMIT 100`,
    isCand ? [session.cid, ...params] : params);
  return Response.json(rows);
});

// POST: recruiter/admin posts a job + required skills (transaction), then embeds it in the vector DB.
export const POST = handle(async (req) => {
  const { error, session } = await guard('Recruiter', 'Admin');
  if (error) return error;
  const b = await req.json();
  const companyId = session.role === 'Admin' ? b.companyId : session.coid;
  if (!b.title || !companyId) return Response.json({ error: 'title and company are required' }, { status: 400 });
  const conn = await pool.getConnection();
  let id;
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO Job (Company_ID, Job_Title, Job_Description, Location, Salary, Job_Type) VALUES (?,?,?,?,?,?)',
      [companyId, b.title, b.description || null, b.location || null, b.salary || null, b.type || null]);
    id = r.insertId;
    for (const name of (b.skills || '').split(',').map((s) => s.trim()).filter(Boolean)) {
      const [s] = await conn.query(
        'INSERT INTO Skill (Skill_Name) VALUES (?) ON DUPLICATE KEY UPDATE Skill_ID = LAST_INSERT_ID(Skill_ID)', [name]);
      await conn.query('INSERT IGNORE INTO Job_Skill (Job_ID, Skill_ID) VALUES (?,?)', [id, s.insertId]);
    }
    await conn.commit();
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
  upsertVector('jobs', id, `${b.title}. ${b.description || ''}`, { title: b.title, company_id: companyId })
    .catch((e) => console.error('vector index failed', e.message));
  return Response.json({ Job_ID: id }, { status: 201 });
});
