// ============================================================
// Malenadu Roast Co. — Dynamic Shipping & Tier Engine
// Logistics benchmarks for Indian D2C Specialty Coffee:
// - 1kg+ Coffee (or cart >= ₹799, or Coffee + Pepper): 100% FREE Delivery
// - Under 1kg:
//   - Karnataka (pincodes starting with 56, 57, 58, 59): ₹44 (Local Origin Courier)
//   - Other States (Rest of India): ₹84 (Interstate Express Courier)
// ============================================================

export const isKarnatakaPincode = (pincode) => {
  if (!pincode) return true; // Default to Karnataka (roastery home state)
  const clean = String(pincode).replace(/\D/g, '').trim();
  if (clean.length < 2) return true;
  const prefix = clean.substring(0, 2);
  // Karnataka postal circles: 56 (Bangalore), 57 (Chikkamagaluru/South Kar), 58 & 59 (North Kar)
  return ['56', '57', '58', '59'].includes(prefix);
};

export const getCartShippingDetails = (cart, pincode = '') => {
  if (!Array.isArray(cart) || cart.length === 0) {
    return {
      subtotal: 0,
      totalGrams: 0,
      coffeeGrams: 0,
      pepperGrams: 0,
      isFreeShipping: true,
      shippingFee: 0,
      standardFee: 44,
      isKarnataka: true,
      regionLabel: 'Karnataka',
      progressPct: 0,
      gramsToFree: 1000,
      hasCoffee500g: false,
      hasCoffee1kg: false,
      hasPepper: false,
    };
  }

  let subtotal = 0;
  let totalGrams = 0;
  let coffeeGrams = 0;
  let pepperGrams = 0;
  let hasCoffee500g = false;
  let hasCoffee1kg = false;
  let hasPepper = false;

  cart.forEach(item => {
    const qty = Number(item.qty) || 1;
    const rawPrice = item.price;
    const p = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || 0).replace(/[^0-9.]/g, '')) || 0;
    subtotal += p * qty;

    const nameLower = (item.name || '').toLowerCase();
    const weightStr = (item.weight || item.selectedWeight || '').toLowerCase();
    const isPepper = nameLower.includes('pepper') || item.category === 'pepper';

    let itemGrams = 500;
    if (weightStr.includes('1kg') || weightStr.includes('1 kg') || weightStr.includes('1000g')) {
      itemGrams = 1000;
    } else if (weightStr.includes('500g')) {
      itemGrams = 500;
    } else if (weightStr.includes('250g')) {
      itemGrams = 250;
    } else if (weightStr.includes('100g')) {
      itemGrams = 100;
    }

    totalGrams += itemGrams * qty;

    if (isPepper) {
      hasPepper = true;
      pepperGrams += itemGrams * qty;
    } else {
      coffeeGrams += itemGrams * qty;
      if (itemGrams >= 1000) hasCoffee1kg = true;
      if (itemGrams === 500) hasCoffee500g = true;
    }
  });

  // FREE Shipping Conditions:
  // 1. Total coffee weight >= 1000g (1kg pack or two 500g packs)
  // 2. OR Total cart weight >= 1000g
  // 3. OR Cart subtotal >= ₹799
  // 4. OR Customer buys Coffee (>=500g) + Tellicherry Pepper
  // 5. OR Product is the special ₹8 payment verification test sample
  const hasSpecialFreeShippingItem = cart.some(item => 
    item.freeShipping === true ||
    Number(item.price) === 8 ||
    (item.name || '').toLowerCase().includes('payment verification') ||
    (item.name || '').toLowerCase().includes('payment test')
  );

  const isFreeShipping = hasSpecialFreeShippingItem || coffeeGrams >= 1000 || totalGrams >= 1000 || subtotal >= 799 || (coffeeGrams >= 500 && hasPepper);
  
  // Pincode-based delivery rates: Karnataka = ₹44, Other States = ₹84
  const isKarnataka = isKarnatakaPincode(pincode);
  const standardFee = isKarnataka ? 44 : 84;
  const shippingFee = isFreeShipping ? 0 : standardFee;
  const progressPct = isFreeShipping ? 100 : Math.min(95, Math.round((Math.max(coffeeGrams, totalGrams) / 1000) * 100));
  const gramsToFree = Math.max(0, 1000 - Math.max(coffeeGrams, totalGrams));

  return {
    subtotal,
    totalGrams,
    coffeeGrams,
    pepperGrams,
    isFreeShipping,
    shippingFee,
    standardFee,
    isKarnataka,
    regionLabel: isKarnataka ? 'Karnataka' : 'Other States',
    progressPct,
    gramsToFree,
    hasCoffee500g,
    hasCoffee1kg,
    hasPepper
  };
};

