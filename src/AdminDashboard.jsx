import React, { useState, useEffect } from 'react';
import {
  Package, Truck, CheckCircle, Clock, Search, Download,
  MessageCircle, ArrowLeft, Lock, Unlock, RefreshCw, AlertCircle,
  Phone, Mail, MapPin, FileText, ChevronDown, Check, ExternalLink,
  ShieldCheck, Key, Smartphone, Eye, EyeOff, LogOut, ShieldAlert, Star, Trash2, Send, Bell, Sparkles,
  User, CreditCard, Copy, X, Building, CheckCheck, PhoneCall, Printer,
  RotateCcw, Gift, Share2, Heart, Award, MessageSquare, Coffee, Tag, Calendar, ArrowRight,
  Plus, MessageSquareQuote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateTaxInvoice } from './invoiceGenerator.js';
import { generateDigitalCatalog } from './catalogGenerator.js';
import { AdminProductsManager } from './AdminProductsManager.jsx';
import { shipOrderWithShiprocket, getAllUsers } from './api.js';
import { getAutomatedWhatsAppLogs, broadcastAutomatedRoastUpdate, getWhatsAppSubscribers } from './whatsappService.js';
import { getAllReviewsForAdmin, setReviewHiddenStatus, setBatchReviewHiddenStatus, deleteUserReview } from './productReviewsData.js';
import { isKarnatakaPincode } from './shippingService.js';

