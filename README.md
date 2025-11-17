# Handwritten Note Web App

Transform your handwriting into personalized digital notes! This full-stack web application lets users create handwritten letters using their own writing style.

## Features

- **Handwriting Template Generation**: Downloadable template (PDF) with grids for letters/numbers
- **Handwriting Profile Creation**: Upload scanned handwritten sheets. The app segments the image into individual character samples using OpenCV and stores them in your profile
- **Compose Handwritten Notes**: Type a message and choose a page size; the app generates a PDF with the text rendered in your handwriting
- **Download/Print Notes**: Preview the generated PDF and download it for printing or sharing
- **Direct Drawing Input**: Draw characters with a mouse, finger, or stylus to add or update characters in your profile
- **User Accounts**: Register and login to save your handwriting profile privately

## Tech Stack

### Backend
- **Node.js + Express** - REST API server
- **Multer** - File upload handling
- **OpenCV (Python)** - Image processing and character segmentation
- **PDFKit** - PDF generation and template creation
- **bcrypt** - Password hashing
- **Express Sessions** - User authentication
- **Winston** - Production logging
- **Morgan** - HTTP request logging

### Frontend
- **React** - User interface
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

### 7. Draw Characters (Optional)
If you prefer to draw characters or need to correct any, go to the Draw page. Select a character, draw it on the canvas, and save. This will update that character in your profile.

## Project Structure

```
hand-writing-app/
├── README.md
├── CONTRIBUTING.md
├── docker-compose.yml
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
│   ├── package.json
│   ├── requirements.txt        # Python dependencies
│   ├── server.js
│   ├── logger.js               # Winston logging
│   ├── auth.js
│   ├── profile.js
│   ├── generate.js
│   ├── handwriting.js
│   ├── storage.js
│   ├── segment_chars.py        # Python OpenCV script
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── logs/                   # Application logs
│   ├── data/
│   │   ├── db.json
│   │   ├── uploads/
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

## Completed Features ✨

- ✅ Full backend API with authentication
- ✅ Complete React frontend with Tailwind CSS
- ✅ Handwriting template generator (83 characters)
- ✅ Python OpenCV character segmentation
- ✅ PDF generation with handwriting rendering
- ✅ Canvas-based character drawing
- ✅ User authentication and sessions
- ✅ Production logging with Winston
- ✅ Error handling middleware
- ✅ Marketing landing page
- ✅ Comprehensive documentation
- ✅ Docker containerization
- ✅ Test suite
- ✅ Claude Code development infrastructure

## Future Enhancements

- [ ] Multiple handwriting styles per user
- [ ] Font generation (TTF export)
- [ ] Collaborative notes (multiple handwriting styles)
- [ ] Mobile app version
- [ ] Cloud storage integration (AWS S3, Cloudflare R2)
- [ ] Real database (PostgreSQL, MongoDB)
- [ ] Advanced OpenCV preprocessing options
- [ ] Handwriting style customization (slant, spacing, size)
- [ ] Custom template layouts
- [ ] Email verification and password reset
- [ ] OAuth social login
- [ ] Export to various formats (PNG, SVG, etc.)
- [ ] Batch PDF generation
- [ ] API rate limiting
- [ ] WebSocket for real-time updates

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Inspired by services like Calligraphr
- Built with Node.js, React, OpenCV, and PDFKit
