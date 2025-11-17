#!/usr/bin/env node

/**
 * Handwriting Template Generator
 *
 * Generates a PDF template with character boxes for users to fill in
 * with their handwriting. The template includes:
 * - Grid of boxes for A-Z, a-z, 0-9, and common punctuation
 * - Clear labels for each character
 * - Alignment markers
 * - Instructions
 */

const fs = require('fs');
const path = require('path');

// Try to require PDFKit from backend node_modules
let PDFDocument;
try {
  PDFDocument = require(path.join(__dirname, '../backend/node_modules/pdfkit'));
} catch (err) {
  try {
    PDFDocument = require('pdfkit');
  } catch (err2) {
    console.error('❌ PDFKit not found. Please run: cd backend && npm install');
    process.exit(1);
  }
}

// Template configuration
const CONFIG = {
  pageSize: 'LETTER', // or 'A4'
  pageWidth: 612,     // Letter: 8.5" x 72 = 612 points
  pageHeight: 792,    // Letter: 11" x 72 = 792 points
  margin: 36,         // 0.5 inch margins
  boxSize: 60,        // Size of each character box
  boxPadding: 8,      // Padding between boxes
  fontSize: 10,
  titleFontSize: 18,
  labelFontSize: 8,
};

// Characters to include in template
const CHARACTERS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  lowercase: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  numbers: '0123456789'.split(''),
  punctuation: '.,!?;:\'"()-@#$%&*+=<>'.split(''),
};

/**
 * Create the template PDF
 */
function generateTemplate() {
  const outputPath = path.join(__dirname, '../backend/public/handwriting_template.pdf');
  const outputDir = path.dirname(outputPath);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('📄 Generating handwriting template...');

  // Create PDF document
  const doc = new PDFDocument({
    size: CONFIG.pageSize,
    margins: {
      top: CONFIG.margin,
      bottom: CONFIG.margin,
      left: CONFIG.margin,
      right: CONFIG.margin,
    },
  });

  // Pipe to file
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Calculate available space
  const contentWidth = CONFIG.pageWidth - (CONFIG.margin * 2);
  const contentHeight = CONFIG.pageHeight - (CONFIG.margin * 2);

  // Add title and instructions
  addHeader(doc);

  // Current Y position
  let currentY = CONFIG.margin + 80;

  // Add character sections
  currentY = addSection(doc, 'Uppercase Letters (A-Z)', CHARACTERS.uppercase, currentY);
  currentY = addSection(doc, 'Lowercase Letters (a-z)', CHARACTERS.lowercase, currentY);

  // Check if we need a new page
  if (currentY + 200 > CONFIG.pageHeight - CONFIG.margin) {
    doc.addPage();
    currentY = CONFIG.margin + 40;
  }

  currentY = addSection(doc, 'Numbers (0-9)', CHARACTERS.numbers, currentY);
  currentY = addSection(doc, 'Punctuation & Symbols', CHARACTERS.punctuation, currentY);

  // Add footer with instructions
  addFooter(doc);

  // Finalize the PDF
  doc.end();

  stream.on('finish', () => {
    console.log('✅ Template generated successfully!');
    console.log(`📍 Location: ${outputPath}`);
    console.log(`📏 Total characters: ${getTotalCharacterCount()}`);
  });

  stream.on('error', (err) => {
    console.error('❌ Error generating template:', err);
  });
}

/**
 * Add header with title and instructions
 */
function addHeader(doc) {
  const centerX = CONFIG.pageWidth / 2;

  // Title
  doc.fontSize(CONFIG.titleFontSize)
    .font('Helvetica-Bold')
    .text('Handwriting Template', CONFIG.margin, CONFIG.margin, {
      align: 'center',
      width: CONFIG.pageWidth - (CONFIG.margin * 2),
    });

  // Instructions
  doc.fontSize(CONFIG.fontSize)
    .font('Helvetica')
    .moveDown(0.5)
    .text('Instructions:', CONFIG.margin, doc.y, { continued: false })
    .fontSize(9)
    .moveDown(0.3)
    .text('1. Print this template on white paper', CONFIG.margin + 10)
    .text('2. Use a dark pen or marker to write each character in its box', CONFIG.margin + 10)
    .text('3. Write naturally - this will be your personal font!', CONFIG.margin + 10)
    .text('4. Scan or photograph the completed template', CONFIG.margin + 10)
    .text('5. Upload the image to the app', CONFIG.margin + 10);

  // Alignment markers in corners
  addAlignmentMarkers(doc);
}

