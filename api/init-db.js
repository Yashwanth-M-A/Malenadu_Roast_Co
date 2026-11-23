import { getDb } from './db.js';

export default async function handler(req, res) {
  const sql = getDb();
  if (!sql) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured.' });
  }

  try {
    // 1. Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Orders Table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id INTEGER,
        shipping_name VARCHAR(255) NOT NULL,
        shipping_email VARCHAR(255) NOT NULL,
        shipping_phone VARCHAR(20) NOT NULL,
        shipping_address TEXT NOT NULL,
        pincode VARCHAR(10),
        total_amount NUMERIC(10, 2) NOT NULL,
        order_status VARCHAR(50) DEFAULT 'placed',
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'online',
        razorpay_order_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100),
        shiprocket_order_id VARCHAR(100),
        awb_code VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Order Items Table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL,
        product_id VARCHAR(100) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        weight_variant VARCHAR(50),
        unit_price NUMERIC(10, 2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        total_price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Customer Reviews Table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        rating INTEGER NOT NULL DEFAULT 5,
        product VARCHAR(100),
        liked TEXT,
        buy_again VARCHAR(20) DEFAULT 'Yes',
        review_text TEXT NOT NULL,
        verified BOOLEAN DEFAULT TRUE,
        hidden BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Products & Inventory Table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        original_price NUMERIC(10, 2),
        grams VARCHAR(50),
        stock INTEGER DEFAULT 50,
        out_of_stock BOOLEAN DEFAULT FALSE,
        image_url TEXT,
        description TEXT,
        badge VARCHAR(100),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return res.status(200).json({
      success: true,
      message: 'All Neon database tables created successfully!'
    });
  } catch (error) {
    console.error('Error initializing tables:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

