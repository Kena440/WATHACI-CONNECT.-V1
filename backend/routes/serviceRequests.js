const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');

const serviceRequestSchema = Joi.object({
  description: Joi.string().required().min(10).max(1000),
  skills: Joi.array().items(Joi.string()).required(),
  location: Joi.string().optional().allow(''),
});

// Create a new service request
router.post('/', validate(serviceRequestSchema), (req, res) => {
  const serviceRequest = req.body; // already sanitized in middleware
  
  // Add timestamp and generate ID
  const newRequest = {
    id: Date.now().toString(),
    ...serviceRequest,
    created_at: new Date().toISOString(),
    status: 'active'
  };
  
  res.status(201).json({ 
    success: true, 
    data: newRequest,
    message: 'Service request created successfully' 
  });
});

// Get service requests with optional filtering
router.get('/', (req, res) => {
  const { status, location, skills } = req.query;
  
  // In a real app, this would query a database
  // For now, return a mock response
  const mockRequests = [
    {
      id: '1',
      description: 'Need a web developer for e-commerce site',
      skills: ['JavaScript', 'React', 'Node.js'],
      location: 'Lagos, Nigeria',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: mockRequests,
    pagination: {
      page: 1,
      limit: 10,
      total: 1
    }
  });
});

// Get a specific service request by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // Mock response for specific request
  const mockRequest = {
    id,
    description: 'Need a web developer for e-commerce site',
    skills: ['JavaScript', 'React', 'Node.js'],
    location: 'Lagos, Nigeria',
    status: 'active',
    created_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: mockRequest
  });
});

// Update a service request
router.put('/:id', validate(serviceRequestSchema), (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const updatedRequest = {
    id,
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: updatedRequest,
    message: 'Service request updated successfully'
  });
});

// Delete a service request
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: 'Service request deleted successfully'
  });
});

module.exports = router;