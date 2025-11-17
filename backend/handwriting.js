/**
 * Handwriting Segmentation Module
 *
 * This module handles segmentation of scanned handwriting templates into
 * individual character images using OpenCV.
 *
 * IMPLEMENTATION OPTIONS:
 * 1. Python OpenCV Script (PRODUCTION - Recommended)
 *    - Set USE_PYTHON_OPENCV = true
 *    - Requires: Python 3, opencv-python, numpy
 *    - See docs/OPENCV_SETUP.md for setup instructions
 *
 * 2. Mock Implementation (DEVELOPMENT ONLY)
 *    - Set USE_PYTHON_OPENCV = false
 *    - Returns sample characters for testing
 *    - Not suitable for production use
 *
 * 3. Node.js opencv4nodejs (ALTERNATIVE)
 *    - Requires system OpenCV installation
 *    - More complex setup but native Node.js integration
 */

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const logger = require('./logger');

const OUTPUT_DIR = path.join(__dirname, 'data/uploads/tmp');

// Configuration: Set to true to use Python OpenCV script
const USE_PYTHON_OPENCV = process.env.USE_PYTHON_OPENCV === 'true' || false;

/**
 * Process the uploaded handwriting sheet image and segment it into individual character images.
 *
 * @param {string} imagePath - Path to the scanned sheet image.
 * @return {Promise<Object>} - Resolves to an object mapping character to file path of its image.
 *
 * @example
 * const result = await segmentHandwritingSheet('/path/to/template.jpg');
 * // Returns: { 'A': '/path/to/A.png', 'B': '/path/to/B.png', ... }
 */
async function segmentHandwritingSheet(imagePath) {
  logger.info(`Segmenting handwriting sheet: ${imagePath}`);

  if (USE_PYTHON_OPENCV) {
    logger.info('Using Python OpenCV for segmentation');
    return segmentWithPythonOpenCV(imagePath);
  } else {
    logger.warn('Using mock segmentation (development only)');
    return mockSegmentation(imagePath);
  }
}

/**
 * Production implementation using Python OpenCV script
 *
 * @param {string} imagePath - Path to the scanned sheet image.
 * @return {Promise<Object>} - Character to image path mapping.
 */
async function segmentWithPythonOpenCV(imagePath) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'segment_chars.py');

    // Check if Python script exists
    if (!fs.existsSync(pythonScript)) {
      return reject(new Error(`Python script not found: ${pythonScript}`));
    }

    logger.debug(`Executing Python script: ${pythonScript}`);

    const pythonProcess = spawn('python3', [pythonScript, imagePath]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      logger.error('Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        logger.error(`Python script exited with code ${code}`);
        logger.error('Error output:', errorOutput);
        return reject(new Error(`Segmentation failed: ${errorOutput || 'Unknown error'}`));
      }

      try {
        const result = JSON.parse(output);

        if (result.error) {
          logger.error('Segmentation error:', result.error);
          return reject(new Error(result.error));
        }

        logger.info(`Successfully segmented ${Object.keys(result).length} characters`);
        resolve(result);
      } catch (err) {
        logger.error('Failed to parse Python output:', err);
        logger.error('Output was:', output);
        reject(new Error('Failed to parse segmentation result'));
      }
    });

    pythonProcess.on('error', (err) => {
      logger.error('Failed to start Python process:', err);
      reject(new Error(`Failed to start Python: ${err.message}`));
    });
  });
}

/**
 * Mock implementation for development and testing
 *
 * @param {string} imagePath - Path to the scanned sheet image.
 * @return {Promise<Object>} - Character to image path mapping.
 */
async function mockSegmentation(imagePath) {
  return new Promise((resolve, reject) => {
    try {
      // Ensure output directory exists
      if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      }

      // Mock segmentation - returns sample characters
      const sampleChars = ['A', 'B', 'C', 'H', 'E', 'L', 'O'];
      const result = {};

      for (const char of sampleChars) {
        const filename = `${uuidv4()}.png`;
        const outPath = path.join(OUTPUT_DIR, filename);

        // Copy source image as placeholder
        // In production, this would be cropped character region
        fs.copyFileSync(imagePath, outPath);
        result[char] = outPath;
      }

      logger.info(`Mock segmentation returned ${sampleChars.length} characters`);
      resolve(result);
    } catch (err) {
      logger.error('Mock segmentation failed:', err);
      reject(err);
    }
  });
}

/**
 * Alternative implementation using Python OpenCV script
 * Uncomment and use this if you have a Python script for segmentation
 */
/*
async function segmentHandwritingSheetWithPython(imagePath) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'segment_chars.py');
    const pythonProcess = spawn('python3', [pythonScript, imagePath]);

    let output = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error('Python script failed'));
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
}
*/

module.exports = { segmentHandwritingSheet };
