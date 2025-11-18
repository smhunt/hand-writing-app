const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const config = require('./config');
const logger = require('./logger');
const { requestLogger, addRequestTime } = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const { auth0Middleware, getUserFromAuth0 } = require('./auth0');
const profileRoutes = require('./profile');
const generateRoutes = require('./generate');
const fontRoutes = require('./routes/font');

// Initialize Express
const app = express();

// Trust proxy (for React dev server proxy and session cookies)
app.set('trust proxy', 1);

// Security headers (Helmet)
if (config.isProduction) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  }));
  logger.info('Production security headers enabled');
} else {
  // Development mode - relaxed security headers
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
}

// Request timing and logging
// Temporarily disabled custom logger
// app.use(addRequestTime);
// app.use(requestLogger);

// CORS middleware
if (config.cors.enabled) {
  app.use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  logger.info(`CORS enabled for origins: ${config.cors.origin.join(', ')}`);
}

// Rate limiting (before body parsing to save resources)
// Disabled in development due to proxy issues
if (config.rateLimit.enabled && config.isProduction) {
  app.use('/api', apiLimiter);
  logger.info(`Rate limiting enabled: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs / 1000}s`);
} else if (!config.isProduction) {
  logger.info('Rate limiting disabled in development');
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Auth0 authentication middleware
app.use(auth0Middleware);
app.use(getUserFromAuth0);

// Session middleware for additional session data
app.use(session({
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: config.session.cookieMaxAge,
    sameSite: config.isProduction ? 'strict' : 'lax',
  },
  proxy: true,
}));

app.use(function(req, res, next) {
  // Simple middleware to protect routes: if not logged in, block access to protected APIs
  const publicPaths = ['/api/login', '/api/logout', '/api/callback', '/api/template', '/api/health'];

  // Check if user is authenticated via Auth0
  const isAuthenticated = req.oidc && req.oidc.isAuthenticated();

  if (!publicPaths.includes(req.path) && !isAuthenticated) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
});

// Serve static files (for uploaded images and template PDF)
app.use('/uploads', express.static(path.join(__dirname, 'data/uploads')));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Auth0 routes are automatically handled by auth0Middleware
// Add a profile endpoint to get current user info
app.get('/api/user', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.json({
      user: {
        id: req.oidc.user.sub,
        username: req.oidc.user.email || req.oidc.user.name,
        email: req.oidc.user.email,
        name: req.oidc.user.name,
        picture: req.oidc.user.picture,
      }
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Routes
app.use('/api', profileRoutes);
app.use('/api', generateRoutes);
app.use('/api/font', fontRoutes);

// Enhanced health check endpoint
app.get('/api/health', (req, res) => {
  const healthcheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    memory: {
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
    },
    cpu: process.cpuUsage(),
  };

  res.status(200).json(healthcheck);
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server only if not being required for testing
if (require.main === module) {
  app.listen(config.server.port, config.server.host, () => {
    logger.info(`Backend server listening on ${config.server.host}:${config.server.port}`);
    logger.info(`Environment: ${config.env}`);
    logger.info(`HTTPS enabled: ${config.security.enableHttps}`);
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export for testing
module.exports = app;
