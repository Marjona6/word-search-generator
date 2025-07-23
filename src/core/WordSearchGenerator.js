/**
 * Word Search Puzzle Generator - Main Class
 * Orchestrates the entire word search generation process
 */

import { InputManager } from "./InputManager.js";
import { PuzzleEngine } from "./PuzzleEngine.js";
import { UIManager } from "../ui/UIManager.js";
import { RenderingManager } from "../rendering/RenderingManager.js";
import { ExportManager } from "../export/ExportManager.js";
import { DebugManager } from "../debug/DebugManager.js";

export class WordSearchGenerator {
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

  /**
   * Main puzzle generation function
   */
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

  /**
   * Display the generated puzzle
   */
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

  /**
   * Toggle solution visibility
   */
  toggleSolution() {
    this.uiManager.toggleSolutionVisibility();
    this.updateSolutionDisplay();
  }

  /**
   * Update solution display based on current options
   */
  updateSolutionDisplay() {
    if (this.currentSolution) {
      this.renderingManager.updateSolutionDisplay(this.currentSolution, this.placedWordInfos, this.inputManager.getSolutionDisplayOptions());
    }
  }

  /**
   * Update grid borders
   */
  updateGridBorders() {
    this.renderingManager.updateGridBorders(this.inputManager.getGridBorderPreference());
  }

  /**
   * Print the puzzle
   */
  printPuzzle() {
    this.exportManager.printPuzzle(this.currentPuzzle, this.currentSolution, this.placedWordInfos, this.inputManager.getOutlineWordsPreference());
  }

  /**
   * Download PDF
   */
  downloadPDF() {
    this.exportManager.downloadPDF(this.currentPuzzle, this.currentSolution, this.placedWordInfos, this.inputManager.getAllPreferences());
  }

  /**
   * Handle print mode detection
   */
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
