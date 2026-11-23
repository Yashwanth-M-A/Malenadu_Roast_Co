import crypto from 'crypto';

export default async function handler(req, res) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, amount, currency, receipt, notes, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // 1. VERIFY PAYMENT SIGNATURE
  if (action === 'verify') {
    try {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Missing signature verification parameters' });
      }

      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const isAuthentic = generatedSignature === razorpay_signature;

      if (isAuthentic) {
        return res.status(200).json({ success: true, message: 'Payment verified successfully' });
      } else {
        return res.status(400).json({ success: false, error: 'Invalid payment signature' });
      }
    } catch (err) {
      console.error('Signature verification error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. CREATE RAZORPAY ORDER
  try {
    const amountInPaise = Math.round(Number(amount));
    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount in paise is required.' });
    }

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency || 'INR',
        receipt: receipt || 'rcpt_' + Date.now(),
        notes: notes || {
          brand: 'Malenadu Roast Co.',
          estate: 'Chikkamagaluru'
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Razorpay API error:', data);
      return res.status(response.status).json({ success: false, error: data.error?.description || 'Razorpay order creation failed' });
    }

    return res.status(200).json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: keyId
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

