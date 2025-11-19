const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getUserById,
  getOrCreateAuth0User,
  getOrCreateDevUser,
  saveCharacterImage,
  saveCharacterStrokes,
  saveCharacterToFont,
} = require('./storage');
const { segmentHandwritingSheet } = require('./handwriting');
const { validateCharacterInput, validateFileUpload } = require('./middleware/validation');

const router = express.Router();

// Configure Multer to save uploads to a temp directory with original extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'data/uploads/tmp'));
  },
  filename: function (req, file, cb) {
    // Keep original extension for OpenCV
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});
const upload = multer({ storage: storage });

// Download handwriting template (PDF)
router.get('/template', (req, res) => {
  // Check both possible filenames
  let templatePath = path.join(__dirname, 'public/handwriting_template.pdf');

  if (!fs.existsSync(templatePath)) {
    templatePath = path.join(__dirname, 'public/template.pdf');
  }

  if (!fs.existsSync(templatePath)) {
    return res.status(404).json({
      error: 'Template not found. Please create a template PDF at backend/public/template.pdf'
    });
  }

  res.download(templatePath, 'handwriting_template.pdf');
});

// Upload a scanned handwriting sheet
router.post('/upload', upload.single('sheet'), validateFileUpload, async (req, res) => {
  // 'sheet' is the field name expected from the form-data
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Auto-provision user if using Auth0, or dev user otherwise
    let user;
    if (req.oidc && req.oidc.isAuthenticated()) {
      user = getOrCreateAuth0User(req.oidc.user);
    } else {
      // For dev mode, auto-provision the user
      user = getOrCreateDevUser(req.session.userId);
    }

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = user.id;
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
    res.status(500).json({ error: 'Failed to process sheet', details: err.message });
  }
});

// Save a drawn character (vector strokes)
router.post('/save-char', express.json(), validateCharacterInput, (req, res) => {
  try {
    // Auto-provision user if using Auth0
    if (req.oidc && req.oidc.isAuthenticated()) {
      getOrCreateAuth0User(req.oidc.user);
    }

    // expects JSON body with { char: 'A', strokes: [ [ {x,y}, ... ], ... ] }
    const userId = req.session.userId || (req.oidc && req.oidc.user && req.oidc.user.sub);
    const { char, strokes } = req.body;

    console.log(`[SAVE-CHAR] User ${userId} saving character: ${char}`);

    if (!char || !strokes) {
      console.log('[SAVE-CHAR] Missing char or strokes data');
      return res.status(400).json({ error: 'Char and strokes data required' });
    }

    if (!userId) {
      console.log('[SAVE-CHAR] No userId in session');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user to determine current font
    const user = getUserById(userId);
    if (!user) {
      console.log(`[SAVE-CHAR] User ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Use current font or default
    const currentFontId = user.profile.currentFontId || 'default';

    // Save to current font (this also updates legacy letters for backward compatibility)
    const saved = saveCharacterToFont(userId, currentFontId, char, strokes);

    if (!saved) {
      console.log(`[SAVE-CHAR] Failed to save character ${char} to font ${currentFontId} for user ${userId}`);
      return res.status(500).json({ error: 'Failed to save character to database' });
    }

    console.log(`[SAVE-CHAR] Successfully saved character ${char} to font ${currentFontId} for user ${userId}`);
    res.json({
      message: `Character ${char} saved`,
      fontId: currentFontId,
    });
  } catch (error) {
    console.error('[SAVE-CHAR] Error:', error);
    res.status(500).json({ error: 'Failed to save character', details: error.message });
  }
});

// Get current profile info (e.g., which chars are available)
router.get('/profile', (req, res) => {
  // Auto-provision user if using Auth0, or dev user otherwise
  let user;
  if (req.oidc && req.oidc.isAuthenticated()) {
    user = getOrCreateAuth0User(req.oidc.user);
  } else {
    // For dev mode, auto-provision the user
    user = getOrCreateDevUser(req.session.userId);
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get current font or default
  const currentFontId = user.profile.currentFontId || 'default';
  const currentFont = user.profile.fonts?.[currentFontId];

  // Return characters from current font (fall back to legacy letters if needed)
  const letters = currentFont?.letters || user.profile.letters || {};

  // Organize characters by type
  const characterData = {};
  Object.entries(letters).forEach(([char, data]) => {
    characterData[char] = {
      type: data.type,
      hasData: true
    };
  });

  res.json({
    id: user.id,
    username: user.username,
    currentFontId: currentFontId,
    currentFontName: currentFont?.name || 'My Handwriting',
    letters: Object.keys(letters),
    characterData: characterData,
    stats: {
      total: Object.keys(letters).length,
      vector: Object.values(letters).filter(l => l.type === 'vector').length,
      image: Object.values(letters).filter(l => l.type === 'image').length
    }
  });
});

module.exports = router;
