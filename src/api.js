// Simulated database in localStorage (Fully serverless/client-side)
const KEYS = {
  USERS: 'malenadu_users_db',
  ORDERS: 'malenadu_orders',
  ACTIVE_USER: 'malenadu_user',
  TOKEN: 'malenadu_token'
};

// Seed default demo user and empty orders database on initial load
const seedDefaultData = () => {
  try {
    let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    if (users.length === 0) {
      users = [
        {
          name: 'Demo Customer',
          email: 'demo@malenadu.com',
          phone: '9876543210',
          address: '123, Coffee Street, Chikkamagaluru, Karnataka - 577101',
          password: 'password123'
        }
      ];
    }
    // Ensure store owner admin account exists
    if (!users.some(u => u.email.toLowerCase() === 'malenaduroast@gmail.com')) {
      users.push({
        name: 'Malenadu Admin',
        email: 'malenaduroast@gmail.com',
        phone: '8217623335',
        address: 'Malenadu Roast Co., Chikkamagaluru, Karnataka - 577101',
        password: 'admin',
        role: 'admin'
      });
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    if (!localStorage.getItem(KEYS.ORDERS)) {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
    } else {
      // Automatically purge legacy demo orders from client localStorage on boot
      try {
        const storedOrders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
        if (Array.isArray(storedOrders) && storedOrders.length > 0) {
          const cleaned = storedOrders.filter(
            o => o && (o.orderNumber === 'MN-187976' || new Date(o.createdAt || 0) >= new Date('2026-11-25T00:00:00Z'))
          );
          if (cleaned.length !== storedOrders.length) {
            localStorage.setItem(KEYS.ORDERS, JSON.stringify(cleaned));
          }
        }
      } catch (e) {
        void e;
      }
    }
  } catch (e) {
    console.error('Error seeding localStorage database:', e);
  }
};

// Initialize seeding
seedDefaultData();

// Helper to delay response for realistic feeling
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const registerUser = async (formData) => {
  await delay(600);
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const exists = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());

  if (exists) {
    const err = new Error('Email address already registered');
    err.response = { data: { message: 'Email address already registered' } };
    throw err;
  }

  const newUser = {
    name: formData.name,
    email: formData.email.toLowerCase(),
    phone: formData.phone || '',
    address: formData.address || '',
    password: formData.password
  };

  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));

  // Non-blocking sync to Neon Database
  try {
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    }).catch(e => console.warn('Cloud user sync deferred:', e));
  } catch (e) {
    void e;
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('malenadu_user_registered'));
  }

  const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
  const userData = { ...newUser, token };
  delete userData.password; // Do not return password

  return { data: userData };
};



export const loginUser = async (formData) => {
  await delay(600);
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const user = users.find(
    u => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === formData.password
  );

  if (!user) {
    const err = new Error('Invalid email or password');
    err.response = { data: { message: 'Invalid email or password' } };
    throw err;
  }

  const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
  const userData = { ...user, token };
  if (userData.email.toLowerCase() === 'malenaduroast@gmail.com') {
    userData.role = 'admin';
  }
  delete userData.password;

  return { data: userData };
};

export const loginWithGoogle = async (googleProfile) => {
  await delay(350);
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const emailLower = (googleProfile.email || '').toLowerCase().trim();

  let user = users.find(u => u.email.toLowerCase() === emailLower);

  if (!user) {
    user = {
      name: googleProfile.name || emailLower.split('@')[0],
      email: emailLower,
      phone: googleProfile.phone || '',
      address: googleProfile.address || '',
      avatar: googleProfile.picture || googleProfile.avatar || '',
      provider: 'google',
      googleId: googleProfile.sub || 'google_' + Date.now()
    };
    users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));

    try {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      }).catch(e => console.warn('Cloud user sync deferred:', e));
    } catch (e) {
      void e;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('malenadu_user_registered'));
    }
  } else {
    if (googleProfile.picture) {
      user.avatar = googleProfile.picture;
    }
    if (googleProfile.name && !user.name) {
      user.name = googleProfile.name;
    }
    user.provider = 'google';
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  const token = 'google-jwt-token-' + Math.random().toString(36).substring(2);
  const userData = { ...user, token };
  delete userData.password;

  if (userData.email.toLowerCase() === 'malenaduroast@gmail.com') {
    userData.role = 'admin';
  }

  localStorage.setItem(KEYS.ACTIVE_USER, JSON.stringify(userData));
  localStorage.setItem(KEYS.TOKEN, token);
  return { data: userData };
};






export const getMyProfile = async () => {
  await delay(200);
  const activeUser = JSON.parse(localStorage.getItem(KEYS.ACTIVE_USER));
  if (!activeUser) {
    const err = new Error('Unauthorized');
    err.response = { data: { message: 'Unauthorized' } };
    throw err;
  }
  return { data: activeUser };
};

