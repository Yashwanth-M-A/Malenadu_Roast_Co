import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Local development middleware for /api endpoints so Razorpay and Neon run on localhost
function apiDevMiddleware() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/razorpay' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_Tw0KRmrKExKcKR';
              const keySecret = process.env.RAZORPAY_KEY_SECRET || 'WcsJ5FhIZfsEJ2ZssIlskD5a';
              const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

              const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
                method: 'POST',
                headers: {
                  'Authorization': authHeader,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  amount: Math.round(Number(parsed.amount || 100)),
                  currency: 'INR',
                  receipt: 'rcpt_' + Date.now(),
                  notes: parsed.notes || { brand: 'Malenadu Roast Co.' }
                })
              });

              const data = await rzpRes.json();
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = rzpRes.status;
              res.end(JSON.stringify({
                success: rzpRes.ok,
                orderId: data.id,
                amount: data.amount,
                currency: data.currency,
                keyId: keyId
              }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url.startsWith('/api/invoice')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            req.query = Object.fromEntries(urlObj.searchParams);
            const { default: handler } = await import('./api/invoice.js');
            const vercelRes = {
              statusCode: 200,
              setHeader(name, val) { res.setHeader(name, val); return this; },
              status(code) { res.statusCode = code; return this; },
              send(data) { res.end(data); return this; },
              end(data) { res.end(data); return this; }
            };
            await handler(req, vercelRes);
          } catch (err) {
            res.statusCode = 500;
            res.end('Invoice error: ' + err.message);
          }
          return;
        }

        if (req.url.startsWith('/api/whatsapp')) {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const urlObj = new URL(req.url, 'http://localhost');
              req.query = Object.fromEntries(urlObj.searchParams);
              req.body = body ? JSON.parse(body) : {};

              const { default: handler } = await import('./api/whatsapp.js');
              const vercelRes = {
                statusCode: 200,
                setHeader(name, val) { res.setHeader(name, val); return this; },
                status(code) { res.statusCode = code; return this; },
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return this;
                },
                end(data) { res.end(data); return this; }
              };
              await handler(req, vercelRes);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.url.startsWith('/api/orders')) {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const urlObj = new URL(req.url, 'http://localhost');
              req.query = Object.fromEntries(urlObj.searchParams);
              req.body = body ? JSON.parse(body) : {};

              const { default: handler } = await import('./api/orders.js');
              const vercelRes = {
                statusCode: 200,
                setHeader(name, val) { res.setHeader(name, val); return this; },
                status(code) { res.statusCode = code; return this; },
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return this;
                },
                end(data) { res.end(data); return this; }
              };
              await handler(req, vercelRes);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.url.startsWith('/api/users')) {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const urlObj = new URL(req.url, 'http://localhost');
              req.query = Object.fromEntries(urlObj.searchParams);
              req.body = body ? JSON.parse(body) : {};

              const { default: handler } = await import('./api/users.js');
              const vercelRes = {
                statusCode: 200,
                setHeader(name, val) { res.setHeader(name, val); return this; },
                status(code) { res.statusCode = code; return this; },
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return this;
                },
                end(data) { res.end(data); return this; }
              };
              await handler(req, vercelRes);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.url.startsWith('/api/shiprocket')) {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const urlObj = new URL(req.url, 'http://localhost');
              req.query = Object.fromEntries(urlObj.searchParams);
              req.body = body ? JSON.parse(body) : {};

              const { default: handler } = await import('./api/shiprocket.js');
              const vercelRes = {
                statusCode: 200,
                setHeader(name, val) { res.setHeader(name, val); return this; },
                status(code) { res.statusCode = code; return this; },
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return this;
                },
                end(data) { res.end(data); return this; }
              };
              await handler(req, vercelRes);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
  server: {
    host: true,
  },
});
