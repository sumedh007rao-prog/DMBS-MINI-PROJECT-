import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const key = () => new TextEncoder().encode(process.env.JWT_SECRET);

export const signToken = (payload) =>
  new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('8h').sign(key());

export async function getSession() {
  const t = cookies().get('token')?.value;
  if (!t) return null;
  try { return (await jwtVerify(t, key())).payload; } catch { return null; }
}

/** Role-based access control: returns {session} or {error: Response}. */
export async function guard(...roles) {
  const session = await getSession();
  if (!session) return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (roles.length && !roles.includes(session.role))
    return { error: Response.json({ error: 'Forbidden for role ' + session.role }, { status: 403 }) };
  return { session };
}

export const cookieHeader = (token, maxAge = 28800) =>
  `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