export const updateProfile = async (profileData) => {
  await delay(500);
  const activeUser = JSON.parse(localStorage.getItem(KEYS.ACTIVE_USER));
  if (!activeUser) {
    const err = new Error('Unauthorized');
    err.response = { data: { message: 'Unauthorized' } };
    throw err;
  }

  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const userIndex = users.findIndex(u => u.email.toLowerCase() === activeUser.email.toLowerCase());

  const updatedUser = {
    ...(userIndex !== -1 ? users[userIndex] : activeUser),
    name: profileData.name,
    phone: profileData.phone,
    address: profileData.address
  };

  if (profileData.password && profileData.password.trim()) {
    updatedUser.password = profileData.password.trim();
  }

  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  const token = localStorage.getItem(KEYS.TOKEN) || ('mock-jwt-token-' + Math.random().toString(36).substring(2));
  const userData = { ...updatedUser, token };
  delete userData.password;
  localStorage.setItem(KEYS.ACTIVE_USER, JSON.stringify(userData));

  return { data: userData };
};

export const cancelOrder = async (orderNumber) => {
  await delay(400);
  const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
  const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber || o._id === orderNumber);

  if (orderIndex === -1) {
    const err = new Error('Order not found');
    err.response = { data: { message: 'Order not found' } };
    throw err;
  }

  const order = orders[orderIndex];
  const orderTime = new Date(order.createdAt).getTime();
  const now = Date.now();
  const hoursPassed = (now - orderTime) / (1000 * 60 * 60);

  if (hoursPassed > 24) {
    const err = new Error('Order cannot be cancelled after 24 hours of roast scheduling');
    err.response = { data: { message: 'Order cannot be cancelled after 24 hours' } };
    throw err;
  }

  order.orderStatus = 'cancelled';
  order.status = 'cancelled';
  order.cancelledAt = new Date().toISOString();
  orders[orderIndex] = order;
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

  try {
    fetch(`/api/orders?orderNumber=${orderNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: 'cancelled', status: 'cancelled' })
    }).catch(() => { });
  } catch (e) {
    void e;
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('malenadu_orders_updated'));
  }

  return { data: order };
};



export const getMyOrders = async () => {
  const activeUser = JSON.parse(localStorage.getItem(KEYS.ACTIVE_USER));
  if (!activeUser || !activeUser.email) {
    return { data: [] };
  }

  const userEmail = activeUser.email.toLowerCase().trim();

  // 1. Fetch cloud orders from Postgres / Neon API
  let cloudOrders = [];
  try {
    const res = await fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.orders)) {
        cloudOrders = json.orders;
      }
    }
  } catch (err) {
    console.warn('Could not fetch cloud orders for user:', err);
  }

  // 2. Fetch local orders (filter out legacy demo orders)
  const allOrders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
  const userLocalOrders = allOrders.filter(
    o => o && o.shippingEmail && o.shippingEmail.toLowerCase().trim() === userEmail &&
         (o.orderNumber === 'MN-187976' || new Date(o.createdAt || 0) >= new Date('2026-11-25T00:00:00Z'))
  );

  // 3. Merge and deduplicate by orderNumber, prioritizing populated items
  const orderMap = new Map();
  cloudOrders.forEach(o => {
    if (o && o.orderNumber) {
      const isReal = o.orderNumber === 'MN-187976' || new Date(o.createdAt || 0) >= new Date('2026-11-25T00:00:00Z');
      if (isReal) {
        orderMap.set(o.orderNumber, o);
      }
    }
  });

  userLocalOrders.forEach(o => {
    if (o && o.orderNumber) {
      const existing = orderMap.get(o.orderNumber) || {};
      const mergedItems = (Array.isArray(o.items) && o.items.length > 0)
        ? o.items
        : (Array.isArray(existing.items) && existing.items.length > 0 ? existing.items : []);
      orderMap.set(o.orderNumber, {
        ...existing,
        ...o,
        items: mergedItems
      });
    }
  });

  const merged = Array.from(orderMap.values()).sort((a, b) => {
    const tA = new Date(a.createdAt || 0).getTime();
    const tB = new Date(b.createdAt || 0).getTime();
    return tB - tA;
  });

  return { data: merged };
};

export const createRazorpayOrder = async (amountInPaise, notes = {}) => {
  const defaultKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY_ID) || 'rzp_live_U3e3Jfoymk9Qsw';
  try {
    const res = await fetch('/api/razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountInPaise, currency: 'INR', notes })
    });
    const data = await res.json();
    if (data.success && data.orderId) {
      return {
        data: {
          id: data.orderId,
          amount: data.amount,
          currency: data.currency,
          keyId: data.keyId || defaultKey
        }
      };
    }
  } catch (err) {
    console.warn('Backend /api/razorpay unavailable, using test configuration:', err);
  }

  // Graceful fallback (null order ID so Razorpay Standard Checkout opens smoothly)
  return {
    data: {
      id: null,
      amount: amountInPaise,
      currency: 'INR',
      keyId: defaultKey
    }
  };
};

export const verifyPayment = async (data) => {
  try {
    const res = await fetch('/api/razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', ...data })
    });
    const result = await res.json();
    return { data: result };
  } catch (err) {
    return { data: { status: 'success' } };
  }
};

export const placeCODOrder = async (orderData) => {
  await delay(400);
  const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
  const orderNumber = orderData.orderNumber || ('MN-' + Math.floor(100000 + Math.random() * 900000));

  const newOrder = {
    _id: Math.random().toString(36).substring(2),
    ...orderData,
    orderNumber,
    shippingName: orderData.shippingName,
    shippingEmail: orderData.shippingEmail ? orderData.shippingEmail.toLowerCase() : '',
    shippingAddress: orderData.shippingAddress,
    shippingPhone: orderData.shippingPhone,
    pincode: orderData.pincode || null,
    b2bGstin: orderData.b2bGstin || null,
    b2bCompanyName: orderData.b2bCompanyName || null,
    subtotal: orderData.subtotal,
    gstAmount: orderData.gstAmount,
    shippingFee: orderData.shippingFee,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    status: 'placed',
    orderStatus: 'placed',
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

  // Non-blocking sync to Neon Database
  try {
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newOrder, orderStatus: 'placed', paymentStatus: 'pending' })
    }).catch(e => console.warn('Cloud order sync deferred:', e));
  } catch (e) {
    void e;
  }

  return { data: { orderNumber } };
};

export const simulatePayment = async (orderData) => {
  await delay(400);
  const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
  const orderNumber = orderData.orderNumber || ('MN-' + Math.floor(100000 + Math.random() * 900000));

  const newOrder = {
    _id: Math.random().toString(36).substring(2),
    ...orderData,
    orderNumber,
    shippingName: orderData.shippingName,
    shippingEmail: orderData.shippingEmail ? orderData.shippingEmail.toLowerCase() : '',
    shippingAddress: orderData.shippingAddress,
    shippingPhone: orderData.shippingPhone,
    pincode: orderData.pincode || null,
    b2bGstin: orderData.b2bGstin || null,
    b2bCompanyName: orderData.b2bCompanyName || null,
    subtotal: orderData.subtotal,
    gstAmount: orderData.gstAmount,
    shippingFee: orderData.shippingFee,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    status: 'placed',
    orderStatus: 'placed',
    paymentStatus: orderData.paymentStatus || 'paid',
    paymentMethod: orderData.paymentMethod || 'online',
    razorpayOrderId: orderData.razorpayOrderId || null,
    razorpayPaymentId: orderData.razorpayPaymentId || null,
    razorpaySignature: orderData.razorpaySignature || null,
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

  // Non-blocking sync to Neon Database
  try {
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newOrder,
        orderStatus: 'placed',
        paymentStatus: newOrder.paymentStatus,
        paymentMethod: newOrder.paymentMethod,
        razorpayOrderId: newOrder.razorpayOrderId,
        razorpayPaymentId: newOrder.razorpayPaymentId
      })
    }).catch(e => console.warn('Cloud order sync deferred:', e));
  } catch (e) {
    void e;
  }

  return { data: { orderNumber } };
};

// Shiprocket Automated Logistics Integration
export const shipOrderWithShiprocket = async (order) => {
  try {
    const res = await fetch('/api/shiprocket?action=ship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Shiprocket shipment dispatch failed:', err);
    return { success: false, error: err.message };
  }
};

export const trackShiprocketShipment = async (awbCode) => {
  try {
    const res = await fetch(`/api/shiprocket?action=track&awb=${encodeURIComponent(awbCode)}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Shiprocket tracking failed:', err);
    return { success: false, error: err.message };
  }
};

