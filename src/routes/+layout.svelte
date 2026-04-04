<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { auth, initAuth } from '$lib/stores/auth';
	import type { LayoutData } from './$types';

	interface Props {
		children: import('svelte').Snippet;
		data: LayoutData;
	}

	let { children, data }: Props = $props();

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
		if (data.isAuthenticated && data.token) {
			// IMPORTANT: Sync server token to localStorage for client-side API calls
			if (!localStorage.getItem('token')) {
				localStorage.setItem('token', data.token);
			}
			if (data.user && !localStorage.getItem('user')) {
				localStorage.setItem('user', JSON.stringify(data.user));
			}

			auth.set({
				token: data.token,
				user: data.user,
				isAuthenticated: true
			});
		} else {
			// Fallback to cookies for client-side navigation
			const cookieToken = document.cookie
				.split('; ')
				.find(row => row.startsWith('token='))
				?.split('=')[1];
			const cookieUser = document.cookie
				.split('; ')
				.find(row => row.startsWith('user='))
				?.split('=')[1];

			initAuth(cookieToken || null, cookieUser || null);
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
