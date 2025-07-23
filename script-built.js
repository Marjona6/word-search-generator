/**
 * Word Search Generator - Built Version
 * Combined from modular source files
 * Generated on: 2025-07-23T08:48:46.589Z
 */


// ============================================================================
// GridUtils.js
// ============================================================================

class GridUtils {

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

  static calculateWordListHeight(contentWidth) {
    // Rough estimation: 20px per word line
    return 20;
  }

  static getGridDimensions(grid) {
    return {
      rows: grid.length,
      cols: grid[0] ? grid[0].length : 0,
    };
  }

  static isWithinBounds(grid, row, col) {
    return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
  }

  static getCell(grid, row, col) {
    if (this.isWithinBounds(grid, row, col)) {
      return grid[row][col];
    }
    return null;
  }

  static setCell(grid, row, col, value) {
    if (this.isWithinBounds(grid, row, col)) {
      grid[row][col] = value;
      return true;
    }
    return false;
  }
}


// ============================================================================
// InputManager.js
// ============================================================================

class InputManager {
  constructor() {
    this.elements = {};
  }

  initialize() {
    this.initializeElements();
  }

  initializeElements() {
    // Input elements
    this.elements.puzzleName = document.getElementById("puzzleName");
    this.elements.wordList = document.getElementById("wordList");
    this.elements.puzzleSize = document.getElementById("puzzleSize");
    this.elements.horizontal = document.getElementById("horizontal");
    this.elements.vertical = document.getElementById("vertical");
    this.elements.diagonal = document.getElementById("diagonal");
    this.elements.reverse = document.getElementById("reverse");
    this.elements.showGridLines = document.getElementById("showGridLines");
    this.elements.showGridBorder = document.getElementById("showGridBorder");
    this.elements.outlineFoundWords = document.getElementById("outlineFoundWords");
    this.elements.colorFoundWords = document.getElementById("colorFoundWords");
    this.elements.hideOtherSolutionLetters = document.getElementById("hideOtherSolutionLetters");
  }

  getWordList() {
    const wordListText = this.elements.wordList.value.trim();
    if (!wordListText) return [];

    return wordListText
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
      .map((word) => word.toUpperCase());
  }

  getPuzzleName() {
    return this.elements.puzzleName.value.trim() || "Word Search Puzzle";
  }

  getPuzzleSize() {
    return this.elements.puzzleSize.value;
  }

  getSelectedDirections() {
    const directions = [];

    if (this.elements.horizontal.checked) directions.push("horizontal");
    if (this.elements.vertical.checked) directions.push("vertical");
    if (this.elements.diagonal.checked) directions.push("diagonal");
    if (this.elements.reverse.checked) directions.push("reverse");

    return directions;
  }

  getGridLinesPreference() {
    return this.elements.showGridLines.checked;
  }

  getGridBorderPreference() {
    return this.elements.showGridBorder.checked;
  }

  getOutlineWordsPreference() {
    return this.elements.outlineFoundWords.checked;
  }

  getColorWordsPreference() {
    return this.elements.colorFoundWords.checked;
  }

  getHideOtherLettersPreference() {
    return this.elements.hideOtherSolutionLetters.checked;
  }

  getSolutionDisplayOptions() {
    return {
      outlineWords: this.getOutlineWordsPreference(),
      colorWords: this.getColorWordsPreference(),
      hideOtherLetters: this.getHideOtherLettersPreference(),
    };
  }

  getAllPreferences() {
    return {
      puzzleName: this.getPuzzleName(),
      gridLines: this.getGridLinesPreference(),
      gridBorder: this.getGridBorderPreference(),
      outlineWords: this.getOutlineWordsPreference(),
      colorWords: this.getColorWordsPreference(),
      hideOtherLetters: this.getHideOtherLettersPreference(),
    };
  }

