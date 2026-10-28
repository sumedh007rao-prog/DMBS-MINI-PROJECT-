import { pool } from '@/lib/db.js';
import { guard } from '@/lib/auth.js';
import { handle } from '@/lib/api.js';

export const POST = handle(async (req) => {
  const { error, session } = await guard('Recruiter', 'Admin');
  if (error) return error;
  const { applicationId } = await req.json();
  if (session.role === 'Recruiter') {
    const [own] = await pool.query(
      'SELECT 1 FROM Application a JOIN Job j ON j.Job_ID=a.Job_ID WHERE a.Application_ID=? AND j.Company_ID=?',
      [applicationId, session.coid]);
    if (!own.length) return Response.json({ error: 'Application not found' }, { status: 404 });
  }
  const [res] = await pool.query('CALL sp_hire_candidate(?)', [applicationId]);
  return Response.json(res[0][0]);
});
