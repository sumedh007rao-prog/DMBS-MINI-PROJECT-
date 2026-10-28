import { pool } from '@/lib/db.js';
import { guard } from '@/lib/auth.js';
import { handle } from '@/lib/api.js';

export const GET = handle(async () => {
  const { error, session } = await guard('Recruiter', 'Admin');
  if (error) return error;
  const co = session.role === 'Recruiter' ? session.coid : null;   // NULL = all companies (Admin)
  const [byStatus] = await pool.query(
    `SELECT a.Application_Status AS status, COUNT(*) AS total
     FROM Application a JOIN Job j ON j.Job_ID=a.Job_ID
     WHERE (? IS NULL OR j.Company_ID=?) GROUP BY a.Application_Status ORDER BY total DESC`, [co, co]);
  const [topJobs] = await pool.query(
    `SELECT Job_Title, Company_Name, Total_Applications, Hired_Count FROM vw_job_summary
     WHERE (? IS NULL OR Company_ID=?) AND Total_Applications > 0
     ORDER BY Total_Applications DESC LIMIT 5`, [co, co]);
  const [salary] = await pool.query(
    `SELECT c.Industry, COUNT(*) AS openings, ROUND(AVG(j.Salary)) AS avg_salary
     FROM Job j JOIN Company c ON c.Company_ID=j.Company_ID
     WHERE (? IS NULL OR j.Company_ID=?) GROUP BY c.Industry HAVING COUNT(*) >= 1 ORDER BY avg_salary DESC`, [co, co]);
  const [skills] = await pool.query(
    `SELECT s.Skill_Name, COUNT(*) AS candidates FROM Candidate_Skill cs
     JOIN Skill s ON s.Skill_ID=cs.Skill_ID GROUP BY s.Skill_ID, s.Skill_Name ORDER BY candidates DESC LIMIT 5`);
  const [[totals]] = await pool.query(
    `SELECT (SELECT COUNT(*) FROM Job WHERE Status='Open' AND (? IS NULL OR Company_ID=?)) AS open_jobs,
            (SELECT COUNT(*) FROM Candidate) AS candidates,
            (SELECT COUNT(*) FROM Interview WHERE Interview_Status='Scheduled') AS upcoming_interviews`, [co, co]);
  const [aboveAvg] = await pool.query(
    `SELECT Candidate_Name, Experience_Years FROM Candidate
     WHERE Experience_Years > (SELECT AVG(Experience_Years) FROM Candidate) ORDER BY Experience_Years DESC LIMIT 5`);
  return Response.json({ totals, byStatus, topJobs, salary, skills, aboveAvg });
});
