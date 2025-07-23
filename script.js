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
    this.handlePrintMode();
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
    this.largePrintCheckbox = document.getElementById("largePrint");
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

        // Show warning if some words couldn't be placed
        if (result.failedWords && result.failedWords.length > 0) {
          const placedCount = result.placedWords.length;
          const failedCount = result.failedWords.length;
          const totalCount = words.length;

          const warningMessage = `Successfully placed ${placedCount} out of ${totalCount} words. Could not place: ${result.failedWords.join(", ")}. Try increasing the grid size, adding more direction options, or reducing the number of words.`;
          this.showError(warningMessage);
        }

        // Log placement statistics for debugging
        console.log(`Puzzle generation complete: ${result.placedWords.length}/${words.length} words placed`);
        if (result.placedWordInfos && result.placedWordInfos.length > 0) {
          const totalOverlap = result.placedWordInfos.reduce((sum, info) => {
            return sum + this.countOverlap(result.puzzle, info.word, info.startRow, info.startCol, [info.dRow, info.dCol]);
          }, 0);
          console.log(`Total overlap achieved: ${totalOverlap} letters`);
        }
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
      .split(/[\n,]/) // Split by newlines and commas
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
      .map((word) => word.replace(/[^A-Za-z\s]/g, "").toUpperCase()) // Remove non-letters/non-spaces and convert to uppercase
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
   * Get large print preference
   */
  getLargePrintPreference() {
    return this.largePrintCheckbox && this.largePrintCheckbox.checked;
  }

  /**
   * Get font sizes based on large print preference
   */
  getFontSizes() {
    const isLargePrint = this.getLargePrintPreference();

    if (isLargePrint) {
      return {
        puzzleTitle: 28, // 22-26 pt
        puzzleGrid: 22, // 20-24 pt
        wordList: 20, // 18-20 pt
        wordListLabel: 20, // 18-20 pt
        solutionGrid: 18, // 16-18 pt
        instructions: 20, // 18-20 pt
        pageInfo: 16, // 14-16 pt
      };
    } else {
      return {
        puzzleTitle: 18, // Standard sizes
        puzzleGrid: 8, // Standard grid size
        wordList: 10, // Standard word list
        wordListLabel: 12, // Standard label
        solutionGrid: 8, // Standard solution
        instructions: 12, // Standard instructions
        pageInfo: 10, // Standard page info
      };
    }
  }

  /**
   * Validate user input
   */
  validateInput(words, size, directions) {
    if (words.length === 0) {
      this.showError("Please enter at least one word.");
      return false;
    }

    // Count only letters (excluding spaces) for length validation
    const maxWordLength = Math.max(...words.map((word) => word.replace(/\s/g, "").length));
    if (maxWordLength > size) {
      const longestWord = words.find((word) => word.replace(/\s/g, "").length === maxWordLength);
      this.showError(`Word "${longestWord}" is too long for a ${size}x${size} puzzle.`);
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
    const attemptsPerWord = 2000; // Increased from 1000 to give more chances for placement

    // Try multiple full generations, keep the best
    let bestGrid = null;
    let bestSolution = null;
    let bestPlaced = [];
    let bestFailed = words;
    let bestScore = -1;
    let bestWordInfos = [];

    for (let attempt = 0; attempt < 15; attempt++) {
      // Increased from 10 to 15 attempts
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
      error: `Unable to place any of the ${words.length} words. Try reducing the number of words, increasing the puzzle size, or adding more direction options.`,
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
    const wordsByLength = [...words].sort((a, b) => b.replace(/\s/g, "").length - a.replace(/\s/g, "").length);

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
   * Smart word placement with overlap optimization (improved algorithm)
   */
  placeWordSmart(grid, solution, word, directionVectors) {
    const size = grid.length;
    let best = [];
    let bestOverlap = -1;

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

    // First pass: find positions with maximum overlap
    for (const [dRow, dCol] of shuffledDirections) {
      for (const [row, col] of positions) {
        if (this.canPlaceWord(grid, word, row, col, [dRow, dCol])) {
          const overlap = this.countOverlap(grid, word, row, col, [dRow, dCol]);

          if (overlap > bestOverlap) {
            best = [[row, col, dRow, dCol]];
            bestOverlap = overlap;
          } else if (overlap === bestOverlap) {
            best.push([row, col, dRow, dCol]);
          }
        }
      }
    }

    // If no overlap found, try again with spacing consideration
    if (bestOverlap === 0) {
      let bestSpacing = -1;
      best = [];

      for (const [dRow, dCol] of shuffledDirections) {
        for (const [row, col] of positions) {
          if (this.canPlaceWord(grid, word, row, col, [dRow, dCol])) {
            const spacing = this.calculateSpacingScore(grid, word, row, col, [dRow, dCol]);

            if (spacing > bestSpacing) {
              best = [[row, col, dRow, dCol]];
              bestSpacing = spacing;
            } else if (spacing === bestSpacing) {
              best.push([row, col, dRow, dCol]);
            }
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
        length: word.replace(/\s/g, "").length,
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

    // Remove spaces from word for overlap calculation
    const wordWithoutSpaces = word.replace(/\s/g, "");

    for (let i = 0; i < wordWithoutSpaces.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;

      if (grid[row][col] === wordWithoutSpaces[i]) {
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

    // Remove spaces from word for spacing calculation
    const wordWithoutSpaces = word.replace(/\s/g, "");

    // Check each cell the word would occupy
    for (let i = 0; i < wordWithoutSpaces.length; i++) {
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
      // Only forward diagonal direction (top-left to bottom-right)
      vectors.push([1, 1]); // Down-right (top-left to bottom-right)
      if (directions.reverse) {
        // Add backward diagonal directions only when reverse is selected
        vectors.push([1, -1]); // Down-left (top-right to bottom-left)
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

    // Remove spaces from word for placement
    const wordWithoutSpaces = word.replace(/\s/g, "");

    for (let i = 0; i < wordWithoutSpaces.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;

      // Check bounds
      if (row < 0 || row >= size || col < 0 || col >= size) {
        return false;
      }

      // Check if cell is empty or contains the same letter
      if (grid[row][col] !== "" && grid[row][col] !== wordWithoutSpaces[i]) {
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

    // Remove spaces from word for placement
    const wordWithoutSpaces = word.replace(/\s/g, "");

    for (let i = 0; i < wordWithoutSpaces.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;

      grid[row][col] = wordWithoutSpaces[i];
      solution[row][col] = wordWithoutSpaces[i];
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

    // Render ALL capsules with viewBox if needed
    if (this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked) {
      setTimeout(() => {
        const table = this.solutionGrid.querySelector("table");
        if (table) {
          this.renderAllCapsulesWithViewBox(this.solutionGrid, table);
        }
      }, 200);
    }
  }

  /**
   * Render capsule outlines using a canvas overlay
   */
  renderCapsuleCanvasOverlay() {
    // Remove any existing canvas overlay
    const oldCanvas = this.solutionGrid.querySelector(".capsule-canvas-overlay");
    if (oldCanvas) oldCanvas.remove();

    const table = this.solutionGrid.querySelector("table");
    if (!table) {
      console.warn("No table found in solutionGrid");
      return;
    }
    const cell = table.querySelector("td");
    if (!cell) {
      console.warn("No cell found in table");
      return;
    }

    // Wait for table to be fully rendered
    if (table.offsetWidth === 0 || table.offsetHeight === 0) {
      setTimeout(() => this.renderCapsuleCanvasOverlay(), 100);
      return;
    }

    // Get cell size and grid size
    const cellSize = cell.offsetWidth;
    const cellHeight = cell.offsetHeight;
    const gridSize = this.currentPuzzle ? this.currentPuzzle.length : 15;

    // Create SVG overlay instead of canvas for better print compatibility
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${table.offsetWidth} ${table.offsetHeight}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.position = "absolute";
    svg.style.left = "0px";
    svg.style.top = "0px";
    svg.style.pointerEvents = "none";
    svg.classList.add("capsule-canvas-overlay");
    svg.style.zIndex = 10;

    // Make table position: relative to contain the overlay
    table.style.position = "relative";

    for (const info of this.placedWordInfos) {
      const { startRow, startCol, dRow, dCol, length } = info;
      const endRow = startRow + (length - 1) * dRow;
      const endCol = startCol + (length - 1) * dCol;

      // Calculate center of start and end cells
      const startX = startCol * cellSize + cellSize / 2;
      const startY = startRow * cellHeight + cellHeight / 2;
      const endX = endCol * cellSize + cellSize / 2;
      const endY = endRow * cellHeight + cellHeight / 2;

      // Capsule parameters
      const extension = cellHeight * 0.4;
      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const capsuleLength = dist + extension * 2;
      const capsuleWidth = cellHeight * 0.7;
      const radius = capsuleWidth / 2;

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
      path.setAttribute("stroke-width", cellHeight * 0.15);
      path.setAttribute("opacity", "0.85");
      path.setAttribute("transform", `rotate(${angle} ${centerX} ${centerY})`);
      svg.appendChild(path);
    }

    table.appendChild(svg);
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

    // Add class to table for print CSS to respect grid line preference
    if (showGridLines) {
      table.classList.add("show-grid-lines");
    } else {
      table.classList.remove("show-grid-lines");
    }

    // Build a map of all found word positions and their info
    let foundPositions = new Map();
    let diagonalCapsules = [];
    if (isSolution && this.placedWordInfos) {
      for (const info of this.placedWordInfos) {
        const { startRow, startCol, dRow, dCol, length } = info;
        // Diagonal detection
        const isDiagonal = Math.abs(dRow) === 1 && Math.abs(dCol) === 1;
        if (isDiagonal) {
          diagonalCapsules.push(info);
        }
        for (let i = 0; i < length; i++) {
          const row = startRow + i * dRow;
          const col = startCol + i * dCol;
          let posKey = `${row},${col}`;
          let posInfo = foundPositions.get(posKey) || {};
          posInfo.isCapsule = true;
          // Mark start/end
          if (i === 0) {
            posInfo.isCapsuleStart = true;
            posInfo.capsuleDir = `${dRow},${dCol}`;
          }
          if (i === length - 1) {
            posInfo.isCapsuleEnd = true;
            posInfo.capsuleDir = `${dRow},${dCol}`;
          }
          // Mark direction for all
          posInfo.capsuleDir = `${dRow},${dCol}`;
          posInfo.isDiagonal = isDiagonal;
          foundPositions.set(posKey, posInfo);
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
        let posKey = `${i},${j}`;
        let posInfo = foundPositions.get(posKey);
        let isFound = !!posInfo;
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

    // Add SVG overlays for ALL capsules (horizontal, vertical, and diagonal)
    if (isSolution && this.placedWordInfos && this.placedWordInfos.length > 0 && this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked) {
      this.renderAllCapsulesWithViewBox(container, table);
    }
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
      // Render ALL capsules with viewBox after a short delay to ensure grid is fully rendered
      if (this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked) {
        setTimeout(() => {
          const table = this.solutionGrid.querySelector("table");
          if (table) {
            this.renderAllCapsulesWithViewBox(this.solutionGrid, table);
          }
        }, 200);
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

    // Ensure solution is visible for print
    if (this.solutionGrid.classList.contains("hidden")) {
      this.solutionGrid.classList.remove("hidden");
    }

    // Force re-render of ALL capsules for print
    if (this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked) {
      // First, remove any existing overlays
      const existingOverlays = this.solutionGrid.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
      existingOverlays.forEach((overlay) => overlay.remove());

      // Then render ALL capsules
      setTimeout(() => {
        const table = this.solutionGrid.querySelector("table");
        if (table) {
          this.renderAllCapsulesWithViewBox(this.solutionGrid, table);

          // Give the overlays a moment to render before printing
          setTimeout(() => {
            window.print();
          }, 500);
        } else {
          window.print();
        }
      }, 100);
    } else {
      window.print();
    }
  }

  /**
   * Download puzzle as PDF using jsPDF
   */
  downloadPDF() {
    // Ensure we have content to generate
    if (!this.currentPuzzle || !this.currentSolution) {
      this.showError("No puzzle generated yet. Please generate a puzzle first.");
      return;
    }

    try {
      // Check if jsPDF is available
      if (typeof window.jspdf === "undefined") {
        console.error("jsPDF library not found");
        this.showError("PDF library not loaded. Please refresh the page and try again.");
        return;
      }

      // Create new jsPDF document (8.5x11 inches)
      const { jsPDF } = window.jspdf;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",
      });

      // Set margins (optimized for 8.5x11" page)
      const margin = 0.75; // Reduced from 1 inch
      const pageWidth = 8.5;
      const pageHeight = 11;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      // Get font sizes based on large print preference
      const fontSizes = this.getFontSizes();

      // Calculate grid size and cell size (adjust for large print)
      const gridSize = this.currentPuzzle.length;
      const isLargePrint = this.getLargePrintPreference();
      const maxCellSize = isLargePrint ? 0.5 : 0.3; // Much larger cells for large print
      const cellSize = Math.min(contentWidth / gridSize, maxCellSize);
      const gridWidth = gridSize * cellSize;
      const gridHeight = gridSize * cellSize;
      const gridX = margin + (contentWidth - gridWidth) / 2;

      // Calculate content heights (optimized spacing)
      const titleHeight = isLargePrint ? 0.5 : 0.35; // Reduced from 0.6/0.4
      const wordListHeight = this.calculateWordListHeight(contentWidth);
      const minSpacing = isLargePrint ? 0.25 : 0.2; // Minimum spacing between elements

      // Calculate maximum spacing between grid and word list
      // We want to maximize space between grid and word list while keeping everything on the page
      const totalContentHeight = titleHeight + gridHeight + wordListHeight;
      const availableSpace = contentHeight - totalContentHeight;
      const spacingBetweenGridAndWords = Math.max(minSpacing, availableSpace * 0.8); // Use 80% of available space

      // Debug logging
      console.log("PDF Layout Debug:", {
        contentHeight,
        titleHeight,
        gridHeight,
        wordListHeight,
        totalContentHeight,
        availableSpace,
        spacingBetweenGridAndWords,
        minSpacing,
      });

      // Calculate total height needed for multi-page check
      const totalHeight = titleHeight + gridHeight + spacingBetweenGridAndWords + wordListHeight + minSpacing + titleHeight + gridHeight;

      // Check if we need multiple pages
      if (totalHeight > contentHeight) {
        // First page: Title, word list, and puzzle
        let y = margin + 0.3; // Reduced from 0.5

        // Add title
        doc.setFontSize(fontSizes.puzzleTitle);
        doc.setFont("times", "bold"); // Use serif font for title
        const title = this.getPuzzleName();
        const titleWidth = doc.getTextWidth(title);
        const titleX = margin + (contentWidth - titleWidth) / 2;
        doc.text(title, titleX, y);
        y += titleHeight;

        // Draw puzzle grid
        this.drawGrid(doc, this.currentPuzzle, gridX, y, cellSize);
        y += gridHeight + spacingBetweenGridAndWords;

        // Add word list underneath the puzzle
        y = this.addWordList(doc, margin, y, contentWidth);

        // Add new page for solution
        doc.addPage();

        // Second page: Solution
        y = margin + 0.3; // Reduced from 0.5

        // Add solution title (same as puzzle title)
        doc.setFontSize(fontSizes.puzzleTitle);
        doc.setFont("times", "bold"); // Use serif font for title
        const solutionTitle = this.getPuzzleName();
        const solutionTitleWidth = doc.getTextWidth(solutionTitle);
        const solutionTitleX = margin + (contentWidth - solutionTitleWidth) / 2;
        doc.text(solutionTitle, solutionTitleX, y);
        y += titleHeight;

        // Draw solution grid with user's display preferences
        let useSolutionGrid = this.hideOtherSolutionLettersCheckbox && this.hideOtherSolutionLettersCheckbox.checked;
        let solutionDisplayGrid = useSolutionGrid ? this.currentSolution : this.currentPuzzle;
        this.drawGrid(doc, solutionDisplayGrid, gridX, y, cellSize, true, this.hideOtherSolutionLettersCheckbox && this.hideOtherSolutionLettersCheckbox.checked);
      } else {
        // Single page: Everything fits
        let y = margin + 0.3; // Reduced from 0.5

        // Add title
        doc.setFontSize(fontSizes.puzzleTitle);
        doc.setFont("times", "bold"); // Use serif font for title
        const title = this.getPuzzleName();
        const titleWidth = doc.getTextWidth(title);
        const titleX = margin + (contentWidth - titleWidth) / 2;
        doc.text(title, titleX, y);
        y += titleHeight;

        // Draw puzzle grid
        this.drawGrid(doc, this.currentPuzzle, gridX, y, cellSize);
        y += gridHeight + spacingBetweenGridAndWords;

        // Add word list underneath the puzzle
        y = this.addWordList(doc, margin, y, contentWidth);
        y += minSpacing;

        // Add solution title (same as puzzle title)
        doc.setFontSize(fontSizes.puzzleTitle);
        doc.setFont("times", "bold"); // Use serif font for title
        const solutionTitle = this.getPuzzleName();
        const solutionTitleWidth = doc.getTextWidth(solutionTitle);
        const solutionTitleX = margin + (contentWidth - solutionTitleWidth) / 2;
        doc.text(solutionTitle, solutionTitleX, y);
        y += titleHeight;

        // Draw solution grid with user's display preferences
        let useSolutionGrid = this.hideOtherSolutionLettersCheckbox && this.hideOtherSolutionLettersCheckbox.checked;
        let solutionDisplayGrid = useSolutionGrid ? this.currentSolution : this.currentPuzzle;
        this.drawGrid(doc, solutionDisplayGrid, gridX, y, cellSize, true, this.hideOtherSolutionLettersCheckbox && this.hideOtherSolutionLettersCheckbox.checked);
      }

      // Save the PDF
      doc.save("word-search-puzzle.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
      console.error("Error details:", error.message, error.stack);
      this.showError("PDF generation failed. Please try printing instead.");
    }
  }

  /**
   * Calculate the height needed for the word list in columns
   */
  calculateWordListHeight(contentWidth) {
    const words = this.getWordList();
    const isLargePrint = this.getLargePrintPreference();

    // Always use at least 3 columns
    let numColumns = 3;

    // Calculate height needed for the tallest column
    const wordsPerColumn = Math.ceil(words.length / numColumns);
    const lineHeight = isLargePrint ? 0.35 : 0.25; // Match the line height used in addWordList
    const spacing = isLargePrint ? 0.4 : 0.3; // Match the final spacing used in addWordList

    return wordsPerColumn * lineHeight + spacing; // Column height + spacing (no label)
  }

  /**
   * Add word list to the PDF in 2-3 columns and return the new y position
   */
  addWordList(doc, margin, y, contentWidth) {
    const words = this.getWordList();
    const fontSizes = this.getFontSizes();
    const isLargePrint = this.getLargePrintPreference();

    // Remove the "Words to find:" label - just show the words directly
    doc.setFontSize(fontSizes.wordList);
    doc.setFont("helvetica", "normal"); // Use sans-serif for word lists (Verdana not available in jsPDF)

    // Always use at least 3 columns
    let numColumns = 3;

    // Calculate column width and spacing with better use of available space
    const columnWidth = contentWidth / numColumns;
    const lineHeight = isLargePrint ? 0.35 : 0.25; // Increased line height for better spacing

    // Distribute words across columns
    const wordsPerColumn = Math.ceil(words.length / numColumns);

    // First pass: calculate the actual width needed for each column
    const columnWidths = [];
    let totalActualWidth = 0;

    for (let col = 0; col < numColumns; col++) {
      const startIndex = col * wordsPerColumn;
      const endIndex = Math.min(startIndex + wordsPerColumn, words.length);
      const columnWords = words.slice(startIndex, endIndex);

      if (columnWords.length === 0) {
        columnWidths.push(0);
        continue;
      }

      // Find the longest word in this column
      const longestWord = columnWords.reduce((longest, word) => (word.length > longest.length ? word : longest), columnWords[0]);

      const wordWidth = doc.getTextWidth(longestWord);
      columnWidths.push(wordWidth);
      totalActualWidth += wordWidth;
    }

    // Add generous spacing between columns - use more available space
    const spacingBetweenColumns = isLargePrint ? 0.6 : 0.5; // Much more spacing between columns
    totalActualWidth += (numColumns - 1) * spacingBetweenColumns;

    // Calculate starting position to center the word list
    const startX = margin + (contentWidth - totalActualWidth) / 2;

    // Second pass: draw the words
    let currentX = startX;
    for (let col = 0; col < numColumns; col++) {
      const startIndex = col * wordsPerColumn;
      const endIndex = Math.min(startIndex + wordsPerColumn, words.length);
      const columnWords = words.slice(startIndex, endIndex);

      if (columnWords.length === 0) continue;

      // Add words in this column
      for (let i = 0; i < columnWords.length; i++) {
        doc.text(columnWords[i], currentX, y + i * lineHeight);
      }

      // Move to next column position
      currentX += columnWidths[col] + spacingBetweenColumns;
    }

    // Calculate total height needed for the tallest column
    const maxWordsInAnyColumn = Math.ceil(words.length / numColumns);
    const finalSpacing = isLargePrint ? 0.4 : 0.3; // Increased final spacing
    y += maxWordsInAnyColumn * lineHeight + finalSpacing;

    return y;
  }

  /**
   * Draw a grid for the PDF
   */
  drawGrid(doc, grid, startX, startY, cellSize, isSolution = false, hideOther = false) {
    const gridSize = grid.length;
    const showGridLines = this.getGridLinesPreference();
    const showGridBorder = this.getGridBorderPreference();

    // Draw outer border if user wants it
    if (showGridBorder) {
      doc.setDrawColor(0);
      doc.setLineWidth(0.02); // Slightly thicker for border
      doc.rect(startX, startY, gridSize * cellSize, gridSize * cellSize);
    }

    // Draw grid lines only if user wants them
    if (showGridLines) {
      doc.setDrawColor(0);
      doc.setLineWidth(0.01);

      // Vertical lines
      for (let i = 1; i < gridSize; i++) {
        const x = startX + i * cellSize;
        doc.line(x, startY, x, startY + gridSize * cellSize);
      }

      // Horizontal lines
      for (let i = 1; i < gridSize; i++) {
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
    const fontSizes = this.getFontSizes();
    doc.setFontSize(fontSizes.puzzleGrid);
    doc.setFont("helvetica", "bold"); // Use sans-serif for puzzle grid (Verdana not available in jsPDF)

    const colorFoundWords = this.colorFoundWordsCheckbox && this.colorFoundWordsCheckbox.checked;

    const isLargePrint = this.getLargePrintPreference();

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = startX + col * cellSize + cellSize / 2;
        // Add more vertical offset for large print to account for larger font
        const verticalOffset = isLargePrint ? 0.08 : 0.05;
        const y = startY + row * cellSize + cellSize / 2 + verticalOffset;
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
        // Adjust capsule size for large print - make capsules larger for large print
        const extension = isLargePrint ? cellSize * 0.5 : cellSize * 0.4;
        const capsuleLength = dist + extension * 2;
        // Adjust capsule width for large print - make capsules wider for large print
        const capsuleWidth = isLargePrint ? cellSize * 0.9 : cellSize * 0.7;
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
        setTimeout(() => this.renderCapsuleCanvasOverlay(), 200);
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

  /**
   * Force re-render of capsule overlays
   */
  forceRenderCapsules() {
    if (this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked) {
      setTimeout(() => {
        const table = this.solutionGrid.querySelector("table");
        if (table) {
          this.renderAllCapsulesWithViewBox(this.solutionGrid, table);
        }
      }, 100);
    }
  }

  /**
   * Detect print mode and ensure overlays are visible
   */
  handlePrintMode() {
    // Add print mode detection
    const mediaQuery = window.matchMedia("print");

    const handlePrintChange = (e) => {
      if (e.matches) {
        // Force re-render of ALL capsules for print
        if (this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked) {
          setTimeout(() => {
            const table = this.solutionGrid.querySelector("table");
            if (table) {
              this.renderAllCapsulesWithViewBox(this.solutionGrid, table);
            }
          }, 100);
        }
      }
    };

    // Listen for print mode changes
    mediaQuery.addListener(handlePrintChange);

    // Also handle the beforeprint event
    window.addEventListener("beforeprint", () => {
      if (this.outlineFoundWordsCheckbox && this.outlineFoundWordsCheckbox.checked) {
        setTimeout(() => {
          const table = this.solutionGrid.querySelector("table");
          if (table) {
            this.renderAllCapsulesWithViewBox(this.solutionGrid, table);
          }
        }, 100);
      }
    });
  }

  /**
   * Render ALL capsules (horizontal, vertical, and diagonal) using viewBox for consistent positioning
   */
  renderAllCapsulesWithViewBox(container, table) {
    // Remove any existing overlays
    const oldOverlays = table.querySelectorAll(".capsule-canvas-overlay, .diagonal-capsule-overlay");
    oldOverlays.forEach((el) => el.remove());

    // Wait for table to be fully rendered
    if (table.offsetWidth === 0 || table.offsetHeight === 0) {
      setTimeout(() => this.renderAllCapsulesWithViewBox(container, table), 100);
      return;
    }

    const cell = table.querySelector("td");
    if (!cell) return;

    // Get actual cell size
    const actualCellWidth = cell.offsetWidth;
    const actualCellHeight = cell.offsetHeight;
    const gridSize = this.currentPuzzle ? this.currentPuzzle.length : 15;

    // Calculate the total grid size in pixels
    const gridWidth = gridSize * actualCellWidth;
    const gridHeight = gridSize * actualCellHeight;

    // Create a single SVG that covers the entire grid
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${gridWidth} ${gridHeight}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.position = "absolute";
    svg.style.left = "0px";
    svg.style.top = "0px";
    svg.style.pointerEvents = "none";
    svg.classList.add("capsule-canvas-overlay");
    svg.style.zIndex = 10;

    // Process ALL words (horizontal, vertical, and diagonal)

    for (const info of this.placedWordInfos) {
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
      const isHorizontal = dRow === 0 && dCol !== 0;
      const isVertical = dCol === 0 && dRow !== 0;
      const isDiagonal = Math.abs(dRow) === 1 && Math.abs(dCol) === 1;
      const wordType = isHorizontal ? "HORIZONTAL" : isVertical ? "VERTICAL" : isDiagonal ? "DIAGONAL" : "OTHER";
    }

    table.style.position = "relative";
    table.appendChild(svg);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WordSearchGenerator();
});
