# Piacenza Liver - 3D Interactive Visualization

An interactive 3D visualization of the ancient Etruscan Piacenza Liver (Fegato di Piacenza), a bronze model used for divination that maps the cosmological structure of Etruscan religious beliefs. This project presents all 42 authentic Etruscan inscriptions with scholarly annotations following the Maggiani-Gottarelli cosmological framework.

## ✨ Features

- **Interactive 3D Model**: Navigate around the bronze liver model with mouse/touch controls
- **Authentic Etruscan Script**: All 42 inscriptions displayed in original Etruscan Unicode characters (𐌀-𐌚)
- **Scholarly Annotations**: Comprehensive deity information, divination meanings, and archaeological notes
- **Mobile Optimized**: Responsive design with touch controls and performance optimizations
- **Cosmological Grouping**: Organized by the six structural groups (A-G) of the liver's layout

## 🌐 Access the Website

The live website is available at: [liver.rasna.dev](https://liver.rasna.dev)

## 🚀 Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/piacenza-liver.git
   cd piacenza-liver
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```
   *Or if using npm:*
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```
   *Or if using npm:*
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Additional Commands

- **Build for production:**
  ```bash
  pnpm build
  ```

- **Preview production build:**
  ```bash
  pnpm preview
  ```

- **Lint code:**
  ```bash
  pnpm lint
  ```

## 🏛️ About the Piacenza Liver

The Piacenza Liver is a bronze model dating to the late 2nd or early 1st century BCE, discovered near Piacenza, Italy in 1877. It served as a guide for Etruscan haruspices (diviners) who interpreted the will of the gods by examining sheep livers. The model maps the Etruscan cosmos onto 42 sections, each dedicated to specific deities.

## 🛠️ Built With

- **React** - UI framework
- **Three.js** - 3D graphics and WebGL
- **Vite** - Build tool and development server
- **Etruscan Unicode** - Authentic historical script rendering

## 📚 Scholarly Sources

This visualization is based on research from:
- "Cosmogonica" scholarly framework
- "Padanu" archaeological studies
- Maggiani-Gottarelli cosmological interpretation

## 📱 Browser Compatibility

- Modern desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers with WebGL support
- Optimized performance for both desktop and mobile devices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# CVAT XML to Segmentation Map Converter

This script converts CVAT XML annotation files into segmentation maps. It reads polyline annotations and creates a visual segmentation map where each label is represented by its assigned color.

## Features

- Parses CVAT XML annotation files
- Extracts label colors and polyline coordinates
- Creates a segmentation map with filled polygons
- Generates a label map showing color-to-label correspondence
- Supports command-line arguments for customization

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Basic Usage
```bash
python create_segmentation_map.py /path/to/annotations.xml
```

### Advanced Usage
```bash
python create_segmentation_map.py /path/to/annotations.xml \
    --output my_segmentation.png \
    --label-map my_label_map.png
```

### Command Line Arguments

- `xml_path`: Path to the CVAT XML file (required)
- `--output`, `-o`: Output path for segmentation map (default: `segmentation_map.png`)
- `--label-map`, `-l`: Output path for label map (default: `label_map.png`)

## Output Files

1. **Segmentation Map**: A PNG image where each annotated region is filled with its corresponding label color
2. **Label Map**: A reference image showing which color corresponds to which label number

## Example

If you have a CVAT XML file at `/Users/land/Desktop/annotations.xml`, run:

```bash
python create_segmentation_map.py /Users/land/Desktop/annotations.xml
```

This will create:
- `segmentation_map.png` - The main segmentation map
- `label_map.png` - Reference showing label colors

## How It Works

1. **XML Parsing**: Extracts label definitions and their assigned colors
2. **Coordinate Processing**: Converts polyline point strings to coordinate arrays
3. **Map Generation**: Creates a black background image and fills each polyline region with its label color
4. **Visualization**: Draws both filled polygons and outlines for better visibility

## Requirements

- Python 3.6+
- numpy
- opencv-python
- Pillow
