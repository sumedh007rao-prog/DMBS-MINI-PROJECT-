'use client';
import { useState } from 'react';
import { api } from '@/lib/client';
import Msg from '@/components/Msg';

export default function Login() {
  const [f, setF] = useState({ username: '', password: '' }); const [m, setM] = useState(null);
  async function submit(e) {
    e.preventDefault();
    try { const { role } = await api('/api/auth/login', { method: 'POST', body: f });
      window.location.href = role === 'Candidate' ? '/jobs' : '/dashboard';
    } catch (err) { setM({ text: err.message }); }
  }
  return (
    <form className="card auth" onSubmit={submit}>
      <h1>Sign in</h1><Msg m={m} />
      <input placeholder="Username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
      <input type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <button style={{ width: '100%' }}>Login</button>
      <p className="mute">New candidate? <a href="/register">Create an account</a></p>
    </form>
  );
}
