const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { randomBytes, scrypt } = require('crypto');
const { promisify } = require('util');
const validate = require('../middleware/validate');

const passwordSchema = Joi.object({
  password: Joi.string().min(8).required()
});

const scryptAsync = promisify(scrypt);

router.post('/hash', validate(passwordSchema), async (req, res) => {
  try {
    const { password } = req.body; // already sanitized in middleware
    const salt = randomBytes(16).toString('hex');
    const hash = await scryptAsync(password, salt, 64);
    res.json({ hash: `${salt}:${hash.toString('hex')}` });
  } catch (err) {
    res.status(500).json({ error: `Error hashing password: ${err.message}` });
  }
});

module.exports = router;
