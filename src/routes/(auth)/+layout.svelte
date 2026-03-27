<script lang="ts">
  let { children } = $props();
</script>

<div
  style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #FAFAFA; padding: 24px; font-family: 'Plus Jakarta Sans', sans-serif;"
>
  <div style="width: 100%; max-width: 400px;">
    {@render children()}
  </div>
</div>
