import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get user profile information
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ 
      success: true, 
      profile 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Remove id from update data if present
    delete updateData.id;
    delete updateData.created_at;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to update profile' });
    }

    res.json({ 
      success: true, 
      profile 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Create or update profile completion status
router.post('/:userId/complete', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ profile_completed: true, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to mark profile as complete' });
    }

    res.json({ 
      success: true, 
      message: 'Profile marked as complete',
      profile 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete profile' });
  }
});

// Get profile completion status
router.get('/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('profile_completed, account_type')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ 
      success: true, 
      profile_completed: profile.profile_completed || false,
      account_type: profile.account_type 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile status' });
  }
});

export default router;