/**
 * Error Handling Middleware
 *
 * Centralized error handling for Express application
 */

const logger = require('../logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to catch errors in async routes
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  const errorInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    statusCode,
    message,
    stack: err.stack,
    user: req.session?.userId || 'anonymous',
  };

  if (statusCode >= 500) {
    logger.error('Server Error', errorInfo);
  } else {
    logger.warn('Client Error', errorInfo);
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && { stack: err.stack }),
    ...(isDevelopment && { details: err }),
  });
};

/**
 * Validation error handler
 */
const validationError = (errors) => {
  const message = errors.map(err => err.msg).join(', ');
  return new ApiError(400, `Validation Error: ${message}`);
};

module.exports = {
  ApiError,
  asyncHandler,
  notFound,
  errorHandler,
  validationError,
};
