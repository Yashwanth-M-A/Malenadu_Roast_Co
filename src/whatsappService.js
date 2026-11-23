// ====================================================================
// Malenadu Roast Co. — WhatsApp Automation Engine & Dispatch Service
// Automated customer notifications for:
// 1. Account registration welcome
// 2. Account sign-in alerts
// 3. Regular roastery batch & fresh harvest drops
// ====================================================================

const LOGS_KEY = 'malenadu_automated_whatsapp_logs';
const SUBSCRIBERS_KEY = 'malenadu_whatsapp_subscribers';
const ROASTERY_OFFICIAL_PHONE = '918217623335';

/**
 * Format Indian phone number into international WhatsApp standard
 * e.g. "9876543210" -> "919876543210"
 * "+91 98765-43210" -> "919876543210"
 */
export const formatWhatsAppPhone = (rawPhone) => {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 10) {
    return '91' + digits;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
};

/**
 * Validate standard 10-digit Indian mobile number
 */
export const isValidIndianPhone = (rawPhone) => {
  if (!rawPhone) return false;
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(digits.slice(2));
  }
  return false;
};

/**
 * Pre-composed, branded roastery messages for automated customer communication
 */
export const getAutomatedWhatsAppMessage = (type, params = {}) => {
  const name = (params.name || 'Valued Customer').trim();
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  switch (type) {
    case 'welcome':
      return `*Welcome to Malenadu Roast Co.*\n\nDear ${name},\n\nThank you for creating an account with Malenadu Roast Co. We are delighted to share our artisanal, shade-grown single-estate coffee and Tellicherry spices from Chikkamagaluru.\n\n*Our Commitments:*\n• Single-estate, shade-grown harvests\n• Batch-roasted to order in Chikkamagaluru\n• Pan-India tracked dispatch\n• 100% Tax Compliant & FSSAI Certified\n\nBrowse fresh roasts & harvests:\nhttps://malenaduroastco.works/#products\n\nWarm regards,\n*Malenadu Roast Co.* | Chikkamagaluru, Karnataka`;

    case 'order_placed': {
      const orderNum = params.orderNumber || 'MN-ORDER';
      const total = params.totalAmount ? `₹${params.totalAmount}` : '';
      const address = params.shippingAddress || '';
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://malenaduroastco.works';
      const invoiceUrl = `${origin}/api/invoice?order=${orderNum}`;

      let itemsList = '';
      let reviewSection = '';
      if (Array.isArray(params.items) && params.items.length > 0) {
        itemsList = params.items
          .map(it => {
            const weightStr = (it.selectedWeight || it.weight) ? ` (${it.selectedWeight || it.weight})` : '';
            const qty = it.qty || it.quantity || 1;
            return `• *${it.name || it.title || 'Coffee Roast'}*${weightStr} × ${qty}`;
          })
          .join('\n');

        const reviewLinks = params.items.map(it => {
          const pName = it.name || it.title || 'Coffee Roast';
          const pUrl = `${origin}/?rateProduct=${encodeURIComponent(pName)}&order=${encodeURIComponent(orderNum)}`;
          return `⭐ *Rate & Review ${pName}:*\n👉 ${pUrl}`;
        }).join('\n\n');

        reviewSection = `*Rate & Review Your Purchased Product:*\n` +
          `Your feedback helps us maintain our artisanal single-estate roast quality. Click below to share your verified review & star rating:\n\n` +
          `${reviewLinks}\n\n`;
      } else if (typeof params.itemsSummary === 'string' && params.itemsSummary.trim()) {
        itemsList = params.itemsSummary;
        const defaultUrl = `${origin}/?rateProduct=Malenadu%20Estate%20Reserve&order=${encodeURIComponent(orderNum)}`;
        reviewSection = `*Rate & Review Your Purchased Coffee:*\n👉 ${defaultUrl}\n\n`;
      } else {
        itemsList = '• Authentic Single-Estate Roast Pack';
        const defaultUrl = `${origin}/?rateProduct=Malenadu%20Estate%20Reserve&order=${encodeURIComponent(orderNum)}`;
        reviewSection = `*Rate & Review Your Purchased Coffee:*\n👉 ${defaultUrl}\n\n`;
      }

      return `☕ *Order Confirmed! | Malenadu Roast Co.*\n\n` +
        `Hello ${name}! 👋\n` +
        `Thank you for your order from our Chikkamagaluru estate. Your order is confirmed and queued for fresh batch-roasting!\n\n` +
        `📦 *Order ID:* #${orderNum}\n` +
        `💰 *Total Amount:* ${total} (Paid Online)\n\n` +
        `🛒 *Items Ordered:*\n${itemsList}\n\n` +
        (address ? `📍 *Shipping Address:*\n${address}\n\n` : '') +
        `🚚 *Courier & Delivery:* Pan-India express delivery within 2–4 business days with tracking updates.\n\n` +
        `📄 *Download Official GST Tax Invoice:* 👇\n${invoiceUrl}\n\n` +
        reviewSection +
        `_Need to customize grind size or delivery timing? Reply directly to this WhatsApp chat!_\n\n` +
        `*Malenadu Roast Co.* — Straight From the Estate to Your Cup.`;
    }

    case 'login':
      return `☕ *Malenadu Roast Co. Account Alert*\n\nHello ${name}! A secure sign-in to your account was recorded at ${time} on ${date}.\n\nIf this was you, you're all set! If you did not authorize this, please contact roastery support immediately at +91 8217623335.\n\nHappy brewing! ☕`;

    case 'recurring_roast_alert':
    case 'harvest_drop':
      return `🌿 *Fresh Estate Roast Batch & Harvest Alert | Malenadu Roast Co.*\n\nHello ${name}! ☕\nOur master roasters have just completed this week's fresh small-batch roast in Chikkamagaluru:\n• *Estate Reserve Filter Coffee* (70:30, 80:20 & 85:15 blends)\n• *Tellicherry Bold Black Pepper* (Handpicked, Sun-dried)\n\nFreshly roasted in Chikkamagaluru and shipping pan-India.\nOrder your fresh harvest with priority shipping:\n👉 https://malenaduroastco.works/#products\n\n_Malenadu Roast Co. — Straight From the Estate to Your Cup._`;

    case 'catalog_request':
      return `☕ *Malenadu Roast Co. — 2026 Estate Catalog*\n\nHello ${name}! Here is your requested 2026 Estate Coffee & Spice Catalog:\n👉 https://malenaduroastco.works\n\nInside: Single-origin Arabica, imperial filter blends, Tellicherry pepper, and cafe wholesale rates. Enjoy!`;

    default:
      return `☕ *Malenadu Roast Co.*: Hello ${name}, greetings from Chikkamagaluru!`;
  }
};

