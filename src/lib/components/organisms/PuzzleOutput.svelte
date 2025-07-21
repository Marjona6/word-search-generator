<script lang="ts">
  import SolutionGrid from './SolutionGrid.svelte';
  import PuzzleGrid from './PuzzleGrid.svelte';
  import type { Grid, PlacedWordInfo } from '../../logic/types';

  export let grid: Grid = [];
  export let isSolution: boolean = false;
  export let placedWordInfos: PlacedWordInfo[] = [];
  export let cellSize: number = 32;
  export let showOverlay: boolean = true;
  export let colorFoundWords: boolean = false;
  export let foundPositions: Set<string> = new Set();
  export let wordList: string[] = [];
  export let hideOtherSolutionLetters: boolean = false;

  // Compute display grid for solution with hiding logic
  $: displayGrid = isSolution && hideOtherSolutionLetters
    ? grid.map((row, i) => row.map((cell, j) => foundPositions.has(`${i},${j}`) ? cell : ''))
    : grid;
</script>

<div class="puzzle-output">
  {#if isSolution}
    <SolutionGrid
      grid={displayGrid}
      {placedWordInfos}
      {cellSize}
      {showOverlay}
      {colorFoundWords}
      {foundPositions}
    />
  {:else}
    <PuzzleGrid
      grid={grid}
      {foundPositions}
      {cellSize}
      highlightFound={false}
    />
  {/if}
  <div class="word-list">
    <h3>Words to Find</h3>
    <ul>
      {#each wordList as word}
        <li>{word}</li>
      {/each}
    </ul>
  </div>
</div>

<style>
.puzzle-output {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}
.word-list {
  min-width: 180px;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.word-list h3 {
  margin-top: 0;
  font-size: 1.1rem;
  color: #374151;
  margin-bottom: 0.5rem;
}
.word-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.word-list li {
  font-size: 1rem;
  color: #1e293b;
  padding: 0.25rem 0;
}
</style> 