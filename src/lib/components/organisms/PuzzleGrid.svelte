<script lang="ts">
  export let grid: string[][];
  export let foundPositions: Set<string> = new Set();
  export let cellSize: number = 32;
  export let highlightFound: boolean = false;
</script>

<table class="puzzle-grid">
  <tbody>
    {#each grid as row, i}
      <tr>
        {#each row as cell, j}
          <td
            class:found={!highlightFound && foundPositions.has(`${i},${j}`)}
            class:found-pink={highlightFound && foundPositions.has(`${i},${j}`)}
            style="width: {cellSize}px; height: {cellSize}px; text-align: center; vertical-align: middle; font-weight: bold; font-size: 1rem;"
          >
            {cell}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
<slot />

<style>
.puzzle-grid {
  border-collapse: collapse;
  table-layout: fixed;
}
td {
  border: 1px solid #d1d5db;
  background: white;
  user-select: none;
  padding: 0;
  box-sizing: border-box;
}
td.found {
  background: #fbbf24;
  color: #92400e;
}
td.found-pink {
  color: #be185d;
  font-weight: bold;
}
</style> 