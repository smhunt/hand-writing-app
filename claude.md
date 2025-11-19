# Claude TODO List

## Project: Handwritten Note Web App

## Port Management

**IMPORTANT**: To avoid port conflicts, use these commands:

```bash
# Check what's running
lsof -ti:3000 -ti:5001

# Clean all ports (nuclear option)
lsof -ti:3000 -ti:5001 | xargs kill -9

# Start backend only
cd backend && PORT=5001 node server.js

# Start frontend only (in separate terminal)
cd frontend && BROWSER=none npm start

# Start both (recommended - use two terminals)
# Terminal 1:
cd backend && PORT=5001 node server.js

# Terminal 2:
cd frontend && BROWSER=none npm start
```

**Port Configuration**:
- Backend: `5001` (NOT 5000 - conflicts with macOS AirPlay)
- Frontend: `3000` (React dev server)
- Proxy: Frontend proxies API requests to backend via `package.json`

### Current Branch

**Branch**: `feature/auth0-integration`
**Status**: Multiple font management and character centering features complete
**Ready for**: Testing and merge to main

### Pending Tasks

#### Add CI/GitHub Setup
- **Priority**: Medium
- **Description**: Configure GitHub Secrets and optional GitHub Actions workflow
- **Tasks**:
  - Add GitHub Secrets for Auth0 credentials
  - Create workflow for tests
  - Optional deployment pipeline
  - Add deployment documentation

#### Production Deployment
- **Priority**: Medium
- **Description**: Deploy application to production environment
- **Tasks**:
  - Choose hosting provider (Vercel, Railway, AWS, etc.)
  - Set up production Auth0 application
  - Configure production environment variables
  - Set up SSL/TLS certificates
  - Configure production domains in Auth0
  - Test production deployment

#### Enhanced Testing
- **Priority**: Low
- **Description**: Add comprehensive test coverage
- **Tasks**:
  - Add E2E tests for Auth0 flow
  - Add tests for font generation
  - Add tests for drawing workflow
  - Improve test coverage to >80%

### Completed Tasks

#### Infrastructure
- ✅ Initialize Git repository
- ✅ Create GitHub repository (https://github.com/smhunt/hand-writing-app)
- ✅ Push initial commit to remote
- ✅ Port management system (backend on 5001, frontend on 3000)
- ✅ Fixed proxy configuration for React dev server
- ✅ Session persistence (24-hour sessions with rolling renewal)
- ✅ Disabled rate limiting in development (prevent false throttling)
- ✅ **Auth0 Authentication Integration**
  - ✅ Backend: express-openid-connect middleware
  - ✅ Frontend: @auth0/auth0-react SDK with Universal Login
  - ✅ Auto-provisioning for new Auth0 users
  - ✅ Environment configuration with .env.example files
  - ✅ Login, logout, callback endpoints
  - ✅ Protected routes with authentication checks
  - ✅ **Dev mode with mock user** (Auth0 disabled for development)
- ✅ **Font Generation Feature**
  - ✅ TTF (TrueType) font export for desktop
  - ✅ WOFF2 web font export
  - ✅ **Multiple font library support** (create & manage multiple fonts independently)
  - ✅ @font-face CSS generation
  - ✅ Font preview and character coverage info
  - ✅ Vector-based glyph generation
  - ✅ **Character normalization & centering** for consistent alignment
  - ✅ **Image-to-vector conversion** for scanned characters
- ✅ **Comprehensive Environment Configuration**
  - ✅ Centralized config.js for backend
  - ✅ .env.example files with all required variables
  - ✅ Development and production configurations

#### Drawing Workflow & Auto-Advance
- ✅ Modal auto-advance functionality (automatically loads next character after save)
- ✅ Next button auto-save (saves drawing before advancing)
- ✅ Progress tracker with 73-character grid (visual status for all glyphs)
- ✅ Smart character selection (Draw page starts on first incomplete character)
- ✅ Continuous drawing flow (draw multiple characters without closing modal)
- ✅ Canvas reset on character change

#### Bug Fixes
- ✅ Fixed backend crash bug (added error handling to storage.js)
- ✅ Fixed rate limiting issues causing "Server returned invalid response" after ~10 characters
- ✅ Fixed JSON response validation in DrawModal
- ✅ Fixed session cookie handling through React dev proxy
- ✅ Added comprehensive logging for debugging

#### Character Processing & Quality
- ✅ **Character Centering & Normalization**
  - ✅ Canvas-drawn characters normalized with 15px padding
  - ✅ Scanned characters centered within 200x200 canvas (20px margin)
  - ✅ Bounding box detection to trim whitespace
  - ✅ Proportional scaling to maintain character integrity
  - ✅ Consistent alignment across all glyphs in fonts
- ✅ **Template Scanning Improvements**
  - ✅ Python OpenCV-based character segmentation
  - ✅ Template guideline detection for better centering
  - ✅ Image-to-SVG vector conversion (image_to_svg.py)
  - ✅ Contour tracing for bitmap to vector conversion
  - ✅ Integration with font generation pipeline

#### Multiple Font Management System
- ✅ **Backend Font Library**
  - ✅ Create, list, rename, delete fonts (storage.js)
  - ✅ Font-specific character storage (each font has own character set)
  - ✅ Current/active font tracking per user
  - ✅ Default font protection (cannot be deleted)
  - ✅ Font metadata (name, creation date, character count)
- ✅ **Font Library API Endpoints**
  - ✅ `GET /api/fonts` - List all user fonts
  - ✅ `POST /api/fonts` - Create new font
  - ✅ `DELETE /api/fonts/:fontId` - Delete font
  - ✅ `PUT /api/fonts/:fontId` - Rename font
  - ✅ `POST /api/fonts/:fontId/select` - Set active font
  - ✅ `POST /api/fonts/:fontId/generate` - Generate font files
  - ✅ `GET /api/fonts/:fontId/download/:format` - Download TTF/WOFF2
- ✅ **Frontend Font Management UI**
  - ✅ Font Library section on Profile page
  - ✅ Visual current font indicator with character count
  - ✅ Create new font dialog with custom naming
  - ✅ Switch between fonts (affects all character drawing)
  - ✅ Inline font renaming with Save/Cancel
  - ✅ Font deletion with confirmation (protects default)
  - ✅ Auto-refresh UI after all operations
- ✅ **Font Generation Updates**
  - ✅ Support for fontId parameter in generation
  - ✅ Font files named as `userId_fontId.ttf`
  - ✅ Generate fonts from specific library character sets
  - ✅ Character save to current active font
  - ✅ Independent font file management

#### Testing
- ✅ API workflow tests (verified 20+ character saves work correctly)
- ✅ Edge case testing scripts (test-api-workflow.mjs, test-edge-cases.mjs)
- ✅ All tests passing: no crashes, no rate limiting, all responses JSON
- ✅ Character centering tested with template scanning (62 characters extracted)
- ✅ Image-to-vector conversion verified working
- ✅ Font library system tested (create, switch, rename, delete)

#### Multi-Project Automation (Future)
- **Priority**: Low (queue for later)
- **Description**: Create automation system to manage multiple projects across Mac
- **Ideas**:
  - Unified start/stop/status commands across all dev projects
  - Project switcher (computer-vision-monitor, hand-writing-app, etc.)
  - Port conflict detection and auto-resolution across projects
  - Global dev dashboard showing all projects at once
  - One command to start/stop entire dev environment
