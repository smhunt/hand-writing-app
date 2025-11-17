# Project Context for Claude Code

## Project Overview
This is a full-stack web application that transforms handwriting into digital notes using OCR and PDF generation.

## Current State
- ✅ Complete backend API (Node.js/Express)
- ✅ Complete frontend (React)
- ✅ Docker configuration
- ✅ Basic tests
- ✅ Documentation

## Active Development Areas
- Image processing optimization (OpenCV)
- UI/UX improvements
- Additional features from spec

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
1. Improve OpenCV processing
2. Enhance UI with Tailwind CSS
3. Add more character support
4. Create marketing materials
