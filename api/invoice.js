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

  const rawParam = (req.query?.order || req.query?.orderNumber || 'MN-ORDER').trim();
  const cleanOrderNum = rawParam.replace(/^#/, '');
  const prefixedOrderNum = cleanOrderNum.startsWith('MN-') ? cleanOrderNum : `MN-${cleanOrderNum}`;
  const isEmbedded = req.query?.embedded === 'true' || req.query?.embed === '1';

  let orderData = {
    orderNumber: prefixedOrderNum,
    shippingName: 'Valued Customer',
    shippingEmail: '',
    shippingPhone: '',
    shippingAddress: 'Direct Estate Delivery, India',
    pincode: '',
    totalAmount: '499.00',
    createdAt: new Date().toISOString(),
    paymentMethod: 'Prepaid (UPI / Cards)',
    items: []
  };

  let matchedOrderNumber = prefixedOrderNum;

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
        WHERE order_number = ${cleanOrderNum}
           OR order_number = ${prefixedOrderNum}
           OR order_number = ${'#' + cleanOrderNum}
           OR order_number = ${'#' + prefixedOrderNum}
           OR order_number = ${rawParam}
        LIMIT 1;
      `;
      if (orders && orders.length > 0) {
        orderData = { ...orderData, ...orders[0] };
        matchedOrderNumber = orders[0].orderNumber || prefixedOrderNum;
        const items = await sql`
          SELECT product_name as "name", weight_variant as "weight",
                 unit_price as "price", quantity as "qty", total_price as "totalPrice"
          FROM order_items
          WHERE order_number = ${matchedOrderNumber};
        `;
        if (items && items.length > 0) {
          orderData.items = items;
        }
      }
    }
  } catch (err) {
    console.warn('DB invoice lookup notice:', err.message);
  }

  const invoiceNumber = `INV-${String(orderData.orderNumber).replace(/[^0-9]/g, '') || Date.now().toString().slice(-6)}`;
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
    const weightLabel = item.weight ? item.weight : (item.name.includes('(') ? '' : '500g');

    return `
      <tr>
        <td class="col-num">${idx + 1}</td>
        <td class="col-desc">
          <div class="item-title">${item.name}</div>
          <div class="item-meta">
            ${weightLabel ? `<span class="item-pill">Pack: ${weightLabel}</span>` : ''}
            <span>GST: 5.0% (Inclusive)</span>
          </div>
        </td>
        <td class="col-hsn">${hsn}</td>
        <td class="col-qty">${qty}</td>
        <td class="col-price">₹${price.toFixed(2)}</td>
        <td class="col-taxable">₹${rowTaxable}</td>
        <td class="col-total">₹${rowTotal}</td>
      </tr>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>Tax Invoice - ${invoiceNumber} | Malenadu Roast Co.</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <style>
    :root {
      --c-gold: #C8935A;
      --c-gold-dark: #9E6B34;
      --c-gold-light: #F8DA9D;
      --c-dark: #18110C;
      --c-cream: #FDFBF7;
      --c-border: #E2E8F0;
      --font-serif: 'Cinzel', Georgia, serif;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: var(--font-sans);
      background: #F4EFE6;
      color: #0F172A;
      line-height: 1.5;
      padding: 0;
      margin: 0;
      -webkit-font-smoothing: antialiased;
    }

    /* Top Sticky Control Bar */
    .top-action-bar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      background: #18110C;
      border-bottom: 1px solid rgba(200, 147, 90, 0.3);
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    }
    .top-bar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .back-btn {
      color: #F8DA9D;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.2s ease;
    }
    .back-btn:hover {
      color: #FFFFFF;
    }
    .top-bar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-download-pdf {
      background: linear-gradient(135deg, #F8DA9D 0%, #C8935A 70%, #9E6B34 100%);
      color: #18110C;
      box-shadow: 0 2px 8px rgba(200, 147, 90, 0.4);
    }
    .btn-download-pdf:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
    .btn-print {
      background: rgba(255, 255, 255, 0.1);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .btn-print:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Page Container */
    .invoice-wrapper {
      max-width: 860px;
      margin: 28px auto 60px;
      padding: 0 16px;
    }

    /* Official Invoice Sheet Card */
    .invoice-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 36px 40px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      position: relative;
    }

    /* Header */
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid var(--c-gold);
      padding-bottom: 24px;
      margin-bottom: 24px;
      gap: 20px;
    }
    .brand-block {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--c-gold);
      background: #FFFFFF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      flex-shrink: 0;
    }
    .brand-info h1 {
      font-family: var(--font-serif);
      font-size: 22px;
      font-weight: 800;
      color: var(--c-dark);
      letter-spacing: 0.8px;
      margin-bottom: 3px;
    }
    .brand-tagline {
      font-size: 12px;
      color: #64748B;
      margin-bottom: 6px;
    }
    .brand-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .badge {
      display: inline-block;
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .badge-gst {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: #1D4ED8;
    }
    .badge-fssai {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      color: #B45309;
    }

    /* Meta Box (Invoice details) */
    .meta-block {
      text-align: right;
      flex-shrink: 0;
    }
    .badge-tax-inv {
      display: inline-block;
      background: #18110C;
      color: #E8CA80;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 4px;
      letter-spacing: 1.2px;
      margin-bottom: 8px;
    }
    .inv-number {
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
    }
    .inv-detail {
      font-size: 12px;
      color: #64748B;
      margin-top: 3px;
    }
    .status-paid-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 20px;
      margin-top: 6px;
    }

    /* Two-column Billing & Taxation Grid */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #FDFBF7;
      border: 1px solid #F3EBD8;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 28px;
    }
    .box-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #92400E;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cust-name {
      font-size: 14.5px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 4px;
    }
    .box-text {
      font-size: 12.5px;
      color: #475569;
      line-height: 1.5;
    }
    .box-text strong {
      color: #0F172A;
    }

    /* Line Items Responsive Table */
    .table-container {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      margin-bottom: 24px;
      background: #FFFFFF;
    }
    .invoice-table {
      width: 100%;
      min-width: 600px;
      border-collapse: collapse;
      font-size: 13px;
    }
    .invoice-table thead th {
      background: #F8FAFC;
      border-bottom: 2px solid #CBD5E1;
      padding: 12px 10px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      text-align: left;
    }
    .invoice-table tbody tr {
      border-bottom: 1px solid #E2E8F0;
    }
    .invoice-table tbody tr:last-child {
      border-bottom: none;
    }
    .invoice-table td {
      padding: 14px 10px;
      vertical-align: top;
    }
    .col-num {
      width: 36px;
      color: #64748B;
      font-size: 12px;
      text-align: center;
    }
    .col-desc {
      min-width: 180px;
    }
    .item-title {
      font-weight: 700;
      color: #0F172A;
      font-size: 13.5px;
      line-height: 1.35;
    }
    .item-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      font-size: 11px;
      color: #64748B;
    }
    .item-pill {
      background: #F1F5F9;
      padding: 1px 6px;
      border-radius: 3px;
      font-weight: 600;
      color: #334155;
    }
    .col-hsn {
      width: 70px;
      text-align: center;
      color: #64748B;
      font-size: 12px;
    }
    .col-qty {
      width: 50px;
      text-align: center;
      font-weight: 700;
      color: #0F172A;
    }
    .col-price {
      width: 95px;
      text-align: right;
      color: #475569;
    }
    .col-taxable {
      width: 95px;
      text-align: right;
      color: #64748B;
    }
    .col-total {
      width: 105px;
      text-align: right;
      font-weight: 800;
      color: #0F172A;
    }
    .mobile-scroll-hint {
      display: none;
      font-size: 11px;
      color: #64748B;
      text-align: right;
      margin-top: -18px;
      margin-bottom: 16px;
      padding-right: 4px;
    }

    /* Totals & Tax Summary */
    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .summary-card {
      width: 100%;
      max-width: 380px;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      background: #FDFBF7;
      padding: 16px 20px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12.5px;
      padding: 5px 0;
      color: #475569;
    }
    .summary-row strong {
      color: #0F172A;
    }
    .tax-box-row {
      background: #FFFFFF;
      border: 1px dashed #CBD5E1;
      border-radius: 6px;
      padding: 8px 10px;
      margin: 6px 0;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #1E293B;
      font-weight: 600;
    }
    .tax-tag {
      font-size: 10px;
      font-weight: 800;
      color: #059669;
      background: #ECFDF5;
      padding: 2px 5px;
      border-radius: 3px;
      margin-left: 4px;
    }
    .grand-total-box {
      border-top: 2px solid var(--c-gold);
      border-bottom: 2px solid var(--c-gold);
      padding: 12px 0;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .grand-title {
      font-size: 14.5px;
      font-weight: 800;
      color: var(--c-dark);
    }
    .grand-amount {
      font-size: 18px;
      font-weight: 800;
      color: var(--c-dark);
    }
    .statutory-note {
      font-size: 10px;
      color: #64748B;
      text-align: right;
      margin-top: 6px;
      line-height: 1.35;
    }

    /* Footer & Signatory */
    .invoice-footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 24px;
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
    }
    .legal-declaration {
      font-size: 11px;
      color: #64748B;
      line-height: 1.5;
      max-width: 480px;
    }
    .declaration-title {
      font-weight: 700;
      color: #334155;
      margin-bottom: 4px;
    }
    .signatory-box {
      text-align: right;
      flex-shrink: 0;
    }
    .signatory-company {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--c-dark);
      letter-spacing: 0.5px;
    }
    .signatory-seal {
      display: inline-block;
      margin: 10px 0 6px;
      padding: 6px 14px;
      border: 1.5px dashed var(--c-gold);
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      color: var(--c-gold-dark);
      background: #FDFBF7;
    }
    .signatory-label {
      font-size: 10.5px;
      color: #64748B;
    }

    /* Responsive Adjustments for Mobile Screens */
    @media (max-width: 680px) {
      .top-action-bar {
        padding: 10px 12px;
      }
      .brand-block h1 {
        font-size: 18px;
      }
      .invoice-wrapper {
        margin: 12px auto 40px;
        padding: 0 8px;
      }
      .invoice-card {
        padding: 20px 14px;
        border-radius: 12px;
      }
      .header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        padding-bottom: 18px;
      }
      .meta-block {
        text-align: left;
        width: 100%;
        background: #F8FAFC;
        padding: 12px 14px;
        border-radius: 8px;
        border: 1px solid #E2E8F0;
      }
      .details-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 14px;
      }
      .mobile-scroll-hint {
        display: block;
      }
      .summary-section {
        justify-content: stretch;
      }
      .summary-card {
        max-width: 100%;
      }
      .invoice-footer {
        flex-direction: column-reverse;
        align-items: flex-start;
        gap: 16px;
      }
      .signatory-box {
        text-align: left;
        width: 100%;
      }
    }

    /* Print / PDF generation styles */
    @media print {
      body {
        background: #FFFFFF !important;
        padding: 0 !important;
      }
      .top-action-bar,
      .mobile-scroll-hint {
        display: none !important;
      }
      .invoice-wrapper {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .invoice-card {
        border: none !important;
        box-shadow: none !important;
        padding: 16px 20px !important;
        width: 100% !important;
      }
    }

    ${isEmbedded ? `
    /* Embedded Preview Mode (Modal display) */
    .top-action-bar {
      display: none !important;
    }
    body {
      background: #FFFFFF !important;
    }
    .invoice-wrapper {
      margin: 8px auto !important;
      padding: 0 4px !important;
    }
    .invoice-card {
      box-shadow: none !important;
      border: 1px solid #E2E8F0 !important;
    }
    ` : ''}
  </style>
</head>
<body>

  ${!isEmbedded ? `
  <!-- Floating Sticky Action Bar -->
  <div class="top-action-bar">
    <div class="top-bar-left">
      <a href="https://www.malenaduroastco.works" class="back-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Back to Store</span>
      </a>
    </div>
    <div class="top-bar-right">
      <button onclick="downloadInvoicePDF()" id="btn-download" class="btn-action btn-download-pdf">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Download PDF</span>
      </button>
      <button onclick="window.print()" class="btn-action btn-print">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span>Print</span>
      </button>
    </div>
  </div>
  ` : ''}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span>Print</span>
      </button>
    </div>
  </div>

  <div class="invoice-wrapper">
    <div class="invoice-card" id="invoice-card">
      
      <!-- Header -->
      <div class="header-section">
        <div class="brand-block">
          <img src="/assets/images/logo_final.webp" alt="Malenadu Roast Co." class="brand-logo" onerror="this.style.display='none'">
          <div class="brand-info">
            <h1>MALENADU ROAST CO.</h1>
            <p class="brand-tagline">Single-Estate Artisanal Roasters | Chikkamagaluru, Karnataka — 577101</p>
            <div class="brand-badges">
              <span class="badge badge-gst">GSTIN: 29BQJPY7539L1ZN (State 29)</span>
              <span class="badge badge-fssai">FSSAI: 21226177001500</span>
            </div>
          </div>
        </div>

        <div class="meta-block">
          <div class="badge-tax-inv">TAX INVOICE</div>
          <div class="inv-number">Invoice #: ${invoiceNumber}</div>
          <div class="inv-detail">Order #: <strong>${orderData.orderNumber}</strong></div>
          <div class="inv-detail">Date: ${orderDate}</div>
          <div>
            <span class="status-paid-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              PAID ONLINE (${orderData.paymentMethod || 'PREPAID'})
            </span>
          </div>
        </div>
      </div>

      <!-- Two-column Billing and Taxation Grid -->
      <div class="details-grid">
        <div>
          <div class="box-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            BILLED & SHIPPED TO:
          </div>
          <div class="cust-name">${orderData.shippingName}</div>
          <div class="box-text">
            ${orderData.shippingAddress}<br>
            ${orderData.pincode ? `PIN Code: <strong>${orderData.pincode}</strong><br>` : ''}
            ${orderData.shippingPhone ? `Phone: <strong>+91 ${orderData.shippingPhone}</strong><br>` : ''}
            ${orderData.shippingEmail ? `Email: ${orderData.shippingEmail}` : ''}
          </div>
        </div>

        <div>
          <div class="box-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            TAXATION & BUSINESS DATA:
          </div>
          <div class="box-text">
            Supplier GSTIN: <strong>29BQJPY7539L1ZN</strong><br>
            Statutory GST Rate: <strong>5.0% (${isInterstate ? 'IGST 5.0%' : 'CGST 2.5% + SGST 2.5%'})</strong><br>
            Place of Supply: <strong>${isInterstate ? 'Interstate (Outside Karnataka)' : 'Karnataka (29)'}</strong><br>
            Official Roastery: <strong>Chikkamagaluru, Karnataka</strong>
          </div>
        </div>
      </div>

      <!-- Line Items Table -->
      <div class="table-container">
        <table class="invoice-table">
          <thead>
            <tr>
              <th class="col-num">#</th>
              <th class="col-desc">DESCRIPTION OF GOODS</th>
              <th class="col-hsn">HSN/SAC</th>
              <th class="col-qty">QTY</th>
              <th class="col-price">RATE (INCL. GST)</th>
              <th class="col-taxable">TAXABLE VALUE</th>
              <th class="col-total">TOTAL (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
      </div>
      <div class="mobile-scroll-hint">👉 Swipe table horizontally to view full tax breakdown</div>

      <!-- Totals Summary Breakdown -->
      <div class="summary-section">
        <div class="summary-card">
          <div class="summary-row">
            <span>Gross Product Subtotal:</span>
            <strong>₹${itemsSubtotal.toFixed(2)}</strong>
          </div>
          <div class="summary-row">
            <span>Base Taxable Value (Excl. Tax):</span>
            <span>₹${taxableValue}</span>
          </div>

          ${isInterstate ? `
            <div class="summary-row">
              <span>Integrated GST (IGST @ 5.0%):</span>
              <span>₹${igst}</span>
            </div>
          ` : `
            <div class="summary-row">
              <span>Central GST (CGST @ 2.5%):</span>
              <span>₹${cgst}</span>
            </div>
            <div class="summary-row">
              <span>State GST (SGST @ 2.5%):</span>
              <span>₹${sgst}</span>
            </div>
          `}

          <div class="tax-box-row">
            <span>Total Statutory Tax (5.0% GST):</span>
            <span>₹${gstTotal} <span class="tax-tag">INCLUDED</span></span>
          </div>

          <div class="summary-row">
            <span>Shipping & Logistics:</span>
            <strong style="color: ${shippingFee > 0 ? '#92400E' : '#059669'};">
              ${shippingFee > 0 ? `₹${shippingFee.toFixed(2)}` : 'FREE (₹0.00)'}
            </strong>
          </div>

          <div class="grand-total-box">
            <span class="grand-title">Total Amount Payable (INR):</span>
            <span class="grand-amount">₹${grandTotal.toFixed(2)}</span>
          </div>

          <div class="statutory-note">
            * Statutory Note: All product catalogue prices are inclusive of applicable Goods and Services Tax (GST). Reverse charge is not applicable.
          </div>
        </div>
      </div>

      <!-- Footer & Authorized Signatory -->
      <div class="invoice-footer">
        <div class="legal-declaration">
          <div class="declaration-title">Official Tax Invoice Declaration</div>
          <div>
            Certified that all particulars are true and correct, and product prices indicated represent the actual transaction value. This is a computer-generated tax invoice issued in accordance with Section 31 of the Central Goods and Services Tax (CGST) Act, 2017.
          </div>
          <div style="margin-top: 6px; color: #475569; font-weight: 600;">
            Malenadu Roast Co. Roastery • Chikkamagaluru, Karnataka • malenaduroast@gmail.com
          </div>
        </div>

        <div class="signatory-box">
          <div class="signatory-company">MALENADU ROAST CO.</div>
          <div class="signatory-seal">OFFICIAL ESTATE SEAL</div>
          <div class="signatory-label">Authorized Signatory</div>
        </div>
      </div>

    </div>
  </div>

  <script>
    function downloadInvoicePDF() {
      const element = document.getElementById('invoice-card');
      const btn = document.getElementById('btn-download');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<span>⏳ Generating PDF...</span>';
      btn.disabled = true;

      const opt = {
        margin: [8, 8, 8, 8],
        filename: 'Malenadu_Roast_Co_Invoice_${invoiceNumber}.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save().then(function() {
          btn.innerHTML = '<span>✓ Saved to Downloads</span>';
          setTimeout(function() {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
          }, 2500);
        }).catch(function(err) {
          console.warn('html2pdf fallback to print:', err);
          window.print();
          btn.innerHTML = originalHtml;
          btn.disabled = false;
        });
      } else {
        window.print();
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
    }

    // Auto-trigger PDF download if query parameter ?download=1 is present
    if (window.location.search.indexOf('download=1') !== -1 || window.location.search.indexOf('download=true') !== -1) {
      window.addEventListener('load', function() {
        setTimeout(downloadInvoicePDF, 600);
      });
    }
  </script>
</body>
</html>`;

  return res.status(200).send(html);
}
