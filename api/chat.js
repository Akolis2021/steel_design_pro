// api/chat.js
// ✅ CommonJS format — required for Vercel serverless API routes by default.
//    (export default / ESM only works if you have "type":"module" in package.json)

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Catch missing env var immediately — gives a clear error in the chat window
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set. Go to Vercel → Settings → Environment Variables, add it, then Redeploy.'
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward the real Google API error message to the frontend
      const msg = data?.error?.message || JSON.stringify(data);
      return res.status(response.status).json({ error: `Google API error: ${msg}` });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
};