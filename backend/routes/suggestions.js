const express = require('express');
const validate = require('../middleware/validate');
const backendDataSource = require('../services/suggestionsDataSource');

const router = express.Router();

// Mock database for suggestions
const suggestionDatabase = [
  {
    id: 'api_001',
    type: 'partnership',
    title: 'Cross-Industry Collaboration',
    description: 'Partner with businesses in complementary industries to create innovative solutions.',
    matchScore: 92,
    participants: ['Tech Innovators Hub', 'Manufacturing Alliance'],
    tags: ['innovation', 'cross-industry', 'collaboration'],
    potentialValue: 'K50,000 new revenue streams',
    dataSource: 'database',
    sourceId: 'backend_api'
  },
  {
    id: 'api_002',
    type: 'skill_exchange',
    title: 'Professional Development Exchange',
    description: 'Exchange professional skills with other business owners to reduce training costs.',
    matchScore: 86,
    participants: ['Business Skills Network'],
    tags: ['professional-development', 'skills', 'training'],
    potentialValue: 'K20,000 training cost savings',
    dataSource: 'database',
    sourceId: 'backend_api'
  },
  {
    id: 'api_003',
    type: 'project',
    title: 'Sustainable Business Initiative',
    description: 'Join collaborative projects focused on sustainable business practices and environmental impact.',
    matchScore: 79,
    participants: ['Green Business Network', 'Sustainability Partners'],
    tags: ['sustainability', 'environment', 'green-business'],
    potentialValue: 'Enhanced brand reputation and cost savings',
    dataSource: 'database',
    sourceId: 'backend_api'
  },
  {
    id: 'api_004',
    type: 'mentorship',
    title: 'Industry Expert Mentorship Program',
    description: 'Connect with industry experts who can provide strategic guidance and market insights.',
    matchScore: 95,
    participants: ['Industry Leaders Council'],
    tags: ['mentorship', 'industry-expertise', 'strategic-guidance'],
    potentialValue: 'Accelerated business growth and market positioning',
    dataSource: 'database',
    sourceId: 'backend_api'
  }
];

/**
 * GET /suggestions - Get all suggestions with optional filtering
 */
router.get('/', (req, res) => {
  try {
    const { 
      type, 
      minScore = 0, 
      maxResults = 10, 
      industry,
      tags 
    } = req.query;

    let filteredSuggestions = [...suggestionDatabase];

    // Filter by type
    if (type) {
      filteredSuggestions = filteredSuggestions.filter(
        suggestion => suggestion.type === type
      );
    }

    // Filter by minimum match score
    if (minScore) {
      filteredSuggestions = filteredSuggestions.filter(
        suggestion => suggestion.matchScore >= parseInt(minScore)
      );
    }

    // Filter by tags (if provided as comma-separated string)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filteredSuggestions = filteredSuggestions.filter(
        suggestion => suggestion.tags.some(tag => 
          tagArray.includes(tag.toLowerCase())
        )
      );
    }

    // Sort by match score (highest first)
    filteredSuggestions.sort((a, b) => b.matchScore - a.matchScore);

    // Limit results
    const limitedResults = filteredSuggestions.slice(0, parseInt(maxResults));

    res.json({
      success: true,
      data: limitedResults,
      total: filteredSuggestions.length,
      returned: limitedResults.length
    });

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestions',
      message: error.message
    });
  }
});

/**
 * POST /suggestions/generate - Generate personalized suggestions based on user profile
 */
router.post('/generate', validate.body({
  userProfile: {
    business_name: { type: 'string', optional: true },
    industry: { type: 'string', optional: true },
    skills: { type: 'array', optional: true },
    interests: { type: 'array', optional: true },
    location: { type: 'string', optional: true },
    company_size: { type: 'string', optional: true }
  }
}), async (req, res) => {
  try {
    const { userProfile } = req.body;
    
    // Use the backend data source service to generate suggestions
    const suggestions = await backendDataSource.generateSuggestions(userProfile);

    res.json({
      success: true,
      data: suggestions,
      personalized: !!userProfile,
      total: suggestions.length,
      sources_used: ['database', 'ai', 'manual']
    });

  } catch (error) {
    console.error('Error generating personalized suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggestions',
      message: error.message
    });
  }
});

/**
 * GET /suggestions/:id - Get a specific suggestion by ID
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const suggestion = suggestionDatabase.find(s => s.id === id);

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'Suggestion not found'
      });
    }

    res.json({
      success: true,
      data: suggestion
    });

  } catch (error) {
    console.error('Error fetching suggestion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestion',
      message: error.message
    });
  }
});

/**
 * GET /suggestions/datasource/:source - Get suggestions from a specific data source
 */
router.get('/datasource/:source', async (req, res) => {
  try {
    const { source } = req.params;
    const { userProfile } = req.query;
    
    if (!['database', 'ai', 'manual'].includes(source)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data source. Must be: database, ai, or manual'
      });
    }

    // Parse userProfile if provided
    let parsedProfile = {};
    if (userProfile) {
      try {
        parsedProfile = JSON.parse(userProfile);
      } catch (e) {
        console.warn('Failed to parse userProfile query parameter');
      }
    }

    const sourceSuggestions = await backendDataSource.getSuggestionsBySource(source, parsedProfile);

    res.json({
      success: true,
      data: sourceSuggestions,
      source: source,
      total: sourceSuggestions.length
    });

  } catch (error) {
    console.error('Error fetching suggestions by source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggestions by source',
      message: error.message
    });
  }
});

/**
 * GET /suggestions/health - Health check for data sources
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await backendDataSource.healthCheck();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data_sources: healthStatus
    });

  } catch (error) {
    console.error('Error checking data source health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check data source health',
      message: error.message
    });
  }
});

module.exports = router;