  setHideOtherLettersDefault() {
    if (this.elements.hideOtherSolutionLetters) {
      if (this.getGridLinesPreference()) {
        this.elements.hideOtherSolutionLetters.checked = true;
      } else {
        this.elements.hideOtherSolutionLetters.checked = false;
      }
    }
  }

  validateInput(words, size, directions) {
    // Check if words are provided
    if (!words || words.length === 0) {
      this.showError("Please enter at least one word.");
      return false;
    }

    // Check word lengths
    const maxWordLength = Math.max(...words.map((word) => word.length));
    if (maxWordLength > size) {
      this.showError(`The longest word (${maxWordLength} letters) is longer than the grid size (${size}). Please increase the grid size or use shorter words.`);
      return false;
    }

    // Check if directions are selected
    if (directions.length === 0) {
      this.showError("Please select at least one direction for word placement.");
      return false;
    }

    // Check for duplicate words
    const uniqueWords = new Set(words);
    if (uniqueWords.size !== words.length) {
      this.showError("Duplicate words detected. Please remove duplicates.");
      return false;
    }

    // Check word format (letters only)
    for (const word of words) {
      if (!/^[A-Z]+$/.test(word)) {
        this.showError(`Invalid word format: "${word}". Words should contain only letters.`);
        return false;
      }
    }

    return true;
  }

  showError(message) {
    const errorElement = document.getElementById("errorMessage");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  hideError() {
    const errorElement = document.getElementById("errorMessage");
    if (errorElement) {
      errorElement.style.display = "none";
    }
  }
}


// ============================================================================
// PuzzleEngine.js
// ============================================================================

class PuzzleEngine {
  constructor() {
    this.maxAttempts = 1000;
    this.attemptsPerWord = 50;
  }

  createPuzzle(words, size, directions) {
    try {
      const result = this.createWordSearch(words, size, directions, this.attemptsPerWord);

      if (result.success) {
        return {
          success: true,
          puzzle: result.puzzle,
          solution: result.solution,
          placedWordInfos: result.placedWordInfos,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      console.error("Error creating puzzle:", error);
      return {
        success: false,
        error: "An unexpected error occurred while creating the puzzle",
      };
    }
  }

  createWordSearch(words, size, directions, attemptsPerWord) {
    const directionVectors = this.getDirectionVectors(directions);

    if (directionVectors.length === 0) {
      return { success: false, error: "No valid directions selected" };
    }

    // Try multiple times to place all words
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      const grid = GridUtils.createEmptyGrid(size);
      const solution = GridUtils.createEmptyGrid(size);
      const placedWordInfos = [];
      let allWordsPlaced = true;

      // Shuffle words for variety
      const shuffledWords = this.shuffleArray([...words]);

      // Try to place each word
      for (const word of shuffledWords) {
        const placementResult = this.placeWordSmart(grid, solution, word, directionVectors);

        if (placementResult.success) {
          placedWordInfos.push(placementResult.info);
        } else {
          allWordsPlaced = false;
          break;
        }
      }

      if (allWordsPlaced) {
        // Fill remaining cells with random letters
        GridUtils.fillRemainingCells(grid);

        return {
          success: true,
          puzzle: grid,
          solution: solution,
          placedWordInfos: placedWordInfos,
        };
      }
    }

    return {
      success: false,
      error: `Could not place all words after ${this.maxAttempts} attempts. Try increasing the grid size or reducing the number of words.`,
    };
  }

  placeWordSmart(grid, solution, word, directionVectors) {
    const size = grid.length;
    const bestPlacements = [];

    // Try all possible positions and directions
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        for (const direction of directionVectors) {
          if (this.canPlaceWord(grid, word, row, col, direction)) {
            const score = this.calculateSpacingScore(grid, word, row, col, direction);
            bestPlacements.push({ row, col, direction, score });
          }
        }
      }
    }

    if (bestPlacements.length === 0) {
      return { success: false };
    }

    // Sort by score (higher is better) and pick the best
    bestPlacements.sort((a, b) => b.score - a.score);
    const best = bestPlacements[0];

