# Handwritten Note Web App

Transform your handwriting into personalized digital notes! This full-stack web application lets users create handwritten letters using their own writing style.

## Features

- **Handwriting Template Generation**: Downloadable template (PDF) with grids for letters/numbers
- **Handwriting Profile Creation**: Upload scanned handwritten sheets. The app segments the image into individual character samples using OpenCV and stores them in your profile
- **Compose Handwritten Notes**: Type a message and choose a page size; the app generates a PDF with the text rendered in your handwriting
- **Download/Print Notes**: Preview the generated PDF and download it for printing or sharing
- **Direct Drawing Input**: Draw characters with a mouse, finger, or stylus to add or update characters in your profile
- **Font Generation**: Export your handwriting as installable TrueType fonts (TTF) for desktop or web fonts (WOFF2) for websites
- **User Accounts**: Register and login to save your handwriting profile privately

## Tech Stack

### Backend
- **Node.js + Express** - REST API server
- **Auth0** - Authentication and user management (via express-openid-connect)
- **Multer** - File upload handling
- **OpenCV (Python)** - Image processing and character segmentation
- **PDFKit** - PDF generation and template creation
- **opentype.js** - TTF/OTF font generation
- **ttf2woff2** - Web font format conversion
- **simplify-js** - Path smoothing and optimization
- **Express Sessions** - Session management
- **Validator** - Input validation and sanitization
- **Winston** - Production logging
- **Morgan** - HTTP request logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - API protection

### Frontend
- **React** - User interface
- **Auth0 React SDK** - Authentication integration (@auth0/auth0-react)
- **React Router** - Navigation
- **Tailwind CSS** - Utility-first styling
- **HTML5 Canvas** - Drawing interface for character capture

### Infrastructure
- **Docker & Docker Compose** - Containerization for easy development and deployment
- **JSON File Storage** - Simple data persistence (easily replaceable with PostgreSQL, MongoDB, etc.)
- **Claude Code** - AI-assisted development infrastructure

## Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended)
  - OR -
