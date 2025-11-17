# Claude TODO List

## Project: Handwritten Note Web App

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
- ✅ Initialize Git repository
- ✅ Create GitHub repository (https://github.com/smhunt/hand-writing-app)
- ✅ Push initial commit to remote
