const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const logger = require('./logger');
const { requestLogger, addRequestTime } = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const generateRoutes = require('./generate');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Request timing and logging
app.use(addRequestTime);
app.use(requestLogger);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  // In production, use secure cookies, set cookie domain, etc.
}));

app.use(function(req, res, next) {
  // Simple middleware to protect routes: if not logged in, block access to protected APIs
  const publicPaths = ['/api/login', '/api/register', '/api/template', '/api/health'];
  if (!publicPaths.includes(req.path) && !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
});

// Serve static files (for uploaded images and template PDF)
app.use('/uploads', express.static(path.join(__dirname, 'data/uploads')));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', generateRoutes);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server only if not being required for testing
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Backend server listening on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
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
