<script lang="ts">
  export let directions = {
    horizontal: true,
    vertical: true,
    diagonal: false,
    reverse: false
  };
</script>

<div class="direction-options">
  <label><input type="checkbox" bind:checked={directions.horizontal} /> Horizontal</label>
  <label><input type="checkbox" bind:checked={directions.vertical} /> Vertical</label>
  <label><input type="checkbox" bind:checked={directions.diagonal} /> Diagonal</label>
  <label><input type="checkbox" bind:checked={directions.reverse} /> Reverse</label>
</div>

<style>
.direction-options {
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