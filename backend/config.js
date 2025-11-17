/**
 * Configuration Module
 *
 * Centralized configuration management for the application
 * Loads environment variables with defaults and validation
 */

require('dotenv').config();

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Server
  server: {
    port: parseInt(process.env.PORT, 10) || 5000,
    host: process.env.HOST || '0.0.0.0',
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'keyboard-cat-change-in-production',
    cookieMaxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE, 10) || 86400000, // 24 hours
    secure: process.env.ENABLE_HTTPS === 'true',
  },

  // OpenCV
  opencv: {
    usePython: process.env.USE_PYTHON_OPENCV === 'true',
    pythonExecutable: process.env.PYTHON_EXECUTABLE || 'python3',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    dir: process.env.LOG_DIR || 'logs',
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/png', 'image/jpeg', 'application/pdf'],
  },

  // PDF Generation
  pdf: {
    defaultPaperSize: process.env.DEFAULT_PAPER_SIZE || 'Letter',
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
    enableHttps: process.env.ENABLE_HTTPS === 'true',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    enabled: process.env.ENABLE_CORS !== 'false',
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    enabled: process.env.ENABLE_RATE_LIMIT !== 'false',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 min
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};

// Validation
if (config.isProduction) {
  if (config.session.secret === 'keyboard-cat-change-in-production') {
    console.warn('⚠️  WARNING: Using default SESSION_SECRET in production!');
  }

  if (!config.security.enableHttps) {
    console.warn('⚠️  WARNING: HTTPS is not enabled in production!');
  }
}

module.exports = config;
