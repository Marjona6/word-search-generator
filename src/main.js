/**
 * Main Entry Point
 * Initializes the Word Search Generator application
 */

import { WordSearchGenerator } from "./core/WordSearchGenerator.js";

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing Word Search Generator...");

  try {
    // Create the main generator instance
    const generator = new WordSearchGenerator();

    // Expose globally for debugging
    window.generator = generator;

    console.log("Word Search Generator initialized successfully!");

    // Log available debug methods
    console.log("Available debug methods:");
    console.log("- debugPrintCapsules()");
    console.log("- testAllCapsules()");
    console.log("- testPrintCapsules()");
    console.log("- debugPositioning()");
    console.log("- forceRenderCapsules()");
  } catch (error) {
    console.error("Failed to initialize Word Search Generator:", error);

    // Show error to user
    const errorElement = document.getElementById("errorMessage");
    if (errorElement) {
      errorElement.textContent = "Failed to initialize the application. Please refresh the page.";
      errorElement.style.display = "block";
    }
  }
});
