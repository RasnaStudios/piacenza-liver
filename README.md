<div align="center">
  <img src="public/homepage.png" alt="Piacenza Liver - 3D Interactive Visualization" width="800">
</div>

An interactive 3D visualization of the ancient Etruscan Piacenza Liver (Fegato di Piacenza), a bronze model used for divination that maps the cosmological structure of Etruscan religious beliefs. This project presents all 42 authentic Etruscan inscriptions with scholarly annotations following the Maggiani-Gottarelli cosmological framework.

## ✨ Features

- **Interactive 3D Model**: Navigate around the bronze liver model with mouse/touch controls
- **Authentic Etruscan Script**: All 42 inscriptions displayed in original Etruscan Unicode characters (𐌀-𐌚)
- **Scholarly Annotations**: Comprehensive deity information, divination meanings, and archaeological notes
- **Cosmological Grouping**: Organized by the six structural groups (A-G) of the liver's layout
- **Direct Linking**: Share specific inscriptions, regions, or deities with URL hash navigation

## 🔗 Direct Linking

You can link directly to specific content using URL hashes:

- **Inscription by ID**: `/inscriptions#1` - Scrolls to and highlights inscription #1
- **Region/Zone**: `/inscriptions#sky` or `/inscriptions#water` - Jumps to a specific cosmological region
- **Deity**: `/inscriptions#tinia` or `/inscriptions#uni` - Navigates to a specific deity section

Examples:
- `https://liver.rasna.dev/inscriptions#5` - View inscription 5
- `https://liver.rasna.dev/inscriptions#sky` - Explore the Sky region
- `https://liver.rasna.dev/inscriptions#tinia` - See all inscriptions mentioning Tinia

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

## 🗺️ Segmentation Map Generation

To regenerate the segmentation map and atlas from CVAT annotations:

```bash
python3 scripts/create_segmentation_map.py
```

This will generate both:
- `src/assets/segmentation.png` - 4K segmentation map for UV picking
- `src/assets/segmentation_atlas.png` - 256px tile atlas for highlights
- `src/assets/segmentation_atlas.json` - Atlas metadata with tile positions

**Default settings (optimized):**
- Input: `src/assets/annotations.xml`
- Segmentation: 4096×4096 pixels
- Atlas: 256px tiles, 8 columns, anti-aliased borders
- Output: Both segmentation map and atlas generated automatically

**Custom options:**
```bash
python3 scripts/create_segmentation_map.py --size 2048 --tile 512 --no-atlas
```

## 🛠️ Built With

- **React** - UI framework
- **Three.js** - 3D graphics and WebGL
- **Vite** - Build tool and development server
- **Etruscan Unicode** - Authentic historical script rendering

## 📚 Scholarly Sources

This visualization is based on research from:
- "Cosmogonica" and "padanu" by Gottarelli
- Maggiani-Gottarelli cosmological interpretation

## 📱 Browser Compatibility

- Modern desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers with WebGL support
- Optimized performance for both desktop and mobile devices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
