#!/usr/bin/env python3
"""
Convert a character image to SVG path for font generation.
Uses contour tracing to create vector outlines from bitmap images.
"""

import sys
import json
import cv2
import numpy as np

def image_to_svg_path(image_path, simplify_epsilon=2.0):
    """
    Convert a character image to an SVG path string.

    Args:
        image_path: Path to the character image (PNG)
        simplify_epsilon: Tolerance for polygon simplification (higher = simpler path)

    Returns:
        SVG path string
    """
    # Load image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Failed to load image: {image_path}")

    # Threshold to binary (inverted: black character on white background becomes white on black)
    _, binary = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV)

    # Find contours
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        # Empty image, return empty path
        return ""

    # Convert contours to SVG path commands
    path_commands = []

    for contour in contours:
        # Simplify contour to reduce path complexity
        epsilon = simplify_epsilon
        approx = cv2.approxPolyDP(contour, epsilon, True)

        if len(approx) < 3:
            continue  # Skip invalid contours

        # Start path with Move command
        first_point = approx[0][0]
        path_commands.append(f"M {first_point[0]} {first_point[1]}")

        # Add Line commands for remaining points
        for point in approx[1:]:
            x, y = point[0]
            path_commands.append(f"L {x} {y}")

        # Close path
        path_commands.append("Z")

    return " ".join(path_commands)

def main():
    """Main entry point"""
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: image_to_svg.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]

    try:
        svg_path = image_to_svg_path(image_path)
        print(json.dumps({"path": svg_path, "success": True}))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"error": str(e), "success": False}))
        sys.exit(1)

if __name__ == "__main__":
    main()
