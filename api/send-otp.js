export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://hellohr.in');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

  const GATEWAY_USER = 'Y5WFSK';
  const GATEWAY_PASS = 'kj0eeduqli9qau';

  try {
    // Step 1: Get a token
    const tokenRes = await fetch('https://api.sms-gate.app/3rdparty/v1/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${GATEWAY_USER}:${GATEWAY_PASS}`).toString('base64')
      },
      body: JSON.stringify({ scopes: ['messages:send'] })
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return res.status(401).json({ error: 'Auth failed: ' + err });
    }

    const tokenData = await tokenRes.json();
    const token = tokenData.token || tokenData.accessToken || tokenData.access_token;

    // Step 2: Send SMS using the token
    const smsRes = await fetch('https://api.sms-gate.app/3rdparty/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        textMessage: { text: `Your hellohr.in OTP is: ${otp}. Valid for 10 minutes.` },
        phoneNumbers: [phone]
      })
    });

    const smsText = await smsRes.text();

    if (smsRes.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: smsText });
    }

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
