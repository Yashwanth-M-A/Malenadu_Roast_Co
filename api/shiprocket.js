// api/shiprocket.js
import https from 'https';
import { getDb } from './db.js';

let cachedToken = null;
let tokenExpiresAt = 0;

function httpRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function getAuthToken() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD environment variables are not set.');
  }

  // Cache token for 23 hours (Shiprocket tokens typically last 10 days)
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const res = await httpRequest('https://apiv2.shiprocket.in/v1/external/auth/login', 'POST', {
    'Content-Type': 'application/json'
  }, { email, password });

  if (res.data && res.data.token) {
    cachedToken = res.data.token;
    tokenExpiresAt = Date.now() + 23 * 60 * 60 * 1000;
    return cachedToken;
  }

  throw new Error(res.data?.message || 'Failed to authenticate with Shiprocket');
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    const token = await getAuthToken();
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 1. Check pickup locations
    if (action === 'pickup_locations') {
      const resp = await httpRequest(
        'https://apiv2.shiprocket.in/v1/external/settings/company/pickup',
        'GET',
        authHeaders
      );
      return res.status(200).json(resp.data);
    }

    // 2. Courier serviceability check
    if (action === 'serviceability' && req.method === 'POST') {
      const { pickup_postcode = '560064', delivery_postcode, weight = 0.5, cod = 0 } = req.body;
      if (!delivery_postcode) {
        return res.status(400).json({ error: 'delivery_postcode is required' });
      }

      const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=${cod}`;
      const resp = await httpRequest(url, 'GET', authHeaders);
      return res.status(200).json(resp.data);
    }

    // 3. Create Order on Shiprocket
    if (action === 'create_order' && req.method === 'POST') {
      const orderPayload = req.body;
      const resp = await httpRequest(
        'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
        'POST',
        authHeaders,
        orderPayload
      );
      return res.status(resp.status).json(resp.data);
    }

    // 4. Assign AWB / Courier
    if (action === 'assign_awb' && req.method === 'POST') {
      const { shipment_id, courier_id } = req.body;
      const payload = { shipment_id: Number(shipment_id) };
      if (courier_id) payload.courier_id = Number(courier_id);

      const resp = await httpRequest(
        'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
        'POST',
        authHeaders,
        payload
      );
      return res.status(resp.status).json(resp.data);
    }

    // 5. Generate Shipping Label PDF
    if (action === 'generate_label' && req.method === 'POST') {
      const { shipment_id } = req.body;
      const resp = await httpRequest(
        'https://apiv2.shiprocket.in/v1/external/courier/generate/label',
        'POST',
        authHeaders,
        { shipment_id: [Number(shipment_id)] }
      );
      return res.status(resp.status).json(resp.data);
    }

    // 6. Track Shipment
    if (action === 'track') {
      const { awb } = req.query;
      if (!awb) return res.status(400).json({ error: 'awb query parameter required' });

      const resp = await httpRequest(
        `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(awb)}`,
        'GET',
        authHeaders
      );
      return res.status(resp.status).json(resp.data);
    }

    // 7. Full Ship Order Pipeline (Create Order + AWB + Label + Update Neon DB)
    if (action === 'ship' && req.method === 'POST') {
      const { order, pickup_location = 'Malenadu Hub Bengaluru' } = req.body;
      if (!order || !order.orderNumber) {
        return res.status(400).json({ error: 'Valid order object required' });
      }

      // Prepare Shiprocket Order Payload
      const nameParts = (order.shippingName || 'Customer').trim().split(' ');
      const firstName = nameParts[0] || 'Valued';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';

      let addressLine = (order.shippingAddress || 'No. 10, Coffee Estate Road').trim();
      if (!/\d/.test(addressLine)) {
        addressLine = 'Plot No. 1, ' + addressLine;
      }

      const cleanPhone = String(order.shippingPhone || '8217623335').replace(/[^0-9]/g, '').slice(-10).padStart(10, '8');
      const cleanPincode = String(order.pincode || '560001').replace(/[^0-9]/g, '').padEnd(6, '0').slice(0, 6);

      // Parse and format items
      const items = (order.items && order.items.length > 0) ? order.items : [{
        name: 'Artisanal Single-Origin Coffee',
        qty: 1,
        price: order.totalAmount || 499,
        weight: '250g'
      }];

      let totalWeightKg = 0;
      const formattedItems = items.map((it, idx) => {
        let weightKg = 0.25;
        if (typeof it.weight === 'string') {
          if (it.weight.includes('1kg') || it.weight.includes('1000g')) weightKg = 1.0;
          else if (it.weight.includes('500g')) weightKg = 0.5;
          else if (it.weight.includes('250g')) weightKg = 0.25;
        }
        totalWeightKg += weightKg * (Number(it.qty) || 1);

        return {
          name: it.name || 'Estate Coffee',
          sku: `MRC-${idx + 1}-${String(it.weight || '250g').replace(/\s+/g, '')}`,
          units: Number(it.qty) || 1,
          selling_price: Number(it.price) || 450,
          discount: 0,
          tax: 0,
          hsn: 9012100
        };
      });

      const orderPayload = {
        order_id: String(order.orderNumber),
        order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 10) + ' 12:00',
        pickup_location,
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: addressLine,
        billing_address_2: '',
        billing_city: order.city || 'Bengaluru',
        billing_pincode: cleanPincode,
        billing_state: order.state || 'Karnataka',
        billing_country: 'India',
        billing_email: order.shippingEmail || 'orders@malenaduroastco.works',
        billing_phone: cleanPhone,
        shipping_is_billing: true,
        order_items: formattedItems,
        payment_method: (order.paymentMethod === 'cod') ? 'COD' : 'Prepaid',
        shipping_charges: 0,
        sub_total: Number(order.totalAmount) || 500,
        length: 15,
        breadth: 12,
        height: 8,
        weight: Math.max(0.25, Math.round(totalWeightKg * 100) / 100)
      };

      // Step A: Create order in Shiprocket
      const createOrderRes = await httpRequest(
        'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
        'POST',
        authHeaders,
        orderPayload
      );

      if (createOrderRes.status !== 200 && createOrderRes.status !== 201) {
        let msg = createOrderRes.data?.message;
        if (typeof msg === 'object') msg = JSON.stringify(msg);
        return res.status(createOrderRes.status).json({
          error: msg || 'Failed to create order in Shiprocket',
          details: createOrderRes.data
        });
      }

      const srData = createOrderRes.data;
      const srOrderId = srData.order_id;
      const srShipmentId = srData.shipment_id;
      let awbCode = srData.awb_code || null;
      let courierName = srData.courier_name || null;
      let labelUrl = null;

      // Step B: Attempt AWB assignment
      if (srShipmentId) {
        try {
          const awbRes = await httpRequest(
            'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
            'POST',
            authHeaders,
            { shipment_id: srShipmentId }
          );

          if (awbRes.data?.response?.data?.awb_code) {
            awbCode = awbRes.data.response.data.awb_code;
            courierName = awbRes.data.response.data.courier_name;

            // Generate label
            const labelRes = await httpRequest(
              'https://apiv2.shiprocket.in/v1/external/courier/generate/label',
              'POST',
              authHeaders,
              { shipment_id: [srShipmentId] }
            );
            labelUrl = labelRes.data?.label_url || null;
          }
        } catch (awbErr) {
          console.warn('AWB assign skipped/failed (e.g. pending KYC or wallet):', awbErr.message);
        }
      }

      // Step C: Update Neon database
      const sql = getDb();
      if (sql) {
        await sql`
          UPDATE orders
          SET shiprocket_order_id = ${String(srOrderId)},
              awb_code = COALESCE(${awbCode}, awb_code),
              order_status = 'shipped',
              updated_at = NOW()
          WHERE order_number = ${order.orderNumber};
        `;
      }

      return res.status(200).json({
        success: true,
        orderNumber: order.orderNumber,
        shiprocketOrderId: srOrderId,
        shipmentId: srShipmentId,
        awbCode: awbCode || null,
        courierName: courierName || null,
        labelUrl
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    console.error('Shiprocket API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error in Shiprocket gateway' });
  }
}

