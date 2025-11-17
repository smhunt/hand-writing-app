/**
 * Request Logging Middleware
 *
 * Logs all HTTP requests with timing and response information
 */

const morgan = require('morgan');
const logger = require('../logger');

// Create custom Morgan token for response time in ms
morgan.token('response-time-ms', (req, res) => {
  if (!req._startTime) return '0';
  const diff = process.hrtime(req._startTime);
  return ((diff[0] * 1e3) + (diff[1] * 1e-6)).toFixed(2);
});

// Custom format for Morgan
const morganFormat = ':method :url :status :response-time-ms ms - :res[content-length]';

// Morgan middleware using Winston stream
const requestLogger = morgan(morganFormat, {
  stream: logger.stream,
  skip: (req) => {
    // Skip health check endpoints in production
    if (process.env.NODE_ENV === 'production' && req.url === '/api/health') {
      return true;
    }
    return false;
  },
});

// Add request start time
const addRequestTime = (req, res, next) => {
  req._startTime = process.hrtime();
  next();
};

module.exports = {
  requestLogger,
  addRequestTime,
};
