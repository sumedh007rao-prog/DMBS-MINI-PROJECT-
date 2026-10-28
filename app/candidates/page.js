'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import Msg from '@/components/Msg';

export default function Candidates() {
  const [rows, setRows] = useState([]); const [skill, setSkill] = useState(''); const [minExp, setMinExp] = useState(''); const [m, setM] = useState(null);
  const load = () => api('/api/candidates?' + new URLSearchParams(Object.entries({ skill, minExp }).filter(([, v]) => v))).then(setRows).catch((e) => setM({ text: e.message }));
  useEffect(() => { load(); }, []);
  return (<>
    <h1>Candidates</h1><Msg m={m} />
    <div className="card">
      <div className="row">
        <input placeholder="Skill (e.g. Docker)" value={skill} onChange={(e) => setSkill(e.target.value)} />
        <input type="number" placeholder="Min experience (yrs)" value={minExp} onChange={(e) => setMinExp(e.target.value)} />
        <button onClick={load}>Filter</button>
      </div>
      <table><thead><tr><th>Name</th><th>Email</th><th>Exp</th><th>Qualification</th><th>Skills</th><th>Applications</th></tr></thead>
        <tbody>{rows.map((c) => (<tr key={c.Candidate_ID}><td>{c.Candidate_Name}</td><td>{c.Email}</td><td>{c.Experience_Years}</td>
          <td>{c.Qualification}</td><td>{c.Skills}</td><td>{c.Applications}</td></tr>))}</tbody></table>
    </div>
  </>);
}
