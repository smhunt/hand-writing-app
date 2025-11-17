const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const { getUserById } = require('./storage');
const {
  getUnicodeForChar,
  canvasStrokesToOpentypePath,
  calculateAdvanceWidth,
} = require('./fontUtils');
const logger = require('./logger');

// ttf2woff2 is an ES module, so we need to import it dynamically
let ttf2woff2;
(async () => {
  ttf2woff2 = (await import('ttf2woff2')).default;
})();

// Font configuration constants
const FONT_UNITS_PER_EM = 1000;
const FONT_ASCENDER = 800;
const FONT_DESCENDER = -200;
const DEFAULT_ADVANCE_WIDTH = 600;
const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;

// Directory for generated fonts
const FONTS_DIR = path.join(__dirname, 'data/fonts');

// Ensure fonts directory exists
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
  logger.info('Created fonts directory:', FONTS_DIR);
}

/**
 * Create the required .notdef glyph
 * This glyph is shown for missing characters
 */
function createNotDefGlyph() {
  const notdefPath = new opentype.Path();

  // Draw a simple rectangle as placeholder
  const width = 500;
  const height = 700;
  const x = 50;
  const y = 50;

  notdefPath.moveTo(x, y);
  notdefPath.lineTo(x + width, y);
  notdefPath.lineTo(x + width, y + height);
  notdefPath.lineTo(x, y + height);
  notdefPath.close();

  // Inner rectangle (to create outline)
  const innerX = x + 50;
  const innerY = y + 50;
  const innerWidth = width - 100;
  const innerHeight = height - 100;

  notdefPath.moveTo(innerX, innerY);
  notdefPath.lineTo(innerX, innerY + innerHeight);
  notdefPath.lineTo(innerX + innerWidth, innerY + innerHeight);
  notdefPath.lineTo(innerX + innerWidth, innerY);
  notdefPath.close();

  return new opentype.Glyph({
    name: '.notdef',
    unicode: undefined,
    advanceWidth: 600,
    path: notdefPath,
  });
}

/**
 * Create a space glyph (invisible but with spacing)
 */
function createSpaceGlyph() {
  return new opentype.Glyph({
    name: 'space',
    unicode: 32,
    advanceWidth: FONT_UNITS_PER_EM / 3, // Space is 1/3 em wide
    path: new opentype.Path(), // Empty path
  });
}

/**
 * Create a glyph from vector stroke data
 *
 * @param {string} char - The character this glyph represents
 * @param {Array<Array<{x: number, y: number}>>} strokes - Stroke data from canvas
 * @returns {opentype.Glyph}
 */
function createGlyphFromStrokes(char, strokes) {
  const unicode = getUnicodeForChar(char);
  const path = canvasStrokesToOpentypePath(
    strokes,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    FONT_UNITS_PER_EM,
    true // Enable path smoothing
  );

  // Calculate appropriate advance width based on character bounds
  const advanceWidth = calculateAdvanceWidth(
    strokes,
    CANVAS_WIDTH,
    FONT_UNITS_PER_EM,
    0.2 // 20% extra spacing
  ) || DEFAULT_ADVANCE_WIDTH;

  return new opentype.Glyph({
    name: char,
    unicode: unicode,
    advanceWidth: advanceWidth,
    path: path,
  });
}

/**
 * Generate glyphs from user profile data
 *
 * @param {Object} user - User object from storage
 * @returns {{glyphs: Array<opentype.Glyph>, skippedChars: Array<string>, vectorChars: Array<string>}}
 */
function generateGlyphsFromProfile(user) {
  const glyphs = [];
  const skippedChars = [];
  const vectorChars = [];

  // Add required .notdef glyph (must be first)
  glyphs.push(createNotDefGlyph());

  // Check if user has a space character, if not, add default space
  const hasSpace = user.profile.letters[' '] && user.profile.letters[' '].type === 'vector';
  if (!hasSpace) {
    glyphs.push(createSpaceGlyph());
    logger.info('Added default space glyph');
  }

  // Process each character in the user's profile
  const letters = user.profile.letters || {};
  Object.entries(letters).forEach(([char, data]) => {
    if (data.type === 'vector' && data.strokes && Array.isArray(data.strokes)) {
      try {
        const glyph = createGlyphFromStrokes(char, data.strokes);
        glyphs.push(glyph);
        vectorChars.push(char);
        logger.debug(`Created glyph for character: ${char} (Unicode: ${getUnicodeForChar(char)})`);
      } catch (error) {
        logger.error(`Failed to create glyph for character '${char}':`, error);
        skippedChars.push(char);
      }
    } else if (data.type === 'image') {
      // Image characters are not supported yet
      skippedChars.push(char);
      logger.debug(`Skipped image-based character: ${char}`);
    } else {
      logger.warn(`Unknown character data type for '${char}':`, data);
      skippedChars.push(char);
    }
  });

  logger.info(`Generated ${glyphs.length} glyphs (${vectorChars.length} characters, ${skippedChars.length} skipped)`);

  return { glyphs, skippedChars, vectorChars };
}

/**
 * Generate font for a user
 *
 * @param {string} userId - User ID
 * @param {Object} options - Font generation options
 * @param {string} options.familyName - Custom font family name (defaults to username)
 * @param {string} options.styleName - Font style name (default: 'Regular')
 * @returns {Promise<Object>} - Font generation result
 */
