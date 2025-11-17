const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getUserById, saveCharacterImage, saveCharacterStrokes } = require('./storage');
const { segmentHandwritingSheet } = require('./handwriting');

const router = express.Router();

// Configure Multer to save uploads to a temp directory
const upload = multer({ dest: path.join(__dirname, 'data/uploads/tmp') });

// Download handwriting template (PDF)
router.get('/template', (req, res) => {
  const templatePath = path.join(__dirname, 'public/template.pdf');

  // If template doesn't exist, create a simple one or provide instructions
  if (!fs.existsSync(templatePath)) {
    // For now, send a simple response indicating to create the template
    return res.status(404).json({
      error: 'Template not found. Please create a template PDF at backend/public/template.pdf'
    });
  }

  res.download(templatePath, 'handwriting_template.pdf');
});

// Upload a scanned handwriting sheet
router.post('/upload', upload.single('sheet'), async (req, res) => {
  // 'sheet' is the field name expected from the form-data
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const userId = req.session.userId;
    const imagePath = req.file.path; // temporary saved path

    // Process the image to segment into characters
    const segments = await segmentHandwritingSheet(imagePath);
    // segments is expected to be an object like { 'A': '<path>', 'B': '<path>', ... }

    // Save each segment image to the user's profile
    Object.entries(segments).forEach(([char, imgPath]) => {
      saveCharacterImage(userId, char, imgPath);
    });

    // Remove temp file if needed
    fs.unlinkSync(imagePath);

    res.json({ message: 'Sheet processed successfully', chars: Object.keys(segments) });
  } catch (err) {
    console.error('Error processing handwriting sheet:', err);
    res.status(500).json({ error: 'Failed to process sheet' });
  }
});

// Save a drawn character (vector strokes)
router.post('/save-char', express.json(), (req, res) => {
  // expects JSON body with { char: 'A', strokes: [ [ {x,y}, ... ], ... ] }
  const userId = req.session.userId;
  const { char, strokes } = req.body;

  if (!char || !strokes) {
    return res.status(400).json({ error: 'Char and strokes data required' });
  }

  saveCharacterStrokes(userId, char, strokes);
  res.json({ message: `Character ${char} saved` });
});

// Get current profile info (e.g., which chars are available)
router.get('/profile', (req, res) => {
  const user = getUserById(req.session.userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Return a summary of available characters (and maybe links to their images)
  const profile = user.profile || {};
  res.json({
    id: user.id,
    username: user.username,
    letters: Object.keys(profile.letters || {})
  });
});

module.exports = router;
