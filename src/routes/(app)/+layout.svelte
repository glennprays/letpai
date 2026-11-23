<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import BottomTabBar from '$lib/components/layout/BottomTabBar.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Auth + profile-completion gating happens server-side in +layout.server.ts.
</script>

<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-card">
	Skip to content
</a>

<div class="min-h-dvh bg-fog">
	<Sidebar />
	<!-- Bottom padding clears the floating tab bar plus the safe area on phones. -->
	<main id="main" class="pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:ml-60 md:pb-0">
		{@render children()}
	</main>
	<BottomTabBar />
</div>
