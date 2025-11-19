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

  // Normalize and center strokes for consistent alignment
  const { normalizeStrokes } = require('./fontUtils');
  const normalizedStrokes = normalizeStrokes(
    strokes,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    15 // Padding to avoid edges
  );

  const path = canvasStrokesToOpentypePath(
    normalizedStrokes,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    FONT_UNITS_PER_EM,
    true // Enable path smoothing
  );

  // Calculate appropriate advance width based on original character bounds
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
 * Create a glyph from an image file (scanned character)
 *
 * @param {string} char - The character this glyph represents
 * @param {string} imagePath - Path to the character image
 * @returns {opentype.Glyph}
 */
function createGlyphFromImage(char, imagePath) {
  const { execSync } = require('child_process');

  try {
    // Convert image to SVG path using Python script
    const scriptPath = path.join(__dirname, 'image_to_svg.py');
    const result = execSync(`python3 "${scriptPath}" "${imagePath}"`, {
      encoding: 'utf-8',
      timeout: 10000
    });

    const jsonResult = JSON.parse(result);

    if (!jsonResult.success || !jsonResult.path) {
      throw new Error(`Failed to convert image to SVG: ${jsonResult.error || 'Unknown error'}`);
    }

    // Parse SVG path and convert to OpenType path
    const path = svgPathToOpentypePath(jsonResult.path);

    // Calculate appropriate advance width (use default for now, can be improved)
    const advanceWidth = DEFAULT_ADVANCE_WIDTH;

    return new opentype.Glyph({
      name: char,
      unicode: getUnicodeForChar(char),
      advanceWidth: advanceWidth,
      path: path,
    });
  } catch (error) {
    logger.error(`Failed to create glyph from image for '${char}':`, error);
    throw error;
  }
}

/**
 * Convert SVG path string to OpenType Path object
 *
 * @param {string} svgPath - SVG path command string (e.g., "M 10 20 L 30 40 Z")
 * @returns {opentype.Path}
 */
function svgPathToOpentypePath(svgPath) {
  const path = new opentype.Path();

  if (!svgPath) {
    return path;
  }

  // Parse SVG path commands
  const commands = svgPath.trim().split(/\s+/);
  let currentCommand = null;
  let i = 0;

  while (i < commands.length) {
    const token = commands[i];

    if (token === 'M' || token === 'L') {
      currentCommand = token;
      i++;
      continue;
    } else if (token === 'Z') {
      path.close();
      i++;
      continue;
    }

    // Parse coordinates
    const x = parseFloat(token);
    const y = parseFloat(commands[i + 1]);

    if (isNaN(x) || isNaN(y)) {
      i++;
      continue;
    }

    // Scale from 200x200 image to 1000 units
    const scale = FONT_UNITS_PER_EM / 200;
    const scaledX = x * scale;
    // Flip Y-axis (SVG has Y down, fonts have Y up)
    const scaledY = (200 - y) * scale;

    if (currentCommand === 'M') {
      path.moveTo(scaledX, scaledY);
    } else if (currentCommand === 'L') {
      path.lineTo(scaledX, scaledY);
    }

    i += 2;
  }

  return path;
}

/**
 * Generate glyphs from a letters object
 *
 * @param {Object} letters - Letters object mapping characters to data {type, strokes/imagePath}
 * @returns {{glyphs: Array<opentype.Glyph>, skippedChars: Array<string>, vectorChars: Array<string>}}
 */
function generateGlyphsFromLetters(letters) {
  const glyphs = [];
  const skippedChars = [];
  const vectorChars = [];

  // Add required .notdef glyph (must be first)
  glyphs.push(createNotDefGlyph());

  // Check if user has a space character, if not, add default space
  const hasSpace = letters[' '] && letters[' '].type === 'vector';
  if (!hasSpace) {
    glyphs.push(createSpaceGlyph());
    logger.info('Added default space glyph');
  }

  // Process each character in the letters set
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
    } else if (data.type === 'image' && data.imagePath) {
      // Convert image to vector and create glyph
      try {
        const glyph = createGlyphFromImage(char, data.imagePath);
        glyphs.push(glyph);
        vectorChars.push(char);
        logger.debug(`Created glyph from image for character: ${char} (Unicode: ${getUnicodeForChar(char)})`);
      } catch (error) {
        logger.error(`Failed to create glyph from image for '${char}':`, error);
        skippedChars.push(char);
      }
    } else {
      logger.warn(`Unknown character data type for '${char}':`, data);
      skippedChars.push(char);
    }
  });

  logger.info(`Generated ${glyphs.length} glyphs (${vectorChars.length} characters, ${skippedChars.length} skipped)`);

  return { glyphs, skippedChars, vectorChars };
}

/**
 * Generate glyphs from user profile data (legacy method for backward compatibility)
 *
 * @param {Object} user - User object from storage
 * @returns {{glyphs: Array<opentype.Glyph>, skippedChars: Array<string>, vectorChars: Array<string>}}
 */
function generateGlyphsFromProfile(user) {
  const letters = user.profile.letters || {};
  return generateGlyphsFromLetters(letters);
}

/**
 * Generate font for a user
 *
 * @param {string} userId - User ID
 * @param {Object} options - Font generation options
 * @param {string} options.familyName - Custom font family name (defaults to username)
 * @param {string} options.styleName - Font style name (default: 'Regular')
 * @param {string} options.fontId - Specific font ID to generate (optional, defaults to user.profile.letters)
 * @returns {Promise<Object>} - Font generation result
 */
