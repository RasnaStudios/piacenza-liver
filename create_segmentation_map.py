#!/usr/bin/env python3
"""
Create a 4K square segmentation map PNG from CVAT annotations.xml file.
Each class (1-42) gets a grayscale value equal to its class number.
Output is a 4096x4096 square image.
"""

import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image, ImageDraw
import argparse
import os

def parse_annotations(xml_file):
    """Parse the CVAT annotations XML file and extract polylines."""
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    polylines = []
    
    # Find all polyline elements
    for polyline in root.findall('.//polyline'):
        label = int(polyline.get('label'))
        points_str = polyline.get('points')
        
        # Parse points: "x1,y1;x2,y2;x3,y3;..."
        points = []
        for point_str in points_str.split(';'):
            if point_str.strip():
                x, y = map(float, point_str.split(','))
                points.append((x, y))
        
        polylines.append({
            'label': label,
            'points': points
        })
    
    return polylines

def create_segmentation_map(polylines, output_path, size=1024):
    """Create square segmentation map where each pixel value equals the class number."""
    
    print(f"Creating {size}x{size} segmentation map...")
    
    # Create square image with background value 0 (no class)
    img = Image.new('L', (size, size), 0)  # 'L' mode for grayscale
    
    # Group polylines by label to handle multiple polylines per class
    polylines_by_label = {}
    for polyline in polylines:
        label = polyline['label']
        if label not in polylines_by_label:
            polylines_by_label[label] = []
        polylines_by_label[label].append(polyline['points'])
    
    # Draw each class
    for label in sorted(polylines_by_label.keys()):
        print(f"Processing class {label}...")
        
        # Create a mask for this class
        mask = Image.new('L', (size, size), 0)
        draw = ImageDraw.Draw(mask)
        
        # Draw all polylines for this class
        for points in polylines_by_label[label]:
            # Use coordinates directly as they are in the annotation file
            polygon_points = [
                (int(x), int(y)) for x, y in points
            ]
            
            # Draw filled polygon
            if len(polygon_points) >= 3:  # Need at least 3 points for a polygon
                draw.polygon(polygon_points, fill=255)
        
        # Apply mask to main image with class value
        mask_array = np.array(mask)
        img_array = np.array(img)
        
        # Set pixels where mask is white (255) to the class label value
        img_array[mask_array == 255] = label
        
        img = Image.fromarray(img_array)
    
    # Save the segmentation map
    img.save(output_path)
    print(f"Segmentation map saved to: {output_path}")
    
    # Print statistics
    img_array = np.array(img)
    unique_values = np.unique(img_array)
    print(f"Classes found in segmentation map: {sorted(unique_values)}")
    print(f"Total classes: {len(unique_values) - (1 if 0 in unique_values else 0)}")  # Subtract background
    print(f"Image size: {img.size}")

def main():
    parser = argparse.ArgumentParser(description='Create 4K square segmentation map from CVAT annotations')
    parser.add_argument('--input', '-i', 
                       default='public/liver-model-gltf/annotations.xml',
                       help='Input annotations.xml file')
    parser.add_argument('--output', '-o',
                       default='public/liver-model-gltf/segmentation.png',
                       help='Output segmentation map PNG file')
    parser.add_argument('--size', '-s',
                       type=int,
                       default=4096,
                       help='Size of square output image (default: 4096 for 4K)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input):
        print(f"Error: Input file {args.input} not found!")
        return 1
    
    try:
        print(f"Parsing annotations from: {args.input}")
        polylines = parse_annotations(args.input)
        print(f"Found {len(polylines)} polylines")
        
        # Get unique labels
        labels = sorted(set(p['label'] for p in polylines))
        print(f"Classes: {labels}")
        
        print(f"Creating {args.size}x{args.size} segmentation map...")
        create_segmentation_map(polylines, args.output, args.size)
        
        print("Done!")
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main())