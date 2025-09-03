const express = require('express');
const Joi = require('joi');
const router = express.Router();
const validate = require('../middleware/validate');

// In-memory payments table
const payments = [];

const checkoutSchema = Joi.object({
  client_id: Joi.number().integer().required(),
  freelancer_id: Joi.number().integer().required(),
  amount: Joi.number().positive().required()
});

router.post('/checkout', validate(checkoutSchema), (req, res) => {
  const { client_id, freelancer_id, amount } = req.body; // sanitized
  res.json({ message: 'Checkout initiated', client_id, freelancer_id, amount });
});

const payoutSchema = Joi.object({
  client_id: Joi.number().integer().required(),
  freelancer_id: Joi.number().integer().required(),
  amount: Joi.number().positive().required()
});

router.post('/payout', validate(payoutSchema), (req, res) => {
  const { client_id, freelancer_id, amount } = req.body; // sanitized
  const fee = amount * 0.05;
  const payout = amount - fee;
  payments.push({ client_id, freelancer_id, amount, fee });
  res.json({ client_id, freelancer_id, amount, fee, payout });
});

router.get('/invoice/:clientId', (req, res) => {
  const clientId = parseInt(req.params.clientId, 10);
  const invoice = payments
    .filter(p => p.client_id === clientId)
    .map(p => ({ freelancer_id: p.freelancer_id, amount: p.amount, fee: p.fee }));
  res.json({ client_id: clientId, invoice });
});

router.get('/earnings/:freelancerId', (req, res) => {
  const freelancerId = parseInt(req.params.freelancerId, 10);
  const freelancerPayments = payments.filter(p => p.freelancer_id === freelancerId);
  const total = freelancerPayments.reduce((sum, p) => sum + p.amount - p.fee, 0);
  res.json({ freelancer_id: freelancerId, total, payments: freelancerPayments });
});

module.exports = router;
