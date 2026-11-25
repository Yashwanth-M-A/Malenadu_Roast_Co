// ============================================================
// Malenadu Roast Co. — Dynamic Shipping & Tier Engine
// Logistics benchmarks for Indian D2C Specialty Coffee:
// - 1kg+ Coffee (or cart >= ₹799, or Coffee + Pepper): 100% FREE Delivery
// - Under 1kg:
//   - Karnataka (pincodes starting with 56, 57, 58, 59): ₹44 (Local Origin Courier)
//   - Other States (Rest of India): ₹84 (Interstate Express Courier)
// ============================================================

// Authoritative pricing lookup for 500g and 1kg of all coffee varieties
export const COFFEE_VARIETY_RATES = {
  'estate': { 500: 469, 1000: 874, name: 'Malenadu Estate Reserve' },
  'highland': { 500: 529, 1000: 984, name: 'Highland Signature Reserve' },
  'heritage': { 500: 579, 1000: 1084, name: 'Imperial Heritage Reserve' },
  'peaberry': { 500: 709, 1000: 1354, name: 'Peaberry Grand Cru Royale' },
  'bean': { 500: 739, 1000: 1404, name: 'Malenadu Signature Beans' }
};

export const detectCoffeeVariety = (name = '') => {
  const n = String(name || '').toLowerCase();
  if (n.includes('peaberry')) return 'peaberry';
  if (n.includes('heritage') || n.includes('85:15') || n.includes('85/15')) return 'heritage';
  if (n.includes('highland') || n.includes('80:20') || n.includes('80/20')) return 'highland';
  if (n.includes('bean') || n.includes('whole')) return 'bean';
  if (n.includes('estate') || n.includes('70:30') || n.includes('70/30')) return 'estate';
  return null;
};

