'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import Msg from '@/components/Msg';

const Table = ({ rows, cols }) => (
  <table><thead><tr>{cols.map((c) => <th key={c}>{c.replace('_', ' ')}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i}>{cols.map((c) => <td key={c}>{r[c]}</td>)}</tr>)}</tbody></table>
);

export default function Dashboard() {
  const [d, setD] = useState(null); const [m, setM] = useState(null);
  useEffect(() => { api('/api/dashboard').then(setD).catch((e) => setM({ text: e.message })); }, []);
  if (!d) return <Msg m={m} />;
  return (<>
    <h1>Recruitment dashboard</h1>
    <div className="grid">
      <div className="card"><div className="mute">Open jobs</div><div className="stat">{d.totals.open_jobs}</div></div>
      <div className="card"><div className="mute">Candidates</div><div className="stat">{d.totals.candidates}</div></div>
      <div className="card"><div className="mute">Upcoming interviews</div><div className="stat">{d.totals.upcoming_interviews}</div></div>
    </div>
    <div className="grid">
      <div className="card"><h2>Applications by status</h2><Table rows={d.byStatus} cols={['status', 'total']} /></div>
      <div className="card"><h2>Most-applied jobs (view)</h2><Table rows={d.topJobs} cols={['Job_Title', 'Total_Applications', 'Hired_Count']} /></div>
      <div className="card"><h2>Avg salary by industry</h2><Table rows={d.salary} cols={['Industry', 'openings', 'avg_salary']} /></div>
      <div className="card"><h2>Top candidate skills</h2><Table rows={d.skills} cols={['Skill_Name', 'candidates']} /></div>
      <div className="card"><h2>Experience above average (subquery)</h2><Table rows={d.aboveAvg} cols={['Candidate_Name', 'Experience_Years']} /></div>
    </div>
  </>);
}
