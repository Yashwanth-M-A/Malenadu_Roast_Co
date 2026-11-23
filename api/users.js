import { getDb } from './db.js';

export default async function handler(req, res) {
  const sql = getDb();
  if (!sql) {
    return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  }

  // GET: Fetch all registered users for the admin dashboard
  if (req.method === 'GET') {
    try {
      const users = await sql`
        SELECT id, name, email, phone, address, role, 
               created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        ORDER BY created_at DESC;
      `;

      return res.status(200).json({ success: true, users });
    } catch (err) {
      console.error('Error fetching users:', err);
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

