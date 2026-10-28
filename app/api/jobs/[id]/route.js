import { pool } from '@/lib/db.js';
import { guard } from '@/lib/auth.js';
import { handle } from '@/lib/api.js';

export const PATCH = handle(async (req, { params }) => {
  const { error, session } = await guard('Recruiter', 'Admin');
  if (error) return error;
  const { status } = await req.json();
  const [r] = await pool.query(
    'UPDATE Job SET Status = ? WHERE Job_ID = ? AND (? IS NULL OR Company_ID = ?)',
    [status, params.id, session.coid ?? null, session.coid ?? null]);
  return r.affectedRows ? Response.json({ ok: true }) : Response.json({ error: 'Job not found' }, { status: 404 });
});

// Admin only. Fails (FK RESTRICT) if applications exist -> integrity preserved.
export const DELETE = handle(async (_req, { params }) => {
  const { error } = await guard('Admin');
  if (error) return error;
  await pool.query('DELETE FROM Job WHERE Job_ID = ?', [params.id]);
  return Response.json({ ok: true });
});
