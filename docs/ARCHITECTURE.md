# Architecture Documentation

## System Overview

The Handwritten Note Web App is a full-stack application that enables users to digitize their handwriting and generate personalized handwritten notes.

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│             │         │              │         │             │
│   Browser   │◄────────┤  React App   │◄────────┤   Express   │
│   (User)    │         │  (Frontend)  │         │   (Backend) │
│             │         │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
                              │                         │
                              │                         │
                              ▼                         ▼
                        ┌──────────┐            ┌──────────────┐
                        │ Canvas   │            │  OpenCV      │
                        │ Drawing  │            │  Processing  │
                        └──────────┘            └──────────────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │  PDFKit     │
                                                 │  Generation │
                                                 └─────────────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │  Storage    │
                                                 │  (JSON/DB)  │
                                                 └─────────────┘
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **HTML5 Canvas** - Drawing interface
- **Fetch API** - HTTP requests
- **CSS3** - Styling

### Backend
- **Node.js 18** - Runtime environment
- **Express 4** - Web framework
- **Multer** - File upload middleware
- **Express Session** - Session management
- **bcrypt** - Password hashing
- **PDFKit** - PDF generation
- **OpenCV** - Image processing (via bindings or Python)
- **UUID** - Unique ID generation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **JSON File Storage** - Data persistence (upgradeable)

### Testing
- **Jest** - Test framework
- **Supertest** - HTTP assertions

## Directory Structure

```
hand-writing-app/
├── backend/               # Node.js/Express API
│   ├── data/             # Database and uploads
│   │   ├── db.json       # User data (JSON store)
│   │   ├── uploads/      # User character images
│   │   └── samples/      # Sample data
│   ├── public/           # Static files
│   ├── auth.js           # Authentication routes
│   ├── profile.js        # Profile management routes
│   ├── generate.js       # PDF generation route
│   ├── handwriting.js    # OpenCV processing
│   ├── storage.js        # Data layer
│   └── server.js         # Express setup
│
├── frontend/             # React application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── App.js        # Main app + routing
│   │   └── index.js      # Entry point
│   └── package.json
│
├── tests/                # Test files
├── scripts/              # Helper scripts
├── docs/                 # Documentation
└── docker-compose.yml    # Docker config
```

## Component Architecture

### Backend Components

#### 1. Server (server.js)
**Responsibilities:**
- Initialize Express application
- Configure middleware
- Set up routes
- Handle sessions
- Serve static files

**Dependencies:**
- Express
- Express Session
- Cookie Parser

#### 2. Authentication (auth.js)
**Responsibilities:**
- User registration
- Login/logout
- Password hashing
- Session management

**Dependencies:**
- bcrypt
- storage module

**Key Functions:**
- `POST /register` - Create new user
- `POST /login` - Authenticate user
- `POST /logout` - End session

#### 3. Profile Management (profile.js)
**Responsibilities:**
- Template downloads
- File uploads
- Character storage
- Profile retrieval

**Dependencies:**
- Multer
- handwriting module
- storage module

**Key Functions:**
- `GET /template` - Serve template PDF
- `POST /upload` - Process scanned sheet
- `POST /save-char` - Save drawn character
- `GET /profile` - Get user data

#### 4. Handwriting Processing (handwriting.js)
**Responsibilities:**
- Image segmentation
- Character extraction
- OpenCV integration

**Technologies:**
- OpenCV (opencv4nodejs or Python script)
- Image processing algorithms

**Algorithm:**
1. Read uploaded image
2. Convert to grayscale
3. Apply threshold
4. Find contours
5. Sort and identify characters
6. Extract ROIs
7. Save individual character images

#### 5. PDF Generation (generate.js)
**Responsibilities:**
- Create PDF documents
- Render characters
- Handle layout
- Support multiple pages

**Dependencies:**
- PDFKit
- storage module

**Algorithm:**
1. Load user profile
2. Initialize PDF document
3. Iterate through input text
4. Render each character:
   - Image: Insert PNG at position
   - Vector: Draw strokes
5. Handle line breaks and wrapping
6. Stream PDF to response

#### 6. Storage Layer (storage.js)
**Responsibilities:**
- Data persistence
- User CRUD operations
- Character storage
- File management

**Current Implementation:**
- JSON file database
- File system for images

**Functions:**
- `getUserByUsername()`
- `getUserById()`
- `createUser()`
- `saveCharacterImage()`
- `saveCharacterStrokes()`

### Frontend Components

#### 1. App Component (App.js)
**Responsibilities:**
- Main application shell
- Route configuration
- User state management
- Navigation

**State:**
- `user` - Current logged-in user

**Routes:**
- `/` → ProfilePage
- `/login` → LoginPage
- `/register` → RegisterPage
- `/profile` → ProfilePage
- `/compose` → ComposePage
- `/draw` → DrawPage

#### 2. Page Components

**LoginPage:**
- Login form
- Authentication handling
- Error display

**RegisterPage:**
- Registration form
- User creation
- Auto-login

**ProfilePage:**
- Template download
- Sheet upload
- Character gallery
- Profile status

**ComposePage:**
- Text input
- Paper size selection
- PDF generation
- PDF preview/download

