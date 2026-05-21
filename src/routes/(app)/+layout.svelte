<script lang="ts">
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import BottomTabBar from '$lib/components/layout/BottomTabBar.svelte';

  interface Props {
    children: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  // Auth + profile-completion gating happens server-side in +layout.server.ts.
</script>

<div class="min-h-screen bg-[#fff8f7]">
  <!-- Desktop sidebar -->
  <Sidebar />

  <!-- Main content area: offset by sidebar on desktop -->
  <main class="md:ml-60 pb-20 md:pb-0">
    {@render children()}
  </main>

  <!-- Mobile bottom tabs -->
  <BottomTabBar />
</div>
