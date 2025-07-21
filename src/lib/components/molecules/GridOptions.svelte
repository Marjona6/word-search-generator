<script lang="ts">
  export let showGridLines: boolean = true;
</script>

<div class="grid-options">
  <label>
    <input type="checkbox" bind:checked={showGridLines} /> Show grid lines
  </label>
</div>

<style>
.grid-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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