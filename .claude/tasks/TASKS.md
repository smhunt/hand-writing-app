# Claude Code Task Definitions

This file defines reusable tasks that agents can execute autonomously.

## Backend Tasks

### Task: Add New API Endpoint
**Agent Type:** general-purpose
**Complexity:** Medium
**Steps:**
1. Identify appropriate file (`auth.js`, `profile.js`, etc.)
2. Add route handler with validation
3. Implement business logic
4. Add error handling
5. Write tests in `tests/backend.test.js`
6. Update `docs/API.md`
7. Test endpoint with curl/Postman

**Checklist:**
- [ ] Input validation
- [ ] Error handling
- [ ] Tests written
- [ ] Documentation updated
- [ ] Tested manually

---

### Task: Improve OpenCV Processing
**Agent Type:** general-purpose
**Complexity:** High
**File:** `backend/handwriting.js`
**Steps:**
1. Research OpenCV character segmentation
2. Update `segmentHandwritingSheet()` function
3. Add image preprocessing (denoise, deskew)
4. Improve contour detection
5. Add character recognition confidence scores
6. Test with various image qualities
7. Document parameters

**Considerations:**
- Handle varying image quality
- Support different template layouts
- Add progress feedback
- Optimize performance

---

### Task: Add Database Integration
**Agent Type:** general-purpose
**Complexity:** High
**Steps:**
1. Choose database (PostgreSQL/MongoDB)
2. Create schema/models
3. Add database client setup
4. Migrate `storage.js` to use database
5. Add connection pooling
6. Update environment variables
7. Create migration scripts
8. Update documentation

---

## Frontend Tasks

### Task: Add Tailwind CSS
**Agent Type:** general-purpose
**Complexity:** Medium
**Steps:**
1. Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
2. Run: `npx tailwindcss init -p`
3. Configure `tailwind.config.js`
4. Update `src/index.css` with Tailwind directives
5. Convert existing CSS to Tailwind classes
6. Add custom theme colors
7. Test responsiveness
8. Remove old CSS files

**Files to Update:**
- All components in `src/pages/`
- `src/components/Canvas.js`
- `src/App.js`
- Remove `src/App.css` after migration

---

### Task: Create New Page Component
**Agent Type:** general-purpose
**Complexity:** Low
**Template:**
```javascript
import React, { useState } from 'react';

function NewPage({ user }) {
  const [state, setState] = useState(null);

  if (!user) {
    return (
      <div className="page">
        <p>Please log in.</p>
      </div>
    );
  }

  return (
    <div className="page NewPage">
      <h2>Page Title</h2>
      {/* Content */}
    </div>
  );
}

export default NewPage;
```

**Steps:**
1. Create component in `src/pages/`
2. Add route in `src/App.js`
3. Add navigation link in navbar
4. Add styles
5. Test functionality

---

### Task: Improve Canvas Component
**Agent Type:** general-purpose
**Complexity:** Medium
**Steps:**
1. Add undo/redo functionality
2. Add stroke width control
3. Add color picker
4. Improve touch support
5. Add zoom/pan
6. Add preview before save
7. Add stroke smoothing

---

## Infrastructure Tasks

### Task: Add Production Error Handling
**Agent Type:** general-purpose
**Complexity:** Medium
**Files:** All backend routes
**Steps:**
1. Install Winston or Pino: `npm install winston`
2. Create logger utility
3. Wrap all routes with try/catch
4. Add centralized error handler middleware
5. Log all errors with context
6. Return user-friendly error messages
7. Add error monitoring (Sentry integration optional)

---

### Task: Create Template Generator
**Agent Type:** general-purpose
**Complexity:** Medium
**Steps:**
1. Install PDFKit: `npm install pdfkit`
2. Create script: `scripts/generate-template.js`
3. Define template layout (grid of character boxes)
4. Add character labels
5. Add alignment markers
6. Save to `backend/public/template.pdf`
7. Document usage in README

**Template Specs:**
- Letter size (8.5" x 11")
- 8 columns x 9 rows (72 characters)
- 1" x 1" boxes
- Characters: A-Z, a-z, 0-9, punctuation

---

## Design & UX Tasks

### Task: Create Landing Page
**Agent Type:** general-purpose
**Complexity:** High
**Steps:**
1. Create `frontend/src/pages/LandingPage.js`
2. Add hero section with value proposition
3. Add features section with icons
4. Add "How It Works" section with steps
5. Add CTA buttons
6. Add testimonials section
7. Add footer
8. Make fully responsive
9. Add route for unauthenticated users

**Content:**
- Hero: "Transform Your Handwriting Into Digital Notes"
- Features: Easy, Personal, Shareable
- CTA: "Get Started Free"

---

### Task: Design System Documentation
**Agent Type:** general-purpose
**Complexity:** Low
**Steps:**
1. Create `docs/DESIGN_SYSTEM.md`
2. Document color palette
3. Document typography
4. Document spacing system
5. Document component patterns
6. Add usage examples
7. Create style guide

**Key Elements:**
- Primary colors
- Font families
- Button styles
- Form inputs
- Cards
- Modals

---

## Testing Tasks

### Task: Add E2E Tests
**Agent Type:** general-purpose
**Complexity:** High
**Steps:**
1. Choose E2E framework (Cypress/Playwright)
2. Install dependencies
3. Create test scenarios:
   - User registration flow
   - Login flow
   - Upload handwriting
   - Generate PDF
4. Add to CI/CD pipeline
5. Document in README

---

### Task: Improve Test Coverage
**Agent Type:** general-purpose
**Complexity:** Medium
**Steps:**
1. Run coverage report: `npm test -- --coverage`
2. Identify uncovered files
3. Write tests for:
   - `handwriting.js`
   - `storage.js`
   - Edge cases in all routes
4. Aim for >80% coverage
5. Add coverage badge to README

---

## Marketing Tasks

### Task: Create Marketing Materials
**Agent Type:** general-purpose
**Complexity:** Medium
**Deliverables:**
1. Logo design
2. Social media graphics
3. Feature screenshots
4. Demo video script
5. Press release
6. Product Hunt launch plan

---

## Agent Assignment Examples

When starting work, agents should:
1. Read this file
2. Check `PROJECT_CONTEXT.md`
3. Review relevant documentation
4. Execute task steps
5. Update todos
6. Commit changes
7. Update task status

## Priority Levels

**P0 - Critical:** Blocking or security issues
**P1 - High:** Core features, important bugs
**P2 - Medium:** Enhancements, nice-to-have
**P3 - Low:** Polish, documentation

## Current Priorities

1. **P0:** Merge Auth0 feature branch to main
2. **P1:** Set up CI/CD pipeline (GitHub Actions)
3. **P1:** Production deployment setup
4. **P2:** Enhanced test coverage (E2E, Auth0 flow)
5. **P2:** Performance monitoring
6. **P3:** Design system docs
