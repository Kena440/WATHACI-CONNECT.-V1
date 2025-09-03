const express = require('express');
const Service = require('../models/Service');

const router = express.Router();

// GET /api/services - list all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().populate('provider');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// POST /api/services - create a new service
router.post('/', async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create service' });
  }
});

module.exports = router;
