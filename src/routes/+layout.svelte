<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { auth, initAuth } from '$lib/stores/auth';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	// Create reactive state for auth data
	let authData = $state({
		isAuthenticated: data.isAuthenticated,
		token: data.token,
		user: data.user
	});

	// Update authData when data prop changes
	$effect(() => {
		authData = {
			isAuthenticated: data.isAuthenticated,
			token: data.token,
			user: data.user
		};
	});

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
	const navbarVariant = $derived.by(() => {
		const pathname = $page.url.pathname;

		// Auth pages get minimal navbar
		if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
			return 'auth';
		}
		// Protected pages get logged-in navbar if authenticated
		else if (authData.isAuthenticated && authData.token) {
			return 'loggedIn';
		}
		// Default to full navbar
		else {
			return 'full';
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar variant={navbarVariant} />

{@render children()}
