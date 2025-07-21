<script lang="ts">
  import PuzzleForm from './lib/components/organisms/PuzzleForm.svelte';
  import WordListInput from './lib/components/molecules/WordListInput.svelte';
  import DirectionOptions from './lib/components/molecules/DirectionOptions.svelte';
  import GridOptions from './lib/components/molecules/GridOptions.svelte';
  import SolutionOptions from './lib/components/molecules/SolutionOptions.svelte';
  import ActionButtons from './lib/components/molecules/ActionButtons.svelte';
  import PuzzleOutput from './lib/components/organisms/PuzzleOutput.svelte';
  import { generatePuzzle } from './lib/logic/puzzleGenerator';
  import type { DirectionOptions as DirOpts, PuzzleResult } from './lib/logic/types';

  // Svelte 5 runes
  let wordList = 'PUZZLE\nGENERATOR\nWORD\nSEARCH';
  let directions: DirOpts = { horizontal: true, vertical: true, diagonal: false, reverse: false };
  let showGridLines = true;
  let outlineFoundWords = true;
  let colorFoundWords = false;
  let hideOtherSolutionLetters = false;
  let gridSize = 12;
  let puzzleResult: PuzzleResult | null = null;
  let showSolution = false;
  let cellSize = 36;

  function handleGenerate() {
    const words = wordList.split(/\r?\n/).map(w => w.trim().toUpperCase()).filter(Boolean);
    puzzleResult = generatePuzzle(words, gridSize, directions);
    showSolution = false;
  }

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    // TODO: Implement PDF export using pdfExport.ts
    alert('PDF export not yet implemented.');
  }

  $: foundPositions = new Set(
    puzzleResult?.placedWordInfos.flatMap(info => {
      const pos = [];
      for (let i = 0; i < info.length; i++) {
        pos.push(`${info.startRow + i * info.dRow},${info.startCol + i * info.dCol}`);
      }
      return pos;
    }) ?? []
  );

  $: wordListArr = wordList.split(/\r?\n/).map(w => w.trim().toUpperCase()).filter(Boolean);

  // Generate initial puzzle on mount
  if (!puzzleResult) handleGenerate();
</script>

<main>
  <h1>Word Search Generator</h1>
  <PuzzleForm>
    <div slot="wordlist">
      <WordListInput bind:value={wordList} />
    </div>
    <div slot="directions">
      <DirectionOptions bind:directions={directions} />
    </div>
    <div slot="gridoptions">
      <GridOptions bind:showGridLines={showGridLines} />
      <label style="margin-left:1rem;">
        Grid Size:
        <input type="number" min="6" max="24" bind:value={gridSize} style="width:3rem; margin-left:0.5rem;" />
      </label>
    </div>
    <div slot="actions">
      <ActionButtons
        on:generate={handleGenerate}
        on:print={handlePrint}
        on:download={handleDownload}
      />
      <label style="margin-left:2rem;">
        <input type="checkbox" bind:checked={showSolution} /> Show Solution
      </label>
      {#if showSolution}
        <SolutionOptions
          bind:outlineFoundWords
          bind:colorFoundWords
          bind:hideOtherSolutionLetters
        />
      {/if}
    </div>
  </PuzzleForm>

  {#if puzzleResult}
    <PuzzleOutput
      grid={showSolution ? puzzleResult.solution : puzzleResult.puzzle}
      isSolution={showSolution}
      placedWordInfos={puzzleResult.placedWordInfos}
      cellSize={cellSize}
      showOverlay={showSolution && outlineFoundWords}
      colorFoundWords={showSolution && colorFoundWords}
      foundPositions={foundPositions}
      wordList={puzzleResult.placedWords}
      hideOtherSolutionLetters={showSolution && hideOtherSolutionLetters}
    />
    {#if puzzleResult.failedWords.length > 0}
      <div class="failed-words">
        <strong>Could not fit:</strong> {puzzleResult.failedWords.join(', ')}
      </div>
    {/if}
  {/if}
</main>

<style>
main {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
h1 {
  text-align: center;
  font-size: 2.2rem;
  color: #1e293b;
  margin-bottom: 2rem;
}
.failed-words {
  margin-top: 1.5rem;
  color: #b91c1c;
  font-size: 1.1rem;
  text-align: center;
}
</style>
