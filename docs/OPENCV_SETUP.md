# OpenCV Setup Guide

This guide explains how to set up OpenCV for character segmentation in the Handwritten Note Web App.

## Overview

The app supports two methods for handwriting character segmentation:

1. **Python OpenCV Script** (Recommended for production)
2. **Node.js opencv4nodejs** (Alternative)
3. **Mock Implementation** (Development/testing only)

## Method 1: Python OpenCV (Recommended)

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

```bash
# Install OpenCV and NumPy
pip3 install opencv-python numpy

# Or using requirements file
cd backend
pip3 install -r requirements.txt
```

### Create requirements.txt

```txt
opencv-python==4.8.1.78
numpy==1.24.3
```

### Usage

The Python script `backend/segment_chars.py` is automatically called by the Node.js backend when processing uploaded templates.

#### Testing the Script Directly

```bash
cd backend
python3 segment_chars.py path/to/scanned/template.jpg
```

Output (JSON):
```json
{
  "A": "/path/to/uploads/tmp/abc123.png",
  "B": "/path/to/uploads/tmp/def456.png",
  ...
}
```

### How It Works

1. **Preprocessing**:
   - Convert to grayscale
   - Apply Gaussian blur to reduce noise
   - Adaptive thresholding for binarization
   - Morphological operations to clean up

2. **Box Detection**:
   - Find contours in binary image
   - Filter by size and aspect ratio
   - Sort boxes top-to-bottom, left-to-right

3. **Character Extraction**:
   - Crop each box region
   - Apply threshold for clean binary image
   - Save as PNG file
   - Map to expected character label

### Configuration

Edit `segment_chars.py` to adjust template configuration:

```python
template_config = {
    'rows': 9,
    'cols': 8,
    'characters': list('ABCDEFGHIJKLMNOPQRSTUVWXYZ') + ...,
    'box_margin': 10,  # Margin around detected boxes
}
```

### Troubleshooting

**Issue: Script not found or permission denied**
```bash
chmod +x backend/segment_chars.py
```

**Issue: OpenCV not found**
```bash
pip3 install --upgrade opencv-python
```

**Issue: Poor segmentation quality**
- Ensure scanned image has good contrast
- Check alignment markers are visible
- Adjust preprocessing parameters in script
- Ensure boxes are evenly spaced on template

## Method 2: Node.js opencv4nodejs

### Prerequisites

- OpenCV 4.x installed on system
- Node.js build tools

### Installation (macOS)

```bash
# Install OpenCV via Homebrew
brew install opencv

# Install Node.js package
cd backend
npm install opencv4nodejs
```

### Installation (Linux)

```bash
# Install OpenCV
sudo apt-get install libopencv-dev

# Install Node.js package
cd backend
npm install opencv4nodejs
```

### Installation (Windows)

Download and install OpenCV from opencv.org, then:

```bash
cd backend
npm install opencv4nodejs
```

### Implementation

Update `backend/handwriting.js` to use opencv4nodejs:

```javascript
const cv = require('opencv4nodejs');

async function segmentHandwritingSheet(imagePath) {
  // Load image
  const img = await cv.imreadAsync(imagePath);

  // Convert to grayscale
  const gray = img.cvtColor(cv.COLOR_BGR2GRAY);

  // Apply threshold
  const binary = gray.threshold(0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);

  // Find contours
  const contours = binary.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  // Process each contour...
  // See segment_chars.py for full algorithm
}
```

## Method 3: Mock Implementation (Current)

The current implementation is a simplified mock that returns sample characters. This is suitable for:
- Development and testing
- UI/UX development
- API testing
- When OpenCV setup is not feasible

### Limitations

- Does not actually process images
- Returns fixed set of characters
- Not suitable for production

### Upgrading from Mock

To upgrade to production OpenCV:

1. Install Python OpenCV (Method 1) or opencv4nodejs (Method 2)
2. Update `backend/handwriting.js` to call Python script:

```javascript
const { spawn } = require('child_process');

async function segmentHandwritingSheet(imagePath) {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [
      path.join(__dirname, 'segment_chars.py'),
      imagePath
    ]);

    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error('Segmentation failed'));
      }
      try {
        const result = JSON.parse(output);
        if (result.error) {
          return reject(new Error(result.error));
        }
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
}
```

3. Test with actual scanned templates
4. Adjust parameters as needed

## Template Requirements

For best segmentation results:

### Image Quality
- **Resolution**: Minimum 300 DPI
- **Format**: PNG or JPEG
- **Color**: Grayscale or color (will be converted)
- **Size**: Under 10MB

### Scanning Tips
1. Use good lighting
2. Avoid shadows
3. Keep template flat
4. Ensure all 4 alignment markers are visible
5. Use dark pen/marker for writing
6. Write clearly within boxes

### Template Layout
- Grid of boxes for characters
- Each box should be approximately equal size
- Clear spacing between boxes
- Alignment markers in corners
- White background recommended

## Performance Optimization

### Image Preprocessing
- Resize large images before processing
- Cache processed results
- Use background job queue for heavy processing

### Recommended Setup (Production)
```javascript
// Use Bull queue for async processing
const Queue = require('bull');
const segmentQueue = new Queue('segmentation');

segmentQueue.process(async (job) => {
  const { imagePath } = job.data;
  return await segmentHandwritingSheet(imagePath);
});

// In upload handler
segmentQueue.add({ imagePath });
```

## Testing

### Unit Tests

```javascript
// tests/segmentation.test.js
describe('Character Segmentation', () => {
  test('segments template correctly', async () => {
    const result = await segmentHandwritingSheet('test-template.jpg');
    expect(result).toHaveProperty('A');
    expect(result).toHaveProperty('Z');
  });
});
```

### Integration Tests

1. Generate test template
2. Fill in with test handwriting
3. Upload through API
4. Verify characters extracted

## Docker Integration

Add to `backend/Dockerfile`:

```dockerfile
# Install Python and OpenCV
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libopencv-dev

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install -r requirements.txt
```

## Alternative Solutions

### Cloud-based OCR
- Google Cloud Vision API
- AWS Textract
- Azure Computer Vision

Benefits: No local setup, high accuracy
Drawbacks: Cost, privacy concerns, requires internet

### ML-based Segmentation
- Train custom model for character detection
- Use TensorFlow.js in browser
- More accurate for specific template layout

## Further Reading

- [OpenCV Python Documentation](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)
- [opencv4nodejs GitHub](https://github.com/justadudewhohacks/opencv4nodejs)
- [Image Segmentation Techniques](https://opencv24-python-tutorials.readthedocs.io/en/latest/py_tutorials/py_imgproc/py_contours/py_contours_begin/py_contours_begin.html)

## Support

If you encounter issues with OpenCV setup:

1. Check the error logs in `backend/logs/error.log`
2. Verify OpenCV installation: `python3 -c "import cv2; print(cv2.__version__)"`
3. Test script directly with sample image
4. Consult project documentation or create an issue

---

*Last updated: 2025-11-17*
