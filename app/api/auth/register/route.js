import bcrypt from 'bcryptjs';
import { pool } from '@/lib/db.js';
import { handle } from '@/lib/api.js';

// Candidate self-registration: Candidate + Users rows created in ONE transaction.
export const POST = handle(async (req) => {
  const { username, password, name, email, phone, experience, qualification } = await req.json();
  if (!username || !password || password.length < 8 || !name || !email)
    return Response.json({ error: 'name, email, username and a password of 8+ chars are required' }, { status: 400 });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [c] = await conn.query(
      'INSERT INTO Candidate (Candidate_Name, Email, Phone, Experience_Years, Qualification) VALUES (?,?,?,?,?)',
      [name, email, phone || null, experience || 0, qualification || null]);
    await conn.query('INSERT INTO Users (Username, Password_Hash, Role, Candidate_ID) VALUES (?,?,?,?)',
      [username, await bcrypt.hash(password, 10), 'Candidate', c.insertId]);
    await conn.commit();
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
});
