const express = require('express');
const router = express.Router();

router.post('/generate', async (req, res) => {
  const { projectInfo } = req.body;
  if (!projectInfo) {
    return res.status(400).json({ error: 'projectInfo is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that drafts project proposals for freelancers.' },
          { role: 'user', content: `Draft a professional proposal for the following project details: ${projectInfo}` }
        ]
      })
    });

    const data = await response.json();
    const draft = data?.choices?.[0]?.message?.content?.trim() || '';
    res.json({ draft });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate proposal' });
  }
});

module.exports = router;