**DrawPage:**
- Character selection
- Canvas interface
- Character progression

#### 3. Canvas Component
**Responsibilities:**
- Capture drawing input
- Track strokes
- Support mouse and touch
- Export vector data

**State:**
- `drawing` - Currently drawing
- `strokes` - Array of stroke paths

**Events:**
- Mouse: down, move, up, leave
- Touch: start, move, end

## Data Flow

### User Registration Flow

```
User Input → React Form → POST /api/register →
  → Validate Input → Hash Password → Create User →
  → Save to Database → Create Session → Response
```

### Handwriting Capture Flow (Scan)

```
User Upload → Multer → Save Temp File →
  → OpenCV Processing → Segment Characters →
  → Save Character Images → Update Profile →
  → Delete Temp File → Response
```

### Handwriting Capture Flow (Draw)

```
User Drawing → Canvas Events → Capture Strokes →
  → Send to API → Save Vector Data → Update Profile
```

### PDF Generation Flow

```
User Input → Text + Size → POST /api/generate →
  → Load User Profile → Initialize PDF →
  → For Each Character:
      → Load Image/Vector → Render on PDF →
  → Stream PDF → Browser Download
```

## Security Architecture

### Authentication
- **Password Hashing:** bcrypt with salt rounds
- **Session Management:** Express sessions with secure cookies
- **CSRF Protection:** Recommended for production

### Authorization
- **Middleware Check:** All protected routes verify `req.session.userId`
- **Resource Ownership:** Users can only access their own data

### Input Validation
- **File Uploads:** Type and size restrictions
- **Form Data:** Required field validation
- **SQL Injection:** N/A (JSON storage, but validate for future DB)

### File Security
- **Upload Directory:** Isolated per user
- **File Types:** Whitelist PNG, JPEG, PDF
- **File Size:** Limit recommended (not yet implemented)

## Performance Considerations

### Frontend
- **Code Splitting:** React lazy loading (future)
- **Asset Optimization:** Image compression
- **Caching:** Browser caching headers

### Backend
- **Session Store:** Memory (upgrade to Redis for production)
- **File Processing:** Async operations
- **PDF Generation:** Stream-based (low memory footprint)

### Database
- **Current:** JSON file (simple, not scalable)
- **Recommendation:** PostgreSQL or MongoDB for production

### Caching Strategy
- **Static Assets:** Long cache times
- **API Responses:** Consider Redis for frequently accessed data
- **Generated PDFs:** Ephemeral (not cached)

## Scalability

### Horizontal Scaling Considerations

**Current Limitations:**
- JSON file database (not concurrent-safe)
- Session store in memory (not shared)
- File uploads on local filesystem

**Production Recommendations:**
- Database: PostgreSQL with connection pooling
- Sessions: Redis or database-backed
- File Storage: S3 or similar cloud storage
- Load Balancer: Nginx or cloud provider
- Container Orchestration: Kubernetes

### Vertical Scaling
- Increase container resources
- Optimize image processing
- Add worker processes for CPU-intensive tasks

## Deployment Architecture

### Development
```
Docker Compose
├── Frontend Container (React Dev Server)
└── Backend Container (Node.js)
```

### Production (Recommended)
```
Load Balancer
├── Frontend (Static Files - Nginx/CDN)
└── Backend API Cluster
    ├── Node.js Instance 1
    ├── Node.js Instance 2
    └── ...

Database Cluster (PostgreSQL)
├── Primary
└── Replicas

File Storage (S3)
Session Store (Redis)
```

## Monitoring & Logging

### Recommended Tools
- **Logging:** Winston or Pino
- **Monitoring:** Prometheus + Grafana
- **Error Tracking:** Sentry
- **APM:** New Relic or DataDog

### Key Metrics
- Request rate
- Response time
- Error rate
- CPU/Memory usage
- Database query performance
- File processing time

## Future Architecture Enhancements

### Phase 1 - Production Ready
- [ ] Real database integration
- [ ] Cloud storage for files
- [ ] Redis session store
- [ ] Proper logging framework
- [ ] Error monitoring
- [ ] Rate limiting
- [ ] HTTPS/SSL

### Phase 2 - Advanced Features
- [ ] WebSocket for real-time updates
- [ ] Background job processing (Bull/Agenda)
- [ ] Caching layer (Redis)
- [ ] CDN integration
- [ ] Multi-region deployment

### Phase 3 - Enterprise
- [ ] Microservices architecture
- [ ] Event-driven architecture
- [ ] GraphQL API
- [ ] Advanced analytics
- [ ] ML-powered improvements

## Development Principles

### Code Organization
- **Separation of Concerns:** Each module has single responsibility
- **DRY Principle:** Shared logic in utility modules
- **Modular Design:** Easy to test and replace components

### Error Handling
- **Graceful Degradation:** Fail safely
- **User-Friendly Messages:** Clear error communication
- **Logging:** All errors logged for debugging

### Testing Strategy
- **Unit Tests:** Individual functions
- **Integration Tests:** API endpoints
- **E2E Tests:** Full user workflows (future)

### Code Quality
- **Linting:** ESLint (future)
- **Formatting:** Prettier (future)
- **Type Safety:** TypeScript (future consideration)
- **Code Reviews:** Required for all changes
