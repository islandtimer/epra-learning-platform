const express = require('express');
const { body, validationResult } = require('express-validator');
const ClaudeService = require('../services/claudeService');
const PerplexityService = require('../services/perplexityService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { trackApiUsage } = require('../middleware/usageMiddleware');
const logger = require('../utils/logger');

const router = express.Router();
const claudeService = new ClaudeService();
const perplexityService = new PerplexityService();

// Validation middleware
const validateChatRequest = [
  body('query')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Query must be between 1 and 5000 characters')
    .escape(),
  body('includeRealTime')
    .optional()
    .isBoolean()
    .withMessage('includeRealTime must be a boolean'),
  body('systemPrompt')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('System prompt must be less than 1000 characters')
    .escape()
];

const validateSearchRequest = [
  body('query')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Query must be between 1 and 1000 characters')
    .escape(),
  body('domains')
    .optional()
    .isArray()
    .withMessage('Domains must be an array'),
  body('domains.*')
    .optional()
    .isURL({ require_protocol: false })
    .withMessage('Each domain must be a valid domain name')
];

// EP-focused chat endpoint using Perplexity for document access
router.post('/chat', authenticateToken, validateChatRequest, trackApiUsage('perplexity'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { query } = req.body;
    const userId = req.user.id;

    // Enhanced query targeting specific EP document locations and current versions
    const epQuery = `${query} (site:equator-principles.com/resources/ OR site:ifc.org/en/insights-reports/2012/ifc-performance-standards) current version latest EP4 2020 IFC Performance Standards 2012`;

    // Use Perplexity with focus on primary authoritative sources
    const response = await perplexityService.searchCurrent(epQuery, { 
      primaryDomains: [
        'equator-principles.com/resources/',
        'ifc.org/en/insights-reports/2012/ifc-performance-standards'
      ],
      secondaryDomains: [
        'worldbank.org',
        'unepfi.org',
        'ebrd.com',
        'adb.org'
      ],
      focus: 'current EP4 2020 IFC Performance Standards 2012 environmental social risk management',
      excludeOutdated: true
    });

    // Log successful API usage
    logger.info('Perplexity EP search successful', {
      userId,
      query: query.substring(0, 100) + '...',
      sourcesFound: response.sources?.length || 0
    });

    res.json({
      success: true,
      data: {
        content: response.answer || response.text || response.content || 'No response received',
        sources: response.sources || [],
        citations: response.citations || [],
        usage: response.usage || {},
        model: 'perplexity-sonar-pro',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Claude API endpoint error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      query: req.body?.query?.substring(0, 100),
      fullError: error
    });

    // Always respond to prevent hanging
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message === 'Claude API key not configured' 
          ? 'AI service temporarily unavailable' 
          : `Failed to process request: ${error.message}`
      });
    }
  }
});

// Perplexity search endpoint
router.post('/search', authenticateToken, validateSearchRequest, trackApiUsage('perplexity'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { query, domains } = req.body;
    const userId = req.user.id;

    const response = await perplexityService.searchCurrent(query, { domains });

    logger.info('Perplexity API request successful', {
      userId,
      query: query.substring(0, 100) + '...',
      sourcesFound: response.sources?.length || 0
    });

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('Perplexity API endpoint error:', {
      error: error.message,
      userId: req.user?.id,
      query: req.body?.query?.substring(0, 100)
    });

    res.status(500).json({
      success: false,
      message: error.message === 'Perplexity API key not configured' 
        ? 'Search service temporarily unavailable' 
        : 'Failed to process search request'
    });
  }
});

// Health check for AI services
router.get('/health', authenticateToken, async (req, res) => {
  const status = {
    claude: {
      configured: !!process.env.CLAUDE_API_KEY,
      keyFormat: process.env.CLAUDE_API_KEY ? process.env.CLAUDE_API_KEY.substring(0, 12) + '...' : 'missing',
      available: true
    },
    perplexity: {
      configured: !!process.env.PERPLEXITY_API_KEY,
      available: true
    }
  };

  res.json({
    success: true,
    data: status
  });
});

// Test Perplexity API key endpoint
router.get('/test-perplexity', authenticateToken, async (req, res) => {
  try {
    // Test with minimal direct API call
    const axios = require('axios');
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'sonar',
      messages: [{ role: 'user', content: 'What are the Equator Principles?' }],
      max_tokens: 200
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      timeout: 10000
    });

    res.json({
      success: true,
      message: 'Perplexity API key is working',
      data: { response: response.data.choices[0].message.content }
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Perplexity API key test failed',
      error: error.message,
      statusCode: error.response?.status,
      responseData: error.response?.data,
      keyConfigured: !!process.env.PERPLEXITY_API_KEY,
      keyStart: process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.substring(0, 15) : 'missing'
    });
  }
});

module.exports = router;