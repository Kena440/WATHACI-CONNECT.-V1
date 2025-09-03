import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get marketplace listings
router.get('/listings', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      limit = 20, 
      offset = 0,
      sort_by = 'created_at',
      order = 'desc'
    } = req.query;
    
    // For now, return mock data since we don't have a listings table
    // This would be replaced with actual Supabase queries when the schema is ready
    const mockListings = [
      {
        id: '1',
        title: 'Web Development Services',
        description: 'Full-stack web development with React and Node.js',
        category: 'development',
        price: 500,
        currency: 'USD',
        user_id: 'mock-user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Graphic Design Portfolio',
        description: 'Professional logo and brand design services',
        category: 'design',
        price: 250,
        currency: 'USD',
        user_id: 'mock-user-2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    let filteredListings = mockListings;

    if (category) {
      filteredListings = filteredListings.filter(listing => 
        listing.category === category
      );
    }

    if (search) {
      filteredListings = filteredListings.filter(listing => 
        listing.title.toLowerCase().includes(search.toLowerCase()) ||
        listing.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ 
      success: true, 
      listings: filteredListings,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: filteredListings.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch marketplace listings' });
  }
});

// Get listing by ID
router.get('/listings/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    
    // Mock response - would be replaced with actual database query
    const mockListing = {
      id: listingId,
      title: 'Sample Listing',
      description: 'This is a sample marketplace listing',
      category: 'services',
      price: 100,
      currency: 'USD',
      user_id: 'mock-user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      listing: mockListing 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Create new marketplace listing
router.post('/listings', async (req, res) => {
  try {
    const { title, description, category, price, currency = 'USD' } = req.body;
    
    if (!title || !description || !category || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, category, price' 
      });
    }

    // Mock response - would be replaced with actual database insert
    const newListing = {
      id: `listing-${Date.now()}`,
      title,
      description,
      category,
      price: parseFloat(price),
      currency,
      user_id: 'current-user-id', // Would come from auth middleware
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.status(201).json({ 
      success: true, 
      listing: newListing,
      message: 'Listing created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Get marketplace categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'development', name: 'Web Development', count: 45 },
      { id: 'design', name: 'Graphic Design', count: 32 },
      { id: 'writing', name: 'Content Writing', count: 28 },
      { id: 'marketing', name: 'Digital Marketing', count: 22 },
      { id: 'consulting', name: 'Business Consulting', count: 18 },
      { id: 'translation', name: 'Translation Services', count: 15 }
    ];

    res.json({ 
      success: true, 
      categories 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get marketplace statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      total_listings: 160,
      active_users: 85,
      total_transactions: 340,
      average_rating: 4.7,
      categories_count: 6
    };

    res.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch marketplace stats' });
  }
});

export default router;