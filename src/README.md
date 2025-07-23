# Word Search Generator - Modular Architecture

This directory contains the refactored, modular version of the Word Search Generator application.

## Directory Structure

```
src/
├── core/                    # Core application logic
│   ├── WordSearchGenerator.js  # Main orchestrator class
│   ├── InputManager.js         # Input validation and retrieval
│   └── PuzzleEngine.js         # Puzzle generation algorithm
├── ui/                     # User interface management
│   └── UIManager.js           # UI interactions and state
├── rendering/              # Visual rendering components
│   ├── RenderingManager.js    # Main rendering coordinator
│   ├── GridRenderer.js        # Basic grid rendering
│   └── CapsuleRenderer.js     # Word outline capsules
├── export/                 # Export functionality
│   ├── ExportManager.js       # Print and export coordination
│   └── PDFExporter.js         # PDF generation
├── utils/                  # Utility functions
│   └── GridUtils.js           # Grid operations
├── debug/                  # Debugging tools
│   └── DebugManager.js        # Debug functionality
└── main.js                 # Application entry point
```

## Architecture Overview

### Core Components

- **WordSearchGenerator**: Main orchestrator that coordinates all components
- **InputManager**: Handles all input validation, retrieval, and preference management
- **PuzzleEngine**: Contains the core puzzle generation algorithm

### UI Components

- **UIManager**: Manages all UI interactions, state, and DOM updates

### Rendering Components

- **RenderingManager**: Coordinates all rendering operations
- **GridRenderer**: Handles basic grid rendering and table creation
- **CapsuleRenderer**: Manages the complex word outline capsule overlays

### Export Components

- **ExportManager**: Handles print functionality and export coordination
- **PDFExporter**: Manages PDF generation (placeholder for now)

### Utility Components

- **GridUtils**: Static utility functions for grid operations
- **DebugManager**: Provides debugging tools and exposes debug methods globally

## Key Benefits

1. **Separation of Concerns**: Each class has a single, well-defined responsibility
2. **Modularity**: Components can be easily modified or replaced independently
3. **Testability**: Each module can be tested in isolation
4. **Maintainability**: Code is organized logically and easy to navigate
5. **Extensibility**: New features can be added without affecting existing code

## Usage

The application is initialized in `main.js` which creates the main `WordSearchGenerator` instance and exposes it globally for debugging.

### Debug Methods

The following debug methods are available globally:

- `debugPrintCapsules()` - Debug print capsule rendering
- `testAllCapsules()` - Test all capsule rendering
- `testPrintCapsules()` - Test print capsule rendering
- `debugPositioning()` - Debug positioning calculations
- `forceRenderCapsules()` - Force re-render all capsules

## Migration Notes

This modular structure maintains full compatibility with the original functionality while providing a much cleaner, more maintainable codebase. The complex capsule rendering logic that we debugged is now properly encapsulated in the `CapsuleRenderer` class.
