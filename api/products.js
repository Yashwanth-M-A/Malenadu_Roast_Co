import { getDb } from './db.js';

export default async function handler(req, res) {
  const sql = getDb();
  if (!sql) {
    return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  }

  // GET: Fetch all products from Neon Cloud Database
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, category, name, price, original_price as "originalPrice", 
               grams, stock, out_of_stock as "outOfStock", 
               image_url as image, description, badge 
        FROM products 
        ORDER BY category, id;
      `;
      return res.status(200).json({ success: true, products: rows });
    } catch (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Add new product or update existing product
  if (req.method === 'POST') {
    try {
      const { id, category, name, price, originalPrice, grams, stock, outOfStock, image, description, badge } = req.body;

      if (!id || !name || price === undefined) {
        return res.status(400).json({ success: false, error: 'Product ID, name, and price are required.' });
      }

      await sql`
        INSERT INTO products (
          id, category, name, price, original_price, grams, stock, out_of_stock, image_url, description, badge, updated_at
        ) VALUES (
          ${id}, ${category || 'coffee'}, ${name}, ${Number(price)}, 
          ${originalPrice ? Number(originalPrice) : null}, ${grams || '500g'}, 
          ${stock !== undefined ? Number(stock) : 50}, 
          ${Boolean(outOfStock)}, ${image || ''}, 
          ${description || ''}, ${badge || ''}, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          category = EXCLUDED.category,
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          grams = EXCLUDED.grams,
          stock = EXCLUDED.stock,
          out_of_stock = EXCLUDED.out_of_stock,
          image_url = CASE WHEN EXCLUDED.image_url <> '' THEN EXCLUDED.image_url ELSE products.image_url END,
          description = EXCLUDED.description,
          badge = EXCLUDED.badge,
          updated_at = NOW();
      `;

      return res.status(200).json({ success: true, message: 'Product saved in Neon database.' });
    } catch (err) {
      console.error('Error saving product:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

