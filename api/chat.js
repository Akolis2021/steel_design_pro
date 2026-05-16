// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY; // Safely pulled from Vercel!

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set in Vercel.' });
  }

  // ✅ FIXED: Correct model name (gemini-2.5-flash-preview-09-2025 does not exist)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward the Google API error so you can diagnose it in the chat window
      return res.status(response.status).json({ error: data?.error?.message || 'Google API error', details: data });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}