async function generateFont(userId, options = {}) {
  logger.info(`Starting font generation for user: ${userId}`);

  // Load user data
  const user = getUserById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Determine font family name
  const familyName = options.familyName || `${user.username}Handwriting`;
  const styleName = options.styleName || 'Regular';
  const fullName = `${familyName} ${styleName}`;

  logger.info(`Generating font: ${fullName}`);

  // Generate glyphs from user profile
  const { glyphs, skippedChars, vectorChars } = generateGlyphsFromProfile(user);

  if (glyphs.length <= 1) { // Only .notdef
    throw new Error('No vector characters available to generate font. Please draw some characters first.');
  }

  // Create the font
  const font = new opentype.Font({
    familyName: familyName,
    styleName: styleName,
    fullName: fullName,
    postScriptName: familyName.replace(/\s+/g, ''),
    unitsPerEm: FONT_UNITS_PER_EM,
    ascender: FONT_ASCENDER,
    descender: FONT_DESCENDER,
    designer: user.username,
    designerURL: '',
    manufacturer: 'Handwriting App',
    manufacturerURL: '',
    license: 'Personal use only',
    licenseURL: '',
    version: 'Version 1.0',
    description: `Custom handwriting font created from ${user.username}'s handwriting`,
    glyphs: glyphs,
  });

  // Generate TTF
  const ttfBuffer = Buffer.from(font.toArrayBuffer());
  const ttfPath = path.join(FONTS_DIR, `${userId}.ttf`);
  fs.writeFileSync(ttfPath, ttfBuffer);
  logger.info(`Generated TTF font: ${ttfPath}`);

  // Convert to WOFF2 for web use
  // Wait for ttf2woff2 to be loaded if not already
  if (!ttf2woff2) {
    ttf2woff2 = (await import('ttf2woff2')).default;
  }
  const woff2Buffer = ttf2woff2(ttfBuffer);
  const woff2Path = path.join(FONTS_DIR, `${userId}.woff2`);
  fs.writeFileSync(woff2Path, woff2Buffer);
  logger.info(`Generated WOFF2 font: ${woff2Path}`);

  // Generate CSS for web font usage
  const cssContent = generateFontFaceCSS(familyName, userId);
  const cssPath = path.join(FONTS_DIR, `${userId}.css`);
  fs.writeFileSync(cssPath, cssContent);
  logger.info(`Generated CSS file: ${cssPath}`);

  const result = {
    success: true,
    familyName,
    styleName,
    fullName,
    glyphCount: glyphs.length,
    characterCount: vectorChars.length,
    characters: vectorChars,
    skippedCharacters: skippedChars,
    files: {
      ttf: ttfPath,
      woff2: woff2Path,
      css: cssPath,
    },
    paths: {
      ttf: `/api/font/download/${userId}/ttf`,
      woff2: `/api/font/download/${userId}/woff2`,
      css: `/api/font/css/${userId}`,
    },
  };

  logger.info(`Font generation completed successfully for user: ${userId}`);
  return result;
}

/**
 * Generate @font-face CSS for web font usage
 *
 * @param {string} familyName - Font family name
 * @param {string} userId - User ID
 * @returns {string} - CSS content
 */
function generateFontFaceCSS(familyName, userId) {
  return `/**
 * Custom Handwriting Font
 * Generated by Handwriting App
 */

@font-face {
  font-family: '${familyName}';
  src: url('/api/font/download/${userId}/woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* Usage example:
 * body {
 *   font-family: '${familyName}', cursive, sans-serif;
 * }
 */
`;
}

/**
 * Check if a font exists for a user
 *
 * @param {string} userId - User ID
 * @returns {boolean}
 */
function fontExists(userId) {
  const ttfPath = path.join(FONTS_DIR, `${userId}.ttf`);
  return fs.existsSync(ttfPath);
}

/**
 * Get font file path
 *
 * @param {string} userId - User ID
 * @param {string} format - Font format ('ttf' or 'woff2')
 * @returns {string|null} - File path or null if not found
 */
function getFontPath(userId, format = 'ttf') {
  const validFormats = ['ttf', 'woff2', 'css'];
  if (!validFormats.includes(format)) {
    throw new Error(`Invalid font format: ${format}. Must be one of: ${validFormats.join(', ')}`);
  }

  const fontPath = path.join(FONTS_DIR, `${userId}.${format}`);
  return fs.existsSync(fontPath) ? fontPath : null;
}

/**
 * Get font information for a user
 *
 * @param {string} userId - User ID
 * @returns {Object|null} - Font info or null if not found
 */
function getFontInfo(userId) {
  const user = getUserById(userId);
  if (!user) return null;

  const ttfPath = getFontPath(userId, 'ttf');
  if (!ttfPath) return null;

  const { vectorChars, skippedChars } = generateGlyphsFromProfile(user);
  const familyName = `${user.username}Handwriting`;

  return {
    familyName,
    characterCount: vectorChars.length,
    characters: vectorChars,
    skippedCharacters: skippedChars,
    formats: {
      ttf: fs.existsSync(path.join(FONTS_DIR, `${userId}.ttf`)),
      woff2: fs.existsSync(path.join(FONTS_DIR, `${userId}.woff2`)),
      css: fs.existsSync(path.join(FONTS_DIR, `${userId}.css`)),
    },
  };
}

/**
 * Delete font files for a user
 *
 * @param {string} userId - User ID
 * @returns {boolean} - True if files were deleted
 */
function deleteFont(userId) {
  let deleted = false;
  const formats = ['ttf', 'woff2', 'css'];

  formats.forEach(format => {
    const fontPath = path.join(FONTS_DIR, `${userId}.${format}`);
    if (fs.existsSync(fontPath)) {
      fs.unlinkSync(fontPath);
      logger.info(`Deleted font file: ${fontPath}`);
      deleted = true;
    }
  });

  return deleted;
}

module.exports = {
  generateFont,
  fontExists,
  getFontPath,
  getFontInfo,
  deleteFont,
  FONTS_DIR,
};
