const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const { OpenAI } = require('openai');
const Joi = require('joi');
const validate = require('../middleware/validate');

// Simple in-memory cache with TTL to avoid repeated OpenAI calls
const summaryCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

const profileSchema = Joi.object({
  id: Joi.any(),
  name: Joi.string().required(),
  title: Joi.string().required(),
  bio: Joi.string().allow(''),
  skills: Joi.array().items(Joi.string()).default([]),
  years_experience: Joi.number().default(0)
}).unknown(true);

const trimSummary = (text, maxWords) =>
  text
    .split(/\s+/)
    .slice(0, maxWords)
    .join(' ');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', validate(profileSchema), async (req, res, next) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const profile = req.body;
    const cacheKey = profile.id || JSON.stringify(profile);
    const cached = summaryCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ summary: cached.summary });
    }

    const prompt = `Create a short professional summary (max 40 words) for the following freelancer.\nName: ${profile.name}\nTitle: ${profile.title}\nBio: ${profile.bio}\nSkills: ${(profile.skills || []).join(', ')}\nExperience: ${profile.years_experience} years.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 60,
    });

    let summary = sanitizeHtml(
      completion.choices?.[0]?.message?.content?.trim() || ''
    );
    summary = trimSummary(summary, 40);

    summaryCache.set(cacheKey, { summary, timestamp: now });

    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
