<script lang="ts">
  import PuzzleGrid from './PuzzleGrid.svelte';
  import type { Grid, PlacedWordInfo } from '../../logic/types';
  import { getCapsuleOverlays } from '../../logic/solutionOverlay';

  export let grid: Grid;
  export let placedWordInfos: PlacedWordInfo[] = [];
  export let cellSize: number = 32;
  export let showOverlay: boolean = true;
  export let colorFoundWords: boolean = false;
  export let foundPositions: Set<string> = new Set();

  // Compute overlays
  $: overlays = showOverlay ? getCapsuleOverlays(placedWordInfos, cellSize) : [];
</script>

<div class="solution-grid-wrapper" style="position: relative; display: inline-block;">
  <PuzzleGrid {grid} {foundPositions} {cellSize} highlightFound={colorFoundWords} />
  {#if showOverlay && overlays.length > 0}
    <svg
      class="capsule-overlay"
      width={grid.length * cellSize}
      height={grid.length * cellSize}
      style="position: absolute; left: 0; top: 0; pointer-events: none; z-index: 2;"
    >
      {#each overlays as overlay}
        <rect
          x={overlay.cx - overlay.capsuleLength / 2}
          y={overlay.cy - overlay.capsuleWidth / 2}
          width={overlay.capsuleLength}
          height={overlay.capsuleWidth}
          rx={overlay.capsuleWidth / 2}
          ry={overlay.capsuleWidth / 2}
          fill="none"
          stroke="#000"
          stroke-width={cellSize * 0.15}
          opacity="0.85"
          transform={`rotate(${overlay.angle} ${overlay.cx} ${overlay.cy})`}
        />
      {/each}
    </svg>
  {/if}
</div>

<style>
.capsule-overlay {
  pointer-events: none;
}
</style> 