// api/delhivery.js
import https from 'https';

let cachedToken = null;
let tokenExpiresAt = 0;

function httpRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

export async function getDelhiveryToken() {
  const username = process.env.DELHIVERY_USERNAME || 'MALENADUROASTCOB2B';
  const password = process.env.DELHIVERY_PASSWORD || 'Malenaduroast@123';

  // Cache token for 23 hours
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const res = await httpRequest('https://ltl-clients-api.delhivery.com/ums/login', 'POST', {
    'Content-Type': 'application/json'
  }, { username, password });

  if (res.data && res.data.success && res.data.data && res.data.data.jwt) {
    cachedToken = res.data.data.jwt;
    tokenExpiresAt = Date.now() + 23 * 60 * 60 * 1000;
    return cachedToken;
  }

  throw new Error(res.data?.error?.message || 'Failed to authenticate with Delhivery');
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    const token = await getDelhiveryToken();

    // 1. Get Live Token Status
    if (action === 'auth_status') {
      return res.status(200).json({
        success: true,
        authenticated: true,
        username: process.env.DELHIVERY_USERNAME || 'MALENADUROASTCOB2B',
        clientName: 'MALENADU ROAST CO B2B',
        tokenPreview: token.substring(0, 20) + '...'
      });
    }

    // Default response
    return res.status(200).json({
      success: true,
      message: 'Delhivery Gateway active',
      tokenPreview: token.substring(0, 20) + '...'
    });
  } catch (error) {
    console.error('Delhivery Gateway Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Delhivery Gateway Error'
    });
  }
}
