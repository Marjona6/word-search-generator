<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="action-buttons">
  <button type="button" class="generate" on:click={() => dispatch('generate')}>Generate Puzzle</button>
  <button type="button" class="print" on:click={() => dispatch('print')}>Print</button>
  <button type="button" class="download" on:click={() => dispatch('download')}>Download PDF</button>
</div>

<style>
.action-buttons {
  display: flex;
  gap: 1rem;
}
button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
button.generate {
  background: #2563eb;
  color: white;
}
button.generate:hover {
  background: #1d4ed8;
}
button.print {
  background: #10b981;
  color: white;
}
button.print:hover {
  background: #059669;
}
button.download {
  background: #a21caf;
  color: white;
}
button.download:hover {
  background: #701a75;
}
</style> 