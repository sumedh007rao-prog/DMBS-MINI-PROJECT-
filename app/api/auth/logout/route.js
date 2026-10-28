import { cookieHeader } from '@/lib/auth.js';
export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.append('Set-Cookie', cookieHeader('', 0));
  return res;
}
