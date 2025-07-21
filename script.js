/**
 * Word Search Puzzle Generator
 * A complete browser-based word search puzzle generator
 */

class WordSearchGenerator {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.currentPuzzle = null;
    this.currentSolution = null;
    this.placedWordInfos = [];
  }

  initializeElements() {
    // Input elements
    this.puzzleNameInput = document.getElementById("puzzleName");
    this.wordListInput = document.getElementById("wordList");
    this.puzzleSizeSelect = document.getElementById("puzzleSize");
    this.horizontalCheckbox = document.getElementById("horizontal");
    this.verticalCheckbox = document.getElementById("vertical");
    this.diagonalCheckbox = document.getElementById("diagonal");
    this.reverseCheckbox = document.getElementById("reverse");
    this.showGridLinesCheckbox = document.getElementById("showGridLines");
    this.showGridBorderCheckbox = document.getElementById("showGridBorder");
    this.generateBtn = document.getElementById("generateBtn");
    this.outlineFoundWordsCheckbox = document.getElementById("outlineFoundWords");
    this.colorFoundWordsCheckbox = document.getElementById("colorFoundWords");
    this.hideOtherSolutionLettersCheckbox = document.getElementById("hideOtherSolutionLetters");

    // Output elements
    this.outputSection = document.getElementById("outputSection");
    this.wordListDisplay = document.getElementById("wordListDisplay");
    this.puzzleGrid = document.getElementById("puzzleGrid");
    this.solutionGrid = document.getElementById("solutionGrid");
    this.toggleSolutionBtn = document.getElementById("toggleSolution");
    this.printBtn = document.getElementById("printBtn");
    this.downloadBtn = document.getElementById("downloadBtn");
    this.errorMessage = document.getElementById("errorMessage");
  }

  bindEvents() {
    this.generateBtn.addEventListener("click", () => this.generatePuzzle());
    this.toggleSolutionBtn.addEventListener("click", () => this.toggleSolution());
    this.printBtn.addEventListener("click", () => this.printPuzzle());

    // Add debugging for download button
    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", () => {
        console.log("Download button clicked");
        this.downloadPDF();
      });
    } else {
      console.error("Download button not found");
    }
    if (this.outlineFoundWordsCheckbox) {
      this.outlineFoundWordsCheckbox.addEventListener("change", () => this.updateSolutionDisplay());
    }
    if (this.colorFoundWordsCheckbox) {
      this.colorFoundWordsCheckbox.addEventListener("change", () => this.updateSolutionDisplay());
    }
    if (this.hideOtherSolutionLettersCheckbox) {
      this.hideOtherSolutionLettersCheckbox.addEventListener("change", () => this.updateSolutionDisplay());
    }
    if (this.showGridBorderCheckbox) {
      this.showGridBorderCheckbox.addEventListener("change", () => this.updateGridBorders());
    }
  }

  /**
   * Main puzzle generation function
   */
  generatePuzzle() {
    try {
      this.hideError();
      this.showLoading();

      // Get input values
      const words = this.getWordList();
      const size = parseInt(this.puzzleSizeSelect.value);
      const directions = this.getSelectedDirections();

      // Validate input
      if (!this.validateInput(words, size, directions)) {
        return;
      }

      // Set hideOtherSolutionLetters default based on grid lines
      if (this.hideOtherSolutionLettersCheckbox) {
        if (this.getGridLinesPreference()) {
          this.hideOtherSolutionLettersCheckbox.checked = true;
        } else {
          this.hideOtherSolutionLettersCheckbox.checked = false;
        }
      }

      // Generate puzzle
      const result = this.createPuzzle(words, size, directions);

      if (result.success) {
        this.currentPuzzle = result.puzzle;
        this.currentSolution = result.solution;
        this.displayPuzzle(result.puzzle, result.solution, words);
        this.showOutput();
      } else {
        this.showError(result.error);
      }
    } catch (error) {
      this.showError("An unexpected error occurred. Please try again.");
      console.error("Puzzle generation error:", error);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Get and clean word list from textarea
   */
  getWordList() {
    const input = this.wordListInput.value.trim();
    if (!input) return [];

    return input
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
      .map((word) => word.replace(/[^A-Za-z]/g, "").toUpperCase()) // Remove non-letters and convert to uppercase
      .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
  }

  /**
   * Get puzzle name (defaults to "Word Search Puzzle" if empty)
   */
  getPuzzleName() {
    const name = this.puzzleNameInput.value.trim();
    return name || "Word Search Puzzle";
  }

  /**
   * Get selected direction options
   */
  getSelectedDirections() {
    return {
      horizontal: this.horizontalCheckbox.checked,
      vertical: this.verticalCheckbox.checked,
      diagonal: this.diagonalCheckbox.checked,
      reverse: this.reverseCheckbox.checked,
    };
  }

  /**
   * Get grid lines preference
   */
  getGridLinesPreference() {
    return this.showGridLinesCheckbox.checked;
  }

  /**
   * Get grid border preference
   */
  getGridBorderPreference() {
    return this.showGridBorderCheckbox && this.showGridBorderCheckbox.checked;
  }

  /**
   * Validate user input
   */
  validateInput(words, size, directions) {
    if (words.length === 0) {
      this.showError("Please enter at least one word.");
      return false;
    }

    if (words.length > size) {
      this.showError(`Too many words for a ${size}x${size} puzzle. Please reduce the number of words or increase the puzzle size.`);
      return false;
    }

    const maxWordLength = Math.max(...words.map((word) => word.length));
    if (maxWordLength > size) {
      this.showError(`Word "${words.find((word) => word.length === maxWordLength)}" is too long for a ${size}x${size} puzzle.`);
      return false;
    }

    if (!directions.horizontal && !directions.vertical && !directions.diagonal) {
      this.showError("Please select at least one direction for word placement.");
      return false;
    }

    return true;
  }

  /**
   * Create the word search puzzle with improved algorithm
   */
  createPuzzle(words, size, directions) {
    const attemptsPerWord = 1000;

    // Try multiple full generations, keep the best
    let bestGrid = null;
    let bestSolution = null;
    let bestPlaced = [];
    let bestFailed = words;
    let bestScore = -1;
    let bestWordInfos = [];

    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        const result = this.createWordSearch(words, size, directions, attemptsPerWord);

        if (result.placedWords.length > bestScore) {
          bestScore = result.placedWords.length;
          bestGrid = result.grid;
          bestSolution = result.solution;
          bestPlaced = result.placedWords;
          bestFailed = result.failedWords;
          bestWordInfos = result.placedWordInfos;
        }

        if (result.failedWords.length === 0) {
          break; // Perfect placement found
        }
      } catch (error) {
        console.warn("Attempt failed, retrying...", error);
      }
    }

    if (bestGrid) {
      this.placedWordInfos = bestWordInfos;
      return {
        success: true,
        puzzle: bestGrid,
        solution: bestSolution,
        placedWords: bestPlaced,
        failedWords: bestFailed,
        placedWordInfos: bestWordInfos,
      };
    }

    return {
      success: false,
      error: "Unable to place any words. Try reducing the number of words, increasing the puzzle size, or adding more direction options.",
    };
  }

  /**
   * Create word search with smart placement algorithm
   */
  createWordSearch(words, size, directions, attemptsPerWord) {
    const grid = this.createEmptyGrid(size);
    const solution = this.createEmptyGrid(size);

    const directionVectors = this.getDirectionVectors(directions);

    const placedWords = [];
    const failedWords = [];
    const placedWordInfos = [];

    // Sort words by length (longest first) for better placement
    const wordsByLength = [...words].sort((a, b) => b.length - a.length);

    for (const word of wordsByLength) {
      let placed = false;
      let placementInfo = null;

      for (let attempt = 0; attempt < attemptsPerWord; attempt++) {
        const info = this.placeWordSmart(grid, solution, word, directionVectors);
        if (info) {
          placedWords.push(word);
          placed = true;
          placementInfo = info;
          break;
        }
      }

      if (placed && placementInfo) {
        placedWordInfos.push(placementInfo);
      } else if (!placed) {
        failedWords.push(word);
      }
    }

    // Fill remaining cells with random letters
    this.fillRemainingCells(grid);

    return {
      grid: grid,
      solution: solution,
      placedWords: placedWords,
      failedWords: failedWords,
      placedWordInfos: placedWordInfos,
    };
  }

  /**
   * Smart word placement with overlap optimization
   */
  placeWordSmart(grid, solution, word, directionVectors) {
    const size = grid.length;
    let best = [];
    let bestScore = -1;

    // Calculate current grid density
    const filledCells = this.countFilledCells(grid);
    const totalCells = size * size;
    const density = filledCells / totalCells;

    // Shuffle directions for more randomness
    const shuffledDirections = [...directionVectors];
    this.shuffleArray(shuffledDirections);

    // Generate all grid positions and shuffle
    const positions = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        positions.push([row, col]);
      }
    }
    this.shuffleArray(positions);

    for (const [dRow, dCol] of shuffledDirections) {
      for (const [row, col] of positions) {
        if (this.canPlaceWord(grid, word, row, col, [dRow, dCol])) {
          const overlap = this.countOverlap(grid, word, row, col, [dRow, dCol]);
          const spacing = this.calculateSpacingScore(grid, word, row, col, [dRow, dCol]);

          // Score based on density: prefer overlap when dense, spacing when sparse
          let score;
          if (density < 0.3) {
            // Low density: prefer spacing over overlap
            score = spacing * 2 + overlap;
          } else if (density < 0.6) {
            // Medium density: balance spacing and overlap
            score = spacing + overlap * 1.5;
          } else {
            // High density: prefer overlap to fit words
            score = overlap * 2 + spacing * 0.5;
          }

          if (score > bestScore) {
            best = [[row, col, dRow, dCol]];
            bestScore = score;
          } else if (score === bestScore) {
            best.push([row, col, dRow, dCol]);
          }
        }
      }
    }

    if (best.length > 0) {
      const [row, col, dRow, dCol] = best[Math.floor(Math.random() * best.length)];
      this.placeWordAt(grid, solution, word, row, col, [dRow, dCol]);
      return {
        word,
        startRow: row,
        startCol: col,
        dRow,
        dCol,
        length: word.length,
      };
    }

    return null;
  }

  /**
   * Count overlap between word and existing letters
   */
  countOverlap(grid, word, startRow, startCol, direction) {
    const [dRow, dCol] = direction;
    let overlap = 0;

    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;

      if (grid[row][col] === word[i]) {
        overlap++;
      }
    }

    return overlap;
  }

  /**
   * Count filled cells in the grid
   */
  countFilledCells(grid) {
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
   * Calculate spacing score - prefer positions that don't crowd existing words
   */
  calculateSpacingScore(grid, word, startRow, startCol, direction) {
    const [dRow, dCol] = direction;
    const size = grid.length;
    let score = 0;

    // Check each cell the word would occupy
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;

      // Check surrounding cells for existing letters
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const checkRow = row + dr;
          const checkCol = col + dc;

          // Skip if out of bounds or the current word position
          if (checkRow < 0 || checkRow >= size || checkCol < 0 || checkCol >= size) {
            continue;
          }

          // If there's a letter nearby (but not part of the word), reduce score
          if (grid[checkRow][checkCol] !== "" && (checkRow !== row || checkCol !== col)) {
            score -= 1;
          }
        }
      }
    }

    return score;
  }

  /**
   * Shuffle array in place
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Create an empty grid of specified size
   */
  createEmptyGrid(size) {
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
   * Get direction vectors based on selected options
   */
  getDirectionVectors(directions) {
    const vectors = [];

    if (directions.horizontal) {
      vectors.push([0, 1]); // Right (left to right)
      if (directions.reverse) vectors.push([0, -1]); // Left (right to left)
    }

    if (directions.vertical) {
      vectors.push([1, 0]); // Down (top to bottom)
      if (directions.reverse) vectors.push([-1, 0]); // Up (bottom to top)
    }

    if (directions.diagonal) {
      // Only forward diagonal directions (top to bottom, left to right)
      vectors.push([1, 1]); // Down-right (top-left to bottom-right)
      vectors.push([1, -1]); // Down-left (top-right to bottom-left)
      if (directions.reverse) {
        // Add backward diagonal directions only when reverse is selected
        vectors.push([-1, 1]); // Up-right (bottom-left to top-right)
        vectors.push([-1, -1]); // Up-left (bottom-right to top-left)
      }
    }

    return vectors;
  }

  /**
   * Check if a word can be placed at a specific position and direction
   */
  canPlaceWord(grid, word, startRow, startCol, direction) {
    const size = grid.length;
    const [dRow, dCol] = direction;

    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;

      // Check bounds
      if (row < 0 || row >= size || col < 0 || col >= size) {
        return false;
      }

      // Check if cell is empty or contains the same letter
      if (grid[row][col] !== "" && grid[row][col] !== word[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Place a word on the grid and mark it in the solution
   */
  placeWordAt(grid, solution, word, startRow, startCol, direction) {
    const [dRow, dCol] = direction;

    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;

      grid[row][col] = word[i];
      solution[row][col] = word[i];
    }
  }

  /**
   * Fill remaining empty cells with random letters
   */
  fillRemainingCells(grid) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const size = grid.length;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (grid[i][j] === "") {
          grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  }

  /**
   * Display the puzzle and solution
   */
  displayPuzzle(puzzle, solution, words) {
    // Display word list
    this.wordListDisplay.innerHTML = words.join(", ");

    // Display puzzle grid
    this.renderGrid(this.puzzleGrid, puzzle, "puzzle-cell");

    // Determine which grid to use for the solution display
    let useSolutionGrid = this.hideOtherSolutionLettersCheckbox && this.hideOtherSolutionLettersCheckbox.checked;
    let solutionDisplayGrid = useSolutionGrid ? solution : puzzle;
    this.renderGrid(this.solutionGrid, solutionDisplayGrid, "solution-cell", true);

    // Always hide the solution grid and reset toggle button after generating a puzzle
    this.solutionGrid.classList.add("hidden");
    if (this.toggleSolutionBtn) {
      this.toggleSolutionBtn.textContent = "Show Solution";
    }

    // Apply border preferences
    this.updateGridBorders();
  }

  /**
   * Render SVG capsule overlays for found words in the solution grid
   */
  renderCapsuleOverlay() {
    // Remove any existing overlay
    const oldOverlay = this.solutionGrid.querySelector(".capsule-overlay");
    if (oldOverlay) oldOverlay.remove();

    const table = this.solutionGrid.querySelector("table");
    if (!table) return;

    const cell = table.querySelector("td");
    if (!cell) return;

    // Get cell size, with fallback to CSS computed style
    let cellSize = cell.offsetWidth;
    if (cellSize === 0) {
      const computedStyle = window.getComputedStyle(cell);
      cellSize = parseInt(computedStyle.width) || 30; // fallback to 30px
    }

    // Get container padding (assume uniform padding)
    const containerStyle = window.getComputedStyle(this.solutionGrid);
    const padLeft = parseInt(containerStyle.paddingLeft) || 0;
    const padTop = parseInt(containerStyle.paddingTop) || 0;

    // Calculate the maximum extension needed for capsules
    const extension = cellSize * 0.4; // reduced from 0.7 to 0.4 - less extension past each end
    const capsuleWidth = cellSize * 0.7;
    const maxExtension = Math.max(extension, capsuleWidth / 2);

    // Add padding to SVG dimensions to accommodate capsule extensions
    const svgPadding = maxExtension + 10; // extra 10px buffer
    const svgWidth = table.offsetWidth + svgPadding * 2;
    const svgHeight = table.offsetHeight + svgPadding * 2;

    // Create SVG overlay with padding
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);
    svg.style.position = "absolute";
    svg.style.left = padLeft - svgPadding + "px";
    svg.style.top = padTop - svgPadding + "px";
    svg.style.pointerEvents = "none";
    svg.classList.add("capsule-overlay");
    svg.style.zIndex = 10;

    // Draw a capsule for each word
    for (const info of this.placedWordInfos) {
      const { startRow, startCol, dRow, dCol, length } = info;
      const endRow = startRow + (length - 1) * dRow;
      const endCol = startCol + (length - 1) * dCol;

      // Calculate center of start and end cells, offset by SVG padding
      const startX = startCol * cellSize + cellSize / 2 + svgPadding;
      const startY = startRow * cellSize + cellSize / 2 + svgPadding;
      const endX = endCol * cellSize + cellSize / 2 + svgPadding;
      const endY = endRow * cellSize + cellSize / 2 + svgPadding;

      // Capsule parameters
      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const capsuleLength = dist + extension * 2;
      const capsuleWidth = cellSize * 0.7;

      // Capsule center
      const cx = (startX + endX) / 2;
      const cy = (startY + endY) / 2;

      // Draw rounded rectangle (capsule)
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", cx - capsuleLength / 2);
      rect.setAttribute("y", cy - capsuleWidth / 2);
      rect.setAttribute("width", capsuleLength);
      rect.setAttribute("height", capsuleWidth);
      rect.setAttribute("rx", capsuleWidth / 2);
      rect.setAttribute("ry", capsuleWidth / 2);
      rect.setAttribute("fill", "none");
      rect.setAttribute("stroke", "#000"); // black outline
      rect.setAttribute("stroke-width", cellSize * 0.15);
      rect.setAttribute("opacity", "0.85");
      rect.setAttribute("transform", `rotate(${angle} ${cx} ${cy})`);
      svg.appendChild(rect);
    }

    // Position overlay absolutely over the table
    this.solutionGrid.style.position = "relative";
    svg.style.position = "absolute";
    svg.style.left = padLeft - svgPadding + "px";
    svg.style.top = padTop - svgPadding + "px";
    svg.style.zIndex = 10;
    svg.style.width = svgWidth + "px";
    svg.style.height = svgHeight + "px";
    this.solutionGrid.appendChild(svg);
  }

  /**
   * Render a grid as HTML
   * @param {HTMLElement} container
   * @param {string[][]} grid
   * @param {string} cellClass
   * @param {boolean} isSolution
   */
  renderGrid(container, grid, cellClass, isSolution = false) {
    container.innerHTML = "";

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";

    const showGridLines = this.getGridLinesPreference();
    const colorFoundWords = this.colorFoundWordsCheckbox && this.colorFoundWordsCheckbox.checked;
    // hideOther is no longer needed here

    // Build a set of all found word positions for fast lookup
    let foundPositions = new Set();
    if (isSolution && this.placedWordInfos) {
      for (const info of this.placedWordInfos) {
        const { startRow, startCol, dRow, dCol, length } = info;
        for (let i = 0; i < length; i++) {
          foundPositions.add(`${startRow + i * dRow},${startCol + i * dCol}`);
        }
      }
    }

    for (let i = 0; i < grid.length; i++) {
      const row = document.createElement("tr");

      for (let j = 0; j < grid[i].length; j++) {
        const cell = document.createElement("td");
        cell.className = cellClass;
        cell.dataset.row = i;
        cell.dataset.col = j;
        let isFound = foundPositions.has(`${i},${j}`);
        if (isSolution) {
          if (isFound) {
            if (colorFoundWords) {
              cell.classList.add("found-pink");
            } else {
              cell.classList.remove("found-pink");
            }
          } else {
            cell.classList.remove("found-pink");
          }
        }
        cell.textContent = grid[i][j];

        // Apply grid lines based on user preference
        if (showGridLines) {
          cell.style.border = "1px solid #ccc";
        } else {
          cell.style.border = "none";
        }

        row.appendChild(cell);
      }

      table.appendChild(row);
    }

    container.appendChild(table);
  }

  /**
   * Toggle solution visibility
   */
  toggleSolution() {
    const solutionGrid = this.solutionGrid;
    const toggleBtn = this.toggleSolutionBtn;

    if (solutionGrid.classList.contains("hidden")) {
      solutionGrid.classList.remove("hidden");
      toggleBtn.textContent = "Hide Solution";
      // Render overlay after a short delay to ensure grid is fully rendered
      if (this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked) {
        // Use a longer delay to ensure the grid is fully rendered and sized
        setTimeout(() => this.renderCapsuleOverlay(), 200);
      }
    } else {
      solutionGrid.classList.add("hidden");
      toggleBtn.textContent = "Show Solution";
    }
  }

  /**
   * Print the puzzle
   */
  printPuzzle() {
    // Ensure we have content to print
    if (!this.currentPuzzle || !this.currentSolution) {
      this.showError("No puzzle generated yet. Please generate a puzzle first.");
      return;
    }

    // Ensure solution is visible and capsule overlay is rendered for print
    if (this.solutionGrid.classList.contains("hidden")) {
      // Temporarily show solution and render capsule overlay
      this.solutionGrid.classList.remove("hidden");
      if (this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked) {
        setTimeout(() => {
          this.renderCapsuleOverlay();
          // Wait for overlay to render before printing
          setTimeout(() => window.print(), 200);
        }, 100);
        return; // Exit early, print will be called after overlay renders
      }
    } else if (this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked) {
      // Solution is already visible, just ensure capsule overlay is rendered
      setTimeout(() => {
        this.renderCapsuleOverlay();
        // Wait for overlay to render before printing
        setTimeout(() => window.print(), 200);
      }, 100);
      return; // Exit early, print will be called after overlay renders
    }

    // Trigger the browser's print dialog on the current page
    // The CSS @media print rules will handle the formatting
    window.print();
  }

  /**
   * Download puzzle as PDF using jsPDF
   */
  downloadPDF() {
    console.log("downloadPDF method called");

    // Ensure we have content to generate
    if (!this.currentPuzzle || !this.currentSolution) {
      console.log("No puzzle data available");
      this.showError("No puzzle generated yet. Please generate a puzzle first.");
      return;
    }

    console.log("Puzzle data available, starting PDF generation");

    try {
      // Check if jsPDF is available
      if (typeof window.jspdf === "undefined") {
        console.error("jsPDF library not found");
        this.showError("PDF library not loaded. Please refresh the page and try again.");
        return;
      }

      // Create new jsPDF document (8.5x11 inches)
      const { jsPDF } = window.jspdf;
      console.log("jsPDF library loaded successfully");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",
      });

      // Set margins (1 inch on all sides)
      const margin = 1;
      const pageWidth = 8.5;
      const pageHeight = 11;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      // Calculate grid size and cell size
      const gridSize = this.currentPuzzle.length;
      const cellSize = Math.min(contentWidth / gridSize, 0.3); // Max 0.3 inches per cell
      const gridWidth = gridSize * cellSize;
      const gridHeight = gridSize * cellSize;
      const gridX = margin + (contentWidth - gridWidth) / 2;

      // Calculate content heights
      const titleHeight = 0.4;
      const wordListHeight = this.calculateWordListHeight(contentWidth);
      const puzzleLabelHeight = 0.3;
      const solutionLabelHeight = 0.3;
      const spacing = 0.3;

      // Calculate total height needed
      const totalHeight = titleHeight + wordListHeight + spacing + puzzleLabelHeight + gridHeight + spacing + solutionLabelHeight + gridHeight;

      // Check if we need multiple pages
      if (totalHeight > contentHeight) {
        // First page: Title, word list, and puzzle
        let y = margin + 0.5;

        // Add title
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        const title = this.getPuzzleName();
        const titleWidth = doc.getTextWidth(title);
        const titleX = margin + (contentWidth - titleWidth) / 2;
        doc.text(title, titleX, y);
        y += titleHeight;

        // Add word list
        y = this.addWordList(doc, margin, y, contentWidth);

        // Add puzzle grid
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Puzzle:", margin, y);
        y += puzzleLabelHeight;

        // Draw puzzle grid
        this.drawGrid(doc, this.currentPuzzle, gridX, y, cellSize);

        // Add new page for solution
        doc.addPage();

        // Second page: Solution
        y = margin + 0.5;

        // Add solution grid
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Solution:", margin, y);
        y += solutionLabelHeight;

        // Draw solution grid with user's display preferences
        let useSolutionGrid = this.hideOtherSolutionLettersCheckbox && this.hideOtherSolutionLettersCheckbox.checked;
        let solutionDisplayGrid = useSolutionGrid ? this.currentSolution : this.currentPuzzle;
        this.drawGrid(doc, solutionDisplayGrid, gridX, y, cellSize, true, this.hideOtherSolutionLettersCheckbox && this.hideOtherSolutionLettersCheckbox.checked);
      } else {
        // Single page: Everything fits
        let y = margin + 0.5;

        // Add title
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        const title = this.getPuzzleName();
        const titleWidth = doc.getTextWidth(title);
        const titleX = margin + (contentWidth - titleWidth) / 2;
        doc.text(title, titleX, y);
        y += titleHeight;

        // Add word list
        y = this.addWordList(doc, margin, y, contentWidth);

        // Add puzzle grid
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Puzzle:", margin, y);
        y += puzzleLabelHeight;

        // Draw puzzle grid
        this.drawGrid(doc, this.currentPuzzle, gridX, y, cellSize);
        y += gridHeight + spacing;

        // Add solution grid
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Solution:", margin, y);
        y += solutionLabelHeight;

        // Draw solution grid with user's display preferences
        let useSolutionGrid = this.hideOtherSolutionLettersCheckbox && this.hideOtherSolutionLettersCheckbox.checked;
        let solutionDisplayGrid = useSolutionGrid ? this.currentSolution : this.currentPuzzle;
        this.drawGrid(doc, solutionDisplayGrid, gridX, y, cellSize, true, this.hideOtherSolutionLettersCheckbox && this.hideOtherSolutionLettersCheckbox.checked);
      }

      // Save the PDF
      console.log("Attempting to save PDF...");
      doc.save("word-search-puzzle.pdf");
      console.log("PDF saved successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      console.error("Error details:", error.message, error.stack);
      this.showError("PDF generation failed. Please try printing instead.");
    }
  }

  /**
   * Calculate the height needed for the word list
   */
  calculateWordListHeight(contentWidth) {
    const words = this.getWordList();
    const maxWordsPerLine = Math.floor(contentWidth / 0.6); // Approximate width per word
    const lines = Math.ceil(words.length / maxWordsPerLine);
    return 0.25 + lines * 0.2 + 0.3; // Label height + line heights + spacing
  }

  /**
   * Add word list to the PDF and return the new y position
   */
  addWordList(doc, margin, y, contentWidth) {
    const words = this.getWordList();

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Words to find:", margin, y);
    y += 0.25;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Split words into lines that fit the page width
    const maxWordsPerLine = Math.floor(contentWidth / 0.6); // Approximate width per word
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      const lineWords = words.slice(i, i + maxWordsPerLine);
      doc.text(lineWords.join(", "), margin, y);
      y += 0.2;
    }
    y += 0.3;

    return y;
  }

  /**
   * Draw a grid for the PDF
   */
  drawGrid(doc, grid, startX, startY, cellSize, isSolution = false, hideOther = false) {
    const gridSize = grid.length;
    const showGridLines = this.getGridLinesPreference();

    // Draw grid lines only if user wants them
    if (showGridLines) {
      doc.setDrawColor(0);
      doc.setLineWidth(0.01);

      // Vertical lines
      for (let i = 0; i <= gridSize; i++) {
        const x = startX + i * cellSize;
        doc.line(x, startY, x, startY + gridSize * cellSize);
      }

      // Horizontal lines
      for (let i = 0; i <= gridSize; i++) {
        const y = startY + i * cellSize;
        doc.line(startX, y, startX + gridSize * cellSize, y);
      }
    }

    // Build a set of all found word positions for fast lookup
    let foundPositions = new Set();
    if (isSolution && this.placedWordInfos) {
      for (const info of this.placedWordInfos) {
        const { startRow, startCol, dRow, dCol, length } = info;
        for (let i = 0; i < length; i++) {
          foundPositions.add(`${startRow + i * dRow},${startCol + i * dCol}`);
        }
      }
    }

    // Add letters
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");

    const colorFoundWords = this.colorFoundWordsCheckbox && this.colorFoundWordsCheckbox.checked;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = startX + col * cellSize + cellSize / 2;
        const y = startY + row * cellSize + cellSize / 2 + 0.05; // Small offset for centering
        let letter = grid[row][col];
        let isFound = foundPositions.has(`${row},${col}`);
        if (isSolution && hideOther && !isFound) {
          letter = "";
        }

        // Apply coloring for found words in solution
        if (isSolution && isFound && colorFoundWords) {
          doc.setTextColor(190, 24, 93); // Pink color (#be185d)
        } else {
          doc.setTextColor(0, 0, 0); // Black color
        }

        // Center the text in the cell
        const textWidth = doc.getTextWidth(letter);
        const textX = x - textWidth / 2;
        if (letter) {
          doc.text(letter, textX, y);
        }
      }
    }

    // Draw capsule outlines for found words in the solution grid (PDF)
    if (isSolution && this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked && this.placedWordInfos) {
      for (const info of this.placedWordInfos) {
        const { startRow, startCol, dRow, dCol, length } = info;
        const endRow = startRow + (length - 1) * dRow;
        const endCol = startCol + (length - 1) * dCol;

        // Calculate start and end points
        const startXc = startX + startCol * cellSize + cellSize / 2;
        const startYc = startY + startRow * cellSize + cellSize / 2;
        const endXc = startX + endCol * cellSize + cellSize / 2;
        const endYc = startY + endRow * cellSize + cellSize / 2;

        // Capsule parameters
        const dx = endXc - startXc;
        const dy = endYc - startYc;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const extension = cellSize * 0.4;
        const capsuleLength = dist + extension * 2;
        const capsuleWidth = cellSize * 0.7;
        const r = capsuleWidth / 2;

        // Capsule center
        const cx = (startXc + endXc) / 2;
        const cy = (startYc + endYc) / 2;

        // Calculate the unit direction vector
        const ux = Math.cos(angle);
        const uy = Math.sin(angle);
        // Perpendicular vector
        const px = -uy;
        const py = ux;

        // Endpoints of the capsule
        const x1 = cx - (capsuleLength / 2 - r) * ux;
        const y1 = cy - (capsuleLength / 2 - r) * uy;
        const x2 = cx + (capsuleLength / 2 - r) * ux;
        const y2 = cy + (capsuleLength / 2 - r) * uy;

        // Four points for the rectangle body
        const p1x = x1 + r * px;
        const p1y = y1 + r * py;
        const p2x = x2 + r * px;
        const p2y = y2 + r * py;
        const p3x = x2 - r * px;
        const p3y = y2 - r * py;
        const p4x = x1 - r * px;
        const p4y = y1 - r * py;

        doc.setDrawColor(0);
        doc.setLineWidth(cellSize * 0.15);
        doc.setLineCap("round");
        doc.setLineJoin("round");

        // Draw capsule using jsPDF's line and arc methods
        // Draw the straight line part
        doc.line(p1x, p1y, p2x, p2y);
        doc.line(p3x, p3y, p4x, p4y);

        // Draw the end caps using small line segments to approximate arcs
        // End cap at x2, y2
        const segments = 8; // number of line segments to approximate the arc
        for (let i = 0; i < segments; i++) {
          const angle1 = angle - Math.PI / 2 + (i * Math.PI) / segments;
          const angle2 = angle - Math.PI / 2 + ((i + 1) * Math.PI) / segments;
          const x1_arc = x2 + r * Math.cos(angle1);
          const y1_arc = y2 + r * Math.sin(angle1);
          const x2_arc = x2 + r * Math.cos(angle2);
          const y2_arc = y2 + r * Math.sin(angle2);
          doc.line(x1_arc, y1_arc, x2_arc, y2_arc);
        }

        // End cap at x1, y1
        for (let i = 0; i < segments; i++) {
          const angle1 = angle + Math.PI / 2 + (i * Math.PI) / segments;
          const angle2 = angle + Math.PI / 2 + ((i + 1) * Math.PI) / segments;
          const x1_arc = x1 + r * Math.cos(angle1);
          const y1_arc = y1 + r * Math.sin(angle1);
          const x2_arc = x1 + r * Math.cos(angle2);
          const y2_arc = y1 + r * Math.sin(angle2);
          doc.line(x1_arc, y1_arc, x2_arc, y2_arc);
        }
      }
    }
  }

  /**
   * Create HTML table string for PDF
   */
  createTableHTML(grid) {
    let tableHTML = "<table>";

    for (let i = 0; i < grid.length; i++) {
      tableHTML += "<tr>";
      for (let j = 0; j < grid[i].length; j++) {
        tableHTML += `<td>${grid[i][j]}</td>`;
      }
      tableHTML += "</tr>";
    }

    tableHTML += "</table>";
    return tableHTML;
  }

  /**
   * Create a table element for PDF export
   */
  createTableForPDF(grid, cellClass, isSolution = false) {
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.tableLayout = "fixed";
    table.style.margin = "0 auto";
    table.style.maxWidth = "100%";

    const showGridLines = this.getGridLinesPreference();
    const borderStyle = showGridLines ? "1px solid black" : "none";
    const colorFoundWords = this.colorFoundWordsCheckbox && this.colorFoundWordsCheckbox.checked;

    // Build a set of all found word positions for fast lookup
    let foundPositions = new Set();
    if (isSolution && this.placedWordInfos) {
      for (const info of this.placedWordInfos) {
        const { startRow, startCol, dRow, dCol, length } = info;
        for (let i = 0; i < length; i++) {
          foundPositions.add(`${startRow + i * dRow},${startCol + i * dCol}`);
        }
      }
    }

    for (let i = 0; i < grid.length; i++) {
      const row = document.createElement("tr");

      for (let j = 0; j < grid[i].length; j++) {
        const cell = document.createElement("td");
        cell.textContent = grid[i][j];
        cell.style.width = "20px";
        cell.style.height = "20px";
        cell.style.border = borderStyle;
        cell.style.textAlign = "center";
        cell.style.verticalAlign = "middle";
        cell.style.fontSize = "10px";
        cell.style.fontWeight = "bold";
        cell.style.backgroundColor = "white";
        cell.style.color = "black";
        cell.style.padding = "0";
        cell.className = cellClass;

        // Apply solution display options
        if (isSolution) {
          let isFound = foundPositions.has(`${i},${j}`);
          if (isFound && colorFoundWords) {
            cell.style.color = "#be185d"; // pink color for found words
            cell.style.fontWeight = "bold";
          }
        }

        row.appendChild(cell);
      }

      table.appendChild(row);
    }

    return table;
  }

  /**
   * Show/hide loading state
   */
  showLoading() {
    this.generateBtn.classList.add("loading");
    this.generateBtn.textContent = "Generating...";
    this.generateBtn.disabled = true;
  }

  hideLoading() {
    this.generateBtn.classList.remove("loading");
    this.generateBtn.textContent = "Generate Puzzle";
    this.generateBtn.disabled = false;
  }

  /**
   * Show/hide output section
   */
  showOutput() {
    this.outputSection.classList.remove("hidden");
    this.outputSection.scrollIntoView({ behavior: "smooth" });
  }

  /**
   * Show/hide error messages
   */
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove("hidden");
    this.errorMessage.scrollIntoView({ behavior: "smooth" });
  }

  hideError() {
    this.errorMessage.classList.add("hidden");
  }

  updateSolutionDisplay() {
    // Only update the contents, never touch the .hidden class
    if (this.currentSolution && this.currentPuzzle && this.wordListInput) {
      const words = this.getWordList();
      let useSolutionGrid = this.hideOtherSolutionLettersCheckbox && this.hideOtherSolutionLettersCheckbox.checked;
      let solutionDisplayGrid = useSolutionGrid ? this.currentSolution : this.currentPuzzle;
      this.renderGrid(this.solutionGrid, solutionDisplayGrid, "solution-cell", true);

      // Only render capsule overlay if solution is visible and outline option is checked
      if (!this.solutionGrid.classList.contains("hidden") && this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked) {
        setTimeout(() => this.renderCapsuleOverlay(), 200);
      }
    }
  }

  /**
   * Update grid borders based on user preference
   */
  updateGridBorders() {
    const showBorder = this.getGridBorderPreference();

    if (showBorder) {
      this.puzzleGrid.classList.add("with-border");
      this.solutionGrid.classList.add("with-border");
    } else {
      this.puzzleGrid.classList.remove("with-border");
      this.solutionGrid.classList.remove("with-border");
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WordSearchGenerator();
});
