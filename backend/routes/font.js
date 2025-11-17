const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {
  generateFont,
  fontExists,
  getFontPath,
  getFontInfo,
  deleteFont,
} = require('../fontGenerator');
const logger = require('../logger');

/**
 * POST /api/font/generate
 * Generate a font from the current user's handwriting profile
 *
 * Body (optional):
 *   - familyName: Custom font family name
 *   - styleName: Font style (default: 'Regular')
 *   - regenerate: Force regeneration even if font exists (default: false)
 */
router.post('/generate', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { familyName, styleName, regenerate = false } = req.body;

    // Check if font already exists
    if (!regenerate && fontExists(userId)) {
      logger.info(`Font already exists for user ${userId}, returning existing font info`);
      const info = getFontInfo(userId);
      return res.json({
        message: 'Font already exists. Use regenerate=true to create a new one.',
        ...info,
        paths: {
          ttf: `/api/font/download/${userId}/ttf`,
          woff2: `/api/font/download/${userId}/woff2`,
          css: `/api/font/css/${userId}`,
        },
      });
    }

    // Generate the font
    logger.info(`Generating font for user ${userId}`);
    const result = await generateFont(userId, { familyName, styleName });

    res.json({
      message: 'Font generated successfully',
      ...result,
    });
  } catch (error) {
    logger.error('Font generation error:', error);
    res.status(500).json({
      error: 'Failed to generate font',
      message: error.message,
    });
  }
});

/**
 * GET /api/font/info
 * Get information about the current user's font
 */
router.get('/info', (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const info = getFontInfo(userId);
    if (!info) {
      return res.status(404).json({
        error: 'Font not found',
        message: 'No font has been generated yet. Use POST /api/font/generate to create one.',
      });
    }

    res.json({
      ...info,
      paths: {
        ttf: `/api/font/download/${userId}/ttf`,
        woff2: `/api/font/download/${userId}/woff2`,
        css: `/api/font/css/${userId}`,
      },
    });
  } catch (error) {
    logger.error('Error getting font info:', error);
    res.status(500).json({
      error: 'Failed to get font info',
      message: error.message,
    });
  }
});

/**
 * GET /api/font/download/:userId/:format
 * Download a font file
 *
 * Params:
 *   - userId: User ID (must match session for security)
 *   - format: 'ttf' or 'woff2'
 */
router.get('/download/:userId/:format', (req, res) => {
  try {
    const { userId, format } = req.params;
    const sessionUserId = req.session.userId;

    // Security: Only allow users to download their own fonts
    if (userId !== sessionUserId) {
      logger.warn(`Unauthorized font download attempt: session user ${sessionUserId} tried to download font for ${userId}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate format
    const validFormats = ['ttf', 'woff2'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        error: 'Invalid format',
        message: `Format must be one of: ${validFormats.join(', ')}`,
      });
    }

    // Get font file path
    const fontPath = getFontPath(userId, format);
    if (!fontPath) {
      return res.status(404).json({
        error: 'Font not found',
        message: `No ${format.toUpperCase()} font found. Generate a font first using POST /api/font/generate`,
      });
    }

    // Get font info for filename
    const info = getFontInfo(userId);
    const familyName = info ? info.familyName.replace(/\s+/g, '') : 'CustomHandwriting';
    const filename = `${familyName}.${format}`;

    // Set appropriate content type
    const contentTypes = {
      ttf: 'font/ttf',
      woff2: 'font/woff2',
    };

    logger.info(`Serving font file: ${fontPath} as ${filename}`);

    res.setHeader('Content-Type', contentTypes[format]);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(fontPath);
  } catch (error) {
    logger.error('Font download error:', error);
    res.status(500).json({
      error: 'Failed to download font',
      message: error.message,
    });
  }
});

/**
 * GET /api/font/css/:userId
 * Get the @font-face CSS for a user's font
 */
router.get('/css/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const sessionUserId = req.session.userId;

    // Security: Only allow users to access their own font CSS
    if (userId !== sessionUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const cssPath = getFontPath(userId, 'css');
    if (!cssPath) {
      return res.status(404).json({
        error: 'CSS file not found',
        message: 'Generate a font first using POST /api/font/generate',
      });
    }

    const cssContent = fs.readFileSync(cssPath, 'utf8');

    res.setHeader('Content-Type', 'text/css');
    res.send(cssContent);
  } catch (error) {
    logger.error('CSS retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve CSS',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/font
 * Delete the current user's font files
 */
router.delete('/', (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const deleted = deleteFont(userId);
    if (!deleted) {
      return res.status(404).json({
        error: 'No font files found',
        message: 'No font files to delete',
      });
    }

    logger.info(`Deleted font files for user: ${userId}`);
    res.json({
      message: 'Font files deleted successfully',
    });
  } catch (error) {
    logger.error('Font deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete font',
      message: error.message,
    });
  }
});

module.exports = router;
