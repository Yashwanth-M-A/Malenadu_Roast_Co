import { getDb } from './db.js';

export default async function handler(req, res) {
  const sql = getDb();
  if (!sql) {
    return res.status(500).json({ error: 'DATABASE_URL not configured.' });
  }

  // GET: Fetch orders (filtered by email or all for admin)
  if (req.method === 'GET') {
    try {
      // 1. Ensure table schema has dedicated address columns for Delhivery autofill
      try {
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS house_no TEXT;`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS area TEXT;`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS landmark TEXT;`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS city TEXT;`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS state TEXT;`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS alternate_phone TEXT;`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_type TEXT;`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;`;
      } catch (colErr) {
        console.warn('Column ensure note:', colErr);
      }

      // 2. Ensure live customer order #MN-187976 is safely registered
      try {
        const existingReal = await sql`SELECT id FROM orders WHERE order_number = 'MN-187976';`;
        if (existingReal.length === 0) {
          await sql`
            INSERT INTO orders (
              order_number, shipping_name, shipping_email, shipping_phone,
              shipping_address, pincode, total_amount, order_status,
              payment_status, payment_method, razorpay_order_id, razorpay_payment_id,
              house_no, area, landmark, city, state,
              created_at, updated_at
            ) VALUES (
              'MN-187976', 'Puneeth', 'puneethal4694@gmail.com', '7019674174',
              'Skanda, #818/17, near Dhaba Bus stop, 1st main road, 2nd stage,, Shivakumara Swamy layout, davangere, Karnataka, PIN: 577005',
              '577005', 603, 'placed', 'paid', 'online',
              'order_U481w89VHtmzP2', 'pay_U4826E68sWZMLD',
              'Skanda, #818/17', '1st main road, 2nd stage, Shivakumara Swamy layout', 'near Dhaba Bus stop', 'Davangere', 'Karnataka',
              '2026-11-25T01:01:00.000Z', NOW()
            );
          `;
          await sql`
            INSERT INTO order_items (
              order_number, product_id, product_name, weight_variant,
              unit_price, quantity, total_price, created_at
            ) VALUES (
              'MN-187976', '3', 'Imperial Heritage Reserve', '500g', 559, 1, 559, '2026-11-25T01:01:00.000Z'
            );
          `;
        }

        // 3. Automatically purge all old demo/test orders from database
        await sql`DELETE FROM order_items WHERE order_number != 'MN-187976' AND created_at < '2026-11-25';`;
        await sql`DELETE FROM orders WHERE order_number != 'MN-187976' AND created_at < '2026-11-25';`;
      } catch (e) {
        console.warn('Order sync/purge note:', e);
      }

      const email = req.query.email;
      let orders;
      if (email && email.toLowerCase() !== 'malenaduroast@gmail.com') {
        orders = await sql`
          SELECT id, order_number as "orderNumber", shipping_name as "shippingName",
                 shipping_email as "shippingEmail", shipping_phone as "shippingPhone",
                 shipping_address as "shippingAddress", pincode, total_amount as "totalAmount",
                 order_status as "orderStatus", payment_status as "paymentStatus",
                 payment_method as "paymentMethod", razorpay_order_id as "razorpayOrderId",
                 razorpay_payment_id as "razorpayPaymentId", shiprocket_order_id as "shiprocketOrderId",
                 awb_code as "awbCode", house_no as "houseNo", area, landmark, city, state,
                 alternate_phone as "alternatePhone", address_type as "addressType", delivery_instructions as "deliveryInstructions",
                 coupon_code as "couponCode", discount_amount as "discountAmount",
                 created_at as "createdAt"
          FROM orders
          WHERE LOWER(shipping_email) = LOWER(${email})
          ORDER BY created_at DESC;
        `;
      } else {
        orders = await sql`
          SELECT id, order_number as "orderNumber", shipping_name as "shippingName",
                 shipping_email as "shippingEmail", shipping_phone as "shippingPhone",
                 shipping_address as "shippingAddress", pincode, total_amount as "totalAmount",
                 order_status as "orderStatus", payment_status as "paymentStatus",
                 payment_method as "paymentMethod", razorpay_order_id as "razorpayOrderId",
                 razorpay_payment_id as "razorpayPaymentId", shiprocket_order_id as "shiprocketOrderId",
                 awb_code as "awbCode", house_no as "houseNo", area, landmark, city, state,
                 alternate_phone as "alternatePhone", address_type as "addressType", delivery_instructions as "deliveryInstructions",
                 coupon_code as "couponCode", discount_amount as "discountAmount",
                 created_at as "createdAt"
          FROM orders
          ORDER BY created_at DESC;
        `;
      }

      // Fetch items for these orders
      const orderNumbers = orders.map(o => o.orderNumber);
      let itemsByOrder = {};
      if (orderNumbers.length > 0) {
        const items = await sql`
          SELECT order_number as "orderNumber", product_id as "id",
                 product_name as "name", weight_variant as "weight",
                 unit_price as "price", quantity as "qty", total_price as "totalPrice"
          FROM order_items
          WHERE order_number = ANY(${orderNumbers});
        `;
        for (const it of items) {
          if (!itemsByOrder[it.orderNumber]) itemsByOrder[it.orderNumber] = [];
          itemsByOrder[it.orderNumber].push(it);
        }
      }

      const populatedOrders = orders.map(o => ({
        ...o,
        _id: String(o.id),
        items: itemsByOrder[o.orderNumber] || []
      }));

      return res.status(200).json({ success: true, orders: populatedOrders });
    } catch (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Create new order
  if (req.method === 'POST') {
    try {
      const orderData = req.body;
      const orderNumber = orderData.orderNumber || 'MN-' + Math.floor(100000 + Math.random() * 900000);

      await sql`
        INSERT INTO orders (
          order_number, shipping_name, shipping_email, shipping_phone,
          shipping_address, pincode, total_amount, order_status,
          payment_status, payment_method, razorpay_order_id, razorpay_payment_id,
          house_no, area, landmark, city, state,
          alternate_phone, address_type, delivery_instructions,
          coupon_code, discount_amount,
          created_at, updated_at
        ) VALUES (
          ${orderNumber}, ${orderData.shippingName}, ${orderData.shippingEmail.toLowerCase()},
          ${orderData.shippingPhone || ''}, ${orderData.shippingAddress || ''},
          ${orderData.pincode || ''}, ${Number(orderData.totalAmount)},
          ${orderData.orderStatus || 'placed'}, ${orderData.paymentStatus || 'paid'},
          ${orderData.paymentMethod || 'online'}, ${orderData.razorpayOrderId || null},
          ${orderData.razorpayPaymentId || null},
          ${orderData.houseNo || null}, ${orderData.area || null}, ${orderData.landmark || null},
          ${orderData.city || null}, ${orderData.state || null},
          ${orderData.alternatePhone || null}, ${orderData.addressType || 'Home'},
          ${orderData.deliveryInstructions || null},
          ${orderData.couponCode || null}, ${Number(orderData.discountAmount || 0)},
          NOW(), NOW()
        );
      `;

      if (Array.isArray(orderData.items)) {
        for (const it of orderData.items) {
          await sql`
            INSERT INTO order_items (
              order_number, product_id, product_name, weight_variant,
              unit_price, quantity, total_price, created_at
            ) VALUES (
              ${orderNumber}, ${String(it.id || 'prod')}, ${it.name},
              ${it.weight || '250g'}, ${Number(it.price)},
              ${Number(it.qty || 1)}, ${Number(it.price) * Number(it.qty || 1)}, NOW()
            );
          `;
        }
      }

      return res.status(200).json({ success: true, orderNumber });
    } catch (err) {
      console.error('Error placing order:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // PATCH: Update order status (packed, shipped, delivered, cancelled)
  if (req.method === 'PATCH') {
    try {
      const orderNumber = req.body?.orderNumber || req.query?.orderNumber;
      const { orderStatus, paymentStatus, awbCode } = req.body || {};
      if (!orderNumber) return res.status(400).json({ error: 'Order number required' });

      await sql`
        UPDATE orders
        SET order_status = COALESCE(${orderStatus}, order_status),
            payment_status = COALESCE(${paymentStatus}, payment_status),
            awb_code = COALESCE(${awbCode}, awb_code),
            updated_at = NOW()
        WHERE order_number = ${orderNumber};
      `;

      return res.status(200).json({ success: true, message: 'Order status updated' });
    } catch (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // DELETE: Delete an order or purge demo orders
  if (req.method === 'DELETE') {
    try {
      const { orderNumber, purgeAllDemo } = req.query;
      if (orderNumber) {
        await sql`DELETE FROM order_items WHERE order_number = ${orderNumber};`;
        await sql`DELETE FROM orders WHERE order_number = ${orderNumber};`;
        return res.status(200).json({ success: true, message: `Order #${orderNumber} deleted successfully` });
      }

      if (purgeAllDemo) {
        await sql`DELETE FROM order_items WHERE order_number != 'MN-187976';`;
        await sql`DELETE FROM orders WHERE order_number != 'MN-187976';`;
        return res.status(200).json({ success: true, message: 'All demo orders purged. Kept #MN-187976.' });
      }

      return res.status(400).json({ error: 'orderNumber or purgeAllDemo parameter required' });
    } catch (err) {
      console.error('Error deleting orders:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

