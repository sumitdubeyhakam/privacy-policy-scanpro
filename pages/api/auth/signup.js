import db from '../../../lib/db';
import { hashPassword, signToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { business_name, owner_name, email, phone, city, password, google_review_link } = req.body;
  if (!business_name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const pwHash = await hashPassword(password);
    const q = `insert into businesses (business_name, owner_name, email, phone, city, password_hash, google_review_link, created_at)
               values ($1,$2,$3,$4,$5,$6,$7,now()) returning id,business_name,email`;
    const values = [business_name, owner_name, email.toLowerCase().trim(), phone, city, pwHash, google_review_link];
    const { rows } = await db.query(q, values);
    const business = rows[0];
    const token = signToken({ id: business.id, email: business.email });
    res.status(201).json({ token, business });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
