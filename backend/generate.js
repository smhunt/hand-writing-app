const express = require('express');
const PDFDocument = require('pdfkit');
const { getUserById } = require('./storage');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Generate a handwritten note PDF
router.post('/generate', async (req, res) => {
  const userId = req.session.userId;
  const { text, paperSize } = req.body;

  const user = getUserById(userId);
  if (!user || !user.profile) {
    return res.status(400).json({ error: 'User profile not found or incomplete' });
  }

  // Determine paper dimensions (in points, PDFKit default is 72 points/inch)
  let pdfOptions = {};
  switch (paperSize) {
    case 'A4':
      pdfOptions.size = 'A4';
      break;
    case 'Letter':
    default:
      pdfOptions.size = 'LETTER';
      break;
  }

  pdfOptions.margins = { top: 72, bottom: 72, left: 72, right: 72 }; // 1-inch margins

  // Create PDF document
  const doc = new PDFDocument(pdfOptions);

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  // Optionally, set disposition to attachment to force download:
  // res.setHeader('Content-Disposition', 'attachment; filename="note.pdf"');

  doc.pipe(res); // pipe PDF stream to response

  const profile = user.profile;
  const lineHeight = 40; // space between lines
  const charWidth = 30; // approximate width for each character
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  let x = doc.page.margins.left;
  let y = doc.page.margins.top;

  // Define a helper to render a character (image or strokes)
  const drawChar = (char) => {
    const letterData = profile.letters[char];
    if (!letterData) {
      // Character not in profile, skip or use space
      return;
    }

    if (letterData.type === 'image') {
      // Draw the character image on the PDF
      const imgPath = path.join(__dirname, 'data/uploads', String(userId), letterData.fileName);

      if (fs.existsSync(imgPath)) {
        try {
          // Insert the image at (x, y) with a fixed size
          doc.image(imgPath, x, y, { width: charWidth, height: lineHeight - 5 });
          x += charWidth + 2;
        } catch (err) {
          console.error('Error inserting image:', err);
          x += charWidth; // skip space
        }
      }
    } else if (letterData.type === 'vector') {
      // Draw strokes on the PDF
      const strokes = letterData.strokes;

      doc.save();
      doc.translate(x, y);

      strokes.forEach(pathPoints => {
        if (pathPoints.length > 0) {
          doc.moveTo(pathPoints[0].x / 5, pathPoints[0].y / 5); // scale down strokes
          for (let i = 1; i < pathPoints.length; i++) {
            doc.lineTo(pathPoints[i].x / 5, pathPoints[i].y / 5);
          }
          doc.stroke();
        }
      });

      doc.restore();
      x += charWidth; // assume ~30px width for each drawn char
    }
  };

  // Iterate through each character in the input text
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '\n') {
      // line break
      y += lineHeight;
      x = doc.page.margins.left;

      // If beyond page height, add a new page
      if (y + lineHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      continue;
    }

    // If char not whitespace, draw it
    if (ch !== ' ') {
      drawChar(ch);
    } else {
      // space – just advance x by a blank width
      x += 20;
    }

    // If we reached end of line (page width), wrap to next line
    if (x > doc.page.margins.left + pageWidth) {
      y += lineHeight;
      x = doc.page.margins.left;
    }

    if (y + lineHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
    }
  }

  // Finalize PDF and end the stream
  doc.end();
});

module.exports = router;
