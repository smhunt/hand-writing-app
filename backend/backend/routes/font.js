const express = require('express');
const { getOrCreateAuth0User, listUserFonts, createFont, deleteFont, setCurrentFont } = require('../storage');
const router = express.Router();

// List all fonts for the current user
router.get('/list', (req, res) => {
  try {
    let userId;
    if (req.oidc && req.oidc.isAuthenticated()) {
      const user = getOrCreateAuth0User(req.oidc.user);
      userId = user.id;
    } else {
      userId = req.session.userId;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const fonts = listUserFonts(userId);
    res.json({ fonts });
  } catch (error) {
    console.error('[FONTS] Error listing fonts:', error);
    res.status(500).json({ error: 'Failed to list fonts' });
  }
});

// Create a new font
router.post('/create', express.json(), (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Font name required' });
    }

    let userId;
    if (req.oidc && req.oidc.isAuthenticated()) {
      const user = getOrCreateAuth0User(req.oidc.user);
      userId = user.id;
    } else {
      userId = req.session.userId;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const font = createFont(userId, name.trim());
    if (!font) {
      return res.status(500).json({ error: 'Failed to create font' });
    }

    res.json({ font });
  } catch (error) {
    console.error('[FONTS] Error creating font:', error);
    res.status(500).json({ error: 'Failed to create font' });
  }
});

// Delete a font
router.delete('/:fontId', (req, res) => {
  try {
    const { fontId } = req.params;

    let userId;
    if (req.oidc && req.oidc.isAuthenticated()) {
      const user = getOrCreateAuth0User(req.oidc.user);
      userId = user.id;
    } else {
      userId = req.session.userId;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const success = deleteFont(userId, fontId);
    if (!success) {
      return res.status(400).json({ error: 'Cannot delete font (default or not found)' });
    }

    res.json({ message: 'Font deleted successfully' });
  } catch (error) {
    console.error('[FONTS] Error deleting font:', error);
    res.status(500).json({ error: 'Failed to delete font' });
  }
});

// Set current active font
router.post('/set-current', express.json(), (req, res) => {
  try {
    const { fontId } = req.body;

    if (!fontId) {
      return res.status(400).json({ error: 'Font ID required' });
    }

    let userId;
    if (req.oidc && req.oidc.isAuthenticated()) {
      const user = getOrCreateAuth0User(req.oidc.user);
      userId = user.id;
    } else {
      userId = req.session.userId;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const success = setCurrentFont(userId, fontId);
    if (!success) {
      return res.status(404).json({ error: 'Font not found' });
    }

    res.json({ message: 'Current font updated successfully' });
  } catch (error) {
    console.error('[FONTS] Error setting current font:', error);
    res.status(500).json({ error: 'Failed to set current font' });
  }
});

module.exports = router;