async function generateFont(userId, options = {}) {
  logger.info(`Starting font generation for user: ${userId}${options.fontId ? `, font: ${options.fontId}` : ''}`);

  // Load user data
  const user = getUserById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Determine which character set to use
  let letters;
  if (options.fontId) {
    // Use specific font from font library
    if (!user.profile.fonts || !user.profile.fonts[options.fontId]) {
      throw new Error(`Font not found: ${options.fontId}`);
    }
    letters = user.profile.fonts[options.fontId].letters || {};
  } else {
    // Use legacy letters (backward compatibility)
    letters = user.profile.letters || {};
  }

  // Determine font family name
  const familyName = options.familyName || `${user.username}Handwriting`;
  const styleName = options.styleName || 'Regular';
  const fullName = `${familyName} ${styleName}`;

  logger.info(`Generating font: ${fullName}`);

  // Generate glyphs from the selected character set
  const { glyphs, skippedChars, vectorChars } = generateGlyphsFromLetters(letters);

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

  // Determine font file key (userId_fontId or just userId for legacy)
  const fontKey = options.fontId ? `${userId}_${options.fontId}` : userId;

  // Generate TTF
  const ttfBuffer = Buffer.from(font.toArrayBuffer());
  const ttfPath = path.join(FONTS_DIR, `${fontKey}.ttf`);
  fs.writeFileSync(ttfPath, ttfBuffer);
  logger.info(`Generated TTF font: ${ttfPath}`);

  // Convert to WOFF2 for web use
  // Wait for ttf2woff2 to be loaded if not already
  if (!ttf2woff2) {
    ttf2woff2 = (await import('ttf2woff2')).default;
  }
  const woff2Buffer = ttf2woff2(ttfBuffer);
  const woff2Path = path.join(FONTS_DIR, `${fontKey}.woff2`);
  fs.writeFileSync(woff2Path, woff2Buffer);
  logger.info(`Generated WOFF2 font: ${woff2Path}`);

  // Generate CSS for web font usage
  const cssContent = generateFontFaceCSS(familyName, fontKey);
  const cssPath = path.join(FONTS_DIR, `${fontKey}.css`);
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
 * @param {string} fontKey - Font key (userId or userId_fontId)
 * @returns {string} - CSS content
 */
function generateFontFaceCSS(familyName, fontKey) {
  // Determine the download URL based on whether this is a multi-font (contains underscore)
  const downloadUrl = fontKey.includes('_')
    ? `/api/fonts/${fontKey.split('_')[1]}/download/woff2`
    : `/api/font/download/${fontKey}/woff2`;

  return `/**
 * Custom Handwriting Font
 * Generated by Handwriting App
 */

@font-face {
  font-family: '${familyName}';
  src: url('${downloadUrl}') format('woff2');
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
 * Check if a font exists for a user/font
 *
 * @param {string} fontKey - Font key (userId or userId_fontId)
 * @returns {boolean}
 */
function fontExists(fontKey) {
  const ttfPath = path.join(FONTS_DIR, `${fontKey}.ttf`);
  return fs.existsSync(ttfPath);
}

/**
 * Get font file path
 *
 * @param {string} fontKey - Font key (userId or userId_fontId)
 * @param {string} format - Font format ('ttf' or 'woff2')
 * @returns {string|null} - File path or null if not found
 */
function getFontPath(fontKey, format = 'ttf') {
  const validFormats = ['ttf', 'woff2', 'css'];
  if (!validFormats.includes(format)) {
    throw new Error(`Invalid font format: ${format}. Must be one of: ${validFormats.join(', ')}`);
  }

  const fontPath = path.join(FONTS_DIR, `${fontKey}.${format}`);
  return fs.existsSync(fontPath) ? fontPath : null;
}

/**
 * Get font information for a user/font
 *
 * @param {string} fontKey - Font key (userId or userId_fontId)
 * @returns {Object|null} - Font info or null if not found
 */
function getFontInfo(fontKey) {
  // Parse fontKey to get userId (and fontId if present)
  const parts = fontKey.split('_');
  const userId = parts[0];
  const fontId = parts[1] || null;

  const user = getUserById(userId);
  if (!user) return null;

  const ttfPath = getFontPath(fontKey, 'ttf');
  if (!ttfPath) return null;

  // Get letters from appropriate source
  let letters;
  if (fontId && user.profile.fonts && user.profile.fonts[fontId]) {
    letters = user.profile.fonts[fontId].letters || {};
  } else {
    letters = user.profile.letters || {};
  }

  const { vectorChars, skippedChars } = generateGlyphsFromLetters(letters);
  const familyName = `${user.username}Handwriting`;

  return {
    familyName,
    characterCount: vectorChars.length,
    characters: vectorChars,
    skippedCharacters: skippedChars,
    formats: {
      ttf: fs.existsSync(path.join(FONTS_DIR, `${fontKey}.ttf`)),
      woff2: fs.existsSync(path.join(FONTS_DIR, `${fontKey}.woff2`)),
      css: fs.existsSync(path.join(FONTS_DIR, `${fontKey}.css`)),
    },
  };
}

/**
 * Delete font files for a user/font
 *
 * @param {string} fontKey - Font key (userId or userId_fontId)
 * @returns {boolean} - True if files were deleted
 */
function deleteFont(fontKey) {
  let deleted = false;
  const formats = ['ttf', 'woff2', 'css'];

  formats.forEach(format => {
    const fontPath = path.join(FONTS_DIR, `${fontKey}.${format}`);
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
