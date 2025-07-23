/**
 * Grid Renderer
 * Handles basic grid rendering and table creation
 */

import { GridUtils } from "../utils/GridUtils.js";

export class GridRenderer {
  /**
   * Render a grid as an HTML table
   */
  renderGrid(container, grid, cellClass = "", isSolution = false, showGridLines = true) {
    if (!container || !grid) return;

    // Clear container
    container.innerHTML = "";

    // Create table
    const table = document.createElement("table");

    // Apply grid lines styling
    if (showGridLines) {
      table.style.borderCollapse = "collapse";
      table.style.border = "1px solid #ccc";
    } else {
      table.style.borderCollapse = "collapse";
      table.style.border = "none";
    }

    // Create table rows and cells
    for (let row = 0; row < grid.length; row++) {
      const tr = document.createElement("tr");

      for (let col = 0; col < grid[row].length; col++) {
        const td = document.createElement("td");
        const cellContent = grid[row][col] || "&nbsp;";

        td.innerHTML = cellContent;
        td.className = cellClass;

        // Apply cell styling
        this.applyCellStyling(td, showGridLines, isSolution);

        tr.appendChild(td);
      }

      table.appendChild(tr);
    }

    container.appendChild(table);
  }

  /**
   * Apply styling to table cells
   */
  applyCellStyling(cell, showGridLines, isSolution) {
    // Base styling
    cell.style.padding = "8px";
    cell.style.textAlign = "center";
    cell.style.fontWeight = "bold";
    cell.style.fontSize = "16px";
    cell.style.minWidth = "30px";
    cell.style.minHeight = "30px";

    // Grid lines
    if (showGridLines) {
      cell.style.border = "1px solid #ccc";
    } else {
      cell.style.border = "none";
    }

    // Solution-specific styling
    if (isSolution) {
      cell.style.backgroundColor = "#f9f9f9";
    }
  }

  /**
   * Create table HTML string
   */
  createTableHTML(grid, cellClass = "") {
    return GridUtils.createTableHTML(grid, cellClass);
  }

  /**
   * Create table for PDF
   */
  createTableForPDF(grid, cellClass = "", isSolution = false) {
    return GridUtils.createTableForPDF(grid, cellClass, isSolution);
  }

  /**
   * Update existing table cells
   */
  updateTableCells(table, grid) {
    if (!table || !grid) return;

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cell = table.rows[row]?.cells[col];
        if (cell) {
          const cellContent = grid[row][col] || "&nbsp;";
          cell.innerHTML = cellContent;
        }
      }
    }
  }

  /**
   * Get table dimensions
   */
  getTableDimensions(table) {
    if (!table) return { rows: 0, cols: 0 };

    return {
      rows: table.rows.length,
      cols: table.rows[0] ? table.rows[0].cells.length : 0,
    };
  }

  /**
   * Get cell element by position
   */
  getCellElement(table, row, col) {
    if (!table || !table.rows[row]) return null;
    return table.rows[row].cells[col] || null;
  }

  /**
   * Set cell content
   */
  setCellContent(table, row, col, content) {
    const cell = this.getCellElement(table, row, col);
    if (cell) {
      cell.innerHTML = content || "&nbsp;";
    }
  }

  /**
   * Add CSS class to cell
   */
  addCellClass(table, row, col, className) {
    const cell = this.getCellElement(table, row, col);
    if (cell) {
      cell.classList.add(className);
    }
  }

  /**
   * Remove CSS class from cell
   */
  removeCellClass(table, row, col, className) {
    const cell = this.getCellElement(table, row, col);
    if (cell) {
      cell.classList.remove(className);
    }
  }

  /**
   * Set cell style
   */
  setCellStyle(table, row, col, styleProperty, value) {
    const cell = this.getCellElement(table, row, col);
    if (cell) {
      cell.style[styleProperty] = value;
    }
  }
}