// Calculates cart subtotal with smart 1kg bundling (2x 500g of same variety = 1kg price)
export const calculateCartTotals = (cart) => {
  if (!Array.isArray(cart) || cart.length === 0) {
    return {
      subtotal: 0,
      originalSubtotal: 0,
      bundleSavings: 0,
      varietySavings: {}
    };
  }

  let rawSubtotal = 0;
  const variety500gCount = {};

  cart.forEach(item => {
    const qty = Number(item.qty) || 1;
    const rawPrice = item.price;
    const p = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || 0).replace(/[^0-9.]/g, '')) || 0;
    rawSubtotal += p * qty;

    const nameLower = (item.name || '').toLowerCase();
    const weightStr = (item.weight || item.selectedWeight || '').toLowerCase();
    const is500g = weightStr.includes('500g');
    const isCoffee = !nameLower.includes('pepper') && item.category !== 'pepper' && !nameLower.includes('combo');

    if (isCoffee && is500g) {
      const variety = detectCoffeeVariety(item.name);
      if (variety && COFFEE_VARIETY_RATES[variety]) {
        variety500gCount[variety] = (variety500gCount[variety] || 0) + qty;
      }
    }
  });

  let totalBundleSavings = 0;
  const varietySavings = {};

  Object.keys(variety500gCount).forEach(variety => {
    const totalQty = variety500gCount[variety];
    const pairs = Math.floor(totalQty / 2);
    if (pairs > 0) {
      const rates = COFFEE_VARIETY_RATES[variety];
      const standardCost = 2 * rates[500];
      const bundleCost = rates[1000];
      const savingPerPair = standardCost - bundleCost;
      const totalSaving = pairs * savingPerPair;

      varietySavings[variety] = {
        pairs,
        totalSaving,
        rates
      };
      totalBundleSavings += totalSaving;
    }
  });

  const finalSubtotal = Math.max(0, rawSubtotal - totalBundleSavings);

  return {
    subtotal: finalSubtotal,
    originalSubtotal: rawSubtotal,
    bundleSavings: totalBundleSavings,
    varietySavings
  };
};

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
      originalSubtotal: 0,
      bundleSavings: 0,
      varietySavings: {},
      bundledItems: [],
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

  const { subtotal, originalSubtotal, bundleSavings, varietySavings } = calculateCartTotals(cart);
  let totalGrams = 0;
  let coffeeGrams = 0;
  let pepperGrams = 0;
  let hasCoffee500g = false;
  let hasCoffee1kg = false;
  let hasPepper = false;

  cart.forEach(item => {
    const qty = Number(item.qty) || 1;

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

  // Compute per-item bundled/effective pricing
  const remainingPairedUnits = {};
  Object.keys(varietySavings).forEach(v => {
    remainingPairedUnits[v] = (varietySavings[v].pairs || 0) * 2;
  });

  const bundledItems = cart.map(item => {
    const qty = Number(item.qty) || 1;
    const rawPrice = item.price;
    const standardUnitPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || 0).replace(/[^0-9.]/g, '')) || 0;
    const nameLower = (item.name || '').toLowerCase();
    const weightStr = (item.weight || item.selectedWeight || '').toLowerCase();
    const is500g = weightStr.includes('500g');
    const isCoffee = !nameLower.includes('pepper') && item.category !== 'pepper' && !nameLower.includes('combo');
    const variety = isCoffee && is500g ? detectCoffeeVariety(item.name) : null;

    if (variety && remainingPairedUnits[variety] > 0) {
      const pairedForThis = Math.min(qty, remainingPairedUnits[variety]);
      const unpairedForThis = qty - pairedForThis;
      remainingPairedUnits[variety] -= pairedForThis;

      const rates = COFFEE_VARIETY_RATES[variety];
      const pairedUnitRate = rates[1000] / 2;
      const totalItemPrice = (pairedForThis * pairedUnitRate) + (unpairedForThis * rates[500]);
      const effectiveUnitPrice = totalItemPrice / qty;
      const itemSavings = (qty * standardUnitPrice) - totalItemPrice;

      return {
        ...item,
        effectiveUnitPrice,
        effectiveTotalPrice: totalItemPrice,
        isBundled: true,
        bundleSavings: itemSavings,
        pairedCount: pairedForThis
      };
    }

    return {
      ...item,
      effectiveUnitPrice: standardUnitPrice,
      effectiveTotalPrice: standardUnitPrice * qty,
      isBundled: false,
      bundleSavings: 0,
      pairedCount: 0
    };
  });

  return {
    subtotal,
    originalSubtotal,
    bundleSavings,
    varietySavings,
    bundledItems,
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

// ============================================================
// E-Commerce Coupon Engine
// Flat ₹100 OFF on orders >= ₹2,000 (FLAT100 / MALENADU100)
// ============================================================
export const AVAILABLE_COUPONS = {
  'FLAT100': {
    code: 'FLAT100',
    discount: 100,
    minSubtotal: 2000,
    title: 'Flat ₹100 OFF',
    description: 'Get ₹100 instant discount on orders of ₹2,000 and above.'
  },
  'MALENADU100': {
    code: 'MALENADU100',
    discount: 100,
    minSubtotal: 2000,
    title: 'Malenadu Estate ₹100 OFF',
    description: 'Get ₹100 instant discount on orders of ₹2,000 and above.'
  }
};

export const validateCoupon = (rawCode, currentSubtotal) => {
  if (!rawCode) {
    return { valid: false, error: 'Please enter a coupon code.' };
  }
  const cleanCode = String(rawCode).trim().toUpperCase();
  const coupon = AVAILABLE_COUPONS[cleanCode];

  if (!coupon) {
    return {
      valid: false,
      error: 'Invalid coupon code. Use FLAT100 to get ₹100 off on orders above ₹2,000.'
    };
  }

  const sub = Number(currentSubtotal) || 0;
  if (sub < coupon.minSubtotal) {
    const needed = (coupon.minSubtotal - sub).toFixed(0);
    return {
      valid: false,
      error: `Coupon ${coupon.code} requires a minimum order value of ₹${coupon.minSubtotal.toLocaleString('en-IN')}. Add ₹${needed} more to apply!`,
      neededAmount: coupon.minSubtotal - sub,
      coupon
    };
  }

  return {
    valid: true,
    coupon: {
      code: coupon.code,
      discount: coupon.discount,
      minSubtotal: coupon.minSubtotal,
      title: coupon.title,
      description: coupon.description
    }
  };
};


