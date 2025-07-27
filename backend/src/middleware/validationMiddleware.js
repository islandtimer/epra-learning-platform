const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const commonValidations = {
  uuid: param('id').isUUID().withMessage('Invalid ID format'),
  email: body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: (field) => body(field)
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(`${field} is required and must be less than 100 characters`)
    .escape(),
  text: (field, min = 1, max = 5000) => body(field)
    .trim()
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`)
    .escape(),
  boolean: (field) => body(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be a boolean`),
  integer: (field, min = 0, max = Number.MAX_SAFE_INTEGER) => body(field)
    .isInt({ min, max })
    .withMessage(`${field} must be an integer between ${min} and ${max}`),
  array: (field) => body(field)
    .optional()
    .isArray()
    .withMessage(`${field} must be an array`)
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential script tags or dangerous HTML
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };
  
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

// Rate limiting validation
const validateRateLimit = () => {
  return (req, res, next) => {
    // Check if rate limit headers are present
    const remaining = req.get('X-RateLimit-Remaining');
    const limit = req.get('X-RateLimit-Limit');
    
    if (remaining !== undefined && parseInt(remaining) === 0) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        retryAfter: req.get('X-RateLimit-Reset')
      });
    }
    
    next();
  };
};

// Content type validation
const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return next();
    }
    
    const contentType = req.get('Content-Type');
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      return res.status(400).json({
        success: false,
        message: `Invalid content type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }
    
    next();
  };
};

// File upload validation
const validateFileUpload = (options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    required = false
  } = options;
  
  return (req, res, next) => {
    if (!req.files && required) {
      return res.status(400).json({
        success: false,
        message: 'File upload is required'
      });
    }
    
    if (req.files) {
      for (const file of Object.values(req.files)) {
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            message: `File size exceeds limit of ${maxSize / (1024 * 1024)}MB`
          });
        }
        
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
          });
        }
      }
    }
    
    next();
  };
};

// Pagination validation
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page number must be greater than 0'
    });
  }
  
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };
  
  next();
};

module.exports = {
  commonValidations,
  handleValidationErrors,
  sanitizeInput,
  validateRateLimit,
  validateContentType,
  validateFileUpload,
  validatePagination
};