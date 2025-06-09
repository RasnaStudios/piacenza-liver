# Converting the Sketchfab Piacenza Liver Model

## What You Have
✅ **model_file.binz** (10.6 MB) - Downloaded from Sketchfab
📍 Location: `~/Downloads/sketchfab-models/fegato-etrusco/model_file.binz`

## What You Need
🎯 **Usable 3D model** in OBJ, GLTF, or GLB format for your React app

## Conversion Methods

### Method 1: Browser Developer Tools (Recommended)

1. **Open Sketchfab model page** in Chrome
2. **Open Developer Tools** (F12)
3. **Go to Sources tab**
4. **Search for** `this._xhr=` (Ctrl+Shift+F)
5. **Set breakpoint** on the line with `this._xhr=`
6. **Refresh the page** - it will pause at the breakpoint
7. **In console, type:** `this._xhr.response`
8. **Look for the uncompressed data** - this will be the actual model
9. **Save the response** as a `.osgjs` file

### Method 2: Online OSG.JS Converters

1. **Upload your .binz file** to an OSG.JS to OBJ converter
2. **Popular converters:**
   - OSG.JS Viewer online tools
   - Three.js model converters
   - Blender with OSG.JS import plugins

### Method 3: Blender Import (Advanced)

1. **Install OSG.JS import addon** for Blender
2. **Import the .binz file** (may need decompression first)
3. **Export as OBJ, GLTF, or GLB**

## Using the Converted Model

Once you have a converted model file:

1. **Place the file** in `public/models/` directory:
   ```
   public/models/fegato_etrusco.obj
   # or
   public/models/fegato_etrusco.gltf
   # or  
   public/models/fegato_etrusco.glb
   ```

2. **The app will automatically detect** and load the authentic model
3. **You'll see** "✅ Authentic Sketchfab model loaded" in the status indicator

## File Structure
```
your-project/
├── public/
│   └── models/
│       └── fegato_etrusco.obj  # Place converted model here
├── src/
│   ├── utils/
│   │   └── modelLoader.js      # Handles model loading
│   └── App.jsx                 # Main application
└── ~/Downloads/sketchfab-models/
    └── fegato-etrusco/
        └── model_file.binz     # Original downloaded file
```

## Troubleshooting

### If conversion fails:
- The app will automatically fall back to the enhanced procedural model
- You'll see "🎨 Enhanced procedural model" in the status

### If you get a working model:
- The authentic Piacenza Liver will replace the procedural one
- All 16 deity inscriptions will be positioned on the real model
- Bronze material and lighting will be applied automatically

## Model Requirements

The converted model should be:
- **Format:** OBJ, GLTF, or GLB
- **Size:** Reasonable file size (under 50MB)
- **Geometry:** Clean mesh without errors
- **Scale:** Any scale (auto-adjusted by the app)

## Next Steps

1. **Try Method 1** (Browser Developer Tools) first
2. **If successful,** place the converted file in `public/models/`
3. **Refresh your app** to see the authentic model
4. **If it doesn't work,** the enhanced procedural model is still very good!

---

**Note:** The procedural model is already quite sophisticated and historically accurate. The Sketchfab model would provide the exact archaeological geometry, but both versions serve the educational purpose well. 