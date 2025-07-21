<script lang="ts">
  export let value: string = '';
</script>

<div class="wordlist-input">
  <label for="wordList">Enter your words (one per line):</label>
  <textarea
    id="wordList"
    rows={6}
    bind:value
    placeholder="Enter words here, one per line...\nExample:\nPUZZLE\nGENERATOR\nWORD\nSEARCH"
  ></textarea>
</div>

<style>
.wordlist-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
label {
  font-weight: 500;
  color: #374151;
}
textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
}
</style> 