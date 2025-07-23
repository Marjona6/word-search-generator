/**
 * Puzzle Engine
 * Handles the core puzzle generation algorithm
 */

import { GridUtils } from "../utils/GridUtils.js";

export class PuzzleEngine {
  constructor() {
    this.maxAttempts = 1000;
    this.attemptsPerWord = 50;
  }

  /**
   * Create a complete puzzle
   */
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

  /**
   * Create word search puzzle
   */
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

  /**
   * Smart word placement with scoring
   */
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

  /**
   * Check if a word can be placed at a position
   */
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

  /**
   * Calculate spacing score for word placement
   */
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

  /**
   * Count overlaps for a word placement
   */
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

  /**
   * Place word at specified position
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
   * Get direction vectors from direction names
   */
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

  /**
   * Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