/**
 * Retrieve automated dispatch logs from localStorage
 */
export const getAutomatedWhatsAppLogs = () => {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading automated WhatsApp logs:', err);
    return [];
  }
};

/**
 * Record an automated dispatch in local history
 */
const saveAutomatedLog = (logEntry) => {
  try {
    const logs = getAutomatedWhatsAppLogs();
    logs.unshift({
      id: 'wa_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      ...logEntry,
      timestamp: new Date().toISOString()
    });
    // Keep last 100 entries
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (err) {
    console.error('Error saving automated WhatsApp log:', err);
  }
};

/**
 * Dispatch an automated customer WhatsApp notification
 * Handles:
 * 1. Serverless API call to /api/whatsapp (with Meta Cloud API fallback)
 * 2. Pre-filled WhatsApp web dispatch link
 * 3. Logging into automated activity stream
 * 4. Client auto-trigger or manual trigger return
 */
export const triggerAutomatedWhatsApp = async ({
  phone,
  name,
  type = 'welcome',
  details = {},
  autoOpen = true
}) => {
  const cleanPhone = formatWhatsAppPhone(phone);
  const message = getAutomatedWhatsAppMessage(type, { name, ...details });
  const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone || ROASTERY_OFFICIAL_PHONE}&text=${encodeURIComponent(message)}`;

  let apiDispatched = false;
  let gatewayConfigured = false;
  let metaError = null;

  // Attempt serverless dispatch to /api/whatsapp
  try {
    const apiRes = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanPhone,
        name,
        type,
        customMessage: message,
        details
      })
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      apiDispatched = Boolean(data.apiDispatched);
      gatewayConfigured = Boolean(data.gatewayConfigured);
      if (data.dispatchDetails?.error) {
        metaError = data.dispatchDetails.error;
        console.warn('Meta WhatsApp API Notice:', metaError.message, 'Code:', metaError.code);
      }
    }
  } catch (e) {
    console.warn('Backend WhatsApp webhook notice:', e.message);
  }

  // Derive precise status for admin transparency
  let logStatus = 'Automated Link Ready';
  if (apiDispatched) {
    logStatus = 'Delivered via WhatsApp Cloud Gateway';
  } else if (metaError) {
    if (metaError.code === 190) {
      logStatus = 'Meta Error: Access Token Expired (code 190)';
    } else if (metaError.code === 131030) {
      logStatus = 'Meta Test Mode: Recipient not in allowed list (code 131030)';
    } else {
      logStatus = `Meta Notice: ${metaError.message || 'API error'}`;
    }
  } else if (gatewayConfigured) {
    logStatus = 'Gateway Pending';
  }

  // Log to local history immediately
  saveAutomatedLog({
    type,
    recipientName: name || 'Valued Customer',
    phone: cleanPhone || phone || 'Not provided',
    message,
    waUrl,
    status: logStatus
  });

  // Auto-launch WhatsApp if requested or if server gateway did not dispatch
  if ((autoOpen || !apiDispatched) && typeof window !== 'undefined') {
    try {
      const win = window.open(waUrl, '_blank');
      if (!win) {
        // Pop-up was blocked by browser
        console.info('WhatsApp pop-up was blocked by browser; returning waUrl for 1-tap activation');
      }
    } catch (e) {
      console.warn('Popup blocked:', e);
    }
  }

  // Notify any active app components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('malenadu:whatsapp_automated_sent', {
      detail: { type, name, phone: cleanPhone, message, waUrl, apiDispatched, gatewayConfigured }
    }));
  }

  return {
    success: true,
    cleanPhone,
    message,
    waUrl,
    apiDispatched,
    gatewayConfigured
  };
};

/**
 * Subscribe customer to recurring WhatsApp roastery drops & weekly alerts
 */
export const subscribeToWhatsAppAlerts = async (rawPhone, rawName) => {
  const cleanPhone = formatWhatsAppPhone(rawPhone);
  const name = (rawName || 'Coffee Lover').trim();

  try {
    const raw = localStorage.getItem(SUBSCRIBERS_KEY);
    const subscribers = raw ? JSON.parse(raw) : [];
    
    // Check if already subscribed
    const existing = subscribers.find(s => s.phone === cleanPhone);
    if (!existing) {
      subscribers.push({
        name,
        phone: cleanPhone,
        subscribedAt: new Date().toISOString(),
        active: true
      });
      localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers));
    }

    // Trigger instant welcome/confirmation WhatsApp
    const result = await triggerAutomatedWhatsApp({
      phone: cleanPhone,
      name,
      type: 'recurring_roast_alert',
      autoOpen: false
    });

    return {
      success: true,
      message: 'Subscribed to Malenadu Roastery WhatsApp alerts!',
      waUrl: result.waUrl
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Get all registered WhatsApp subscribers
 */
export const getWhatsAppSubscribers = () => {
  try {
    const raw = localStorage.getItem(SUBSCRIBERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Broadcast fresh roast update to all registered customers and subscribers
 * Dispatched automatically by the system (No manual 1-by-1 sending required by admin)
 */
export const broadcastAutomatedRoastUpdate = async () => {
  // Collect all unique phones from both users and subscribers
  const phonesMap = new Map();

  try {
    const users = JSON.parse(localStorage.getItem('malenadu_users_db') || '[]');
    users.forEach(u => {
      if (u.phone && isValidIndianPhone(u.phone)) {
        phonesMap.set(formatWhatsAppPhone(u.phone), u.name || 'Valued Customer');
      }
    });

    const subscribers = getWhatsAppSubscribers();
    subscribers.forEach(s => {
      if (s.phone) {
        phonesMap.set(s.phone, s.name || 'Coffee Lover');
      }
    });
  } catch (e) {
    console.error('Error fetching broadcast recipients:', e);
  }

  const dispatched = [];
  for (const [phone, name] of phonesMap.entries()) {
    const res = await triggerAutomatedWhatsApp({
      phone,
      name,
      type: 'recurring_roast_alert',
      autoOpen: false
    });
    dispatched.push({ phone, name, waUrl: res.waUrl });
  }

  return {
    success: true,
    count: dispatched.length,
    dispatched
  };
};

/**
 * Dispatch automated Order Placed confirmation to customer via WhatsApp
 * Automatically invoked when customer completes checkout
 */
export const sendOrderPlacedWhatsApp = async (orderData, autoOpen = true) => {
  return await triggerAutomatedWhatsApp({
    phone: orderData.shippingPhone || orderData.phone,
    name: orderData.shippingName || orderData.name,
    type: 'order_placed',
    details: {
      orderNumber: orderData.orderNumber,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      shippingAddress: orderData.shippingAddress,
      items: orderData.items
    },
    autoOpen
  });
};


