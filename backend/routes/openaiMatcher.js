const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const logger = require('../utils/logger');

// Initialize OpenAI client using API key from environment variables
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Example in-memory freelancer list. In a real app this would come from a database.
const freelancers = [
  {
    name: 'Alice',
    title: 'Full-Stack Developer',
    bio: 'Experienced in React and Node.js with a focus on scalable web apps.',
    skills: ['React', 'Node.js', 'PostgreSQL']
  },
  {
    name: 'Bob',
    title: 'UI/UX Designer',
    bio: 'Designs intuitive interfaces using Figma and Tailwind CSS.',
    skills: ['Design', 'Figma', 'Tailwind']
  },
  {
    name: 'Charlie',
    title: 'Backend Engineer',
    bio: 'Builds robust APIs with Python and Django.',
    skills: ['Python', 'Django', 'REST']
  }
];

// POST /openai-matcher
// Expects { projectDescription: string, skills?: string[], budget?: number, location?: string }
router.post('/', async (req, res) => {
  const { projectDescription, skills = [], budget, location } = req.body;

  if (!projectDescription) {
    return res.status(400).json({ error: 'Project description is required' });
  }

  try {
    // Construct a prompt for ranking freelancers
    const prompt = `You are a helpful assistant that ranks freelancers based on a client's project.\n\nProject description: ${projectDescription}\nRequired skills: ${skills.join(', ') || 'None provided'}\nBudget: ${budget ? budget + ' ZMW/hour' : 'Not specified'}\nLocation: ${location || 'Not specified'}\n\nFreelancers:\n${freelancers
      .map((f, i) => `${i + 1}. Name: ${f.name}\n   Title: ${f.title}\n   Bio: ${f.bio}\n   Skills: ${f.skills.join(', ')}`)
      .join('\n')}\n\nReturn a JSON array of freelancer names ordered from best to worst fit.`;

    const completion = await client.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      response_format: { type: 'json_object' }
    });

    let names = [];
    try {
      const parsed = JSON.parse(completion.output_text);
      names = Array.isArray(parsed) ? parsed : parsed.names || [];
    } catch (err) {
      names = completion.output_text
        .split(/\n|,/) // fallback parsing
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const orderedFreelancers = names
      .map((name) => freelancers.find((f) => f.name === name))
      .filter(Boolean);

    res.json({ matches: orderedFreelancers });
  } catch (error) {
    logger.error('Error ranking freelancers with OpenAI', error, 'openaiMatcher');
    res.status(500).json({ error: 'Failed to rank freelancers' });
  }
});

module.exports = router;
