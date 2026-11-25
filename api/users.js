import { getDb } from './db.js';

export default async function handler(req, res) {
  const sql = getDb();
  if (!sql) {
    return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  }

  // Ensure cart column exists in users table
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS cart JSONB DEFAULT '[]'::jsonb;`;
  } catch (e) {
    console.warn('Users cart column check:', e.message);
  }

  // GET: Fetch user's cart by email, or all users for admin
  if (req.method === 'GET') {
    try {
      const email = (req.query?.email || '').toLowerCase().trim();
      if (email) {
        const userRows = await sql`
          SELECT id, name, email, phone, address, role, cart,
                 created_at as "createdAt", updated_at as "updatedAt"
          FROM users
          WHERE LOWER(email) = LOWER(${email})
          LIMIT 1;
        `;
        if (userRows && userRows.length > 0) {
          const user = userRows[0];
          return res.status(200).json({
            success: true,
            user,
            cart: Array.isArray(user.cart) ? user.cart : []
          });
        }
        return res.status(200).json({ success: true, cart: [] });
      }

      // Admin all-users list
      const users = await sql`
        SELECT id, name, email, phone, address, role, cart,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        ORDER BY created_at DESC;
      `;

      return res.status(200).json({ success: true, users });
    } catch (err) {
      console.error('Error fetching users/cart:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // PUT / PATCH: Sync cart directly to the user's account in database
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { email, cart } = req.body || {};
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }
      const cleanEmail = String(email).toLowerCase().trim();
      const cartJson = JSON.stringify(Array.isArray(cart) ? cart : []);

      await sql`
        UPDATE users
        SET cart = ${cartJson}::jsonb,
            updated_at = NOW()
        WHERE LOWER(email) = LOWER(${cleanEmail});
      `;

      return res.status(200).json({ success: true, message: 'Account cart synchronized' });
    } catch (err) {
      console.error('Error syncing account cart:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Register or upsert a user
  if (req.method === 'POST') {
    try {
      const { name, email, phone, address, password, role } = req.body || {};
      if (!name || !email) {
        return res.status(400).json({ success: false, error: 'Name and email are required' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const cleanPhone = phone ? String(phone).trim() : '';
      const cleanAddress = address ? String(address).trim() : '';
      const userRole = role || (cleanEmail === 'malenaduroast@gmail.com' ? 'admin' : 'customer');

      await sql`
        INSERT INTO users (
          name, email, phone, address, password_hash, role, created_at, updated_at
        ) VALUES (
          ${name}, ${cleanEmail}, ${cleanPhone}, ${cleanAddress}, 
          ${password || 'account_active'}, ${userRole}, NOW(), NOW()
        )
        ON CONFLICT (email) DO UPDATE
        SET name = EXCLUDED.name,
            phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE users.phone END,
            address = CASE WHEN EXCLUDED.address <> '' THEN EXCLUDED.address ELSE users.address END,
            updated_at = NOW();
      `;

      return res.status(200).json({ success: true, message: 'User registered/synced successfully' });
    } catch (err) {
      console.error('Error saving user:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
