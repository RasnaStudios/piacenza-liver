#!/usr/bin/env python3
"""
Create a square segmentation map PNG from CVAT annotations.xml file.
Each class (1-42) gets a grayscale value equal to its class number.

Optionally, also generate a texture atlas where each tile contains the alpha
mask for a single class (RGB=white, A=mask). A JSON index is written alongside
with atlas layout and class->tile mapping.
"""

import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image, ImageDraw
import json
import argparse
import os
from scipy import ndimage

def smooth_mask(mask_array, blur_radius=2, dilate_iterations=1):
    """Apply gaussian blur and dilation to smooth mask borders."""
    # Convert to float for processing
    mask_float = mask_array.astype(np.float32) / 255.0
    
    # Apply gaussian blur for smooth edges
    if blur_radius > 0:
        mask_float = ndimage.gaussian_filter(mask_float, sigma=blur_radius)
    
    # Apply dilation to expand regions slightly
    if dilate_iterations > 0:
        structure = ndimage.generate_binary_structure(2, 1)  # 4-connected
        for _ in range(dilate_iterations):
            mask_float = ndimage.binary_dilation(mask_float > 0.1, structure=structure).astype(np.float32)
    
    # Convert back to 0-255 range
    return (mask_float * 255).astype(np.uint8)

def parse_annotations(xml_file):
    """Parse the CVAT annotations XML file and extract polylines and polygons."""
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
    
    # Find all polygon elements
    for polygon in root.findall('.//polygon'):
        label = int(polygon.get('label'))
        points_str = polygon.get('points')
        
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


def create_mask_atlas(polylines, atlas_path, meta_path, tile_size=512, cols=8, source_size=4096):
    """Generate an RGBA atlas with one tile per label: RGB=white, A=mask.
    The atlas packs tiles row-wise with given cols and tile_size.
    Outputs a JSON meta with cols, rows, tileSize and label->index mapping.
    """
    # Determine labels and rows - use consecutive 1-42 range instead of sorted existing labels
    existing_labels = set(p['label'] for p in polylines)
    if not existing_labels:
        raise ValueError("No labels found for atlas generation")
    
    # Use full 1-42 range to match expected segmentation IDs (including future 41, 42)
    labels = list(range(1, 43))  # 1, 2, 3, ..., 42 (always generate 42 tiles)
    count = len(labels)
    rows = (count + cols - 1) // cols

    atlas_w = cols * tile_size
    atlas_h = rows * tile_size
    print(f"Creating mask atlas {atlas_w}x{atlas_h} with {cols} cols, {rows} rows, {count} tiles")

    # Prepare drawing groups
    polylines_by_label = {}
    for polyline in polylines:
        polylines_by_label.setdefault(polyline['label'], []).append(polyline['points'])

    atlas = Image.new('RGBA', (atlas_w, atlas_h), (0, 0, 0, 0))

    index_map = {}
    for idx, label in enumerate(labels):
        r = idx // cols
        c = idx % cols
        x0 = c * tile_size
        y0 = r * tile_size

        # Create full-size mask aligned to segmentation UV space, then downscale
        full_mask = Image.new('L', (source_size, source_size), 0)
        draw_full = ImageDraw.Draw(full_mask)
        for points in polylines_by_label.get(label, []):
            if not points:
                continue
            poly = [(int(x), int(y)) for (x, y) in points]
            if len(poly) >= 3:
                draw_full.polygon(poly, fill=255)

        # Downscale with NEAREST to preserve hard edges
        tile_mask = full_mask.resize((tile_size, tile_size), Image.NEAREST)
        # Binarize to 0/255 to avoid gray bleed when sampling
        tile_mask = tile_mask.point(lambda v: 255 if v >= 128 else 0, mode='L')
        
        # Apply minimal smoothing to borders for anti-aliased highlights
        tile_array = np.array(tile_mask)
        tile_array = smooth_mask(tile_array, blur_radius=1, dilate_iterations=0)
        tile_mask = Image.fromarray(tile_array, mode='L')

        # Compose tile with RGB = mask (grayscale), alpha = 255 (opaque)
        tile_rgb = Image.merge('RGB', (tile_mask, tile_mask, tile_mask))
        opaque_alpha = Image.new('L', (tile_size, tile_size), 255)
        tile_rgba = Image.merge('RGBA', (*tile_rgb.split(), opaque_alpha))
        atlas.paste(tile_rgba, (x0, y0))

        index_map[int(label)] = {
            'index': idx,
            'row': r,
            'col': c
        }

    atlas.save(atlas_path)
    print(f"Mask atlas saved to: {atlas_path}")

    meta = {
        'cols': cols,
        'rows': rows,
        'tileSize': tile_size,
        'labels': index_map
    }
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)
    print(f"Atlas metadata saved to: {meta_path}")

def main():
    parser = argparse.ArgumentParser(description='Create square segmentation map and optional mask atlas from CVAT annotations')
    parser.add_argument('--input', '-i', 
                       default='src/assets/annotations.xml',
                       help='Input annotations.xml file')
    parser.add_argument('--output', '-o',
                       default='src/assets/segmentation.png',
                       help='Output segmentation map PNG file')
    parser.add_argument('--size', '-s',
                       type=int,
                       default=4096,
                       help='Size of square output image (default: 4096 for 4K)')
    parser.add_argument('--atlas', action='store_true', default=True, help='Generate a mask atlas and JSON metadata (default: True)')
    parser.add_argument('--no-atlas', action='store_false', dest='atlas', help='Skip atlas generation')
    parser.add_argument('--atlas-output', default='src/assets/segmentation_atlas.png', help='Output path for atlas PNG')
    parser.add_argument('--atlas-meta', default='src/assets/segmentation_atlas.json', help='Output path for atlas JSON metadata')
    parser.add_argument('--tile', type=int, default=256, help='Atlas tile size in pixels (default: 256)')
    parser.add_argument('--cols', type=int, default=7, help='Atlas number of columns (default: 7)')
    
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

        if args.atlas:
            create_mask_atlas(polylines, args.atlas_output, args.atlas_meta, tile_size=args.tile, cols=args.cols)
        
        print("Done!")
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main())
