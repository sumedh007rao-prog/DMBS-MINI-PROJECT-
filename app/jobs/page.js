'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import Msg from '@/components/Msg';

export default function Jobs() {
  const [me, setMe] = useState(null); const [jobs, setJobs] = useState([]); const [m, setM] = useState(null);
  const [flt, setFlt] = useState({ q: '', location: '', type: '', minSalary: '' });
  const [nj, setNj] = useState({ title: '', description: '', location: '', salary: '', type: 'Full-time', skills: '' });

  const load = () => api('/api/jobs?' + new URLSearchParams(Object.entries(flt).filter(([, v]) => v))).then(setJobs).catch((e) => setM({ text: e.message }));
  useEffect(() => { api('/api/auth/me').then(setMe); load(); }, []);
  const staff = me && me.role !== 'Candidate';

  async function apply(id) {
    try { await api('/api/applications', { method: 'POST', body: { jobId: id } }); setM({ ok: true, text: 'Application submitted' }); load(); }
    catch (e) { setM({ text: e.message }); }
  }
  async function setStatus(id, status) { try { await api('/api/jobs/' + id, { method: 'PATCH', body: { status } }); load(); } catch (e) { setM({ text: e.message }); } }
  async function post(e) {
    e.preventDefault();
    try { await api('/api/jobs', { method: 'POST', body: nj }); setM({ ok: true, text: 'Job posted & indexed' }); load(); }
    catch (err) { setM({ text: err.message }); }
  }

  return (<>
    <h1>Jobs</h1><Msg m={m} />
    <div className="card">
      <div className="row">
        <input placeholder="Keyword search (full-text)" value={flt.q} onChange={(e) => setFlt({ ...flt, q: e.target.value })} />
        <input placeholder="Location" value={flt.location} onChange={(e) => setFlt({ ...flt, location: e.target.value })} />
        <select value={flt.type} onChange={(e) => setFlt({ ...flt, type: e.target.value })}>
          <option value="">Any type</option>{['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => <option key={t}>{t}</option>)}</select>
        <input type="number" placeholder="Min salary" value={flt.minSalary} onChange={(e) => setFlt({ ...flt, minSalary: e.target.value })} />
        <button onClick={load}>Search</button>
      </div>
      <table><thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Salary</th><th>Type</th>
        {me?.role === 'Candidate' && <th>Skill match</th>}<th>Applicants</th><th>Status</th><th></th></tr></thead>
        <tbody>{jobs.map((j) => (
          <tr key={j.Job_ID}>
            <td><b>{j.Job_Title}</b><div className="mute">{j.Job_Description?.slice(0, 90)}</div></td>
            <td>{j.Company_Name}</td><td>{j.Location}</td><td>{j.Salary && Number(j.Salary).toLocaleString('en-IN')}</td><td>{j.Job_Type}</td>
            {me?.role === 'Candidate' && <td>{j.match_pct}%</td>}
            <td>{j.applicants}</td><td><span className={'badge ' + j.Status}>{j.Status}</span></td>
            <td>{me?.role === 'Candidate' && <button onClick={() => apply(j.Job_ID)}>Apply</button>}
              {staff && (j.Status === 'Open'
                ? <button className="sec" onClick={() => setStatus(j.Job_ID, 'Closed')}>Close</button>
                : <button className="sec" onClick={() => setStatus(j.Job_ID, 'Open')}>Reopen</button>)}</td>
          </tr>))}</tbody></table>
    </div>
    {staff && me.role === 'Recruiter' && (
      <form className="card" onSubmit={post}><h2>Post a job</h2>
        <div className="row">
          <input placeholder="Title" onChange={(e) => setNj({ ...nj, title: e.target.value })} />
          <input placeholder="Location" onChange={(e) => setNj({ ...nj, location: e.target.value })} />
          <input type="number" min="0" placeholder="Salary" onChange={(e) => setNj({ ...nj, salary: e.target.value })} />
          <select onChange={(e) => setNj({ ...nj, type: e.target.value })}>{['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => <option key={t}>{t}</option>)}</select>
        </div>
        <input style={{ width: '100%', marginBottom: 8 }} placeholder="Required skills, comma separated (e.g. Python, SQL)" onChange={(e) => setNj({ ...nj, skills: e.target.value })} />
        <textarea placeholder="Description" onChange={(e) => setNj({ ...nj, description: e.target.value })} />
        <button>Post job</button>
      </form>)}
  </>);
}
