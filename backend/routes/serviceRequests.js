const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');

const requestSchema = Joi.object({
  user_id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  is_paid: Joi.boolean().required(),
  budget: Joi.number().when('is_paid', {
    is: true,
    then: Joi.number().positive().required(),
    otherwise: Joi.optional().allow(null)
  })
});

router.post('/', validate(requestSchema), (req, res) => {
  const request = {
    ...req.body,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  res.json({ request });
});

router.get('/', (_req, res) => {
  res.json({ requests: [] });
});

module.exports = router;
