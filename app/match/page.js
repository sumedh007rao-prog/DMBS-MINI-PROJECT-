'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import Msg from '@/components/Msg';

export default function Match() {
  const [me, setMe] = useState(null); const [q, setQ] = useState(''); const [jobId, setJobId] = useState('');
  const [jobs, setJobs] = useState([]); const [rows, setRows] = useState([]); const [m, setM] = useState(null); const [busy, setBusy] = useState(false);
  useEffect(() => { api('/api/auth/me').then(setMe); api('/api/jobs').then(setJobs).catch(() => {}); }, []);
  const staff = me && me.role !== 'Candidate';
  async function go() {
    setBusy(true); setM(null);
    try { setRows(await api(`/api/search/semantic?mode=${staff ? 'candidates' : 'jobs'}&q=${encodeURIComponent(q)}&jobId=${jobId}`)); }
    catch (e) { setM({ text: e.message }); } setBusy(false);
  }
  return (<>
    <h1>{staff ? 'Find candidates (semantic search)' : 'Jobs recommended from your resume'}</h1><Msg m={m} />
    <div className="card">
      <p className="mute">Text is converted to 384-d embeddings (MiniLM-L6-v2) and compared by cosine similarity in Qdrant; results are enriched from MySQL.
        {!staff && ' Leave the box empty to use your latest resume.'}</p>
      <div className="row">
        <input style={{ flex: 1, minWidth: 260 }} placeholder={staff ? 'e.g. engineer who builds NLP recommendation systems' : 'e.g. data pipelines with Python'} value={q} onChange={(e) => setQ(e.target.value)} />
        {staff && <select value={jobId} onChange={(e) => setJobId(e.target.value)}><option value="">— or match to a job —</option>
          {jobs.map((j) => <option key={j.Job_ID} value={j.Job_ID}>{j.Job_Title} ({j.Company_Name})</option>)}</select>}
        <button onClick={go} disabled={busy}>{busy ? 'Searching…' : 'Search'}</button>
      </div>
      <table><thead><tr><th>{staff ? 'Candidate' : 'Job'}</th><th>{staff ? 'Skills' : 'Company'}</th><th>Similarity</th><th>Skill match</th></tr></thead>
        <tbody>{rows.map((r) => (<tr key={r.Candidate_ID || r.Job_ID}>
          <td><b>{r.Candidate_Name || r.Job_Title}</b>{staff && <div className="mute">{r.Experience_Years} yrs</div>}</td>
          <td>{r.Skills || `${r.Company_Name} · ${r.Location}`}</td><td>{(r.similarity * 100).toFixed(1)}%</td><td>{r.skill_match != null ? r.skill_match + '%' : '—'}</td>
        </tr>))}</tbody></table>
    </div>
  </>);
}
