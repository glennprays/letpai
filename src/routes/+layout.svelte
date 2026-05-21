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

	// Initialize auth store from server-provided data
	onMount(() => {
		if (data.isAuthenticated && data.token) {
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

	// Only show Navbar for public/auth pages (not app pages which have Sidebar)
	const isAppPage = $derived($page.route.id?.startsWith('/(app)') ?? false);

	const navbarVariant = $derived.by(() => {
		if (isAppPage) return null;
		const pathname = $page.url.pathname;
		if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
			return 'auth';
		} else if (data.isAuthenticated && data.token) {
			return 'loggedIn';
		} else {
			return 'full';
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if navbarVariant}
	<Navbar variant={navbarVariant} />
{/if}

{@render children()}
