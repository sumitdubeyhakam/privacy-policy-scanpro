import db from '../../../lib/db';

// Simple in-memory rate limiter per IP to reduce spam
const rateMap = new Map();
const RATE_WINDOW_MS = 3000;
const CLEANUP_INTERVAL_MS = 60000;

// Periodically remove stale entries to prevent unbounded memory growth
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [key, ts] of rateMap) {
    if (ts < cutoff) rateMap.delete(key);
  }
}, CLEANUP_INTERVAL_MS);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const last = rateMap.get(ip) || 0;
  if (Date.now() - last < RATE_WINDOW_MS) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  rateMap.set(ip, Date.now());

  const {
    business_id,
    customer_name,
    phone_number,
    service,
    staff,
    experience_rating,
    staff_behavior_rating,
    feedback_text
  } = req.body;

  if (!business_id || !customer_name || !phone_number || typeof experience_rating !== 'number') {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create customer record
    const cRes = await db.query(
      'insert into customers (business_id, customer_name, phone_number, created_at) values ($1,$2,$3,now()) returning id',
      [business_id, customer_name, phone_number]
    );
    const customer_id = cRes.rows[0].id;

    const review_type = experience_rating >= 4 ? 'positive' : 'negative';
    let ai_review_text = null;

    if (review_type === 'positive') {
      const biz = (
        await db.query('select business_name,city from businesses where id=$1', [business_id])
      ).rows[0];
      const bizName = biz?.business_name || 'the business';
      const city = biz?.city || '';
      ai_review_text = `I had a great experience at ${bizName}${city ? ` in ${city}` : ''}. The ${service || 'service'} was excellent${staff ? ` and ${staff} provided outstanding support` : ''}. Highly recommended!`;
    }

    const r = await db.query(
      `insert into reviews (business_id, customer_id, service, staff, experience_rating, staff_behavior_rating, ai_review_text, review_type, review_clicked, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,false,now()) returning id`,
      [business_id, customer_id, service, staff, experience_rating, staff_behavior_rating, ai_review_text, review_type]
    );
    const reviewId = r.rows[0].id;

    if (review_type === 'negative') {
      if (feedback_text) {
        await db.query(
          'insert into feedback (review_id, feedback_message, created_at) values ($1,$2,now())',
          [reviewId, feedback_text]
        );
      }
      return res.json({ review_type, review_id: reviewId });
    }

    res.json({ review_type, ai_review_text, review_id: reviewId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
