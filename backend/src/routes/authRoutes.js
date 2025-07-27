const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const JWTUtil = require('../utils/jwt');
const { authenticateToken } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Organization must be less than 255 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register endpoint
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, organization } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      organization
    });

    // Create default user settings
    await UserSettings.create(user.id);

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    const { accessToken, refreshToken } = JWTUtil.generateTokens(tokenPayload);
    await JWTUtil.storeRefreshToken(user.id, refreshToken);

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      organization: user.organization
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          organization: user.organization,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    const { accessToken, refreshToken } = JWTUtil.generateTokens(tokenPayload);
    await JWTUtil.storeRefreshToken(user.id, refreshToken);

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          organization: user.organization,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const tokenData = await JWTUtil.verifyRefreshToken(refreshToken);
    
    // Generate new tokens
    const tokenPayload = {
      id: tokenData.user_id,
      email: tokenData.email,
      role: tokenData.role
    };
    
    const { accessToken, refreshToken: newRefreshToken } = JWTUtil.generateTokens(tokenPayload);
    
    // Revoke old refresh token and store new one
    await JWTUtil.revokeRefreshToken(refreshToken);
    await JWTUtil.storeRefreshToken(tokenData.user_id, newRefreshToken);

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      }
    });

  } catch (error) {
    logger.warn('Token refresh failed:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await JWTUtil.revokeRefreshToken(refreshToken);
    }

    logger.info('User logged out', { userId: req.user.id });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Logout from all devices
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    await JWTUtil.revokeAllUserTokens(req.user.id);

    logger.info('User logged out from all devices', { userId: req.user.id });

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    logger.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        organization: req.user.organization,
        role: req.user.role
      }
    }
  });
});

module.exports = router;