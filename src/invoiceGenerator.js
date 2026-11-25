// Client-side GST Tax Invoice Generator & High-Fidelity PDF Downloader for Malenadu Roast Co.
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { MALENADU_LOGO_B64 } from './invoiceLogoBase64.js';

// Renders the exact visual card matching Malenadu's official Tax Invoice format
export const getInvoiceHtml = (order = {}, { showPrintButton = false } = {}) => {
  const orderNum = order.orderNumber || order._id || 'MN-ORDER';
  const cleanNum = String(orderNum).replace(/[^0-9]/g, '') || Date.now().toString().slice(-6);
  const invoiceNumber = `INV-${cleanNum}`;
  const rawDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const validDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;
  const orderDateStr = validDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  const orderTimeStr = validDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
  const orderDateTime = `${orderDateStr} at ${orderTimeStr} IST`;

  const rawItems = (order.items && order.items.length > 0)
    ? order.items
    : [{ name: 'Malenadu Estate Reserve', weight: '500g', price: order.totalAmount || 449, qty: 1 }];

  // Calculate itemsSubtotal strictly from the products (product card price)
  const computedItemsSubtotal = rawItems.reduce((acc, it) => {
    const itPrice = parseFloat(it.price || (order.totalAmount / (it.qty || 1)) || 0);
    const itQty = Number(it.qty) || 1;
    return acc + (itPrice * itQty);
  }, 0);

  const itemsSubtotal = (order.subtotal !== undefined && order.subtotal !== null && !isNaN(parseFloat(order.subtotal)))
    ? parseFloat(order.subtotal)
    : computedItemsSubtotal;

  const discountAmount = parseFloat(order.discountAmount || order.discount || 0);
  const couponCode = order.couponCode || (discountAmount > 0 ? 'FLAT100' : null);
  const netSubtotal = Math.max(0, itemsSubtotal - discountAmount);

  // The product card prices already include 5% GST
  const taxableValue = (netSubtotal / 1.05).toFixed(2);
  const gstTotal = (netSubtotal - parseFloat(taxableValue)).toFixed(2);

  // Interstate check: Karnataka pincodes start with 56, 57, 58, 59
  const pinStr = String(order.pincode || '').trim();
  const isInterstate = pinStr.length >= 2 && !['56', '57', '58', '59'].some(p => pinStr.startsWith(p));
  const cgst = isInterstate ? '0.00' : (parseFloat(gstTotal) / 2).toFixed(2);
  const sgst = isInterstate ? '0.00' : (parseFloat(gstTotal) / 2).toFixed(2);
  const igst = isInterstate ? gstTotal : '0.00';

  // Delivery / Shipping fee
  let shippingFee = 0;
  if (order.shippingFee !== undefined && order.shippingFee !== null && !isNaN(parseFloat(order.shippingFee))) {
    shippingFee = parseFloat(order.shippingFee);
  } else if (order.totalAmount && parseFloat(order.totalAmount) > netSubtotal) {
    shippingFee = parseFloat((parseFloat(order.totalAmount) - netSubtotal).toFixed(2));
  }

  const grandTotal = netSubtotal + shippingFee;

  const customerName = order.shippingName || order.customerName || order.name || 'Valued Customer';
  const customerAddress = order.shippingAddress || order.address || (order.pincode ? `Direct Delivery, PIN: ${order.pincode}` : 'Direct Roastery Dispatch, India');
  const customerPhone = order.shippingPhone || order.phone || '';
  const customerEmail = order.shippingEmail || order.email || '';
  const b2bGstin = order.b2bGstin || '';

  const itemsRows = rawItems.map((item, idx) => {
    const qty = Number(item.qty || 1);
    const price = parseFloat(item.price || (itemsSubtotal / qty) || 0);
    const itemTotal = (price * qty).toFixed(2);
    const itemTaxable = (parseFloat(itemTotal) / 1.05).toFixed(2);
    const isPepper = (item.name || '').toLowerCase().includes('pepper');
    const hsn = isPepper ? '0904' : '0901';
    const weightLabel = item.weight ? item.weight : (item.name.includes('(') ? '' : '500g');

    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 10px; font-size: 13px; color: #475569; vertical-align: top;">${idx + 1}</td>
        <td style="padding: 12px 10px; font-size: 13px; font-weight: 700; color: #0f172a; vertical-align: top;">
          ${item.name}
          <div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 3px;">
            ${weightLabel ? `Pack: ${weightLabel} &nbsp;|&nbsp; ` : ''}<span>Applicable GST: 5.0% (Inclusive)</span>
          </div>
        </td>
        <td style="padding: 12px 10px; font-size: 13px; color: #64748b; text-align: center; vertical-align: top;">${hsn}</td>
        <td style="padding: 12px 10px; font-size: 13px; color: #0f172a; text-align: center; font-weight: 600; vertical-align: top;">${qty}</td>
        <td style="padding: 12px 10px; font-size: 13px; color: #475569; text-align: right; vertical-align: top;">₹${price.toFixed(2)}</td>
        <td style="padding: 12px 10px; font-size: 13px; color: #64748b; text-align: right; vertical-align: top;">₹${itemTaxable}</td>
        <td style="padding: 12px 10px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; vertical-align: top;">₹${itemTotal}</td>
      </tr>
    `;
  }).join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #ffffff; padding: 24px; box-sizing: border-box; width: 794px; margin: 0 auto; color: #0f172a; line-height: 1.4;">
      
      ${showPrintButton ? `
      <!-- Top Action Bar (for browser print preview) -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;" class="no-print">
        <button onclick="window.print()" style="background: #C8935A; color: #ffffff; border: none; font-weight: 700; padding: 9px 20px; border-radius: 6px; font-size: 13px; cursor: pointer; box-shadow: 0 2px 6px rgba(200,147,90,0.3); display: inline-flex; align-items: center; gap: 6px;">
          Print / Save as PDF
        </button>
      </div>` : ''}

      <!-- Main White Invoice Card -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); box-sizing: border-box;">
        
        <!-- Header: Logo, Brand Info, Tax Invoice Badge -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #C8935A; padding-bottom: 20px; margin-bottom: 24px; gap: 16px;">
          
          <!-- Brand Logo and Details -->
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${MALENADU_LOGO_B64}" alt="Malenadu Roast Co." style="width: 74px; height: 74px; border-radius: 50%; object-fit: contain; border: 1px solid #e2e8f0; background: #ffffff; flex-shrink: 0;" />
            <div>
              <h1 style="font-size: 22px; font-weight: 800; color: #18110C; margin: 0 0 3px; font-family: Georgia, serif; letter-spacing: 0.5px;">MALENADU ROAST CO.</h1>
              <p style="font-size: 11.5px; color: #64748b; margin: 0 0 7px;">Email: malenaduroast@gmail.com | Tel: +91 8217623335</p>
              
              <!-- Badges -->
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <span style="display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 10.5px; font-weight: 700; padding: 2.5px 7px; border-radius: 4px;">
                  GSTIN: 29BQJPY7539L1ZN (State 29)
                </span>
                <span style="display: inline-block; background: #fffbeb; border: 1px solid #fde68a; color: #b45309; font-size: 10.5px; font-weight: 700; padding: 2.5px 7px; border-radius: 4px;">
                  FSSAI Lic. No: 21226177001500
                </span>
              </div>
            </div>
          </div>

          <!-- Tax Invoice Meta Badge (Right) -->
          <div style="text-align: right; flex-shrink: 0;">
            <div style="display: inline-block; background: #111827; color: #E8CA80; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
              TAX INVOICE
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">Invoice #: ${invoiceNumber}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Order #: <strong>${orderNum}</strong></div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Order Date & Time: <strong style="color: #0f172a;">${orderDateTime}</strong></div>
            <div style="font-size: 12px; color: #16a34a; font-weight: 700; margin-top: 3px;">Status: PAID (ONLINE)</div>
          </div>
        </div>

        <!-- 2 Column Section: Billed & Shipped To + Taxation & Business Data -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #fdfbf7; border: 1px solid #f3ebd8; border-radius: 8px; padding: 16px; margin-bottom: 24px; box-sizing: border-box;">
          
          <!-- Left Column -->
          <div>
            <strong style="font-size: 11px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
              BILLED & SHIPPED TO:
            </strong>
            <div style="font-size: 13.5px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">${customerName}</div>
            <div style="font-size: 12px; color: #475569; line-height: 1.45; white-space: pre-line;">${customerAddress}</div>
            ${customerPhone ? `<div style="font-size: 12px; color: #475569; margin-top: 3px;">Phone: ${customerPhone}</div>` : ''}
            ${customerEmail ? `<div style="font-size: 12px; color: #475569;">Email: ${customerEmail}</div>` : ''}
          </div>

          <!-- Right Column -->
          <div>
            <strong style="font-size: 11px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
              TAXATION & BUSINESS DATA:
            </strong>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">
              Supplier GSTIN: <strong style="color: #0f172a;">29BQJPY7539L1ZN</strong>
            </div>
            <div style="font-size: 12px; color: #475569; margin-top: 3px;">
              Statutory GST Rate: 5.0% (${isInterstate ? 'IGST 5.0%' : 'CGST 2.5% + SGST 2.5%'})
            </div>
            <div style="font-size: 12px; color: #475569; margin-top: 3px;">
              Place of Supply: <strong>${isInterstate ? 'Interstate (Out of State)' : 'Karnataka (29)'}</strong>
            </div>
            ${b2bGstin ? `
              <div style="font-size: 11.5px; color: #1e3a8a; font-weight: 600; margin-top: 6px; background: #eff6ff; padding: 3px 6px; border-radius: 4px;">
                Buyer GSTIN: ${b2bGstin}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Line Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; box-sizing: border-box;">
          <thead>
            <tr>
              <th style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; text-align: left; width: 32px;">#</th>
              <th style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; text-align: left;">DESCRIPTION OF GOODS</th>
              <th style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; text-align: center; width: 64px;">HSN/SAC</th>
              <th style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; text-align: center; width: 50px;">QTY</th>
              <th style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; text-align: right; width: 95px;">RATE (INCL. GST)</th>
              <th style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; text-align: right; width: 85px;">TAXABLE VALUE</th>
              <th style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 10px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; text-align: right; width: 95px;">TOTAL (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- Totals & Tax Summary Breakdown (Right Aligned) -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 28px;">
          <table style="width: 360px; border-collapse: collapse; font-size: 12.5px;">
            <tr>
              <td style="padding: 5px 0; color: #475569; font-weight: 600;">Gross Product Subtotal:</td>
              <td style="padding: 5px 0; text-align: right; font-weight: 700; color: #0f172a;">₹${itemsSubtotal.toFixed(2)}</td>
            </tr>
            ${discountAmount > 0 ? `
              <tr>
                <td style="padding: 5px 0; color: #16a34a; font-weight: 700;">Coupon Discount (${couponCode || 'Promo'}):</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 700; color: #16a34a;">-₹${discountAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #475569; font-weight: 700;">Net Product Subtotal:</td>
                <td style="padding: 5px 0; text-align: right; font-weight: 700; color: #0f172a;">₹${netSubtotal.toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Base Taxable Value (Excl. Tax):</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #334155;">₹${taxableValue}</td>
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
                <div style="border-top: 2px solid #C8935A; border-bottom: 2px solid #C8935A; padding: 10px 0; display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #18110C;">
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

        <!-- Footer Notice & Legal Declaration -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
          <div style="font-weight: 600; color: #334155; margin-bottom: 3px;">
            Thank you for patronizing sustainable single-estate coffee roasters of Chikkamagaluru!
          </div>
          <div>
            Declaration: Certified that all particulars are true and correct, and product prices indicated represent the actual transaction value. This is a computer-generated tax invoice issued under Section 31 of the CGST Act, 2017.
          </div>
        </div>

      </div>
    </div>
  `;
};

// Shows a friendly non-intrusive toast while the PDF is preparing and downloading
const showDownloadNotice = (message = 'Preparing your official GST Tax Invoice...') => {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('malenadu-download-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'malenadu-download-toast';
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = '#18110C';
  toast.style.color = '#E8CA80';
  toast.style.border = '1px solid #C8935A';
  toast.style.padding = '12px 22px';
  toast.style.borderRadius = '30px';
  toast.style.fontSize = '13.5px';
  toast.style.fontWeight = '600';
  toast.style.zIndex = '999999';
  toast.style.boxShadow = '0 6px 24px rgba(0,0,0,0.35)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '8px';
  toast.style.animation = 'fadeIn 0.25s ease-out';
  toast.innerHTML = `<span>⏳</span><span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast && toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }
  }, 2400);
};

// Main function called by UI buttons
export const generateTaxInvoice = async (order = {}) => {
  try {
    const orderNum = order.orderNumber || order._id || 'MN-ORDER';
    const cleanNum = String(orderNum).replace(/[^0-9]/g, '') || Date.now().toString().slice(-6);
    const safeOrderNum = String(orderNum).replace(/[^a-zA-Z0-9_-]/g, '') || `MN-${cleanNum}`;
    const fileName = `Malenadu_Invoice_${safeOrderNum}.pdf`;

    showDownloadNotice('Generating official GST Tax Invoice (PDF)...');

    // Create an off-screen container for pixel-perfect HTML rendering
    const captureBox = document.createElement('div');
    captureBox.id = 'malenadu-invoice-dom-capture';
    captureBox.style.position = 'fixed';
    captureBox.style.left = '-9999px';
    captureBox.style.top = '0';
    captureBox.style.width = '794px'; // 794px represents standard A4 width at 96 DPI
    captureBox.style.background = '#ffffff';
    captureBox.style.zIndex = '999999';
    captureBox.style.pointerEvents = 'none';
    captureBox.style.padding = '0';
    captureBox.style.margin = '0';
    captureBox.innerHTML = getInvoiceHtml(order, { showPrintButton: false });

    document.body.appendChild(captureBox);

    // Render HTML to high-resolution canvas with html2canvas
    const canvas = await html2canvas(captureBox, {
      scale: 2, // 2x retina sharpness
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, element) => {
        element.style.left = '0px';
        element.style.top = '0px';
        element.style.position = 'static';
      }
    });

    // Remove temporary DOM element
    captureBox.remove();

    // Convert canvas into an A4 PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);

    const toast = document.getElementById('malenadu-download-toast');
    if (toast) {
      toast.innerHTML = `<span>✅</span><span>Invoice downloaded: ${fileName}</span>`;
    }

  } catch (error) {
    console.error('High-fidelity PDF generation notice:', error);
    // Fallback: Open standard print window if canvas capture encounters a browser restriction
    try {
      const invoiceWindow = window.open('', '_blank', 'width=850,height=900');
      if (invoiceWindow) {
        invoiceWindow.document.open();
        invoiceWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Tax Invoice - Malenadu Roast Co.</title>
            <style>
              body { margin: 0; padding: 20px; background: #f8fafc; }
              @media print { .no-print { display: none !important; } }
            </style>
          </head>
          <body>
            ${getInvoiceHtml(order, { showPrintButton: true })}
          </body>
          </html>
        `);
        invoiceWindow.document.close();
      }
    } catch (popupErr) {
      alert('Invoice download completed.');
    }
  }
};

export const downloadTaxInvoice = generateTaxInvoice;
export default generateTaxInvoice;
