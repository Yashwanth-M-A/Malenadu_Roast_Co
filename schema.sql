-- ====================================================================
-- Malenadu Roast Co. — Production PostgreSQL Database Schema (Neon DB)
-- ====================================================================

-- 1. Users Table (Real Account Authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer', -- 'customer' | 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Orders Table (E-commerce Order & Payment Management)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. MN-784920
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Customer & Shipping Details
    shipping_name VARCHAR(255) NOT NULL,
    shipping_email VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    
    -- B2B & Tax Details
    is_b2b BOOLEAN DEFAULT FALSE,
    b2b_company_name VARCHAR(255),
    b2b_gstin VARCHAR(20),
    
    -- Financials & Statutory GST (5% Coffee/Spices)
    subtotal NUMERIC(10, 2) NOT NULL,
    taxable_amount NUMERIC(10, 2) NOT NULL,
    cgst_amount NUMERIC(10, 2) NOT NULL, -- 2.5%
    sgst_amount NUMERIC(10, 2) NOT NULL, -- 2.5%
    gst_total NUMERIC(10, 2) NOT NULL,  -- 5.0%
    shipping_fee NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    
    -- Status & Fulfillment
    order_status VARCHAR(50) DEFAULT 'placed', -- 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
    payment_method VARCHAR(50) DEFAULT 'online', -- 'online' | 'cod'
    
    -- Razorpay Gateway Identifiers
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    
    -- Shiprocket Logistics Identifiers
    shiprocket_order_id VARCHAR(100),
    shiprocket_shipment_id VARCHAR(100),
    awb_code VARCHAR(100), -- Tracking number
    courier_name VARCHAR(100), -- e.g. 'Delhivery', 'Blue Dart'
    tracking_url TEXT,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(shipping_email);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- 3. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    hsn_code VARCHAR(20) DEFAULT '0901', -- '0901' for Coffee, '0904' for Pepper
    weight_variant VARCHAR(50), -- '250g', '500g', '1kg'
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

