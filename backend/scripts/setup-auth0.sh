#!/bin/bash

# Auth0 Setup Script for Handwriting App
# This script helps you configure Auth0 authentication

set -e

echo "============================================"
echo "  Handwriting App - Auth0 Setup Wizard"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env files already exist
if [ -f "backend/.env" ] && [ -f "frontend/.env" ]; then
  echo -e "${YELLOW}Warning: .env files already exist!${NC}"
  read -p "Do you want to overwrite them? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 1
  fi
fi

echo -e "${BLUE}Step 1: Auth0 Account Setup${NC}"
echo "============================================"
echo ""
echo "Before continuing, please:"
echo "1. Go to https://auth0.com and create a free account"
echo "2. Create a new Application (Regular Web Application)"
echo "3. Configure the following URLs in your Auth0 app settings:"
echo ""
echo "   Allowed Callback URLs:"
echo "   http://localhost:5001/api/callback"
echo ""
echo "   Allowed Logout URLs:"
echo "   http://localhost:3000"
echo ""
echo "   Allowed Web Origins:"
echo "   http://localhost:3000"
echo ""
read -p "Press ENTER when you've completed these steps..."
echo ""

echo -e "${BLUE}Step 2: Auth0 Credentials${NC}"
echo "============================================"
echo ""
read -p "Enter your Auth0 Domain (e.g., your-tenant.auth0.com): " AUTH0_DOMAIN
read -p "Enter your Auth0 Client ID: " AUTH0_CLIENT_ID
read -p "Enter your Auth0 Client Secret: " AUTH0_CLIENT_SECRET
echo ""

echo -e "${BLUE}Step 3: Generating Secrets${NC}"
echo "============================================"
echo "Generating secure random secrets..."
AUTH0_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✓ Secrets generated${NC}"
echo ""

echo -e "${BLUE}Step 4: Creating Backend .env${NC}"
echo "============================================"
cat > backend/.env << EOL
# Server Configuration
NODE_ENV=development
PORT=5001
HOST=localhost

# Auth0 Configuration
AUTH0_SECRET='${AUTH0_SECRET}'
AUTH0_BASE_URL=http://localhost:5001
AUTH0_ISSUER_BASE_URL=https://${AUTH0_DOMAIN}
AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}
AUTH0_CLIENT_SECRET=${AUTH0_CLIENT_SECRET}
AUTH0_AUDIENCE=

# Session Configuration
SESSION_SECRET='${SESSION_SECRET}'

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security
HTTPS_ENABLED=false

# Rate Limiting
RATE_LIMIT_ENABLED=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
EOL
echo -e "${GREEN}✓ Created backend/.env${NC}"
echo ""

echo -e "${BLUE}Step 5: Creating Frontend .env${NC}"
echo "============================================"
cat > frontend/.env << EOL
# Auth0 Configuration for React
REACT_APP_AUTH0_DOMAIN=${AUTH0_DOMAIN}
REACT_APP_AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}
REACT_APP_AUTH0_AUDIENCE=
REACT_APP_AUTH0_CALLBACK_URL=http://localhost:3000

# API Configuration
REACT_APP_API_URL=http://localhost:5001
EOL
echo -e "${GREEN}✓ Created frontend/.env${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Your Auth0 configuration has been saved to:"
echo "  - backend/.env"
echo "  - frontend/.env"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Install dependencies:"
echo "   cd backend && npm install"
echo "   cd ../frontend && npm install"
echo ""
echo "2. Start the backend:"
echo "   cd backend && PORT=5001 node server.js"
echo ""
echo "3. Start the frontend (in a new terminal):"
echo "   cd frontend && BROWSER=none npm start"
echo ""
echo "4. Visit http://localhost:3000 and test the login!"
echo ""
echo -e "${BLUE}Troubleshooting:${NC}"
echo "If you encounter issues:"
echo "  - Verify Auth0 callback URLs are correct"
echo "  - Check that both servers are running"
echo "  - Review logs for error messages"
echo "  - See README.md for detailed setup instructions"
echo ""
