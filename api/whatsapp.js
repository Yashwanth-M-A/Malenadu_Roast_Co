// ====================================================================
// Malenadu Roast Co. — Automated WhatsApp Notification Engine
// Serverless endpoint for automated WhatsApp dispatch & webhook
// ====================================================================

import fs from 'fs';
import path from 'path';

// Auto-load/sync .env if running in Node / Vite dev server
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx > -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            process.env[key] = val;
          }
        }
      });
    }
  } catch(e) {}
}
loadEnv();

export default async function handler(req, res) {
  loadEnv();
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health / Status Check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'Malenadu Roast Co. Automated WhatsApp Engine',
      roasteryPhone: '918217623335',
      automatedChannels: {
        welcomeRegistration: 'Active',
        accountSecurityAlert: 'Active',
        recurringRoastAlerts: 'Active',
        packageTrackingUpdates: 'Admin Delegated'
      },
      configuredGateways: {
        metaCloudApi: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
        twilio: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
      }
    });
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const { phone, name, type, details, customMessage } = body;

      if (!phone) {
        return res.status(400).json({ error: 'Customer phone number is required.' });
      }

      // Clean phone number (strip spaces, symbols, ensure 91 for Indian numbers)
      let cleanPhone = String(phone).replace(/\D/g, '');
      if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
      }

      const customerName = (name || 'Valued Coffee Lover').trim();
      const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      // Generate message templates
      let message = customMessage || '';
      if (!message) {
        switch (type) {
          case 'welcome':
            message = `☕ *Welcome to Malenadu Roast Co.!*\n\nHello ${customerName}! 👋 Thank you for joining our coffee community from the hills of Chikkamagaluru.\n\n🌿 *Authentic Single-Estate Coffee & Spices:*\n• Single-estate, shade-grown Arabica & Robusta\n• Fresh batch-roasted to order in Chikkamagaluru\n• Pure, sun-dried Tellicherry bold black pepper\n• 100% Tax Compliant & FSSAI Certified\n\nExplore our fresh roasts and estate harvests:\n👉 https://malenaduroastco.works/#products\n\n_Reply to this chat anytime for brewing advice, grind selection, or custom orders!_`;
            break;

          case 'order_placed': {
            const orderNum = details?.orderNumber || 'MN-ORDER';
            const total = details?.totalAmount ? `₹${details.totalAmount}` : '';
            const address = details?.shippingAddress || '';
            const siteUrl = process.env.VITE_SITE_URL || 'https://malenaduroastco.works';
            const invoiceUrl = `${siteUrl}/api/invoice?order=${orderNum}`;

            let itemsList = '';
            if (Array.isArray(details?.items) && details.items.length > 0) {
              itemsList = details.items
                .map(it => {
                  const weightStr = (it.selectedWeight || it.weight) ? ` (${it.selectedWeight || it.weight})` : '';
                  const qty = it.qty || it.quantity || 1;
                  return `• *${it.name || it.title || 'Coffee Roast'}*${weightStr} × ${qty}`;
                })
                .join('\n');
            } else if (typeof details?.itemsSummary === 'string' && details.itemsSummary.trim()) {
              itemsList = details.itemsSummary;
            } else {
              itemsList = '• Authentic Single-Estate Roast Pack';
            }

            message = `☕ *Order Confirmed! | Malenadu Roast Co.*\n\n` +
              `Hello ${customerName}! 👋\n` +
              `Thank you for your order from our Chikkamagaluru estate. Your order is confirmed and queued for fresh roasting!\n\n` +
              `📦 *Order ID:* #${orderNum}\n` +
              `💰 *Total Amount:* ${total} (Paid Online)\n\n` +
              `🛒 *Items Ordered:*\n${itemsList}\n\n` +
              (address ? `📍 *Delivery Address:*\n${address}\n\n` : '') +
              `🚚 *Delivery:* Your order will arrive in 2–4 business days with live tracking updates.\n\n` +
              `📄 *Download Official GST Tax Invoice:* 👇\n${invoiceUrl}\n\n` +
              `_Need any help with your order? Reply directly to this WhatsApp chat!_\n\n` +
              `*Malenadu Roast Co.* — Straight From the Estate to Your Cup.`;
            break;
          }

          case 'recurring_roast_alert':
          case 'harvest_drop':
            message = `🌿 *Fresh Estate Roast Batch & Harvest Alert | Malenadu Roast Co.*\n\nHello ${customerName}! ☕\nOur master roasters have just completed this week's fresh small-batch roast in Chikkamagaluru:\n• *Estate Reserve Filter Coffee* (70:30, 80:20 & 85:15 blends)\n• *Tellicherry Bold Black Pepper* (Handpicked, Sun-dried)\n\nFreshly roasted in Chikkamagaluru and shipping pan-India.\nOrder your fresh harvest with priority shipping:\n👉 https://malenaduroastco.works/#products\n\n_Malenadu Roast Co. — Straight From the Estate to Your Cup._`;
            break;

          default:
            message = `☕ *Malenadu Roast Co.*: Hello ${customerName}, thank you for connecting with us! Visit https://malenaduroastco.works for authentic estate roasts.`;
            break;
        }
      }

      // Check if Meta WhatsApp Cloud API credentials are configured in .env
      const metaToken = process.env.WHATSAPP_TOKEN || process.env.META_WHATSAPP_TOKEN;
      const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;

      let apiDispatchResult = null;

      if (metaToken && metaPhoneId) {
        try {
          const fbRes = await fetch(`https://graph.facebook.com/v22.0/${metaPhoneId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${metaToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: cleanPhone,
              type: 'text',
              text: { body: message }
            })
          });
          apiDispatchResult = await fbRes.json();

          // If Meta requires an approved template for initial message (outside 24-hr window)
          if (apiDispatchResult && apiDispatchResult.error && (apiDispatchResult.error.code === 131047 || apiDispatchResult.error.code === 131026)) {
            console.log('Outside 24h window; falling back to approved Meta notification template...');
            const templateRes = await fetch(`https://graph.facebook.com/v22.0/${metaPhoneId}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${metaToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: cleanPhone,
                type: 'template',
                template: {
                  name: 'hello_world',
                  language: { code: 'en_US' }
                }
              })
            });
            apiDispatchResult = await templateRes.json();
          }
        } catch (apiErr) {
          console.error('Meta Cloud API error:', apiErr);
        }
      }

      // Check if Twilio WhatsApp credentials are configured
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
      if (!apiDispatchResult && twilioSid && twilioAuth) {
        try {
          const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
          const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
          const params = new URLSearchParams();
          params.append('From', fromNumber);
          params.append('To', `whatsapp:+${cleanPhone}`);
          params.append('Body', message);

          const twRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
          });
          apiDispatchResult = await twRes.json();
        } catch (twErr) {
          console.error('Twilio WhatsApp error:', twErr);
        }
      }

      // Check if UltraMsg (QR-Code WhatsApp Web Gateway) credentials are configured
      const ultraInstance = process.env.ULTRAMSG_INSTANCE_ID;
      const ultraToken = process.env.ULTRAMSG_TOKEN;
      if (!apiDispatchResult && ultraInstance && ultraToken) {
        try {
          const params = new URLSearchParams();
          params.append('token', ultraToken);
          params.append('to', `+${cleanPhone}`);
          params.append('body', message);

          const ultraRes = await fetch(`https://api.ultramsg.com/${ultraInstance}/messages/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
          });
          apiDispatchResult = await ultraRes.json();
        } catch (uErr) {
          console.error('UltraMsg WhatsApp error:', uErr);
        }
      }

      const hasGatewayConfigured = Boolean(
        (metaToken && metaPhoneId) || 
        (twilioSid && twilioAuth) || 
        (ultraInstance && ultraToken)
      );

      // Generate direct WhatsApp link for instant client-side trigger
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

      return res.status(200).json({
        success: true,
        type: type || 'custom',
        recipient: {
          name: customerName,
          phone: cleanPhone
        },
        message,
        waUrl,
        apiDispatched: Boolean(apiDispatchResult && !apiDispatchResult.error),
        gatewayConfigured: hasGatewayConfigured,
        dispatchDetails: apiDispatchResult,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error('Automated WhatsApp dispatch error:', err);
      return res.status(500).json({ error: err.message || 'Internal error dispatching WhatsApp alert' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

