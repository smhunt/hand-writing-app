#!/usr/bin/env python3
"""
Generate a test filled handwriting template for testing
"""

import sys
from PIL import Image, ImageDraw, ImageFont
import random

# Letter size in pixels at 150 DPI
WIDTH = 1275  # 8.5 inches * 150 DPI
HEIGHT = 1650  # 11 inches * 150 DPI

BOX_SIZE = 80
BOX_PADDING = 10
BOXES_PER_ROW = 6

# Characters in order
CHARACTERS = (
    list('ABCDEFGHIJKLMNOPQRSTUVWXYZ') +  # Uppercase
    list('abcdefghijklmnopqrstuvwxyz') +  # Lowercase
    list('0123456789') +                  # Numbers
    list('.,!?;:\'"()-')                  # Symbols
)

def create_filled_template(output_path):
    """Create a template image with boxes and handwritten characters"""
    
    # Create white background
    img = Image.new('RGB', (WIDTH, HEIGHT), 'white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a handwriting-style font, fallback to default
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf", 50)
        small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 12)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 50)
            small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 12)
        except:
            font = ImageFont.load_default()
            small_font = ImageFont.load_default()
    
    # Starting position
    start_x = 50
    current_y = 150
    
    # Section titles
    sections = [
        ("Uppercase Letters (A-Z)", 26),
        ("Lowercase Letters (a-z)", 26),
        ("Numbers (0-9)", 10),
        ("Symbols", 11)
    ]
    
    char_index = 0
    
    for section_name, count in sections:
        # Draw section title
        draw.text((start_x, current_y), section_name, fill='black', font=small_font)
        current_y += 30
        
        # Draw boxes for this section
        chars_drawn = 0
        while chars_drawn < count:
            chars_in_row = min(BOXES_PER_ROW, count - chars_drawn)
            
            for i in range(chars_in_row):
                char = CHARACTERS[char_index + chars_drawn + i]
                x = start_x + (i * (BOX_SIZE + BOX_PADDING))
                
                # Draw box
                draw.rectangle([x, current_y, x + BOX_SIZE, current_y + BOX_SIZE], 
                             outline='black', width=2)
                
                # Draw guidelines (faint)
                draw.line([x, current_y + BOX_SIZE//2, 
                          x + BOX_SIZE, current_y + BOX_SIZE//2], 
                         fill='lightgray', width=1)
                draw.line([x + BOX_SIZE//2, current_y, 
                          x + BOX_SIZE//2, current_y + BOX_SIZE], 
                         fill='lightgray', width=1)
                
                # Draw character with slight random offset to simulate handwriting
                offset_x = random.randint(-5, 5)
                offset_y = random.randint(-5, 5)
                char_x = x + BOX_SIZE//2 - 15 + offset_x
                char_y = current_y + BOX_SIZE//2 - 25 + offset_y
                
                draw.text((char_x, char_y), char, fill='black', font=font)
            
            chars_drawn += chars_in_row
            current_y += BOX_SIZE + BOX_PADDING + 15
        
        char_index += count
        current_y += 30  # Section spacing
    
    # Save image
    img.save(output_path, 'JPEG', quality=95)
    print(f"Test template saved to: {output_path}")

if __name__ == "__main__":
    output = sys.argv[1] if len(sys.argv) > 1 else "test_filled_template.jpg"
    create_filled_template(output)
