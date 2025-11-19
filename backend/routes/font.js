const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {
  generateFont,
  fontExists,
  getFontPath,
  getFontInfo,
  deleteFont: deleteFontFiles,
} = require('../fontGenerator');
const {
  createFont,
  listUserFonts,
  deleteFont,
  setCurrentFont,
  getUserById,
} = require('../storage');
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

/**
 * GET /api/fonts
 * List all fonts in the user's font library
 */
router.get('/fonts', (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const fonts = listUserFonts(userId);
    const currentFontId = user.profile.currentFontId || 'default';

    res.json({
      fonts: fonts.map(font => ({
        ...font,
        characterCount: Object.keys(font.letters || {}).length,
        isCurrent: font.id === currentFontId,
      })),
      currentFontId,
    });
  } catch (error) {
    logger.error('Error listing fonts:', error);
    res.status(500).json({
      error: 'Failed to list fonts',
      message: error.message,
    });
  }
});

/**
 * POST /api/fonts
 * Create a new font in the user's library
 *
 * Body:
 *   - name: Font name (required)
 */
router.post('/fonts', (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid font name',
        message: 'Font name is required and must be a non-empty string',
      });
    }

    const font = createFont(userId, name.trim());
    if (!font) {
      return res.status(500).json({ error: 'Failed to create font' });
    }

    logger.info(`Created new font "${name}" (${font.id}) for user ${userId}`);
    res.json({
      message: 'Font created successfully',
      font: {
        ...font,
        characterCount: 0,
      },
    });
  } catch (error) {
    logger.error('Error creating font:', error);
    res.status(500).json({
      error: 'Failed to create font',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/fonts/:fontId
 * Delete a specific font from the user's library
 */
router.delete('/fonts/:fontId', (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { fontId } = req.params;

    if (fontId === 'default') {
      return res.status(400).json({
        error: 'Cannot delete default font',
        message: 'The default font cannot be deleted',
      });
    }

    const deleted = deleteFont(userId, fontId);
    if (!deleted) {
      return res.status(404).json({
        error: 'Font not found',
        message: 'Font does not exist or could not be deleted',
      });
    }

    // Also delete the generated font files if they exist
    deleteFontFiles(`${userId}_${fontId}`);

    logger.info(`Deleted font ${fontId} for user ${userId}`);
    res.json({
      message: 'Font deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting font:', error);
    res.status(500).json({
      error: 'Failed to delete font',
      message: error.message,
    });
  }
});

/**
 * PUT /api/fonts/:fontId
 * Update a font's metadata (currently just the name)
 */
router.put('/fonts/:fontId', (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { fontId } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid font name',
        message: 'Font name is required and must be a non-empty string',
      });
    }

    const user = getUserById(userId);
    if (!user || !user.profile.fonts || !user.profile.fonts[fontId]) {
      return res.status(404).json({ error: 'Font not found' });
    }

    user.profile.fonts[fontId].name = name.trim();
    user.profile.fonts[fontId].updatedAt = new Date().toISOString();

    // Save changes (note: storage.js doesn't export saveDB, so we need to use a storage function)
    // We'll use setCurrentFont and set it back to trigger a save
    const currentFontId = user.profile.currentFontId;
    setCurrentFont(userId, currentFontId);

    logger.info(`Updated font ${fontId} name to "${name}" for user ${userId}`);
    res.json({
      message: 'Font updated successfully',
      font: user.profile.fonts[fontId],
    });
  } catch (error) {
    logger.error('Error updating font:', error);
    res.status(500).json({
      error: 'Failed to update font',
      message: error.message,
    });
  }
});

/**
 * POST /api/fonts/:fontId/select
 * Set a font as the current active font
 */
router.post('/fonts/:fontId/select', (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { fontId } = req.params;

    const success = setCurrentFont(userId, fontId);
    if (!success) {
      return res.status(404).json({
        error: 'Font not found',
        message: 'The specified font does not exist',
      });
    }

    logger.info(`Set font ${fontId} as current for user ${userId}`);
    res.json({
      message: 'Current font updated successfully',
      currentFontId: fontId,
    });
  } catch (error) {
    logger.error('Error selecting font:', error);
    res.status(500).json({
      error: 'Failed to select font',
      message: error.message,
    });
  }
});

/**
 * POST /api/fonts/:fontId/generate
 * Generate a specific font file
 */
router.post('/fonts/:fontId/generate', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { fontId } = req.params;
    const { familyName, styleName, regenerate = false } = req.body;

    const user = getUserById(userId);
    if (!user || !user.profile.fonts || !user.profile.fonts[fontId]) {
      return res.status(404).json({ error: 'Font not found' });
    }

    const font = user.profile.fonts[fontId];

    // Check if font already exists
    const fontKey = `${userId}_${fontId}`;
    if (!regenerate && fontExists(fontKey)) {
      logger.info(`Font already exists for ${fontKey}, returning existing font info`);
      const info = getFontInfo(fontKey);
      return res.json({
        message: 'Font already exists. Use regenerate=true to create a new one.',
        ...info,
        paths: {
          ttf: `/api/fonts/${fontId}/download/ttf`,
          woff2: `/api/fonts/${fontId}/download/woff2`,
          css: `/api/fonts/${fontId}/css`,
        },
      });
    }

    // Generate the font with fontId
    logger.info(`Generating font ${fontId} for user ${userId}`);
    const result = await generateFont(userId, {
      familyName: familyName || font.name,
      styleName,
      fontId,
    });

    res.json({
      message: 'Font generated successfully',
      ...result,
      paths: {
        ttf: `/api/fonts/${fontId}/download/ttf`,
        woff2: `/api/fonts/${fontId}/download/woff2`,
        css: `/api/fonts/${fontId}/css`,
      },
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
 * GET /api/fonts/:fontId/download/:format
 * Download a specific font file
 */
router.get('/fonts/:fontId/download/:format', (req, res) => {
  try {
    const { fontId, format } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate format
    const validFormats = ['ttf', 'woff2'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        error: 'Invalid format',
        message: `Format must be one of: ${validFormats.join(', ')}`,
      });
    }

    // Verify font belongs to user
    const user = getUserById(userId);
    if (!user || !user.profile.fonts || !user.profile.fonts[fontId]) {
      return res.status(404).json({ error: 'Font not found' });
    }

    // Get font file path
    const fontKey = `${userId}_${fontId}`;
    const fontPath = getFontPath(fontKey, format);
    if (!fontPath) {
      return res.status(404).json({
        error: 'Font file not found',
        message: `No ${format.toUpperCase()} font found. Generate the font first using POST /api/fonts/${fontId}/generate`,
      });
    }

    const font = user.profile.fonts[fontId];
    const familyName = font.name.replace(/\s+/g, '');
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
 * GET /api/fonts/:fontId/css
 * Get the @font-face CSS for a specific font
 */
router.get('/fonts/:fontId/css', (req, res) => {
  try {
    const { fontId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify font belongs to user
    const user = getUserById(userId);
    if (!user || !user.profile.fonts || !user.profile.fonts[fontId]) {
      return res.status(404).json({ error: 'Font not found' });
    }

    const fontKey = `${userId}_${fontId}`;
    const cssPath = getFontPath(fontKey, 'css');
    if (!cssPath) {
      return res.status(404).json({
        error: 'CSS file not found',
        message: 'Generate the font first using POST /api/fonts/${fontId}/generate',
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

module.exports = router;
