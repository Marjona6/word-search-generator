# Word Search Puzzle Generator

A complete browser-based word search puzzle generator with a clean, modular architecture.

## 🎯 Features

- **Smart Word Placement**: Intelligent algorithm that places words optimally with overlaps
- **Multiple Directions**: Support for horizontal, vertical, diagonal, and reverse word placement
- **Visual Word Outlines**: Beautiful capsule-shaped outlines around found words
- **Print-Ready**: Optimized for printing with proper capsule rendering
- **Customizable Grid**: Options for grid lines, borders, and styling
- **Solution Display**: Multiple options for showing/hiding solution elements
- **PDF Export**: Ready for PDF generation (placeholder implementation)

## 🏗️ Architecture

The application has been refactored into a clean, modular structure:

```
src/
├── core/                    # Core application logic
│   ├── WordSearchGenerator.js  # Main orchestrator
│   ├── InputManager.js         # Input validation & retrieval
│   └── PuzzleEngine.js         # Puzzle generation algorithm
├── ui/                     # User interface management
│   └── UIManager.js           # UI interactions & state
├── rendering/              # Visual rendering components
│   ├── RenderingManager.js    # Rendering coordination
│   ├── GridRenderer.js        # Basic grid rendering
│   └── CapsuleRenderer.js     # Word outline capsules
├── export/                 # Export functionality
│   ├── ExportManager.js       # Print & export coordination
│   └── PDFExporter.js         # PDF generation
├── utils/                  # Utility functions
│   └── GridUtils.js           # Grid operations
├── debug/                  # Debugging tools
│   └── DebugManager.js        # Debug functionality
└── main.js                 # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser with ES6 module support
- Python 3 (for local development server)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/word-search-generator.git
cd word-search-generator
```

2. Start the development server:

```bash
npm start
# or
python3 -m http.server 8000
```

3. Open your browser and navigate to `http://localhost:8000`

## 🎮 Usage

1. **Enter Words**: Add your words to the word list (one per line)
2. **Configure Options**: Select directions, grid size, and display preferences
3. **Generate**: Click "Generate Puzzle" to create your word search
4. **Print**: Use the print button for a print-ready version with word outlines
5. **Export**: Download as PDF (placeholder functionality)

## 🔧 Debugging

The application includes comprehensive debugging tools. Open the browser console and use these methods:

- `debugPrintCapsules()` - Debug print capsule rendering
- `testAllCapsules()` - Test all capsule rendering
- `testPrintCapsules()` - Test print capsule rendering
- `debugPositioning()` - Debug positioning calculations
- `forceRenderCapsules()` - Force re-render all capsules

## 🎨 Customization

### Grid Options

- **Show Grid Lines**: Toggle grid line visibility
- **Show Grid Border**: Toggle outer border
- **Grid Size**: Choose from 10x10 to 20x20

### Solution Display

- **Outline Found Words**: Show capsule outlines around words
- **Color Found Words**: Highlight words in pink
- **Hide Other Letters**: Gray out non-word letters in solution

### Word Directions

- **Horizontal**: Left to right
- **Vertical**: Top to bottom
- **Diagonal**: Diagonal placement
- **Reverse**: Backward placement

## 🐛 Troubleshooting

### Print Issues

If word outlines don't appear in print preview:

1. Ensure "Outline found words" is checked
2. Try the debug methods in the console
3. Check that the solution is visible before printing

### Performance

For large grids or many words:

1. Reduce grid size
2. Limit word count
3. Disable unnecessary directions

## 📁 Project Structure

```
word-search-generator/
├── src/                    # Modular source code
├── legacy/                 # Original monolithic code
├── index.html             # Main HTML file
├── styles.css             # Styling
├── package.json           # Project configuration
└── README.md              # This file
```

## 🔄 Migration from Legacy

The original monolithic `script.js` has been preserved in `legacy/script-original.js`. The new modular structure maintains full compatibility while providing:

- **Better Organization**: Logical separation of concerns
- **Easier Maintenance**: Smaller, focused modules
- **Improved Testing**: Isolated components
- **Enhanced Debugging**: Dedicated debug tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- The complex capsule rendering logic that ensures proper print output
- The modular architecture that makes the codebase maintainable
- The debugging tools that help troubleshoot issues quickly