/**
 * Add alignment markers for scanning
 */
function addAlignmentMarkers(doc) {
  const markerSize = 10;
  const markerOffset = 15;

  doc.circle(markerOffset, markerOffset, markerSize).fill('black');
  doc.circle(CONFIG.pageWidth - markerOffset, markerOffset, markerSize).fill('black');
  doc.circle(markerOffset, CONFIG.pageHeight - markerOffset, markerSize).fill('black');
  doc.circle(CONFIG.pageWidth - markerOffset, CONFIG.pageHeight - markerOffset, markerSize).fill('black');
}

/**
 * Add a section of characters to the PDF
 */
function addSection(doc, title, characters, startY) {
  let currentY = startY;

  // Section title
  doc.fontSize(12)
    .font('Helvetica-Bold')
    .text(title, CONFIG.margin, currentY);

  currentY += 25;

  // Calculate boxes per row
  const totalBoxWidth = CONFIG.boxSize + CONFIG.boxPadding;
  const contentWidth = CONFIG.pageWidth - (CONFIG.margin * 2);
  const boxesPerRow = Math.floor(contentWidth / totalBoxWidth);

  // Draw character boxes
  let currentX = CONFIG.margin;
  let boxCount = 0;

  characters.forEach((char, index) => {
    // Check if we need a new row
    if (boxCount >= boxesPerRow) {
      boxCount = 0;
      currentX = CONFIG.margin;
      currentY += CONFIG.boxSize + CONFIG.boxPadding + 15;

      // Check if we need a new page
      if (currentY + CONFIG.boxSize + 50 > CONFIG.pageHeight - CONFIG.margin) {
        doc.addPage();
        currentY = CONFIG.margin;
        currentX = CONFIG.margin;
      }
    }

    // Draw box
    doc.rect(currentX, currentY, CONFIG.boxSize, CONFIG.boxSize)
      .stroke('#333333');

    // Add label above box
    doc.fontSize(CONFIG.labelFontSize)
      .font('Helvetica')
      .fillColor('black')
      .text(char, currentX, currentY - 12, {
        width: CONFIG.boxSize,
        align: 'center',
      });

    // Add light guide character in box (very light gray)
    doc.fontSize(CONFIG.boxSize * 0.6)
      .font('Helvetica-Bold')
      .fillColor('#EEEEEE')
      .text(char, currentX, currentY + CONFIG.boxSize * 0.15, {
        width: CONFIG.boxSize,
        align: 'center',
      });

    // Reset color
    doc.fillColor('black');

    currentX += totalBoxWidth;
    boxCount++;
  });

  return currentY + CONFIG.boxSize + CONFIG.boxPadding + 30;
}

/**
 * Add footer with additional information
 */
function addFooter(doc) {
  const footerY = CONFIG.pageHeight - 30;

  doc.fontSize(8)
    .font('Helvetica')
    .fillColor('#666666')
    .text(
      '✍️ Handwritten Note App - Your Personal Digital Handwriting',
      CONFIG.margin,
      footerY,
      {
        align: 'center',
        width: CONFIG.pageWidth - (CONFIG.margin * 2),
      }
    );
}

/**
 * Get total character count
 */
function getTotalCharacterCount() {
  return Object.values(CHARACTERS).reduce((sum, arr) => sum + arr.length, 0);
}

// Run the generator
if (require.main === module) {
  generateTemplate();
}

module.exports = { generateTemplate };
