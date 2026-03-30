<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { auth, initAuth } from '$lib/stores/auth';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	// Initialize auth store from server-provided data
	onMount(() => {
		// Use server-provided auth state if available, otherwise check localStorage
		if (data.isAuthenticated) {
			auth.set({
				token: data.token,
				user: data.user,
				isAuthenticated: true
			});
		} else {
			// Fallback to localStorage for client-only navigation
			initAuth();
		}
	});

	// Determine navbar variant based on route and auth state
	let currentVariant = $state('full');

	$effect(() => {
		const pathname = $page.url.pathname;

		// Auth pages get minimal navbar
		if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
			currentVariant = 'auth';
		}
		// Protected pages get logged-in navbar if authenticated
		else if (data.isAuthenticated && data.token) {
			currentVariant = 'loggedIn';
		}
		// Default to full navbar
		else {
			currentVariant = 'full';
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar variant={currentVariant} />

{@render children()}