export const checkPincodeServiceability = async (pincode, weight = 0.5) => {
  try {
    const res = await fetch('/api/shiprocket?action=serviceability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_postcode: pincode, weight })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Shiprocket serviceability check failed:', err);
    return { success: false, error: err.message };
  }
};

export const getAllUsers = async () => {
  try {
    let cloudUsers = [];
    try {
      const res = await fetch('/api/users');
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const json = await res.json();
        if (json.success && Array.isArray(json.users)) {
          cloudUsers = json.users;
        }
      }
    } catch (err) {
      console.warn('Cloud users fallback to local storage:', err);
    }

    const localUsers = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const userMap = new Map();
    cloudUsers.forEach(u => {
      if (u.email) userMap.set(u.email.toLowerCase(), u);
    });
    localUsers.forEach(u => {
      if (u.email) {
        const existing = userMap.get(u.email.toLowerCase());
        userMap.set(u.email.toLowerCase(), { ...existing, ...u });
      }
    });

    return Array.from(userMap.values());
  } catch (err) {
    console.error('Error fetching users:', err);
    return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  }
};

const api = {
  registerUser,
  loginUser,
  loginWithGoogle,
  getMyProfile,
  updateProfile,
  getMyOrders,
  cancelOrder,
  getAllUsers,
  createRazorpayOrder,
  verifyPayment,
  placeCODOrder,
  simulatePayment,
  shipOrderWithShiprocket,
  trackShiprocketShipment,
  checkPincodeServiceability
};

export default api;
