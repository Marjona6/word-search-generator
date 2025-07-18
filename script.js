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
    this.puzzleNameInput = document.getElementById("puzzleName");
    this.wordListInput = document.getElementById("wordList");
    this.puzzleSizeSelect = document.getElementById("puzzleSize");
    this.horizontalCheckbox = document.getElementById("horizontal");
    this.verticalCheckbox = document.getElementById("vertical");
    this.diagonalCheckbox = document.getElementById("diagonal");
    this.reverseCheckbox = document.getElementById("reverse");
    this.showGridLinesCheckbox = document.getElementById("showGridLines");
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
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
      .map((word) => word.replace(/[^A-Za-z]/g, "").toUpperCase()) // Remove non-letters and convert to uppercase
      .filter((word) => word.length > 0) // Remove words that became empty after filtering
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

    const showGridLines = this.getGridLinesPreference();

    for (let i = 0; i < grid.length; i++) {
      const row = document.createElement("tr");

      for (let j = 0; j < grid[i].length; j++) {
        const cell = document.createElement("td");
        cell.className = cellClass;
        cell.textContent = grid[i][j];
        cell.dataset.row = i;
        cell.dataset.col = j;

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

    // Create a print-friendly version
    const printContent = document.createElement("div");
    printContent.style.width = "100%";
    printContent.style.backgroundColor = "white";
    printContent.style.padding = "20px";
    printContent.style.fontFamily = "Arial, sans-serif";
    printContent.style.color = "black";

    // Add title
    const title = document.createElement("h1");
    title.textContent = this.getPuzzleName();
    title.style.textAlign = "center";
    title.style.marginBottom = "20px";
    title.style.fontSize = "24px";
    printContent.appendChild(title);

    // Add word list
    const wordList = document.createElement("div");
    wordList.style.marginBottom = "20px";
    wordList.style.padding = "10px";
    wordList.style.border = "1px solid black";
    wordList.style.backgroundColor = "white";

    const wordListTitle = document.createElement("h3");
    wordListTitle.textContent = "Words to find:";
    wordListTitle.style.marginBottom = "10px";
    wordList.appendChild(wordListTitle);

    const words = this.getWordList();
    const wordText = document.createElement("p");
    wordText.textContent = words.join(", ");
    wordText.style.margin = "0";
    wordList.appendChild(wordText);
    printContent.appendChild(wordList);

    // Add puzzle grid
    const puzzleSection = document.createElement("div");
    puzzleSection.style.marginBottom = "20px";

    const puzzleTitle = document.createElement("h3");
    puzzleTitle.textContent = "Puzzle:";
    puzzleTitle.style.marginBottom = "10px";
    puzzleSection.appendChild(puzzleTitle);

    const puzzleTable = this.createTableForPDF(this.currentPuzzle, "puzzle-cell");
    puzzleSection.appendChild(puzzleTable);
    printContent.appendChild(puzzleSection);

    // Add solution grid
    const solutionSection = document.createElement("div");

    const solutionTitle = document.createElement("h3");
    solutionTitle.textContent = "Solution:";
    solutionTitle.style.marginBottom = "10px";
    solutionSection.appendChild(solutionTitle);

    const solutionTable = this.createTableForPDF(this.currentSolution, "solution-cell");
    solutionSection.appendChild(solutionTable);
    printContent.appendChild(solutionSection);

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    const showGridLines = this.getGridLinesPreference();
    const borderStyle = showGridLines ? "1px solid black" : "none";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Word Search Puzzle</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white; 
              color: black; 
            }
            .puzzle-cell, .solution-cell {
              width: 20px;
              height: 20px;
              border: ${borderStyle};
              text-align: center;
              vertical-align: middle;
              font-size: 10px;
              font-weight: bold;
              background-color: white;
              color: black;
              padding: 0;
            }
            table {
              border-collapse: collapse;
              table-layout: fixed;
              margin: 0 auto;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = function () {
      printWindow.print();
      printWindow.close();
    };
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
      // Create new jsPDF document (8.5x11 inches)
      const { jsPDF } = window.jspdf;
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

        // Draw solution grid
        this.drawGrid(doc, this.currentSolution, gridX, y, cellSize);
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

        // Draw solution grid
        this.drawGrid(doc, this.currentSolution, gridX, y, cellSize);
      }

      // Save the PDF
      doc.save("word-search-puzzle.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
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
  drawGrid(doc, grid, startX, startY, cellSize) {
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

    // Add letters
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = startX + col * cellSize + cellSize / 2;
        const y = startY + row * cellSize + cellSize / 2 + 0.05; // Small offset for centering
        const letter = grid[row][col];

        // Center the text in the cell
        const textWidth = doc.getTextWidth(letter);
        const textX = x - textWidth / 2;

        doc.text(letter, textX, y);
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
  createTableForPDF(grid, cellClass) {
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.tableLayout = "fixed";
    table.style.margin = "0 auto";
    table.style.maxWidth = "100%";

    const showGridLines = this.getGridLinesPreference();
    const borderStyle = showGridLines ? "1px solid black" : "none";

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
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WordSearchGenerator();
});
