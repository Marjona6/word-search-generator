<script lang="ts">
  // No props yet; this is a layout shell for the form
</script>

<form class="puzzle-form">
  <slot name="wordlist" />
  <slot name="directions" />
  <slot name="gridoptions" />
  <slot name="actions" />
</form>

<style>
.puzzle-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 2rem;
  margin-bottom: 2rem;
}
</style> 