import { getDb } from './db.js';

export default async function handler(req, res) {
  const sql = getDb();
  if (!sql) {
    return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  }

  // GET: Fetch reviews
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, name, email, rating, product, liked, 
               buy_again as "buyAgain", review_text as text, 
               verified, hidden, created_at as date 
        FROM reviews 
        ORDER BY created_at DESC;
      `;
      return res.status(200).json({ success: true, reviews: rows });
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Add new customer review
  if (req.method === 'POST') {
    try {
      const { id, name, email, rating, product, liked, buyAgain, text } = req.body;
      const reviewId = id || 'rev-' + Date.now();

      await sql`
        INSERT INTO reviews (
          id, name, email, rating, product, liked, buy_again, review_text, verified, hidden, created_at
        ) VALUES (
          ${reviewId}, ${name || 'Customer'}, ${email || ''}, 
          ${Number(rating) || 5}, ${product || 'Coffee'}, 
          ${liked || ''}, ${buyAgain || 'Yes'}, ${text || ''}, 
          true, false, NOW()
        )
        ON CONFLICT (id) DO NOTHING;
      `;

      return res.status(200).json({ success: true, message: 'Review saved in Neon database.' });
    } catch (err) {
      console.error('Error saving review:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // PATCH: Toggle hide / unhide or delete
  if (req.method === 'PATCH') {
    try {
      const { id, action, hidden } = req.body;
      if (!id) return res.status(400).json({ error: 'Review ID required' });

      if (action === 'delete') {
        await sql`DELETE FROM reviews WHERE id = ${id};`;
        return res.status(200).json({ success: true, message: 'Review deleted' });
      }

      await sql`
        UPDATE reviews 
        SET hidden = ${Boolean(hidden)} 
        WHERE id = ${id};
      `;
      return res.status(200).json({ success: true, message: 'Review visibility updated' });
    } catch (err) {
      console.error('Error updating review:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

