'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import Msg from '@/components/Msg';

export default function Interviews() {
  const [me, setMe] = useState(null); const [rows, setRows] = useState([]); const [m, setM] = useState(null);
  const load = () => api('/api/interviews').then(setRows).catch((e) => setM({ text: e.message }));
  useEffect(() => { api('/api/auth/me').then(setMe); load(); }, []);
  const staff = me && me.role !== 'Candidate';
  async function update(id, status) {
    const feedback = status === 'Completed' ? prompt('Feedback (optional)') : null;
    try { await api('/api/interviews', { method: 'PATCH', body: { id, status, feedback } }); load(); } catch (e) { setM({ text: e.message }); }
  }
  return (<>
    <h1>Interview schedule</h1><Msg m={m} />
    <div className="card"><table>
      <thead><tr><th>When</th><th>Candidate</th><th>Job</th><th>Company</th><th>Interviewer</th><th>Mode</th><th>Status</th><th>Feedback</th>{staff && <th></th>}</tr></thead>
      <tbody>{rows.map((i) => (<tr key={i.Interview_ID}>
        <td>{i.Interview_Date}</td><td>{i.Candidate_Name}</td><td>{i.Job_Title}</td><td>{i.Company_Name}</td>
        <td>{i.Interviewer_Name}</td><td>{i.Interview_Mode}</td><td><span className="badge">{i.Interview_Status}</span></td><td>{i.Feedback}</td>
        {staff && <td>{i.Interview_Status === 'Scheduled' && <>
          <button className="ok" onClick={() => update(i.Interview_ID, 'Completed')}>Complete</button>{' '}
          <button className="bad" onClick={() => update(i.Interview_ID, 'Cancelled')}>Cancel</button></>}</td>}
      </tr>))}</tbody></table></div>
  </>);
}
