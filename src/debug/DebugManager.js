/**
 * Debug Manager
 * Handles debugging functionality and exposes debug methods globally
 */

export class DebugManager {
  constructor() {
    this.debugInfo = {};
  }

  initialize() {
    this.exposeDebugMethods();
  }

  /**
   * Expose debug methods globally
   */
  exposeDebugMethods() {
    // Make debug methods available globally for console access
    window.debugPrintCapsules = () => this.debugPrintCapsules();
    window.testAllCapsules = () => this.testAllCapsules();
    window.testPrintCapsules = () => this.testPrintCapsules();
    window.debugPositioning = () => this.debugPositioning();
    window.forceRenderCapsules = () => this.forceRenderCapsules();
  }

  /**
   * Debug print capsules
   */
  debugPrintCapsules() {
    console.log("=== DEBUG PRINT CAPSULES ===");

    const outlineCheckbox = document.getElementById("outlineFoundWords");
    const solutionGrid = document.getElementById("solutionGrid");

    console.log("Outline checkbox checked:", outlineCheckbox?.checked);
    console.log("Solution grid hidden:", solutionGrid?.classList.contains("hidden"));

    // Get placed word infos from the main generator if available
    if (window.generator) {
      console.log("Placed word infos:", window.generator.placedWordInfos);
    }

    const table = solutionGrid?.querySelector("table");
    console.log("Table found:", !!table);

    if (table) {
      console.log("Table dimensions:", table.offsetWidth, "x", table.offsetHeight);
      const overlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
      console.log("Existing overlays:", overlays.length);
    }

    // Show solution and force render
    if (solutionGrid?.classList.contains("hidden")) {
      solutionGrid.classList.remove("hidden");
    }

    if (table && window.generator) {
      console.log("Rendering ALL capsules...");
      window.generator.renderingManager.renderAllCapsulesForPrint(window.generator.placedWordInfos);

      // Check what was created
      setTimeout(() => {
        const newOverlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
        console.log("Overlays after rendering:", newOverlays.length);
        console.log("=== END DEBUG ===");
      }, 100);
    }
  }

  /**
   * Test all capsules
   */
  testAllCapsules() {
    if (!window.generator) {
      console.error("Generator not available");
      return;
    }

    console.log("Testing ALL capsule rendering...");
    console.log("Placed word infos:", window.generator.placedWordInfos);

    const horizontalWords = window.generator.placedWordInfos.filter((info) => info.dRow === 0 || info.dCol === 0);
    const diagonalWords = window.generator.placedWordInfos.filter((info) => Math.abs(info.dRow) === 1 && Math.abs(info.dCol) === 1);

    console.log("Horizontal/Vertical words:", horizontalWords.length);
    console.log("Diagonal words:", diagonalWords.length);
    console.log("Total words:", window.generator.placedWordInfos.length);

    // Show solution if hidden
    const solutionGrid = document.getElementById("solutionGrid");
    if (solutionGrid?.style.display === "none") {
      window.generator.toggleSolution();
    }

    // Force re-render
    const table = solutionGrid?.querySelector("table");
    if (table) {
      window.generator.renderingManager.renderAllCapsulesForPrint(window.generator.placedWordInfos);
    }

    console.log("All capsules should now be visible!");
  }

  /**
   * Test print capsules
   */
  testPrintCapsules() {
    if (!window.generator) {
      console.error("Generator not available");
      return;
    }

    console.log("Testing print capsules...");

    // Show solution and force render
    const solutionGrid = document.getElementById("solutionGrid");
    if (solutionGrid?.classList.contains("hidden")) {
      solutionGrid.classList.remove("hidden");
    }

    const table = solutionGrid?.querySelector("table");
    if (table) {
      window.generator.renderingManager.renderAllCapsulesForPrint(window.generator.placedWordInfos);
    }

    console.log("Print capsules rendered!");
  }

  /**
   * Debug positioning
   */
  debugPositioning() {
    console.log("=== DEBUG POSITIONING ===");

    const solutionGrid = document.getElementById("solutionGrid");
    const table = solutionGrid?.querySelector("table");

    if (table) {
      const rect = table.getBoundingClientRect();
      console.log("Table bounding rect:", rect);
      console.log("Table offset dimensions:", table.offsetWidth, "x", table.offsetHeight);
      console.log("Table client dimensions:", table.clientWidth, "x", table.clientHeight);

      const cellWidth = rect.width / table.rows[0].cells.length;
      const cellHeight = rect.height / table.rows.length;
      console.log("Calculated cell dimensions:", cellWidth, "x", cellHeight);
    }

    console.log("=== END DEBUG ===");
  }

  /**
   * Force render capsules
   */
  forceRenderCapsules() {
    if (!window.generator) {
      console.error("Generator not available");
      return;
    }

    console.log("Force rendering capsules...");
    window.generator.renderingManager.forceRenderCapsules(window.generator.placedWordInfos);
    console.log("Capsules force rendered!");
  }

  /**
   * Get debug info
   */
  getDebugInfo() {
    return {
      ...this.debugInfo,
      generator: window.generator
        ? {
            hasPuzzle: !!window.generator.currentPuzzle,
            hasSolution: !!window.generator.currentSolution,
            wordCount: window.generator.placedWordInfos?.length || 0,
          }
        : null,
    };
  }

  /**
   * Set debug info
   */
  setDebugInfo(key, value) {
    this.debugInfo[key] = value;
  }
}