- **Node.js** (>=18) and npm
- **Python 3.8+** (for OpenCV character segmentation, optional)
- **Auth0 Account** (free tier available at https://auth0.com)

### Auth0 Setup (Required)

This application uses Auth0 for authentication. Follow these steps to configure Auth0:

#### 1. Create Auth0 Account
1. Go to [https://auth0.com](https://auth0.com) and sign up for a free account
2. Create a new tenant (e.g., "handwriting-app")

#### 2. Create Application
1. In the Auth0 Dashboard, go to **Applications** → **Create Application**
2. Name it "Handwriting App" and select **Regular Web Application**
3. Click **Create**

#### 3. Configure Application Settings
1. In your application settings, add the following to **Allowed Callback URLs**:
   ```
   http://localhost:5001/api/callback
   ```

2. Add the following to **Allowed Logout URLs**:
   ```
   http://localhost:3000
   ```

3. Add the following to **Allowed Web Origins**:
   ```
   http://localhost:3000
   ```

4. Save Changes

#### 4. Get Your Credentials
Copy the following from your Auth0 application settings:
- **Domain** (e.g., `your-tenant.auth0.com`)
- **Client ID**
- **Client Secret**

#### 5. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
# Copy from backend/.env.example
NODE_ENV=development
PORT=5001
HOST=localhost

# Auth0 Configuration
AUTH0_SECRET='your-long-random-secret-here'
AUTH0_BASE_URL=http://localhost:5001
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here

# Session
SESSION_SECRET='another-long-random-secret'

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```bash
# Copy from frontend/.env.example
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your_client_id_here
REACT_APP_AUTH0_CALLBACK_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5001
```

**Generating Secrets**:
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 6. Test Auth0 Integration
1. Start the application (see below)
2. Click "Get Started" or "Login"
3. You should see the Auth0 Universal Login page
4. Sign up with email/password or social providers
5. After authentication, you'll be redirected back to the app

### Option 1: Running with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd hand-writing-app
   ```

2. Start the application:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

4. To stop the application:
   ```bash
   docker-compose down
   ```

### Option 2: Running Locally without Docker

#### Quick Setup Script

```bash
./scripts/setup.sh
```

This script will:
- Install backend and frontend dependencies
- Create necessary directories
- Initialize the database
- Generate the handwriting template
- Set up Python OpenCV (optional)

#### Manual Setup

##### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. (Optional) Install Python dependencies for OpenCV:
   ```bash
   pip3 install -r requirements.txt
   export USE_PYTHON_OPENCV=true
   ```

4. Create the database file:
   ```bash
   mkdir -p data logs
   echo '{"users":[]}' > data/db.json
   ```

5. Generate the handwriting template:
   ```bash
   node ../scripts/generate-template.js
   ```

6. Start the backend server:
   ```bash
   npm start
   ```

   The server will start on port 5000.

##### Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The app will open at http://localhost:3000

## Usage Workflow

### 1. Register
Create a new account on the registration page.

### 2. Download Template
Go to the Profile page and download the handwriting capture sheet (PDF). Print it out.

### 3. Fill Template
Write the requested characters in the boxes on the sheet as neatly as possible.

### 4. Scan & Upload
Scan or photograph the sheet (ensuring all corners and boxes are visible) and upload the image on the Profile page. The app will process the image to extract each character.

### 5. Compose a Note
Navigate to the Compose page. Type your message in the text box, choose a paper size (e.g., A4, Letter), and click "Generate Note".

### 6. Preview & Download
A preview of the generated PDF will be shown. Download the PDF to see your message rendered in your handwriting!

### 7. Generate Your Font (New!)
Return to the Profile page and click "Generate Font" to create installable TrueType (TTF) and web (WOFF2) fonts from your handwriting.
- **Desktop Use**: Download the TTF file and install it on Windows, Mac, or Linux to use in Word, Photoshop, and other applications
- **Web Use**: Download the WOFF2 file and embed it on your website with the provided CSS

**Note**: Only vector-drawn characters are included in fonts. Image-based characters from uploaded templates are automatically skipped.

### 8. Draw Characters (Optional)
If you prefer to draw characters or need to correct any, go to the Draw page. Select a character, draw it on the canvas, and save. This will update that character in your profile.

## Project Structure

```
hand-writing-app/
├── README.md
├── CONTRIBUTING.md
├── docker-compose.yml
├── docker-compose.prod.yml     # Production deployment config
├── .claude/                    # Claude Code infrastructure
│   ├── PROJECT_CONTEXT.md
│   ├── AGENT_GUIDE.md
│   ├── MONITORING.md
│   ├── tasks/
│   │   └── TASKS.md
│   ├── logs/
│   └── memory/
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.prod         # Production multi-stage build
│   ├── package.json
│   ├── requirements.txt        # Python dependencies
│   ├── server.js
│   ├── config.js               # Centralized configuration
│   ├── logger.js               # Winston logging
│   ├── auth.js
│   ├── profile.js
│   ├── generate.js
│   ├── handwriting.js
│   ├── storage.js
│   ├── segment_chars.py        # Python OpenCV script
│   ├── fontGenerator.js        # Font generation module
│   ├── fontUtils.js            # Font utilities and Unicode mapping
│   ├── routes/
│   │   └── font.js             # Font API endpoints
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   └── rateLimiter.js      # Rate limiting middleware
│   ├── logs/                   # Application logs
│   ├── data/
│   │   ├── db.json
│   │   ├── uploads/
│   │   ├── fonts/              # Generated font files
│   │   └── samples/
│   └── public/
│       └── handwriting_template.pdf
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── postcss.config.js
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── index.css           # Tailwind imports
│       ├── App.js
│       ├── components/
│       │   └── Canvas.js
│       └── pages/
│           ├── LandingPage.js  # Marketing page
│           ├── LoginPage.js
│           ├── RegisterPage.js
│           ├── ProfilePage.js
│           ├── ComposePage.js
│           └── DrawPage.js
├── docs/
│   ├── API.md                  # API documentation
│   ├── ARCHITECTURE.md         # System architecture
│   ├── DESIGN_SYSTEM.md        # Design tokens & patterns
│   └── OPENCV_SETUP.md         # OpenCV setup guide
├── scripts/
│   ├── setup.sh
│   ├── test.sh
│   ├── clean.sh
│   ├── generate-template.js
│   ├── watch-progress.sh       # Real-time monitoring
│   └── log-activity.sh
└── tests/
    └── backend.test.js
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[API.md](docs/API.md)** - Complete API reference with examples
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and component architecture
- **[DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** - UI/UX design tokens and patterns
- **[OPENCV_SETUP.md](docs/OPENCV_SETUP.md)** - OpenCV installation and configuration
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development workflow and guidelines

## Development Tools

### Real-Time Monitoring

Watch Claude Code agent activity in real-time:

```bash
./scripts/watch-progress.sh
```

This displays a live feed of all development activities with color-coded output.

### Helper Scripts

```bash
./scripts/setup.sh      # Initial project setup
./scripts/test.sh       # Run all tests
./scripts/clean.sh      # Clean build artifacts
node scripts/generate-template.js  # Generate handwriting template
```

### Claude Code Infrastructure

This project includes infrastructure for autonomous development with Claude Code:

- **Task Definitions**: `.claude/tasks/TASKS.md` - Reusable task templates
- **Agent Guide**: `.claude/AGENT_GUIDE.md` - Agent execution guidelines
- **Project Context**: `.claude/PROJECT_CONTEXT.md` - Overview for agents
- **Activity Logs**: `.claude/logs/` - Development activity tracking

## Development Notes

### Image Processing

Two OpenCV implementation options:

1. **Python OpenCV** (Production - Recommended)
   - Full-featured character segmentation
   - See `docs/OPENCV_SETUP.md` for setup
   - Set `USE_PYTHON_OPENCV=true` environment variable

2. **Mock Implementation** (Development)
   - Returns sample characters for testing
   - No OpenCV installation required
   - Default mode for quick development

### Storage

- Character images: `backend/data/uploads/<userId>/` as PNG files
- Vector stroke data: Stored in JSON in user profile
- Logs: `backend/logs/` with rotation (error.log, combined.log)

### PDF Generation

The PDF generation lays out each character image on the page. Features:
- Both image and vector character rendering
- Multiple page support
- Configurable paper sizes (Letter, A4)
- Line wrapping and spacing

### Security

⚠️ **Production Recommendations**:
- Enable HTTPS
- Use secure, httpOnly cookies
- Add email verification
- Implement rate limiting
- Use a robust database (PostgreSQL, MongoDB)
- Store images in cloud storage (S3, CloudFlare R2)
- Add CSRF protection
- Environment-based configuration
- Set SESSION_SECRET environment variable

## Testing

Run backend tests:
```bash
cd backend
npm test
```

Run frontend tests:
```bash
cd frontend
npm test
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout

### Profile
- `GET /api/template` - Download handwriting template
- `POST /api/upload` - Upload filled template
- `POST /api/save-char` - Save drawn character
- `GET /api/profile` - Get user profile info

### Generation
- `POST /api/generate` - Generate handwritten PDF

### Font Generation
- `POST /api/font/generate` - Generate font from handwriting (TTF + WOFF2)
- `GET /api/font/info` - Get font metadata and character coverage
- `GET /api/font/download/:userId/:format` - Download font (format: ttf or woff2)
- `GET /api/font/css/:userId` - Get @font-face CSS for web usage
- `DELETE /api/font` - Delete user's generated fonts

## Completed Features ✨

- ✅ **Auth0 authentication** with Universal Login
- ✅ **Multi-font library** support (create & manage multiple fonts)
- ✅ **Input validation** and security hardening
- ✅ Full backend API with RESTful endpoints
- ✅ Complete React frontend with Tailwind CSS
- ✅ Handwriting template generator (73 characters)
- ✅ Python OpenCV character segmentation
- ✅ PDF generation with handwriting rendering
- ✅ Canvas-based character drawing with auto-advance
- ✅ **Font generation (TTF/WOFF2 export)**
- ✅ Auto-provisioning for Auth0 users
- ✅ Production logging with Winston
- ✅ Error handling middleware
- ✅ Security headers (Helmet) and CORS
- ✅ API rate limiting
- ✅ Centralized configuration system
- ✅ Marketing landing page
- ✅ Comprehensive documentation
- ✅ Docker containerization (development + production)
- ✅ Test suite
- ✅ Claude Code development infrastructure

## Future Enhancements

- [x] ~~Multiple handwriting styles per user~~ ✅ Completed!
- [x] ~~OAuth social login (Auth0)~~ ✅ Completed!
- [ ] Font kerning and ligatures
- [ ] Multiple font weights (Light, Regular, Bold)
- [ ] Image-to-vector conversion for uploaded characters
- [ ] Collaborative notes (multiple handwriting styles)
- [ ] Mobile app version
- [ ] Cloud storage integration (AWS S3, Cloudflare R2)
- [ ] Real database (PostgreSQL, MongoDB)
- [ ] Advanced OpenCV preprocessing options
- [ ] Handwriting style customization (slant, spacing, size)
- [ ] Custom template layouts
- [ ] Email verification and password reset (via Auth0)
- [ ] Export to various formats (PNG, SVG, etc.)
- [ ] Batch PDF generation
- [ ] WebSocket for real-time updates

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Inspired by services like Calligraphr
- Built with Node.js, React, OpenCV, and PDFKit