    // Place the word
    this.placeWordAt(grid, solution, word, best.row, best.col, best.direction);

    return {
      success: true,
      info: {
        word: word,
        startRow: best.row,
        startCol: best.col,
        dRow: best.direction[0],
        dCol: best.direction[1],
        length: word.length,
      },
    };
  }

  canPlaceWord(grid, word, startRow, startCol, direction) {
    const [dRow, dCol] = direction;
    const size = grid.length;

    // Check if word fits within grid bounds
    const endRow = startRow + (word.length - 1) * dRow;
    const endCol = startCol + (word.length - 1) * dCol;

    if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
      return false;
    }

    // Check if cells are available
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;
      const cell = grid[row][col];

      if (cell !== "" && cell !== word[i]) {
        return false;
      }
    }

    return true;
  }

  calculateSpacingScore(grid, word, startRow, startCol, direction) {
    const [dRow, dCol] = direction;
    let score = 0;

    // Prefer placements with more overlaps (shared letters)
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;
      const cell = grid[row][col];

      if (cell === word[i]) {
        score += 10; // Bonus for overlaps
      } else if (cell === "") {
        score += 1; // Empty cell
      }
    }

    // Prefer placements that don't create isolated areas
    const overlapCount = this.countOverlap(grid, word, startRow, startCol, direction);
    score += overlapCount * 5;

    return score;
  }

  countOverlap(grid, word, startRow, startCol, direction) {
    const [dRow, dCol] = direction;
    let overlaps = 0;

    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;

      if (grid[row][col] === word[i]) {
        overlaps++;
      }
    }

    return overlaps;
  }

  placeWordAt(grid, solution, word, startRow, startCol, direction) {
    const [dRow, dCol] = direction;

    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;

      grid[row][col] = word[i];
      solution[row][col] = word[i];
    }
  }

  getDirectionVectors(directions) {
    const directionMap = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1],
      reverse: [-1, -1],
    };

    const vectors = [];

    for (const direction of directions) {
      if (directionMap[direction]) {
        vectors.push(directionMap[direction]);
      }
    }

    return vectors;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}


// ============================================================================
// UIManager.js
// ============================================================================

class UIManager {
  constructor() {
    this.elements = {};
    this.eventHandlers = {};
  }

  initialize() {
    this.initializeElements();
  }

  initializeElements() {
    // Input elements
    this.elements.generateBtn = document.getElementById("generateBtn");
    this.elements.toggleSolutionBtn = document.getElementById("toggleSolution");
    this.elements.printBtn = document.getElementById("printBtn");
    this.elements.downloadBtn = document.getElementById("downloadBtn");

    // Output elements
    this.elements.outputSection = document.getElementById("outputSection");
    this.elements.wordListDisplay = document.getElementById("wordListDisplay");
    this.elements.puzzleGrid = document.getElementById("puzzleGrid");
    this.elements.solutionGrid = document.getElementById("solutionGrid");
    this.elements.errorMessage = document.getElementById("errorMessage");
    this.elements.loadingIndicator = document.getElementById("loadingIndicator");
  }

  bindEvents(handlers) {
    this.eventHandlers = handlers;

    // Bind button events
    if (this.elements.generateBtn) {
      this.elements.generateBtn.addEventListener("click", handlers.generate);
    }

    if (this.elements.toggleSolutionBtn) {
      this.elements.toggleSolutionBtn.addEventListener("click", handlers.toggleSolution);
    }

    if (this.elements.printBtn) {
      this.elements.printBtn.addEventListener("click", handlers.print);
    }

    if (this.elements.downloadBtn) {
      this.elements.downloadBtn.addEventListener("click", handlers.download);
    }

    // Bind checkbox events
    this.bindCheckboxEvents();
  }

