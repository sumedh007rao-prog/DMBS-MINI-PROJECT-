import { pool } from '@/lib/db.js';
import { guard } from '@/lib/auth.js';
import { handle } from '@/lib/api.js';
import { searchVector } from '@/lib/vector.js';

/* Hybrid retrieval: Qdrant returns the nearest vectors (cosine), MySQL enriches/filters the rows.
   mode=jobs        -> candidate gets recommended jobs (query text, or their latest resume)
   mode=candidates  -> recruiter finds resumes similar to a job description (jobId) or free text */
export const GET = handle(async (req) => {
  const { error, session } = await guard();
  if (error) return error;
  const sp = new URL(req.url).searchParams;
  const mode = sp.get('mode'); let text = sp.get('q');

  if (mode === 'jobs') {
    if (!text && session.role === 'Candidate') {
      const [r] = await pool.query(
        'SELECT Resume_Text FROM Resume WHERE Candidate_ID=? AND Resume_Text IS NOT NULL ORDER BY Upload_Date DESC LIMIT 1', [session.cid]);
      text = r[0]?.Resume_Text;
    }
    if (!text) return Response.json({ error: 'Enter a query or upload a resume first' }, { status: 400 });
    const hits = await searchVector('jobs', text, 10);
    if (!hits.length) return Response.json([]);
    const [rows] = await pool.query(
      `SELECT j.Job_ID, j.Job_Title, j.Location, j.Salary, c.Company_Name,
              ${session.role === 'Candidate' ? 'fn_match_percentage(?, j.Job_ID)' : 'NULL'} AS skill_match
       FROM Job j JOIN Company c ON c.Company_ID=j.Company_ID
       WHERE j.Job_ID IN (?) AND j.Status='Open'`,
      session.role === 'Candidate' ? [session.cid, hits.map((h) => h.id)] : [hits.map((h) => h.id)]);
    const score = Object.fromEntries(hits.map((h) => [h.id, h.score]));
    return Response.json(rows.map((r) => ({ ...r, similarity: +score[r.Job_ID].toFixed(3) }))
      .sort((a, b) => b.similarity - a.similarity));
  }

  if (mode === 'candidates') {
    if (session.role === 'Candidate') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const jobId = sp.get('jobId');
    if (!text && jobId) {
      const [j] = await pool.query('SELECT Job_Title, Job_Description FROM Job WHERE Job_ID=?', [jobId]);
      text = j[0] && `${j[0].Job_Title}. ${j[0].Job_Description || ''}`;
    }
    if (!text) return Response.json({ error: 'Enter a query or choose a job' }, { status: 400 });
    const hits = await searchVector('resumes', text, 15);
    if (!hits.length) return Response.json([]);
    const best = {};
    for (const h of hits) { const c = h.payload.candidate_id; if (!best[c] || h.score > best[c]) best[c] = h.score; }
    const ids = Object.keys(best).map(Number);
    const [rows] = await pool.query(
      `SELECT Candidate_ID, Candidate_Name, Experience_Years, Skills,
              ${jobId ? 'fn_match_percentage(Candidate_ID, ?)' : 'NULL'} AS skill_match
       FROM vw_candidate_profile WHERE Candidate_ID IN (?)`, jobId ? [jobId, ids] : [ids]);
    return Response.json(rows.map((r) => ({ ...r, similarity: +best[r.Candidate_ID].toFixed(3) }))
      .sort((a, b) => b.similarity - a.similarity));
  }
  return Response.json({ error: 'mode must be jobs or candidates' }, { status: 400 });
});
