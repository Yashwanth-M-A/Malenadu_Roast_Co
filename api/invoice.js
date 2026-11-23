// ====================================================================
// Malenadu Roast Co. — Live Official GST Tax Invoice Viewer & Download
// GET /api/invoice?order=MN-XXXXX
// ====================================================================

import { getDb } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const orderNum = (req.query?.order || req.query?.orderNumber || 'MN-ORDER').trim();

  let orderData = {
    orderNumber: orderNum,
    shippingName: 'Valued Customer',
    shippingEmail: 'customer@malenaduroastco.works',
    shippingPhone: '',
    shippingAddress: 'Direct Estate Delivery',
    totalAmount: '499.00',
    createdAt: new Date().toISOString(),
    paymentMethod: 'Prepaid (UPI / Cards)',
    items: []
  };

  // Attempt database retrieval from Neon DB
  try {
    const sql = getDb();
    if (sql) {
      const orders = await sql`
        SELECT order_number as "orderNumber", shipping_name as "shippingName",
               shipping_email as "shippingEmail", shipping_phone as "shippingPhone",
               shipping_address as "shippingAddress", pincode, total_amount as "totalAmount",
               payment_method as "paymentMethod", created_at as "createdAt"
        FROM orders
        WHERE order_number = ${orderNum}
        LIMIT 1;
      `;
      if (orders && orders.length > 0) {
        orderData = { ...orderData, ...orders[0] };
        const items = await sql`
          SELECT product_name as "name", weight_variant as "weight",
                 unit_price as "price", quantity as "qty", total_price as "totalPrice"
          FROM order_items
          WHERE order_number = ${orderNum};
        `;
        if (items && items.length > 0) {
          orderData.items = items;
        }
      }
    }
  } catch (err) {
    console.warn('DB invoice lookup notice:', err.message);
  }

  const invoiceNumber = `INV-${orderData.orderNumber.replace(/[^0-9]/g, '') || Date.now().toString().slice(-6)}`;
  const orderDate = new Date(orderData.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const itemsList = (orderData.items && orderData.items.length > 0) 
    ? orderData.items 
    : [{ name: 'Estate Reserve Coffee / Pepper Harvest', weight: 'Standard Pack', price: parseFloat(orderData.totalAmount || 449), qty: 1 }];

  const computedItemsSubtotal = itemsList.reduce((acc, item) => {
    const p = parseFloat(item.price || (parseFloat(orderData.totalAmount || 0) / (item.qty || 1)) || 0);
    const q = Number(item.qty || 1);
    return acc + (p * q);
  }, 0);

  const itemsSubtotal = (orderData.subtotal !== undefined && orderData.subtotal !== null && !isNaN(parseFloat(orderData.subtotal)))
    ? parseFloat(orderData.subtotal)
    : computedItemsSubtotal;

  const totalAmount = parseFloat(orderData.totalAmount || itemsSubtotal);
  const taxableValue = (itemsSubtotal / 1.05).toFixed(2);
  const gstTotal = (itemsSubtotal - parseFloat(taxableValue)).toFixed(2);

  // Interstate check: Karnataka pincodes start with 56, 57, 58, 59
  const pinStr = String(orderData.pincode || '').trim();
  const isInterstate = pinStr.length >= 2 && !['56', '57', '58', '59'].some(p => pinStr.startsWith(p));
  const cgst = isInterstate ? '0.00' : (parseFloat(gstTotal) / 2).toFixed(2);
  const sgst = isInterstate ? '0.00' : (parseFloat(gstTotal) / 2).toFixed(2);
  const igst = isInterstate ? gstTotal : '0.00';

  let shippingFee = 0;
  if (orderData.shippingFee !== undefined && orderData.shippingFee !== null && !isNaN(parseFloat(orderData.shippingFee))) {
    shippingFee = parseFloat(orderData.shippingFee);
  } else if (totalAmount > itemsSubtotal) {
    shippingFee = parseFloat((totalAmount - itemsSubtotal).toFixed(2));
  }
  const grandTotal = itemsSubtotal + shippingFee;

  const itemsRows = itemsList.map((item, idx) => {
    const qty = Number(item.qty || 1);
    const price = parseFloat(item.price || (itemsSubtotal / qty) || 0);
    const rowTotal = (price * qty).toFixed(2);
    const rowTaxable = (parseFloat(rowTotal) / 1.05).toFixed(2);
    const isPepper = (item.name || '').toLowerCase().includes('pepper');
    const hsn = isPepper ? '0904' : '0901';

    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 10px; font-size: 13px; color: #475569; vertical-align: top;">${idx + 1}</td>
        <td style="padding: 12px 10px; font-size: 13px; font-weight: 700; color: #0f172a; vertical-align: top;">
          ${item.name}
          <div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 3px;">
            ${item.weight ? `Pack: ${item.weight} &nbsp;|&nbsp; ` : ''}<span>Applicable GST: 5.0% (Inclusive)</span>
          </div>
        </td>
        <td style="padding: 12px 10px; font-size: 13px; color: #64748b; text-align: center; vertical-align: top;">${hsn}</td>
        <td style="padding: 12px 10px; font-size: 13px; color: #0f172a; text-align: center; font-weight: 600; vertical-align: top;">${qty}</td>
        <td style="padding: 12px 10px; font-size: 13px; color: #475569; text-align: right; vertical-align: top;">₹${price.toFixed(2)}</td>
        <td style="padding: 12px 10px; font-size: 13px; color: #64748b; text-align: right; vertical-align: top;">₹${rowTaxable}</td>
        <td style="padding: 12px 10px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; vertical-align: top;">₹${rowTotal}</td>
      </tr>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - ${invoiceNumber} - Malenadu Roast Co.</title>
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px 16px; background: #f8fafc; color: #0f172a; line-height: 1.4; }
    .invoice-card { max-width: 794px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #C8935A; padding-bottom: 20px; margin-bottom: 24px; gap: 16px; }
    .brand-title { font-size: 22px; font-weight: 800; color: #18110C; margin: 0 0 3px; font-family: Georgia, serif; letter-spacing: 0.5px; }
    .brand-sub { font-size: 11.5px; color: #64748b; margin: 0 0 7px; }
    .badge-gst { display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 10.5px; font-weight: 700; padding: 2.5px 7px; border-radius: 4px; margin-right: 6px; }
    .badge-fssai { display: inline-block; background: #fffbeb; border: 1px solid #fde68a; color: #b45309; font-size: 10.5px; font-weight: 700; padding: 2.5px 7px; border-radius: 4px; }
    .meta-box { text-align: right; flex-shrink: 0; }
    .inv-badge { display: inline-block; background: #111827; color: #E8CA80; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .inv-num { font-size: 13px; font-weight: 700; color: #0f172a; }
    .meta-line { font-size: 12px; color: #64748b; margin-top: 2px; }
    .status-paid { font-size: 12px; color: #16a34a; font-weight: 700; margin-top: 3px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #fdfbf7; border: 1px solid #f3ebd8; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .info-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #92400e; letter-spacing: 0.5px; margin-bottom: 6px; }
    .info-name { font-size: 13.5px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .info-content { font-size: 12px; line-height: 1.45; color: #475569; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; text-align: left; }
    .totals-box { display: flex; justify-content: flex-end; margin-bottom: 28px; }
    .totals-table { width: 320px; border-collapse: collapse; font-size: 13px; }
    .totals-table td { padding: 5px 0; }
    .grand-total-row { border-top: 2px solid #C8935A; border-bottom: 2px solid #C8935A; padding: 10px 0; display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #18110C; margin-top: 8px; }
    .btn-bar { display: flex; justify-content: flex-end; max-width: 794px; margin: 0 auto 16px; }
    .print-btn { background: #C8935A; color: #ffffff; border: none; font-weight: 700; padding: 9px 20px; border-radius: 6px; font-size: 13px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(200,147,90,0.3); }
    @media print {
      body { background: #fff; padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 0; width: 100%; max-width: 100%; }
      .btn-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="btn-bar">
    <button onclick="window.print()" class="print-btn">Print / Save as PDF</button>
  </div>
  <div class="invoice-card">
    <div class="header">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div>
          <h1 class="brand-title">MALENADU ROAST CO.</h1>
          <p class="brand-sub">Email: malenaduroast@gmail.com | Tel: +91 8217623335</p>
          <div>
            <span class="badge-gst">GSTIN: 29BQJPY7539L1ZN (State 29)</span>
            <span class="badge-fssai">FSSAI Lic. No: 21226177001500</span>
          </div>
        </div>
      </div>
      <div class="meta-box">
        <div class="inv-badge">TAX INVOICE</div>
        <div class="inv-num">Invoice #: ${invoiceNumber}</div>
        <div class="meta-line">Order #: ${orderData.orderNumber}</div>
        <div class="meta-line">Date: ${orderDate}</div>
        <div class="status-paid">Status: PAID (ONLINE)</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="info-title">BILLED & SHIPPED TO:</div>
        <div class="info-name">${orderData.shippingName}</div>
        <div class="info-content">
          ${orderData.shippingAddress}<br>
          ${orderData.shippingPhone ? `Phone: +91 ${orderData.shippingPhone}<br>` : ''}
          ${orderData.shippingEmail ? `Email: ${orderData.shippingEmail}` : ''}
        </div>
      </div>
      <div>
        <div class="info-title">TAXATION & BUSINESS DATA:</div>
        <div class="info-content">
          Supplier GSTIN: <strong style="color: #0f172a;">29BQJPY7539L1ZN</strong><br>
          Statutory GST Rate: 5.0% (CGST 2.5% + SGST 2.5%)<br>
          Place of Supply: <strong>Karnataka (29)</strong>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 32px;">#</th>
          <th>DESCRIPTION OF GOODS</th>
          <th style="text-align: center; width: 64px;">HSN/SAC</th>
          <th style="text-align: center; width: 50px;">QTY</th>
          <th style="text-align: right; width: 95px;">RATE (INCL. GST)</th>
          <th style="text-align: right; width: 85px;">TAXABLE VALUE</th>
          <th style="text-align: right; width: 95px;">TOTAL (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals-box">
      <table class="totals-table">
        <tr>
          <td style="color: #475569; font-weight: 600;">Gross Product Subtotal:</td>
          <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${itemsSubtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Base Taxable Value (Excl. Tax):</td>
          <td style="text-align: right; font-weight: 600; color: #334155;">₹${taxableValue}</td>
        </tr>
        ${isInterstate ? `
          <tr>
            <td style="padding: 3px 0; color: #64748b;">IGST Payable @ 5.0%:</td>
            <td style="padding: 3px 0; text-align: right; font-weight: 600; color: #334155;">₹${igst}</td>
          </tr>
        ` : `
          <tr>
            <td style="padding: 3px 0; color: #64748b;">Central GST (CGST @ 2.5%):</td>
            <td style="padding: 3px 0; text-align: right; font-weight: 600; color: #334155;">₹${cgst}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; color: #64748b;">State GST (SGST @ 2.5%):</td>
            <td style="padding: 3px 0; text-align: right; font-weight: 600; color: #334155;">₹${sgst}</td>
          </tr>
        `}
        <tr style="background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 6px 8px; font-weight: 600; color: #1e293b;">Total Statutory Tax (5.0% GST):</td>
          <td style="padding: 6px 8px; text-align: right; font-weight: 700; color: #0f172a;">
            ₹${gstTotal} <span style="font-size: 10px; color: #059669; font-weight: 700;">(INCLUDED)</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #475569; font-weight: 500;">Shipping & Logistics Charges:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 700; color: ${shippingFee > 0 ? '#92400e' : '#059669'};">
            ${shippingFee > 0 ? `₹${shippingFee.toFixed(2)}` : 'FREE (₹0.00)'}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 8px;">
            <div class="grand-total-row">
              <span>Total Amount Payable (INR):</span>
              <span>₹${grandTotal.toFixed(2)}</span>
            </div>
            <div style="font-size: 10px; color: #64748b; text-align: right; margin-top: 5px; line-height: 1.4;">
              * Statutory Note: All product catalogue prices are inclusive of applicable Goods and Services Tax (GST). Reverse charge is not applicable.
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
      <div style="font-weight: 600; color: #334155; margin-bottom: 3px;">
        Thank you for patronizing sustainable single-estate coffee roasters of Chikkamagaluru!
      </div>
      <div>
        Declaration: Certified that all particulars are true and correct, and product prices indicated represent the actual transaction value. This is a computer-generated tax invoice issued under Section 31 of the CGST Act, 2017.
      </div>
    </div>
  </div>
</body>
</html>`;

  return res.status(200).send(html);
}

