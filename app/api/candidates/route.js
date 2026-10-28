import { pool } from '@/lib/db.js';
import { guard } from '@/lib/auth.js';
import { handle } from '@/lib/api.js';

export const GET = handle(async (req) => {
  const { error } = await guard('Recruiter', 'Admin');
  if (error) return error;
  const sp = new URL(req.url).searchParams;
  const where = [], p = [];
  if (sp.get('skill')) { where.push('Skills LIKE ?'); p.push(`%${sp.get('skill')}%`); }
  if (sp.get('minExp')) { where.push('Experience_Years >= ?'); p.push(Number(sp.get('minExp'))); }
  const [rows] = await pool.query(
    `SELECT * FROM vw_candidate_profile ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY Experience_Years DESC`, p);
  return Response.json(rows);
});