  bindCheckboxEvents() {
    const outlineCheckbox = document.getElementById("outlineFoundWords");
    const colorCheckbox = document.getElementById("colorFoundWords");
    const hideOtherCheckbox = document.getElementById("hideOtherSolutionLetters");
    const gridBorderCheckbox = document.getElementById("showGridBorder");

    if (outlineCheckbox && this.eventHandlers.outlineWords) {
      outlineCheckbox.addEventListener("change", this.eventHandlers.outlineWords);
    }

    if (colorCheckbox && this.eventHandlers.colorWords) {
      colorCheckbox.addEventListener("change", this.eventHandlers.colorWords);
    }

    if (hideOtherCheckbox && this.eventHandlers.hideOtherLetters) {
      hideOtherCheckbox.addEventListener("change", this.eventHandlers.hideOtherLetters);
    }

    if (gridBorderCheckbox && this.eventHandlers.gridBorder) {
      gridBorderCheckbox.addEventListener("change", this.eventHandlers.gridBorder);
    }
  }

  showLoading() {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.style.display = "block";
    }

    if (this.elements.generateBtn) {
      this.elements.generateBtn.disabled = true;
      this.elements.generateBtn.textContent = "Generating...";
    }
  }

  hideLoading() {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.style.display = "none";
    }

    if (this.elements.generateBtn) {
      this.elements.generateBtn.disabled = false;
      this.elements.generateBtn.textContent = "Generate Puzzle";
    }
  }

  showOutput() {
    if (this.elements.outputSection) {
      this.elements.outputSection.style.display = "block";
    }
  }

  hideOutput() {
    if (this.elements.outputSection) {
      this.elements.outputSection.style.display = "none";
    }
  }

  showError(message) {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
      this.elements.errorMessage.style.display = "block";
    }
  }

  hideError() {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.style.display = "none";
    }
  }

  updateWordListDisplay(words) {
    if (this.elements.wordListDisplay) {
      this.elements.wordListDisplay.innerHTML = words.map((word) => `<span class="word-item">${word}</span>`).join("");
    }
  }

  toggleSolutionVisibility() {
    if (this.elements.solutionGrid) {
      const isHidden = this.elements.solutionGrid.classList.contains("hidden");

      if (isHidden) {
        this.elements.solutionGrid.classList.remove("hidden");
        if (this.elements.toggleSolutionBtn) {
          this.elements.toggleSolutionBtn.textContent = "Hide Solution";
        }
      } else {
        this.elements.solutionGrid.classList.add("hidden");
        if (this.elements.toggleSolutionBtn) {
          this.elements.toggleSolutionBtn.textContent = "Show Solution";
        }
      }
    }
  }

  showSolution() {
    if (this.elements.solutionGrid) {
      this.elements.solutionGrid.classList.remove("hidden");
      if (this.elements.toggleSolutionBtn) {
        this.elements.toggleSolutionBtn.textContent = "Hide Solution";
      }
    }
  }

  hideSolution() {
    if (this.elements.solutionGrid) {
      this.elements.solutionGrid.classList.add("hidden");
      if (this.elements.toggleSolutionBtn) {
        this.elements.toggleSolutionBtn.textContent = "Show Solution";
      }
    }
  }

  getPuzzleGrid() {
    return this.elements.puzzleGrid;
  }

  getSolutionGrid() {
    return this.elements.solutionGrid;
  }

  isSolutionVisible() {
    return this.elements.solutionGrid && !this.elements.solutionGrid.classList.contains("hidden");
  }

  setButtonsEnabled(enabled) {
    const buttons = [this.elements.generateBtn, this.elements.toggleSolutionBtn, this.elements.printBtn, this.elements.downloadBtn];

    buttons.forEach((button) => {
      if (button) {
        button.disabled = !enabled;
      }
    });
  }

  updateButtonStates(hasPuzzle) {
    if (hasPuzzle) {
      this.setButtonsEnabled(true);
    } else {
      this.setButtonsEnabled(false);
    }
  }
}


// ============================================================================
// GridRenderer.js
// ============================================================================

class GridRenderer {

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

  createTableHTML(grid, cellClass = "") {
    return GridUtils.createTableHTML(grid, cellClass);
  }

