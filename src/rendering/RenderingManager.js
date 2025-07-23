/**
 * Rendering Manager
 * Handles all grid rendering, visual effects, and capsule overlays
 */

import { GridRenderer } from "./GridRenderer.js";
import { CapsuleRenderer } from "./CapsuleRenderer.js";

export class RenderingManager {
  constructor() {
    this.gridRenderer = new GridRenderer();
    this.capsuleRenderer = new CapsuleRenderer();
  }

  initialize() {
    // Initialize renderers
  }

  /**
   * Render puzzle grid
   */
  renderPuzzleGrid(grid, showGridLines) {
    const container = document.getElementById("puzzleGrid");
    if (container) {
      this.gridRenderer.renderGrid(container, grid, "", false, showGridLines);
    }
  }

  /**
   * Render solution grid
   */
  renderSolutionGrid(solution, words, placedWordInfos, options) {
    const container = document.getElementById("solutionGrid");
    if (container) {
      this.gridRenderer.renderGrid(container, solution, "", true, true);

      // Apply solution display options
      this.applySolutionDisplayOptions(container, solution, words, placedWordInfos, options);
    }
  }

  /**
   * Update solution display
   */
  updateSolutionDisplay(solution, placedWordInfos, options) {
    const container = document.getElementById("solutionGrid");
    if (container) {
      this.applySolutionDisplayOptions(container, solution, [], placedWordInfos, options);
    }
  }

  /**
   * Apply solution display options
   */
  applySolutionDisplayOptions(container, solution, words, placedWordInfos, options) {
    const table = container.querySelector("table");
    if (!table) return;

    // Clear existing overlays
    this.clearOverlays(table);

    // Apply word highlighting
    if (options.colorWords) {
      this.highlightFoundWords(table, placedWordInfos);
    }

    // Apply word outlines
    if (options.outlineWords) {
      this.capsuleRenderer.renderAllCapsulesWithViewBox(container, table, placedWordInfos);
    }

    // Hide other letters
    if (options.hideOtherLetters) {
      this.hideOtherLetters(table, placedWordInfos);
    }
  }

  /**
   * Update grid borders
   */
  updateGridBorders(showBorder) {
    const puzzleTable = document.querySelector("#puzzleGrid table");
    const solutionTable = document.querySelector("#solutionGrid table");

    [puzzleTable, solutionTable].forEach((table) => {
      if (table) {
        if (showBorder) {
          table.style.border = "2px solid #333";
        } else {
          table.style.border = "none";
        }
      }
    });
  }

  /**
   * Render all capsules for print
   */
  renderAllCapsulesForPrint(placedWordInfos) {
    const container = document.getElementById("solutionGrid");
    const table = container?.querySelector("table");

    if (container && table) {
      // Remove existing overlays
      this.clearOverlays(table);

      // Render all capsules
      this.capsuleRenderer.renderAllCapsulesWithViewBox(container, table, placedWordInfos);
    }
  }

  /**
   * Clear overlays
   */
  clearOverlays(table) {
    const overlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
    overlays.forEach((overlay) => overlay.remove());
  }

  /**
   * Highlight found words
   */
  highlightFoundWords(table, placedWordInfos) {
    for (const info of placedWordInfos) {
      const { startRow, startCol, dRow, dCol, length } = info;

      for (let i = 0; i < length; i++) {
        const row = startRow + i * dRow;
        const col = startCol + i * dCol;

        const cell = table.rows[row]?.cells[col];
        if (cell) {
          cell.classList.add("found-word");
        }
      }
    }
  }

  /**
   * Hide other letters
   */
  hideOtherLetters(table, placedWordInfos) {
    const size = table.rows.length;
    const foundCells = new Set();

    // Mark found cells
    for (const info of placedWordInfos) {
      const { startRow, startCol, dRow, dCol, length } = info;

      for (let i = 0; i < length; i++) {
        const row = startRow + i * dRow;
        const col = startCol + i * dCol;
        foundCells.add(`${row},${col}`);
      }
    }

    // Hide other cells
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const cell = table.rows[row]?.cells[col];
        if (cell && !foundCells.has(`${row},${col}`)) {
          cell.style.color = "#ccc";
        }
      }
    }
  }

  /**
   * Force render capsules
   */
  forceRenderCapsules(placedWordInfos) {
    const container = document.getElementById("solutionGrid");
    const table = container?.querySelector("table");

    if (container && table) {
      this.clearOverlays(table);
      this.capsuleRenderer.renderAllCapsulesWithViewBox(container, table, placedWordInfos);
    }
  }
}
