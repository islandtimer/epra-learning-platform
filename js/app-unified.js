/**
 * EPRA Learning App - Unified Functional Version
 * ===============================================
 * Combines modern UI with working functionality
 */

class EPRAUnifiedApp {
  constructor() {
    this.currentView = 'chat';
    this.chatMessages = [];
    this.isAuthenticated = false;
    this.currentUser = null;
    
    // Initialize app
    this.init();
  }

  init() {
    console.log('🚀 EPRA Unified App initializing...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeApp());
    } else {
      this.initializeApp();
    }
  }

  initializeApp() {
    this.initializeEventListeners();
    this.loadInitialView();
    this.initializeAuth();
    console.log('✅ EPRA App initialized successfully');
  }

  initializeEventListeners() {
    console.log('🔗 Setting up event listeners...');

    // Navigation clicks
    document.addEventListener('click', (e) => {
      // Handle navigation links
      if (e.target.closest('a[href^="#"]')) {
        e.preventDefault();
        const link = e.target.closest('a[href^="#"]');
        const view = link.getAttribute('href').substring(1);
        this.switchView(view);
        return;
      }

      // Handle settings button
      if (e.target.closest('#settingsBtn')) {
        e.preventDefault();
        this.showSettings();
        return;
      }

      // Handle login button
      if (e.target.closest('#loginPromptBtn')) {
        e.preventDefault();
        this.showLoginModal();
        return;
      }

      // Handle dark mode toggle
      if (e.target.closest('#darkToggle')) {
        e.preventDefault();
        this.toggleDarkMode();
        return;
      }

      // Handle banner close - prevent it from fully hiding
      if (e.target.closest('.btn-close')) {
        e.preventDefault();
        const banner = document.getElementById('demoBanner');
        if (banner && !this.isAuthenticated) {
          // Instead of hiding, just minimize it
          banner.style.display = 'none';
          setTimeout(() => {
            banner.style.display = 'block';
            banner.style.opacity = '0.7';
            banner.style.height = '40px';
          }, 5000); // Show again after 5 seconds in minimized form
        }
        return;
      }
    });

    // Language selector
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        this.changeLanguage(e.target.value);
      });
    }

    console.log('✅ Event listeners initialized');
  }

  switchView(viewName) {
    console.log(`🔄 Switching to view: ${viewName}`);
    
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
    if (!tabContent) {
      console.error('❌ Tab content container not found');
      return;
    }

    console.log(`📄 Loading view: ${viewName}`);

    switch (viewName) {
      case 'chat':
        this.loadChatView();
        break;
      case 'learning':
        this.loadLearningView();
        break;
      default:
        tabContent.innerHTML = `
          <div class="alert alert-warning">
            <i class="fa-solid fa-exclamation-triangle me-2"></i>
            View "${viewName}" not found
          </div>
        `;
    }
  }

  loadInitialView() {
    this.loadView(this.currentView);
  }

  loadChatView() {
    const tabContent = document.getElementById('tabContent');
    
    const chatHTML = `
      <div class="row h-100">
        <div class="col-lg-8 mx-auto">
          <div class="chat-container">
            <div class="chat-messages" id="chatMessages">
              <div class="text-center py-5">
                <div class="learning-module-icon mx-auto mb-4" style="width: 80px; height: 80px; font-size: 2rem;">
                  <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <h3 class="text-muted mb-3">Welcome to EPRA Assistant</h3>
                <p class="text-muted">Your expert guide for Equator Principles and sustainable finance</p>
                <div class="d-flex flex-wrap gap-2 justify-content-center mt-4">
                  <button class="btn btn-outline-primary btn-sm suggestion-btn" data-suggestion="What are the Equator Principles?">
                    <i class="fa-solid fa-lightbulb me-1"></i>What are the Equator Principles?
                  </button>
                  <button class="btn btn-outline-primary btn-sm suggestion-btn" data-suggestion="How do I categorize a project?">
                    <i class="fa-solid fa-list me-1"></i>Project categorization
                  </button>
                  <button class="btn btn-outline-primary btn-sm suggestion-btn" data-suggestion="Tell me about IFC Performance Standards">
                    <i class="fa-solid fa-star me-1"></i>IFC Standards
                  </button>
                </div>
              </div>
            </div>
            <div class="chat-input-container">
              <!-- Model Selection -->
              <div class="d-flex align-items-center gap-2 mb-2">
                <label for="modelSelect" class="form-label mb-0 text-muted small">
                  <i class="fa-solid fa-brain me-1"></i>AI Model:
                </label>
                <select id="modelSelect" class="form-select form-select-sm" style="width: auto;">
                  <option value="sonar-reasoning" selected>Reasoning (Fast, balanced)</option>
                  <option value="sonar-deep-research">Deep Research (Comprehensive analysis)</option>
                  <option value="sonar">Basic (Quick responses)</option>
                </select>
              </div>
              
              <form class="chat-input-form" id="chatForm">
                <textarea 
                  class="chat-input" 
                  id="chatInput" 
                  placeholder="Ask me anything about Equator Principles..."
                  rows="1"
                  ${!this.isAuthenticated ? 'disabled title="Sign in required"' : ''}
                ></textarea>
                <button 
                  type="submit" 
                  class="chat-send-btn" 
                  id="sendBtn"
                  ${!this.isAuthenticated ? 'disabled title="Sign in required"' : ''}
                >
                  <i class="fa-solid fa-paper-plane"></i>
                  <span class="btn-text">Send</span>
                </button>
              </form>
              ${!this.isAuthenticated 
                ? '<div class="text-center mt-3"><small class="text-muted">⚠️ Demo mode: AI features require authentication</small></div>'
                : ''
              }
            </div>
          </div>
        </div>
      </div>
    `;

    tabContent.innerHTML = chatHTML;
    this.initializeChatEvents();
  }

  initializeChatEvents() {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');

    // Auto-resize textarea
    if (chatInput) {
      chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
      });

      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Form submission
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }

    // Suggestion buttons
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const suggestion = e.target.closest('.suggestion-btn').dataset.suggestion;
        if (chatInput) {
          chatInput.value = suggestion;
          chatInput.focus();
          this.sendMessage();
        }
      });
    });
  }

  async sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const modelSelect = document.getElementById('modelSelect');

    if (!chatInput || !chatInput.value.trim()) return;
    if (!this.isAuthenticated) {
      alert('Please sign in to use the AI chat feature.');
      return;
    }

    const message = chatInput.value.trim();
    const selectedModel = modelSelect ? modelSelect.value : 'sonar-reasoning';
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Disable input while processing
    chatInput.disabled = true;
    sendBtn.disabled = true;

    // Add user message
    this.addMessageToChat('user', message);

    // Add loading message
    const loadingMsgId = this.addLoadingMessage();

    try {
      // Send to backend AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({ 
          query: message,
          model: selectedModel,
          systemPrompt: 'You are an expert assistant for the Equator Principles and sustainable finance. Provide helpful, accurate information about environmental and social risk management in project finance.',
          includeRealTime: false
        })
      });

      const data = await response.json();

      // Remove loading message
      this.removeLoadingMessage(loadingMsgId);

      if (data.success) {
        // Extract response from Claude service response structure
        const aiResponse = data.data.content || data.data.response || data.data.text || 'No response received';
        this.addMessageToChat('ai', aiResponse);
      } else {
        // Handle API error
        this.addMessageToChat('ai', `Sorry, I encountered an error: ${data.message}. Please try again.`);
      }

    } catch (error) {
      console.error('❌ Chat API error:', error);
      this.removeLoadingMessage(loadingMsgId);
      this.addMessageToChat('ai', 'Sorry, I\'m having trouble connecting to the server. Please check your connection and try again.');

    } finally {
      // Re-enable input
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  addMessageToChat(sender, content) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Remove welcome message if it exists
    const welcomeMsg = chatMessages.querySelector('.text-center.py-5');
    if (welcomeMsg) {
      welcomeMsg.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `chat-msg ${sender}`;
    
    messageEl.innerHTML = `
      <div class="avatar">${sender === 'user' ? 'You' : 'AI'}</div>
      <div class="content">${content}</div>
    `;

    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Add entrance animation
    messageEl.style.opacity = '0';
    messageEl.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      messageEl.style.transition = 'all 0.3s ease';
      messageEl.style.opacity = '1';
      messageEl.style.transform = 'translateY(0)';
    });
  }

  addLoadingMessage() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return null;

    const loadingId = 'loading-' + Date.now();
    const loadingEl = document.createElement('div');
    loadingEl.className = 'chat-msg ai';
    loadingEl.id = loadingId;
    
    loadingEl.innerHTML = `
      <div class="avatar">AI</div>
      <div class="content">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <small class="text-muted">EPRA Assistant is thinking...</small>
      </div>
    `;

    chatMessages.appendChild(loadingEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingId;
  }

  removeLoadingMessage(loadingMsgId) {
    if (loadingMsgId) {
      const loadingEl = document.getElementById(loadingMsgId);
      if (loadingEl) {
        loadingEl.remove();
      }
    }
  }

  loadLearningView() {
    const tabContent = document.getElementById('tabContent');
    
    const learningHTML = `
      <div class="learning-dashboard">
        <div class="row mb-5">
          <div class="col-12">
            <div class="learning-header text-center">
              <div class="learning-hero-icon mx-auto mb-4">
                <i class="fa-solid fa-graduation-cap"></i>
              </div>
              <h1 class="display-5 fw-bold mb-3">Master the Equator Principles</h1>
              <p class="lead text-muted mb-4">Interactive learning modules designed for finance professionals</p>
              <div class="learning-stats row g-3 justify-content-center">
                <div class="col-auto">
                  <div class="stat-card">
                    <div class="stat-number">0</div>
                    <div class="stat-label">Completed</div>
                  </div>
                </div>
                <div class="col-auto">
                  <div class="stat-card">
                    <div class="stat-number">5</div>
                    <div class="stat-label">Total Modules</div>
                  </div>
                </div>
                <div class="col-auto">
                  <div class="stat-card">
                    <div class="stat-number">0%</div>
                    <div class="stat-label">Average Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          ${this.generateLearningModules()}
        </div>
      </div>
    `;

    tabContent.innerHTML = learningHTML;
    this.initializeLearningEvents();
  }

  generateLearningModules() {
    const modules = [
      {
        id: 'ep4-intro',
        title: 'Introduction to Equator Principles EP4',
        description: 'Master the fundamentals of EP4 and its application in project finance',
        difficulty: 'Beginner',
        estimatedTime: '15 minutes',
        icon: 'book-open',
        completed: false
      },
      {
        id: 'categorization',
        title: 'Project Categorization (A, B, C)',
        description: 'Learn how to properly categorize projects based on environmental and social risks',
        difficulty: 'Intermediate',
        estimatedTime: '20 minutes',
        icon: 'layer-group',
        completed: false
      },
      {
        id: 'risk-assessment',
        title: 'Environmental & Social Risk Assessment',
        description: 'Deep dive into conducting thorough risk assessments',
        difficulty: 'Advanced',
        estimatedTime: '25 minutes',
        icon: 'shield-alt',
        completed: false
      }
    ];

    return modules.map(module => `
      <div class="col-lg-4 col-md-6">
        <div class="enhanced-module-card" data-module-id="${module.id}">
          <div class="module-status-badge not-started">Not Started</div>
          
          <div class="module-card-header">
            <div class="d-flex align-items-center gap-3 mb-3">
              <div class="learning-module-icon">
                <i class="fa-solid fa-${module.icon}"></i>
              </div>
              <div>
                <h3 class="learning-module-title mb-1">${module.title}</h3>
                <span class="badge bg-primary fs-6">${module.difficulty}</span>
              </div>
            </div>
          </div>

          <div class="module-card-body">
            <p class="learning-module-description mb-4">${module.description}</p>
            
            <div class="learning-module-meta mb-4">
              <div class="learning-module-meta-item">
                <i class="fa-solid fa-clock"></i>
                <span>${module.estimatedTime}</span>
              </div>
              <div class="learning-module-meta-item">
                <i class="fa-solid fa-question-circle"></i>
                <span>5 questions</span>
              </div>
            </div>

            <div class="module-progress-section">
              <div class="learning-progress-bar mb-3">
                <div class="learning-progress-fill" style="width: 0%"></div>
              </div>
              
              <button class="btn btn-primary w-100 module-start-btn" data-module-id="${module.id}">
                <i class="fa-solid fa-play"></i>
                Start Module
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  initializeLearningEvents() {
    document.querySelectorAll('.module-start-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const moduleId = e.target.dataset.moduleId;
        this.startModule(moduleId);
      });
    });
  }

  startModule(moduleId) {
    alert(`Demo: Module "${moduleId}" would start here. In the full version, this would launch an interactive quiz with real questions and progress tracking.`);
  }

  showSettings() {
    console.log('🔧 Opening settings modal...');
    const modal = document.getElementById('settingsModal');
    if (modal) {
      // Load current preferences
      this.loadUserPreferences();
      
      // Show modal using Bootstrap's data attributes or direct manipulation
      modal.classList.add('show');
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      
      // Add backdrop
      if (!document.querySelector('.modal-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.onclick = () => this.hideSettings();
        document.body.appendChild(backdrop);
      }
      
      // Add event handlers
      this.setupModalEventHandlers();
      
      console.log('✅ Settings modal opened');
    } else {
      console.error('❌ Settings modal not found');
    }
  }

  hideSettings() {
    console.log('🔧 Closing settings modal...');
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      
      // Remove backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      
      console.log('✅ Settings modal closed');
    }
  }

  setupModalEventHandlers() {
    // Close button
    const closeBtn = document.querySelector('#settingsModal .btn-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.hideSettings();
    }

    // Cancel button
    const cancelBtn = document.querySelector('#settingsModal .btn-secondary');
    if (cancelBtn) {
      cancelBtn.onclick = () => this.hideSettings();
    }

    // Save button
    const saveBtn = document.getElementById('saveUserSettings');
    if (saveBtn) {
      saveBtn.onclick = () => {
        this.saveUserPreferences();
        setTimeout(() => this.hideSettings(), 1500); // Close after showing success message
      };
    }

    // Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.hideSettings();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);

    console.log('✅ Modal event handlers setup');
  }

  loadUserPreferences() {
    // Load theme preference
    const theme = localStorage.getItem('epra_theme') || 'light';
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = theme;

    // Load language preference
    const lang = localStorage.getItem('epra_language') || 'en';
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) langSelect.value = lang;

    // Load notification preference
    const notifications = localStorage.getItem('epra_notifications') === 'true';
    const notifCheck = document.getElementById('notificationsEnabled');
    if (notifCheck) notifCheck.checked = notifications;

    // Load auto-save preference
    const autoSave = localStorage.getItem('epra_autosave') !== 'false';
    const autoSaveCheck = document.getElementById('autoSaveProgress');
    if (autoSaveCheck) autoSaveCheck.checked = autoSave;
  }

  saveUserPreferences() {
    // Save theme
    const theme = document.getElementById('themeSelect')?.value || 'light';
    localStorage.setItem('epra_theme', theme);
    document.documentElement.setAttribute('data-color-scheme', theme);

    // Save language
    const lang = document.getElementById('languageSelect')?.value || 'en';
    localStorage.setItem('epra_language', lang);
    document.getElementById('langSelect').value = lang;

    // Save notifications
    const notifications = document.getElementById('notificationsEnabled')?.checked || false;
    localStorage.setItem('epra_notifications', notifications);

    // Save auto-save
    const autoSave = document.getElementById('autoSaveProgress')?.checked || true;
    localStorage.setItem('epra_autosave', autoSave);

    // Show success message
    const status = document.getElementById('settingsStatus');
    if (status) {
      status.innerHTML = '<div class="alert alert-success"><i class="fa-solid fa-check me-2"></i>Preferences saved successfully!</div>';
      setTimeout(() => {
        status.innerHTML = '';
      }, 3000);
    }

    console.log('✅ User preferences saved');
  }

  showLoginModal() {
    // Create a real login modal
    const loginModalHTML = `
      <div class="modal fade" id="loginModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Sign In to EPRA Learning</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div id="loginError" class="alert alert-danger d-none">
                <i class="fa-solid fa-exclamation-circle me-2"></i>
                <span id="loginErrorText"></span>
              </div>
              <div class="alert alert-info">
                <i class="fa-solid fa-info-circle me-2"></i>
                Use admin credentials to access full functionality.
              </div>
              <form id="loginForm">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" id="loginEmail" class="form-control" placeholder="admin@epra.com" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" id="loginPassword" class="form-control" placeholder="Enter your password" required>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" form="loginForm" class="btn btn-primary" id="loginBtn">
                <span class="login-btn-text">Sign In</span>
                <span class="login-btn-spinner spinner-border spinner-border-sm d-none ms-2"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('loginModal');
    if (existingModal) {
      existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', loginModalHTML);
    
    // Show modal manually (like settings modal)
    const modal = document.getElementById('loginModal');
    modal.classList.add('show');
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    document.body.appendChild(backdrop);
    
    // Add click handler to modal itself to close only when clicking outside content
    modal.onclick = (e) => {
      if (e.target === modal) {
        this.hideLoginModal();
      }
    };
    
    // Setup event handlers
    this.setupLoginModalHandlers();

    // Handle real login - use setTimeout to ensure DOM is ready
    setTimeout(() => {
      const loginForm = document.getElementById('loginForm');
      if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          await this.performLogin();
        });
      }
      
      // Focus on email field
      const emailField = document.getElementById('loginEmail');
      if (emailField) {
        emailField.focus();
      }
    }, 100);
  }

  async performLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.querySelector('.login-btn-text');
    const loginSpinner = document.querySelector('.login-btn-spinner');
    const loginError = document.getElementById('loginError');

    // Show loading state
    loginBtn.disabled = true;
    loginBtnText.textContent = 'Signing In...';
    loginSpinner.classList.remove('d-none');
    loginError.classList.add('d-none');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Store tokens
        localStorage.setItem('epra_access_token', data.data.tokens.accessToken);
        localStorage.setItem('epra_refresh_token', data.data.tokens.refreshToken);
        localStorage.setItem('epra_user', JSON.stringify(data.data.user));

        // Update app state
        this.isAuthenticated = true;
        this.currentUser = data.data.user;
        this.accessToken = data.data.tokens.accessToken;

        // Update UI
        this.updateAuthUI();
        
        // Close modal
        this.hideLoginModal();

        // Reload current view to show authenticated features
        this.loadView(this.currentView);

        console.log('✅ Login successful:', data.data.user);

      } else {
        // Show error
        document.getElementById('loginErrorText').textContent = data.message || 'Login failed';
        loginError.classList.remove('d-none');
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      document.getElementById('loginErrorText').textContent = 'Network error. Please check your connection.';
      loginError.classList.remove('d-none');

    } finally {
      // Reset button state
      loginBtn.disabled = false;
      loginBtnText.textContent = 'Sign In';
      loginSpinner.classList.add('d-none');
    }
  }

  updateAuthUI() {
    const authPrompt = document.getElementById('authPrompt');
    const loginPromptBtn = document.getElementById('loginPromptBtn');

    if (this.isAuthenticated && this.currentUser) {
      if (authPrompt) {
        authPrompt.textContent = `Welcome back, ${this.currentUser.firstName}! Full functionality is available.`;
      }
      if (loginPromptBtn) {
        loginPromptBtn.style.display = 'none';
      }
    }
  }

  async initializeAuth() {
    // Check for existing real auth tokens
    const accessToken = localStorage.getItem('epra_access_token');
    const userData = localStorage.getItem('epra_user');
    
    if (accessToken && userData) {
      try {
        // Verify token is still valid
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.isAuthenticated = true;
          this.currentUser = data.data.user;
          this.accessToken = accessToken;
          this.updateAuthUI();
          console.log('✅ Authentication restored from localStorage');
        } else {
          // Token expired or invalid, try to refresh
          await this.refreshToken();
        }
      } catch (error) {
        console.log('⚠️ Auth verification failed, clearing stored auth');
        this.clearAuth();
      }
    }
  }

  toggleDarkMode() {
    const html = document.documentElement;
    const currentScheme = html.getAttribute('data-color-scheme');
    const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-color-scheme', newScheme);
    localStorage.setItem('epra_color_scheme', newScheme);
    
    const darkToggle = document.getElementById('darkToggle');
    if (darkToggle) {
      const icon = darkToggle.querySelector('i');
      if (icon) {
        icon.className = newScheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
    }
  }

  changeLanguage(lang) {
    console.log(`🌐 Language changed to: ${lang}`);
    localStorage.setItem('epra_language', lang);
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('epra_refresh_token');
    if (!refreshToken) {
      this.clearAuth();
      return;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('epra_access_token', data.data.tokens.accessToken);
        localStorage.setItem('epra_refresh_token', data.data.tokens.refreshToken);
        this.accessToken = data.data.tokens.accessToken;
        console.log('✅ Token refreshed successfully');
      } else {
        this.clearAuth();
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.clearAuth();
    }
  }

  clearAuth() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.accessToken = null;
    localStorage.removeItem('epra_access_token');
    localStorage.removeItem('epra_refresh_token');
    localStorage.removeItem('epra_user');
    this.updateAuthUI();
    this.loadView(this.currentView);
    console.log('🔓 Authentication cleared');
  }

  hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      
      // Remove backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      
      // Remove modal from DOM
      modal.remove();
    }
  }

  setupLoginModalHandlers() {
    setTimeout(() => {
      // Close button
      const closeBtn = document.querySelector('#loginModal .btn-close');
      if (closeBtn) {
        closeBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.hideLoginModal();
        };
      }

      // Cancel button
      const cancelBtn = document.querySelector('#loginModal .btn-secondary');
      if (cancelBtn) {
        cancelBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.hideLoginModal();
        };
      }

      console.log('✅ Login modal handlers attached');
    }, 50);

    // Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.hideLoginModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }
}

// Initialize the app
window.epraApp = new EPRAUnifiedApp();

// Make it globally available
window.app = window.epraApp;

console.log('🎉 EPRA Unified App loaded successfully!');