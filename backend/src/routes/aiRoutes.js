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

// Claude chat endpoint
router.post('/chat', authenticateToken, validateChatRequest, trackApiUsage('claude'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { query, includeRealTime = false, systemPrompt = '' } = req.body;
    const userId = req.user.id;

    let response = await claudeService.generateResponse(query, systemPrompt);

    // Enhance with real-time info if requested and query needs current info
    if (includeRealTime || claudeService.needsCurrentInfo(query)) {
      try {
        response = await perplexityService.enhanceWithCurrentInfo(query, response);
      } catch (error) {
        logger.warn('Failed to enhance with real-time info:', error.message);
        // Continue with Claude response only
      }
    }

    // Log successful API usage
    logger.info('Claude API request successful', {
      userId,
      tokensUsed: response.usage?.output_tokens || 0,
      query: query.substring(0, 100) + '...'
    });

    res.json({
      success: true,
      data: response
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

// Test Claude API key endpoint
router.get('/test-claude', authenticateToken, async (req, res) => {
  try {
    // Test with minimal direct API call
    const axios = require('axios');
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Hello' }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`,
        'anthropic-version': '2023-06-01'
      },
      timeout: 10000
    });

    res.json({
      success: true,
      message: 'Claude API key is working',
      data: { response: response.data.content[0].text }
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Claude API key test failed',
      error: error.message,
      statusCode: error.response?.status,
      responseData: error.response?.data,
      keyConfigured: !!process.env.CLAUDE_API_KEY,
      keyStart: process.env.CLAUDE_API_KEY ? process.env.CLAUDE_API_KEY.substring(0, 15) : 'missing',
      keyLength: process.env.CLAUDE_API_KEY ? process.env.CLAUDE_API_KEY.length : 0,
      keyEnd: process.env.CLAUDE_API_KEY ? '...' + process.env.CLAUDE_API_KEY.substring(process.env.CLAUDE_API_KEY.length - 10) : 'missing',
      authHeader: process.env.CLAUDE_API_KEY ? `Bearer ${process.env.CLAUDE_API_KEY.substring(0, 20)}...` : 'missing'
    });
  }
});

module.exports = router;