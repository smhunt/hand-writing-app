const opentype = require('opentype.js');
const simplify = require('simplify-js');

/**
 * Unicode code point mapping for standard ASCII characters
 * Used to map user-drawn characters to their proper Unicode positions in the font
 */
const UNICODE_MAP = {
  // Uppercase letters (A-Z: 65-90)
  'A': 65, 'B': 66, 'C': 67, 'D': 68, 'E': 69, 'F': 70, 'G': 71, 'H': 72,
  'I': 73, 'J': 74, 'K': 75, 'L': 76, 'M': 77, 'N': 78, 'O': 79, 'P': 80,
  'Q': 81, 'R': 82, 'S': 83, 'T': 84, 'U': 85, 'V': 86, 'W': 87, 'X': 88,
  'Y': 89, 'Z': 90,

  // Lowercase letters (a-z: 97-122)
  'a': 97, 'b': 98, 'c': 99, 'd': 100, 'e': 101, 'f': 102, 'g': 103, 'h': 104,
  'i': 105, 'j': 106, 'k': 107, 'l': 108, 'm': 109, 'n': 110, 'o': 111, 'p': 112,
  'q': 113, 'r': 114, 's': 115, 't': 116, 'u': 117, 'v': 118, 'w': 119, 'x': 120,
  'y': 121, 'z': 122,

  // Numbers (0-9: 48-57)
  '0': 48, '1': 49, '2': 50, '3': 51, '4': 52,
  '5': 53, '6': 54, '7': 55, '8': 56, '9': 57,

  // Punctuation and symbols
  ' ': 32,   // Space
  '!': 33,   // Exclamation mark
  '"': 34,   // Quotation mark
  '#': 35,   // Hash
  '$': 36,   // Dollar sign
  '%': 37,   // Percent
  '&': 38,   // Ampersand
  "'": 39,   // Apostrophe
  '(': 40,   // Left parenthesis
  ')': 41,   // Right parenthesis
  '*': 42,   // Asterisk
  '+': 43,   // Plus
  ',': 44,   // Comma
  '-': 45,   // Hyphen/minus
  '.': 46,   // Period
  '/': 47,   // Slash
  ':': 58,   // Colon
  ';': 59,   // Semicolon
  '<': 60,   // Less than
  '=': 61,   // Equals
  '>': 62,   // Greater than
  '?': 63,   // Question mark
  '@': 64,   // At sign
  '[': 91,   // Left bracket
  '\\': 92,  // Backslash
  ']': 93,   // Right bracket
  '^': 94,   // Caret
  '_': 95,   // Underscore
  '`': 96,   // Backtick
  '{': 123,  // Left brace
  '|': 124,  // Pipe
  '}': 125,  // Right brace
  '~': 126,  // Tilde
};

/**
 * Get Unicode code point for a character
 * Falls back to charCodeAt if not in map
 */
function getUnicodeForChar(char) {
  return UNICODE_MAP[char] || char.charCodeAt(0);
}

/**
 * Convert canvas strokes to an opentype.js Path object
 *
 * Canvas coordinate system: Origin at top-left, Y increases downward
 * Font coordinate system: Origin at bottom-left, Y increases upward
 *
 * @param {Array<Array<{x: number, y: number}>>} strokes - Array of strokes, each stroke is an array of points
 * @param {number} canvasWidth - Canvas width in pixels (default: 200)
 * @param {number} canvasHeight - Canvas height in pixels (default: 200)
 * @param {number} unitsPerEm - Font units per em (default: 1000)
 * @param {boolean} smoothPaths - Whether to apply path smoothing (default: true)
 * @returns {opentype.Path} - OpenType path object
 */
