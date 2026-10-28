// Creates demo login accounts with bcrypt-hashed passwords.  Run: npm run seed:users
import bcrypt from 'bcryptjs';
import { pool } from '../lib/db.js';

const hash = (p) => bcrypt.hashSync(p, 10);
const q = (sql, p) => pool.query(sql, p);

await q(`INSERT INTO Users (Username,Password_Hash,Role) VALUES ('admin',?, 'Admin')
         ON DUPLICATE KEY UPDATE Password_Hash=VALUES(Password_Hash)`, [hash('Admin@123')]);

const [companies] = await q('SELECT Company_ID, Company_Name FROM Company');
for (const c of companies) {
  const uname = 'recruiter_' + c.Company_Name.split(' ')[0].toLowerCase();
  await q(`INSERT INTO Users (Username,Password_Hash,Role,Company_ID) VALUES (?,?, 'Recruiter', ?)
           ON DUPLICATE KEY UPDATE Password_Hash=VALUES(Password_Hash)`, [uname, hash('Recruit@123'), c.Company_ID]);
  console.log('recruiter ->', uname, '/ Recruit@123');
}

const [cands] = await q('SELECT Candidate_ID, Candidate_Name FROM Candidate');
for (const c of cands) {
  const uname = c.Candidate_Name.split(' ')[0].toLowerCase();
  await q(`INSERT INTO Users (Username,Password_Hash,Role,Candidate_ID) VALUES (?,?, 'Candidate', ?)
           ON DUPLICATE KEY UPDATE Password_Hash=VALUES(Password_Hash)`, [uname, hash('Cand@123'), c.Candidate_ID]);
  console.log('candidate ->', uname, '/ Cand@123');
}
console.log('admin -> admin / Admin@123');
await pool.end();
