#!/usr/bin/env python3
"""
Script to create a segmentation map from CVAT XML annotations.
Converts polyline annotations to a segmentation map where each label
is represented by its assigned color.
"""

import xml.etree.ElementTree as ET
import numpy as np
import cv2
from PIL import Image, ImageDraw
import argparse
import os

def parse_cvat_xml(xml_path):
    """
    Parse CVAT XML file and extract labels and annotations.
    
    Args:
        xml_path (str): Path to the CVAT XML file
        
    Returns:
        tuple: (labels_dict, annotations_list, image_info)
    """
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    # Extract labels and their colors
    labels_dict = {}
    for label in root.findall('.//label'):
        name = label.find('name').text
        color = label.find('color').text
        # Convert hex color to RGB
        color_rgb = tuple(int(color[i:i+2], 16) for i in (1, 3, 5))  # Skip '#'
        labels_dict[name] = color_rgb
    
    # Extract image information
    image_elem = root.find('.//image')
    image_info = {
        'width': int(image_elem.get('width')),
        'height': int(image_elem.get('height')),
        'name': image_elem.get('name')
    }
    
    # Extract polyline annotations
    annotations = []
    for polyline in image_elem.findall('polyline'):
        label = polyline.get('label')
        points_str = polyline.get('points')
        
        # Parse points string "x1,y1;x2,y2;..."
        points = []
        for point_pair in points_str.split(';'):
            if point_pair.strip():
                x, y = map(float, point_pair.split(','))
                points.append((x, y))
        
        annotations.append({
            'label': label,
            'points': points
        })
    
    return labels_dict, annotations, image_info

def create_segmentation_map(labels_dict, annotations, image_info, output_path):
    """
    Create a grayscale segmentation map from the annotations.
    
    Args:
        labels_dict (dict): Dictionary mapping label names to RGB colors
        annotations (list): List of annotation dictionaries
        image_info (dict): Image dimensions and name
        output_path (str): Path to save the segmentation map
    """
    width = image_info['width']
    height = image_info['height']
    
    # Create a black background image (grayscale)
    segmentation_map = np.zeros((height, width), dtype=np.uint8)
    
    # Draw each polyline with its corresponding label value as gray intensity
    for annotation in annotations:
        label = annotation['label']
        points = annotation['points']
        
        # Convert label to integer for gray value
        try:
            gray_value = int(label)
        except ValueError:
            print(f"Warning: Could not convert label '{label}' to integer, skipping...")
            continue
        
        # Convert points to integer coordinates
        int_points = [(int(x), int(y)) for x, y in points]
        
        # Draw filled polygon with gray value
        cv2.fillPoly(segmentation_map, [np.array(int_points)], gray_value)
    
    # Save the segmentation map
    cv2.imwrite(output_path, segmentation_map)
    print(f"Grayscale segmentation map saved to: {output_path}")
    
    return segmentation_map

def create_label_map(labels_dict, output_path):
    """
    Create a label map showing which gray value corresponds to which label.
    
    Args:
        labels_dict (dict): Dictionary mapping label names to RGB colors
        output_path (str): Path to save the label map
    """
    # Create a simple visualization of labels and their gray values
    num_labels = len(labels_dict)
    img_height = 40 * num_labels
    img_width = 400
    
    label_img = np.ones((img_height, img_width, 3), dtype=np.uint8) * 255
    
    y_offset = 0
    for i, (label, color) in enumerate(sorted(labels_dict.items(), key=lambda x: int(x[0]))):
        # Convert label to gray value
        gray_value = int(label)
        
        # Draw gray rectangle
        cv2.rectangle(label_img, (10, y_offset + 5), (50, y_offset + 35), 
                     (gray_value, gray_value, gray_value), -1)
        
        # Add label text
        cv2.putText(label_img, f"Label {label} (Gray: {gray_value})", (70, y_offset + 25), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        
        y_offset += 40
    
    cv2.imwrite(output_path, label_img)
    print(f"Label map saved to: {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Create segmentation map from CVAT XML annotations')
    parser.add_argument('xml_path', help='Path to the CVAT XML file')
    parser.add_argument('--output', '-o', default='segmentation_map.png', 
                       help='Output path for segmentation map (default: segmentation_map.png)')
    parser.add_argument('--label-map', '-l', default='label_map.png',
                       help='Output path for label map (default: label_map.png)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.xml_path):
        print(f"Error: XML file '{args.xml_path}' not found.")
        return
    
    try:
        # Parse the XML file
        print(f"Parsing XML file: {args.xml_path}")
        labels_dict, annotations, image_info = parse_cvat_xml(args.xml_path)
        
        print(f"Found {len(labels_dict)} labels and {len(annotations)} annotations")
        print(f"Image dimensions: {image_info['width']}x{image_info['height']}")
        
        # Create segmentation map
        segmentation_map = create_segmentation_map(labels_dict, annotations, image_info, args.output)
        
        # Create label map
        create_label_map(labels_dict, args.label_map)
        
        print("Processing completed successfully!")
        
    except Exception as e:
        print(f"Error processing file: {e}")

if __name__ == "__main__":
    main() 