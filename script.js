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
  }

  initializeElements() {
    // Input elements
    this.wordListInput = document.getElementById("wordList");
    this.puzzleSizeSelect = document.getElementById("puzzleSize");
    this.horizontalCheckbox = document.getElementById("horizontal");
    this.verticalCheckbox = document.getElementById("vertical");
    this.diagonalCheckbox = document.getElementById("diagonal");
    this.reverseCheckbox = document.getElementById("reverse");
    this.generateBtn = document.getElementById("generateBtn");

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
    this.downloadBtn.addEventListener("click", () => this.downloadPDF());
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
      .map((word) => word.trim().toUpperCase())
      .filter((word) => word.length > 0)
      .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
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

    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        const result = this.createWordSearch(words, size, directions, attemptsPerWord);

        if (result.placedWords.length > bestScore) {
          bestScore = result.placedWords.length;
          bestGrid = result.grid;
          bestSolution = result.solution;
          bestPlaced = result.placedWords;
          bestFailed = result.failedWords;
        }

        if (result.failedWords.length === 0) {
          break; // Perfect placement found
        }
      } catch (error) {
        console.warn("Attempt failed, retrying...", error);
      }
    }

    if (bestGrid) {
      return {
        success: true,
        puzzle: bestGrid,
        solution: bestSolution,
        placedWords: bestPlaced,
        failedWords: bestFailed,
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

    // Sort words by length (longest first) for better placement
    const wordsByLength = [...words].sort((a, b) => b.length - a.length);

    for (const word of wordsByLength) {
      let placed = false;

      for (let attempt = 0; attempt < attemptsPerWord; attempt++) {
        if (this.placeWordSmart(grid, solution, word, directionVectors)) {
          placedWords.push(word);
          placed = true;
          break;
        }
      }

      if (!placed) {
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
    };
  }

  /**
   * Smart word placement with overlap optimization
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

    if (best.length > 0) {
      const [row, col, dRow, dCol] = best[Math.floor(Math.random() * best.length)];
      this.placeWordAt(grid, solution, word, row, col, [dRow, dCol]);
      return true;
    }

    return false;
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
      vectors.push([0, 1]); // Right
      if (directions.reverse) vectors.push([0, -1]); // Left
    }

    if (directions.vertical) {
      vectors.push([1, 0]); // Down
      if (directions.reverse) vectors.push([-1, 0]); // Up
    }

    if (directions.diagonal) {
      vectors.push([1, 1]); // Down-right
      vectors.push([1, -1]); // Down-left
      if (directions.reverse) {
        vectors.push([-1, 1]); // Up-right
        vectors.push([-1, -1]); // Up-left
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

    // Display solution grid
    this.renderGrid(this.solutionGrid, solution, "solution-cell");
  }

  /**
   * Render a grid as HTML
   */
  renderGrid(container, grid, cellClass) {
    container.innerHTML = "";

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";

    for (let i = 0; i < grid.length; i++) {
      const row = document.createElement("tr");

      for (let j = 0; j < grid[i].length; j++) {
        const cell = document.createElement("td");
        cell.className = cellClass;
        cell.textContent = grid[i][j];
        cell.dataset.row = i;
        cell.dataset.col = j;
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
    } else {
      solutionGrid.classList.add("hidden");
      toggleBtn.textContent = "Show Solution";
    }
  }

  /**
   * Print the puzzle
   */
  printPuzzle() {
    // Temporarily show solution for printing
    const wasHidden = this.solutionGrid.classList.contains("hidden");
    if (wasHidden) {
      this.solutionGrid.classList.remove("hidden");
    }

    window.print();

    // Hide solution again if it was hidden before
    if (wasHidden) {
      this.solutionGrid.classList.add("hidden");
    }
  }

  /**
   * Download puzzle as PDF
   */
  downloadPDF() {
    const element = document.getElementById("outputSection");
    const opt = {
      margin: 1,
      filename: "word-search-puzzle.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    // Temporarily show solution for PDF
    const wasHidden = this.solutionGrid.classList.contains("hidden");
    if (wasHidden) {
      this.solutionGrid.classList.remove("hidden");
    }

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        // Hide solution again if it was hidden before
        if (wasHidden) {
          this.solutionGrid.classList.add("hidden");
        }
      });
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
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WordSearchGenerator();
});
