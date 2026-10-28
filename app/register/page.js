'use client';
import { useState } from 'react';
import { api } from '@/lib/client';
import Msg from '@/components/Msg';

export default function Register() {
  const [f, setF] = useState({ name: '', email: '', phone: '', experience: 0, qualification: '', username: '', password: '' });
  const [m, setM] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    try { await api('/api/auth/register', { method: 'POST', body: f }); setM({ ok: true, text: 'Account created. You can sign in now.' }); }
    catch (err) { setM({ text: err.message }); }
  }
  return (
    <form className="card auth" onSubmit={submit}>
      <h1>Candidate registration</h1><Msg m={m} />
      <input placeholder="Full name" onChange={set('name')} />
      <input placeholder="Email" onChange={set('email')} />
      <input placeholder="Phone (10+ digits)" onChange={set('phone')} />
      <input type="number" step="0.5" min="0" placeholder="Years of experience" onChange={set('experience')} />
      <input placeholder="Qualification" onChange={set('qualification')} />
      <input placeholder="Username" onChange={set('username')} />
      <input type="password" placeholder="Password (8+ chars)" onChange={set('password')} />
      <button style={{ width: '100%' }}>Register</button>
      <p className="mute"><a href="/login">Back to sign in</a></p>
    </form>
  );
}
