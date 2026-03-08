import db from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { review_id, feedback_message } = req.body;
  if (!review_id || !feedback_message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await db.query(
      'insert into feedback (review_id, feedback_message, created_at) values ($1,$2,now())',
      [review_id, feedback_message]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
