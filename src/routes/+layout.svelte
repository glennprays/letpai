<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth';

	let { children } = $props();

	// Initialize auth on mount (client-side only)
	onMount(() => {
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('token');
			const userStr = localStorage.getItem('user');
			const user = userStr ? JSON.parse(userStr) : null;

			console.log('Root layout onMount - token:', !!token, 'user:', !!user);

			auth.set({
				token,
				user,
				isAuthenticated: !!token
			});
		}
	});

	// Determine navbar variant based on route and auth state
	const navbarVariant = $derived(() => {
		const pathname = $page.url.pathname;

		console.log('navbarVariant calc - pathname:', pathname, 'isAuth:', $auth.isAuthenticated, 'token:', !!$auth.token);

		// Auth pages get minimal navbar (only for login/register)
		if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
			return 'auth';
		}

		// Protected pages get logged-in navbar if authenticated
		if ($auth.isAuthenticated && $auth.token) {
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
