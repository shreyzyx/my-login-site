export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://hellohr.in');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, otp } = req.body;

  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

  try {
    const response = await fetch('https://api.sms-gate.app/mobile/v1/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from('Y5WFSK:kj0eeduqli9qau').toString('base64')
      },
      body: JSON.stringify({
        message: `Your hellohr.in OTP is: ${otp}. Valid for 10 minutes.`,
        phoneNumbers: [phone]
      })
    });

    const responseText = await response.text();

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: responseText });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
