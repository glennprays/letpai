<script lang="ts">
  import { User } from 'lucide-svelte';
  import { user, auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  interface Props {
    children: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  // Redirect to profile if user doesn't have a full name
  $effect(() => {
    if ($auth.isAuthenticated && $auth.user && !$auth.user.full_name) {
      const currentPath = $page.url.pathname;
      // Don't create redirect loops
      if (currentPath !== '/profile' && currentPath !== '/login' && currentPath !== '/register') {
        goto('/profile', { replaceState: true });
      }
    }
  });
</script>

<div class="min-h-screen flex flex-col">
  <main>
    {@render children()}
  </main>
</div>
