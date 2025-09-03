import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Authentication routes that complement Supabase auth
router.post('/verify-session', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(access_token);
    
    if (error) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Session verification failed' });
  }
});

// Get user session info
router.get('/session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization header' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session info' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const { data, error } = await supabase.auth.refreshSession({ 
      refresh_token 
    });
    
    if (error) {
      return res.status(401).json({ error: 'Token refresh failed' });
    }

    res.json({ 
      success: true,
      session: data.session
    });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

export default router;