<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { auth, initAuth } from '$lib/stores/auth';

	let { children } = $props();

	// Initialize auth on mount (client-side only)
	onMount(() => {
		initAuth();
	});

	// Determine navbar variant based on route and auth state
	const navbarVariant = $derived(() => {
		const pathname = $page.url.pathname;

		// Auth pages get minimal navbar
		if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
			return 'auth';
		}

		// Protected pages get logged-in navbar if authenticated
		if ($auth.isAuthenticated) {
			return 'loggedIn';
		}

		// Default to full navbar
		return 'full';
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar variant={navbarVariant()} />

{@render children()}
