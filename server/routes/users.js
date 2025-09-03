import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get user information (public data)
router.get('/:userId/public', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, account_type, profile_completed, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      user: profile 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Get user dashboard stats
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // This would be expanded based on actual database schema
    const stats = {
      profile_views: 0,
      projects_completed: 0,
      reviews_count: 0,
      average_rating: 0,
      total_earnings: 0
    };

    res.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Search users (for directory/marketplace)
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      account_type, 
      limit = 20, 
      offset = 0 
    } = req.query;
    
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    let query = supabase
      .from('profiles')
      .select('id, email, account_type, profile_completed, created_at')
      .eq('profile_completed', true);

    if (account_type) {
      query = query.eq('account_type', account_type);
    }

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    query = query
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    const { data: users, error } = await query;

    if (error) {
      return res.status(400).json({ error: 'Failed to search users' });
    }

    res.json({ 
      success: true, 
      users,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: users.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;