const validator = require('validator');

// Sanitize and validate character input
function validateCharacterInput(req, res, next) {
  const { char, strokes } = req.body;

  // Validate character
  if (!char || typeof char !== 'string') {
    return res.status(400).json({ error: 'Invalid character' });
  }

  // Character should be a single printable character
  if (char.length !== 1) {
    return res.status(400).json({ error: 'Character must be a single character' });
  }

  // Validate strokes array
  if (!Array.isArray(strokes)) {
    return res.status(400).json({ error: 'Strokes must be an array' });
  }

  // Validate stroke data structure
  for (const stroke of strokes) {
    if (!Array.isArray(stroke)) {
      return res.status(400).json({ error: 'Each stroke must be an array of points' });
    }

    for (const point of stroke) {
      if (typeof point.x !== 'number' || typeof point.y !== 'number') {
        return res.status(400).json({ error: 'Each point must have numeric x and y coordinates' });
      }

      // Validate coordinate ranges (prevent ridiculous values)
      if (point.x < -10000 || point.x > 10000 || point.y < -10000 || point.y > 10000) {
        return res.status(400).json({ error: 'Coordinate values out of acceptable range' });
      }
    }
  }

  // Limit total number of strokes and points (prevent DoS)
  const maxStrokes = 100;
  const maxPointsPerStroke = 1000;

  if (strokes.length > maxStrokes) {
    return res.status(400).json({ error: `Maximum ${maxStrokes} strokes allowed` });
  }

  for (const stroke of strokes) {
    if (stroke.length > maxPointsPerStroke) {
      return res.status(400).json({ error: `Maximum ${maxPointsPerStroke} points per stroke allowed` });
    }
  }

  next();
}

// Validate file uploads
function validateFileUpload(req, res, next) {
  if (!req.file) {
    return next();
  }

  const file = req.file;
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (file.size > maxSize) {
    return res.status(400).json({ error: 'File size exceeds 10MB limit' });
  }

  if (!allowedMimes.includes(file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and PDF allowed' });
  }

  next();
}

// Sanitize text input (prevent XSS)
function sanitizeTextInput(req, res, next) {
  if (req.body.text && typeof req.body.text === 'string') {
    // Basic XSS prevention - escape HTML entities
    req.body.text = validator.escape(req.body.text);
  }

  next();
}

module.exports = {
  validateCharacterInput,
  validateFileUpload,
  sanitizeTextInput,
};
