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
- **OpenCV** - Image processing and character segmentation
- **PDFKit** - PDF generation
- **bcrypt** - Password hashing
- **Express Sessions** - User authentication

### Frontend
- **React** - User interface
- **React Router** - Navigation
- **HTML5 Canvas** - Drawing interface for character capture

### Infrastructure
- **Docker & Docker Compose** - Containerization for easy development and deployment
- **JSON File Storage** - Simple data persistence (easily replaceable with PostgreSQL, MongoDB, etc.)

## Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended)
  - OR -
- **Node.js** (>=14) and npm

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

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the database file:
   ```bash
   mkdir -p data
   echo '{"users":[]}' > data/db.json
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

   The server will start on port 5000.

#### Frontend Setup

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
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── auth.js
│   ├── profile.js
│   ├── generate.js
│   ├── handwriting.js
│   ├── storage.js
│   └── data/
│       ├── db.json
│       ├── uploads/
│       └── samples/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── App.css
│       ├── components/
│       │   └── Canvas.js
│       └── pages/
│           ├── LoginPage.js
│           ├── RegisterPage.js
│           ├── ProfilePage.js
│           ├── ComposePage.js
│           └── DrawPage.js
└── tests/
    └── backend.test.js
```

## Development Notes

### Image Processing
The OpenCV image processing for segmentation is currently a simplified implementation. In production:
- Configure for your specific template design
- Adjust contour detection and sorting algorithms
- Handle varying image quality and lighting conditions

### Storage
Character images are stored in `backend/data/uploads/<userId>/` as PNG files. Vector stroke data (from drawing) is stored in JSON in the user profile.

### PDF Generation
The PDF generation lays out each character image on the page. Current implementation assumes fixed-size cells. You can improve by:
- Auto-cropping images to ink bounding box
- Implementing variable letter widths
- Adding spacing and kerning controls

### Security
⚠️ **Important**: This is a prototype-level implementation. For production use:
- Enable HTTPS
- Use secure cookies
- Add email verification
- Implement rate limiting
- Use a robust database (PostgreSQL, MongoDB)
- Store images in cloud storage
- Add proper error handling and validation

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

## Future Enhancements

- [ ] Support for lowercase letters and symbols
- [ ] Multiple handwriting styles per user
- [ ] Font generation (TTF export)
- [ ] Collaborative notes (multiple handwriting styles)
- [ ] Mobile app version
- [ ] Cloud storage integration
- [ ] Advanced OpenCV processing options
- [ ] Handwriting style customization (slant, spacing, size)
- [ ] Template customization

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Inspired by services like Calligraphr
- Built with Node.js, React, OpenCV, and PDFKit
