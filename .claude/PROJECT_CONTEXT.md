# Project Context for Claude Code

## Project Overview
This is a full-stack web application that transforms handwriting into digital notes using OCR and PDF generation.

## Current State
- ✅ Complete backend API (Node.js/Express)
- ✅ Complete frontend (React with Tailwind CSS)
- ✅ **Auth0 authentication** (Universal Login)
- ✅ **Font generation** (TTF/WOFF2 export)
- ✅ **Multi-font library** support
- ✅ Canvas-based drawing with auto-advance
- ✅ Docker configuration (dev + production)
- ✅ Comprehensive tests
- ✅ Complete documentation
- ✅ Production-ready OpenCV implementation

## Active Development Areas
- Production deployment preparation
- CI/CD pipeline setup
- Enhanced testing coverage
- Performance optimization

## Coding Conventions
- ES6+ JavaScript
- Functional React components with hooks
- Async/await for promises
- Comprehensive error handling
- JSDoc comments for functions

## Project Structure
```
backend/ - API server
frontend/ - React app
tests/ - Test files
docs/ - Documentation
scripts/ - Helper scripts
.claude/ - Claude Code metadata
```

## Common Tasks
See `.claude/tasks/` for agent task definitions

## Dependencies
- Backend: Express, Multer, PDFKit, bcrypt, OpenCV
- Frontend: React, React Router

## Testing
- Backend: Jest + Supertest
- Run: `./scripts/test.sh`

## Key Files to Know
- `backend/server.js` - API entry point
- `frontend/src/App.js` - React entry point
- `docs/API.md` - API reference
- `docs/ARCHITECTURE.md` - System design

## Current Priorities
1. Merge Auth0 feature branch to main
2. Set up CI/CD pipeline (GitHub Actions)
3. Production deployment
4. Enhanced test coverage
5. Performance monitoring and optimization
