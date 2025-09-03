const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { randomBytes, scryptSync } = require('crypto');
const validate = require('../middleware/validate');

const passwordSchema = Joi.object({
  password: Joi.string().min(8).required()
});

router.post('/hash', validate(passwordSchema), (req, res, next) => {
  try {
    const { password } = req.body; // already sanitized in middleware
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    res.json({ hash: `${salt}:${hash}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
