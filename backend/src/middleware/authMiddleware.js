const JWTUtil = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = JWTUtil.extractTokenFromHeader(authHeader);
    const decoded = JWTUtil.verifyAccessToken(token);
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    req.user = user;
    next();
    
  } catch (error) {
    logger.warn('Authentication failed:', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(401).json({
      success: false,
      message: 'Invalid or expired access token'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      logger.warn('Authorization failed:', {
        userId: req.user.id,
        userRole,
        requiredRoles: allowedRoles,
        endpoint: req.originalUrl
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = JWTUtil.extractTokenFromHeader(authHeader);
    const decoded = JWTUtil.verifyAccessToken(token);
    
    const user = await User.findById(decoded.id);
    req.user = user || null;
    
    next();
    
  } catch (error) {
    // For optional auth, we don't fail on invalid tokens
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};