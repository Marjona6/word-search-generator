import type { Grid, DirectionOptions } from "./types";

export function createEmptyGrid(size: number): Grid {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

export function fillGridWithRandomLetters(grid: Grid): void {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === "") {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

export function getDirectionVectors(directions: DirectionOptions): [number, number][] {
  const vectors: [number, number][] = [];
  if (directions.horizontal) {
    vectors.push([0, 1]);
    if (directions.reverse) vectors.push([0, -1]);
  }
  if (directions.vertical) {
    vectors.push([1, 0]);
    if (directions.reverse) vectors.push([-1, 0]);
  }
  if (directions.diagonal) {
    vectors.push([1, 1]);
    vectors.push([1, -1]);
    if (directions.reverse) {
      vectors.push([-1, 1]);
      vectors.push([-1, -1]);
    }
  }
  return vectors;
}
