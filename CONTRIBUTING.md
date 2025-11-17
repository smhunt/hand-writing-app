# Contributing to Handwritten Note Web App

Thank you for your interest in contributing! This guide will help you get started with development.

## Development Setup

### Quick Start

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd hand-writing-app
   ./scripts/setup.sh
   ```

2. **Start with Docker (Recommended):**
   ```bash
   docker-compose up --build
   ```

3. **Or start locally:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm install && npm start

   # Terminal 2 - Frontend
   cd frontend && npm install && npm start
   ```

## Project Structure

### Backend (`/backend`)
- `server.js` - Express server setup and middleware
- `auth.js` - Authentication routes (register, login, logout)
- `profile.js` - Profile management routes (template, upload, save-char)
- `generate.js` - PDF generation route
- `handwriting.js` - OpenCV image processing logic
- `storage.js` - Data persistence layer
- `data/` - Database and uploaded files

### Frontend (`/frontend`)
- `src/App.js` - Main app component with routing
- `src/pages/` - Page components
- `src/components/` - Reusable components (Canvas, etc.)

### Tests (`/tests`)
- `backend.test.js` - Backend API tests

## Development Workflow

### Branch Strategy
- `main` - Stable production code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes:**
   ```bash
   ./scripts/test.sh
   ```

4. **Commit with conventional commits:**
   ```bash
   git commit -m "feat: add new feature description"
   ```

   Commit types:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `style:` - Formatting
   - `refactor:` - Code restructuring
   - `test:` - Adding tests
   - `chore:` - Maintenance

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

### JavaScript Style
- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Use async/await instead of promises chains
- Add JSDoc comments for functions
- Follow existing formatting

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use meaningful prop names
- Add PropTypes or TypeScript types (future)

### Backend Code
- Validate all inputs
- Handle errors properly
- Use try/catch blocks
- Return appropriate HTTP status codes
- Log important events

## Testing

### Running Tests
```bash
# All tests
./scripts/test.sh

# Backend only
cd backend && npm test

# Frontend only
cd frontend && npm test
```

### Writing Tests
- Write tests for new features
- Test edge cases
- Mock external dependencies
- Aim for >80% coverage

## Documentation

When adding features:
- Update README.md
- Update API.md (for API changes)
- Add inline code comments
- Update CHANGELOG.md

## Pull Request Process

1. **Ensure all tests pass**
2. **Update documentation**
3. **Add/update tests**
4. **Follow commit message conventions**
5. **Request review from maintainers**
6. **Address review comments**

## Common Development Tasks

### Adding a New API Route

1. Create route in appropriate file (`auth.js`, `profile.js`, etc.)
2. Add input validation
3. Implement logic
4. Add error handling
5. Write tests
6. Update API.md

### Adding a New Frontend Page

1. Create component in `src/pages/`
2. Add route in `App.js`
3. Add navigation link if needed
4. Style with existing CSS patterns
5. Test responsiveness

### Modifying Image Processing

1. Update `handwriting.js`
2. Test with sample images
3. Adjust parameters as needed
4. Document changes

## Troubleshooting

### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose up --build

# Clean Docker cache
docker system prune -a
```

### Database Issues
```bash
# Reset database
echo '{"users":[]}' > backend/data/db.json
```

### Port Conflicts
```bash
# Check what's using ports 3000 or 5000
lsof -i :3000
lsof -i :5000
```

## Getting Help

- Check existing issues
- Read documentation
- Ask in discussions
- Contact maintainers

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn
- Focus on the code, not the person

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
