const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');

const messageSchema = Joi.object({
  message: Joi.string().required()
});

router.post('/', validate(messageSchema), async (req, res, next) => {
  try {
    const { message } = req.body;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }]
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
