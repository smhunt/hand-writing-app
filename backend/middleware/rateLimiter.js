/**
 * Rate Limiting Middleware
 *
 * Protects API endpoints from abuse and brute force attacks
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../logger');

/**
 * General API rate limiter
 * Applies to all API requests
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on path: ${req.path}`);
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  },
});

/**
 * Strict rate limiter for login attempts
 * Prevents brute force password attacks
 */
const loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 5, // 5 login attempts per window
  message: {
    error: 'Too many login attempts, please try again later.',
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    logger.warn(`Login rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many login attempts. Please try again in 15 minutes.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  },
});

/**
 * Strict rate limiter for registration attempts
 * Prevents spam account creation
 */
const registerLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 3, // 3 registration attempts per window
  message: {
    error: 'Too many registration attempts, please try again later.',
  },
  handler: (req, res) => {
    logger.warn(`Registration rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many registration attempts. Please try again in 15 minutes.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  },
});

/**
 * Moderate rate limiter for file uploads
 * Prevents storage abuse
 */
const uploadLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 10, // 10 uploads per window
  message: {
    error: 'Too many upload attempts, please try again later.',
  },
  handler: (req, res) => {
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many upload attempts. Please try again in 15 minutes.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  },
});

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  uploadLimiter,
};
