// Embeds every resume and job into Qdrant.  Run once after seeding: npm run index:vectors
import { pool } from '../lib/db.js';
import { upsertVector } from '../lib/vector.js';

const [resumes] = await pool.query(
  `SELECT r.Resume_ID, r.Candidate_ID, r.Resume_Text, c.Candidate_Name
   FROM Resume r JOIN Candidate c ON c.Candidate_ID = r.Candidate_ID WHERE r.Resume_Text IS NOT NULL`);
for (const r of resumes) {
  await upsertVector('resumes', r.Resume_ID, r.Resume_Text, { candidate_id: r.Candidate_ID, name: r.Candidate_Name });
  console.log('resume', r.Resume_ID);
}
const [jobs] = await pool.query('SELECT Job_ID, Job_Title, Job_Description, Company_ID FROM Job');
for (const j of jobs) {
  await upsertVector('jobs', j.Job_ID, `${j.Job_Title}. ${j.Job_Description || ''}`, { title: j.Job_Title, company_id: j.Company_ID });
  console.log('job', j.Job_ID);
}
await pool.end();
