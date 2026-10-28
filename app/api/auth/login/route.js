import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db.js';
import { signToken, cookieHeader } from '@/lib/auth.js';
import { handle } from '@/lib/api.js';

export const POST = handle(async (req) => {
  const { username, password } = await req.json();
  const [rows] = await pool.query('SELECT * FROM Users WHERE Username = ?', [username]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password || '', u.Password_Hash)))
    return Response.json({ error: 'Invalid username or password' }, { status: 401 });
  const token = await signToken({ uid: u.User_ID, name: u.Username, role: u.Role, cid: u.Candidate_ID, coid: u.Company_ID });
  const res = Response.json({ role: u.Role });
  res.headers.append('Set-Cookie', cookieHeader(token));
  return res;
});
