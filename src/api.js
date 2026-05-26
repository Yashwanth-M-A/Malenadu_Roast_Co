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
    if (!localStorage.getItem(KEYS.USERS)) {
      const defaultUsers = [
        {
          name: 'Demo Customer',
          email: 'demo@malenadu.com',
          phone: '9876543210',
          address: '123, Coffee Street, Chikkamagaluru, Karnataka - 577101',
          password: 'password123'
        }
      ];
      localStorage.setItem(KEYS.USERS, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
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
  delete userData.password;
  
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
  
  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }
  
  const token = localStorage.getItem(KEYS.TOKEN) || ('mock-jwt-token-' + Math.random().toString(36).substring(2));
  const userData = { ...updatedUser, token };
  delete userData.password;
  
  return { data: userData };
};

export const getMyOrders = async () => {
  await delay(400);
  const activeUser = JSON.parse(localStorage.getItem(KEYS.ACTIVE_USER));
  if (!activeUser) {
    return { data: [] };
  }
  
  const allOrders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
  const userOrders = allOrders.filter(
    o => o.shippingEmail.toLowerCase() === activeUser.email.toLowerCase()
  );
  
  return { data: userOrders.reverse() }; // Newest orders first
};

export const createRazorpayOrder = async (amountInPaise) => {
  await delay(300);
  return {
    data: {
      id: 'rzp_mock_' + Math.random().toString(36).substring(2),
      amount: amountInPaise,
      currency: 'INR'
    }
  };
};

export const verifyPayment = async (data) => {
  await delay(300);
  return { data: { status: 'success' } };
};

export const placeCODOrder = async (orderData) => {
  await delay(600);
  const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
  const orderNumber = 'MN-' + Math.floor(100000 + Math.random() * 900000);
  
  const newOrder = {
    _id: Math.random().toString(36).substring(2),
    orderNumber,
    shippingName: orderData.shippingName,
    shippingEmail: orderData.shippingEmail.toLowerCase(),
    shippingAddress: orderData.shippingAddress,
    shippingPhone: orderData.shippingPhone,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    status: 'placed',
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  
  return { data: { orderNumber } };
};

export const simulatePayment = async (orderData) => {
  await delay(800);
  const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
  const orderNumber = 'MN-' + Math.floor(100000 + Math.random() * 900000);
  
  const newOrder = {
    _id: Math.random().toString(36).substring(2),
    orderNumber,
    shippingName: orderData.shippingName,
    shippingEmail: orderData.shippingEmail.toLowerCase(),
    shippingAddress: orderData.shippingAddress,
    shippingPhone: orderData.shippingPhone,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    status: 'placed',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  
  return { data: { orderNumber } };
};

const api = {
  registerUser,
  loginUser,
  getMyProfile,
  updateProfile,
  getMyOrders,
  createRazorpayOrder,
  verifyPayment,
  placeCODOrder,
  simulatePayment
};

export default api;
