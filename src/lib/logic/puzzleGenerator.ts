import type { Grid, PlacedWordInfo, PuzzleResult, DirectionOptions } from "./types";
import { createEmptyGrid, fillGridWithRandomLetters, getDirectionVectors } from "./gridUtils";
import { canPlaceWord, placeWordAt } from "./wordPlacer";

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function generatePuzzle(words: string[], size: number, directions: DirectionOptions): PuzzleResult {
  const attemptsPerWord = 1000;
  let bestGrid: Grid | null = null;
  let bestSolution: Grid | null = null;
  let bestPlaced: string[] = [];
  let bestFailed: string[] = words;
  let bestScore = -1;
  let bestWordInfos: PlacedWordInfo[] = [];

  for (let attempt = 0; attempt < 10; attempt++) {
    const grid = createEmptyGrid(size);
    const solution = createEmptyGrid(size);
    const directionVectors = getDirectionVectors(directions);
    const placedWords: string[] = [];
    const failedWords: string[] = [];
    const placedWordInfos: PlacedWordInfo[] = [];
    const wordsByLength = [...words].sort((a, b) => b.length - a.length);

    for (const word of wordsByLength) {
      let placed = false;
      shuffleArray(directionVectors);
      const positions: [number, number][] = [];
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          positions.push([row, col]);
        }
      }
      shuffleArray(positions);
      for (const [dRow, dCol] of directionVectors) {
        for (const [row, col] of positions) {
          if (canPlaceWord(grid, word, row, col, dRow, dCol)) {
            placeWordAt(grid, word, row, col, dRow, dCol);
            placeWordAt(solution, word, row, col, dRow, dCol);
            placedWords.push(word);
            placedWordInfos.push({ word, startRow: row, startCol: col, dRow, dCol, length: word.length });
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (!placed) failedWords.push(word);
    }
    fillGridWithRandomLetters(grid);
    if (placedWords.length > bestScore) {
      bestScore = placedWords.length;
      bestGrid = grid;
      bestSolution = solution;
      bestPlaced = placedWords;
      bestFailed = failedWords;
      bestWordInfos = placedWordInfos;
    }
    if (failedWords.length === 0) break;
  }
  if (bestGrid && bestSolution) {
    return {
      puzzle: bestGrid,
      solution: bestSolution,
      placedWords: bestPlaced,
      failedWords: bestFailed,
      placedWordInfos: bestWordInfos,
    };
  }
  return {
    puzzle: createEmptyGrid(size),
    solution: createEmptyGrid(size),
    placedWords: [],
    failedWords: words,
    placedWordInfos: [],
  };
}
