/**
 * Grid Utilities
 * Utility functions for grid operations
 */

export class GridUtils {
  /**
   * Create an empty grid
   */
  static createEmptyGrid(size) {
    const grid = [];
    for (let i = 0; i < size; i++) {
      grid[i] = [];
      for (let j = 0; j < size; j++) {
        grid[i][j] = "";
      }
    }
    return grid;
  }

  /**
   * Fill remaining empty cells with random letters
   */
  static fillRemainingCells(grid) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] === "") {
          grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  }

  /**
   * Count filled cells in grid
   */
  static countFilledCells(grid) {
    let count = 0;
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] !== "") {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Create table HTML from grid
   */
  static createTableHTML(grid, cellClass = "") {
    let html = "<table>";

    for (let row = 0; row < grid.length; row++) {
      html += "<tr>";
      for (let col = 0; col < grid[row].length; col++) {
        const cellContent = grid[row][col] || "&nbsp;";
        html += `<td class="${cellClass}">${cellContent}</td>`;
      }
      html += "</tr>";
    }

    html += "</table>";
    return html;
  }

  /**
   * Create table for PDF
   */
  static createTableForPDF(grid, cellClass = "", isSolution = false) {
    let html = '<table style="border-collapse: collapse; width: 100%;">';

    for (let row = 0; row < grid.length; row++) {
      html += "<tr>";
      for (let col = 0; col < grid[row].length; col++) {
        const cellContent = grid[row][col] || "&nbsp;";
        const cellStyle = this.getCellStyle(cellClass, isSolution);
        html += `<td class="${cellClass}" style="${cellStyle}">${cellContent}</td>`;
      }
      html += "</tr>";
    }

    html += "</table>";
    return html;
  }

  /**
   * Get cell style for PDF
   */
  static getCellStyle(cellClass, isSolution) {
    const baseStyle = "border: 1px solid #ccc; padding: 8px; text-align: center; font-weight: bold;";

    if (cellClass === "found-word") {
      return baseStyle + "background-color: #90EE90;";
    } else if (isSolution && cellClass === "") {
      return baseStyle + "color: #ccc;";
    } else {
      return baseStyle;
    }
  }

  /**
   * Calculate word list height for PDF
   */
  static calculateWordListHeight(contentWidth) {
    // Rough estimation: 20px per word line
    return 20;
  }

  /**
   * Get grid dimensions
   */
  static getGridDimensions(grid) {
    return {
      rows: grid.length,
      cols: grid[0] ? grid[0].length : 0,
    };
  }

  /**
   * Check if position is within grid bounds
   */
  static isWithinBounds(grid, row, col) {
    return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
  }

  /**
   * Get cell value safely
   */
  static getCell(grid, row, col) {
    if (this.isWithinBounds(grid, row, col)) {
      return grid[row][col];
    }
    return null;
  }

  /**
   * Set cell value safely
   */
  static setCell(grid, row, col, value) {
    if (this.isWithinBounds(grid, row, col)) {
      grid[row][col] = value;
      return true;
    }
    return false;
  }
}
