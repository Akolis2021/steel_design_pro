// api/chat.js
export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY; // Safely pulled from Vercel!
  const url = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=\${apiKey}\`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });

  const data = await response.json();
  res.status(200).json(data);
}