import { verifyToken } from '../../../lib/auth';
import db from '../../../lib/db';

export default async function handler(req, res) {
  const auth = req.headers.authorization?.split(' ')[1];
  const payload = verifyToken(auth);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const bId = payload.id;
    const [total, positive, negative, avgRes, recent, feedbacks] = await Promise.all([
      db.query('select count(*) from reviews where business_id=$1', [bId]),
      db.query("select count(*) from reviews where business_id=$1 and review_type='positive'", [bId]),
      db.query(
        'select count(*) from feedback f join reviews r on f.review_id=r.id where r.business_id=$1',
        [bId]
      ),
      db.query('select coalesce(avg(experience_rating),0) as avg from reviews where business_id=$1', [bId]),
      db.query(
        'select r.id, c.customer_name, r.service, r.staff, r.experience_rating, r.review_type, r.review_clicked, r.created_at from reviews r left join customers c on c.id=r.customer_id where r.business_id=$1 order by r.created_at desc limit 20',
        [bId]
      ),
      db.query(
        'select f.feedback_message, c.customer_name, f.created_at from feedback f join reviews r on f.review_id=r.id join customers c on r.customer_id=c.id where r.business_id=$1 order by f.created_at desc limit 20',
        [bId]
      )
    ]);

    res.json({
      total: total.rows[0].count,
      positive: positive.rows[0].count,
      negative: negative.rows[0].count,
      avg: parseFloat(avgRes.rows[0].avg).toFixed(1),
      recent: recent.rows,
      feedbacks: feedbacks.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
