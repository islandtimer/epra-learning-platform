const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const { getUserUsageStats } = require('../middleware/usageMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Organization must be less than 255 characters')
];

const updateSettingsValidation = [
  body('language')
    .optional()
    .isIn(['en', 'es', 'fr', 'zh'])
    .withMessage('Language must be one of: en, es, fr, zh'),
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be either light or dark'),
  body('notificationsEnabled')
    .optional()
    .isBoolean()
    .withMessage('Notifications enabled must be a boolean')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organization: user.organization,
        role: user.role,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    logger.error('Failed to get user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
});

// Update user profile
router.patch('/profile', authenticateToken, updateProfileValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = {};
    
    // Map frontend field names to database field names
    if (req.body.firstName !== undefined) updates.first_name = req.body.firstName;
    if (req.body.lastName !== undefined) updates.last_name = req.body.lastName;
    if (req.body.organization !== undefined) updates.organization = req.body.organization;
    
    const updatedUser = await User.updateProfile(userId, updates);
    
    logger.info('User profile updated', {
      userId,
      updatedFields: Object.keys(updates)
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        organization: updatedUser.organization,
        role: updatedUser.role
      }
    });
  } catch (error) {
    logger.error('Failed to update profile:', error);
    res.status(500).json({
      success: false,
      message: error.message === 'No valid fields to update' ? error.message : 'Failed to update profile'
    });
  }
});

// Get user settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await UserSettings.getOrCreate(userId);
    
    res.json({
      success: true,
      data: {
        language: settings.language,
        theme: settings.theme,
        notificationsEnabled: settings.notifications_enabled
      }
    });
  } catch (error) {
    logger.error('Failed to get user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings'
    });
  }
});

// Update user settings
router.patch('/settings', authenticateToken, updateSettingsValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = {};
    
    // Map frontend field names to database field names
    if (req.body.language !== undefined) updates.language = req.body.language;
    if (req.body.theme !== undefined) updates.theme = req.body.theme;
    if (req.body.notificationsEnabled !== undefined) updates.notifications_enabled = req.body.notificationsEnabled;
    
    const settings = await UserSettings.update(userId, updates);
    
    logger.info('User settings updated', {
      userId,
      updatedFields: Object.keys(updates)
    });
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        language: settings.language,
        theme: settings.theme,
        notificationsEnabled: settings.notifications_enabled
      }
    });
  } catch (error) {
    logger.error('Failed to update settings:', error);
    res.status(500).json({
      success: false,
      message: error.message === 'No valid fields to update' ? error.message : 'Failed to update settings'
    });
  }
});

// Change password
router.post('/change-password', authenticateToken, changePasswordValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password hash
    const user = await User.findByEmail(req.user.email);
    
    // Verify current password
    const isCurrentPasswordValid = await User.verifyPassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    await User.changePassword(userId, newPassword);
    
    logger.info('User password changed', { userId });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Failed to change password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Get user usage statistics
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;
    
    const usage = await getUserUsageStats(userId, days);
    
    // Process usage data for frontend
    const processedUsage = {
      totalRequests: 0,
      totalTokens: 0,
      totalCostCents: 0,
      byProvider: {},
      byDate: {}
    };
    
    usage.forEach(row => {
      processedUsage.totalRequests += parseInt(row.requests);
      processedUsage.totalTokens += parseInt(row.tokens);
      processedUsage.totalCostCents += parseInt(row.cost_cents);
      
      if (!processedUsage.byProvider[row.provider]) {
        processedUsage.byProvider[row.provider] = {
          requests: 0,
          tokens: 0,
          costCents: 0
        };
      }
      
      processedUsage.byProvider[row.provider].requests += parseInt(row.requests);
      processedUsage.byProvider[row.provider].tokens += parseInt(row.tokens);
      processedUsage.byProvider[row.provider].costCents += parseInt(row.cost_cents);
      
      if (!processedUsage.byDate[row.date]) {
        processedUsage.byDate[row.date] = {
          requests: 0,
          tokens: 0,
          costCents: 0
        };
      }
      
      processedUsage.byDate[row.date].requests += parseInt(row.requests);
      processedUsage.byDate[row.date].tokens += parseInt(row.tokens);
      processedUsage.byDate[row.date].costCents += parseInt(row.cost_cents);
    });
    
    res.json({
      success: true,
      data: processedUsage
    });
  } catch (error) {
    logger.error('Failed to get usage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve usage statistics'
    });
  }
});

// Deactivate account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await User.deactivate(userId);
    
    logger.info('User account deactivated', { userId });
    
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    logger.error('Failed to deactivate account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account'
    });
  }
});

// Admin endpoints
router.get('/admin/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await User.getStats();
    
    res.json({
      success: true,
      data: {
        totalUsers: parseInt(stats.total_users),
        activeUsers: parseInt(stats.active_users),
        newUsers30d: parseInt(stats.new_users_30d)
      }
    });
  } catch (error) {
    logger.error('Failed to get user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics'
    });
  }
});

module.exports = router;