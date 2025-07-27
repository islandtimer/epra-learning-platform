/**
 * Authentication Management for EPRA Frontend
 * Handles user registration, login, logout, and session management
 */

class AuthManager {
  constructor(apiClient) {
    this.api = apiClient;
    this.currentUser = null;
    this.initializeAuth();
  }

  async initializeAuth() {
    // Check if user is already authenticated
    if (this.api.isAuthenticated()) {
      try {
        await this.verifyToken();
      } catch (error) {
        console.warn('Token verification failed:', error);
        this.api.clearTokens();
      }
    }
  }

  async verifyToken() {
    try {
      const response = await this.api.request('/auth/verify');
      if (response.success) {
        this.currentUser = response.data.user;
        return true;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
    return false;
  }

  async login(email, password) {
    try {
      const user = await this.api.login(email, password);
      this.currentUser = user;
      
      // Update UI to reflect authenticated state
      this.updateAuthUI(true);
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const user = await this.api.register(userData);
      this.currentUser = user;
      
      // Update UI to reflect authenticated state
      this.updateAuthUI(true);
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await this.api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.currentUser = null;
      this.updateAuthUI(false);
    }
  }

  isAuthenticated() {
    return this.api.isAuthenticated() && this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  updateAuthUI(isAuthenticated) {
    // Update demo banner
    const demoBanner = document.getElementById('demoBanner');
    if (demoBanner) {
      if (isAuthenticated) {
        demoBanner.style.display = 'none';
      } else {
        demoBanner.style.display = 'block';
      }
    }

    // Update navigation
    this.updateNavigation(isAuthenticated);
    
    // Trigger custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isAuthenticated, user: this.currentUser } 
    }));
  }

  updateNavigation(isAuthenticated) {
    // This would be implemented based on your navigation structure
    // For now, we'll add a basic user indicator
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Remove existing user info
    const existingUserInfo = navbar.querySelector('.user-info');
    if (existingUserInfo) {
      existingUserInfo.remove();
    }

    if (isAuthenticated && this.currentUser) {
      // Add user info to navbar
      const userInfo = document.createElement('div');
      userInfo.className = 'user-info d-flex align-items-center gap-2 ms-2';
      userInfo.innerHTML = `
        <span class="text-light small">
          ${this.currentUser.firstName} ${this.currentUser.lastName}
        </span>
        <button class="btn btn-outline-light btn-sm" id="logoutBtn">
          <i class="fa-solid fa-sign-out-alt"></i>
        </button>
      `;

      const navbarActions = navbar.querySelector('.d-flex.align-items-center.gap-2');
      if (navbarActions) {
        navbarActions.appendChild(userInfo);
        
        // Add logout handler
        const logoutBtn = userInfo.querySelector('#logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => this.logout());
        }
      }
    }
  }

  // Show login modal
  showLoginModal() {
    const loginModal = this.createLoginModal();
    document.body.appendChild(loginModal);
    
    const modal = new bootstrap.Modal(loginModal);
    modal.show();
    
    // Remove modal from DOM when hidden
    loginModal.addEventListener('hidden.bs.modal', () => {
      loginModal.remove();
    });
  }

  createLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'loginModal';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-sign-in-alt me-2"></i>Sign In to EPRA
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="loginForm">
              <div class="mb-3">
                <label for="loginEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="loginEmail" required>
              </div>
              <div class="mb-3">
                <label for="loginPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="loginPassword" required>
              </div>
              <div id="loginError" class="alert alert-danger d-none"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="loginSubmit">
              <i class="fa-solid fa-sign-in-alt me-2"></i>Sign In
            </button>
            <button type="button" class="btn btn-link" id="showRegister">
              Don't have an account? Register
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    const loginForm = modal.querySelector('#loginForm');
    const loginSubmit = modal.querySelector('#loginSubmit');
    const loginError = modal.querySelector('#loginError');
    const showRegister = modal.querySelector('#showRegister');

