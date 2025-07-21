// Types for the word search puzzle logic

export type Grid = string[][];

export interface PlacedWordInfo {
  word: string;
  startRow: number;
  startCol: number;
  dRow: number;
  dCol: number;
  length: number;
}

export interface PuzzleResult {
  puzzle: Grid;
  solution: Grid;
  placedWords: string[];
  failedWords: string[];
  placedWordInfos: PlacedWordInfo[];
}

export interface DirectionOptions {
  horizontal: boolean;
  vertical: boolean;
  diagonal: boolean;
  reverse: boolean;
}
