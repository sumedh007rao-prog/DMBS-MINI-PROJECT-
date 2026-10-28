'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import Msg from '@/components/Msg';

const STATUSES = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Rejected'];

export default function Applications() {
  const [me, setMe] = useState(null); const [rows, setRows] = useState([]); const [m, setM] = useState(null);
  const [iv, setIv] = useState({ open: null, interviewer: '', date: '', mode: 'Online' });
  const load = () => api('/api/applications').then(setRows).catch((e) => setM({ text: e.message }));
  useEffect(() => { api('/api/auth/me').then(setMe); load(); }, []);
  const staff = me && me.role !== 'Candidate';
  const run = async (fn, okText) => { try { await fn(); setM({ ok: true, text: okText }); } catch (e) { setM({ text: e.message }); } load(); };

  return (<>
    <h1>{staff ? 'Applications' : 'My applications'}</h1><Msg m={m} />
    <div className="card"><table>
      <thead><tr><th>#</th>{staff && <th>Candidate</th>}<th>Job</th><th>Company</th><th>Applied</th>{staff && <th>Skill match</th>}<th>Status</th>{staff && <th>Actions</th>}</tr></thead>
      <tbody>{rows.map((a) => (<>
        <tr key={a.Application_ID}>
          <td>{a.Application_ID}</td>{staff && <td>{a.Candidate_Name} <span className="mute">({a.Experience_Years}y)</span></td>}
          <td>{a.Job_Title}</td><td>{a.Company_Name}</td><td>{a.Application_Date}</td>
          {staff && <td>{a.match_pct}%</td>}
          <td><span className={'badge ' + a.Application_Status.replace(' ', '-')}>{a.Application_Status}</span></td>
          {staff && <td>
            <select value={a.Application_Status} disabled={a.Application_Status === 'Hired'}
              onChange={(e) => run(() => api('/api/applications', { method: 'PATCH', body: { id: a.Application_ID, status: e.target.value } }), 'Status updated')}>
              {[...STATUSES, 'Hired'].map((s) => <option key={s} disabled={s === 'Hired'}>{s}</option>)}</select>{' '}
            <button className="sec" onClick={() => setIv({ ...iv, open: iv.open === a.Application_ID ? null : a.Application_ID })}>Interview</button>{' '}
            <button className="ok" onClick={() => confirm('Hire this candidate? All other applicants are rejected and the job closes.') &&
              run(() => api('/api/applications/hire', { method: 'POST', body: { applicationId: a.Application_ID } }), 'Candidate hired (transaction committed)')}>Hire</button>
          </td>}
        </tr>
        {staff && iv.open === a.Application_ID && <tr key={'i' + a.Application_ID}><td colSpan={8}>
          <div className="row">
            <input placeholder="Interviewer" onChange={(e) => setIv({ ...iv, interviewer: e.target.value })} />
            <input type="datetime-local" onChange={(e) => setIv({ ...iv, date: e.target.value })} />
            <select onChange={(e) => setIv({ ...iv, mode: e.target.value })}>{['Online', 'Onsite', 'Phone'].map((x) => <option key={x}>{x}</option>)}</select>
            <button onClick={() => run(() => api('/api/interviews', { method: 'POST', body: { applicationId: a.Application_ID, interviewer: iv.interviewer, date: iv.date.replace('T', ' '), mode: iv.mode } }), 'Interview scheduled')}>Schedule</button>
          </div></td></tr>}
      </>))}</tbody></table></div>
  </>);
}
