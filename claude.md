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

### Pending Tasks

#### Add Auth0 Authentication
- **Priority**: High
- **Description**: Integrate Auth0 authentication into the handwriting app
- **Details**:
  - Choose stack (Next.js/Express/React SPA)
  - Add appropriate SDK (@auth0/nextjs-auth0, express-openid-connect, or @auth0/auth0-react)
  - Configure environment variables (AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, etc.)
  - Implement login/logout/profile endpoints
  - Test authentication flow
  - Add .env.example file
  - Update README with setup instructions
- **Resources**: 
  - Auth0 free tier: up to 7,500 MAUs
  - Official SDKs available for all major frameworks

#### Scaffold Auth Server (Optional)
- **Priority**: Medium
- **Description**: Create a minimal Express server using Auth0's express-openid-connect
- **Endpoints needed**: /login, /callback, /logout, /profile
- **Includes**: .env.example, README, and tests

#### Add CI/GitHub Setup
- **Priority**: Low
- **Description**: Configure GitHub Secrets and optional GitHub Actions workflow
- **Tasks**:
  - Add GitHub Secrets for Auth0 credentials
  - Create workflow for tests
  - Optional deployment pipeline

### Completed Tasks

#### Infrastructure
- ✅ Initialize Git repository
- ✅ Create GitHub repository (https://github.com/smhunt/hand-writing-app)
- ✅ Push initial commit to remote
- ✅ Port management system (backend on 5001, frontend on 3000)
- ✅ Fixed proxy configuration for React dev server
- ✅ Session persistence (24-hour sessions with rolling renewal)
- ✅ Disabled rate limiting in development (prevent false throttling)

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

#### Testing
- ✅ API workflow tests (verified 20+ character saves work correctly)
- ✅ Edge case testing scripts (test-api-workflow.mjs, test-edge-cases.mjs)
- ✅ All tests passing: no crashes, no rate limiting, all responses JSON

#### Multi-Project Automation (Future)
- **Priority**: Low (queue for later)
- **Description**: Create automation system to manage multiple projects across Mac
- **Ideas**:
  - Unified start/stop/status commands across all dev projects
  - Project switcher (computer-vision-monitor, hand-writing-app, etc.)
  - Port conflict detection and auto-resolution across projects
  - Global dev dashboard showing all projects at once
  - One command to start/stop entire dev environment