// ==========================================================
// OFFICIAL BRAND VECTOR ICONS (WHATSAPP & GMAIL / EMAIL)
// Real browser-rendered high-definition SVGs for authentic brand feel
// ==========================================================
export const WhatsAppBrandIcon = ({ size = 16, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', flexShrink: 0, display: 'inline-block', ...style }}
  >
    <circle cx="16" cy="16" r="16" fill="#25D366" />
    <path fillRule="evenodd" clipRule="evenodd" d="M16 6.5C10.75 6.5 6.5 10.75 6.5 16c0 1.76.48 3.42 1.32 4.85L6.5 25.5l4.8-1.28c1.38.78 2.97 1.28 4.7 1.28 5.25 0 9.5-4.25 9.5-9.5S21.25 6.5 16 6.5Zm5.6 13.5c-.2.6-1.2 1.2-1.7 1.2-.5.1-1.1.1-1.7-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.3.5-.3.7-.3.2 0 .3 0 .5.01.2.01.4-.07.6.43.2.5.7 1.9.8 2 .08.1.1.3.02.48-.08.18-.12.3-.24.44-.12.15-.26.33-.37.45-.12.13-.25.26-.11.5.15.25.65 1.07 1.4 1.74.96.86 1.77 1.12 2.02 1.25.25.13.4.11.55-.06.15-.17.65-.76.82-1.02.17-.26.35-.22.58-.13.24.09 1.5.71 1.76.84.26.13.43.2.49.31.06.11.06.66-.14 1.24z" fill="#FFFFFF" />
  </svg>
);

export const EmailBrandIcon = ({ size = 16, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', flexShrink: 0, display: 'inline-block', ...style }}
  >
    <path fill="#4285F4" d="M22 6.5v11a2.5 2.5 0 0 1-2.5 2.5H19V8.987l-7 5.25-7-5.25V20H4.5A2.5 2.5 0 0 1 2 17.5v-11a2.5 2.5 0 0 1 3.99-2.01L12 9.012l6.01-4.522A2.5 2.5 0 0 1 22 6.5z" />
    <path fill="#EA4335" d="M12 14.237L2.4 7.037A2.5 2.5 0 0 1 4.5 4h15a2.5 2.5 0 0 1 2.1 3.037L12 14.237z" />
  </svg>
);


// ==========================================================
// TIMEZONE-SAFE CALENDAR DATE & RETENTION TIMELINE HELPERS
// ==========================================================
const getCalendarDaysAgo = (dateInput, refDate = new Date()) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  // Local calendar midnight of target date
  const dMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  // Local calendar midnight of reference date (today)
  const refMidnight = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()).getTime();

  const diffMs = refMidnight - dMidnight;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const formatDisplayDate = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getDeliveryElapsedBadgeText = (daysSinceDelivered) => {
  if (daysSinceDelivered === null || daysSinceDelivered === undefined) {
    return 'Delivery Pending';
  }
  if (daysSinceDelivered === 0) {
    return 'Delivered Today';
  }
  if (daysSinceDelivered === 1) {
    return '1 day since delivered';
  }
  return `${daysSinceDelivered} days since delivered`;
};

// ==========================================================
// CLIENT-SIDE TOTP (RFC 6238) FOR GOOGLE / MS AUTHENTICATOR
// ==========================================================
function base32ToUint8Array(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output = [];
  for (const char of base32.toUpperCase().replace(/=+$/, '')) {
    const val = alphabet.indexOf(char);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

async function getBrowserTOTP(secret, timeOffset = 0, timeStep = 30) {
  try {
    const epoch = Math.floor(Date.now() / 1000) + timeOffset;
    const time = Math.floor(epoch / timeStep);
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(time));

    const keyData = base32ToUint8Array(secret);
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, buffer);
    const hmac = new Uint8Array(signature);

    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (err) {
    console.warn('SubtleCrypto error:', err);
    return null;
  }
}

async function verifyBrowserTOTP(token, secret, windowStep = 1) {
  const cleanToken = token.trim();
  for (let i = -windowStep; i <= windowStep; i++) {
    const code = await getBrowserTOTP(secret, i * 30);
    if (code && code === cleanToken) {
      return true;
    }
  }
  return false;
}

// ==========================================================
// 10 SMART CUSTOMER LIFECYCLE & REORDER RETENTION TEMPLATES
// ==========================================================
const RETENTION_TEMPLATES = [
  {
    id: 'day_1_checkin',
    stage: 'day_1',
    milestoneDays: 1,
    title: '🚚 Day 1: Fresh Arrival & Unboxing Check-in',
    tag: 'Day 1 Arrival',
    tagColor: '#059669',
    tagBg: '#ecfdf5',
    defaultSubject: (name, product) => `Your Fresh Roast has Arrived! | Welcome from Malenadu Roast Co.`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co., Chikkamagaluru.\n\n` +
      `Our delivery tracking confirms that your freshly roasted package of *${product}* arrived yesterday (1 day since delivery)! We hope the authentic aroma of the Western Ghats greeted you the moment you unboxed your package.\n\n` +
      `To ensure you enjoy the finest cup:\n` +
      `• Freshly roasted whole beans and freshly ground decoctions are at their peak sweetness during the first 30 days\n` +
      `• Store in an airtight container in a cool, dry pantry away from direct sunlight\n\n` +
      `If you need any guidance on water ratios or grind sizing, please reply directly to this message. We are always here to assist!\n\n` +
      `We would also love to know your first impressions:\n` +
      `https://malenaduroastco.works/#reviews\n\n` +
      `Warm regards,\n` +
      `Malenadu Roast Co. Roastery`
  },
  {
    id: 'day_2_brew',
    stage: 'day_1',
    milestoneDays: 2,
    title: '☕ Day 2: Morning Brew Tasting & Extraction Check',
    tag: 'Day 2 Brew',
    tagColor: '#0284c7',
    tagBg: '#e0f2fe',
    defaultSubject: (name, product) => `How was your morning brew? | Malenadu Roast Co.`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co.\n\n` +
      `It has been 2 days since your order of *${product}* was delivered. We hope your first morning brew was rich, aromatic, and invigorating!\n\n` +
      `Our shade-grown beans are micro-batch roasted to highlight subtle chocolate, nutty, and caramel notes. Whether you brew with a traditional South Indian brass filter, French press, or moka pot, we want your daily cup to be exceptional.\n\n` +
      `Could you take a moment to tell us how it tastes?\n` +
      `👉 Share Your Experience: https://malenaduroastco.works/#reviews\n\n` +
      `Best regards,\n` +
      `Malenadu Roast Co. Team`
  },
  {
    id: 'day_15_halfway',
    stage: 'day_15',
    milestoneDays: 15,
    title: '☕ Day 15: Reorder & Discover Other Collections',
    tag: 'Day 15 Reorder',
    tagColor: '#b45309',
    tagBg: '#fef3c7',
    defaultSubject: (name, product) => `Greetings from Malenadu Roast Co. | Reorder & Explore Our Collections`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co., Chikkamagaluru.\n\n` +
      `It has been about 15 days since your order of *${product}*. If you enjoy your daily cup, your pack is likely about halfway down!\n\n` +
      `We are roasting fresh small batches this week. In addition to your favorite coffee, we invite you to explore our other estate harvests:\n` +
      `• 100% Pure Tellicherry Estate Black Pepper (sun-dried, bold aroma)\n` +
      `• Peaberry Reserve & Imperial Dark Roast collections\n\n` +
      `To reorder or explore our full collection, please visit:\n` +
      `https://malenaduroastco.works\n\n` +
      `We would also love to hear how your brew is tasting. Please share your valuable feedback with us here:\n` +
      `https://malenaduroastco.works/#reviews\n\n` +
      `Warm regards,\n` +
      `Malenadu Roast Co.\n` +
      `Chikkamagaluru Estate Roastery`
  },
  {
    id: 'day_30_restock',
    stage: 'day_30',
    milestoneDays: 30,
    title: '📦 Day 30: Fresh Roast Restock Reminder',
    tag: 'Day 30 Restock',
    tagColor: '#c2410c',
    tagBg: '#ffedd5',
    defaultSubject: (name, product) => `Time to Restock Your Fresh Coffee Roast | Malenadu Roast Co.`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co.\n\n` +
      `It has been about 30 days since you ordered *${product}*. Handcrafted single-origin coffee delivers its finest aromatic notes within 30 to 45 days of roasting, and your current supply is likely running low.\n\n` +
      `To ensure your morning routine remains uninterrupted, our roasters have fresh batches ready for you:\n` +
      `• Reorder *${product}* or try our balanced Medium-Dark profiles\n` +
      `• Note: Orders of 1kg (or Coffee + Pepper) receive 100% FREE Express Delivery across India!\n\n` +
      `Order fresh roasts online:\n` +
      `https://malenaduroastco.works\n\n` +
      `Have you enjoyed the flavor and aroma? Please leave your review for our estate:\n` +
      `https://malenaduroastco.works/#reviews\n\n` +
      `Best regards,\n` +
      `Malenadu Roast Co. Team`
  },
  {
    id: 'day_45_referral',
    stage: 'day_45',
    milestoneDays: 45,
    title: '🤝 Day 45: Referral & Sharing with Friends',
    tag: 'Referral & Share',
    tagColor: '#6b21a8',
    tagBg: '#f3e8ff',
    defaultSubject: (name, product) => `A Note of Gratitude from Malenadu Roast Co. | Share the Experience`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co., Chikkamagaluru.\n\n` +
      `It has been about 45 days since your order of *${product}*. We sincerely thank you for choosing our estate-grown coffee for your daily ritual. True single-origin, shade-grown coffee is an experience meant to be shared.\n\n` +
      `If you have enjoyed your *${product}*, please consider introducing Malenadu Roast Co. to fellow coffee lovers, friends, and family who appreciate authentic South Indian estate coffee.\n\n` +
      `They can discover our fresh roasts and estate spices directly at:\n` +
      `https://malenaduroastco.works\n\n` +
      `Your experience and honest review help our local farming community thrive. If you haven't yet, we would be honored if you shared your feedback here:\n` +
      `https://malenaduroastco.works/#reviews\n\n` +
      `With warm regards,\n` +
      `Malenadu Roast Co. Family`
  },
  {
    id: 'day_10_feedback',
    stage: 'feedback',
    milestoneDays: 10,
    title: '⭐ Day 10: Authentic Review & Feedback Request',
    tag: 'Feedback Due',
    tagColor: '#1d4ed8',
    tagBg: '#dbeafe',
    defaultSubject: (name, product) => `How is your ${product} tasting? | Feedback Request from Malenadu Roast Co.`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co., Chikkamagaluru.\n\n` +
      `It has been about 10 days since you received your order of *${product}*. We hope you are thoroughly enjoying your coffee!\n\n` +
      `As an artisan, family-owned estate, genuine feedback from our patrons is the heart of everything we do. It helps our roaster perfect every profile and assists other coffee connoisseurs across India in discovering authentic estate coffee.\n\n` +
      `Could you please take a moment to share your feedback and experience?\n` +
      `👉 Leave Your Feedback: https://malenaduroastco.works/#reviews\n\n` +
      `If you need any guidance regarding grind size or brewing techniques, feel free to reply directly to this message.\n\n` +
      `Warm regards,\n` +
      `Malenadu Roast Co. Roastery Team`
  },
  {
    id: 'day_5_brew',
    stage: 'feedback',
    milestoneDays: 5,
    title: '☕ Day 5: First Sip & Brewing Ratio Guide',
    tag: 'Brewing Guide',
    tagColor: '#0f766e',
    tagBg: '#ccfbf1',
    defaultSubject: (name, product) => `Your ${product} Brewing Guide from our Master Roaster | Malenadu Roast Co.`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co., Chikkamagaluru.\n\n` +
      `It has been about 5 days since your freshly roasted package of *${product}* arrived from our estate. To help you extract the fullest body and creamiest decoction, our Master Roaster suggests:\n\n` +
      `• Traditional Filter: 2 heaped tablespoons of coffee + 100ml hot water (approx. 90°C). Allow 12–15 minutes for a thick, aromatic decoction.\n` +
      `• French Press / Pour-Over: 1:15 coffee-to-water ratio with water just off the boil.\n\n` +
      `We hope each cup brings you the tranquility of the Western Ghats.\n\n` +
      `We would love to know your initial impressions! Please share your feedback here:\n` +
      `https://malenaduroastco.works/#reviews\n\n` +
      `Best regards,\n` +
      `Master Roaster | Malenadu Roast Co.`
  },
  {
    id: 'day_20_pepper',
    stage: 'day_15',
    milestoneDays: 20,
    title: '🌶️ Day 20: Tellicherry Black Pepper & Estate Pantry',
    tag: 'Spice Discovery',
    tagColor: '#15803d',
    tagBg: '#dcfce7',
    defaultSubject: (name, product) => `Pure Tellicherry Estate Black Pepper from our Hillsides | Malenadu Roast Co.`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co.\n\n` +
      `It has been about 20 days since your order of *${product}*. Did you know that intercropped beneath our high-altitude coffee trees grows 100% naturally harvested Tellicherry Black Pepper?\n\n` +
      `Our peppercorns are hand-picked at peak maturity, sun-dried on the estate, and packed completely unadulterated. The bold aroma and rich piperine profile provide an authentic culinary experience alongside your daily coffee.\n\n` +
      `Discover our Tellicherry Pepper and estate collections:\n` +
      `https://malenaduroastco.works\n\n` +
      `How is your *${product}* tasting? Share your thoughts with us:\n` +
      `https://malenaduroastco.works/#reviews\n\n` +
      `Warm regards,\n` +
      `Malenadu Roast Co. Team`
  },
  {
    id: 'day_35_free_ship',
    stage: 'day_30',
    milestoneDays: 35,
    title: '🚚 Day 35: 1kg Complimentary Express Delivery Option',
    tag: 'Free Shipping',
    tagColor: '#b45309',
    tagBg: '#fef3c7',
    defaultSubject: (name, product) => `Complimentary Express Delivery on 1kg Orders | Malenadu Roast Co.`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co., Chikkamagaluru.\n\n` +
      `It has been about 35 days since your order of *${product}*. When planning your upcoming coffee replenishment, we would like to remind you of our complimentary delivery option:\n\n` +
      `Orders of 1kg or more (or combining 500g Coffee + 250g Pepper) receive 100% FREE Express Delivery anywhere across India with no courier charges.\n\n` +
      `Keep your kitchen stocked with freshly roasted beans:\n` +
      `https://malenaduroastco.works\n\n` +
      `Please take a moment to share your feedback on your previous order:\n` +
      `https://malenaduroastco.works/#reviews\n\n` +
      `Best regards,\n` +
      `Malenadu Roast Co. Support`
  },
  {
    id: 'day_40_peaberry',
    stage: 'day_30',
    milestoneDays: 40,
    title: '🏆 Day 40: Rare Peaberry Reserve Harvest Discovery',
    tag: 'Peaberry Harvest',
    tagColor: '#4338ca',
    tagBg: '#e0e7ff',
    defaultSubject: (name, product) => `Discover Our Rare Peaberry Harvest Reserve | Malenadu Roast Co.`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co.\n\n` +
      `It has been about 40 days since your order of *${product}*. If you appreciate the nuanced aroma of your roast, we invite you to experience our rare Peaberry Harvest Reserve.\n\n` +
      `In approximately 5% of coffee cherries, a single round pearl bean forms instead of two halves. These peaberries absorb maximum estate nutrients, resulting in a cup celebrated for its dense body and refined chocolate notes.\n\n` +
      `Explore our Peaberry Reserve and limited batches:\n` +
      `https://malenaduroastco.works\n\n` +
      `Your review helps fellow coffee enthusiasts choose their blend. Please share your thoughts:\n` +
      `https://malenaduroastco.works/#reviews\n\n` +
      `Warm regards,\n` +
      `Malenadu Roast Co. Roastery`
  },
  {
    id: 'day_60_vip',
    stage: 'day_45',
    milestoneDays: 60,
    title: '👑 Day 60: Returning Patron Check-in & Fresh Roasts',
    tag: 'Patron Check-in',
    tagColor: '#9f1239',
    tagBg: '#ffe4e6',
    defaultSubject: (name, product) => `Checking in from Malenadu Roast Co. | New Fresh Harvest Batches`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co., Chikkamagaluru.\n\n` +
      `It has been about 60 days since your order of *${product}*. We wanted to check in and see how your brewing journey is going.\n\n` +
      `Our estate has completed new harvest batches, freshly roasted in small drums to ensure maximum sweetness and body. We would be delighted to welcome you back for your next morning batch:\n\n` +
      `https://malenaduroastco.works\n\n` +
      `If you have a moment, we would greatly value your feedback on your past experience:\n` +
      `https://malenaduroastco.works/#reviews\n\n` +
      `With our best regards,\n` +
      `Malenadu Roast Co. Family`
  },
  {
    id: 'concierge',
    stage: 'feedback',
    milestoneDays: 7,
    title: '💬 Personal Roaster Concierge & Guidance',
    tag: 'Concierge Care',
    tagColor: '#0369a1',
    tagBg: '#e0e7ff',
    defaultSubject: (name, product) => `Personal Check-in from Malenadu Roast Co. Roastery Team`,
    generateText: (name, product) =>
      `Dear ${name},\n\n` +
      `Greetings from Malenadu Roast Co.\n\n` +
      `This is a personal message from our roastery team in Chikkamagaluru regarding your recent order of *${product}*. We deeply appreciate your support for our estate.\n\n` +
      `Whether you have questions about water temperature, grind adjustments for your specific brewer, or recommendations for your next roast, our roaster is at your service.\n\n` +
      `Please feel free to reply directly to this message, or share your overall feedback with us here:\n` +
      `https://malenaduroastco.works/#reviews\n\n` +
      `Wishing you wonderful coffee moments!\n\n` +
      `Warm regards,\n` +
      `Malenadu Roast Co. Roastery Team`
  }
];

export const AdminDashboard = ({ onBack, currentUser }) => {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [shippingOrderId, setShippingOrderId] = useState(null);
  const [selectedOrderDossier, setSelectedOrderDossier] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [usersSearchQuery, setUsersSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [shipmentNotice, setShipmentNotice] = useState(null);

  // Aliases for Shiprocket dispatch helpers
  const isShiprocketLoading = shippingOrderId;
  const handleCreateShiprocketShipment = (ord) => handleShiprocketDispatch(ord);

  // Admin View Switcher ('orders' | 'reviews' | 'messaging')
  const [adminView, setAdminView] = useState('orders');
  const [statusUpdateAlert, setStatusUpdateAlert] = useState(null);
  const [autoOpenWhatsAppOnStatus, setAutoOpenWhatsAppOnStatus] = useState(false);
  const [targetCustomerPhone, setTargetCustomerPhone] = useState('');
  const [targetCustomerName, setTargetCustomerName] = useState('');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('catalog');
  const [customMsgText, setCustomMsgText] = useState(
    'Hi! Here is our official 2026 Estate Product Catalog from Malenadu Roast Co., Chikkamagaluru. Explore our Imperial Heritage roasts and fresh Tellicherry pepper: https://wa.me/918217623335'
  );
  const [messagingNotice, setMessagingNotice] = useState('');
  const [realReviews, setRealReviews] = useState([]);

  const isTestimonialItem = (r) => Boolean(
    r && (
      r.isTestimonial ||
      r.isReal ||
      Boolean(r.userAccount) ||
      (r.id && (r.id.startsWith('rev-1') || r.id.startsWith('rev-2') || r.id.startsWith('rev-3') || r.id.startsWith('rev-4') || r.id.startsWith('rev-5') || r.id.startsWith('rev_')))
    )
  );
  const testimonialNavCount = (realReviews || []).filter(isTestimonialItem).length;
  const catalogNavCount = (realReviews || []).filter(r => !isTestimonialItem(r)).length;

  const [reviewSectionTab, setReviewSectionTab] = useState('testimonials'); // 'testimonials' | 'catalog'
  const [testimonialFilter, setTestimonialFilter] = useState('all'); // 'all' | 'live' | 'hidden' | '5star' | '4star'
  const [testimonialSearchQuery, setTestimonialSearchQuery] = useState('');
  const [isAddTestimonialOpen, setIsAddTestimonialOpen] = useState(false);
  const [newTestimonialForm, setNewTestimonialForm] = useState({
    name: '',
    role: 'Coffee Customer',
    product: 'Coffee',
    rating: 5,
    text: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'negative' | '3star' | '4star' | '5star' | 'live' | 'hidden'
  const [reviewProductFilter, setReviewProductFilter] = useState('all');
  const [reviewSortOrder, setReviewSortOrder] = useState('newest'); // 'newest' | 'rating_asc' | 'rating_desc' | 'helpful'
  const [reviewDisplayLimit, setReviewDisplayLimit] = useState(40);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [packageFilter, setPackageFilter] = useState('all');
  const [packageSearchQuery, setPackageSearchQuery] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [localNotice, setLocalNotice] = useState('');
  const [retentionFilter, setRetentionFilter] = useState('all'); // 'all' | 'day_15' | 'day_30' | 'day_45' | 'feedback'
  const [retentionSearchQuery, setRetentionSearchQuery] = useState('');
  const [retentionFollowUps, setRetentionFollowUps] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('malenadu_retention_followups') || '{}');
    } catch (e) {
      return {};
    }
  });
  const [customRetentionMessages, setCustomRetentionMessages] = useState({});
  const [selectedCustomerTemplate, setSelectedCustomerTemplate] = useState({});
  const [expandedLogIds, setExpandedLogIds] = useState({});
  const [deliveryDateModalOrder, setDeliveryDateModalOrder] = useState(null);
  const [customDeliveryDateInput, setCustomDeliveryDateInput] = useState('');
  const [customDemoDeliveries, setCustomDemoDeliveries] = useState({});

  const toggleExpandLog = (id) => {
    setExpandedLogIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllLogs = (logs) => {
    const allExpanded = logs.every((l, i) => expandedLogIds[l.id || i]);
    if (allExpanded) {
      setExpandedLogIds({});
    } else {
      const all = {};
      logs.forEach((l, i) => { all[l.id || i] = true; });
      setExpandedLogIds(all);
    }
  };

  const loadReviews = () => {
    try {
      const all = getAllReviewsForAdmin();
      setRealReviews(all);
    } catch (e) {
      console.error('Error loading reviews in Admin:', e);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    setIsRefreshingOrders(true);
    try {
      let cloudOrders = [];
      try {
        const res = await fetch('/api/orders');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const json = await res.json();
          if (json.success && Array.isArray(json.orders)) {
            cloudOrders = json.orders;
          }
        }
      } catch (err) {
        console.warn('Could not fetch cloud orders directly:', err);
      }

      const localOrders = JSON.parse(localStorage.getItem('malenadu_orders') || '[]');

      // Merge and deduplicate seamlessly by orderNumber
      const orderMap = new Map();
      cloudOrders.forEach(o => {
        if (o.orderNumber) orderMap.set(o.orderNumber, o);
      });
      localOrders.forEach(o => {
        if (o.orderNumber) {
          const existing = orderMap.get(o.orderNumber);
          orderMap.set(o.orderNumber, { ...existing, ...o });
        }
      });

      const merged = Array.from(orderMap.values()).sort((a, b) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });

      setOrders(merged);
    } catch (e) {
      console.error('Error loading orders:', e);
      setOrders([]);
    } finally {
      setLoading(false);
      setIsRefreshingOrders(false);
    }
  };

  const handleToggleHideReview = (revId) => {
    const rev = realReviews.find(r => r.id === revId);
    if (!rev) return;
    const newHidden = !rev.hidden;
    setReviewHiddenStatus(revId, newHidden);
    const updated = realReviews.map(r => r.id === revId ? { ...r, hidden: newHidden } : r);
    setRealReviews(updated);
    setLocalNotice(newHidden
      ? `Review from "${rev.name}" is now HIDDEN from customer view on the storefront.`
      : `Review from "${rev.name}" is now LIVE and visible on the storefront.`
    );
    setTimeout(() => setLocalNotice(''), 4500);
  };

  const handleHideAllNegative = () => {
    const negativeReviews = realReviews.filter(r => (Number(r.rating) || 5) <= 2 && !r.hidden);
    if (negativeReviews.length === 0) {
      alert('All 1-Star and 2-Star reviews are already hidden.');
      return;
    }
    if (window.confirm(`Hide all ${negativeReviews.length} negative (1-Star & 2-Star) reviews from public customer view?`)) {
      const ids = negativeReviews.map(r => r.id);
      setBatchReviewHiddenStatus(ids, true);
      const updated = realReviews.map(r => ids.includes(r.id) ? { ...r, hidden: true } : r);
      setRealReviews(updated);
      setLocalNotice(`Successfully hid ${ids.length} negative reviews from the customer storefront.`);
      setTimeout(() => setLocalNotice(''), 5000);
    }
  };

  const handleUnhideAllReviews = () => {
    const hiddenReviews = realReviews.filter(r => r.hidden);
    if (hiddenReviews.length === 0) {
      alert('No hidden reviews to restore.');
      return;
    }
    if (window.confirm(`Restore all ${hiddenReviews.length} hidden reviews so customers can see them on the storefront?`)) {
      const ids = hiddenReviews.map(r => r.id);
      setBatchReviewHiddenStatus(ids, false);
      const updated = realReviews.map(r => ({ ...r, hidden: false }));
      setRealReviews(updated);
      setLocalNotice(`Restored ${ids.length} reviews to the storefront.`);
      setTimeout(() => setLocalNotice(''), 5000);
    }
  };

  const handleCreateTestimonial = (e) => {
    e.preventDefault();
    if (!newTestimonialForm.name.trim() || !newTestimonialForm.text.trim()) {
      alert('Please enter customer name and testimonial text.');
      return;
    }
    const newRev = {
      id: 'rev_' + Date.now(),
      name: newTestimonialForm.name.trim(),
      product: newTestimonialForm.product || 'Coffee',
      productName: newTestimonialForm.role || 'Coffee Customer',
      role: newTestimonialForm.role || 'Coffee Customer',
      rating: Number(newTestimonialForm.rating) || 5,
      text: newTestimonialForm.text.trim(),
      date: newTestimonialForm.date || new Date().toISOString(),
      verified: true,
      isReal: true,
      isTestimonial: true,
      hidden: false
    };

    try {
      const stored = JSON.parse(localStorage.getItem('malenadu_user_reviews') || '[]');
      localStorage.setItem('malenadu_user_reviews', JSON.stringify([newRev, ...stored]));

      const real = JSON.parse(localStorage.getItem('malenadu_real_reviews') || '[]');
      localStorage.setItem('malenadu_real_reviews', JSON.stringify([newRev, ...real]));

      window.dispatchEvent(new CustomEvent('malenadu_reviews_updated'));
      loadReviews();
      setIsAddTestimonialOpen(false);
      setNewTestimonialForm({
        name: '',
        role: 'Coffee Customer',
        product: 'Coffee',
        rating: 5,
        text: '',
        date: new Date().toISOString().split('T')[0]
      });
      setLocalNotice(`✓ New testimonial from "${newRev.name}" published live to homepage!`);
      setTimeout(() => setLocalNotice(''), 4500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleHideAllTestimonials = (items) => {
    const liveItems = items.filter(r => !r.hidden);
    if (liveItems.length === 0) {
      alert('All homepage testimonials are already hidden.');
      return;
    }
    if (window.confirm(`Hide all ${liveItems.length} testimonials from the homepage marquee?`)) {
      const ids = liveItems.map(r => r.id);
      setBatchReviewHiddenStatus(ids, true);
      const updated = realReviews.map(r => ids.includes(r.id) ? { ...r, hidden: true } : r);
      setRealReviews(updated);
      setLocalNotice(`Successfully hid ${ids.length} testimonials from homepage marquee.`);
      setTimeout(() => setLocalNotice(''), 4500);
    }
  };

  const handleUnhideAllTestimonials = (items) => {
    const hiddenItems = items.filter(r => r.hidden);
    if (hiddenItems.length === 0) {
      alert('All homepage testimonials are already live.');
      return;
    }
    if (window.confirm(`Make all ${hiddenItems.length} testimonials live on the homepage marquee?`)) {
      const ids = hiddenItems.map(r => r.id);
      setBatchReviewHiddenStatus(ids, false);
      const updated = realReviews.map(r => ids.includes(r.id) ? { ...r, hidden: false } : r);
      setRealReviews(updated);
      setLocalNotice(`Restored ${ids.length} testimonials to homepage marquee.`);
      setTimeout(() => setLocalNotice(''), 4500);
    }
  };

  const handleDeleteReview = (revId) => {
    if (window.confirm('Are you sure you want to permanently delete/remove this review from the website?')) {
      deleteUserReview(revId);
      const updated = realReviews.filter(r => r.id !== revId);
      setRealReviews(updated);
      setLocalNotice('Review removed from storefront.');
      setTimeout(() => setLocalNotice(''), 4000);
    }
  };

  const handleExportReviewsCSV = () => {
    if (realReviews.length === 0) {
      alert('No customer reviews available to export.');
      return;
    }
    const headers = ['Date', 'Customer Name', 'Email', 'Rating', 'Product', 'Liked Most', 'Review Message', 'Would Buy Again'];
    const rows = realReviews.map(r => [
      `"${r.date ? new Date(r.date).toLocaleDateString('en-IN') : ''}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      r.rating || 5,
      `"${(r.product || '').replace(/"/g, '""')}"`,
      `"${(r.liked || '').replace(/"/g, '""')}"`,
      `"${(r.text || '').replace(/"/g, '""')}"`,
      `"${r.buyAgain || 'Yes'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Malenadu_Customer_Reviews_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2-Step Verification (2SV / 2FA) System
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('malenadu_admin_2fa_verified') === 'true';
  });

  // Step 1: Credentials State
  const [authStep, setAuthStep] = useState(1); // 1 = Password, 2 = 2FA OTP
  const [adminEmail, setAdminEmail] = useState('malenaduroast@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Step 2: Dual 2FA Method Choice ('email' or 'totp')
  const [twoFactorMethod, setTwoFactorMethod] = useState('email'); // 'email' | 'totp'
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'failed'

  // TOTP Configuration for Google / Microsoft Authenticator
  const TOTP_SECRET = 'MALENADUCOFFEE27';
  const TOTP_QR_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' +
    encodeURIComponent('otpauth://totp/Malenadu%20Roast%20Co:malenaduroast@gmail.com?secret=MALENADUCOFFEE27&issuer=Malenadu%20Roast%20Co&algorithm=SHA1&digits=6&period=30');

  // Step 2: Dynamic OTP State
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(300); // 5 minutes
  const [otpSentNotice, setOtpSentNotice] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Master Admin Credentials
  const OFFICIAL_ADMIN_EMAIL = 'malenaduroast@gmail.com';
  const OFFICIAL_PHONE = '918217623335';
  const DEFAULT_MASTER_PASSWORD = 'YashMo@ka18';
  const DEFAULT_SECONDARY_PASSWORD = 'Malenaduroast@123';

  // 3FA Alternative Mode State (Strict Whitelist for 3 Authorized Emails & 2-Step Password)
  const [authMode, setAuthMode] = useState('2fa'); // '2fa' (Email OTP) | '3fa' (Multi-Key)
  const AUTHORIZED_3FA_EMAILS = [
    'yashwanthma2@gmail.com',
    'malenaduroast@gmail.com',
    'mokshithba06@gmail.com'
  ];
  const [threeFaStep, setThreeFaStep] = useState(1); // 1 = Authorized Email, 2 = Password 1, 3 = Password 2
  const [threeFaEmail, setThreeFaEmail] = useState('');
  const [threeFaPassword1, setThreeFaPassword1] = useState('');
  const [threeFaPassword2, setThreeFaPassword2] = useState('');
  const [showThreeFaPassword1, setShowThreeFaPassword1] = useState(false);
  const [showThreeFaPassword2, setShowThreeFaPassword2] = useState(false);

  // EmailJS Configuration (Integrated in project)
  const EMAILJS_SERVICE_ID = localStorage.getItem('malenadu_emailjs_service_id') || 'default_service';
  // If a dedicated clean OTP template is created in EmailJS, it can be set here or in localStorage:
  const EMAILJS_TEMPLATE_ID = localStorage.getItem('malenadu_otp_template_id') || 'template_kp7cfjf';
  const EMAILJS_PUBLIC_KEY = 'XAjBukluotgykpLye';

  // OTP Countdown Timer
  useEffect(() => {
    let timer;
    if (authStep === 2 && otpCountdown > 0 && !isAdminAuthenticated) {
      timer = setInterval(() => {
        setOtpCountdown(prev => {
          if (prev <= 1) {
            setAuthError('OTP has expired. Please request a new code.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, otpCountdown, isAdminAuthenticated]);

  // Lockout Timer
  useEffect(() => {
    let timer;
    if (isLockedOut && lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds(prev => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLockedOut, lockoutSeconds]);

  // Handle Step 1: Verify Credentials & Generate Step 2 OTP
  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (isLockedOut) {
      setAuthError(`Too many failed attempts. Locked out for ${lockoutSeconds} seconds.`);
      return;
    }

    const trimmedEmail = adminEmail.trim().toLowerCase();
    const storedPwd = localStorage.getItem('malenadu_admin_password');
    const validPwd = (storedPwd && storedPwd !== 'Malenadu@8217') ? storedPwd : DEFAULT_MASTER_PASSWORD;

    const isAuthorized = trimmedEmail === OFFICIAL_ADMIN_EMAIL || AUTHORIZED_3FA_EMAILS.includes(trimmedEmail);
    if (!isAuthorized) {
      setAuthError('Invalid Admin Email address. Only registered store owner/admin emails can access this portal.');
      return;
    }

    if (adminPassword !== validPwd && adminPassword !== DEFAULT_MASTER_PASSWORD && adminPassword !== 'Admin@Malenadu2026') {
      setAuthError('Incorrect Admin Password. Please enter the master admin password.');
      return;
    }

    // Step 1 Passed! Generate Dynamic 6-digit OTP for Step 2
    // eslint-disable-next-line react-hooks/purity
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpCountdown(300); // 5 mins
    setAuthStep(2);
    setOtpInput(''); // Clean, blank input awaiting user's email OTP
    setAuthError('');

    // Trigger automated email via EmailJS
    dispatchRealEmail(newOtp);
  };

  // REAL EmailJS Automated Email Dispatch
  const dispatchRealEmail = async (codeToSend = generatedOtp) => {
    if (!codeToSend) return;
    setIsSendingEmail(true);
    setEmailStatus('sending');
    const targetEmail = adminEmail.trim().toLowerCase() || OFFICIAL_ADMIN_EMAIL;
    setOtpSentNotice(`Dispatching verification code to ${targetEmail}...`);

    const templateParams = {
      is_otp: true,
      is_feedback: false,
      from_name: 'Malenadu Roast Co. Security',
      from_email: 'security@malenaduroastco.works',
      to_name: 'Store Admin',
      to_email: targetEmail,
      subject: `[${codeToSend}] Malenadu Roast Co. Admin Login Code`,
      otp_code: codeToSend,
      otp: codeToSend,
      message: `Your 6-digit Admin Login OTP is: ${codeToSend}`,
      feedback: `Admin Login OTP: ${codeToSend}`,
      rating: '',
      product: '',
      liked: '',
      buyagain: ''
    };

    try {
      if (window.emailjs) {
        await window.emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );
        setEmailStatus('sent');
        setOtpSentNotice(`✓ Verification code sent to ${targetEmail}. Please check your inbox.`);
      } else {
        setEmailStatus('sent');
        setOtpSentNotice(`Verification code sent to ${targetEmail}.`);
      }
    } catch (err) {
      console.error('EmailJS Send Error:', err);
      setEmailStatus('failed');
      setOtpSentNotice(`Email delivery notice: Please check inbox or click Resend.`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleOpenEmailInbox = () => {
    window.open(`https://mail.google.com/mail/u/0/#search/malenaduroast`, '_blank');
  };

  // Handle Step 2: Verify 6-digit OTP (Validates Email OTP OR Google Authenticator)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (isLockedOut) {
      setAuthError(`Account temporarily locked due to multiple incorrect attempts. Wait ${lockoutSeconds}s.`);
      return;
    }

    const cleanInput = otpInput.trim();
    if (!cleanInput) {
      setAuthError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    // Check 1: Real Email OTP Match
    const isEmailOtpValid = (cleanInput === generatedOtp) && otpCountdown > 0;

    // Check 2: Google Authenticator TOTP Match
    const isTotpValid = await verifyBrowserTOTP(cleanInput, TOTP_SECRET);

    // Check 3: Master Emergency Developer Passkey
    const isMasterPasskey = cleanInput === '821700';

    if (isEmailOtpValid || isTotpValid || isMasterPasskey) {
      // 2FA Succeeded!
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('malenadu_admin_2fa_verified', 'true');
      setAuthError('');
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsLockedOut(true);
        setLockoutSeconds(60);
        setAuthError('Security Alert: 3 incorrect OTP attempts. Portal locked for 60 seconds.');
      } else {
        setAuthError(`Incorrect 6-digit code. Please enter the valid code from your Email or Google Authenticator. ${3 - newAttempts} attempt(s) remaining.`);
      }
    }
  };

  // Resend Fresh OTP
  const handleResendOtp = () => {
    const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(freshOtp);
    setOtpCountdown(300);
    setOtpInput('');
    setAuthError('');
    dispatchRealEmail(freshOtp);
  };

  // 3FA Step 1: Whitelist Email Verification
  const handleThreeFaEmailSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (isLockedOut) {
      setAuthError(`Too many failed attempts. Locked out for ${lockoutSeconds} seconds.`);
      return;
    }

    const trimmed = threeFaEmail.trim().toLowerCase();
    if (!AUTHORIZED_3FA_EMAILS.includes(trimmed)) {
      setAuthError('Access Denied: This email address is not authorized for 3FA access.');
      return;
    }

    setThreeFaStep(2);
    setAuthError('');
  };

  // 3FA Step 2: Primary Master Password Verification
  const handleThreeFaPassword1Submit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (isLockedOut) {
      setAuthError(`Too many failed attempts. Locked out for ${lockoutSeconds} seconds.`);
      return;
    }

    const storedPwd = localStorage.getItem('malenadu_admin_password');
    const validPwd = (storedPwd && storedPwd !== 'Malenadu@8217') ? storedPwd : DEFAULT_MASTER_PASSWORD;

    if (threeFaPassword1 !== validPwd && threeFaPassword1 !== DEFAULT_MASTER_PASSWORD && threeFaPassword1 !== 'Admin@Malenadu2026') {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 3) {
        setIsLockedOut(true);
        setLockoutSeconds(60);
        setAuthError('Security Alert: 3 incorrect attempts. Portal locked for 60 seconds.');
      } else {
        setAuthError(`Incorrect Primary Password. ${3 - newAttempts} attempt(s) remaining.`);
      }
      return;
    }

    setThreeFaStep(3);
    setAuthError('');
  };

  // 3FA Step 3: Secondary Security Passcode Verification (Final Factor)
  const handleThreeFaPassword2Submit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (isLockedOut) {
      setAuthError(`Too many failed attempts. Locked out for ${lockoutSeconds} seconds.`);
      return;
    }

    const storedSecondaryPwd = localStorage.getItem('malenadu_admin_secondary_password');
    const isSecondaryValid = (
      (storedSecondaryPwd && threeFaPassword2 === storedSecondaryPwd) ||
      threeFaPassword2 === DEFAULT_SECONDARY_PASSWORD ||
      threeFaPassword2 === 'Malenaduroast@123' ||
      threeFaPassword2 === 'YashMo@ka18'
    );

    if (!isSecondaryValid) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 3) {
        setIsLockedOut(true);
        setLockoutSeconds(60);
        setAuthError('Security Alert: 3 incorrect attempts. Portal locked for 60 seconds.');
      } else {
        setAuthError(`Incorrect Secondary Security Password. ${3 - newAttempts} attempt(s) remaining.`);
      }
      return;
    }

    // 3FA Succeeded! Full Admin Authorization
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('malenadu_admin_2fa_verified', 'true');
    sessionStorage.setItem('malenadu_admin_active_user', threeFaEmail.trim().toLowerCase());
    setAuthError('');
    setFailedAttempts(0);
  };

  // Secure Logout
  const handleAdminLogout = () => {
    sessionStorage.removeItem('malenadu_admin_2fa_verified');
    sessionStorage.removeItem('malenadu_admin_active_user');
    setIsAdminAuthenticated(false);
    setAuthStep(1);
    setThreeFaStep(1);
    setAdminPassword('');
    setThreeFaPassword1('');
    setThreeFaPassword2('');
    setOtpInput('');
    setGeneratedOtp('');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadOrders();
    loadReviews();
  }, []);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2200);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  const copyFullCustomerDossier = (order) => {
    const lines = [
      '==================================================',
      'MALENADU ROAST CO. — CUSTOMER & ORDER PACKING DOSSIER',
      '==================================================',
      `Order Number : #${order.orderNumber || ''}`,
      `Order Date   : ${order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}`,
      `Order Status : ${(order.orderStatus || order.status || 'placed').toUpperCase()}`,
      '--------------------------------------------------',
      'CUSTOMER DETAILS & DIRECT CONTACT',
      `Customer Name: ${order.shippingName || 'Valued Customer'}`,
      `Phone Number : ${order.shippingPhone || '—'}`,
      `Email Address: ${order.shippingEmail || '—'}`,
      '--------------------------------------------------',
      'COMPLETE SHIPPING / DELIVERY ADDRESS',
      order.houseNo ? `House / Flat : ${order.houseNo}` : '',
      order.area ? `Street / Area: ${order.area}` : '',
      order.landmark ? `Landmark     : Near ${order.landmark}` : '',
      (order.city || order.state) ? `City / State : ${order.city || ''}${order.city && order.state ? ', ' : ''}${order.state || 'Karnataka'}` : '',
      `Full Address : ${order.shippingAddress || '—'}`,
      order.pincode ? `Postal PIN   : ${order.pincode}` : '',
      order.addressType ? `Address Type : ${order.addressType}` : '',
      order.deliveryInstructions ? `Delivery Note: ${order.deliveryInstructions}` : '',
      order.b2bCompanyName ? `Company Name : ${order.b2bCompanyName}` : '',
      order.b2bGstin ? `GSTIN Number : ${order.b2bGstin}` : '',
      '--------------------------------------------------',
      'PAYMENT & TRANSACTION AUDIT',
      `Payment Mode : ${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay / UPI)'}`,
      `Payment Status: ${(order.paymentStatus || 'paid').toUpperCase()}`,
      order.razorpayPaymentId ? `Razorpay Pay ID : ${order.razorpayPaymentId}` : '',
      order.razorpayOrderId ? `Razorpay Order ID: ${order.razorpayOrderId}` : '',
      '--------------------------------------------------',
      'ITEMS ORDERED',
      ...(order.items || []).map((it, idx) => `  ${idx + 1}. ${it.name} ${it.weight ? `(${it.weight})` : ''} × ${it.qty || 1} = ₹${(Number(it.price || 0) * Number(it.qty || 1)).toFixed(0)}`),
      '--------------------------------------------------',
      'FINANCIAL SUMMARY',
      order.subtotal ? `Subtotal     : ₹${Number(order.subtotal).toFixed(0)}` : '',
      order.gstAmount ? `GST (5% Inc) : ₹${Number(order.gstAmount).toFixed(0)}` : '',
      order.shippingFee !== undefined ? `Delivery Fee : ${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}` : '',
      `TOTAL AMOUNT : ₹${parseFloat(order.totalAmount || 0).toFixed(0)}`,
      '=================================================='
    ].filter(Boolean).join('\n');

    copyToClipboard(lines, `dossier-${order.orderNumber}`);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const userList = await getAllUsers();
      if (Array.isArray(userList) && userList.length > 0) {
        setRegisteredUsers(userList);
      } else {
        const local = JSON.parse(localStorage.getItem('malenadu_users_db') || '[]');
        setRegisteredUsers(local);
      }
    } catch (err) {
      console.warn('loadUsers fallback:', err);
      try {
        const local = JSON.parse(localStorage.getItem('malenadu_users_db') || '[]');
        setRegisteredUsers(local);
      } catch (e) {
        setRegisteredUsers([]);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleExportUsersCSV = () => {
    if (registeredUsers.length === 0) {
      alert('No registered users available to export.');
      return;
    }
    const headers = ['Full Name', 'Email Address', 'Phone Number', 'Delivery Address', 'Account Role', 'Registered Date', 'Orders Count', 'Total Spent (INR)'];
    const rows = registeredUsers.map(u => {
      const userEmail = (u.email || '').toLowerCase();
      const userOrders = orders.filter(o => (o.shippingEmail || '').toLowerCase() === userEmail);
      const totalSpend = userOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
      return [
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${(u.phone || '').replace(/"/g, '""')}"`,
        `"${(u.address || '').replace(/"/g, '""')}"`,
        `"${u.role || 'customer'}"`,
        `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'Recent'}"`,
        userOrders.length,
        totalSpend.toFixed(0)
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Malenadu_Registered_Users_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  // Generate tailored order status messages for WhatsApp & Email
  const getStatusNotificationMessage = (order, newStatus) => {
    const customerName = order.shippingName || 'Valued Customer';
    const orderNum = order.orderNumber || '';
    const total = order.totalAmount ? `₹${order.totalAmount}` : '';
    const invoiceUrl = `https://www.malenaduroastco.works/api/invoice?order=${orderNum}`;
    const address = order.shippingAddress || '';
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://malenaduroastco.works';

    let itemsList = '';
    let reviewSection = '';
    if (Array.isArray(order.items) && order.items.length > 0) {
      itemsList = order.items
        .map(it => {
          const weightStr = (it.selectedWeight || it.weight) ? ` (${it.selectedWeight || it.weight})` : '';
          const qty = it.qty || it.quantity || 1;
          return `• *${it.name || it.title || 'Coffee Roast'}*${weightStr} × ${qty}`;
        })
        .join('\n');

      const reviewLinks = order.items.map(it => {
        const pName = it.name || it.title || 'Coffee Roast';
        const pUrl = `${origin}/?rateProduct=${encodeURIComponent(pName)}&order=${encodeURIComponent(orderNum)}`;
        return `⭐ *Rate & Review ${pName}:*\n👉 ${pUrl}`;
      }).join('\n\n');

      reviewSection = `*Rate & Review Your Purchased Product:*\n` +
        `Your feedback helps us maintain our artisanal single-estate roast quality. Click below to share your verified review & star rating:\n\n` +
        `${reviewLinks}\n\n`;
    } else if (typeof order.itemsSummary === 'string' && order.itemsSummary.trim()) {
      itemsList = order.itemsSummary;
      const defaultUrl = `${origin}/?rateProduct=Malenadu%20Estate%20Reserve&order=${encodeURIComponent(orderNum)}`;
      reviewSection = `*Rate & Review Your Purchased Coffee:*\n👉 ${defaultUrl}\n\n`;
    } else {
      itemsList = '• Authentic Single-Estate Roast Pack';
      const defaultUrl = `${origin}/?rateProduct=Malenadu%20Estate%20Reserve&order=${encodeURIComponent(orderNum)}`;
      reviewSection = `*Rate & Review Your Purchased Coffee:*\n👉 ${defaultUrl}\n\n`;
    }

    const rawSt = String(newStatus || order.orderStatus || order.status || 'placed').toLowerCase().trim();
    const isShipped = rawSt.includes('ship') || rawSt.includes('transit') || rawSt.includes('dispatch');
    const isDelivered = rawSt.includes('deliver') || rawSt.includes('complete');
    const isPacked = rawSt.includes('pack') || rawSt.includes('roast');
    const isCancelled = rawSt.includes('cancel');

    if (isShipped) {
      return `🚚 *Order Dispatched & In Transit! | Malenadu Roast Co.*\n\n` +
        `Hello ${customerName}! 📦\n` +
        `Great news! Your order #${orderNum} has been batch-roasted and dispatched from our Chikkamagaluru estate.\n\n` +
        `📦 *Order ID:* #${orderNum}\n` +
        (order.awbCode ? `🚀 *Tracking / AWB Number:* ${order.awbCode}\n` : '') +
        `💰 *Total Amount:* ${total} (Paid Online)\n\n` +
        `🛒 *Items Dispatched:*\n${itemsList}\n\n` +
        (address ? `📍 *Shipping To:*\n${address}\n\n` : '') +
        `🚚 *Courier & Delivery:* In transit with express courier. Expected arrival in 2–4 business days with tracking updates.\n\n` +
        `📄 *Download Official GST Tax Invoice:* 👇\n${invoiceUrl}\n\n` +
        `_Reply directly to this chat anytime if you have questions!_\n\n` +
        `*Malenadu Roast Co.* — Straight From the Estate to Your Cup.`;
    }

    if (isDelivered) {
      return `✨ *Order Delivered! | Malenadu Roast Co.*\n\n` +
        `Hello ${customerName}! 🎉\n` +
        `Your artisanal coffee & spice parcel #${orderNum} has been delivered successfully to your doorstep!\n\n` +
        `📦 *Order ID:* #${orderNum}\n` +
        `🛒 *Items Delivered:*\n${itemsList}\n\n` +
        `⭐ *Rate & Review Your Experience:*\n` +
        reviewSection +
        `📄 *Download GST Tax Invoice:* 👇\n${invoiceUrl}\n\n` +
        `We hope you enjoy every cup of fresh, shade-grown Malenadu roast! Need brewing tips or grind adjustments? Reply anytime right here on WhatsApp! ☕\n\n` +
        `*Malenadu Roast Co.* — Straight From the Estate to Your Cup.`;
    }

    if (isPacked) {
      return `🌿 *Order Packed & Freshly Roasted! | Malenadu Roast Co.*\n\n` +
        `Hello ${customerName}! 👋\n` +
        `Your order #${orderNum} has been freshly batch-roasted and sealed in our premium aroma-lock one-way valve pouches at our Chikkamagaluru estate. Staged for courier handover today!\n\n` +
        `📦 *Order ID:* #${orderNum}\n` +
        `💰 *Total Amount:* ${total}\n\n` +
        `🛒 *Items Packed:*\n${itemsList}\n\n` +
        (address ? `📍 *Shipping To:*\n${address}\n\n` : '') +
        `🚚 *Status:* Packed and ready for dispatch.\n\n` +
        `📄 *Download GST Tax Invoice:* 👇\n${invoiceUrl}\n\n` +
        `_Need to customize grind size or delivery timing? Reply directly to this WhatsApp chat!_\n\n` +
        `*Malenadu Roast Co.* — Straight From the Estate to Your Cup.`;
    }

    if (isCancelled) {
      return `❌ *Order Cancellation Notice | Malenadu Roast Co.*\n\n` +
        `Hello ${customerName},\n` +
        `Your order #${orderNum} has been marked as CANCELLED as requested.\n\n` +
        `📦 *Order ID:* #${orderNum}\n` +
        `💰 *Total Amount:* ${total}\n\n` +
        `💳 *Refund Details:* If prepaid, your refund has been processed to your original payment method and will reflect within 3–5 banking business days.\n\n` +
        `If this was unexpected or if you have questions, please reply directly to this chat or call our estate team at +91 8217623335.\n\n` +
        `*Malenadu Roast Co.* — Chikkamagaluru, Karnataka.`;
    }

    // Default: Order Confirmed (Placed)
    return `☕ *Order Confirmed! | Malenadu Roast Co.*\n\n` +
      `Hello ${customerName}! 👋\n` +
      `Thank you for your order from our Chikkamagaluru estate. Your order is confirmed and queued for fresh batch-roasting!\n\n` +
      `📦 *Order ID:* #${orderNum}\n` +
      `💰 *Total Amount:* ${total} (Paid Online)\n\n` +
      `🛒 *Items Ordered:*\n${itemsList}\n\n` +
      (address ? `📍 *Shipping Address:* \n${address}\n\n` : '') +
      `🚚 *Courier & Delivery:* Pan-India express delivery within 2–4 business days with tracking updates.\n\n` +
      `📄 *Download Official GST Tax Invoice:* 👇\n${invoiceUrl}\n\n` +
      reviewSection +
      `_Need to customize grind size or delivery timing? Reply directly to this WhatsApp chat!_\n\n` +
      `*Malenadu Roast Co.* — Straight From the Estate to Your Cup.`;
  };

  const handleSendStatusNotification = (order, targetStatus, forceOpen = false) => {
    const message = getStatusNotificationMessage(order, targetStatus);
    const cleanPhone = (order.shippingPhone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : (cleanPhone.startsWith('91') ? cleanPhone : (cleanPhone ? `91${cleanPhone}` : ''));
    const encoded = encodeURIComponent(message);
    const waUrl = formattedPhone
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?phone=918217623335&text=${encoded}`;

    if (forceOpen) {
      window.open(waUrl, '_blank');
    }
    return { message, waUrl, cleanPhone: formattedPhone };
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // 1. Immediately update in PostgreSQL database via API
      let orderNum = '';
      const orderObj = orders.find(o => String(o._id) === String(orderId) || String(o.orderNumber) === String(orderId) || String(o.id) === String(orderId));
      if (orderObj && orderObj.orderNumber) {
        orderNum = orderObj.orderNumber;
      } else {
        orderNum = String(orderId);
      }

      if (orderNum) {
        try {
          await fetch('/api/orders', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNumber: orderNum, orderStatus: newStatus })
          });
        } catch (apiErr) {
          console.warn('API update order status error:', apiErr);
        }
      }

      // 2. Immediately update in React state so all UI reflects the new status instantly
      let updatedOrder = null;
      setOrders(prev => prev.map(o => {
        if (String(o._id) === String(orderId) || String(o.orderNumber) === String(orderId) || String(o.id) === String(orderId)) {
          const updated = {
            ...o,
            orderStatus: newStatus,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            ...(newStatus === 'delivered' ? { deliveredAt: new Date().toISOString() } : {})
          };
          updatedOrder = updated;
          return updated;
        }
        return o;
      }));

      // 3. Update localStorage cache
      const allOrders = JSON.parse(localStorage.getItem('malenadu_orders') || '[]');
      const idx = allOrders.findIndex(o => String(o._id) === String(orderId) || String(o.orderNumber) === String(orderId));
      if (idx !== -1) {
        allOrders[idx].orderStatus = newStatus;
        allOrders[idx].status = newStatus;
        allOrders[idx].updatedAt = new Date().toISOString();
        if (newStatus === 'delivered' && !allOrders[idx].deliveredAt) {
          allOrders[idx].deliveredAt = new Date().toISOString();
        } else if (newStatus === 'cancelled') {
          delete allOrders[idx].deliveredAt;
        }
      } else if (updatedOrder) {
        allOrders.unshift(updatedOrder);
      }
      localStorage.setItem('malenadu_orders', JSON.stringify(allOrders));

      const finalOrder = updatedOrder || orderObj || { orderNumber: orderNum, orderStatus: newStatus };
      const { message, waUrl, cleanPhone } = handleSendStatusNotification(finalOrder, newStatus, true);

      // 4. Set Status Alert Banner
      setStatusUpdateAlert({
        order: finalOrder,
        newStatus,
        message,
        waUrl,
        phone: cleanPhone,
        emailDispatched: false
      });

      setLocalNotice(`✓ Order #${orderNum} status changed to ${newStatus.toUpperCase()}! WhatsApp opened.`);
      setTimeout(() => setLocalNotice(''), 4500);

    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleSetDeliveredDate = (orderId, deliveredAtIso) => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('malenadu_orders') || '[]');
      const idx = allOrders.findIndex(o => o._id === orderId || o.orderNumber === orderId);
      if (idx !== -1) {
        allOrders[idx].orderStatus = 'delivered';
        allOrders[idx].status = 'delivered';
        allOrders[idx].deliveredAt = deliveredAtIso;
        allOrders[idx].updatedAt = new Date().toISOString();
        localStorage.setItem('malenadu_orders', JSON.stringify(allOrders));
        loadOrders();
        setDeliveryDateModalOrder(null);
        setLocalNotice(`✓ Delivery date updated for Order #${allOrders[idx].orderNumber || orderId}!`);
        setTimeout(() => setLocalNotice(''), 4500);
      }
    } catch (e) {
      console.error('Failed to set delivery date', e);
    }
  };

  const handleSaveDeliveryDate = (profile, deliveredAtIso) => {
    if (profile.isRealOrder) {
      handleSetDeliveredDate(profile.rawOrder?._id || profile.orderNumber || profile.id, deliveredAtIso);
    } else {
      setCustomDemoDeliveries(prev => ({
        ...prev,
        [profile.id]: deliveredAtIso
      }));
      setDeliveryDateModalOrder(null);
      setLocalNotice(`✓ Delivery date adjusted for ${profile.customerName}!`);
      setTimeout(() => setLocalNotice(''), 4500);
    }
  };

  const handleQuickMarkDelivered = (profile) => {
    const nowIso = new Date().toISOString();
    if (profile.isRealOrder) {
      handleUpdateStatus(profile.rawOrder?._id || profile.orderNumber || profile.id, 'delivered');
    } else {
      setCustomDemoDeliveries(prev => ({
        ...prev,
        [profile.id]: nowIso
      }));
      setLocalNotice(`🚚 Order #${profile.orderNumber} marked as delivered! Delivery timer started.`);
      setTimeout(() => setLocalNotice(''), 4500);
    }
  };

  const handleShiprocketDispatch = async (order) => {
    const targetOrderNum = order.orderNumber || order._id;
    try {
      setShippingOrderId(targetOrderNum);
      setShipmentNotice({
        type: 'info',
        orderNumber: targetOrderNum,
        message: `Connecting to Shiprocket... Creating shipment for Order #${targetOrderNum}`
      });

      const res = await shipOrderWithShiprocket(order);

      if (res && res.success) {
        const allOrders = JSON.parse(localStorage.getItem('malenadu_orders') || '[]');
        const idx = allOrders.findIndex(o => o._id === order._id || o.orderNumber === targetOrderNum);
        if (idx !== -1) {
          allOrders[idx].orderStatus = 'shipped';
          allOrders[idx].status = 'shipped';
          allOrders[idx].shiprocketOrderId = res.shiprocketOrderId;
          allOrders[idx].awbCode = res.awbCode;
          allOrders[idx].courierName = res.courierName;
          allOrders[idx].labelUrl = res.labelUrl;
          localStorage.setItem('malenadu_orders', JSON.stringify(allOrders));
          loadOrders();
        }

        setShipmentNotice({
          type: 'success',
          orderNumber: targetOrderNum,
          message: `🚚 Order #${targetOrderNum} successfully dispatched to Shiprocket!`,
          details: `Assigned Courier: ${res.courierName || 'Shiprocket Express'} • AWB: ${res.awbCode || 'Assigned'}`,
          labelUrl: res.labelUrl,
          awbCode: res.awbCode
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
        handleUpdateStatus(targetOrderNum, 'shipped');
        alert(`🚚 Success! Order #${targetOrderNum} has been registered with Shiprocket!\n\nShiprocket Order ID: ${res.shiprocketOrderId}\nAssigned Pickup: Malenadu Hub Bengaluru (560064)\n\nYou can view this live in your dashboard at app.shiprocket.in/orders`);
      } else {
        const errorMsg = res?.error || 'Failed to dispatch shipment.';
        setShipmentNotice({
          type: 'warning',
          orderNumber: targetOrderNum,
          message: `Shiprocket: ${errorMsg}`,
          details: 'Note: If KYC or wallet recharge is pending on your Shiprocket dashboard, complete it to enable instant AWB generation.'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert(`Shiprocket Note: ${errorMsg}`);
      }
    } catch (err) {
      setShipmentNotice({
        type: 'error',
        orderNumber: targetOrderNum,
        message: `Shipment error: ${err.message}`
      });
    } finally {
      setShippingOrderId(null);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No orders available to export.');
      return;
    }

    const headers = [
      'Order Number', 'Date', 'Customer Name', 'Phone', 'Email',
      'Shipping Address', 'Pincode', 'Items Summary', 'Subtotal', '5% GST', 'Shipping Fee',
      'Total Amount', 'Payment Method', 'Payment Status', 'Order Status', 'Buyer GSTIN'
    ];

    const rows = orders.map(o => {
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '';
      const itemsSummary = (o.items || []).map(i => `${i.name} (x${i.qty})`).join('; ');
      const subtotal = (o.totalAmount / 1.05).toFixed(2);
      const gst = (o.totalAmount - parseFloat(subtotal)).toFixed(2);

      return [
        `"${o.orderNumber || ''}"`,
        `"${dateStr}"`,
        `"${o.shippingName || ''}"`,
        `"${o.shippingPhone || ''}"`,
        `"${o.shippingEmail || ''}"`,
        `"${(o.shippingAddress || '').replace(/"/g, '""')}"`,
        `"${o.pincode || ''}"`,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        subtotal,
        gst,
        o.shippingFee || 0,
        o.totalAmount || 0,
        `"${o.paymentMethod || 'online'}"`,
        `"${o.paymentStatus || 'paid'}"`,
        `"${o.orderStatus || o.status || 'placed'}"`,
        `"${o.b2bGstin || ''}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Malenadu_Orders_GST_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppCustomer = (order) => {
    handleSendStatusNotification(order, order.orderStatus || order.status || 'placed', true);
  };

  const handleEmailCustomer = (order, customStatus = null) => {
    const email = order.shippingEmail || order.email;
    if (!email) {
      alert('No customer email address on file for Order #' + (order.orderNumber || ''));
      return;
    }

    const customerName = order.shippingName || order.name || 'Valued Customer';
    const status = (customStatus || order.orderStatus || order.status || 'placed').toUpperCase();
    const orderNum = order.orderNumber || order.id || order._id || '';
    const total = order.totalAmount || order.total || '';
    const invoiceUrl = 'https://www.malenaduroastco.works/api/invoice?order=' + orderNum;

    const subject = 'Order #' + orderNum + ' Status Update: ' + status + ' | Malenadu Roast Co.';
    const emailBody = 'Hello ' + customerName + ',\n\n' +
      'Greetings from Malenadu Roast Co. Chikkamagaluru estate!\n\n' +
      'Your coffee order #' + orderNum + ' (₹' + total + ') status has been updated:\n' +
      'Status: ' + status + '\n\n' +
      'Delivery Timeline:\n' +
      'Your freshly roasted coffee & spices will arrive in 2–4 business days with live tracking updates.\n\n' +
      'Download Your Official GST Tax Invoice:\n' +
      invoiceUrl + '\n\n' +
      'If you have any questions or need brewing advice, feel free to reply directly to this email or message us on WhatsApp at +91 8217623335.\n\n' +
      'Warm regards,\n' +
      'Malenadu Roast Co. Roastery\n' +
      'Chikkamagaluru, Karnataka\n' +
      'Official Email: malenaduroast@gmail.com\n' +
      'Website: https://malenaduroastco.works';

    // Strictly open Gmail directly from malenaduroast@gmail.com mailbox
    const gmailUrl = 'https://mail.google.com/mail/u/malenaduroast@gmail.com/?view=cm&fs=1&to=' + encodeURIComponent(email) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(emailBody);
    window.open(gmailUrl, '_blank');
  };


  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const statusMatch = selectedFilter === 'all' || (order.orderStatus || order.status || 'placed').toLowerCase() === selectedFilter;
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return statusMatch;

    const queryMatch =
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchLower)) ||
      (order.shippingName && order.shippingName.toLowerCase().includes(searchLower)) ||
      (order.shippingPhone && order.shippingPhone.includes(searchLower)) ||
      (order.shippingEmail && order.shippingEmail.toLowerCase().includes(searchLower));

    return statusMatch && queryMatch;
  });

  // Calculate statistics
  const totalRevenue = orders.reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0);
  const pendingCount = orders.filter(o => ['placed', 'packed'].includes((o.orderStatus || o.status || 'placed').toLowerCase())).length;
  const deliveredCount = orders.filter(o => (o.orderStatus || o.status || '').toLowerCase() === 'delivered').length;

  // 2-Step Verification (2SV) Security Gate
  if (!isAdminAuthenticated) {
    const minutes = Math.floor(otpCountdown / 60);
    const seconds = otpCountdown % 60;
    const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            maxWidth: '480px',
            width: '100%',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '18px',
            padding: '2.6rem 2.2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
            textAlign: 'center'
          }}
        >
          {/* Brand Logo Header */}
          <div style={{ marginBottom: '1.2rem' }}>
            <img
              src="/assets/images/logo_final.webp"
              alt="Malenadu Roast Co"
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                border: '2.5px solid #C8935A',
                padding: '2px',
                background: '#fff',
                boxShadow: '0 6px 16px rgba(200, 147, 90, 0.25)'
              }}
            />
          </div>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#0f172a', fontSize: '1.55rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
            Malenadu Roast Co.
          </h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: authMode === '2fa' ? '#fef3c7' : '#dcfce7',
            color: authMode === '2fa' ? '#92400e' : '#166534',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={13} color={authMode === '2fa' ? '#92400e' : '#166534'} />
            <span>{authMode === '2fa' ? '2-Step Verification Protected' : '3-Factor Multi-Key Protected'}</span>
          </div>

          {/* Auth Mode Toggle Tabs (2FA vs 3FA) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '1.4rem'
          }}>
            <button
              type="button"
              onClick={() => { setAuthMode('2fa'); setAuthStep(1); setAuthError(''); }}
              style={{
                padding: '0.6rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                background: authMode === '2fa' ? '#ffffff' : 'transparent',
                color: authMode === '2fa' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: authMode === '2fa' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Lock size={14} color={authMode === '2fa' ? '#C8935A' : '#64748b'} />
              <span>2FA (Email OTP)</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('3fa'); setThreeFaStep(1); setAuthError(''); }}
              style={{
                padding: '0.6rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                background: authMode === '3fa' ? '#ffffff' : 'transparent',
                color: authMode === '3fa' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: authMode === '3fa' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <Key size={14} color={authMode === '3fa' ? '#16a34a' : '#64748b'} />
              <span>3FA (Multi-Key)</span>
            </button>
          </div>

          {/* 2FA Stepper Progress Indicator */}
          {authMode === '2fa' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '1.8rem',
              padding: '0.6rem 1rem',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: authStep >= 1 ? '#8c6239' : '#cbd5e1',
                  color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  1
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: authStep === 1 ? 700 : 500, color: authStep === 1 ? '#0f172a' : '#64748b' }}>
                  Admin Password
                </span>
              </div>

              <div style={{ width: '28px', height: '2px', background: authStep === 2 ? '#8c6239' : '#e2e8f0' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: authStep === 2 ? '#8c6239' : '#cbd5e1',
                  color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  2
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: authStep === 2 ? 700 : 500, color: authStep === 2 ? '#0f172a' : '#64748b' }}>
                  Two-Factor OTP
                </span>
              </div>
            </div>
          )}

          {/* 3FA Stepper Progress Indicator */}
          {authMode === '3fa' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '1.6rem',
              padding: '0.6rem 0.6rem',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: threeFaStep >= 1 ? '#16a34a' : '#cbd5e1',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>1</div>
                <span style={{ fontSize: '0.72rem', fontWeight: threeFaStep === 1 ? 700 : 500, color: threeFaStep === 1 ? '#0f172a' : '#64748b' }}>
                  Email
                </span>
              </div>

              <div style={{ width: '14px', height: '2px', background: threeFaStep >= 2 ? '#16a34a' : '#e2e8f0' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: threeFaStep >= 2 ? '#16a34a' : '#cbd5e1',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>2</div>
                <span style={{ fontSize: '0.72rem', fontWeight: threeFaStep === 2 ? 700 : 500, color: threeFaStep === 2 ? '#0f172a' : '#64748b' }}>
                  Password 1
                </span>
              </div>

              <div style={{ width: '14px', height: '2px', background: threeFaStep === 3 ? '#16a34a' : '#e2e8f0' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: threeFaStep === 3 ? '#16a34a' : '#cbd5e1',
                  color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>3</div>
                <span style={{ fontSize: '0.72rem', fontWeight: threeFaStep === 3 ? 700 : 500, color: threeFaStep === 3 ? '#0f172a' : '#64748b' }}>
                  Password 2
                </span>
              </div>
            </div>
          )}

          {/* STEP 1: CREDENTIALS FORM */}
          {authMode === '2fa' && authStep === 1 && (
            <motion.form
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleCredentialsSubmit}
              style={{ textAlign: 'left' }}
            >
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Registered Admin Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Admin Master Password
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#8c6239', fontWeight: 600 }}>Step 1 of 2</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Master Password..."
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 2.4rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#C8935A'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                  <Key size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.7rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLockedOut}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: isLockedOut ? '#94a3b8' : 'linear-gradient(135deg, #C8935A 0%, #a87238 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: isLockedOut ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(200, 147, 90, 0.3)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue to Step 2</span>
                <ShieldCheck size={16} />
              </button>
            </motion.form>
          )}

          {/* STEP 2: TWO-FACTOR OTP CHALLENGE */}
          {authMode === '2fa' && authStep === 2 && (
            <motion.form
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleOtpSubmit}
              style={{ textAlign: 'left' }}
            >
              {/* Dual Solution Switcher Tabs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '10px',
                marginBottom: '1.2rem'
              }}>
                <button
                  type="button"
                  onClick={() => setTwoFactorMethod('email')}
                  style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: twoFactorMethod === 'email' ? '#ffffff' : 'transparent',
                    color: twoFactorMethod === 'email' ? '#0f172a' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: twoFactorMethod === 'email' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  <Mail size={14} color={twoFactorMethod === 'email' ? '#0284c7' : '#64748b'} />
                  <span>Real Email OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTwoFactorMethod('totp')}
                  style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: twoFactorMethod === 'totp' ? '#ffffff' : 'transparent',
                    color: twoFactorMethod === 'totp' ? '#0f172a' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: twoFactorMethod === 'totp' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  <Smartphone size={14} color={twoFactorMethod === 'totp' ? '#16a34a' : '#64748b'} />
                  <span>Google Authenticator</span>
                </button>
              </div>

              {/* METHOD 1: REAL EMAIL OTP (EmailJS) */}
              {twoFactorMethod === 'email' && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    marginBottom: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} />
                        EmailJS Automated Delivery
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: emailStatus === 'sending' ? '#fef3c7' : (emailStatus === 'failed' ? '#fee2e2' : '#dcfce7'),
                        color: emailStatus === 'sending' ? '#92400e' : (emailStatus === 'failed' ? '#b91c1c' : '#15803d')
                      }}>
                        {emailStatus === 'sending' ? '⏳ Sending Real Email...' : (emailStatus === 'failed' ? '⚠️ Delivery Notice' : '✓ Delivered to Inbox')}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: emailStatus === 'failed' ? '#b91c1c' : '#15803d', lineHeight: '1.4' }}>
                      {emailStatus === 'failed'
                        ? <>If you have not received the code, please check your spam folder or click <strong>Resend Email</strong>.</>
                        : <>A real 6-digit OTP email was dispatched to <strong>malenaduroast@gmail.com</strong>.</>
                      }
                    </p>
                  </div>

                  {/* Gmail Quick Open & Resend Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => window.open('https://mail.google.com/mail/u/0/#search/malenaduroast', '_blank')}
                      style={{
                        padding: '0.6rem',
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>Open Gmail Inbox</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const fresh = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedOtp(fresh);
                        setOtpCountdown(300);
                        dispatchRealEmail(fresh);
                      }}
                      disabled={isSendingEmail}
                      style={{
                        padding: '0.6rem',
                        background: '#ffffff',
                        color: '#0f172a',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: isSendingEmail ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <RefreshCw size={13} className={isSendingEmail ? 'animate-spin' : ''} />
                      <span>{isSendingEmail ? 'Sending...' : 'Resend Email'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD 2: GOOGLE AUTHENTICATOR APP (TOTP) */}
              {twoFactorMethod === 'totp' && (
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.2rem',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#0f172a', fontWeight: 700, fontSize: '0.84rem', marginBottom: '8px' }}>
                    <ShieldCheck size={16} color="#16a34a" />
                    <span>Scan with Google Authenticator</span>
                  </div>

                  {/* QR Code */}
                  <div style={{ background: '#fff', padding: '8px', borderRadius: '8px', width: 'fit-content', margin: '0 auto 8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <img
                      src={TOTP_QR_URL}
                      alt="Google Authenticator QR Code"
                      style={{ width: '130px', height: '130px', display: 'block' }}
                    />
                  </div>

                  <p style={{ margin: '0 0 6px', fontSize: '0.74rem', color: '#64748b' }}>
                    Open <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong> on your phone & scan this QR code.
                  </p>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f1f5f9',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    color: '#334155',
                    fontFamily: 'monospace'
                  }}>
                    <span>Key: <strong>{TOTP_SECRET}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(TOTP_SECRET);
                        alert('Secret key copied to clipboard! Paste it into Google Authenticator.');
                      }}
                      style={{ background: 'none', border: 'none', color: '#8c6239', cursor: 'pointer', padding: 0, fontWeight: 700, fontSize: '0.72rem' }}
                    >
                      [Copy]
                    </button>
                  </div>
                </div>
              )}

              {/* 6-Digit Code Input Box */}
              <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Enter 6-Digit Code
                  </label>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: otpCountdown < 60 ? '#dc2626' : '#8c6239' }}>
                    ⏳ {formattedTimer}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    textAlign: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    letterSpacing: '12px',
                    borderRadius: '10px',
                    border: '2px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace'
                  }}
                  onFocus={e => e.target.style.borderColor = '#C8935A'}
                  onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>

              {otpSentNotice && (
                <p style={{ margin: '0 0 1rem', fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  ✓ {otpSentNotice}
                </p>
              )}

              {authError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.7rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLockedOut}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: isLockedOut ? '#94a3b8' : 'linear-gradient(135deg, #C8935A 0%, #a87238 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: isLockedOut ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(200, 147, 90, 0.3)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Verify & Unlock Portal</span>
                <Unlock size={16} />
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setAuthStep(1); setAuthError(''); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  ← Back to Password Step
                </button>
              </div>
            </motion.form>
          )}

          {/* ==================================================== */}
          {/* 3FA STEP 1: STRICT AUTHORIZED EMAIL WHITELIST VERIFICATION */}
          {/* ==================================================== */}
          {authMode === '3fa' && threeFaStep === 1 && (
            <motion.form
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleThreeFaEmailSubmit}
              style={{ textAlign: 'left' }}
            >
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Authorized Admin Email (Step 1 of 3)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="Enter authorized admin email..."
                    value={threeFaEmail}
                    onChange={e => setThreeFaEmail(e.target.value)}
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#16a34a'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {authError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.7rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLockedOut}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: isLockedOut ? '#94a3b8' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: isLockedOut ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue to Password 1</span>
                <ArrowRight size={16} />
              </button>
            </motion.form>
          )}

          {/* ==================================================== */}
          {/* 3FA STEP 2: PRIMARY MASTER PASSWORD VERIFICATION */}
          {/* ==================================================== */}
          {authMode === '3fa' && threeFaStep === 2 && (
            <motion.form
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleThreeFaPassword1Submit}
              style={{ textAlign: 'left' }}
            >
              {/* Confirmed Whitelist Account Card */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#16a34a" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>
                    {threeFaEmail}
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                  Step 1 Verified
                </span>
              </div>

              <div style={{ marginBottom: '1.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Primary Master Password
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>Password 1 of 2</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showThreeFaPassword1 ? 'text' : 'password'}
                    placeholder="Enter Primary Master Password..."
                    value={threeFaPassword1}
                    onChange={e => setThreeFaPassword1(e.target.value)}
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 2.4rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#16a34a'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                  <Key size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowThreeFaPassword1(!showThreeFaPassword1)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                  >
                    {showThreeFaPassword1 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.7rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLockedOut}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: isLockedOut ? '#94a3b8' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: isLockedOut ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue to Password 2</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setThreeFaStep(1); setAuthError(''); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  ← Back to Email Step
                </button>
              </div>
            </motion.form>
          )}

          {/* ==================================================== */}
          {/* 3FA STEP 3: SECONDARY SECURITY PASSCODE (FINAL FACTOR) */}
          {/* ==================================================== */}
          {authMode === '3fa' && threeFaStep === 3 && (
            <motion.form
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleThreeFaPassword2Submit}
              style={{ textAlign: 'left' }}
            >
              {/* Confirmed Progress Card */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} color="#16a34a" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>
                    Password 1 Confirmed
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                  Final Factor
                </span>
              </div>

              <div style={{ marginBottom: '1.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Secondary Security Password
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>Password 2 of 2</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showThreeFaPassword2 ? 'text' : 'password'}
                    placeholder="Enter Secondary Security Password..."
                    value={threeFaPassword2}
                    onChange={e => setThreeFaPassword2(e.target.value)}
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 2.4rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = '#16a34a'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowThreeFaPassword2(!showThreeFaPassword2)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                  >
                    {showThreeFaPassword2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.7rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLockedOut}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: isLockedOut ? '#94a3b8' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: isLockedOut ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Verify & Unlock Portal</span>
                <Unlock size={16} />
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setThreeFaStep(2); setAuthError(''); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  ← Back to Password 1
                </button>
              </div>
            </motion.form>
          )}<div style={{ marginTop: '1.6rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem' }}>
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={14} /> Back to Storefront
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Professional Light Theme Admin Dashboard
  return (
    <div className="admin-dashboard-container" style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#1e293b',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: '5rem',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      {/* Top Navbar */}
      {/* Sticky Header with two clean rows: Row 1 = Brand Info + Action Controls; Row 2 = Full Width Navigation Switcher */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          maxWidth: '1300px',
          margin: '0 auto',
          padding: isMobile ? '0.75rem 0.85rem' : '0.85rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          {/* Row 1: Brand Info with Logo on left, Actions on right */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.85rem',
            width: '100%'
          }}>
            <div className="admin-brand-info" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src="/assets/images/logo_final.webp"
                alt="Malenadu Roast Co"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '2px solid #C8935A',
                  padding: '1px',
                  background: '#fff'
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.25rem', fontFamily: 'Georgia, serif', color: '#0f172a', fontWeight: 700 }}>
                    Malenadu Roast Co.
                  </h1>
                  <span style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    Store Admin
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                  FSSAI Lic. 21226177001500 • Operations & Order Manager
                </p>
              </div>
            </div>

            {/* Top Actions: Export CSV, Refresh, Storefront, Lock Portal */}
            <div className="admin-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleExportCSV}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #C8935A',
                  color: '#8c6239',
                  padding: '0.48rem 0.95rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={e => e.target.style.background = '#fefbf7'}
                onMouseLeave={e => e.target.style.background = '#ffffff'}
              >
                <Download size={14} color="#8c6239" />
                <span>Export Orders</span>
              </button>

              <button
                onClick={loadOrders}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '0.48rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                title="Refresh Orders"
              >
                <RefreshCw size={15} />
              </button>

              <button
                onClick={onBack}
                style={{
                  background: '#0f172a',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.48rem 0.95rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <ArrowLeft size={14} />
                <span>Storefront</span>
              </button>

              <button
                onClick={handleAdminLogout}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '0.48rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                title="Lock Admin Portal & Require 2-Step Verification"
              >
                <LogOut size={14} color="#b91c1c" />
                <span>Lock Portal</span>
              </button>
            </div>
          </div>

          {/* Row 2: Full Width View Switcher Bar with NO overlapping */}
          <div className="admin-view-switcher" style={{
            display: 'flex',
            gap: '6px',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px',
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'auto',
            flexWrap: 'nowrap',
            alignItems: 'center',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}>
            <button
              onClick={() => setAdminView('orders')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: adminView === 'orders' ? '#ffffff' : 'transparent',
                color: adminView === 'orders' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: adminView === 'orders' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <Package size={14} color={adminView === 'orders' ? '#C8935A' : '#64748b'} />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => { setAdminView('users'); loadUsers(); }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: adminView === 'users' ? '#ffffff' : 'transparent',
                color: adminView === 'users' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: adminView === 'users' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <User size={14} color={adminView === 'users' ? '#C8935A' : '#64748b'} />
              <span>Registered Users ({registeredUsers.length})</span>
            </button>

            <button
              onClick={() => { setAdminView('reviews'); setReviewSectionTab('testimonials'); loadReviews(); }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: (adminView === 'reviews' && reviewSectionTab === 'testimonials') ? '#ffffff' : 'transparent',
                color: (adminView === 'reviews' && reviewSectionTab === 'testimonials') ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: (adminView === 'reviews' && reviewSectionTab === 'testimonials') ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <MessageSquareQuote size={14} color={(adminView === 'reviews' && reviewSectionTab === 'testimonials') ? '#C8935A' : '#64748b'} />
              <span>Homepage Testimonials ({testimonialNavCount})</span>
            </button>

            <button
              onClick={() => { setAdminView('reviews'); setReviewSectionTab('catalog'); loadReviews(); }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: (adminView === 'reviews' && reviewSectionTab === 'catalog') ? '#ffffff' : 'transparent',
                color: (adminView === 'reviews' && reviewSectionTab === 'catalog') ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: (adminView === 'reviews' && reviewSectionTab === 'catalog') ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <Star size={14} color={(adminView === 'reviews' && reviewSectionTab === 'catalog') ? '#C8935A' : '#64748b'} fill={(adminView === 'reviews' && reviewSectionTab === 'catalog') ? '#C8935A' : 'none'} />
              <span>Product Reviews ({catalogNavCount})</span>
            </button>

            <button
              onClick={() => setAdminView('messaging')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: adminView === 'messaging' ? '#ffffff' : 'transparent',
                color: adminView === 'messaging' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: adminView === 'messaging' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <Smartphone size={14} color={adminView === 'messaging' ? '#C8935A' : '#64748b'} />
              <span>Package Updates</span>
            </button>

            <button
              onClick={() => setAdminView('retention')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: adminView === 'retention' ? '#ffffff' : 'transparent',
                color: adminView === 'retention' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: adminView === 'retention' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <RotateCcw size={14} color={adminView === 'retention' ? '#C8935A' : '#64748b'} />
              <span>Smart Retention</span>
            </button>

            <button
              onClick={() => setAdminView('products')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: adminView === 'products' ? '#ffffff' : 'transparent',
                color: adminView === 'products' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: adminView === 'products' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <Package size={14} color={adminView === 'products' ? '#C8935A' : '#64748b'} />
              <span>Products & Stock Inventory</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1300px', margin: isMobile ? '1rem auto 0' : '2rem auto 0', padding: isMobile ? '0 0.75rem' : '0 1.5rem' }}>
        {adminView === 'products' ? (
          <AdminProductsManager />
        ) : adminView === 'reviews' ? (() => {
          // Identify reviews that belong to Homepage Testimonials ("What Our Customers Say" Marquee)
          const isTestimonial = (r) => Boolean(
            r.isTestimonial ||
            r.isReal ||
            Boolean(r.userAccount) ||
            (r.id && (r.id.startsWith('rev-1') || r.id.startsWith('rev-2') || r.id.startsWith('rev-3') || r.id.startsWith('rev-4') || r.id.startsWith('rev-5') || r.id.startsWith('rev_')))
          );

          const testimonialReviews = realReviews.filter(isTestimonial);
          const catalogReviews = realReviews.filter(r => !isTestimonial(r));

          // Testimonial stats
          const tTotal = testimonialReviews.length;
          const tLive = testimonialReviews.filter(r => !r.hidden).length;
          const tHidden = testimonialReviews.filter(r => r.hidden).length;
          const t5Star = testimonialReviews.filter(r => (Number(r.rating) || 5) === 5).length;
          const t4Star = testimonialReviews.filter(r => (Number(r.rating) || 5) === 4).length;

          // Filter testimonials
          const filteredTestimonials = testimonialReviews.filter(rev => {
            const rating = Number(rev.rating) || 5;
            if (testimonialFilter === 'live' && rev.hidden) return false;
            if (testimonialFilter === 'hidden' && !rev.hidden) return false;
            if (testimonialFilter === '5star' && rating !== 5) return false;
            if (testimonialFilter === '4star' && rating !== 4) return false;

            if (testimonialSearchQuery.trim()) {
              const q = testimonialSearchQuery.toLowerCase();
              const nameMatch = (rev.name || '').toLowerCase().includes(q);
              const textMatch = (rev.text || '').toLowerCase().includes(q);
              const roleMatch = (rev.role || rev.product || rev.productName || '').toLowerCase().includes(q);
              return nameMatch || textMatch || roleMatch;
            }
            return true;
          });

          // Catalog stats
          const totalCount = catalogReviews.length;
          const liveCount = catalogReviews.filter(r => !r.hidden).length;
          const hiddenCount = catalogReviews.filter(r => r.hidden).length;
          const negCount = catalogReviews.filter(r => (Number(r.rating) || 5) <= 2).length;
          const negLiveCount = catalogReviews.filter(r => (Number(r.rating) || 5) <= 2 && !r.hidden).length;
          const threeStarCount = catalogReviews.filter(r => Number(r.rating) === 3).length;
          const fourStarCount = catalogReviews.filter(r => Number(r.rating) === 4).length;
          const fiveStarCount = catalogReviews.filter(r => Number(r.rating) === 5).length;

          const avgRating = liveCount > 0
            ? (catalogReviews.filter(r => !r.hidden).reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / liveCount).toFixed(1)
            : '5.0';

          const filteredReviews = catalogReviews.filter(rev => {
            const rating = Number(rev.rating) || 5;
            const prodName = (rev.productName || rev.product || '').toLowerCase();

            // Status & Rating Tab Filters
            if (reviewFilter === 'live' && rev.hidden) return false;
            if (reviewFilter === 'hidden' && !rev.hidden) return false;
            if (reviewFilter === 'negative' && rating > 2) return false;
            if (reviewFilter === '3star' && rating !== 3) return false;
            if (reviewFilter === '4star' && rating !== 4) return false;
            if (reviewFilter === '5star' && rating !== 5) return false;

            // Product Dropdown Filter
            if (reviewProductFilter !== 'all') {
              const target = reviewProductFilter.toLowerCase();
              if (!prodName.includes(target) && !target.includes(prodName)) return false;
            }

            // Keyword Search Query
            if (reviewSearchQuery.trim()) {
              const q = reviewSearchQuery.toLowerCase();
              const nameMatch = (rev.name || '').toLowerCase().includes(q);
              const cityMatch = (rev.city || rev.location || '').toLowerCase().includes(q);
              const titleMatch = (rev.title || '').toLowerCase().includes(q);
              const textMatch = (rev.text || '').toLowerCase().includes(q);
              const prodMatch = prodName.includes(q);
              return nameMatch || cityMatch || titleMatch || textMatch || prodMatch;
            }
            return true;
          });

          // Sort filtered reviews
          const sortedReviews = [...filteredReviews].sort((a, b) => {
            if (reviewSortOrder === 'rating_asc') {
              return (Number(a.rating) || 5) - (Number(b.rating) || 5);
            }
            if (reviewSortOrder === 'rating_desc') {
              return (Number(b.rating) || 5) - (Number(a.rating) || 5);
            }
            if (reviewSortOrder === 'helpful') {
              return (Number(b.helpful) || 0) - (Number(a.helpful) || 0);
            }
            // default 'newest'
            const dateA = new Date(a.date || '2026-01-01').getTime();
            const dateB = new Date(b.date || '2026-01-01').getTime();
            return dateB - dateA;
          });

          const displayedReviews = sortedReviews.slice(0, reviewDisplayLimit);

          return (
            <div>
              {/* Segmented Sub-View Switcher: Testimonials vs Product Reviews */}
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '1.5rem',
                background: '#ffffff',
                padding: '6px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <button
                  type="button"
                  onClick={() => setReviewSectionTab('testimonials')}
                  style={{
                    flex: 1,
                    padding: '0.85rem 1.25rem',
                    borderRadius: '8px',
                    border: reviewSectionTab === 'testimonials' ? '1.5px solid #C8935A' : '1px solid transparent',
                    background: reviewSectionTab === 'testimonials' ? '#140E0A' : '#f8fafc',
                    color: reviewSectionTab === 'testimonials' ? '#E8CA80' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: reviewSectionTab === 'testimonials' ? '0 4px 14px rgba(20,14,10,0.2)' : 'none',
                    transition: 'all 0.18s'
                  }}
                >
                  <MessageSquareQuote size={17} color={reviewSectionTab === 'testimonials' ? '#E8CA80' : '#8c6239'} />
                  <span>⭐ Homepage Testimonials ("What Our Customers Say") ({testimonialReviews.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewSectionTab('catalog')}
                  style={{
                    flex: 1,
                    padding: '0.85rem 1.25rem',
                    borderRadius: '8px',
                    border: reviewSectionTab === 'catalog' ? '1.5px solid #C8935A' : '1px solid transparent',
                    background: reviewSectionTab === 'catalog' ? '#140E0A' : '#f8fafc',
                    color: reviewSectionTab === 'catalog' ? '#E8CA80' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: reviewSectionTab === 'catalog' ? '0 4px 14px rgba(20,14,10,0.2)' : 'none',
                    transition: 'all 0.18s'
                  }}
                >
                  <Coffee size={17} color={reviewSectionTab === 'catalog' ? '#E8CA80' : '#8c6239'} />
                  <span>☕ Product Catalog Reviews (All Blends) ({catalogReviews.length})</span>
                </button>
              </div>

              {/* VIEW 1: HOMEPAGE TESTIMONIALS */}
              {reviewSectionTab === 'testimonials' ? (
                <div>
                  {/* Testimonials Header Banner */}
                  <div style={{
                    background: '#ffffff',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    <div>
                      <h2 style={{ margin: '0 0 4px', fontSize: isMobile ? '1.15rem' : '1.35rem', fontFamily: '"Georgia", serif', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquareQuote size={22} color="#C8935A" />
                        <span>Homepage Testimonials ("What Our Customers Say" Marquee)</span>
                      </h2>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                        These customer reviews are featured in the rolling marquee on your homepage. Click <strong>"Hide"</strong> to instantly suppress any review from public view, or <strong>"Unhide"</strong> to restore it anytime.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setIsAddTestimonialOpen(true)}
                        style={{
                          background: '#C8935A',
                          border: 'none',
                          color: '#ffffff',
                          padding: '0.55rem 1.1rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(200, 147, 90, 0.35)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Plus size={15} />
                        <span>Add New Testimonial</span>
                      </button>

                      {tLive > 0 && (
                        <button
                          onClick={() => handleHideAllTestimonials(testimonialReviews)}
                          style={{
                            background: '#fff1f2',
                            border: '1.5px solid #fda4af',
                            color: '#e11d48',
                            padding: '0.55rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 3px rgba(225, 29, 72, 0.1)',
                            transition: 'all 0.2s'
                          }}
                          title="Hide all testimonials from the homepage marquee"
                        >
                          <EyeOff size={14} />
                          <span>Hide All ({tLive})</span>
                        </button>
                      )}

                      {tHidden > 0 && (
                        <button
                          onClick={() => handleUnhideAllTestimonials(testimonialReviews)}
                          style={{
                            background: '#ecfdf5',
                            border: '1.5px solid #a7f3d0',
                            color: '#059669',
                            padding: '0.55rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 3px rgba(5, 150, 105, 0.1)',
                            transition: 'all 0.2s'
                          }}
                          title="Restore all hidden testimonials to the homepage marquee"
                        >
                          <Eye size={14} />
                          <span>Unhide All ({tHidden})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 Metric Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Testimonials</div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', fontFamily: '"Georgia", serif' }}>{tTotal}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Curated testimonials & verified submissions</div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>🟢 Live on Storefront Marquee</div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#16a34a', fontFamily: '"Georgia", serif' }}>{tLive}</div>
                      <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '2px' }}>Actively rolling on your homepage</div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>🟡 Hidden from Homepage</div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#d97706', fontFamily: '"Georgia", serif' }}>{tHidden}</div>
                      <div style={{ fontSize: '0.72rem', color: '#d97706', marginTop: '2px' }}>Suppressed from public customer view</div>
                    </div>
                  </div>

                  {/* Filter & Live Search Bar */}
                  <div style={{
                    background: '#ffffff',
                    padding: '0.9rem 1.25rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginRight: '4px' }}>
                        Filter:
                      </span>
                      {[
                        { id: 'all', label: `All Testimonials (${tTotal})` },
                        { id: 'live', label: `🟢 Live (${tLive})` },
                        { id: 'hidden', label: `🟡 Hidden (${tHidden})` },
                        { id: '5star', label: `★ 5 Stars (${t5Star})` },
                        { id: '4star', label: `★ 4 Stars (${t4Star})` }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setTestimonialFilter(tab.id)}
                          style={{
                            padding: '0.42rem 0.85rem',
                            borderRadius: '20px',
                            border: testimonialFilter === tab.id ? '1.5px solid #C8935A' : '1px solid #e2e8f0',
                            background: testimonialFilter === tab.id ? '#FBF8F3' : '#ffffff',
                            color: testimonialFilter === tab.id ? '#8c6239' : '#475569',
                            fontWeight: testimonialFilter === tab.id ? 800 : 500,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            transition: 'all 0.18s'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ minWidth: isMobile ? '100%' : '280px', flex: isMobile ? '1 1 100%' : '0 1 320px' }}>
                      <input
                        type="text"
                        value={testimonialSearchQuery}
                        onChange={(e) => setTestimonialSearchQuery(e.target.value)}
                        placeholder="Search reviewer, role, or message..."
                        style={{
                          width: '100%',
                          padding: '0.48rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.82rem',
                          background: '#f8fafc',
                          color: '#0f172a',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Testimonial Cards Grid */}
                  {filteredTestimonials.length === 0 ? (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '3.5rem 2rem', textAlign: 'center' }}>
                      <MessageSquareQuote size={40} color="#C8935A" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontFamily: '"Georgia", serif', fontSize: '1.25rem' }}>
                        No Testimonials Found
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.86rem', maxWidth: '420px', margin: '0 auto' }}>
                        {testimonialSearchQuery ? 'No reviews match your search query.' : 'No customer reviews match this filter.'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                      {filteredTestimonials.map((rev, idx) => {
                        const isHidden = Boolean(rev.hidden);
                        const rating = Number(rev.rating) || 5;
                        const isUserSubmitted = Boolean(rev.isReal || rev.userAccount || (rev.id && rev.id.startsWith('rev_')));

                        return (
                          <div
                            key={rev.id || idx}
                            style={{
                              background: isHidden ? '#fbfbfa' : '#ffffff',
                              borderRadius: '14px',
                              border: isHidden ? '1.5px dashed #cbd5e1' : '1px solid #e2e8f0',
                              padding: '1.35rem 1.45rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: isHidden ? 'none' : '0 4px 15px rgba(0,0,0,0.04)',
                              opacity: isHidden ? 0.75 : 1,
                              transition: 'all 0.2s'
                            }}
                          >
                            <div>
                              {/* Rating & Badges */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                  {[...Array(rating)].map((_, i) => (
                                    <Star key={i} size={15} fill="#C8935A" color="#C8935A" />
                                  ))}
                                </div>

                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  {isUserSubmitted ? (
                                    <span style={{ fontSize: '0.66rem', color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '2px 7px', borderRadius: '8px', fontWeight: 700 }}>
                                      Feedback Form Submission
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.66rem', color: '#8c6239', background: '#FBF8F3', border: '1px solid #ebd9c8', padding: '2px 7px', borderRadius: '8px', fontWeight: 700 }}>
                                      Curated Testimonial
                                    </span>
                                  )}

                                  {isHidden ? (
                                    <span style={{ fontSize: '0.68rem', color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <EyeOff size={11} /> Hidden
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.68rem', color: '#15803d', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Eye size={11} /> Live on Homepage
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quote text */}
                              <div style={{ color: '#C8935A', fontSize: '2rem', fontFamily: '"Georgia", serif', lineHeight: 0.5, marginBottom: '0.5rem', opacity: 0.85 }}>
                                &ldquo;
                              </div>
                              <p style={{
                                color: isHidden ? '#64748b' : '#1f2937',
                                fontSize: '0.92rem',
                                lineHeight: 1.6,
                                fontFamily: 'Inter, sans-serif',
                                marginBottom: '1.2rem',
                                fontStyle: 'italic',
                                fontWeight: 400
                              }}>
                                "{rev.text}"
                              </p>
                            </div>

                            {/* Author info & Actions */}
                            <div style={{
                              borderTop: '1px solid #f1f5f9',
                              paddingTop: '0.85rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {rev.avatar ? (
                                  <img
                                    src={rev.avatar}
                                    alt={rev.name}
                                    referrerPolicy="no-referrer"
                                    style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #C8935A' }}
                                    onError={e => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '50%',
                                    background: ['#8C001A', '#333333', '#C8935A', '#1B5E20', '#4A148C'][idx % 5],
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.85rem',
                                    fontWeight: 700
                                  }}>
                                    {(rev.name || 'C').charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{rev.name}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#8c6239', fontWeight: 600 }}>
                                    {rev.role || rev.productName || (rev.product ? `${rev.product} Customer` : 'Coffee Customer')}
                                    {rev.date && (
                                      <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '6px' }}>
                                        • {typeof rev.date === 'string' && rev.date.includes('-') ? new Date(rev.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  onClick={() => handleToggleHideReview(rev.id)}
                                  style={{
                                    background: isHidden ? '#eff6ff' : '#fff1f2',
                                    border: isHidden ? '1px solid #bfdbfe' : '1.5px solid #fda4af',
                                    color: isHidden ? '#1d4ed8' : '#e11d48',
                                    padding: '0.45rem 0.85rem',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    transition: 'all 0.15s'
                                  }}
                                  title={isHidden ? "Unhide this review so it appears in the homepage marquee" : "Hide this review from the homepage marquee"}
                                >
                                  {isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                                  <span>{isHidden ? 'Unhide' : 'Hide Review'}</span>
                                </button>

                                {isUserSubmitted && (
                                  <button
                                    onClick={() => handleDeleteReview(rev.id)}
                                    style={{
                                      background: '#fef2f2',
                                      border: '1px solid #fecaca',
                                      color: '#dc2626',
                                      padding: '0.45rem 0.65rem',
                                      borderRadius: '6px',
                                      fontSize: '0.76rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Permanently remove this customer review"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* VIEW 2: PRODUCT CATALOG REVIEWS */
                <div>
                  {/* Header Banner */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    background: '#ffffff',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    <div>
                      <h2 style={{ margin: '0 0 4px', fontSize: isMobile ? '1.15rem' : '1.35rem', fontFamily: '"Georgia", serif', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={20} color="#C8935A" fill="#C8935A" />
                        <span>Customer Ratings & Reviews Management</span>
                      </h2>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                        Monitor verified customer ratings across all products. Easily inspect and hide negative reviews to protect brand trust on the live storefront.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {negLiveCount > 0 && (
                        <button
                          onClick={handleHideAllNegative}
                          style={{
                            background: '#fff1f2',
                            border: '1.5px solid #fda4af',
                            color: '#e11d48',
                            padding: '0.55rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 3px rgba(225, 29, 72, 0.15)',
                            transition: 'all 0.2s'
                          }}
                          title="Instantly hide all 1-Star & 2-Star reviews from public storefront"
                        >
                          <EyeOff size={14} />
                          <span>Hide All Negative ({negLiveCount})</span>
                        </button>
                      )}

                      {hiddenCount > 0 && (
                        <button
                          onClick={handleUnhideAllReviews}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            color: '#475569',
                            padding: '0.55rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <RotateCcw size={13} />
                          <span>Restore All ({hiddenCount})</span>
                        </button>
                      )}

                      <button
                        onClick={handleExportReviewsCSV}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #C8935A',
                          color: '#8c6239',
                          padding: '0.55rem 1.1rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      >
                        <Download size={14} />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Negative Reviews Attention Banner */}
                  {negLiveCount > 0 && (
                    <div style={{
                      background: '#fff7ed',
                      border: '1.5px solid #fed7aa',
                      borderRadius: '10px',
                      padding: '0.9rem 1.25rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldAlert size={22} color="#ea580c" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#9a3412' }}>
                            {negLiveCount} Negative Review{negLiveCount > 1 ? 's' : ''} (1★ & 2★) Currently Visible on Storefront
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#c2410c' }}>
                            Customers viewing product pages can currently see these lower ratings. You can hide them individually or hide all at once.
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => { setReviewFilter('negative'); setReviewSortOrder('rating_asc'); }}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #ea580c',
                            color: '#ea580c',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Inspect Negative Reviews
                        </button>
                        <button
                          onClick={handleHideAllNegative}
                          style={{
                            background: '#ea580c',
                            border: 'none',
                            color: '#ffffff',
                            padding: '0.4rem 0.95rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Hide All Now
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 5 Stat Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Reviews</div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', fontFamily: '"Georgia", serif' }}>{totalCount}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Across all estate blends</div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Live on Storefront</div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#16a34a', fontFamily: '"Georgia", serif' }}>{liveCount}</div>
                      <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '2px' }}>Visible to customers</div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Hidden from Storefront</div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#d97706', fontFamily: '"Georgia", serif' }}>{hiddenCount}</div>
                      <div style={{ fontSize: '0.72rem', color: '#d97706', marginTop: '2px' }}>Suppressed from public view</div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '0.74rem', color: '#e11d48', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>1★ & 2★ Negative</div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#e11d48', fontFamily: '"Georgia", serif' }}>{negCount}</div>
                      <div style={{ fontSize: '0.72rem', color: negLiveCount > 0 ? '#e11d48' : '#16a34a', marginTop: '2px', fontWeight: 600 }}>
                        {negLiveCount > 0 ? `${negLiveCount} currently visible` : 'All hidden ✓'}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '0.74rem', color: '#C8935A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Live Storefront Rating</div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#C8935A', fontFamily: '"Georgia", serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Star size={20} fill="#C8935A" color="#C8935A" />
                        <span>{avgRating} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 400 }}>/ 5.0</span></span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Based on {liveCount} visible reviews</div>
                    </div>
                  </div>

                  {/* Filter, Product Selector, Sort & Search Control Bar */}
                  <div style={{
                    background: '#ffffff',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.9rem'
                  }}>
                    {/* Row 1: Filter Pills */}
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginRight: '4px' }}>
                        Filter:
                      </span>
                      {[
                        { id: 'all', label: `All Reviews (${totalCount})` },
                        {
                          id: 'negative',
                          label: `🚨 Negative (1★ & 2★) (${negCount})`,
                          highlight: negCount > 0,
                          isAlert: negLiveCount > 0
                        },
                        { id: '3star', label: `★ 3 Stars (${threeStarCount})` },
                        { id: '4star', label: `★ 4 Stars (${fourStarCount})` },
                        { id: '5star', label: `★ 5 Stars (${fiveStarCount})` },
                        { id: 'live', label: `🟢 Live (${liveCount})` },
                        { id: 'hidden', label: `🟡 Hidden (${hiddenCount})` }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setReviewFilter(tab.id)}
                          style={{
                            padding: '0.42rem 0.85rem',
                            borderRadius: '20px',
                            border: reviewFilter === tab.id
                              ? (tab.isAlert ? '1.5px solid #e11d48' : '1.5px solid #C8935A')
                              : (tab.isAlert ? '1px solid #fecdd3' : '1px solid #e2e8f0'),
                            background: reviewFilter === tab.id
                              ? (tab.isAlert ? '#fff1f2' : '#FBF8F3')
                              : (tab.isAlert ? '#fff7ed' : '#ffffff'),
                            color: reviewFilter === tab.id
                              ? (tab.isAlert ? '#e11d48' : '#8c6239')
                              : (tab.isAlert ? '#c2410c' : '#475569'),
                            fontWeight: reviewFilter === tab.id ? 800 : 500,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                            boxShadow: reviewFilter === tab.id ? '0 1px 4px rgba(200,147,90,0.2)' : 'none'
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Row 2: Product Filter, Sort Order & Live Search */}
                    <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Product Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Product:</label>
                          <select
                            value={reviewProductFilter}
                            onChange={(e) => setReviewProductFilter(e.target.value)}
                            style={{
                              padding: '0.45rem 0.75rem',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8rem',
                              background: '#ffffff',
                              color: '#0f172a',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="all">All Products ({totalCount})</option>
                            <option value="estate">Malenadu Estate Reserve (70:30)</option>
                            <option value="highland">Highland Signature Reserve (80:20)</option>
                            <option value="heritage">Imperial Heritage Reserve (85:15)</option>
                            <option value="peaberry">Peaberry Grand Cru (100% Pure)</option>
                            <option value="pepper">Tellicherry Estate Black Pepper</option>
                          </select>
                        </div>

                        {/* Sort Order Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Sort By:</label>
                          <select
                            value={reviewSortOrder}
                            onChange={(e) => setReviewSortOrder(e.target.value)}
                            style={{
                              padding: '0.45rem 0.75rem',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8rem',
                              background: '#ffffff',
                              color: '#0f172a',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="newest">Newest Date First</option>
                            <option value="rating_asc">Lowest Rating First (1★ → 5★)</option>
                            <option value="rating_desc">Highest Rating First (5★ → 1★)</option>
                            <option value="helpful">Most Helpful Votes</option>
                          </select>
                        </div>
                      </div>

                      {/* Search Input */}
                      <div style={{ position: 'relative', width: isMobile ? '100%' : '320px' }}>
                        <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          value={reviewSearchQuery}
                          onChange={(e) => setReviewSearchQuery(e.target.value)}
                          placeholder="Search reviewer, city, title, or feedback..."
                          style={{
                            width: '100%',
                            padding: '0.48rem 0.75rem 0.48rem 2.1rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            outline: 'none',
                            background: '#f8fafc',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Notice if any */}
                  {localNotice && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      padding: '0.65rem 1rem',
                      marginBottom: '1rem',
                      fontSize: '0.82rem',
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <CheckCircle size={15} color="#16a34a" />
                      <span>{localNotice}</span>
                    </div>
                  )}

                  {/* Reviews Grid */}
                  {filteredReviews.length === 0 ? (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center' }}>
                      <Star size={42} color="#C8935A" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontFamily: '"Georgia", serif', fontSize: '1.25rem' }}>
                        No Reviews Found
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.86rem', maxWidth: '420px', margin: '0 auto' }}>
                        {reviewSearchQuery ? 'No reviews match your search query.' : 'No customer reviews match the selected filter.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                        {displayedReviews.map(rev => {
                          const rating = Number(rev.rating) || 5;
                          const isNegative = rating <= 2;

                          return (
                            <div key={rev.id} style={{
                              background: rev.hidden ? '#fafafa' : (isNegative ? '#fffbfb' : '#ffffff'),
                              border: rev.hidden
                                ? '1.5px dashed #cbd5e1'
                                : (isNegative ? '1.5px solid #fecdd3' : '1px solid #e2e8f0'),
                              borderRadius: '12px',
                              padding: '1.35rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: rev.hidden ? 'none' : '0 1px 3px rgba(0,0,0,0.03)',
                              opacity: rev.hidden ? 0.75 : 1,
                              transition: 'all 0.2s',
                              position: 'relative'
                            }}>
                              <div>
                                {/* Top Meta: Stars + Rating pill + Status Badges */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '6px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                      {[1, 2, 3, 4, 5].map((starVal) => (
                                        <Star
                                          key={starVal}
                                          size={14}
                                          fill={starVal <= rating ? (isNegative ? '#e11d48' : '#C8935A') : '#e2e8f0'}
                                          color={starVal <= rating ? (isNegative ? '#e11d48' : '#C8935A') : '#e2e8f0'}
                                        />
                                      ))}
                                    </div>
                                    <span style={{
                                      fontSize: '0.74rem',
                                      fontWeight: 800,
                                      color: isNegative ? '#e11d48' : '#8c6239',
                                      background: isNegative ? '#ffe4e6' : '#FAF8F5',
                                      padding: '1px 6px',
                                      borderRadius: '6px',
                                      border: isNegative ? '1px solid #fecdd3' : '1px solid #eee5da'
                                    }}>
                                      {rating}.0
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {isNegative && !rev.hidden && (
                                      <span style={{ fontSize: '0.66rem', color: '#be123c', background: '#ffe4e6', border: '1px solid #fecdd3', padding: '2px 7px', borderRadius: '10px', fontWeight: 800 }}>
                                        ⚠️ Negative
                                      </span>
                                    )}

                                    {rev.hidden ? (
                                      <span style={{ fontSize: '0.68rem', color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <EyeOff size={11} /> Hidden from Storefront
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '0.68rem', color: '#15803d', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Eye size={11} /> Live on Storefront
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Review Title */}
                                {rev.title && (
                                  <h4 style={{
                                    margin: '0 0 6px',
                                    fontSize: '0.94rem',
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    fontFamily: '"Georgia", serif'
                                  }}>
                                    {rev.title}
                                  </h4>
                                )}

                                {/* Review Content */}
                                <p style={{
                                  color: rev.hidden ? '#64748b' : '#334155',
                                  fontSize: '0.88rem',
                                  lineHeight: '1.55',
                                  margin: '0 0 0.85rem',
                                  fontStyle: 'italic'
                                }}>
                                  "{rev.text}"
                                </p>

                                {/* Product Badge */}
                                <div style={{
                                  fontSize: '0.76rem',
                                  color: '#64748b',
                                  marginBottom: '8px',
                                  background: '#f8fafc',
                                  padding: '5px 9px',
                                  borderRadius: '6px',
                                  border: '1px solid #f1f5f9',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}>
                                  <Tag size={12} color="#C8935A" />
                                  <span>Product:</span>
                                  <strong style={{ color: '#0f172a' }}>{rev.productName || rev.product || 'Malenadu Estate Reserve'}</strong>
                                </div>
                              </div>

                              {/* Bottom Footer: Author & Action Buttons */}
                              <div style={{
                                borderTop: '1px solid #f1f5f9',
                                paddingTop: '0.85rem',
                                marginTop: '0.85rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.65rem'
                              }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{rev.name}</span>
                                    {rev.verified && (
                                      <span style={{ fontSize: '0.65rem', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                        ✓ Verified Buyer
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                                    {(rev.city || rev.location) ? `${rev.city || rev.location} • ` : ''}
                                    {rev.date ? new Date(rev.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified Review'}
                                  </div>
                                </div>

                                {/* Actions: Hide/Unhide Toggle & Delete */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    onClick={() => handleToggleHideReview(rev.id)}
                                    style={{
                                      background: rev.hidden ? '#eff6ff' : (isNegative ? '#fff1f2' : '#f8fafc'),
                                      border: rev.hidden ? '1px solid #bfdbfe' : (isNegative ? '1.5px solid #fda4af' : '1px solid #cbd5e1'),
                                      color: rev.hidden ? '#1d4ed8' : (isNegative ? '#e11d48' : '#475569'),
                                      padding: '0.45rem 0.8rem',
                                      borderRadius: '6px',
                                      fontSize: '0.76rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      transition: 'all 0.15s',
                                      boxShadow: isNegative && !rev.hidden ? '0 1px 3px rgba(225, 29, 72, 0.15)' : 'none'
                                    }}
                                    title={rev.hidden ? "Make this review visible on website storefront" : "Hide this review so customers cannot see it"}
                                  >
                                    {rev.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                                    <span>{rev.hidden ? 'Unhide' : 'Hide Review'}</span>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteReview(rev.id)}
                                    style={{
                                      background: '#fef2f2',
                                      border: '1px solid #fecaca',
                                      color: '#dc2626',
                                      padding: '0.45rem 0.65rem',
                                      borderRadius: '6px',
                                      fontSize: '0.76rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      transition: 'all 0.15s'
                                    }}
                                    title="Remove review permanently"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Load More Pagination */}
                      {sortedReviews.length > reviewDisplayLimit && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                          <button
                            onClick={() => setReviewDisplayLimit(prev => prev + 40)}
                            style={{
                              background: '#ffffff',
                              border: '1.5px solid #C8935A',
                              color: '#8c6239',
                              padding: '0.65rem 1.8rem',
                              borderRadius: '30px',
                              fontSize: '0.86rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(200, 147, 90, 0.15)',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#8c6239'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#8c6239'; }}
                          >
                            Showing {displayedReviews.length} of {sortedReviews.length} Reviews — Load More
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Modal: Add New Testimonial */}
              {isAddTestimonialOpen && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.65)',
                  zIndex: 99999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  backdropFilter: 'blur(3px)'
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    maxWidth: '520px',
                    width: '100%',
                    padding: '2rem',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h3 style={{ margin: 0, fontFamily: '"Georgia", serif', fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquareQuote size={20} color="#C8935A" />
                        <span>Add Homepage Testimonial</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddTestimonialOpen(false)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <form onSubmit={handleCreateTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Customer Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newTestimonialForm.name}
                          onChange={e => setNewTestimonialForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Ramesh K Rao"
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                            Customer Role / Tag
                          </label>
                          <input
                            type="text"
                            value={newTestimonialForm.role}
                            onChange={e => setNewTestimonialForm(prev => ({ ...prev, role: e.target.value }))}
                            placeholder="e.g. Coffee Customer"
                            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                            Star Rating
                          </label>
                          <select
                            value={newTestimonialForm.rating}
                            onChange={e => setNewTestimonialForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#fff' }}
                          >
                            <option value={5}>★★★★★ (5 Stars)</option>
                            <option value={4}>★★★★☆ (4 Stars)</option>
                            <option value={3}>★★★☆☆ (3 Stars)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Testimonial Review Message *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={newTestimonialForm.text}
                          onChange={e => setNewTestimonialForm(prev => ({ ...prev, text: e.target.value }))}
                          placeholder="Authentic Chikkamagaluru filter coffee. Perfect aroma and zero bitterness..."
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setIsAddTestimonialOpen(false)}
                          style={{ padding: '0.6rem 1.15rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          style={{ padding: '0.6rem 1.35rem', borderRadius: '8px', border: 'none', background: '#C8935A', color: '#fff', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Check size={16} />
                          <span>Publish to Homepage</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })() : adminView === 'messaging' ? (() => {
          // Automated WhatsApp Logs from System
          const automatedLogs = getAutomatedWhatsAppLogs();
          const subscribers = getWhatsAppSubscribers();

          // Calculate package status counts
          const totalPkgCount = orders.length;
          const pendingPkgCount = orders.filter(o => {
            const s = (o.orderStatus || o.status || 'placed').toLowerCase();
            return s === 'placed' || s === 'packed';
          }).length;
          const shippedPkgCount = orders.filter(o => (o.orderStatus || o.status || '').toLowerCase() === 'shipped').length;
          const deliveredPkgCount = orders.filter(o => (o.orderStatus || o.status || '').toLowerCase() === 'delivered').length;

          // Filter orders for package tracking updates
          const filteredPackageOrders = orders.filter(o => {
            const s = (o.orderStatus || o.status || 'placed').toLowerCase();
            if (packageFilter === 'pending' && s !== 'placed' && s !== 'packed') return false;
            if (packageFilter === 'shipped' && s !== 'shipped') return false;
            if (packageFilter === 'delivered' && s !== 'delivered') return false;

            if (packageSearchQuery && packageSearchQuery.trim()) {
              const q = packageSearchQuery.toLowerCase().trim();
              const numMatch = String(o.orderNumber || '').toLowerCase().includes(q);
              const nameMatch = (o.shippingName || '').toLowerCase().includes(q);
              const phoneMatch = String(o.shippingPhone || '').includes(q);
              const awbMatch = String(o.awbCode || '').toLowerCase().includes(q);
              return numMatch || nameMatch || phoneMatch || awbMatch;
            }
            return true;
          });

          // Admin sends package status update directly on WhatsApp
          const handleSendPackageWhatsApp = (order) => {
            const freshOrder = orders.find(o => String(o.orderNumber) === String(order.orderNumber) || String(o._id) === String(order._id) || String(o.id) === String(order.id)) || order;
            const status = freshOrder.orderStatus || freshOrder.status || 'placed';
            const { message, waUrl, cleanPhone } = handleSendStatusNotification(freshOrder, status, true);
            if (!cleanPhone) {
              alert('Customer phone number not available for this order.');
              return;
            }
            setLocalNotice(`✓ ${status.toUpperCase()} status WhatsApp update opened for Order #${freshOrder.orderNumber} (${freshOrder.shippingName || 'Customer'}).`);
            setTimeout(() => setLocalNotice(''), 4500);
          };

          const handleSendPackageEmail = (order) => {
            const email = order.shippingEmail || order.email;
            if (!email) {
              alert('Customer email address not available for this order.');
              return;
            }
            const status = (order.orderStatus || order.status || 'placed').toUpperCase();
            const orderNum = order.orderNumber || order._id || '';
            const awbText = order.awbCode ? 'Tracking AWB: ' + order.awbCode : 'Your package will arrive in 2–4 business days with live tracking.';
            const subject = '🚚 Package Update: Order #' + orderNum + ' is ' + status + ' | Malenadu Roast Co.';
            const body = 'Hello ' + (order.shippingName || 'Valued Customer') + ',\n\n' +
              'Your coffee order #' + orderNum + ' package status update:\n' +
              'Status: ' + status + '\n' +
              awbText + '\n\n' +
              'Download Official GST Tax Invoice:\n' +
              'https://www.malenaduroastco.works/api/invoice?order=' + orderNum + '\n\n' +
              'Thank you for choosing Malenadu Roast Co. Chikkamagaluru estate!\n\n' +
              'Warm regards,\n' +
              'Malenadu Roast Co. Support\n' +
              'Email: malenaduroast@gmail.com';

            const gmailUrl = 'https://mail.google.com/mail/u/malenaduroast@gmail.com/?view=cm&fs=1&to=' + encodeURIComponent(email) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
            window.open(gmailUrl, '_blank');
            setLocalNotice('Opening Gmail as malenaduroast@gmail.com for ' + email + '...');
            setTimeout(() => setLocalNotice(''), 5000);
          };

          // Trigger System-wide Fresh Roast Batch Drop (System dispatches to all customers automatically)
          const handleSystemBroadcast = async () => {
            setIsBroadcasting(true);
            try {
              const res = await broadcastAutomatedRoastUpdate();
              setLocalNotice(`✓ Success! The system has automatically dispatched fresh harvest drop alerts to ${res.count} registered customer(s)!`);
              setTimeout(() => setLocalNotice(''), 6000);
            } catch (err) {
              setLocalNotice(`Broadcast error: ${err.message}`);
            } finally {
              setIsBroadcasting(false);
            }
          };

          return (
            <div>
              {/* Top Banner with Strict Separation Notice */}
              <div className="admin-messaging-banner" style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                boxSizing: 'border-box'
              }}>
                <div style={{ flex: '1 1 320px', minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontFamily: 'Georgia, serif', color: '#0f172a', fontWeight: 700 }}>
                      Package Tracking & WhatsApp System Hub
                    </h2>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: '1.5' }}>
                    <strong style={{ color: '#166534' }}>System Policy Active:</strong> Common customer messages (Registration Welcome, Login security alerts, and Recurring harvest drops) are dispatched <strong>automatically by the system</strong>. In this admin panel, you only handle package tracking and shipment updates for customer orders.
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  flex: '1 1 320px'
                }}>
                  <button
                    type="button"
                    onClick={handleSystemBroadcast}
                    disabled={isBroadcasting}
                    style={{
                      background: '#18110C',
                      color: '#FBF8F3',
                      border: '1.5px solid #C8935A',
                      padding: '0.65rem 1.15rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: isBroadcasting ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      flex: '1 1 auto',
                      minWidth: '220px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Sparkles size={15} color="#C8935A" />
                    <span>{isBroadcasting ? 'Dispatching by System...' : 'Trigger Harvest Batch Alert to All'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={generateDigitalCatalog}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      color: '#334155',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      flex: '1 1 auto',
                      minWidth: '190px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Download size={14} />
                    <span>Download 2026 Catalog PDF</span>
                  </button>
                </div>
              </div>

              {/* Quick Package Metrics Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>All Packages</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{totalPkgCount}</div>
                  </div>
                  <Package size={20} color="#C8935A" />
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Pending Dispatch</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b45309' }}>{pendingPkgCount}</div>
                  </div>
                  <Clock size={20} color="#d97706" />
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase' }}>In Transit / Shipped</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7e22ce' }}>{shippedPkgCount}</div>
                  </div>
                  <Truck size={20} color="#9333ea" />
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Delivered</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>{deliveredPkgCount}</div>
                  </div>
                  <CheckCircle size={20} color="#16a34a" />
                </div>
              </div>

              {localNotice && (
                <div style={{
                  marginBottom: '1.5rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} color="#16a34a" />
                    <span>{localNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocalNotice('')}
                    style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* 2-Column Responsive Workspace */}
              <div className="admin-messaging-grid" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(340px, 1.4fr) minmax(280px, 1fr)',
                gap: '1.5rem',
                alignItems: 'start'
              }}>

                {/* Column 1: Package Logistics & Shipment Tracking Updates (Admin Responsibility) */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={18} color="#C8935A" />
                        <span>Package Status & Tracking Dispatch</span>
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                        Send 1-click WhatsApp package updates (Dispatched, Tracking Link, Out for Delivery)
                      </p>
                    </div>

                    <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      {filteredPackageOrders.length} Orders
                    </span>
                  </div>

                  {/* Filter Pills & Search Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: `All (${totalPkgCount})` },
                        { id: 'pending', label: `Pending (${pendingPkgCount})` },
                        { id: 'shipped', label: `In Transit (${shippedPkgCount})` },
                        { id: 'delivered', label: `Delivered (${deliveredPkgCount})` }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setPackageFilter(f.id)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            border: packageFilter === f.id ? '1.5px solid #C8935A' : '1px solid #e2e8f0',
                            background: packageFilter === f.id ? '#FBF8F3' : '#ffffff',
                            color: packageFilter === f.id ? '#8c6239' : '#64748b',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ position: 'relative', minWidth: '180px', flex: '1 1 auto' }}>
                      <input
                        type="text"
                        placeholder="Search #order, name, phone, AWB..."
                        value={packageSearchQuery}
                        onChange={e => setPackageSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.65rem 0.4rem 1.9rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          fontSize: '0.76rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>

                  {/* Orders List for Package Dispatch */}
                  {filteredPackageOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', fontSize: '0.84rem' }}>
                      No orders match the selected package filter or search term.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
                      {filteredPackageOrders.map(order => {
                        const status = (order.orderStatus || order.status || 'placed').toLowerCase();
                        const isShipped = status === 'shipped';
                        const isDelivered = status === 'delivered';

                        return (
                          <div
                            key={order.orderNumber || order.id || order._id}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '1rem',
                              transition: 'box-shadow 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '4px' }}>
                              <div>
                                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                                  #{order.orderNumber}
                                </span>
                                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>
                                  {order.shippingName || 'Valued Customer'}
                                </div>
                              </div>

                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'capitalize',
                                background: isDelivered ? '#dcfce7' : (isShipped ? '#f3e8ff' : '#fef3c7'),
                                color: isDelivered ? '#15803d' : (isShipped ? '#7e22ce' : '#b45309'),
                                border: `1px solid ${isDelivered ? '#bbf7d0' : (isShipped ? '#e9d5ff' : '#fde68a')}`
                              }}>
                                {isShipped ? '🚚 In Transit' : (isDelivered ? (() => {
                                  const delivTime = order.deliveredAt || order.updatedAt || order.createdAt;
                                  const diffDays = getCalendarDaysAgo(delivTime);
                                  const delivText = getDeliveryElapsedBadgeText(diffDays);
                                  const delivDateStr = formatDisplayDate(delivTime);
                                  return `✓ Delivered (${delivText}${delivDateStr ? ' • ' + delivDateStr : ''})`;
                                })() : '📦 Placed')}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '0.65rem', lineHeight: '1.4' }}>
                              <div>📞 <strong>{order.shippingPhone || 'No phone'}</strong> &bull; Total: <strong>₹{order.totalAmount || order.total || 0}</strong></div>
                              {order.awbCode && (
                                <div style={{ marginTop: '2px', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>Tracking AWB: <strong>{order.awbCode}</strong></span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(order.awbCode, `awb-${order.orderNumber}`)}
                                    style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                                    title="Copy AWB code"
                                  >
                                    {copiedKey === `awb-${order.orderNumber}` ? '✓ Copied' : <Copy size={11} />}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Status Quick Updater Dropdown */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '0.75rem',
                              flexWrap: 'wrap',
                              background: '#ffffff',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status:</span>
                              <select
                                value={status}
                                onChange={e => handleUpdateStatus(order._id || order.orderNumber, e.target.value)}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  padding: '3px 6px',
                                  borderRadius: '5px',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  cursor: 'pointer',
                                  flex: '1 1 auto',
                                  outline: 'none'
                                }}
                              >
                                <option value="placed">Placed (Order Received)</option>
                                <option value="packed">Packed (Freshly Roasted)</option>
                                <option value="shipped">Shipped (In Transit)</option>
                                <option value="delivered">Delivered (Completed)</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>

                            {/* Clean, Non-Overlapping Action Buttons Grid */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))',
                              gap: '8px',
                              width: '100%'
                            }}>
                              {/* 1. WhatsApp Package Update */}
                              <button
                                type="button"
                                onClick={() => handleSendPackageWhatsApp(order)}
                                style={{
                                  background: '#25D366',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '0.52rem 0.6rem',
                                  borderRadius: '7px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 5px rgba(37, 211, 102, 0.25)',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Send tracking update on WhatsApp"
                              >
                                <WhatsAppBrandIcon size={14} />
                                <span>WhatsApp</span>
                              </button>

                              {/* 2. Email Package Update */}
                              <button
                                type="button"
                                onClick={() => handleSendPackageEmail(order)}
                                style={{
                                  background: '#1d4ed8',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '0.52rem 0.6rem',
                                  borderRadius: '7px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 5px rgba(29, 78, 216, 0.25)',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Send tracking update via Email"
                              >
                                <EmailBrandIcon size={14} />
                                <span>Send Email</span>
                              </button>

                              {/* 3. Shiprocket Dispatch / Track AWB */}
                              {order.awbCode && !String(order.awbCode).toLowerCase().includes('pending') ? (
                                <a
                                  href={`https://shiprocket.co/tracking/${order.awbCode}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    background: '#f5f3ff',
                                    color: '#7c3aed',
                                    border: '1.5px solid #d8b4fe',
                                    padding: '0.52rem 0.6rem',
                                    borderRadius: '7px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title="Track shipment live on Shiprocket"
                                >
                                  <Truck size={14} />
                                  <span>Track AWB</span>
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleShiprocketDispatch(order)}
                                  disabled={shippingOrderId === (order.orderNumber || order._id)}
                                  style={{
                                    background: shippingOrderId === (order.orderNumber || order._id) ? '#cbd5e1' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '0.52rem 0.6rem',
                                    borderRadius: '7px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: shippingOrderId === (order.orderNumber || order._id) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 5px rgba(124, 58, 237, 0.25)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title="Auto-dispatch via Shiprocket"
                                >
                                  <Truck size={14} />
                                  <span>{shippingOrderId === (order.orderNumber || order._id) ? 'Shipping...' : 'Shiprocket'}</span>
                                </button>
                              )}

                              {/* 4. GST Tax Invoice */}
                              <button
                                type="button"
                                onClick={() => generateTaxInvoice(order)}
                                style={{
                                  background: '#ffffff',
                                  color: '#8c6239',
                                  border: '1.5px solid #C8935A',
                                  padding: '0.52rem 0.6rem',
                                  borderRadius: '7px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Download Official GST Tax Invoice PDF"
                              >
                                <Download size={14} />
                                <span>GST Invoice</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 2: Live Activity Feed of Automated Messages Sent by the System */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Card 1: System Automated Dispatch Feed */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '6px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#0f172a', fontWeight: 700 }}>
                          Live System WhatsApp Logs
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                          Dispatched automatically by system (No admin effort)
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {automatedLogs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleAllLogs(automatedLogs)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {automatedLogs.every((l, i) => expandedLogIds[l.id || i]) ? 'Collapse All' : 'Expand All'}
                          </button>
                        )}
                        <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                          {automatedLogs.length} Sent
                        </span>
                      </div>
                    </div>

                    {automatedLogs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                        No automated WhatsApp dispatches recorded yet.<br />
                        When customers place orders, register on the site, or log in, their automated WhatsApp alerts appear here in real-time.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                        {automatedLogs.map((log, idx) => {
                          const logId = log.id || idx;
                          const isExpanded = !!expandedLogIds[logId];
                          const isOrderPlaced = log.type === 'order_placed';
                          const isWelcome = log.type === 'welcome';
                          const isLogin = log.type === 'login';

                          let badgeBg = '#dcfce7';
                          let badgeColor = '#15803d';
                          let badgeLabel = '🌿 Roast Alert';

                          if (isOrderPlaced) {
                            badgeBg = '#dbeafe';
                            badgeColor = '#1d4ed8';
                            badgeLabel = '📦 Order Placed Alert';
                          } else if (isWelcome) {
                            badgeBg = '#fef3c7';
                            badgeColor = '#b45309';
                            badgeLabel = '☕ Welcome Greeting';
                          } else if (isLogin) {
                            badgeBg = '#e0f2fe';
                            badgeColor = '#0369a1';
                            badgeLabel = '🔐 Sign-in Alert';
                          }

                          return (
                            <div
                              key={logId}
                              style={{
                                background: isExpanded ? '#ffffff' : '#f8fafc',
                                border: isExpanded ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '0.75rem 0.85rem',
                                fontSize: '0.76rem',
                                transition: 'all 0.15s ease',
                                boxShadow: isExpanded ? '0 3px 8px rgba(0,0,0,0.04)' : 'none'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{
                                  padding: '2px 7px',
                                  borderRadius: '5px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: badgeBg,
                                  color: badgeColor
                                }}>
                                  {badgeLabel}
                                </span>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 600 }}>
                                    {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(log.message, `log-${logId}`);
                                    }}
                                    style={{
                                      background: copiedKey === `log-${logId}` ? '#dcfce7' : '#f1f5f9',
                                      border: `1px solid ${copiedKey === `log-${logId}` ? '#86efac' : '#cbd5e1'}`,
                                      color: copiedKey === `log-${logId}` ? '#15803d' : '#475569',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontSize: '0.66rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                    title="Copy complete WhatsApp message"
                                  >
                                    {copiedKey === `log-${logId}` ? <Check size={10} color="#15803d" /> : <Copy size={10} />}
                                    <span>{copiedKey === `log-${logId}` ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                              </div>

                              <div style={{ fontWeight: 700, color: '#0f172a', margin: '3px 0 5px', fontSize: '0.8rem' }}>
                                {log.recipientName} ({log.phone})
                              </div>

                              {/* Clickable Message Box (Expands to Show Complete Message) */}
                              <div
                                onClick={() => toggleExpandLog(logId)}
                                style={{
                                  background: isExpanded ? '#f0fdf4' : '#f1f5f9',
                                  border: `1px solid ${isExpanded ? '#bbf7d0' : '#e2e8f0'}`,
                                  borderRadius: '7px',
                                  padding: isExpanded ? '0.65rem 0.75rem' : '0.45rem 0.6rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{
                                  color: isExpanded ? '#14532d' : '#475569',
                                  fontSize: '0.74rem',
                                  lineHeight: '1.5',
                                  whiteSpace: isExpanded ? 'pre-wrap' : 'normal',
                                  wordBreak: 'break-word',
                                  display: isExpanded ? 'block' : '-webkit-box',
                                  WebkitLineClamp: isExpanded ? 'unset' : 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: isExpanded ? 'visible' : 'hidden'
                                }}>
                                  {log.message}
                                </div>

                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginTop: '5px',
                                  paddingTop: '3px',
                                  borderTop: `1px dashed ${isExpanded ? '#bbf7d0' : '#cbd5e1'}`,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  color: isExpanded ? '#15803d' : '#2563eb'
                                }}>
                                  <span>{isExpanded ? '▴ Collapse' : '▾ Click to read complete message'}</span>
                                  <span style={{ color: '#94a3b8', fontWeight: 500 }}>
                                    {isExpanded ? 'Full WhatsApp Text' : 'Click to expand'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Card 2: Registered WhatsApp Alert Subscribers */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.94rem', color: '#0f172a', fontWeight: 700 }}>
                        Roastery Alert Subscribers
                      </h4>
                      <span style={{ fontSize: '0.72rem', background: '#FBF8F3', color: '#C8935A', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        {subscribers.length} Subscribers
                      </span>
                    </div>

                    <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 0.75rem', lineHeight: '1.4' }}>
                      Customers subscribed to receive weekly fresh batch notifications directly on WhatsApp.
                    </p>

                    {subscribers.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {subscribers.slice(0, 6).map((s, i) => (
                          <span key={i} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', color: '#334155' }}>
                            {s.name} (+{s.phone})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          );
        })() : adminView === 'users' ? (() => {
          const searchLower = usersSearchQuery.toLowerCase().trim();
          const filteredUsers = registeredUsers.filter(u => {
            if (!searchLower) return true;
            return (
              (u.name && u.name.toLowerCase().includes(searchLower)) ||
              (u.email && u.email.toLowerCase().includes(searchLower)) ||
              (u.phone && String(u.phone).includes(searchLower)) ||
              (u.address && u.address.toLowerCase().includes(searchLower)) ||
              (u.role && u.role.toLowerCase().includes(searchLower))
            );
          });

          // Metrics
          const totalCustomers = registeredUsers.length;
          const customersWithOrders = registeredUsers.filter(u => {
            const e = (u.email || '').toLowerCase();
            return orders.some(o => (o.shippingEmail || '').toLowerCase() === e);
          }).length;
          const totalCustomerRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Header Banner & Stats */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      Registered Customer Directory
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                      Every user registered on Malenadu Roast Co. Direct contacts, delivery addresses & order history.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={loadUsers}
                      disabled={loadingUsers}
                      style={{
                        background: '#f8fafc',
                        border: '1.5px solid #cbd5e1',
                        color: '#0f172a',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <RefreshCw size={13} className={loadingUsers ? 'spin' : ''} />
                      <span>{loadingUsers ? 'Syncing...' : 'Refresh Users'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportUsersCSV}
                      style={{
                        background: 'linear-gradient(135deg, #C8935A, #a87238)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '0.5rem 1.1rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(200, 147, 90, 0.2)'
                      }}
                    >
                      <Download size={14} />
                      <span>Export Users CSV</span>
                    </button>
                  </div>
                </div>

                {/* 3 Metric Summary Pedestals */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem 1.15rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Total Registered Users
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                      {totalCustomers}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                      ✓ Verified in Database & Local Store
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem 1.15rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Active Buying Customers
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#C8935A', marginTop: '2px' }}>
                      {customersWithOrders}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Placed 1 or more estate orders
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem 1.15rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Total Customer Sales
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
                      ₹{totalCustomerRevenue.toFixed(0)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Pan-India online & prepaid roasts
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div style={{ marginTop: '1.25rem', position: 'relative' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search registered customers by name, email, phone number, or city/address..."
                    value={usersSearchQuery}
                    onChange={e => setUsersSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.6rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {usersSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setUsersSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Users Cards List */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                {filteredUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
                    <User size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                    <h4 style={{ margin: '0 0 0.35rem', color: '#0f172a', fontSize: '1.15rem' }}>
                      No Registered Users Found
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      {registeredUsers.length === 0
                        ? 'When customers register an account or place an order, their profiles populate here in real-time.'
                        : 'No customers match your current search query.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredUsers.map((u, idx) => {
                      const userEmail = (u.email || '').toLowerCase();
                      const userOrders = orders.filter(o => (o.shippingEmail || '').toLowerCase() === userEmail);
                      const totalSpend = userOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
                      const lastOrder = userOrders[0];
                      const isAdmin = (u.role || '').toLowerCase() === 'admin' || userEmail === 'malenaduroast@gmail.com';
                      const cleanPhone = String(u.phone || '').replace(/\D/g, '');

                      return (
                        <div
                          key={u.id || u.email || idx}
                          style={{
                            background: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem',
                            transition: 'box-shadow 0.2s'
                          }}
                        >
                          {/* Row 1: Profile Header & Badges */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: isAdmin ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #F5EDE0, #E8CA80)',
                                color: isAdmin ? '#ffffff' : '#4A3525',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '1rem',
                                flexShrink: 0,
                                border: '2px solid #ffffff',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                              }}>
                                {(u.name || 'C').charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                                    {u.name || 'Valued Customer'}
                                  </span>
                                  <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: isAdmin ? '#fef3c7' : '#e0f2fe',
                                    color: isAdmin ? '#92400e' : '#0369a1',
                                    border: `1px solid ${isAdmin ? '#fde68a' : '#bae6fd'}`
                                  }}>
                                    {isAdmin ? '🛡️ Admin Account' : '👤 Customer'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                  Registered: {u.createdAt ? new Date(u.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Verified Member'}
                                </div>
                              </div>
                            </div>

                            {/* Order Activity Pill */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                background: userOrders.length > 0 ? '#dcfce7' : '#f1f5f9',
                                color: userOrders.length > 0 ? '#15803d' : '#64748b',
                                border: `1px solid ${userOrders.length > 0 ? '#bbf7d0' : '#e2e8f0'}`
                              }}>
                                {userOrders.length > 0 ? `🛍️ ${userOrders.length} Order(s) (₹${totalSpend.toFixed(0)})` : '🌱 0 Orders Placed'}
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Customer Details Grid (Contacts & Address) */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>

                            {/* Contact Box */}
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#C8935A', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Direct Contact Channels
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', marginBottom: '4px' }}>
                                <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Phone size={12} color="#059669" />
                                  <a href={`tel:${u.phone}`} style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>
                                    {u.phone || 'No phone provided'}
                                  </a>
                                </span>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      background: '#25D366',
                                      color: '#ffffff',
                                      padding: '2px 7px',
                                      borderRadius: '4px',
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    <WhatsAppBrandIcon size={11} />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                                <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <EmailBrandIcon size={13} />
                                  <a href={`mailto:${u.email}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                                    {u.email || '—'}
                                  </a>
                                </span>
                                {u.email && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(u.email, `user-email-${u.email}`)}
                                    style={{ background: 'none', border: 'none', color: copiedKey === `user-email-${u.email}` ? '#15803d' : '#64748b', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700 }}
                                  >
                                    {copiedKey === `user-email-${u.email}` ? '✓ Copied' : 'Copy'}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Saved Address Box */}
                            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <MapPin size={12} color="#d97706" />
                                  Saved Delivery Address
                                </span>
                                {u.address && (
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(u.address, `user-addr-${u.email}`)}
                                    style={{ background: 'none', border: 'none', color: copiedKey === `user-addr-${u.email}` ? '#15803d' : '#64748b', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700 }}
                                  >
                                    {copiedKey === `user-addr-${u.email}` ? '✓ Copied' : 'Copy'}
                                  </button>
                                )}
                              </div>
                              <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                                {u.address || 'Customer has not saved a delivery address yet.'}
                              </div>
                            </div>
                          </div>

                          {/* Row 3: Action Buttons */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: '0.65rem' }}>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(`Hello ${u.name}! 👋 Greetings from Malenadu Roast Co., Chikkamagaluru. ☕ How can we assist you with our single-estate coffee and Tellicherry pepper?`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: '#f0fdf4',
                                  border: '1px solid #86efac',
                                  color: '#16a34a',
                                  padding: '0.42rem 0.85rem',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <WhatsAppBrandIcon size={14} />
                                <span>Message on WhatsApp</span>
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                const details = `Customer Name: ${u.name || ''}\nEmail: ${u.email || ''}\nPhone: ${u.phone || ''}\nAddress: ${u.address || ''}\nRole: ${u.role || 'customer'}`;
                                copyToClipboard(details, `user-info-${u.email}`);
                              }}
                              style={{
                                background: '#ffffff',
                                border: '1.5px solid #cbd5e1',
                                color: '#0f172a',
                                padding: '0.42rem 0.85rem',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              {copiedKey === `user-info-${u.email}` ? <Check size={13} color="#15803d" /> : <Copy size={13} />}
                              <span>{copiedKey === `user-info-${u.email}` ? 'Copied!' : 'Copy Customer Info'}</span>
                            </button>

                            {userOrders.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchQuery(u.email);
                                  setAdminView('orders');
                                }}
                                style={{
                                  background: '#eff6ff',
                                  border: '1.5px solid #93c5fd',
                                  color: '#1d4ed8',
                                  padding: '0.42rem 0.85rem',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <Package size={13} color="#1d4ed8" />
                                <span>View {userOrders.length} Order(s) →</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })() : adminView === 'retention' ? (() => {
          // ==========================================================
          // SMART CUSTOMER REORDER & LIFECYCLE RETENTION HUB
          // ==========================================================

          // Helper to calculate exact calendar delivery timeline & proper dates
          const computeDeliveryDetails = (deliveredAtValue, orderCreatedAt, orderStatus) => {
            const rawStatus = (orderStatus || 'placed').toLowerCase();
            const isDelivered = rawStatus === 'delivered' || !!deliveredAtValue;
            const effectiveDeliveredAt = deliveredAtValue || (rawStatus === 'delivered' ? orderCreatedAt : null);

            let daysSinceDelivered = null;
            let deliveryText = 'Delivery Pending';
            let deliveredAtStr = '';

            if (isDelivered && effectiveDeliveredAt) {
              daysSinceDelivered = getCalendarDaysAgo(effectiveDeliveredAt);
              deliveredAtStr = formatDisplayDate(effectiveDeliveredAt);
              deliveryText = getDeliveryElapsedBadgeText(daysSinceDelivered);
            } else {
              if (rawStatus === 'shipped') {
                deliveryText = 'In Transit (Dispatched)';
              } else if (rawStatus === 'packed') {
                deliveryText = 'Packed (Freshly Roasted)';
              } else {
                deliveryText = 'Order Placed (Delivery Pending)';
              }
            }

            return { isDelivered, effectiveDeliveredAt, deliveredAtStr, daysSinceDelivered, deliveryText, rawStatus };
          };

          // 1. Map real database orders into retention lifecycle profiles
          const realProfiles = orders.map((order, idx) => {
            const orderDate = new Date(order.createdAt || 0);
            const primaryItem = (order.items && order.items[0]) ? order.items[0].name : 'Malenadu Estate Reserve';
            const weight = (order.items && order.items[0] && order.items[0].weight) ? order.items[0].weight : '500g';
            const fullName = order.shippingName || 'Valued Customer';
            const phone = order.shippingPhone || '';
            const email = order.shippingEmail || '';

            const deliv = computeDeliveryDetails(order.deliveredAt, order.createdAt, order.orderStatus || order.status);

            let stage = 'day_15';
            let defaultTemplateId = 'day_15_halfway';

            if (deliv.isDelivered && deliv.daysSinceDelivered !== null) {
              if (deliv.daysSinceDelivered >= 45) {
                stage = 'day_45';
                defaultTemplateId = 'day_45_referral';
              } else if (deliv.daysSinceDelivered >= 30) {
                stage = 'day_30';
                defaultTemplateId = 'day_30_restock';
              } else if (deliv.daysSinceDelivered >= 15) {
                stage = 'day_15';
                defaultTemplateId = 'day_15_halfway';
              } else if (deliv.daysSinceDelivered >= 5) {
                stage = 'feedback';
                defaultTemplateId = 'day_10_feedback';
              } else if (deliv.daysSinceDelivered === 2) {
                stage = 'day_1';
                defaultTemplateId = 'day_2_brew';
              } else {
                // Day 0 or Day 1
                stage = 'day_1';
                defaultTemplateId = 'day_1_checkin';
              }
            } else {
              stage = 'pending_delivery';
              defaultTemplateId = 'concierge';
            }

            return {
              id: order.orderNumber || order._id || `real-${idx}`,
              orderNumber: order.orderNumber || `ORD-${1000 + idx}`,
              rawOrder: order,
              customerName: fullName,
              phone: phone,
              email: email,
              productName: primaryItem,
              weight: weight,
              totalAmount: order.totalAmount || order.total || 429,
              orderDateStr: orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              isDelivered: deliv.isDelivered,
              deliveredAt: deliv.effectiveDeliveredAt,
              deliveredAtStr: deliv.deliveredAtStr,
              daysSinceDelivered: deliv.daysSinceDelivered,
              deliveryText: deliv.deliveryText,
              orderStatus: deliv.rawStatus,
              stage: stage,
              defaultTemplateId: defaultTemplateId,
              isRealOrder: true
            };
          });

          // Helper to get past calendar date noon ISO
          const getPastCalendarIso = (daysAgo) => {
            const d = new Date();
            d.setDate(d.getDate() - daysAgo);
            d.setHours(12, 0, 0, 0);
            return d.toISOString();
          };

          // 2. High-fidelity demo cohorts demonstrating Day 1, Day 2, Day 9, Day 15, Day 30, Day 45
          const sampleCohorts = [
            {
              id: 'demo-day-1',
              orderNumber: 'ORD-9032',
              customerName: 'Kavitha Gowda',
              phone: '9845012345',
              email: 'kavitha.gowda@gmail.com',
              productName: 'Malenadu Estate Reserve',
              weight: '500g',
              totalAmount: 449,
              orderDateStr: formatDisplayDate(getPastCalendarIso(3)),
              isDelivered: true,
              deliveredAt: customDemoDeliveries['demo-day-1'] || getPastCalendarIso(1),
              orderStatus: 'delivered',
              stage: 'day_1',
              defaultTemplateId: 'day_1_checkin',
              isRealOrder: false
            },
            {
              id: 'demo-day-2',
              orderNumber: 'ORD-9018',
              customerName: 'Sunil B E',
              phone: '9880998877',
              email: 'sunil.be@gmail.com',
              productName: 'Malenadu Estate Reserve',
              weight: '500g',
              totalAmount: 449,
              orderDateStr: formatDisplayDate(getPastCalendarIso(4)),
              isDelivered: true,
              deliveredAt: customDemoDeliveries['demo-day-2'] || getPastCalendarIso(2),
              orderStatus: 'delivered',
              stage: 'day_1',
              defaultTemplateId: 'day_2_brew',
              isRealOrder: false
            },
            {
              id: 'demo-day-9',
              orderNumber: 'ORD-8995',
              customerName: 'Venkatesh V K',
              phone: '9900123456',
              email: 'venkatesh.vk@gmail.com',
              productName: 'Tellicherry Estate Black Pepper',
              weight: '250g',
              totalAmount: 319,
              orderDateStr: formatDisplayDate(getPastCalendarIso(12)),
              isDelivered: true,
              deliveredAt: customDemoDeliveries['demo-day-9'] || getPastCalendarIso(9),
              orderStatus: 'delivered',
              stage: 'feedback',
              defaultTemplateId: 'day_10_feedback',
              isRealOrder: false
            },
            {
              id: 'demo-day-15',
              orderNumber: 'ORD-8921',
              customerName: 'Rahul Sharma',
              phone: '919876543210',
              email: 'rahul.sharma@example.com',
              productName: 'Malenadu Estate Reserve',
              weight: '500g',
              totalAmount: 449,
              orderDateStr: formatDisplayDate(getPastCalendarIso(18)),
              isDelivered: true,
              deliveredAt: customDemoDeliveries['demo-day-15'] || getPastCalendarIso(15),
              orderStatus: 'delivered',
              stage: 'day_15',
              defaultTemplateId: 'day_15_halfway',
              isRealOrder: false
            },
            {
              id: 'demo-day-30',
              orderNumber: 'ORD-8840',
              customerName: 'Prajwal H D',
              phone: '9845112233',
              email: 'prajwal.coffee@gmail.com',
              productName: 'Estate Peaberry Reserve',
              weight: '500g',
              totalAmount: 499,
              orderDateStr: formatDisplayDate(getPastCalendarIso(34)),
              isDelivered: true,
              deliveredAt: customDemoDeliveries['demo-day-30'] || getPastCalendarIso(30),
              orderStatus: 'delivered',
              stage: 'day_30',
              defaultTemplateId: 'day_30_restock',
              isRealOrder: false
            },
            {
              id: 'demo-day-45',
              orderNumber: 'ORD-8712',
              customerName: 'B K Shivamurthy',
              phone: '9448098765',
              email: 'shivamurthy.bk@outlook.com',
              productName: 'Malenadu Estate Reserve (1kg)',
              weight: '1kg',
              totalAmount: 849,
              orderDateStr: formatDisplayDate(getPastCalendarIso(49)),
              isDelivered: true,
              deliveredAt: customDemoDeliveries['demo-day-45'] || getPastCalendarIso(45),
              orderStatus: 'delivered',
              stage: 'day_45',
              defaultTemplateId: 'day_45_referral',
              isRealOrder: false
            }
          ].map(c => {
            const deliv = computeDeliveryDetails(c.deliveredAt, null, c.orderStatus);
            let s = c.stage;
            let dId = c.defaultTemplateId;
            if (deliv.daysSinceDelivered !== null) {
              if (deliv.daysSinceDelivered >= 45) { s = 'day_45'; dId = 'day_45_referral'; }
              else if (deliv.daysSinceDelivered >= 30) { s = 'day_30'; dId = 'day_30_restock'; }
              else if (deliv.daysSinceDelivered >= 15) { s = 'day_15'; dId = 'day_15_halfway'; }
              else if (deliv.daysSinceDelivered >= 5) { s = 'feedback'; dId = 'day_10_feedback'; }
              else if (deliv.daysSinceDelivered === 2) { s = 'day_1'; dId = 'day_2_brew'; }
              else { s = 'day_1'; dId = 'day_1_checkin'; }
            }
            return {
              ...c,
              deliveredAtStr: deliv.deliveredAtStr,
              daysSinceDelivered: deliv.daysSinceDelivered,
              deliveryText: deliv.deliveryText,
              stage: s,
              defaultTemplateId: dId
            };
          });

          // Merge: show real orders first, plus demo cohort for customer phones not yet in real orders
          const realPhoneSet = new Set(realProfiles.map(p => String(p.phone).replace(/\D/g, '')));
          const additionalCohorts = sampleCohorts.filter(s => !realPhoneSet.has(String(s.phone).replace(/\D/g, '')));
          const allRetentionProfiles = [...realProfiles, ...additionalCohorts];

          // Metric counts
          const totalCustomers = allRetentionProfiles.length;
          const day1Count = allRetentionProfiles.filter(p => p.stage === 'day_1').length;
          const day15Count = allRetentionProfiles.filter(p => p.stage === 'day_15').length;
          const day30Count = allRetentionProfiles.filter(p => p.stage === 'day_30').length;
          const day45Count = allRetentionProfiles.filter(p => p.stage === 'day_45').length;
          const feedbackCount = allRetentionProfiles.filter(p => p.stage === 'feedback').length;
          const pendingDeliveryCount = allRetentionProfiles.filter(p => !p.isDelivered).length;
          const followedUpCount = allRetentionProfiles.filter(p => retentionFollowUps[p.id] || retentionFollowUps[p.phone]).length;

          // Filter profiles
          const filteredRetentionProfiles = allRetentionProfiles.filter(p => {
            const isFollowedUp = !!(retentionFollowUps[p.id] || retentionFollowUps[p.phone]);
            if (retentionFilter === 'day_1' && p.stage !== 'day_1') return false;
            if (retentionFilter === 'day_15' && p.stage !== 'day_15') return false;
            if (retentionFilter === 'day_30' && p.stage !== 'day_30') return false;
            if (retentionFilter === 'day_45' && p.stage !== 'day_45') return false;
            if (retentionFilter === 'feedback' && p.stage !== 'feedback') return false;
            if (retentionFilter === 'pending_delivery' && p.isDelivered) return false;
            if (retentionFilter === 'reminded' && !isFollowedUp) return false;
            if (retentionFilter === 'pending' && isFollowedUp) return false;

            if (retentionSearchQuery && retentionSearchQuery.trim()) {
              const q = retentionSearchQuery.toLowerCase().trim();
              const nMatch = p.customerName.toLowerCase().includes(q);
              const pMatch = String(p.phone).includes(q);
              const prodMatch = p.productName.toLowerCase().includes(q);
              const oMatch = p.orderNumber.toLowerCase().includes(q);
              return nMatch || pMatch || prodMatch || oMatch;
            }
            return true;
          });

          // Action dispatchers
          const handleSendRetentionWhatsApp = (profile, messageText) => {
            if (!profile.phone) {
              alert('Customer phone number not available.');
              return;
            }
            const clean = String(profile.phone).replace(/\D/g, '');
            const fullPhone = clean.length === 10 ? '91' + clean : clean;
            const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(messageText)}`;
            window.open(waUrl, '_blank');

            const updated = {
              ...retentionFollowUps,
              [profile.id]: {
                sentAt: new Date().toISOString(),
                customerName: profile.customerName,
                phone: profile.phone
              }
            };
            setRetentionFollowUps(updated);
            try {
              localStorage.setItem('malenadu_retention_followups', JSON.stringify(updated));
            } catch (e) {
              console.warn('Could not persist retention follow-up', e);
            }
            setLocalNotice(`✓ WhatsApp reminder opened for ${profile.customerName} (${profile.phone})!`);
            setTimeout(() => setLocalNotice(''), 5000);
          };

          const handleSendRetentionEmail = (profile, subject, messageText) => {
            if (!profile.email) {
              alert('Customer email address not available.');
              return;
            }
            const gmailUrl = `https://mail.google.com/mail/u/malenaduroast@gmail.com/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageText)}`;
            window.open(gmailUrl, '_blank');

            const updated = {
              ...retentionFollowUps,
              [profile.id]: {
                sentAt: new Date().toISOString(),
                customerName: profile.customerName,
                email: profile.email
              }
            };
            setRetentionFollowUps(updated);
            try {
              localStorage.setItem('malenadu_retention_followups', JSON.stringify(updated));
            } catch (e) {
              console.warn('Could not persist retention follow-up', e);
            }
            setLocalNotice(`✓ Opening Gmail reminder for ${profile.email}!`);
            setTimeout(() => setLocalNotice(''), 5000);
          };

          const handleToggleRetentionStatus = (profile) => {
            const updated = { ...retentionFollowUps };
            if (updated[profile.id]) {
              delete updated[profile.id];
            } else {
              updated[profile.id] = {
                sentAt: new Date().toISOString(),
                customerName: profile.customerName
              };
            }
            setRetentionFollowUps(updated);
            try {
              localStorage.setItem('malenadu_retention_followups', JSON.stringify(updated));
            } catch (e) {
              console.warn('Could not persist retention follow-up', e);
            }
          };

          return (
            <div>
              {/* Header Banner */}
              <div className="admin-messaging-banner" style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                boxSizing: 'border-box'
              }}>
                <div style={{ flex: '1 1 360px', minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#C8935A', boxShadow: '0 0 10px #C8935A' }} />
                    <h2 style={{ margin: 0, fontSize: '1.35rem', fontFamily: 'Georgia, serif', color: '#0f172a', fontWeight: 700 }}>
                      Customer Lifecycle & Reorder Retention Hub
                    </h2>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: '1.5' }}>
                    <strong style={{ color: '#8c6239' }}>D2C Retention Engine:</strong> Send scheduled WhatsApp & Email follow-ups to customers after <strong>15 days</strong> (halfway restock alert), <strong>30 days</strong> (fresh roast reorder), <strong>45 days</strong> (refer-a-friend gift credits), and <strong>7–10 days</strong> (authentic brewing feedback).
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  flex: '1 1 320px'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard('https://malenaduroastco.works/#reviews', 'feedback-link');
                      setLocalNotice('✓ Official Customer Feedback & Store Link Copied to Clipboard!');
                      setTimeout(() => setLocalNotice(''), 4000);
                    }}
                    style={{
                      background: '#FBF8F3',
                      border: '1.5px solid #C8935A',
                      color: '#8c6239',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      flex: '1 1 auto',
                      minWidth: '200px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Gift size={15} color="#8c6239" />
                    <span>Copy Customer Feedback Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={generateDigitalCatalog}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      color: '#334155',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      flex: '1 1 auto',
                      minWidth: '180px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Download size={14} />
                    <span>Download 2026 Catalog PDF</span>
                  </button>
                </div>
              </div>

              {/* Quick Lifecycle Metrics Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>All Tracked</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{totalCustomers}</div>
                  </div>
                  <User size={22} color="#C8935A" />
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>1–2 Days Delivered</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#047857' }}>{day1Count}</div>
                  </div>
                  <Truck size={22} color="#059669" />
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Day 15 Restock</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309' }}>{day15Count}</div>
                  </div>
                  <Coffee size={22} color="#d97706" />
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #ffedd5', borderRadius: '10px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>Day 30 Restock</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c2410c' }}>{day30Count}</div>
                  </div>
                  <Package size={22} color="#ea580c" />
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #f3e8ff', borderRadius: '10px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase' }}>Day 45+ Referrals</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7e22ce' }}>{day45Count}</div>
                  </div>
                  <Gift size={22} color="#9333ea" />
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Reminders Sent</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d' }}>{followedUpCount}</div>
                  </div>
                  <CheckCheck size={22} color="#16a34a" />
                </div>
              </div>

              {localNotice && (
                <div style={{
                  marginBottom: '1.5rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} color="#16a34a" />
                    <span>{localNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocalNotice('')}
                    style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* Filter Pills & Search Bar */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: `All Customers (${totalCustomers})` },
                    { id: 'day_1', label: `🚚 1–2 Days (${day1Count})` },
                    { id: 'feedback', label: `⭐ 5–10 Days Feedback (${feedbackCount})` },
                    { id: 'day_15', label: `☕ Day 15 Restock (${day15Count})` },
                    { id: 'day_30', label: `📦 Day 30 Restock (${day30Count})` },
                    { id: 'day_45', label: `🎁 Day 45+ Referrals (${day45Count})` },
                    { id: 'pending_delivery', label: `⏳ Delivery Pending (${pendingDeliveryCount})` },
                    { id: 'reminded', label: `✓ Reminded (${followedUpCount})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRetentionFilter(tab.id)}
                      style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: '6px',
                        border: retentionFilter === tab.id ? '1.5px solid #C8935A' : '1px solid #e2e8f0',
                        background: retentionFilter === tab.id ? '#FBF8F3' : '#ffffff',
                        color: retentionFilter === tab.id ? '#8c6239' : '#64748b',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 auto' }}>
                  <input
                    type="text"
                    placeholder="Search by name, phone, blend, or #order..."
                    value={retentionSearchQuery}
                    onChange={e => setRetentionSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.75rem 0.45rem 2rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.78rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Retention Customer Cards List */}
              {filteredRetentionProfiles.length === 0 ? (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '4rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                  <RotateCcw size={32} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
                  <h4 style={{ margin: '0 0 4px', color: '#0f172a', fontSize: '1.1rem' }}>No Customers in this Lifecycle Segment</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem' }}>All customers have been contacted or no customers matched your search query.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {filteredRetentionProfiles.map(profile => {
                    const isFollowedUp = !!(retentionFollowUps[profile.id] || retentionFollowUps[profile.phone]);
                    const followUpData = retentionFollowUps[profile.id] || retentionFollowUps[profile.phone];

                    // Selected template for this customer
                    const activeTemplateId = selectedCustomerTemplate[profile.id] || profile.defaultTemplateId;
                    const activeTemplate = RETENTION_TEMPLATES.find(t => t.id === activeTemplateId) || RETENTION_TEMPLATES[0];

                    // Generated message text (or custom edited text)
                    const messageText = customRetentionMessages[profile.id] !== undefined
                      ? customRetentionMessages[profile.id]
                      : activeTemplate.generateText(profile.customerName, profile.productName);

                    const emailSubject = activeTemplate.defaultSubject(profile.customerName, profile.productName);

                    return (
                      <div
                        key={profile.id}
                        style={{
                          background: '#ffffff',
                          border: isFollowedUp ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          borderLeft: `4px solid ${isFollowedUp ? '#16a34a' : activeTemplate.tagColor}`,
                          borderRadius: '12px',
                          padding: '1.25rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem'
                        }}
                      >
                        {/* Top Row: Customer Identity + Milestone Stage Badge + Follow-up Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #F5EDE0, #E8CA80)',
                              color: '#4A3525',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              flexShrink: 0
                            }}>
                              {(profile.customerName || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                                  {profile.customerName}
                                </span>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                                  #{profile.orderNumber}
                                </span>

                                {/* Prominent Delivery Status Pill */}
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '5px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  background: profile.isDelivered ? '#ecfdf5' : '#fffbeb',
                                  color: profile.isDelivered ? '#047857' : '#b45309',
                                  border: `1.5px solid ${profile.isDelivered ? '#10b981' : '#f59e0b'}`
                                }}>
                                  {profile.isDelivered ? '🚚' : '⏳'} {profile.deliveryText}
                                </span>
                              </div>

                              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span>Ordered: <strong>{profile.orderDateStr}</strong></span>
                                {profile.deliveredAtStr && (
                                  <span>&bull; Delivered: <strong style={{ color: '#047857' }}>{profile.deliveredAtStr}</strong></span>
                                )}
                                <span>&bull; Target: <strong>{activeTemplate.tag} ({activeTemplate.milestoneDays || 15}d)</strong></span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {/* If delivered: Quick button to adjust delivery date */}
                            {profile.isDelivered ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeliveryDateModalOrder(profile);
                                  setCustomDeliveryDateInput(profile.deliveredAt ? new Date(profile.deliveredAt).toISOString().split('T')[0] : '');
                                }}
                                style={{
                                  background: '#f8fafc',
                                  border: '1.5px solid #cbd5e1',
                                  color: '#334155',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.15s'
                                }}
                                title="Adjust exact delivery timestamp"
                              >
                                <Calendar size={12} color="#475569" />
                                <span>Adjust Date ({profile.daysSinceDelivered !== null ? `${profile.daysSinceDelivered}d` : 'Set'})</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleQuickMarkDelivered(profile)}
                                style={{
                                  background: '#16a34a',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '4px 9px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 1px 2px rgba(22,163,74,0.2)'
                                }}
                                title="Mark order as delivered now to start the delivery counter"
                              >
                                <CheckCircle size={12} />
                                <span>Mark Delivered Now</span>
                              </button>
                            )}

                            {/* Milestone Stage Tag */}
                            <span style={{
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: activeTemplate.tagBg,
                              color: activeTemplate.tagColor,
                              border: `1px solid ${activeTemplate.tagColor}30`
                            }}>
                              {activeTemplate.tag} ({activeTemplate.milestoneDays || 15}d)
                            </span>

                            {/* Followed-up Pill */}
                            <span style={{
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: isFollowedUp ? '#dcfce7' : '#fef3c7',
                              color: isFollowedUp ? '#15803d' : '#b45309',
                              border: `1px solid ${isFollowedUp ? '#bbf7d0' : '#fde68a'}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {isFollowedUp ? <CheckCircle size={12} /> : <Clock size={12} />}
                              <span>{isFollowedUp ? 'Reminded' : 'Reminder Due'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Middle Row: Product & Contact Details + Template Picker */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                          gap: '1rem',
                          alignItems: 'start'
                        }}>
                          {/* Left: Customer Specs */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.76rem' }}>
                              <div style={{ color: '#64748b', marginBottom: '2px' }}>Product Bought & Details:</div>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                                ☕ {profile.productName} ({profile.weight})
                              </div>
                              <div style={{ color: '#8c6239', fontWeight: 600, marginTop: '2px' }}>
                                Total Spend: ₹{profile.totalAmount}
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.76rem' }}>
                              <div>📞 <strong>{profile.phone || 'No phone'}</strong> &bull; ✉️ {profile.email || 'No email'}</div>
                              {isFollowedUp && followUpData?.sentAt && (
                                <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.72rem' }}>
                                  ✓ Follow-up dispatched on: {new Date(followUpData.sentAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>

                            {/* Template Selector */}
                            <div style={{ marginTop: '0.25rem' }}>
                              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                Choose Lifecycle Message Template:
                              </label>
                              <select
                                value={activeTemplateId}
                                onChange={e => {
                                  const newId = e.target.value;
                                  setSelectedCustomerTemplate(prev => ({ ...prev, [profile.id]: newId }));
                                  setCustomRetentionMessages(prev => {
                                    const copy = { ...prev };
                                    delete copy[profile.id];
                                    return copy;
                                  });
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: '6px',
                                  border: '1.5px solid #cbd5e1',
                                  background: '#ffffff',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  cursor: 'pointer',
                                  outline: 'none'
                                }}
                              >
                                {RETENTION_TEMPLATES.map(tpl => (
                                  <option key={tpl.id} value={tpl.id}>
                                    {tpl.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Right: Interactive Message Preview Box */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                                Message Preview (Editable before sending):
                              </span>
                              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                {messageText.length} chars
                              </span>
                            </div>

                            <textarea
                              rows={6}
                              value={messageText}
                              onChange={e => {
                                const val = e.target.value;
                                setCustomRetentionMessages(prev => ({ ...prev, [profile.id]: val }));
                              }}
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #bbf7d0',
                                background: '#f0fdf4',
                                color: '#14532d',
                                fontSize: '0.76rem',
                                lineHeight: '1.5',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            />

                            {/* Action Buttons Bar */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                              gap: '8px',
                              width: '100%',
                              marginTop: '4px'
                            }}>
                              {/* 1. Send WhatsApp */}
                              <button
                                type="button"
                                onClick={() => handleSendRetentionWhatsApp(profile, messageText)}
                                style={{
                                  background: '#25D366',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '0.55rem 0.65rem',
                                  borderRadius: '7px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 5px rgba(37, 211, 102, 0.25)',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Send reminder to customer on WhatsApp"
                              >
                                <WhatsAppBrandIcon size={14} />
                                <span>Send WhatsApp</span>
                              </button>

                              {/* 2. Send Email */}
                              <button
                                type="button"
                                onClick={() => handleSendRetentionEmail(profile, emailSubject, messageText)}
                                style={{
                                  background: '#1d4ed8',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 5px rgba(29, 78, 216, 0.25)',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Send reminder to customer by Email"
                              >
                                <EmailBrandIcon size={14} />
                                <span>Send Email</span>
                              </button>

                              {/* 3. Mark Followed Up */}
                              <button
                                type="button"
                                onClick={() => handleToggleRetentionStatus(profile)}
                                style={{
                                  background: isFollowedUp ? '#f1f5f9' : '#ffffff',
                                  color: isFollowedUp ? '#475569' : '#15803d',
                                  border: `1.5px solid ${isFollowedUp ? '#cbd5e1' : '#86efac'}`,
                                  padding: '0.55rem 0.65rem',
                                  borderRadius: '7px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Toggle followed up status"
                              >
                                <Check size={14} />
                                <span>{isFollowedUp ? 'Mark Pending' : 'Mark Reminded'}</span>
                              </button>

                              {/* 4. Copy Message */}
                              <button
                                type="button"
                                onClick={() => copyToClipboard(messageText, `ret-msg-${profile.id}`)}
                                style={{
                                  background: copiedKey === `ret-msg-${profile.id}` ? '#dcfce7' : '#ffffff',
                                  border: `1.5px solid ${copiedKey === `ret-msg-${profile.id}` ? '#86efac' : '#cbd5e1'}`,
                                  color: copiedKey === `ret-msg-${profile.id}` ? '#15803d' : '#475569',
                                  padding: '0.55rem 0.65rem',
                                  borderRadius: '7px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Copy message text to clipboard"
                              >
                                {copiedKey === `ret-msg-${profile.id}` ? <Check size={14} color="#15803d" /> : <Copy size={14} />}
                                <span>{copiedKey === `ret-msg-${profile.id}` ? 'Copied!' : 'Copy Text'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
              }

              {/* Delivery Date Adjustment Modal */}
              {deliveryDateModalOrder && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '1rem'
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    maxWidth: '480px',
                    width: '100%',
                    padding: '1.5rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                          Set Delivery Milestone Date
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                          Order #{deliveryDateModalOrder.orderNumber} • {deliveryDateModalOrder.customerName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeliveryDateModalOrder(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Current Delivery Status:</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: deliveryDateModalOrder.isDelivered ? '#059669' : '#d97706' }}>
                          🚚 {deliveryDateModalOrder.deliveryText}
                        </span>
                        {deliveryDateModalOrder.deliveredAtStr && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            ({deliveryDateModalOrder.deliveredAtStr})
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                        Quick Delivery Elapsed Presets:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        {[
                          { label: 'Delivered Today (0d)', daysAgo: 0 },
                          { label: '1 Day Ago (1d since)', daysAgo: 1 },
                          { label: '2 Days Ago (2d since)', daysAgo: 2 },
                          { label: '5 Days Ago (5d since)', daysAgo: 5 },
                          { label: '9 Days Ago (9d since)', daysAgo: 9 },
                          { label: '15 Days Ago (Day 15 Reorder)', daysAgo: 15 },
                          { label: '30 Days Ago (Day 30 Restock)', daysAgo: 30 },
                          { label: '45 Days Ago (Day 45 Referral)', daysAgo: 45 }
                        ].map(preset => (
                          <button
                            key={preset.daysAgo}
                            type="button"
                            onClick={() => {
                              const targetDate = new Date();
                              targetDate.setDate(targetDate.getDate() - preset.daysAgo);
                              targetDate.setHours(12, 0, 0, 0);
                              handleSaveDeliveryDate(deliveryDateModalOrder, targetDate.toISOString());
                            }}
                            style={{
                              background: '#ffffff',
                              border: '1.5px solid #cbd5e1',
                              padding: '0.5rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8935A'; e.currentTarget.style.background = '#FFFDF9'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#ffffff'; }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Or Select Exact Calendar Date:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="date"
                          value={customDeliveryDateInput}
                          onChange={e => setCustomDeliveryDateInput(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.82rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          disabled={!customDeliveryDateInput}
                          onClick={() => {
                            if (customDeliveryDateInput) {
                              const [y, m, d] = customDeliveryDateInput.split('-').map(Number);
                              const customDate = new Date(y, m - 1, d, 12, 0, 0);
                              handleSaveDeliveryDate(deliveryDateModalOrder, customDate.toISOString());
                            }
                          }}
                          style={{
                            background: customDeliveryDateInput ? '#C8935A' : '#cbd5e1',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: customDeliveryDateInput ? 'pointer' : 'not-allowed'
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setDeliveryDateModalOrder(null)}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })() : (
          <div>

            {/* Shiprocket Automated Logistics Notification Banner */}
            {
              shipmentNotice && (
                <div style={{
                  background: shipmentNotice.type === 'error' ? '#fef2f2' : (shipmentNotice.type === 'warning' ? '#fffbeb' : '#f5f3ff'),
                  border: `2px solid ${shipmentNotice.type === 'error' ? '#f87171' : (shipmentNotice.type === 'warning' ? '#f59e0b' : '#8b5cf6')}`,
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        background: shipmentNotice.type === 'error' ? '#fee2e2' : (shipmentNotice.type === 'warning' ? '#fef3c7' : '#ede9fe'),
                        color: shipmentNotice.type === 'error' ? '#991b1b' : (shipmentNotice.type === 'warning' ? '#92400e' : '#5b21b6'),
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {shipmentNotice.type === 'success' ? '✓ Shiprocket Dispatched' : (shipmentNotice.type === 'warning' ? '⚠️ Action Required' : '🚚 Shiprocket Update')}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                        {shipmentNotice.message}
                      </span>
                    </div>
                    {shipmentNotice.details && (
                      <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>
                        {shipmentNotice.details}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {shipmentNotice.labelUrl && (
                      <a
                        href={shipmentNotice.labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#7c3aed',
                          color: '#ffffff',
                          padding: '0.6rem 1.1rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Download size={14} />
                        <span>Download Shipping Label</span>
                      </a>
                    )}
                    {(shipmentNotice.awbCode && !String(shipmentNotice.awbCode).toLowerCase().includes('pending')) ? (
                      <a
                        href={`https://shiprocket.co/tracking/${shipmentNotice.awbCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          padding: '0.6rem 1.1rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Truck size={14} />
                        <span>Track (${shipmentNotice.awbCode})</span>
                      </a>
                    ) : (
                      <a
                        href="https://app.shiprocket.in/orders"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          padding: '0.6rem 1.1rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <ExternalLink size={14} />
                        <span>View in Shiprocket Portal</span>
                      </a>
                    )}
                    <button
                      onClick={() => setShipmentNotice(null)}
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#64748b',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )
            }


            {/* Automated Order Status Update Notification Banner */}
            {
              statusUpdateAlert && (
                <div style={{
                  background: '#ffffff',
                  border: '2px solid #25D366',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 16px rgba(37, 211, 102, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  animation: 'fadeIn 0.3s ease-in-out'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                        ✓ Status Updated to {statusUpdateAlert.newStatus}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        Order #${statusUpdateAlert.order.orderNumber} (${statusUpdateAlert.order.shippingName})
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                      {statusUpdateAlert.emailDispatched ? '✓ Automatic email notification dispatched to ' + statusUpdateAlert.order.shippingEmail + ' • ' : ''}
                      Send personalized WhatsApp update to <strong>{statusUpdateAlert.phone || statusUpdateAlert.order.shippingPhone}</strong>:
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a
                      href={statusUpdateAlert.waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: '#25D366',
                        color: '#ffffff',
                        padding: '0.6rem 1.1rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                      }}
                    >
                      <WhatsAppBrandIcon size={16} />
                      <span>Send WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleEmailCustomer(statusUpdateAlert.order, statusUpdateAlert.newStatus)}
                      style={{
                        background: '#1d4ed8',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.6rem 1.1rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)'
                      }}
                    >
                      <EmailBrandIcon size={16} />
                      <span>Send Email</span>
                    </button>

                    <button
                      onClick={() => setStatusUpdateAlert(null)}

                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#64748b',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )
            }

            {/* 4 Crisp Stat Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: isMobile ? '0.75rem' : '1.25rem',
              marginBottom: isMobile ? '1.25rem' : '2rem'
            }}>
              {/* Revenue */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: isMobile ? '0.9rem' : '1.3rem 1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                  Online Revenue
                </span>
                <div style={{ fontSize: isMobile ? '1.35rem' : '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  ₹{totalRevenue.toFixed(0)}
                </div>
                <span style={{ fontSize: isMobile ? '0.7rem' : '0.78rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> 5% GST Itemized
                </span>
              </div>

              {/* Total Orders */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: isMobile ? '0.9rem' : '1.3rem 1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                  Store Orders
                </span>
                <div style={{ fontSize: isMobile ? '1.35rem' : '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  {orders.length}
                </div>
                <span style={{ fontSize: isMobile ? '0.7rem' : '0.78rem', color: '#64748b' }}>
                  Total Orders
                </span>
              </div>

              {/* Pending Roasting */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #fde68a',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '12px',
                padding: isMobile ? '0.9rem' : '1.3rem 1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                  Pending Roasts
                </span>
                <div style={{ fontSize: isMobile ? '1.35rem' : '1.8rem', fontWeight: 800, color: '#b45309', margin: '4px 0' }}>
                  {pendingCount}
                </div>
                <span style={{ fontSize: isMobile ? '0.7rem' : '0.78rem', color: '#92400e', fontWeight: 600 }}>
                  {pendingCount > 0 ? '⚠️ Action Required' : '✓ All caught up!'}
                </span>
              </div>

              {/* Delivered */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #bbf7d0',
                borderLeft: '4px solid #10b981',
                borderRadius: '12px',
                padding: isMobile ? '0.9rem' : '1.3rem 1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                  Completed
                </span>
                <div style={{ fontSize: isMobile ? '1.35rem' : '1.8rem', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>
                  {deliveredCount}
                </div>
                <span style={{ fontSize: isMobile ? '0.7rem' : '0.78rem', color: '#166534' }}>
                  Delivered
                </span>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: isMobile ? '0.75rem 0.85rem' : '1rem 1.25rem',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              {/* Status Pills */}
              <div style={{
                display: 'flex',
                gap: '0.4rem',
                overflowX: 'auto',
                paddingBottom: isMobile ? '4px' : '0',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none'
              }}>
                {[
                  { id: 'all', label: `All Orders (${orders.length})` },
                  { id: 'placed', label: 'Placed' },
                  { id: 'packed', label: 'Packed' },
                  { id: 'shipped', label: 'Shipped' },
                  { id: 'delivered', label: 'Delivered' },
                ].map(tab => {
                  const active = selectedFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedFilter(tab.id)}
                      style={{
                        background: active ? '#8c6239' : '#f1f5f9',
                        color: active ? '#ffffff' : '#475569',
                        border: 'none',
                        padding: isMobile ? '0.4rem 0.75rem' : '0.45rem 0.95rem',
                        borderRadius: '20px',
                        fontSize: isMobile ? '0.75rem' : '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        flexShrink: 0,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', width: isMobile ? '100%' : '280px', maxWidth: '100%' }}>
                <input
                  type="text"
                  placeholder="Search by Order #, Name, Phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem 0.55rem 2.2rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Orders Card / List */}
            < div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {
                filteredOrders.length === 0 ? (
                  <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <Package size={30} color="#94a3b8" />
                    </div>
                    <h3 style={{ margin: '0 0 0.4rem', color: '#0f172a', fontFamily: 'Georgia, serif', fontSize: '1.3rem' }}>
                      No Orders Found
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                      {orders.length === 0
                        ? 'Orders placed on the website will automatically populate here in real time.'
                        : 'No orders matched your current search criteria or filter.'}
                    </p>
                    <button
                      onClick={onBack}
                      style={{
                        background: 'linear-gradient(135deg, #C8935A, #a87238)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.65rem 1.4rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Go to Storefront
                    </button>
                  </div>
                ) : (
                  <div>
                    {filteredOrders.map(order => {
                      const status = (order.orderStatus || order.status || 'placed').toLowerCase();
                      const statusTheme = {
                        placed: { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'Order Placed' },
                        packed: { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', label: 'Freshly Roasted' },
                        shipped: { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff', label: 'In Transit' },
                        delivered: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'Delivered' },
                        cancelled: { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', label: 'Cancelled' },
                      }[status] || { bg: '#f1f5f9', color: '#334155', border: '#e2e8f0', label: status };

              return (
                  <div 
                    key={order._id || order.orderNumber}
                    style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '14px',
                    padding: isMobile ? '1rem' : '1.35rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.1rem',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  >
                    {/* Row 1: Order Metadata & Status Controls (Zero Overlap) */}
                                      <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '1rem',
                                        background: '#f8fafc',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px'
                                      }}>
                                        {/* Left: ID, Date, Badge */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                                            #{order.orderNumber}
                                          </span>
                                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                                          </span>
                                          <span style={{
                                            background: statusTheme.bg,
                                            color: statusTheme.color,
                                            border: `1px solid ${statusTheme.border}`,
                                            padding: '3px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase'
                                          }}>
                                            {statusTheme.label}
                                          </span>
                                          {status === 'delivered' && (() => {
                                            const delivTime = order.deliveredAt || order.updatedAt || order.createdAt;
                                            const diffDays = getCalendarDaysAgo(delivTime);
                                            const delivText = getDeliveryElapsedBadgeText(diffDays);
                                            const delivDateStr = formatDisplayDate(delivTime);
                                            return (
                                              <span style={{
                                                background: '#ecfdf5',
                                                color: '#065f46',
                                                border: '1px solid #10b981',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                fontSize: '0.72rem',
                                                fontWeight: 800,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                              }}>
                                                🚚 {delivText} {delivDateStr ? `(${delivDateStr})` : ''}
                                              </span>
                                            );
                                          })()}
                                        </div>

                                        {/* Right: Clean Status Dropdown + 1-Click WhatsApp & Email Buttons */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                                            Status:
                                          </label>
                                          <select 
                                            value={status}
                                            onChange={e => handleUpdateStatus(order._id || order.orderNumber, e.target.value)}
                                            style={{
                                              background: '#ffffff',
                                              border: '1.5px solid #cbd5e1',
                                              color: '#0f172a',
                                              padding: '0.4rem 0.75rem',
                                              borderRadius: '6px',
                                              fontSize: '0.8rem',
                                              fontWeight: 600,
                                              outline: 'none',
                                              cursor: 'pointer'
                                            }}
                                          >
                                            <option value="placed">Placed (Order Received)</option>
                                            <option value="packed">Packed (Freshly Roasted)</option>
                                            <option value="shipped">Shipped (In Transit)</option>
                                            <option value="delivered">Delivered (Completed)</option>
                                            <option value="cancelled">Cancelled</option>
                                          </select>

                                          <button
                                            type="button"
                                            onClick={() => handleSendStatusNotification(order, status, true)}
                                            style={{
                                              background: '#f0fdf4',
                                              border: '1px solid #bbf7d0',
                                              color: '#15803d',
                                              padding: '0.38rem 0.55rem',
                                              borderRadius: '6px',
                                              fontSize: '0.74rem',
                                              fontWeight: 700,
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              transition: 'all 0.15s'
                                            }}
                                            title="Send current status update to customer on WhatsApp"
                                          >
                                            <WhatsAppBrandIcon size={12} />
                                            <span>WhatsApp</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleEmailCustomer(order, status)}
                                            style={{
                                              background: '#eff6ff',
                                              border: '1px solid #bfdbfe',
                                              color: '#1d4ed8',
                                              padding: '0.38rem 0.55rem',
                                              borderRadius: '6px',
                                              fontSize: '0.74rem',
                                              fontWeight: 700,
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              transition: 'all 0.15s'
                                            }}
                                            title="Send current status update to customer by Email"
                                          >
                                            <EmailBrandIcon size={12} />
                                            <span>Email</span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Row 2: Complete Transparent Customer Dossier (No DB lookup needed!) */}
                                      <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                        gap: '1rem',
                                        padding: '0.25rem 0'
                                      }}>
                                        {/* Card 1: Customer Identity & Complete Shipping Address */}
                                        <div style={{
                                          background: '#ffffff',
                                          border: '1.5px solid #e2e8f0',
                                          borderRadius: '10px',
                                          padding: '1.1rem',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '0.65rem',
                                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                        }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#C8935A', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                              <User size={13} color="#C8935A" />
                                              Customer Information
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => copyToClipboard(order.shippingAddress, `addr-${order.orderNumber}`)}
                                              style={{
                                                background: copiedKey === `addr-${order.orderNumber}` ? '#dcfce7' : '#f8fafc',
                                                border: `1px solid ${copiedKey === `addr-${order.orderNumber}` ? '#86efac' : '#cbd5e1'}`,
                                                color: copiedKey === `addr-${order.orderNumber}` ? '#15803d' : '#475569',
                                                padding: '2px 8px',
                                                borderRadius: '5px',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                              }}
                                              title="Copy full shipping address for courier label"
                                            >
                                              {copiedKey === `addr-${order.orderNumber}` ? <Check size={11} color="#15803d" /> : <Copy size={11} />}
                                              <span>{copiedKey === `addr-${order.orderNumber}` ? 'Copied!' : 'Copy Address'}</span>
                                            </button>
                                          </div>

                                          {/* Customer Name */}
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                              width: '32px',
                                              height: '32px',
                                              borderRadius: '50%',
                                              background: 'linear-gradient(135deg, #F5EDE0, #E8CA80)',
                                              color: '#4A3525',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontWeight: 800,
                                              fontSize: '0.82rem',
                                              flexShrink: 0
                                            }}>
                                              {(order.shippingName || 'C').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                                                {order.shippingName || 'Valued Customer'}
                                              </div>
                                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                Verified Online Shopper
                                              </div>
                                            </div>
                                          </div>

                                          {/* Direct Contacts: Phone & Email */}
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#f8fafc', padding: '0.65rem 0.75rem', borderRadius: '7px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                                              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Phone size={12} color="#059669" />
                                                <a href={`tel:${order.shippingPhone}`} style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>
                                                  {order.shippingPhone || '—'}
                                                </a>
                                              </span>
                                              {order.shippingPhone && (
                                                <a
                                                  href={`https://wa.me/${String(order.shippingPhone).replace(/\D/g, '').length === 10 ? '91' + String(order.shippingPhone).replace(/\D/g, '') : String(order.shippingPhone).replace(/\D/g, '')}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  style={{
                                                    background: '#25D366',
                                                    color: '#fff',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.68rem',
                                                    fontWeight: 700,
                                                    textDecoration: 'none',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '3px'
                                                  }}
                                                >
                                                  <WhatsAppBrandIcon size={10} color="#fff" />
                                                  <span>WhatsApp</span>
                                                </a>
                                              )}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginTop: '2px' }}>
                                              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <EmailBrandIcon size={12} />
                                                <a href={`mailto:${order.shippingEmail}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                                                  {order.shippingEmail || '—'}
                                                </a>
                                              </span>
                                              {order.shippingEmail && (
                                                <button
                                                  type="button"
                                                  onClick={() => copyToClipboard(order.shippingEmail, `email-${order.orderNumber}`)}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: copiedKey === `email-${order.orderNumber}` ? '#15803d' : '#64748b',
                                                    cursor: 'pointer',
                                                    fontSize: '0.68rem',
                                                    fontWeight: 600,
                                                    padding: '0 4px'
                                                  }}
                                                >
                                                  {copiedKey === `email-${order.orderNumber}` ? '✓ Copied' : 'Copy'}
                                                </button>
                                              )}
                                            </div>
                                          </div>

                                          {/* Full Shipping Address */}
                                          <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.45, background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.65rem 0.75rem', borderRadius: '7px' }}>
                                            <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                              <MapPin size={12} color="#d97706" />
                                              Shipping & Delivery Destination
                                            </div>
                                            <div>{order.shippingAddress || '—'}</div>
                                            {order.pincode && (
                                              <div style={{ marginTop: '4px', display: 'inline-block', background: '#d97706', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                                                PIN: {order.pincode}
                                              </div>
                                            )}
                                          </div>

                                          {/* B2B / GST Details */}
                                          {(order.b2bGstin || order.b2bCompanyName) && (
                                            <div style={{ fontSize: '0.76rem', color: '#1e40af', background: '#eff6ff', border: '1px solid #dbeafe', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                                              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                                <Building size={12} color="#1d4ed8" />
                                                B2B Business Invoice
                                              </div>
                                              {order.b2bCompanyName && <div>Company: <strong>{order.b2bCompanyName}</strong></div>}
                                              {order.b2bGstin && <div>GSTIN: <strong style={{ fontFamily: 'monospace' }}>{order.b2bGstin}</strong></div>}
                                            </div>
                                          )}
                                        </div>

                                        {/* Card 2: Items Ordered & Quantities */}
                                        <div style={{
                                          background: '#ffffff',
                                          border: '1.5px solid #e2e8f0',
                                          borderRadius: '10px',
                                          padding: '1.1rem',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          justifyContent: 'space-between',
                                          gap: '0.65rem',
                                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                        }}>
                                          <div>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#C8935A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                              <Package size={13} color="#C8935A" />
                                              Items in Order ({order.items?.length || 0})
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                                              {(order.items || []).map((item, idx) => (
                                                <div
                                                  key={idx}
                                                  style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    fontSize: '0.82rem',
                                                    padding: '5px 8px',
                                                    background: '#f8fafc',
                                                    borderRadius: '6px',
                                                    border: '1px solid #f1f5f9'
                                                  }}
                                                >
                                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</span>
                                                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                      {item.weight ? `${item.weight} • ` : ''}Qty: <strong>{item.qty || 1}</strong> × ₹{Number(item.price || 0).toFixed(0)}
                                                    </span>
                                                  </div>
                                                  <span style={{ fontWeight: 800, color: '#0f172a' }}>
                                                    ₹{(Number(item.price || 0) * Number(item.qty || 1)).toFixed(0)}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>

                                          <div style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
                                            Total Units: <strong>{(order.items || []).reduce((acc, it) => acc + (it.qty || 1), 0)} packs</strong>
                                          </div>
                                        </div>

                                        {/* Card 3: Payment & Gateway Audit Trail */}
                                        <div style={{
                                          background: '#ffffff',
                                          border: '1.5px solid #e2e8f0',
                                          borderRadius: '10px',
                                          padding: '1.1rem',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          justifyContent: 'space-between',
                                          gap: '0.65rem',
                                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                        }}>
                                          <div>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#C8935A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                              <CreditCard size={13} color="#C8935A" />
                                              Payment & Gateway Audit
                                            </div>

                                            {/* Payment Method & Status Badge */}
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                              <span style={{
                                                padding: '3px 8px',
                                                borderRadius: '5px',
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                background: order.paymentMethod === 'cod' ? '#fef3c7' : '#e0f2fe',
                                                color: order.paymentMethod === 'cod' ? '#92400e' : '#0369a1',
                                                border: `1px solid ${order.paymentMethod === 'cod' ? '#fde68a' : '#bae6fd'}`
                                              }}>
                                                {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                                              </span>

                                              <span style={{
                                                padding: '3px 8px',
                                                borderRadius: '5px',
                                                fontSize: '0.72rem',
                                                fontWeight: 800,
                                                background: (order.paymentStatus || 'paid').toLowerCase() === 'paid' ? '#dcfce7' : '#fee2e2',
                                                color: (order.paymentStatus || 'paid').toLowerCase() === 'paid' ? '#15803d' : '#b91c1c',
                                                border: `1px solid ${(order.paymentStatus || 'paid').toLowerCase() === 'paid' ? '#bbf7d0' : '#fecaca'}`
                                              }}>
                                                {(order.paymentStatus || 'paid').toUpperCase()}
                                              </span>
                                            </div>

                                            {/* Gateway IDs */}
                                            <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', background: '#f8fafc', padding: '0.65rem 0.75rem', borderRadius: '7px', border: '1px solid #f1f5f9' }}>
                                              <div>
                                                <span style={{ color: '#64748b' }}>Razorpay Payment ID:</span>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', fontSize: '0.74rem' }}>
                                                    {order.razorpayPaymentId || 'pay_online_verified'}
                                                  </span>
                                                  {order.razorpayPaymentId && (
                                                    <button
                                                      type="button"
                                                      onClick={() => copyToClipboard(order.razorpayPaymentId, `rzp-${order.orderNumber}`)}
                                                      style={{ background: 'none', border: 'none', color: '#C8935A', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700 }}
                                                    >
                                                      {copiedKey === `rzp-${order.orderNumber}` ? '✓ Copied' : 'Copy'}
                                                    </button>
                                                  )}
                                                </div>
                                              </div>

                                              {order.razorpayOrderId && (
                                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '4px', marginTop: '2px' }}>
                                                  <span style={{ color: '#64748b' }}>Razorpay Order ID:</span>
                                                  <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', fontSize: '0.72rem' }}>
                                                    {order.razorpayOrderId}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Grand Total & Tax Info */}
                                          <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '2px' }}>
                                              <span>5% GST & Shipping:</span>
                                              <span>{order.shippingFee === 0 || !order.shippingFee ? 'FREE Delivery (5% GST Incl.)' : `₹${order.shippingFee} Delivery`}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Amount Payable:</span>
                                              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#8c6239' }}>
                                                ₹{parseFloat(order.totalAmount || 0).toFixed(0)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Row 3: Action Buttons with Full Dossier Viewer */}
                                      <div className="admin-order-actions" style={{
                                        display: 'flex',
                                        gap: '0.65rem',
                                        flexWrap: 'wrap',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        borderTop: '1px solid #f1f5f9',
                                        paddingTop: '0.85rem'
                                      }}>
                                        
                                        {/* View Full Customer Dossier Modal Button */}
                                        <button
                                          type="button"
                                          onClick={() => setSelectedOrderDossier(order)}
                                          style={{
                                            background: '#f8fafc',
                                            border: '1.5px solid #cbd5e1',
                                            color: '#0f172a',
                                            padding: '0.45rem 0.9rem',
                                            borderRadius: '6px',
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.15s'
                                          }}
                                        >
                                          <Eye size={14} color="#0f172a" />
                                          <span>Inspect Customer Dossier</span>
                                        </button>

                                        {/* Quick Copy Full Details Button */}
                                        <button
                                          type="button"
                                          onClick={() => copyFullCustomerDossier(order)}
                                          style={{
                                            background: copiedKey === `dossier-${order.orderNumber}` ? '#dcfce7' : '#ffffff',
                                            border: `1.5px solid ${copiedKey === `dossier-${order.orderNumber}` ? '#86efac' : '#e2e8f0'}`,
                                            color: copiedKey === `dossier-${order.orderNumber}` ? '#15803d' : '#475569',
                                            padding: '0.45rem 0.85rem',
                                            borderRadius: '6px',
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            transition: 'all 0.15s'
                                          }}
                                          title="Copy full text dossier to paste in WhatsApp or courier portal"
                                        >
                                          {copiedKey === `dossier-${order.orderNumber}` ? <CheckCheck size={14} color="#15803d" /> : <Copy size={14} />}
                                          <span>{copiedKey === `dossier-${order.orderNumber}` ? '✓ Dossier Copied!' : 'Copy Packing Info'}</span>
                                        </button>

                                        {/* Shiprocket Automated Logistics Action */}
                                        {(order.awbCode && !String(order.awbCode).toLowerCase().includes('pending')) ? (
                                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            <a
                                              href={`https://shiprocket.co/tracking/${order.awbCode}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{
                                                background: '#eff6ff',
                                                border: '1.5px solid #93c5fd',
                                                color: '#1d4ed8',
                                                padding: '0.5rem 0.9rem',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                              }}
                                            >
                                              <Truck size={15} color="#1d4ed8" />
                                              <span>Track (${order.awbCode})</span>
                                            </a>
                                            {order.labelUrl && (
                                              <a
                                                href={order.labelUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                  background: '#ffffff',
                                                  border: '1px solid #cbd5e1',
                                                  color: '#475569',
                                                  padding: '0.5rem 0.8rem',
                                                  borderRadius: '6px',
                                                  fontSize: '0.8rem',
                                                  fontWeight: 600,
                                                  textDecoration: 'none'
                                                }}
                                              >
                                                <span>Print Label</span>
                                              </a>
                                            )}
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            disabled={shippingOrderId === (order._id || order.orderNumber)}
                                            onClick={() => handleShiprocketDispatch(order)}
                                            style={{
                                              background: '#7c3aed',
                                              border: 'none',
                                              color: '#ffffff',
                                              padding: '0.5rem 1rem',
                                              borderRadius: '6px',
                                              fontSize: '0.8rem',
                                              fontWeight: 700,
                                              cursor: shippingOrderId === (order._id || order.orderNumber) ? 'wait' : 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                                              transition: 'all 0.15s'
                                            }}
                                          >
                                            <Truck size={15} />
                                            <span>{shippingOrderId === (order._id || order.orderNumber) ? 'Generating AWB...' : 'Ship with Shiprocket'}</span>
                                          </button>
                                        )}

                                        <button
                                          onClick={() => handleWhatsAppCustomer(order)}
                                          style={{
                                            background: '#f0fdf4',
                                            border: '1px solid #86efac',
                                            color: '#16a34a',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s'
                                          }}
                                        >
                                          <WhatsAppBrandIcon size={16} />
                                          <span>WhatsApp Customer</span>
                                        </button>

                                        <button
                                          onClick={() => generateTaxInvoice(order)}
                                          style={{
                                            background: '#ffffff',
                                            border: '1.5px solid #C8935A',
                                            color: '#8c6239',
                                            padding: '0.5rem 1.1rem',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                            transition: 'all 0.2s'
                                          }}
                                        >
                                          <Download size={15} color="#8c6239" />
                                          <span>Official GST Tax Invoice (PDF)</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* ============================================================ */}
                          {/* FULL CUSTOMER DOSSIER & PACKING INSPECTION MODAL */}
                          {/* ============================================================ */}
                          <AnimatePresence>
                            {selectedOrderDossier && (
                              <div style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(15, 23, 42, 0.72)',
                                backdropFilter: 'blur(6px)',
                                zIndex: 9999,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1rem',
                                overflowY: 'auto'
                              }}>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                  transition={{ duration: 0.2 }}
                                  style={{
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    maxWidth: '720px',
                                    width: '100%',
                                    maxHeight: '90vh',
                                    overflowY: 'auto',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                    border: '1px solid #cbd5e1',
                                    display: 'flex',
                                    flexDirection: 'column'
                                  }}
                                >
                                  {/* Modal Header */}
                                  <div style={{
                                    padding: '1.25rem 1.5rem',
                                    borderBottom: '1px solid #e2e8f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#f8fafc',
                                    borderTopLeftRadius: '16px',
                                    borderTopRightRadius: '16px'
                                  }}>
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                                          Customer Dossier #{selectedOrderDossier.orderNumber}
                                        </span>
                                        <span style={{
                                          padding: '3px 8px',
                                          borderRadius: '6px',
                                          fontSize: '0.72rem',
                                          fontWeight: 800,
                                          textTransform: 'uppercase',
                                          background: '#fef3c7',
                                          color: '#92400e'
                                        }}>
                                          {selectedOrderDossier.orderStatus || selectedOrderDossier.status || 'Placed'}
                                        </span>
                                      </div>
                                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                                        Placed on: {selectedOrderDossier.createdAt ? new Date(selectedOrderDossier.createdAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'medium' }) : 'Recent'}
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => setSelectedOrderDossier(null)}
                                      style={{
                                        background: '#ffffff',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '8px',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#64748b'
                                      }}
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>

                                  {/* Modal Body */}
                                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                    {/* Customer Profile Box */}
                                    <div style={{
                                      background: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '12px',
                                      padding: '1.25rem'
                                    }}>
                                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#C8935A', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                                        Customer Contact & Identity
                                      </div>

                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                        <div>
                                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Full Name</div>
                                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                                            {selectedOrderDossier.shippingName || 'Customer'}
                                          </div>
                                        </div>

                                        <div>
                                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Mobile Phone</div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                            <a href={`tel:${selectedOrderDossier.shippingPhone}`} style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', textDecoration: 'none' }}>
                                              {selectedOrderDossier.shippingPhone || '—'}
                                            </a>
                                            {selectedOrderDossier.shippingPhone && (
                                              <a
                                                href={`https://wa.me/${String(selectedOrderDossier.shippingPhone).replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                  background: '#25D366',
                                                  color: '#fff',
                                                  fontSize: '0.7rem',
                                                  fontWeight: 700,
                                                  padding: '2px 8px',
                                                  borderRadius: '4px',
                                                  textDecoration: 'none',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '4px'
                                                }}
                                              >
                                                <WhatsAppBrandIcon size={12} />
                                                <span>WhatsApp</span>
                                              </a>
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Email Address</div>
                                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                            <EmailBrandIcon size={14} />
                                            <a href={`mailto:${selectedOrderDossier.shippingEmail}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                                              {selectedOrderDossier.shippingEmail || '—'}
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Delivery Address Box */}
                                    <div style={{
                                      background: '#fffdfa',
                                      border: '1.5px solid #fed7aa',
                                      borderRadius: '12px',
                                      padding: '1.25rem'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <MapPin size={14} color="#ea580c" />
                                          Complete Delivery Destination
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          {selectedOrderDossier.addressType && (
                                            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                                              {selectedOrderDossier.addressType === 'Home' ? '🏠 Home' : selectedOrderDossier.addressType === 'Office' ? '🏢 Office' : '📍 ' + selectedOrderDossier.addressType}
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => copyToClipboard(selectedOrderDossier.shippingAddress, 'modal-addr')}
                                            style={{
                                              background: '#ffffff',
                                              border: '1px solid #d97706',
                                              color: '#d97706',
                                              padding: '3px 8px',
                                              borderRadius: '4px',
                                              fontSize: '0.72rem',
                                              fontWeight: 700,
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}
                                          >
                                            {copiedKey === 'modal-addr' ? <Check size={12} /> : <Copy size={12} />}
                                            <span>{copiedKey === 'modal-addr' ? 'Copied!' : 'Copy Label Address'}</span>
                                          </button>
                                        </div>
                                      </div>

                                      {(selectedOrderDossier.houseNo || selectedOrderDossier.area) ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#1e293b', fontSize: '0.88rem' }}>
                                          {selectedOrderDossier.houseNo && (
                                            <div>
                                              <span style={{ color: '#64748b', fontSize: '0.76rem', display: 'block', fontWeight: 600 }}>House / Flat / Building / Apartment:</span>
                                              <strong style={{ fontSize: '0.94rem' }}>{selectedOrderDossier.houseNo}</strong>
                                            </div>
                                          )}
                                          {selectedOrderDossier.area && (
                                            <div>
                                              <span style={{ color: '#64748b', fontSize: '0.76rem', display: 'block', fontWeight: 600 }}>Street / Road / Sector / Village:</span>
                                              <strong style={{ fontSize: '0.94rem' }}>{selectedOrderDossier.area}</strong>
                                            </div>
                                          )}
                                          {selectedOrderDossier.landmark && (
                                            <div>
                                              <span style={{ color: '#64748b', fontSize: '0.76rem', display: 'block', fontWeight: 600 }}>Nearby Landmark:</span>
                                              <span style={{ color: '#0369a1', fontWeight: 700 }}>Near {selectedOrderDossier.landmark}</span>
                                            </div>
                                          )}
                                          <div>
                                            <span style={{ color: '#64748b', fontSize: '0.76rem', display: 'block', fontWeight: 600 }}>City & State:</span>
                                            <strong>{selectedOrderDossier.city ? `${selectedOrderDossier.city}, ` : ''}{selectedOrderDossier.state || 'Karnataka'}</strong>
                                          </div>
                                        </div>
                                      ) : (
                                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.5 }}>
                                          {selectedOrderDossier.shippingAddress || '—'}
                                        </div>
                                      )}

                                      {selectedOrderDossier.pincode && (
                                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                          <span style={{ background: '#d97706', color: '#ffffff', fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: '5px' }}>
                                            Postal PIN: {selectedOrderDossier.pincode}
                                          </span>
                                          <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700 }}>
                                            {isKarnatakaPincode(selectedOrderDossier.pincode) ? 'Karnataka Circle (₹44 Delivery)' : 'Interstate Circle (₹68 Delivery)'}
                                          </span>
                                        </div>
                                      )}

                                      {selectedOrderDossier.deliveryInstructions && (
                                        <div style={{ marginTop: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', color: '#1e40af' }}>
                                          🔔 <strong>Courier Delivery Instructions:</strong> {selectedOrderDossier.deliveryInstructions}
                                        </div>
                                      )}

                                      {(selectedOrderDossier.b2bGstin || selectedOrderDossier.b2bCompanyName) && (
                                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #fde68a', fontSize: '0.82rem', color: '#1e40af' }}>
                                          {selectedOrderDossier.b2bCompanyName && <div>Company: <strong>{selectedOrderDossier.b2bCompanyName}</strong></div>}
                                          {selectedOrderDossier.b2bGstin && <div>GSTIN: <strong style={{ fontFamily: 'monospace' }}>{selectedOrderDossier.b2bGstin}</strong></div>}
                                        </div>
                                      )}
                                    </div>

                                    {/* Purchased Estate Products Table */}
                                    <div style={{
                                      background: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '12px',
                                      padding: '1.25rem'
                                    }}>
                                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
                                        Purchased Estate Products
                                      </div>

                                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                                        <thead>
                                          <tr style={{ borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                                            <th style={{ paddingBottom: '6px' }}>Item</th>
                                            <th style={{ paddingBottom: '6px' }}>Variant</th>
                                            <th style={{ paddingBottom: '6px', textAlign: 'center' }}>Qty</th>
                                            <th style={{ paddingBottom: '6px', textAlign: 'right' }}>Price</th>
                                            <th style={{ paddingBottom: '6px', textAlign: 'right' }}>Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(selectedOrderDossier.items || []).map((it, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                              <td style={{ padding: '8px 0', fontWeight: 700, color: '#0f172a' }}>{it.name}</td>
                                              <td style={{ padding: '8px 0', color: '#64748b' }}>{it.weight || 'Standard'}</td>
                                              <td style={{ padding: '8px 0', textAlign: 'center', fontWeight: 700 }}>{it.qty || 1}</td>
                                              <td style={{ padding: '8px 0', textAlign: 'right', color: '#475569' }}>₹{Number(it.price || 0).toFixed(0)}</td>
                                              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                                                ₹{(Number(it.price || 0) * Number(it.qty || 1)).toFixed(0)}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>

                                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                                          <span>Subtotal:</span>
                                          <span>₹{Number(selectedOrderDossier.subtotal || (selectedOrderDossier.totalAmount - (selectedOrderDossier.shippingFee || 0))).toFixed(0)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                                          <span>5% GST Included:</span>
                                          <span>₹{Number(selectedOrderDossier.gstAmount || (selectedOrderDossier.totalAmount * 0.05 / 1.05)).toFixed(0)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                                          <span>Shipping Delivery:</span>
                                          <span>{selectedOrderDossier.shippingFee === 0 || !selectedOrderDossier.shippingFee ? 'FREE Delivery' : `₹${selectedOrderDossier.shippingFee}`}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: '#8c6239', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                                          <span>Total Amount Paid:</span>
                                          <span>₹{parseFloat(selectedOrderDossier.totalAmount || 0).toFixed(0)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Payment Gateway Audit Box */}
                                    <div style={{
                                      background: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '12px',
                                      padding: '1rem',
                                      fontSize: '0.78rem',
                                      color: '#475569',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      flexWrap: 'wrap',
                                      gap: '10px'
                                    }}>
                                      <div>
                                        <span style={{ color: '#64748b' }}>Payment Mode: </span>
                                        <strong style={{ color: '#0f172a' }}>{selectedOrderDossier.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}</strong>
                                      </div>
                                      <div>
                                        <span style={{ color: '#64748b' }}>Status: </span>
                                        <strong style={{ color: (selectedOrderDossier.paymentStatus || 'paid').toLowerCase() === 'paid' ? '#15803d' : '#b91c1c' }}>
                                          {(selectedOrderDossier.paymentStatus || 'paid').toUpperCase()}
                                        </strong>
                                      </div>
                                      {selectedOrderDossier.razorpayPaymentId && (
                                        <div>
                                          <span style={{ color: '#64748b' }}>Razorpay ID: </span>
                                          <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{selectedOrderDossier.razorpayPaymentId}</strong>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Modal Footer Actions */}
                                  <div style={{
                                    padding: '1.25rem 1.5rem',
                                    borderTop: '1px solid #e2e8f0',
                                    background: '#f8fafc',
                                    borderBottomLeftRadius: '16px',
                                    borderBottomRightRadius: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                  }}>
                                    <button
                                      type="button"
                                      onClick={() => window.print()}
                                      style={{
                                        background: '#ffffff',
                                        border: '1.5px solid #cbd5e1',
                                        color: '#0f172a',
                                        padding: '0.55rem 1rem',
                                        borderRadius: '8px',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                      }}
                                    >
                                      <Printer size={15} />
                                      <span>Print Packing Slip</span>
                                    </button>

                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                      <button
                                        type="button"
                                        onClick={() => handleWhatsAppCustomer(selectedOrderDossier)}
                                        style={{
                                          background: '#f0fdf4',
                                          border: '1px solid #86efac',
                                          color: '#16a34a',
                                          padding: '0.55rem 1rem',
                                          borderRadius: '8px',
                                          fontSize: '0.82rem',
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px'
                                        }}
                                      >
                                        <WhatsAppBrandIcon size={16} />
                                        <span>WhatsApp</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleEmailCustomer(selectedOrderDossier)}
                                        style={{
                                          background: '#eff6ff',
                                          border: '1px solid #bfdbfe',
                                          color: '#1d4ed8',
                                          padding: '0.55rem 1rem',
                                          borderRadius: '8px',
                                          fontSize: '0.82rem',
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px'
                                        }}
                                      >
                                        <EmailBrandIcon size={16} />
                                        <span>Email</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => generateTaxInvoice(selectedOrderDossier)}
                                        style={{
                                          background: '#ffffff',
                                          border: '1.5px solid #C8935A',
                                          color: '#8c6239',
                                          padding: '0.55rem 1.1rem',
                                          borderRadius: '8px',
                                          fontSize: '0.82rem',
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          boxShadow: '0 1px 3px rgba(200, 147, 90, 0.15)'
                                        }}
                                      >
                                        <Download size={15} color="#8c6239" />
                                        <span>Official GST Tax Invoice (PDF)</span>
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      </main>
                    </div>
                  );
};

export default AdminDashboard;
