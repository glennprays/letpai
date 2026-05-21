<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import BottomTabBar from '$lib/components/layout/BottomTabBar.svelte';

  interface Props {
    children: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  // Force users without a full name onto /profile until they fill it in.
  // (app)/ routes are the only ones this layout renders, so checking the
  // pathname against /profile is enough to avoid a self-redirect loop —
  // /login and /register live under (auth)/+layout.svelte.
  // (We intentionally do NOT cache a "redirected once" flag: SvelteKit
  // reuses the layout instance across in-group navigations, so a flag
  // would let users bypass the gate by clicking Sidebar/BottomTabBar links.)
  $effect(() => {
    if ($auth.isAuthenticated && $auth.user && !$auth.user.full_name) {
      if ($page.url.pathname !== '/profile') {
        goto('/profile', { replaceState: true });
      }
    }
  });
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
