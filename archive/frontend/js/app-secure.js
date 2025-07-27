/**
 * EPRA Learning App - Secure Backend Integration
 * Updated to use secure backend APIs instead of direct client-side API calls
 */

class EPRASecureApp {
  constructor() {
    this.apiClient = new EPRAApiClient();
    this.authManager = new AuthManager(this.apiClient);
    this.currentView = 'chat';
    this.currentChatSession = null;
    this.chatMessages = [];
    this.learningProgress = new Map();
    
    this.init();
  }

  async init() {
    this.initializeEventListeners();
    await this.authManager.initializeAuth();
    this.updateUIBasedOnAuth();
    this.loadInitialView();
  }

  initializeEventListeners() {
    // Navigation
    document.addEventListener('click', (e) => {
      if (e.target.matches('[href^="#"]')) {
        e.preventDefault();
        const view = e.target.getAttribute('href').substring(1);
        this.switchView(view);
      }
    });

    // Auth state changes
    window.addEventListener('authStateChanged', (e) => {
      this.updateUIBasedOnAuth(e.detail.isAuthenticated, e.detail.user);
    });

    // Login prompt button
    const loginPromptBtn = document.getElementById('loginPromptBtn');
    if (loginPromptBtn) {
      loginPromptBtn.addEventListener('click', () => {
        this.authManager.showLoginModal();
      });
    }

    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        if (this.authManager.isAuthenticated()) {
          this.showUserSettings();
        } else {
          this.showLegacySettings();
        }
      });
    }

    // Dark mode toggle
    const darkToggle = document.getElementById('darkToggle');
    if (darkToggle) {
      darkToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    // Language selector
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
    }
  }

  updateUIBasedOnAuth(isAuthenticated = null, user = null) {
    const authState = isAuthenticated !== null ? isAuthenticated : this.authManager.isAuthenticated();
    const currentUser = user || this.authManager.getCurrentUser();

    // Update demo banner
    const demoBanner = document.getElementById('demoBanner');
    const authPrompt = document.getElementById('authPrompt');
    const loginPromptBtn = document.getElementById('loginPromptBtn');

    if (authState && currentUser) {
      if (authPrompt) {
        authPrompt.textContent = `Welcome back, ${currentUser.firstName}! Full functionality is available.`;
      }
      if (loginPromptBtn) {
        loginPromptBtn.style.display = 'none';
      }
    } else {
      if (authPrompt) {
        authPrompt.textContent = 'Sign in for full access to AI assistance and progress tracking.';
      }
      if (loginPromptBtn) {
        loginPromptBtn.style.display = 'inline-block';
      }
    }

    // Update navigation if needed
    this.authManager.updateNavigation(authState);
  }

  switchView(viewName) {
    this.currentView = viewName;
    
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`#nav-${viewName}`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    // Load view content
    this.loadView(viewName);
  }

  async loadView(viewName) {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;

    switch (viewName) {
      case 'chat':
        await this.loadChatView();
        break;
      case 'learning':
        await this.loadLearningView();
        break;
      default:
        tabContent.innerHTML = '<div class="alert alert-warning">View not found</div>';
    }
  }

  async loadChatView() {
    const tabContent = document.getElementById('tabContent');
    
    const chatHTML = `
      <div class="row h-100">
        <div class="col-md-3 border-end">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Chat Sessions</h5>
            <button class="btn btn-primary btn-sm" id="newChatBtn" ${!this.authManager.isAuthenticated() ? 'disabled title="Sign in required"' : ''}>
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          <div id="chatSessions" class="list-group">
            ${!this.authManager.isAuthenticated() 
              ? '<div class="text-muted text-center p-3">Sign in to save chat history</div>'
              : '<div class="text-muted text-center p-3">Loading sessions...</div>'
            }
          </div>
        </div>
        <div class="col-md-9 d-flex flex-column">
          <div id="chatMessages" class="flex-grow-1 border rounded p-3 mb-3" style="min-height: 400px; max-height: 500px; overflow-y: auto;">
            <div class="text-center text-muted">
              <i class="fa-solid fa-comments fa-3x mb-3"></i>
              <p>Start a conversation with EPRA, your Equator Principles assistant</p>
            </div>
          </div>
          <div class="input-group">
            <input type="text" class="form-control" id="chatInput" placeholder="Ask about Equator Principles..." ${!this.authManager.isAuthenticated() ? 'disabled' : ''}>
            <button class="btn btn-primary" id="sendBtn" ${!this.authManager.isAuthenticated() ? 'disabled' : ''}>
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
          ${!this.authManager.isAuthenticated() 
            ? '<small class="text-muted mt-2">Sign in to enable AI chat functionality</small>'
            : ''
          }
        </div>
      </div>
    `;

    tabContent.innerHTML = chatHTML;

    // Add event listeners
    this.initializeChatEvents();

    // Load chat sessions if authenticated
    if (this.authManager.isAuthenticated()) {
      await this.loadChatSessions();
    }
  }

  initializeChatEvents() {
    const newChatBtn = document.getElementById('newChatBtn');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => this.createNewChat());
    }

    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }
  }

  async loadChatSessions() {
    try {
      const sessions = await this.apiClient.getChatSessions();
      const sessionsContainer = document.getElementById('chatSessions');
      
      if (sessions.length === 0) {
        sessionsContainer.innerHTML = '<div class="text-muted text-center p-3">No chat sessions yet</div>';
        return;
      }

      sessionsContainer.innerHTML = sessions.map(session => `
        <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                data-session-id="${session.id}">
          <div>
            <div class="fw-medium">${session.title}</div>
            <small class="text-muted">${session.message_count} messages</small>
          </div>
          <small class="text-muted">${new Date(session.updated_at).toLocaleDateString()}</small>
        </button>
      `).join('');

      // Add click handlers for sessions
      sessionsContainer.addEventListener('click', (e) => {
        const sessionBtn = e.target.closest('[data-session-id]');
        if (sessionBtn) {
          this.loadChatSession(sessionBtn.dataset.sessionId);
        }
      });

    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      const sessionsContainer = document.getElementById('chatSessions');
      sessionsContainer.innerHTML = '<div class="text-danger text-center p-3">Failed to load sessions</div>';
    }
  }

  async createNewChat() {
    if (!this.authManager.isAuthenticated()) {
      this.authManager.showLoginModal();
      return;
    }

    try {
      const session = await this.apiClient.createChatSession();
      this.currentChatSession = session;
      this.chatMessages = [];
      
      // Reload sessions list
      await this.loadChatSessions();
      
      // Clear chat messages
      const chatMessages = document.getElementById('chatMessages');
      chatMessages.innerHTML = '<div class="text-center text-muted">New conversation started</div>';
      
    } catch (error) {
      console.error('Failed to create chat session:', error);
      alert('Failed to create new chat session');
    }
  }

  async loadChatSession(sessionId) {
    try {
      const messages = await this.apiClient.getChatMessages(sessionId);
      this.currentChatSession = { id: sessionId };
      this.chatMessages = messages;
      
      this.renderChatMessages();
      
    } catch (error) {
      console.error('Failed to load chat session:', error);
      alert('Failed to load chat session');
    }
  }

  renderChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    
    if (this.chatMessages.length === 0) {
      chatMessages.innerHTML = '<div class="text-center text-muted">No messages yet</div>';
      return;
    }

    chatMessages.innerHTML = this.chatMessages.map(message => `
      <div class="mb-3 ${message.role === 'user' ? 'text-end' : ''}">
        <div class="d-inline-block max-width-75 ${message.role === 'user' ? 'bg-primary text-white' : 'bg-light'} rounded p-3">
          ${message.role === 'assistant' ? this.renderMarkdown(message.content) : message.content}
        </div>
        <small class="d-block text-muted mt-1">
          ${new Date(message.created_at).toLocaleTimeString()}
        </small>
      </div>
    `).join('');

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const message = chatInput.value.trim();

    if (!message) return;

    if (!this.authManager.isAuthenticated()) {
      this.authManager.showLoginModal();
      return;
    }

    try {
      // Create session if none exists
      if (!this.currentChatSession) {
        await this.createNewChat();
      }

      // Disable input
      chatInput.disabled = true;
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

      // Add user message to UI
      const userMessage = { role: 'user', content: message, created_at: new Date().toISOString() };
      this.chatMessages.push(userMessage);
      this.renderChatMessages();

      // Save user message to backend
      await this.apiClient.addChatMessage(this.currentChatSession.id, 'user', message);

      // Clear input
      chatInput.value = '';

      // Get AI response
      const response = await this.apiClient.generateEPResponse(message, {
        includeRealTime: false
      });

      // Add assistant message to UI
      const assistantMessage = { 
        role: 'assistant', 
        content: response.content, 
        created_at: new Date().toISOString() 
      };
      this.chatMessages.push(assistantMessage);
      this.renderChatMessages();

      // Save assistant message to backend
      await this.apiClient.addChatMessage(this.currentChatSession.id, 'assistant', response.content, {
        citations: response.citations,
        enhancedWithCurrent: response.enhancedWithCurrent
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      // Re-enable input
      chatInput.disabled = false;
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
      chatInput.focus();
    }
  }

  renderMarkdown(content) {
    if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(marked.parse(content));
    }
    return content.replace(/\n/g, '<br>');
  }

  async loadLearningView() {
    const tabContent = document.getElementById('tabContent');
    
    // This would be expanded with learning modules from DATA
    // For now, showing a basic structure
    tabContent.innerHTML = `
      <div class="row">
        <div class="col-md-8">
          <h3>Learning Modules</h3>
          <div id="learningModules">
            Loading modules...
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Your Progress</h5>
            </div>
            <div class="card-body" id="progressSummary">
              ${this.authManager.isAuthenticated() 
                ? 'Loading progress...'
                : 'Sign in to track your progress'
              }
            </div>
          </div>
        </div>
      </div>
    `;

    if (this.authManager.isAuthenticated()) {
      await this.loadLearningProgress();
    }
  }

  async loadLearningProgress() {
    try {
      const progress = await this.apiClient.getUserProgress();
      const stats = await this.apiClient.getLearningStats();
      
      const progressSummary = document.getElementById('progressSummary');
      progressSummary.innerHTML = `
        <div class="d-flex justify-content-between mb-2">
          <span>Modules Started:</span>
          <strong>${stats.modulesStarted}</strong>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <span>Modules Completed:</span>
          <strong>${stats.modulesCompleted}</strong>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <span>Average Score:</span>
          <strong>${stats.averageScore}%</strong>
        </div>
        <div class="d-flex justify-content-between">
          <span>Time Spent:</span>
          <strong>${Math.round(stats.totalTimeSpent / 60)} min</strong>
        </div>
      `;
      
    } catch (error) {
      console.error('Failed to load learning progress:', error);
    }
  }

  showUserSettings() {
    // Implementation for authenticated user settings
    // This would show profile settings, not API configuration
    console.log('User settings modal would be shown here');
  }

  showLegacySettings() {
    // Keep the original settings modal for legacy users
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
      const modal = new bootstrap.Modal(settingsModal);
      modal.show();
    }
  }

  toggleDarkMode() {
    const html = document.documentElement;
    const currentScheme = html.getAttribute('data-color-scheme');
    const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-color-scheme', newScheme);
    
    // Save preference if authenticated
    if (this.authManager.isAuthenticated()) {
      this.apiClient.updateSettings({ theme: newScheme }).catch(console.error);
    } else {
      localStorage.setItem('epra_theme', newScheme);
    }
  }

  changeLanguage(lang) {
    // Save language preference if authenticated
    if (this.authManager.isAuthenticated()) {
      this.apiClient.updateSettings({ language: lang }).catch(console.error);
    } else {
      localStorage.setItem('epra_language', lang);
    }
  }

  loadInitialView() {
    // Load the default view
    this.switchView('chat');
  }
}

// Initialize the secure app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for all scripts to load
  setTimeout(() => {
    if (window.EPRAApiClient && window.AuthManager) {
      window.epraApp = new EPRASecureApp();
    } else {
      console.error('Required classes not loaded');
    }
  }, 100);
});