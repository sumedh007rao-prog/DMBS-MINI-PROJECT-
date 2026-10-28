'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import Msg from '@/components/Msg';

export default function Profile() {
  const [p, setP] = useState(null); const [m, setM] = useState(null);
  const [r, setR] = useState({ fileName: '', text: '' }); const [s, setS] = useState({ name: '', level: 'Intermediate' });
  const load = () => api('/api/profile').then(setP).catch((e) => setM({ text: e.message }));
  useEffect(() => { load(); }, []);
  const act = async (body, okText) => { try { await api('/api/profile', { method: 'POST', body }); setM({ ok: true, text: okText }); load(); } catch (e) { setM({ text: e.message }); } };
  if (!p) return <Msg m={m} />;
  const c = p.candidate;
  return (<>
    <h1>{c.Candidate_Name}</h1><Msg m={m} />
    <div className="grid">
      <div className="card"><h2>Details</h2>
        <div className="row"><input defaultValue={c.Phone || ''} placeholder="Phone" onChange={(e) => (c.Phone = e.target.value)} />
          <input type="number" step="0.5" min="0" defaultValue={c.Experience_Years} onChange={(e) => (c.Experience_Years = e.target.value)} /></div>
        <div className="row"><input defaultValue={c.Qualification || ''} placeholder="Qualification" onChange={(e) => (c.Qualification = e.target.value)} />
          <input type="date" defaultValue={c.Date_of_Birth || ''} onChange={(e) => (c.Date_of_Birth = e.target.value)} /></div>
        <button onClick={() => act({ action: 'update', phone: c.Phone, experience: c.Experience_Years, qualification: c.Qualification, dob: c.Date_of_Birth }, 'Profile saved')}>Save</button>
      </div>
      <div className="card"><h2>Skills</h2>
        <p>{p.skills.map((k) => <span key={k.Skill_Name} className="badge" style={{ marginRight: 6 }}>{k.Skill_Name} · {k.Proficiency_Level}</span>)}</p>
        <div className="row"><input placeholder="Skill" value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} />
          <select value={s.level} onChange={(e) => setS({ ...s, level: e.target.value })}>{['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((l) => <option key={l}>{l}</option>)}</select>
          <button onClick={() => act({ action: 'skill', ...s }, 'Skill saved')}>Add</button></div>
      </div>
    </div>
    <div className="card"><h2>Resumes</h2>
      <ul>{p.resumes.map((x) => <li key={x.Resume_ID}>{x.Resume_File_Name} <span className="mute">({x.Upload_Date})</span></li>)}</ul>
      <input placeholder="File name e.g. my_cv.pdf" value={r.fileName} onChange={(e) => setR({ ...r, fileName: e.target.value })} />
      <textarea placeholder="Paste your resume text — it is stored in MySQL and embedded into the vector database" value={r.text} onChange={(e) => setR({ ...r, text: e.target.value })} />
      <button onClick={() => act({ action: 'resume', ...r }, 'Resume saved and indexed')}>Upload resume</button>
    </div>
  </>);
}
