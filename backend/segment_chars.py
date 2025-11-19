#!/usr/bin/env python3
"""
Character Segmentation Script

This script processes a scanned handwriting template and extracts individual
character images from the boxes.

Usage:
    python3 segment_chars.py <image_path>

Output:
    JSON mapping of character to extracted image path:
    {"A": "/path/to/A.png", "B": "/path/to/B.png", ...}
"""

import sys
import os
import json
import cv2
import numpy as np
from pathlib import Path

# Expected character sequence (must match templateGenerator.js)
CHARACTER_SEQUENCE = (
    list('ABCDEFGHIJKLMNOPQRSTUVWXYZ') +  # Uppercase
    list('abcdefghijklmnopqrstuvwxyz') +  # Lowercase
    list('0123456789') +                  # Numbers
    list('.,!?;:\'"()-')                  # Symbols
)

def debug_log(message):
    """Log debug messages to stderr"""
    print(f"[DEBUG] {message}", file=sys.stderr)

def find_character_boxes(image):
    """
    Find character boxes in the scanned template using edge detection.
    This works for both empty and filled templates.

    Returns:
        List of tuples (x, y, w, h) representing box coordinates, sorted by position
    """
    debug_log(f"Image shape: {image.shape}")

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Use Canny edge detection to find box borders
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)

    # Dilate edges to connect broken lines
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(edges, kernel, iterations=2)

    # Find contours on the dilated edges
    contours, _ = cv2.findContours(
        dilated, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE
    )

    debug_log(f"Found {len(contours)} contours")

    # Filter contours to find boxes
    boxes = []
    image_area = image.shape[0] * image.shape[1]

    # Expected box size (adjust based on template)
    expected_box_size = 80  # From generate_test_template.py
    size_tolerance = 0.5  # 50% tolerance
    min_box_size = expected_box_size * (1 - size_tolerance)
    max_box_size = expected_box_size * (1 + size_tolerance)

    for contour in contours:
        # Approximate the contour to a polygon
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)

        # Look for quadrilaterals (4 corners)
        if len(approx) >= 4:
            x, y, w, h = cv2.boundingRect(contour)
            area = w * h
            aspect_ratio = w / h if h > 0 else 0

            # Filter based on size and aspect ratio
            # Boxes should be roughly square and reasonable size
            if (min_box_size < w < max_box_size and
                min_box_size < h < max_box_size and
                0.7 < aspect_ratio < 1.3 and   # Roughly square
                area > 1000 and                # Minimum area
                area < image_area * 0.05):     # Not too large
                boxes.append((x, y, w, h))

    debug_log(f"Found {len(boxes)} candidate boxes")

    # Remove duplicate/overlapping boxes
    boxes = remove_overlapping_boxes(boxes)
    debug_log(f"After removing overlaps: {len(boxes)} boxes")

    # Sort boxes by position (top to bottom, left to right)
    # Group by rows first (boxes with similar y-coordinates)
    boxes.sort(key=lambda b: (b[1] // 100, b[0]))

    return boxes

def remove_overlapping_boxes(boxes):
    """Remove boxes that significantly overlap with others"""
    if not boxes:
        return []

    # Sort by area (largest first)
    boxes = sorted(boxes, key=lambda b: b[2] * b[3], reverse=True)

    filtered = []
    for box in boxes:
        x1, y1, w1, h1 = box
        overlaps = False

        for kept_box in filtered:
            x2, y2, w2, h2 = kept_box

            # Calculate overlap
            x_overlap = max(0, min(x1 + w1, x2 + w2) - max(x1, x2))
            y_overlap = max(0, min(y1 + h1, y2 + h2) - max(y1, y2))
            overlap_area = x_overlap * y_overlap

            box_area = w1 * h1
            if overlap_area > box_area * 0.5:  # More than 50% overlap
                overlaps = True
                break

        if not overlaps:
            filtered.append(box)

    return filtered

def extract_character_region(image, box, padding=5):
    """
    Extract and preprocess a character region from the image.
    Centers the character within a fixed-size canvas for consistent alignment.

    Args:
        image: Source image
        box: Tuple (x, y, w, h) of the box
        padding: Pixels to remove from edges to avoid box borders

    Returns:
        Extracted and processed character image, centered and normalized
    """
    x, y, w, h = box

    # Add padding to avoid box borders
    x1 = max(0, x + padding)
    y1 = max(0, y + padding)
    x2 = min(image.shape[1], x + w - padding)
    y2 = min(image.shape[0], y + h - padding)

    # Extract region
    char_img = image[y1:y2, x1:x2]

    # Convert to grayscale if needed
    if len(char_img.shape) == 3:
        char_img = cv2.cvtColor(char_img, cv2.COLOR_BGR2GRAY)

    # Apply thresholding to clean up
    _, char_img = cv2.threshold(
        char_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    # Invert if needed (we want black on white)
    if np.mean(char_img) < 127:
        char_img = cv2.bitwise_not(char_img)

    # Find actual character bounds (trim whitespace)
    char_img = center_and_normalize_character(char_img)

    return char_img

def center_and_normalize_character(char_img, target_size=200, margin=20):
    """
    Center a character within a fixed-size canvas with consistent margins.
    This ensures all characters align properly in the generated font.

    Args:
        char_img: Binary character image (white background, black foreground)
        target_size: Target canvas size in pixels (square)
        margin: Minimum margin around character

    Returns:
        Centered and normalized character image
    """
    # Find bounding box of actual character (non-white pixels)
    # Invert for contour detection (OpenCV finds white objects on black background)
    inverted = cv2.bitwise_not(char_img)
    coords = cv2.findNonZero(inverted)

    if coords is None:
        # Empty character, return blank canvas
        return np.ones((target_size, target_size), dtype=np.uint8) * 255

    # Get bounding rectangle
    x, y, w, h = cv2.boundingRect(coords)

    # Extract just the character
    char_only = char_img[y:y+h, x:x+w]

    # Calculate scale to fit within target size with margin
    available_size = target_size - (2 * margin)
    scale = min(available_size / w, available_size / h)

    # Don't upscale, only downscale if necessary
    if scale > 1.0:
        scale = 1.0

    # Resize character
    new_w = int(w * scale)
    new_h = int(h * scale)

    if new_w > 0 and new_h > 0:
        char_resized = cv2.resize(char_only, (new_w, new_h), interpolation=cv2.INTER_AREA)
    else:
        char_resized = char_only

    # Create blank canvas
    canvas = np.ones((target_size, target_size), dtype=np.uint8) * 255

    # Calculate position to center character
    offset_x = (target_size - new_w) // 2
    offset_y = (target_size - new_h) // 2

    # Place character on canvas
    canvas[offset_y:offset_y+new_h, offset_x:offset_x+new_w] = char_resized

    return canvas

def segment_template(image_path):
    """
    Main segmentation function.

    Args:
        image_path: Path to the scanned template image

    Returns:
        Dictionary mapping character to saved image path
    """
    debug_log(f"Processing image: {image_path}")

    # Load image
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Failed to load image: {image_path}")

    # Find character boxes
    boxes = find_character_boxes(image)

    if len(boxes) == 0:
        raise ValueError("No character boxes found in image. Please ensure the template is clearly scanned.")

    debug_log(f"Detected {len(boxes)} boxes, expecting {len(CHARACTER_SEQUENCE)} characters")

    # Create output directory
    output_dir = Path(image_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)

    result = {}

    # Match boxes to characters
    num_chars = min(len(boxes), len(CHARACTER_SEQUENCE))

    for i in range(num_chars):
        char = CHARACTER_SEQUENCE[i]
        box = boxes[i]

        # Extract character
        char_img = extract_character_region(image, box)

        # Save character image
        # Use safe filename for special characters
        safe_char = char
        if char in '<>:"/\\|?*':
            safe_char = f"sym_{ord(char)}"

        output_path = output_dir / f"char_{safe_char}_{i}.png"
        cv2.imwrite(str(output_path), char_img)

        result[char] = str(output_path)

    debug_log(f"Successfully extracted {len(result)} characters")

    return result

def main():
    """Main entry point"""
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: segment_chars.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]

    try:
        result = segment_template(image_path)
        # Output result as JSON to stdout
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        debug_log(f"Error: {str(e)}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
