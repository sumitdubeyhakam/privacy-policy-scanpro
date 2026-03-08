import db from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const { rows } = await db.query(
      'select id, business_name, city, google_review_link from businesses where id=$1',
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Business not found' });
    res.json({ business: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
