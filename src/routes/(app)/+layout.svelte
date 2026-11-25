<script lang="ts">
	import { navigating } from '$app/state';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import BottomTabBar from '$lib/components/layout/BottomTabBar.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Auth + profile-completion gating happens server-side in +layout.server.ts.
</script>

<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-card">
	Skip to content
</a>

{#if navigating.to}
	<div class="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-mist" aria-live="polite" aria-label="Loading next page">
		<div class="h-full w-2/5 animate-pulse rounded-r-pill bg-coral"></div>
	</div>
{/if}

<div class="min-h-dvh bg-fog">
	<Sidebar />
	<!-- Bottom padding clears the floating tab bar plus the safe area on phones. -->
	<main id="main" class="pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:ml-60 md:pb-0">
		{@render children()}
	</main>
	<BottomTabBar />
</div>
