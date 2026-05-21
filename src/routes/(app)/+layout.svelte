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

  // Redirect once if user is authenticated but missing a full name.
  // (app)/ routes are the only ones this layout renders, so checking
  // for /profile is sufficient — /login and /register live elsewhere.
  let redirected = $state(false);
  $effect(() => {
    if (redirected) return;
    if ($auth.isAuthenticated && $auth.user && !$auth.user.full_name) {
      if ($page.url.pathname !== '/profile') {
        redirected = true;
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
