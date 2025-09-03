const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required()
});

router.post('/', validate(userSchema), (req, res) => {
  const user = req.body; // already sanitized in middleware
  res.json({ user });
});

module.exports = router;
