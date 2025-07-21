<script lang="ts">
  export let outlineFoundWords: boolean = true;
  export let colorFoundWords: boolean = false;
  export let hideOtherSolutionLetters: boolean = false;
</script>

<div class="solution-options">
  <label><input type="checkbox" bind:checked={outlineFoundWords} /> Outline found words</label>
  <label><input type="checkbox" bind:checked={colorFoundWords} /> Show found words in different color</label>
  <label><input type="checkbox" bind:checked={hideOtherSolutionLetters} /> Hide other letters in solution</label>
</div>

<style>
.solution-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
label {
  font-size: 1rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
input[type="checkbox"] {
  accent-color: #2563eb;
}
</style> 