import db from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { review_id } = req.body;
  if (!review_id) return res.status(400).json({ error: 'Missing review_id' });
  try {
    await db.query('update reviews set review_clicked=true where id=$1', [review_id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