  createTableForPDF(grid, cellClass = "", isSolution = false) {
    return GridUtils.createTableForPDF(grid, cellClass, isSolution);
  }

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

  getTableDimensions(table) {
    if (!table) return { rows: 0, cols: 0 };

    return {
      rows: table.rows.length,
      cols: table.rows[0] ? table.rows[0].cells.length : 0,
    };
  }

  getCellElement(table, row, col) {
    if (!table || !table.rows[row]) return null;
    return table.rows[row].cells[col] || null;
  }

  setCellContent(table, row, col, content) {
    const cell = this.getCellElement(table, row, col);
    if (cell) {
      cell.innerHTML = content || "&nbsp;";
    }
  }

  addCellClass(table, row, col, className) {
    const cell = this.getCellElement(table, row, col);
    if (cell) {
      cell.classList.add(className);
    }
  }

  removeCellClass(table, row, col, className) {
    const cell = this.getCellElement(table, row, col);
    if (cell) {
      cell.classList.remove(className);
    }
  }

  setCellStyle(table, row, col, styleProperty, value) {
    const cell = this.getCellElement(table, row, col);
    if (cell) {
      cell.style[styleProperty] = value;
    }
  }
}


// ============================================================================
// CapsuleRenderer.js
// ============================================================================

class CapsuleRenderer {

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

    // Process ALL words (horizontal, vertical, and diagonal)
    console.log(`Processing ${placedWordInfos.length} words for capsules`);

    for (const info of placedWordInfos) {
      const { startRow, startCol, dRow, dCol, length } = info;
      const endRow = startRow + (length - 1) * dRow;
      const endCol = startCol + (length - 1) * dCol;

      // Calculate positions in the SVG coordinate system
      const startX = startCol * actualCellWidth + actualCellWidth / 2;
      const startY = startRow * actualCellHeight + actualCellHeight / 2;
      const endX = endCol * actualCellWidth + actualCellWidth / 2;
      const endY = endRow * actualCellHeight + actualCellHeight / 2;

      // Determine word type for debugging
      const isHorizontal = dRow === 0 && dCol !== 0;
      const isVertical = dCol === 0 && dRow !== 0;
      const isDiagonal = Math.abs(dRow) === 1 && Math.abs(dCol) === 1;
      const wordType = isHorizontal ? "HORIZONTAL" : isVertical ? "VERTICAL" : isDiagonal ? "DIAGONAL" : "OTHER";

      console.log(`Word "${info.word}" (${wordType}): start(${startCol},${startRow}) end(${endCol},${endRow})`);
      console.log(`  SVG coordinates: start(${startX},${startY}) end(${endX},${endY})`);

      // Capsule parameters
      const extension = actualCellHeight * 0.4;
      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const capsuleLength = dist + extension * 2;
      const capsuleWidth = actualCellHeight * 0.7;
      const radius = capsuleWidth / 2;

      console.log(`  Capsule: length=${capsuleLength}, width=${capsuleWidth}, angle=${angle}°`);

      // Create proper capsule shape using SVG path
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

      // Calculate capsule path
      const halfLength = capsuleLength / 2;
      const centerX = (startX + endX) / 2;
      const centerY = (startY + endY) / 2;

      // Create capsule path: rectangle with rounded ends
      const pathData = [
        // Start at left side of capsule
        `M ${centerX - halfLength + radius} ${centerY - radius}`,
        // Top line
        `L ${centerX + halfLength - radius} ${centerY - radius}`,
        // Top right arc
        `A ${radius} ${radius} 0 0 1 ${centerX + halfLength - radius} ${centerY + radius}`,
        // Bottom line
        `L ${centerX - halfLength + radius} ${centerY + radius}`,
        // Bottom left arc
        `A ${radius} ${radius} 0 0 1 ${centerX - halfLength + radius} ${centerY - radius}`,
        // Close path
        "Z",
      ].join(" ");

      path.setAttribute("d", pathData);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#000");
      path.setAttribute("stroke-width", actualCellHeight * 0.15);
      path.setAttribute("opacity", "0.85");
      path.setAttribute("transform", `rotate(${angle} ${centerX} ${centerY})`);
      svg.appendChild(path);

      // Debug word type
      console.log(`  Added capsule for "${info.word}" (${wordType})`);
    }

