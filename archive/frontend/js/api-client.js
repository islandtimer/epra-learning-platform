/**
 * EPRA API Client - Secure frontend API integration
 * Replaces direct API calls to Claude/Perplexity with backend proxy calls
 */

class EPRAApiClient {
  constructor() {
    this.baseURL = this.getBaseURL();
    this.token = localStorage.getItem('epra_access_token');
    this.refreshToken = localStorage.getItem('epra_refresh_token');
  }

  getBaseURL() {
    // Determine API base URL based on environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    }
    return '/api'; // Production: same origin
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    if (response.success) {
      this.setTokens(response.data.tokens);
      return response.data.user;
    }
    
    throw new Error(response.message);
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: userData
    });

    if (response.success) {
      this.setTokens(response.data.tokens);
      return response.data.user;
    }
    
    throw new Error(response.message);
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: { refreshToken: this.refreshToken }
      });
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      const data = await response.json();
      
      if (data.success) {
        this.setTokens(data.data.tokens);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    this.clearTokens();
    return false;
  }

  setTokens(tokens) {
    this.token = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    localStorage.setItem('epra_access_token', tokens.accessToken);
    localStorage.setItem('epra_refresh_token', tokens.refreshToken);
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('epra_access_token');
    localStorage.removeItem('epra_refresh_token');
  }

  isAuthenticated() {
    return !!this.token;
  }

  // AI methods (replacing direct API calls)
  async generateEPResponse(query, options = {}) {
    const response = await this.request('/ai/chat', {
      method: 'POST',
      body: {
        query,
        includeRealTime: options.includeRealTime || false,
        systemPrompt: options.systemPrompt || ''
      }
    });

    if (response.success) {
      return {
        content: response.data.content,
        citations: response.data.citations || [],
        timestamp: response.data.timestamp,
        enhancedWithCurrent: response.data.enhancedWithCurrent || false,
        currentContext: response.data.currentContext
      };
    }
    
    throw new Error(response.message);
  }

  async searchCurrent(query, domains = []) {
    const response = await this.request('/ai/search', {
      method: 'POST',
      body: { query, domains }
    });

    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  // Chat session methods
  async createChatSession(title = 'New Chat') {
    const response = await this.request('/chat/sessions', {
      method: 'POST',
      body: { title }
    });

    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async getChatSessions(limit = 50) {
    const response = await this.request(`/chat/sessions?limit=${limit}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async getChatMessages(sessionId, limit = 100) {
    const response = await this.request(`/chat/sessions/${sessionId}/messages?limit=${limit}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async addChatMessage(sessionId, role, content, metadata = {}) {
    const response = await this.request(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: { role, content, metadata }
    });

    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async deleteChatSession(sessionId) {
    const response = await this.request(`/chat/sessions/${sessionId}`, {
      method: 'DELETE'
    });

    if (response.success) {
      return true;
    }
    
    throw new Error(response.message);
  }

  // Learning progress methods
  async getUserProgress() {
    const response = await this.request('/learning/progress');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async getModuleProgress(moduleId) {
    const response = await this.request(`/learning/progress/${moduleId}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async updateProgress(moduleId, progressData) {
    const response = await this.request('/learning/progress', {
      method: 'POST',
      body: { moduleId, ...progressData }
    });

    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async getLearningStats() {
    const response = await this.request('/learning/stats');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async getLeaderboard(limit = 10) {
    const response = await this.request(`/learning/leaderboard?limit=${limit}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  // User profile methods
  async getUserProfile() {
    const response = await this.request('/users/profile');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async updateProfile(updates) {
    const response = await this.request('/users/profile', {
      method: 'PATCH',
      body: updates
    });

    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async getUserSettings() {
    const response = await this.request('/users/settings');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async updateSettings(updates) {
    const response = await this.request('/users/settings', {
      method: 'PATCH',
      body: updates
    });

    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  async changePassword(currentPassword, newPassword) {
    const response = await this.request('/users/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword }
    });

    if (response.success) {
      return true;
    }
    
    throw new Error(response.message);
  }

  async getUserUsage(days = 30) {
    const response = await this.request(`/users/usage?days=${days}`);
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.message);
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    // Add body for non-GET requests
    if (options.body && config.method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && this.refreshToken) {
        const refreshSuccess = await this.refreshAccessToken();
        if (refreshSuccess) {
          // Retry the original request with new token
          config.headers.Authorization = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, config);
          return await retryResponse.json();
        } else {
          // Redirect to login if refresh fails
          window.location.href = '/login.html';
          return;
        }
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error('Network error occurred');
    }
  }
}

// Export for use in other modules
window.EPRAApiClient = EPRAApiClient;