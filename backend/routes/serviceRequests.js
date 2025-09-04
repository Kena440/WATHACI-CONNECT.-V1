const express = require('express');
const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const serviceRequestSchema = Joi.object({
  user_id: Joi.string().required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  skills: Joi.array().items(Joi.string().min(1)).min(1).required(),
  willing_to_pay: Joi.boolean().required(),
  budget: Joi.when('willing_to_pay', {
    is: true,
    then: Joi.number().positive().optional(),
    otherwise: Joi.forbidden()
  }),
  location: Joi.string().max(100).optional().allow('')
});

const serviceRequestUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  skills: Joi.array().items(Joi.string().min(1)).min(1).optional(),
  willing_to_pay: Joi.boolean().optional(),
  budget: Joi.number().positive().optional(),
  location: Joi.string().max(100).optional().allow(''),
  status: Joi.string().valid('open', 'in_progress', 'completed', 'cancelled').optional()
});

// Middleware to validate and sanitize input
const validateAndSanitize = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      logger.warn('Validation error', error.details, 'ServiceRequestRoutes');
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    // Sanitize string fields
    if (value.title) value.title = sanitizeHtml(value.title, { allowedTags: [] });
    if (value.description) value.description = sanitizeHtml(value.description, { allowedTags: [] });
    if (value.location) value.location = sanitizeHtml(value.location, { allowedTags: [] });
    if (value.skills) {
      value.skills = value.skills.map(skill => sanitizeHtml(skill, { allowedTags: [] }));
    }

    req.validatedBody = value;
    next();
  };
};

// Create a new service request
router.post('/', validateAndSanitize(serviceRequestSchema), async (req, res) => {
  try {
    const { title, description, skills, willing_to_pay, budget, location, user_id } = req.validatedBody;

    // Here you would typically integrate with your database
    // For now, we'll return a mock response
    const serviceRequest = {
      id: `sr_${Date.now()}`,
      user_id,
      title,
      description,
      skills,
      willing_to_pay,
      budget: willing_to_pay ? budget : null,
      location: location || null,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    logger.info('Service request created', { id: serviceRequest.id, title }, 'ServiceRequestRoutes');
    res.status(201).json({ data: serviceRequest });

  } catch (error) {
    logger.error('Error creating service request', error, 'ServiceRequestRoutes');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all service requests for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Here you would typically query your database
    // For now, we'll return a mock response
    const serviceRequests = [
      {
        id: `sr_${Date.now()}`,
        user_id: userId,
        title: 'Sample Service Request',
        description: 'This is a sample service request for demonstration',
        skills: ['React', 'TypeScript'],
        willing_to_pay: true,
        budget: 500,
        location: 'Remote',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    logger.info('Service requests retrieved', { userId, count: serviceRequests.length }, 'ServiceRequestRoutes');
    res.json({ 
      data: serviceRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: serviceRequests.length
      }
    });

  } catch (error) {
    logger.error('Error fetching service requests', error, 'ServiceRequestRoutes');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific service request
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Here you would typically query your database
    // For now, we'll return a mock response
    const serviceRequest = {
      id,
      user_id: 'user_123',
      title: 'Sample Service Request',
      description: 'This is a sample service request for demonstration',
      skills: ['React', 'TypeScript'],
      willing_to_pay: true,
      budget: 500,
      location: 'Remote',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    logger.info('Service request retrieved', { id }, 'ServiceRequestRoutes');
    res.json({ data: serviceRequest });

  } catch (error) {
    logger.error('Error fetching service request', error, 'ServiceRequestRoutes');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a service request
router.put('/:id', validateAndSanitize(serviceRequestUpdateSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedBody;

    // Here you would typically update in your database
    // For now, we'll return a mock response
    const updatedServiceRequest = {
      id,
      ...updateData,
      updated_at: new Date().toISOString()
    };

    logger.info('Service request updated', { id, fields: Object.keys(updateData) }, 'ServiceRequestRoutes');
    res.json({ data: updatedServiceRequest });

  } catch (error) {
    logger.error('Error updating service request', error, 'ServiceRequestRoutes');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a service request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Here you would typically delete from your database
    // For now, we'll just log and return success
    
    logger.info('Service request deleted', { id }, 'ServiceRequestRoutes');
    res.status(204).send();

  } catch (error) {
    logger.error('Error deleting service request', error, 'ServiceRequestRoutes');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search service requests
router.get('/', async (req, res) => {
  try {
    const { 
      skills, 
      location, 
      budget_min, 
      budget_max, 
      status = 'open',
      page = 1, 
      limit = 10 
    } = req.query;

    // Here you would typically search your database
    // For now, we'll return a mock response
    const serviceRequests = [
      {
        id: `sr_${Date.now()}`,
        user_id: 'user_123',
        title: 'Sample Service Request',
        description: 'This is a sample service request for demonstration',
        skills: ['React', 'TypeScript'],
        willing_to_pay: true,
        budget: 500,
        location: 'Remote',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    logger.info('Service requests searched', { 
      filters: { skills, location, budget_min, budget_max, status },
      results: serviceRequests.length 
    }, 'ServiceRequestRoutes');
    
    res.json({ 
      data: serviceRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: serviceRequests.length
      }
    });

  } catch (error) {
    logger.error('Error searching service requests', error, 'ServiceRequestRoutes');
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;