/**
 * UI Manager
 * Handles all UI interactions, state management, and DOM updates
 */

export class UIManager {
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

  /**
   * Show loading indicator
   */
  showLoading() {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.style.display = "block";
    }

    if (this.elements.generateBtn) {
      this.elements.generateBtn.disabled = true;
      this.elements.generateBtn.textContent = "Generating...";
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.style.display = "none";
    }

    if (this.elements.generateBtn) {
      this.elements.generateBtn.disabled = false;
      this.elements.generateBtn.textContent = "Generate Puzzle";
    }
  }

  /**
   * Show output section
   */
  showOutput() {
    if (this.elements.outputSection) {
      this.elements.outputSection.style.display = "block";
    }
  }

  /**
   * Hide output section
   */
  hideOutput() {
    if (this.elements.outputSection) {
      this.elements.outputSection.style.display = "none";
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
      this.elements.errorMessage.style.display = "block";
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.style.display = "none";
    }
  }

  /**
   * Update word list display
   */
  updateWordListDisplay(words) {
    if (this.elements.wordListDisplay) {
      this.elements.wordListDisplay.innerHTML = words.map((word) => `<span class="word-item">${word}</span>`).join("");
    }
  }

  /**
   * Toggle solution visibility
   */
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

  /**
   * Show solution
   */
  showSolution() {
    if (this.elements.solutionGrid) {
      this.elements.solutionGrid.classList.remove("hidden");
      if (this.elements.toggleSolutionBtn) {
        this.elements.toggleSolutionBtn.textContent = "Hide Solution";
      }
    }
  }

  /**
   * Hide solution
   */
  hideSolution() {
    if (this.elements.solutionGrid) {
      this.elements.solutionGrid.classList.add("hidden");
      if (this.elements.toggleSolutionBtn) {
        this.elements.toggleSolutionBtn.textContent = "Show Solution";
      }
    }
  }

  /**
   * Get puzzle grid element
   */
  getPuzzleGrid() {
    return this.elements.puzzleGrid;
  }

  /**
   * Get solution grid element
   */
  getSolutionGrid() {
    return this.elements.solutionGrid;
  }

  /**
   * Check if solution is visible
   */
  isSolutionVisible() {
    return this.elements.solutionGrid && !this.elements.solutionGrid.classList.contains("hidden");
  }

  /**
   * Enable/disable buttons
   */
  setButtonsEnabled(enabled) {
    const buttons = [this.elements.generateBtn, this.elements.toggleSolutionBtn, this.elements.printBtn, this.elements.downloadBtn];

    buttons.forEach((button) => {
      if (button) {
        button.disabled = !enabled;
      }
    });
  }

  /**
   * Update button states based on puzzle state
   */
  updateButtonStates(hasPuzzle) {
    if (hasPuzzle) {
      this.setButtonsEnabled(true);
    } else {
      this.setButtonsEnabled(false);
    }
  }
}
