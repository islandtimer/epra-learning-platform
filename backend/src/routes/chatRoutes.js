const express = require('express');
const { body, param } = require('express-validator');
const ChatSession = require('../models/ChatSession');
const { authenticateToken } = require('../middleware/authMiddleware');
const { handleValidationErrors, validatePagination } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const createSessionValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters')
];

const addMessageValidation = [
  body('role')
    .isIn(['user', 'assistant'])
    .withMessage('Role must be either user or assistant'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Content must be between 1 and 50000 characters'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

const updateTitleValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters')
];

// Create new chat session
router.post('/sessions', authenticateToken, createSessionValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title = 'New Chat' } = req.body;
    
    const session = await ChatSession.create(userId, title);
    
    logger.info('Chat session created', {
      userId,
      sessionId: session.id,
      title
    });
    
    res.status(201).json({
      success: true,
      message: 'Chat session created successfully',
      data: session
    });
  } catch (error) {
    logger.error('Failed to create chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat session'
    });
  }
});

// Get user's chat sessions
router.get('/sessions', authenticateToken, validatePagination, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit } = req.pagination;
    
    const sessions = await ChatSession.getUserSessions(userId, limit);
    
    res.json({
      success: true,
      data: sessions.map(session => ({
        ...session,
        message_count: parseInt(session.message_count),
        last_message_at: session.last_message_at
      }))
    });
  } catch (error) {
    logger.error('Failed to get chat sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat sessions'
    });
  }
});

// Get specific chat session
router.get('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    
    const session = await ChatSession.findById(sessionId, userId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('Failed to get chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat session'
    });
  }
});

// Update chat session title
router.patch('/sessions/:id', authenticateToken, updateTitleValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { title } = req.body;
    
    const session = await ChatSession.updateTitle(sessionId, userId, title);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    logger.info('Chat session title updated', {
      userId,
      sessionId,
      newTitle: title
    });
    
    res.json({
      success: true,
      message: 'Session title updated successfully',
      data: session
    });
  } catch (error) {
    logger.error('Failed to update chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat session'
    });
  }
});

// Delete chat session
router.delete('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    
    const deletedSession = await ChatSession.delete(sessionId, userId);
    
    if (!deletedSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    logger.info('Chat session deleted', {
      userId,
      sessionId
    });
    
    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session'
    });
  }
});

// Add message to chat session
router.post('/sessions/:id/messages', authenticateToken, addMessageValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { role, content, metadata = {} } = req.body;
    
    // Verify session belongs to user
    const session = await ChatSession.findById(sessionId, userId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    const message = await ChatSession.addMessage(sessionId, role, content, metadata);
    
    logger.info('Message added to chat session', {
      userId,
      sessionId,
      messageId: message.id,
      role,
      contentLength: content.length
    });
    
    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      data: {
        ...message,
        metadata: typeof message.metadata === 'string' ? JSON.parse(message.metadata) : message.metadata
      }
    });
  } catch (error) {
    logger.error('Failed to add message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message'
    });
  }
});

// Get messages for chat session
router.get('/sessions/:id/messages', authenticateToken, validatePagination, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { limit } = req.pagination;
    
    const messages = await ChatSession.getMessages(sessionId, userId, limit);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    if (error.message === 'Session not found or access denied') {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    logger.error('Failed to get messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages'
    });
  }
});

// Get chat statistics for user
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await ChatSession.getSessionStats(userId);
    
    res.json({
      success: true,
      data: {
        totalSessions: parseInt(stats.total_sessions),
        totalMessages: parseInt(stats.total_messages),
        avgMessagesPerSession: Math.round(parseFloat(stats.avg_messages_per_session))
      }
    });
  } catch (error) {
    logger.error('Failed to get chat stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat statistics'
    });
  }
});

module.exports = router;