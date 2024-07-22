const axios = require('axios');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await axios.post('https://api.anthropic.com/v1/messages', req.body, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}