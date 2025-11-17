#!/usr/bin/env python3
"""
Handwriting Character Segmentation Script

This script uses OpenCV to segment a scanned handwriting template
into individual character images.

Requirements:
    pip install opencv-python numpy

Usage:
    python3 segment_chars.py <image_path>

Output:
    JSON object mapping character labels to saved image paths
"""

import cv2
import numpy as np
import sys
import json
import os
import uuid
from pathlib import Path


class HandwritingSegmenter:
    """Segments handwriting template into individual characters"""

    def __init__(self, template_config=None):
        """
        Initialize segmenter with template configuration

        Args:
            template_config (dict): Template layout configuration
        """
        self.config = template_config or {
            'rows': 9,
            'cols': 8,
            'characters': list('ABCDEFGHIJKLMNOPQRSTUVWXYZ') +
                          list('abcdefghijklmnopqrstuvwxyz') +
                          list('0123456789') +
                          list('.,!?;:\'"()-'),
            'box_margin': 10,  # Margin around detected boxes
        }
        self.output_dir = Path(__file__).parent / 'data' / 'uploads' / 'tmp'
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def preprocess_image(self, image):
        """
        Preprocess image for better contour detection

        Args:
            image: Input image (BGR)

        Returns:
            Preprocessed binary image
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # Apply adaptive thresholding
        binary = cv2.adaptiveThreshold(
            blurred,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            11,
            2
        )

        # Morphological operations to clean up
        kernel = np.ones((3, 3), np.uint8)
        cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)

        return cleaned

    def find_character_boxes(self, binary_image):
        """
        Detect character boxes in the template

        Args:
            binary_image: Preprocessed binary image

        Returns:
            List of bounding boxes (x, y, w, h) sorted top-left to bottom-right
        """
        # Find contours
        contours, _ = cv2.findContours(
            binary_image,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        # Filter contours by size (assume character boxes are reasonably sized)
        boxes = []
        image_area = binary_image.shape[0] * binary_image.shape[1]
        min_area = image_area * 0.001  # At least 0.1% of image
        max_area = image_area * 0.1    # At most 10% of image

        for contour in contours:
            area = cv2.contourArea(contour)
            if min_area < area < max_area:
                x, y, w, h = cv2.boundingRect(contour)
                # Filter by aspect ratio (boxes should be roughly square)
                aspect_ratio = w / h
                if 0.5 < aspect_ratio < 2.0:
                    boxes.append((x, y, w, h))

        # Sort boxes: top-to-bottom, left-to-right
        boxes.sort(key=lambda b: (b[1] // 100, b[0]))  # Group by rows, then sort by x

        return boxes

    def extract_character(self, image, box):
        """
        Extract and save a character from the image

        Args:
            image: Original image
            box: Bounding box (x, y, w, h)

        Returns:
            Path to saved character image
        """
        x, y, w, h = box
        margin = self.config['box_margin']

        # Add margin and ensure within bounds
        x1 = max(0, x - margin)
        y1 = max(0, y - margin)
        x2 = min(image.shape[1], x + w + margin)
        y2 = min(image.shape[0], y + h + margin)

        # Crop character region
        char_img = image[y1:y2, x1:x2]

        # Convert to grayscale and threshold
        if len(char_img.shape) == 3:
            char_gray = cv2.cvtColor(char_img, cv2.COLOR_BGR2GRAY)
        else:
            char_gray = char_img

        # Apply threshold
        _, char_binary = cv2.threshold(
            char_gray,
            0,
            255,
            cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )

        # Save character image
        filename = f"{uuid.uuid4().hex}.png"
        output_path = self.output_dir / filename
        cv2.imwrite(str(output_path), char_binary)

        return str(output_path)

    def segment(self, image_path):
        """
        Segment handwriting template into character images

        Args:
            image_path: Path to scanned template image

        Returns:
            Dictionary mapping character labels to image paths
        """
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")

        # Preprocess
        binary = self.preprocess_image(image)

        # Find character boxes
        boxes = self.find_character_boxes(binary)

        # Extract characters and map to labels
        result = {}
        characters = self.config['characters']

        for i, box in enumerate(boxes):
            if i >= len(characters):
                break  # More boxes than expected characters

            char_label = characters[i]
            char_path = self.extract_character(image, box)
            result[char_label] = char_path

        return result


def main():
    """Main entry point for CLI usage"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No image path provided'}))
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(json.dumps({'error': f'Image not found: {image_path}'}))
        sys.exit(1)

    try:
        segmenter = HandwritingSegmenter()
        result = segmenter.segment(image_path)
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)


if __name__ == '__main__':
    main()