    table.style.position = "relative";
    table.appendChild(svg);

    console.log("Added unified SVG with viewBox for ALL capsules");
  }

  renderDiagonalCapsules(container, table, diagonalCapsules) {
    if (!container || !table || !diagonalCapsules) return;

    const rect = table.getBoundingClientRect();
    const actualCellWidth = rect.width / table.rows[0].cells.length;
    const actualCellHeight = rect.height / table.rows.length;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", rect.width);
    svg.setAttribute("height", rect.height);
    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.pointerEvents = "none";
    svg.classList.add("diagonal-capsule-overlay");
    svg.style.zIndex = 10;

    for (const info of diagonalCapsules) {
      const { startRow, startCol, dRow, dCol, length } = info;
      const endRow = startRow + (length - 1) * dRow;
      const endCol = startCol + (length - 1) * dCol;

      const startX = startCol * actualCellWidth + actualCellWidth / 2;
      const startY = startRow * actualCellHeight + actualCellHeight / 2;
      const endX = endCol * actualCellWidth + actualCellWidth / 2;
      const endY = endRow * actualCellHeight + actualCellHeight / 2;

      const extension = actualCellHeight * 0.4;
      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const capsuleLength = dist + extension * 2;
      const capsuleWidth = actualCellHeight * 0.7;
      const radius = capsuleWidth / 2;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

      const halfLength = capsuleLength / 2;
      const centerX = (startX + endX) / 2;
      const centerY = (startY + endY) / 2;

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

  clearCapsules(table) {
    if (!table) return;

    const overlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
    overlays.forEach((overlay) => overlay.remove());
  }

  getCapsuleDimensions(startX, startY, endX, endY, cellHeight) {
    const extension = cellHeight * 0.4;
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const capsuleLength = dist + extension * 2;
    const capsuleWidth = cellHeight * 0.7;
    const radius = capsuleWidth / 2;

    return {
      length: capsuleLength,
      width: capsuleWidth,
      radius: radius,
      angle: angle,
      centerX: (startX + endX) / 2,
      centerY: (startY + endY) / 2,
    };
  }

  createCapsulePath(centerX, centerY, halfLength, radius) {
    return [`M ${centerX - halfLength + radius} ${centerY - radius}`, `L ${centerX + halfLength - radius} ${centerY - radius}`, `A ${radius} ${radius} 0 0 1 ${centerX + halfLength - radius} ${centerY + radius}`, `L ${centerX - halfLength + radius} ${centerY + radius}`, `A ${radius} ${radius} 0 0 1 ${centerX - halfLength + radius} ${centerY - radius}`, "Z"].join(" ");
  }
}


// ============================================================================
// RenderingManager.js
// ============================================================================

class RenderingManager {
  constructor() {
    this.gridRenderer = new GridRenderer();
    this.capsuleRenderer = new CapsuleRenderer();
  }

  initialize() {
    // Initialize renderers
  }

  renderPuzzleGrid(grid, showGridLines) {
    const container = document.getElementById("puzzleGrid");
    if (container) {
      this.gridRenderer.renderGrid(container, grid, "", false, showGridLines);
    }
  }

  renderSolutionGrid(solution, words, placedWordInfos, options) {
    const container = document.getElementById("solutionGrid");
    if (container) {
      this.gridRenderer.renderGrid(container, solution, "", true, true);

      // Apply solution display options
      this.applySolutionDisplayOptions(container, solution, words, placedWordInfos, options);
    }
  }

  updateSolutionDisplay(solution, placedWordInfos, options) {
    const container = document.getElementById("solutionGrid");
    if (container) {
      this.applySolutionDisplayOptions(container, solution, [], placedWordInfos, options);
    }
  }

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

  clearOverlays(table) {
    const overlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
    overlays.forEach((overlay) => overlay.remove());
  }

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

  forceRenderCapsules(placedWordInfos) {
    const container = document.getElementById("solutionGrid");
    const table = container?.querySelector("table");

    if (container && table) {
      this.clearOverlays(table);
      this.capsuleRenderer.renderAllCapsulesWithViewBox(container, table, placedWordInfos);
    }
  }
}


// ============================================================================
// PDFExporter.js
// ============================================================================

class PDFExporter {

  downloadPDF(puzzle, solution, placedWordInfos, preferences) {
    console.log("Download button clicked");

    // This is a placeholder for PDF generation
    // In a real implementation, you would use a library like jsPDF
    // For now, we'll just show a message

    alert("PDF download functionality would be implemented here. This would use a library like jsPDF to generate a PDF with the puzzle and solution.");

    // Example of what the PDF generation might look like:
    /*
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(preferences.puzzleName, 20, 20);
    
    // Add puzzle grid
    this.drawGrid(doc, puzzle, 20, 40, 8, false, false);
    
    // Add word list
    this.addWordList(doc, 20, 200, 170);
    
    // Add solution on new page
    doc.addPage();
    doc.setFontSize(20);
    doc.text("Solution", 20, 20);
    this.drawGrid(doc, solution, 20, 40, 8, true, preferences.hideOtherLetters);
    
    // Save the PDF
    doc.save(`${preferences.puzzleName}.pdf`);
    */
  }

  drawGrid(doc, grid, startX, startY, cellSize, isSolution = false, hideOther = false) {
    // This would contain the PDF grid drawing logic
    // For now, it's a placeholder
  }

  addWordList(doc, margin, y, contentWidth) {
    // This would contain the word list drawing logic
    // For now, it's a placeholder
  }

  calculateWordListHeight(contentWidth) {
    return GridUtils.calculateWordListHeight(contentWidth);
  }
}


// ============================================================================
// ExportManager.js
// ============================================================================

class ExportManager {
  constructor() {
    this.pdfExporter = new PDFExporter();
  }

  initialize() {
    // Initialize export functionality
  }

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

  downloadPDF(puzzle, solution, placedWordInfos, preferences) {
    this.pdfExporter.downloadPDF(puzzle, solution, placedWordInfos, preferences);
  }

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


// ============================================================================
// DebugManager.js
// ============================================================================

class DebugManager {
  constructor() {
    this.debugInfo = {};
  }

  initialize() {
    this.exposeDebugMethods();
  }

  exposeDebugMethods() {
    // Make debug methods available globally for console access
    window.debugPrintCapsules = () => this.debugPrintCapsules();
    window.testAllCapsules = () => this.testAllCapsules();
    window.testPrintCapsules = () => this.testPrintCapsules();
    window.debugPositioning = () => this.debugPositioning();
    window.forceRenderCapsules = () => this.forceRenderCapsules();
  }

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

  forceRenderCapsules() {
    if (!window.generator) {
      console.error("Generator not available");
      return;
    }

    console.log("Force rendering capsules...");
    window.generator.renderingManager.forceRenderCapsules(window.generator.placedWordInfos);
    console.log("Capsules force rendered!");
  }

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

  setDebugInfo(key, value) {
    this.debugInfo[key] = value;
  }
}


// ============================================================================
// WordSearchGenerator.js
// ============================================================================

class WordSearchGenerator {
  constructor() {
    // Initialize core components
    this.inputManager = new InputManager();
    this.puzzleEngine = new PuzzleEngine();
    this.uiManager = new UIManager();
    this.renderingManager = new RenderingManager();
    this.exportManager = new ExportManager();
    this.debugManager = new DebugManager();

    // State
    this.currentPuzzle = null;
    this.currentSolution = null;
    this.placedWordInfos = [];

    // Initialize
    this.initialize();
  }

  initialize() {
    this.inputManager.initialize();
    this.uiManager.initialize();
    this.renderingManager.initialize();
    this.exportManager.initialize();
    this.debugManager.initialize();
    this.bindEvents();
    this.handlePrintMode();
  }

  bindEvents() {
    // Bind UI events
    this.uiManager.bindEvents({
      generate: () => this.generatePuzzle(),
      toggleSolution: () => this.toggleSolution(),
      print: () => this.printPuzzle(),
      download: () => this.downloadPDF(),
      outlineWords: () => this.updateSolutionDisplay(),
      colorWords: () => this.updateSolutionDisplay(),
      hideOtherLetters: () => this.updateSolutionDisplay(),
      gridBorder: () => this.updateGridBorders(),
    });
  }

  generatePuzzle() {
    try {
      this.uiManager.hideError();
      this.uiManager.showLoading();

      // Get input values
      const words = this.inputManager.getWordList();
      const size = parseInt(this.inputManager.getPuzzleSize());
      const directions = this.inputManager.getSelectedDirections();

      // Validate input
      if (!this.inputManager.validateInput(words, size, directions)) {
        return;
      }

      // Set hideOtherSolutionLetters default based on grid lines
      this.inputManager.setHideOtherLettersDefault();

      // Generate puzzle
      const result = this.puzzleEngine.createPuzzle(words, size, directions);

      if (result.success) {
        this.currentPuzzle = result.puzzle;
        this.currentSolution = result.solution;
        this.placedWordInfos = result.placedWordInfos;

        // Display the puzzle
        this.displayPuzzle(result.puzzle, result.solution, words);
        this.uiManager.showOutput();
      } else {
        this.uiManager.showError(result.error || "Failed to generate puzzle");
      }
    } catch (error) {
      console.error("Error generating puzzle:", error);
      this.uiManager.showError("An unexpected error occurred while generating the puzzle");
    } finally {
      this.uiManager.hideLoading();
    }
  }

  displayPuzzle(puzzle, solution, words) {
    // Update word list display
    this.uiManager.updateWordListDisplay(words);

    // Render puzzle grid
    this.renderingManager.renderPuzzleGrid(puzzle, this.inputManager.getGridLinesPreference());

    // Render solution grid
    this.renderingManager.renderSolutionGrid(solution, words, this.placedWordInfos, this.inputManager.getSolutionDisplayOptions());

    // Update grid borders
    this.updateGridBorders();
  }

  toggleSolution() {
    this.uiManager.toggleSolutionVisibility();
    this.updateSolutionDisplay();
  }

  updateSolutionDisplay() {
    if (this.currentSolution) {
      this.renderingManager.updateSolutionDisplay(this.currentSolution, this.placedWordInfos, this.inputManager.getSolutionDisplayOptions());
    }
  }

  updateGridBorders() {
    this.renderingManager.updateGridBorders(this.inputManager.getGridBorderPreference());
  }

  printPuzzle() {
    this.exportManager.printPuzzle(this.currentPuzzle, this.currentSolution, this.placedWordInfos, this.inputManager.getOutlineWordsPreference());
  }

  downloadPDF() {
    this.exportManager.downloadPDF(this.currentPuzzle, this.currentSolution, this.placedWordInfos, this.inputManager.getAllPreferences());
  }

  handlePrintMode() {
    this.exportManager.handlePrintMode(this.inputManager.getOutlineWordsPreference(), () => this.renderingManager.renderAllCapsulesForPrint(this.placedWordInfos));
  }

  // Debug methods
  getDebugInfo() {
    return {
      currentPuzzle: this.currentPuzzle,
      currentSolution: this.currentSolution,
      placedWordInfos: this.placedWordInfos,
      inputPreferences: this.inputManager.getAllPreferences(),
    };
  }
}


// ============================================================================
// main.js
// ============================================================================

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