function canvasStrokesToOpentypePath(strokes, canvasWidth = 200, canvasHeight = 200, unitsPerEm = 1000, smoothPaths = true) {
  const path = new opentype.Path();

  // Scale factor to convert canvas pixels to font units
  // We use the canvas height as reference to maintain aspect ratio
  const scale = unitsPerEm / canvasHeight;

  strokes.forEach(stroke => {
    if (!stroke || stroke.length === 0) return;

    // Optionally smooth the stroke to reduce jagged lines
    let processedStroke = stroke;
    if (smoothPaths && stroke.length > 2) {
      // Convert to format expected by simplify-js
      const points = stroke.map(p => ({ x: p.x, y: p.y }));
      // Simplify with tolerance of 2 pixels (adjust for quality vs file size)
      processedStroke = simplify(points, 2, true);
    }

    // Move to first point
    const firstPoint = processedStroke[0];
    // Convert: scale up and flip Y-axis
    const firstX = firstPoint.x * scale;
    const firstY = (canvasHeight - firstPoint.y) * scale;
    path.moveTo(firstX, firstY);

    // Draw lines to subsequent points
    for (let i = 1; i < processedStroke.length; i++) {
      const point = processedStroke[i];
      const x = point.x * scale;
      const y = (canvasHeight - point.y) * scale;
      path.lineTo(x, y);
    }
  });

  return path;
}

/**
 * Calculate bounding box for a set of strokes
 * Useful for normalizing character sizes
 *
 * @param {Array<Array<{x: number, y: number}>>} strokes
 * @returns {{minX: number, minY: number, maxX: number, maxY: number, width: number, height: number}}
 */
function calculateStrokeBounds(strokes) {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  strokes.forEach(stroke => {
    stroke.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  // Handle empty strokes
  if (!isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Normalize strokes to a centered position within canvas
 * Helps with consistent character alignment
 *
 * @param {Array<Array<{x: number, y: number}>>} strokes
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {number} padding - Padding around character (default: 10)
 * @returns {Array<Array<{x: number, y: number}>>} - Normalized strokes
 */
function normalizeStrokes(strokes, canvasWidth = 200, canvasHeight = 200, padding = 10) {
  const bounds = calculateStrokeBounds(strokes);

  if (bounds.width === 0 || bounds.height === 0) {
    return strokes; // Nothing to normalize
  }

  // Calculate scale to fit within canvas with padding
  const availableWidth = canvasWidth - (padding * 2);
  const availableHeight = canvasHeight - (padding * 2);
  const scale = Math.min(
    availableWidth / bounds.width,
    availableHeight / bounds.height
  );

  // Calculate offset to center the character
  const scaledWidth = bounds.width * scale;
  const scaledHeight = bounds.height * scale;
  const offsetX = (canvasWidth - scaledWidth) / 2 - bounds.minX * scale;
  const offsetY = (canvasHeight - scaledHeight) / 2 - bounds.minY * scale;

  // Apply transformation to all strokes
  return strokes.map(stroke =>
    stroke.map(point => ({
      x: point.x * scale + offsetX,
      y: point.y * scale + offsetY
    }))
  );
}

/**
 * Calculate advance width for a character based on its actual bounds
 * This provides better spacing than a fixed width
 *
 * @param {Array<Array<{x: number, y: number}>>} strokes
 * @param {number} canvasWidth
 * @param {number} unitsPerEm
 * @param {number} extraSpacing - Additional spacing as percentage (default: 0.2 = 20%)
 * @returns {number} - Advance width in font units
 */
function calculateAdvanceWidth(strokes, canvasWidth = 200, unitsPerEm = 1000, extraSpacing = 0.2) {
  const bounds = calculateStrokeBounds(strokes);
  const scale = unitsPerEm / 200; // Assuming 200px canvas height

  if (bounds.width === 0) {
    // For space or empty characters, use half em
    return unitsPerEm / 2;
  }

  // Width of character plus some extra spacing
  const baseWidth = bounds.width * scale;
  return Math.round(baseWidth * (1 + extraSpacing));
}

module.exports = {
  UNICODE_MAP,
  getUnicodeForChar,
  canvasStrokesToOpentypePath,
  calculateStrokeBounds,
  normalizeStrokes,
  calculateAdvanceWidth,
};
