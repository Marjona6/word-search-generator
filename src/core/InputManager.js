/**
 * Input Manager
 * Handles all input validation, retrieval, and preference management
 */

export class InputManager {
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

  /**
   * Get word list from input
   */
  getWordList() {
    const wordListText = this.elements.wordList.value.trim();
    if (!wordListText) return [];

    return wordListText
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
      .map((word) => word.toUpperCase());
  }

  /**
   * Get puzzle name
   */
  getPuzzleName() {
    return this.elements.puzzleName.value.trim() || "Word Search Puzzle";
  }

  /**
   * Get puzzle size
   */
  getPuzzleSize() {
    return this.elements.puzzleSize.value;
  }

  /**
   * Get selected directions
   */
  getSelectedDirections() {
    const directions = [];

    if (this.elements.horizontal.checked) directions.push("horizontal");
    if (this.elements.vertical.checked) directions.push("vertical");
    if (this.elements.diagonal.checked) directions.push("diagonal");
    if (this.elements.reverse.checked) directions.push("reverse");

    return directions;
  }

  /**
   * Get grid lines preference
   */
  getGridLinesPreference() {
    return this.elements.showGridLines.checked;
  }

  /**
   * Get grid border preference
   */
  getGridBorderPreference() {
    return this.elements.showGridBorder.checked;
  }

  /**
   * Get outline words preference
   */
  getOutlineWordsPreference() {
    return this.elements.outlineFoundWords.checked;
  }

  /**
   * Get color words preference
   */
  getColorWordsPreference() {
    return this.elements.colorFoundWords.checked;
  }

  /**
   * Get hide other letters preference
   */
  getHideOtherLettersPreference() {
    return this.elements.hideOtherSolutionLetters.checked;
  }

  /**
   * Get all solution display options
   */
  getSolutionDisplayOptions() {
    return {
      outlineWords: this.getOutlineWordsPreference(),
      colorWords: this.getColorWordsPreference(),
      hideOtherLetters: this.getHideOtherLettersPreference(),
    };
  }

  /**
   * Get all preferences
   */
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

  /**
   * Set hide other letters default based on grid lines
   */
  setHideOtherLettersDefault() {
    if (this.elements.hideOtherSolutionLetters) {
      if (this.getGridLinesPreference()) {
        this.elements.hideOtherSolutionLetters.checked = true;
      } else {
        this.elements.hideOtherSolutionLetters.checked = false;
      }
    }
  }

  /**
   * Validate input
   */
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

  /**
   * Show error message
   */
  showError(message) {
    const errorElement = document.getElementById("errorMessage");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    const errorElement = document.getElementById("errorMessage");
    if (errorElement) {
      errorElement.style.display = "none";
    }
  }
}
