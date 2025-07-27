// Enhanced ClaudeEPRA and PerplexitySearch implementation
class ClaudeEPRA {
  constructor(apiKey, projectId) {
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    this.requestCount = 0;
    this.cache = new Map();
  }

  async generateEPResponse(query, includeRealTime = false) {
    try {
      // Check cache first
      const cacheKey = `${query}_${includeRealTime}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      let systemPrompt = `You are EPRA, an expert assistant for Equator Principles risk assessment. 
      Use the project knowledge containing 20+ core EP documents to provide accurate, 
      cited responses. Always reference specific EP documents when applicable.

      When providing answers:
      1. Cite specific EP documents, sections, and page numbers when possible
      2. Use the exact terminology from EP4 and IFC Performance Standards
      3. Provide practical, actionable guidance for practitioners
      4. Consider sector-specific requirements when relevant
      5. Format responses with clear structure and bullet points when appropriate
      6. Include relevant risk categories (A, B, C) when discussing project classification`;

      // Only add real-time info if needed and we have valid API keys
      if (includeRealTime || this.needsCurrentInfo(query)) {
        try {
          const perplexity = new PerplexitySearch(apiKeys.perplexity);
          const currentInfo = await perplexity.searchCurrent(query);
          systemPrompt += `\n\nAdditional current context: ${currentInfo.content}`;
        } catch (err) {
          console.warn('Perplexity API not available:', err.message);
        }
      }

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'anthropic-beta': 'projects-2024-01-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          project_id: this.projectId,
          system: systemPrompt,
          messages: [{ role: 'user', content: query }],
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const citations = this.extractCitations(data.content[0].text);

      const result = {
        content: data.content[0].text,
        citations: citations,
        timestamp: new Date().toISOString(),
        requestId: ++this.requestCount
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      // Limit cache size
      if (this.cache.size > 50) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      return result;

    } catch (error) {
      console.error('Claude API Error:', error);

      // Return helpful error message
      return {
        content: `I apologize, but I'm having trouble accessing the EP knowledge base right now. 

**Possible issues:**
- API key not configured in Settings (⚙️ icon in navbar)
- Project ID missing or incorrect
- Network connectivity issues

**To fix:**
1. Click the Settings button (⚙️) in the top navigation
2. Enter your Claude API key and Project ID
3. Ensure your Claude project has EP documents uploaded

**Demo Mode:** For now, I can still help with basic EP guidance based on my training data, but won't have access to the full document knowledge base.

Error details: ${error.message}`,
        citations: [{ title: 'Configuration Required', type: 'system', version: 'Setup needed' }],
        error: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  needsCurrentInfo(query) {
    const timeKeywords = ['latest', 'current', 'recent', 'updated', '2024', '2025', 'new regulations', 'policy changes', 'amendments'];
    return timeKeywords.some(keyword => query.toLowerCase().includes(keyword));
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

    return citations.length > 0 ? [...new Set(citations)] : [{ title: 'EP Knowledge Base', type: 'general', version: 'Multiple sources' }];
  }
}

class PerplexitySearch {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.perplexity.ai/chat/completions';
  }

  async searchCurrent(query, domains = []) {
    try {
      const defaultDomains = ['equator-principles.com', 'ifc.org', 'worldbank.org', 'ebrd.com'];
      const searchDomains = domains.length > 0 ? domains : defaultDomains;

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [{
            role: 'user',
            content: `Search for current information about: ${query}. 
            Focus on regulatory updates, policy changes, and industry developments 
            related to Equator Principles and environmental finance. 
            Provide specific sources and dates when available.`
          }],
          search_domain_filter: searchDomains,
          return_citations: true,
          return_images: false,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0].message.content,
        citations: data.citations || [],
        sources: data.choices[0].message.sources || []
      };

    } catch (error) {
      console.error('Perplexity API Error:', error);
      return {
        content: `Unable to fetch current information at this time.`,
        citations: [],
        sources: []
      };
    }
  }
}

