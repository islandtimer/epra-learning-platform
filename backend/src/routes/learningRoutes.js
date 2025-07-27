const express = require('express');
const { body, param } = require('express-validator');
const LearningProgress = require('../models/LearningProgress');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { handleValidationErrors, validatePagination } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const progressValidation = [
  body('moduleId')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Module ID is required and must be less than 100 characters'),
  body('score')
    .isInt({ min: 0 })
    .withMessage('Score must be a non-negative integer'),
  body('totalQuestions')
    .isInt({ min: 1 })
    .withMessage('Total questions must be a positive integer'),
  body('completed')
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer')
];

// Get user's learning progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await LearningProgress.getUserProgress(userId);
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.error('Failed to get user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve progress'
    });
  }
});

// Get progress for specific module
router.get('/progress/:moduleId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    
    const progress = await LearningProgress.getModuleProgress(userId, moduleId);
    
    if (!progress) {
      return res.json({
        success: true,
        data: {
          score: 0,
          completed: false,
          attempts: 0,
          time_spent: 0
        }
      });
    }
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.error('Failed to get module progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve module progress'
    });
  }
});

// Update learning progress
router.post('/progress', authenticateToken, progressValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleId, score, totalQuestions, completed, timeSpent = 0 } = req.body;
    
    const progress = await LearningProgress.updateProgress(userId, moduleId, {
      score,
      totalQuestions,
      completed,
      timeSpent
    });
    
    logger.info('Learning progress updated', {
      userId,
      moduleId,
      score,
      completed,
      attempts: progress.attempts
    });
    
    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: progress
    });
  } catch (error) {
    logger.error('Failed to update progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await LearningProgress.getUserStats(userId);
    
    res.json({
      success: true,
      data: {
        modulesStarted: parseInt(stats.modules_started),
        modulesCompleted: parseInt(stats.modules_completed),
        averageScore: Math.round(parseFloat(stats.average_score)),
        totalTimeSpent: parseInt(stats.total_time_spent),
        completionRate: stats.modules_started > 0 
          ? Math.round((stats.modules_completed / stats.modules_started) * 100)
          : 0
      }
    });
  } catch (error) {
    logger.error('Failed to get user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { limit } = req.pagination;
    const leaderboard = await LearningProgress.getLeaderboard(limit);
    
    res.json({
      success: true,
      data: leaderboard.map(entry => ({
        name: `${entry.first_name} ${entry.last_name}`,
        organization: entry.organization,
        completedModules: parseInt(entry.completed_modules),
        averageScore: Math.round(parseFloat(entry.average_score)),
        totalTimeSpent: parseInt(entry.total_time_spent)
      }))
    });
  } catch (error) {
    logger.error('Failed to get leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard'
    });
  }
});

// Admin endpoints
router.get('/admin/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const globalStats = await LearningProgress.getGlobalStats();
    
    res.json({
      success: true,
      data: globalStats
    });
  } catch (error) {
    logger.error('Failed to get global stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve global statistics'
    });
  }
});

// Delete user progress (for user account deletion)
router.delete('/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await LearningProgress.deleteUserProgress(userId);
    
    logger.info('User progress deleted', { userId });
    
    res.json({
      success: true,
      message: 'Progress deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete progress'
    });
  }
});

module.exports = router;