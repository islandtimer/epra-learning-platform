const axios = require('axios');
const logger = require('../utils/logger');

class PerplexityService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai/chat/completions';
    this.model = 'sonar';
    
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
      temperature = 0.2,
      maxTokens = 1000
    } = options;

    try {
      const response = await axios.post(this.baseURL, {
        model: this.model,
        messages: [{
          role: 'user',
          content: `${query}

IMPORTANT: Only reference CURRENT versions of documents:
- Equator Principles EP4 (2020) from equator-principles.com/resources/
- IFC Performance Standards (2012) from ifc.org/en/insights-reports/2012/ifc-performance-standards
- Exclude outdated versions (e.g., 2006 IFC standards, EP3, etc.)

Focus on providing authoritative, precise information with specific document citations and page references where possible.`
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