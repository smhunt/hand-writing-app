# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added on feature/auth0-integration branch
- **Auth0 Universal Login** integration (2025-11-18)
  - express-openid-connect middleware for backend
  - @auth0/auth0-react SDK for frontend
  - Auto-provisioning for new Auth0 users
  - Secure session management with httpOnly cookies
  - Environment configuration with .env.example files
  - Complete Auth0 setup documentation in README

- **Font Generation Feature** (2025-11-17)
  - TTF (TrueType) font export for desktop use
  - WOFF2 web font export for websites
  - Multi-font library support (create & manage multiple fonts)
  - @font-face CSS generation
  - Font preview and character coverage information
  - Vector-based glyph generation from handwriting

- **Comprehensive Environment Configuration** (2025-11-17)
  - Centralized config.js for backend
  - .env.example files for both frontend and backend
  - Development and production configurations
  - Documentation for all environment variables

- **Documentation Updates** (2025-11-18)
  - Updated all markdown files to reflect Auth0 integration
  - Enhanced API documentation with Auth0 authentication flow
  - Updated architecture documentation
  - Added Auth0 setup guide to README
  - Updated CONTRIBUTING.md with Auth0 prerequisites
  - Created CHANGELOG.md

### Changed
- Replaced custom username/password authentication with Auth0
- Updated authentication flow diagrams and examples
- Modified API endpoints to use Auth0 session verification
- Enhanced security with Auth0's industry-standard OAuth2/OIDC

### Deprecated
- Custom `/api/register` endpoint (replaced by Auth0 signup)
- Custom `/api/login` endpoint (replaced by Auth0 Universal Login)
- Password hashing with bcrypt (now handled by Auth0)

## [0.2.0] - 2025-11-17

### Added
- Font generation feature (TTF/WOFF2)
- Multi-font library support
- Production-ready OpenCV Python implementation
- Comprehensive environment configuration
- Enhanced package.json metadata
- Landing page with marketing content

### Improved
- Drawing workflow with auto-advance
- Canvas reset on character change
- Progress tracker with 73-character grid
- Session persistence (24-hour sessions)
- Error handling and logging

### Fixed
- Backend crash bugs
- Rate limiting issues
- JSON response validation
- Session cookie handling through React proxy

## [0.1.0] - 2025-11-16 (Initial Release)

### Added
- Full-stack application architecture
- Backend API (Node.js/Express)
- Frontend application (React)
- Handwriting template generation
- Character segmentation with OpenCV
- PDF generation with handwriting rendering
- Canvas-based drawing interface
- Docker containerization
- Basic test suite
- Complete documentation

### Security
- Session-based authentication
- Input validation
- File upload restrictions
- Error handling middleware
- Security headers (Helmet)
- CORS configuration

## Branch Status

- **main**: Stable production code
- **feature/auth0-integration**: Auth0 integration (ready for merge)
  - ✅ Backend Auth0 integration complete
  - ✅ Frontend Auth0 integration complete
  - ✅ Documentation updated
  - ✅ Tests passing
  - 🔜 Ready for merge to main

## Upgrade Guide

### Migrating to Auth0 (from custom auth)

If you have an existing deployment with custom authentication:

1. **Create Auth0 account and application**
   - Follow setup in README.md

2. **Update environment variables**
   - Backend: Add `AUTH0_*` variables (see backend/.env.example)
   - Frontend: Add `REACT_APP_AUTH0_*` variables (see frontend/.env.example)

3. **User migration**
   - Existing users will need to sign up through Auth0
   - Auth0 provides migration tools if needed
   - User data is preserved; only authentication method changes

4. **Update callback URLs**
   - Configure Auth0 dashboard with your production URLs
   - Update CORS settings

5. **Deploy updated code**
   - Backend and frontend must be deployed together
   - Test authentication flow before full rollout

## Contributors

- Sean Hunt (@smhunt)
- Claude Code (AI pair programmer)

## License

MIT
