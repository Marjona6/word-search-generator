import type { Grid } from "./types";

export function canPlaceWord(grid: Grid, word: string, startRow: number, startCol: number, dRow: number, dCol: number): boolean {
  const size = grid.length;
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * dRow;
    const col = startCol + i * dCol;
    if (row < 0 || row >= size || col < 0 || col >= size) return false;
    if (grid[row][col] !== "" && grid[row][col] !== word[i]) return false;
  }
  return true;
}

export function placeWordAt(grid: Grid, word: string, startRow: number, startCol: number, dRow: number, dCol: number): void {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * dRow;
    const col = startCol + i * dCol;
    grid[row][col] = word[i];
  }
}