    const handleLogin = async () => {
      const email = modal.querySelector('#loginEmail').value;
      const password = modal.querySelector('#loginPassword').value;

      if (!email || !password) {
        this.showError(loginError, 'Please fill in all fields');
        return;
      }

      try {
        loginSubmit.disabled = true;
        loginSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Signing In...';

        await this.login(email, password);
        
        // Close modal on success
        bootstrap.Modal.getInstance(modal).hide();
        
      } catch (error) {
        this.showError(loginError, error.message);
      } finally {
        loginSubmit.disabled = false;
        loginSubmit.innerHTML = '<i class="fa-solid fa-sign-in-alt me-2"></i>Sign In';
      }
    };

    loginSubmit.addEventListener('click', handleLogin);
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });

    showRegister.addEventListener('click', () => {
      bootstrap.Modal.getInstance(modal).hide();
      setTimeout(() => this.showRegisterModal(), 300);
    });

    return modal;
  }

  createRegisterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'registerModal';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-user-plus me-2"></i>Register for EPRA
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="registerForm">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="registerFirstName" class="form-label">First Name</label>
                  <input type="text" class="form-control" id="registerFirstName" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="registerLastName" class="form-label">Last Name</label>
                  <input type="text" class="form-control" id="registerLastName" required>
                </div>
              </div>
              <div class="mb-3">
                <label for="registerEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="registerEmail" required>
              </div>
              <div class="mb-3">
                <label for="registerOrganization" class="form-label">Organization</label>
                <input type="text" class="form-control" id="registerOrganization">
              </div>
              <div class="mb-3">
                <label for="registerPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="registerPassword" required>
                <div class="form-text">At least 8 characters with uppercase, lowercase, and number</div>
              </div>
              <div id="registerError" class="alert alert-danger d-none"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="registerSubmit">
              <i class="fa-solid fa-user-plus me-2"></i>Register
            </button>
            <button type="button" class="btn btn-link" id="showLogin">
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    const registerForm = modal.querySelector('#registerForm');
    const registerSubmit = modal.querySelector('#registerSubmit');
    const registerError = modal.querySelector('#registerError');
    const showLogin = modal.querySelector('#showLogin');

    const handleRegister = async () => {
      const firstName = modal.querySelector('#registerFirstName').value;
      const lastName = modal.querySelector('#registerLastName').value;
      const email = modal.querySelector('#registerEmail').value;
      const organization = modal.querySelector('#registerOrganization').value;
      const password = modal.querySelector('#registerPassword').value;

      if (!firstName || !lastName || !email || !password) {
        this.showError(registerError, 'Please fill in all required fields');
        return;
      }

      try {
        registerSubmit.disabled = true;
        registerSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Registering...';

        await this.register({ firstName, lastName, email, organization, password });
        
        // Close modal on success
        bootstrap.Modal.getInstance(modal).hide();
        
      } catch (error) {
        this.showError(registerError, error.message);
      } finally {
        registerSubmit.disabled = false;
        registerSubmit.innerHTML = '<i class="fa-solid fa-user-plus me-2"></i>Register';
      }
    };

    registerSubmit.addEventListener('click', handleRegister);
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRegister();
    });

    showLogin.addEventListener('click', () => {
      bootstrap.Modal.getInstance(modal).hide();
      setTimeout(() => this.showLoginModal(), 300);
    });

    return modal;
  }

  showRegisterModal() {
    const registerModal = this.createRegisterModal();
    document.body.appendChild(registerModal);
    
    const modal = new bootstrap.Modal(registerModal);
    modal.show();
    
    // Remove modal from DOM when hidden
    registerModal.addEventListener('hidden.bs.modal', () => {
      registerModal.remove();
    });
  }

  showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.remove('d-none');
    setTimeout(() => {
      errorElement.classList.add('d-none');
    }, 5000);
  }

  // Check if authentication is required for current action
  requireAuth(callback) {
    if (this.isAuthenticated()) {
      callback();
    } else {
      this.showLoginModal();
    }
  }
}

// Export for use in main application
window.AuthManager = AuthManager;