const axios = require('axios');
const logger = require('../utils/logger');

class PerplexityService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai/chat/completions';
    this.model = 'sonar-reasoning'; // Default to reasoning model
    
    if (!this.apiKey) {
      logger.warn('Perplexity API key not configured');
    }
  }

  async searchCurrent(query, options = {}) {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const {
      domains = ['equator-principles.com', 'ifc.org', 'worldbank.org', 'ebrd.com'],
      temperature = 0.1, // More focused responses
      maxTokens = 1500, // Prevent truncation
      model = this.model // Allow model override
    } = options;

    try {
      const response = await axios.post(this.baseURL, {
        model: model,
        messages: [{
          role: 'user',
          content: `${query}

CRITICAL INSTRUCTIONS:
- Provide direct, professional answers without meta-commentary or process explanation
- Only reference CURRENT versions: EP4 (2020) and IFC Performance Standards (2012)
- Exclude outdated versions (EP3, 2006 IFC standards, etc.)
- Use clear structure with headers and bullet points
- Cite sources with [number] format
- No "I need to..." or "Let me..." phrasing - answer directly
- Maximum 800 words for concise, expert-level responses`
        }],
        temperature: temperature,
        max_tokens: maxTokens
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 30000
      });

      const content = response.data.choices[0].message.content;
      
      return {
        answer: content,
        content: content,
        sources: response.data.citations || [],
        usage: response.data.usage || {},
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Perplexity API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      if (error.response?.status === 401) {
        throw new Error('Invalid Perplexity API key');
      } else if (error.response?.status === 429) {
        throw new Error('Perplexity API rate limit exceeded');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid request to Perplexity API');
      } else {
        throw new Error('Perplexity API temporarily unavailable');
      }
    }
  }

  async enhanceWithCurrentInfo(query, claudeResponse) {
    try {
      const currentInfo = await this.searchCurrent(query);
      
      return {
        ...claudeResponse,
        enhancedWithCurrent: true,
        currentContext: {
          content: currentInfo.content,
          sources: currentInfo.sources,
          citations: currentInfo.citations
        }
      };
    } catch (error) {
      logger.warn('Failed to enhance with current info:', error.message);
      return claudeResponse;
    }
  }
}

module.exports = PerplexityService;