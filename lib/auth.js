import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './db';

export const hashPassword = (pw) => bcrypt.hash(pw, 10);
export const comparePassword = (pw, hash) => bcrypt.compare(pw, hash);

export function signToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  if (!process.env.JWT_SECRET) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getBusinessById(id) {
  const res = await db.query(
    'select id,business_name,email,city,google_review_link from businesses where id=$1',
    [id]
  );
  return res.rows[0];
}
