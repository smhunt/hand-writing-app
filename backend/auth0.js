const { auth, requiresAuth } = require('express-openid-connect');
require('dotenv').config();

// Auth0 configuration
const auth0Config = {
  authRequired: false, // We'll handle auth on specific routes
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL || 'http://localhost:5001',
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  authorizationParams: {
    response_type: 'code',
    audience: process.env.AUTH0_AUDIENCE || undefined,
    scope: 'openid profile email',
  },
  routes: {
    login: '/api/login',
    logout: '/api/logout',
    callback: '/api/callback',
  },
  session: {
    rolling: true,
    rollingDuration: 24 * 60 * 60, // 24 hours
  },
};

// Middleware to extract user info from Auth0 session
function getUserFromAuth0(req, res, next) {
  if (req.oidc && req.oidc.isAuthenticated()) {
    // Map Auth0 user to our session format
    req.session.auth0User = req.oidc.user;
    req.session.userId = req.oidc.user.sub; // Auth0 user ID
    req.session.username = req.oidc.user.email || req.oidc.user.name;
  }
  next();
}

module.exports = {
  auth0Middleware: auth(auth0Config),
  requiresAuth,
  getUserFromAuth0,
  auth0Config,
};
