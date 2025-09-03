const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const { OpenAI } = require('openai');

// Simple in-memory cache to avoid repeated OpenAI calls
const summaryCache = new Map();

router.post('/', async (req, res, next) => {
  try {
    const profile = req.body;
    const cacheKey = profile.id || JSON.stringify(profile);

    if (summaryCache.has(cacheKey)) {
      return res.json({ summary: summaryCache.get(cacheKey) });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Create a short professional summary (max 40 words) for the following freelancer.\nName: ${profile.name}\nTitle: ${profile.title}\nBio: ${profile.bio}\nSkills: ${(profile.skills || []).join(', ')}\nExperience: ${profile.years_experience} years.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 60,
    });

    const summary = sanitizeHtml(
      completion.choices?.[0]?.message?.content?.trim() || ''
    );

    summaryCache.set(cacheKey, summary);

    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
