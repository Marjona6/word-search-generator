/**
 * Export Manager
 * Handles printing and PDF export functionality
 */

import { PDFExporter } from "./PDFExporter.js";

export class ExportManager {
  constructor() {
    this.pdfExporter = new PDFExporter();
  }

  initialize() {
    // Initialize export functionality
  }

  /**
   * Print the puzzle
   */
  printPuzzle(puzzle, solution, placedWordInfos, outlineWords) {
    console.log("printPuzzle called");

    // Ensure we have content to print
    if (!puzzle || !solution) {
      console.error("No puzzle or solution to print");
      return;
    }

    // Ensure solution is visible for print
    const solutionGrid = document.getElementById("solutionGrid");
    if (solutionGrid && solutionGrid.classList.contains("hidden")) {
      console.log("Solution was hidden, showing it for print");
      solutionGrid.classList.remove("hidden");
    }

    // Force re-render of ALL capsules for print
    if (outlineWords) {
      console.log("Force rendering ALL capsules for print");

      // First, remove any existing overlays
      const existingOverlays = solutionGrid.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
      existingOverlays.forEach((overlay) => overlay.remove());

      // Then render ALL capsules
      setTimeout(() => {
        const table = solutionGrid.querySelector("table");
        if (table) {
          console.log("Rendering ALL capsules with viewBox for print");
          this.renderAllCapsulesForPrint(placedWordInfos);

          // Give the overlays a moment to render before printing
          setTimeout(() => {
            console.log("Calling window.print()");
            window.print();
          }, 500);
        } else {
          console.log("No table found for print");
          window.print();
        }
      }, 100);
    } else {
      console.log("Calling window.print()");
      window.print();
    }
  }

  /**
   * Download PDF
   */
  downloadPDF(puzzle, solution, placedWordInfos, preferences) {
    this.pdfExporter.downloadPDF(puzzle, solution, placedWordInfos, preferences);
  }

  /**
   * Handle print mode detection
   */
  handlePrintMode(outlineWords, renderCapsulesCallback) {
    console.log("Handling print mode");

    // Add print mode detection
    const mediaQuery = window.matchMedia("print");

    const handlePrintChange = (e) => {
      if (e.matches) {
        console.log("Print mode detected - ensuring ALL overlays are visible");
        // Force re-render of ALL capsules for print
        if (outlineWords) {
          setTimeout(() => {
            const solutionGrid = document.getElementById("solutionGrid");
            const table = solutionGrid?.querySelector("table");
            if (table) {
              renderCapsulesCallback();
            }
          }, 100);
        }
      }
    };

    // Listen for print mode changes
    mediaQuery.addListener(handlePrintChange);

    // Also handle the beforeprint event
    window.addEventListener("beforeprint", () => {
      console.log("beforeprint event fired - rendering ALL capsules");
      if (outlineWords) {
        setTimeout(() => {
          const solutionGrid = document.getElementById("solutionGrid");
          const table = solutionGrid?.querySelector("table");
          if (table) {
            renderCapsulesCallback();
          }
        }, 100);
      }
    });
  }

  /**
   * Render all capsules for print
   */
  renderAllCapsulesForPrint(placedWordInfos) {
    const solutionGrid = document.getElementById("solutionGrid");
    const table = solutionGrid?.querySelector("table");

    if (solutionGrid && table) {
      // Remove existing overlays
      const existingOverlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
      existingOverlays.forEach((overlay) => overlay.remove());

      // Render all capsules using the same method as the main renderer
      this.renderAllCapsulesWithViewBox(solutionGrid, table, placedWordInfos);
    }
  }

  /**
   * Render all capsules with viewBox (copy of the main method)
   */
  renderAllCapsulesWithViewBox(container, table, placedWordInfos) {
    if (!container || !table || !placedWordInfos) return;

    // Get actual rendered dimensions
    const rect = table.getBoundingClientRect();
    const actualCellWidth = rect.width / table.rows[0].cells.length;
    const actualCellHeight = rect.height / table.rows.length;

    // Create SVG overlay
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", rect.width);
    svg.setAttribute("height", rect.height);
    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.pointerEvents = "none";
    svg.classList.add("capsule-canvas-overlay");
    svg.style.zIndex = 10;

    // Process ALL words
    for (const info of placedWordInfos) {
      const { startRow, startCol, dRow, dCol, length } = info;
      const endRow = startRow + (length - 1) * dRow;
      const endCol = startCol + (length - 1) * dCol;

      // Calculate positions in the SVG coordinate system
      const startX = startCol * actualCellWidth + actualCellWidth / 2;
      const startY = startRow * actualCellHeight + actualCellHeight / 2;
      const endX = endCol * actualCellWidth + actualCellWidth / 2;
      const endY = endRow * actualCellHeight + actualCellHeight / 2;

      // Capsule parameters
      const extension = actualCellHeight * 0.4;
      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const capsuleLength = dist + extension * 2;
      const capsuleWidth = actualCellHeight * 0.7;
      const radius = capsuleWidth / 2;

      // Create proper capsule shape using SVG path
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

      // Calculate capsule path
      const halfLength = capsuleLength / 2;
      const centerX = (startX + endX) / 2;
      const centerY = (startY + endY) / 2;

      // Create capsule path: rectangle with rounded ends
      const pathData = [`M ${centerX - halfLength + radius} ${centerY - radius}`, `L ${centerX + halfLength - radius} ${centerY - radius}`, `A ${radius} ${radius} 0 0 1 ${centerX + halfLength - radius} ${centerY + radius}`, `L ${centerX - halfLength + radius} ${centerY + radius}`, `A ${radius} ${radius} 0 0 1 ${centerX - halfLength + radius} ${centerY - radius}`, "Z"].join(" ");

      path.setAttribute("d", pathData);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#000");
      path.setAttribute("stroke-width", actualCellHeight * 0.15);
      path.setAttribute("opacity", "0.85");
      path.setAttribute("transform", `rotate(${angle} ${centerX} ${centerY})`);
      svg.appendChild(path);
    }

    table.style.position = "relative";
    table.appendChild(svg);
  }
}
