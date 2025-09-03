import express from 'express';

const router = express.Router();

// Import route modules
import authRoutes from './auth.js';
import userRoutes from './users.js';
import profileRoutes from './profiles.js';
import marketplaceRoutes from './marketplace.js';

// API information endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'WATHACI CONNECT API',
    version: '1.0.0',
    description: 'Backend API server for WATHACI CONNECT V1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      profiles: '/api/v1/profiles',
      marketplace: '/api/v1/marketplace'
    },
    timestamp: new Date().toISOString()
  });
});

// Route handlers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/marketplace', marketplaceRoutes);

export default router;