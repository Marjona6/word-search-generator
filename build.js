#!/usr/bin/env node

/**
 * Simple build script to combine all modules into a single file
 * Run with: node build.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the module order
const modules = ["src/utils/GridUtils.js", "src/core/InputManager.js", "src/core/PuzzleEngine.js", "src/ui/UIManager.js", "src/rendering/GridRenderer.js", "src/rendering/CapsuleRenderer.js", "src/rendering/RenderingManager.js", "src/export/PDFExporter.js", "src/export/ExportManager.js", "src/debug/DebugManager.js", "src/core/WordSearchGenerator.js", "src/main.js"];

// Read and combine all modules
let combinedCode = `/**
 * Word Search Generator - Built Version
 * Combined from modular source files
 * Generated on: ${new Date().toISOString()}
 */

`;

modules.forEach((modulePath) => {
  if (fs.existsSync(modulePath)) {
    const content = fs.readFileSync(modulePath, "utf8");

    // Remove import/export statements
    const cleanedContent = content
      .replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, "")
      .replace(/^export\s+/gm, "")
      .replace(/^\s*\/\*\*[\s\S]*?\*\/\s*$/gm, "") // Remove JSDoc comments
      .trim();

    combinedCode += `\n// ============================================================================\n`;
    combinedCode += `// ${path.basename(modulePath)}\n`;
    combinedCode += `// ============================================================================\n\n`;
    combinedCode += cleanedContent;
    combinedCode += `\n\n`;
  } else {
    console.warn(`Warning: Module not found: ${modulePath}`);
  }
});

// Write the combined file
fs.writeFileSync("script-built.js", combinedCode);
console.log("✅ Built script-built.js successfully!");
console.log("📁 You can now use script-built.js in your HTML file.");
