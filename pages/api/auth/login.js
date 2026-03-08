import db from '../../../lib/db';
import { comparePassword, signToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const { rows } = await db.query(
      'select id,email,password_hash from businesses where email=$1',
      [email.toLowerCase().trim()]
    );
    const b = rows[0];
    if (!b || !(await comparePassword(password, b.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken({ id: b.id, email: b.email });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
