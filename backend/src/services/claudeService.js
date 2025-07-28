const axios = require('axios');
const logger = require('../utils/logger');

class ClaudeService {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.projectId = process.env.CLAUDE_PROJECT_ID;
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-haiku-20240307';
    
    if (!this.apiKey) {
      logger.warn('Claude API key not configured');
    }
  }

  async generateResponse(query, systemPrompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const {
      maxTokens = 2000,
      temperature = 0.1,
      includeContext = ''
    } = options;

    try {
      logger.info('Claude API request starting', { model: this.model, hasApiKey: !!this.apiKey });

      // Use minimal request format that worked in test endpoint
      const requestBody = {
        model: this.model,
        max_tokens: Math.min(maxTokens, 1000), // Limit max tokens
        messages: [{ role: 'user', content: query }]
      };

      // Only add system prompt if provided and keep it short
      if (systemPrompt && systemPrompt.length < 500) {
        requestBody.system = systemPrompt;
      }

      logger.info('Making Claude API request', { model: this.model });

      const response = await axios.post(this.baseURL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      });

      const content = response.data.content[0].text;
      const citations = this.extractCitations(content);

      return {
        content,
        citations,
        usage: response.data.usage || {},
        model: this.model,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Claude API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      if (error.response?.status === 401) {
        throw new Error('Invalid Claude API key');
      } else if (error.response?.status === 429) {
        throw new Error('Claude API rate limit exceeded');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid request to Claude API');
      } else {
        throw new Error('Claude API temporarily unavailable');
      }
    }
  }

  extractCitations(text) {
    const citations = [];
    const epDocPatterns = [
      { pattern: /EP4|Equator Principles/gi, title: 'Equator Principles EP4', type: 'core' },
      { pattern: /IFC Performance Standard/gi, title: 'IFC Performance Standards', type: 'standard' },
      { pattern: /Climate Change Risk Assessment/gi, title: 'Climate Change Risk Assessment Guidance', type: 'guidance' },
      { pattern: /Human Rights Assessment/gi, title: 'Human Rights Assessment Guidance', type: 'guidance' },
      { pattern: /Biodiversity.*Guidance/gi, title: 'Biodiversity Baseline Surveys Guidance', type: 'guidance' },
      { pattern: /ESMS|Environmental.*Social.*Management/gi, title: 'ESMS Implementation Handbook', type: 'handbook' },
      { pattern: /Independent.*ESDD/gi, title: 'Independent ESDD Review Guidance', type: 'guidance' }
    ];

    epDocPatterns.forEach(({ pattern, title, type }) => {
      if (pattern.test(text)) {
        citations.push({ title, type, version: 'From EP Knowledge Base' });
      }
    });

    return citations.length > 0 ? 
      [...new Set(citations.map(c => JSON.stringify(c)))].map(c => JSON.parse(c)) : 
      [{ title: 'EP Knowledge Base', type: 'general', version: 'Multiple sources' }];
  }

  needsCurrentInfo(query) {
    const timeKeywords = ['latest', 'current', 'recent', 'updated', '2024', '2025', 'new regulations', 'policy changes', 'amendments'];
    return timeKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }
}

module.exports = ClaudeService;