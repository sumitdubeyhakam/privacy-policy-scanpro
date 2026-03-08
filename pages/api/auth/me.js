import { verifyToken } from '../../../lib/auth';
import db from '../../../lib/db';

export default async function handler(req, res) {
  const auth = req.headers.authorization?.split(' ')[1];
  const payload = verifyToken(auth);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { rows } = await db.query(
      'select id,business_name,email,city,google_review_link from businesses where id=$1',
      [payload.id]
    );
    res.json({ business: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
