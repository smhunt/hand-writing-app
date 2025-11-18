# Agent Execution Guide

This guide helps Claude Code agents work autonomously on this project.

## Getting Started as an Agent

When you're launched to work on this project:

1. **Read Context First**
   - Start with `PROJECT_CONTEXT.md` for overview
   - Check `tasks/TASKS.md` for your assigned task
   - Review relevant documentation in `/docs`

2. **Understand Your Task**
   - Identify the task type and complexity
   - Review all steps and checklists
   - Note any dependencies or prerequisites

3. **Execute Systematically**
   - Follow the step-by-step instructions
   - Use TodoWrite tool to track progress
   - Test your changes as you go
   - Document what you've done

4. **Complete and Report**
   - Verify all checklist items are done
   - Run tests to ensure nothing broke
   - Update relevant documentation
   - Report back with clear summary

## Agent Best Practices

### Code Changes
- Always read files before editing
- Follow existing code patterns
- Add proper error handling
- Write JSDoc comments
- Keep changes focused on the task

### Testing
- Run tests after changes: `./scripts/test.sh`
- Add new tests for new features
- Verify manually when appropriate
- Don't skip edge cases

### Documentation
- Update API.md for API changes
- Update README.md for user-facing features
- Add inline comments for complex logic
- Keep ARCHITECTURE.md current

### Git Workflow
- Commit logical chunks of work
- Use conventional commit messages
- Don't commit broken code
- Include all related changes in one commit

## Task Patterns

### Backend API Endpoint Task
```
1. Read existing route files to understand patterns
2. Add route handler with validation
3. Implement business logic
4. Add comprehensive error handling
5. Write tests in tests/backend.test.js
6. Update docs/API.md with new endpoint
7. Test with curl or Postman
8. Commit with descriptive message
```

### Frontend Component Task
```
1. Review existing components for patterns
2. Create new component following conventions
3. Add to appropriate page or App.js route
4. Style with existing CSS patterns (or Tailwind)
5. Test responsiveness
6. Verify user authentication checks
7. Commit changes
```

### Infrastructure Task
```
1. Research best practices
2. Install necessary dependencies
3. Create configuration files
4. Update environment variables
5. Test in development
6. Document setup in README
7. Update Docker configs if needed
8. Commit with full context
```

## Common Commands

### Development
```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm start

# Start with Docker
docker-compose up --build

# Run tests
./scripts/test.sh

# Clean environment
./scripts/clean.sh
```

### Testing Specific Features
```bash
# Test backend API
cd backend && npm test

# Test specific endpoint
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Check server health
curl http://localhost:5000/api/health
```

## Working with Multiple Agents

### Parallel Development
- Different agents can work on different task categories simultaneously
- Backend agents: Work on `backend/` files
- Frontend agents: Work on `frontend/` files
- Docs agents: Work on `docs/` files
- Infrastructure agents: Work on scripts, Docker, configs

### Coordination
- Use `memory/` folder to share findings
- Update PROJECT_CONTEXT.md with major changes
- Don't modify files another agent is working on
- Communicate blockers or dependencies

### Merge Strategy
- Each agent commits their changes separately
- Human developer resolves any conflicts
- Test suite must pass before merging

## Memory Management

Use `.claude/memory/` to store:
- **Decisions**: `decisions.md` - Track architectural choices
- **Learnings**: `learnings.md` - Document what works/doesn't
- **Issues**: `known-issues.md` - Track bugs or limitations
- **Ideas**: `future-ideas.md` - Note enhancement ideas

## Current Project State

**Completed:**
- ✅ Full backend API with Auth0
- ✅ Full React frontend with Tailwind CSS
- ✅ Auth0 Universal Login integration
- ✅ Font generation (TTF/WOFF2)
- ✅ Multi-font library support
- ✅ Docker setup (dev + production)
- ✅ Comprehensive tests
- ✅ Complete documentation
- ✅ Template generator script
- ✅ Production OpenCV implementation
- ✅ Landing page
- ✅ Claude Code infrastructure

**In Progress:**
- 🔄 Auth0 feature branch ready for merge
- 🔄 Check latest todo list for current tasks

**High Priority:**
- CI/CD pipeline setup
- Production deployment
- Enhanced testing
- Performance optimization

## Troubleshooting

### Can't Find Files
```bash
# List project structure
find . -type f -name "*.js" | grep -v node_modules

# Find specific component
find frontend/src -name "*Profile*"
```

### Tests Failing
```bash
# Run with verbose output
cd backend && npm test -- --verbose

# Run specific test
npm test -- --testNamePattern="should register"
```

### Docker Issues
```bash
# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

### Port Already in Use
```bash
# Find process using port
lsof -ti:5000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

## Task Completion Checklist

Before marking a task complete:

- [ ] All code changes made and tested
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Code follows project conventions
- [ ] Committed with proper message
- [ ] Reported summary to requesting agent

## Example Agent Session

```
1. Agent launched with task: "Add Tailwind CSS"
2. Agent reads TASKS.md and finds the Tailwind task
3. Agent executes steps 1-8:
   - Installs Tailwind dependencies
   - Configures tailwind.config.js
   - Updates CSS files
   - Converts components to Tailwind
   - Tests responsiveness
   - Removes old CSS
   - Commits changes
4. Agent reports: "Tailwind CSS successfully integrated. All components converted. Tests passing."
```

## Getting Help

If stuck:
1. Review similar implementations in codebase
2. Check documentation in `/docs`
3. Search for examples in tests
4. Note the blocker in `memory/known-issues.md`
5. Report to human developer if unresolved

## Quality Standards

### Code Quality
- No hardcoded values (use constants/env vars)
- Proper error messages for users
- Logging for debugging
- Input validation on all endpoints
- SQL injection prevention (when DB added)

### Performance
- Async operations for I/O
- Stream large files (PDFs)
- Optimize images before storage
- Lazy load components when possible

### Security
- Hash passwords with bcrypt
- Validate all user input
- Check authentication on protected routes
- Use HTTPS in production
- Sanitize file uploads

## Success Metrics

A task is successful when:
- ✅ All acceptance criteria met
- ✅ Tests pass
- ✅ No new warnings/errors
- ✅ Documentation updated
- ✅ Code reviewed and committed
- ✅ Works in both dev and Docker environments
