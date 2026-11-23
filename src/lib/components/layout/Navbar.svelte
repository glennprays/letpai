<script lang="ts">
	import { page } from '$app/state';
	import { Menu, X, ArrowRight } from 'lucide-svelte';
	import Logo from './Logo.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import { auth } from '$lib/stores/auth';
	import { cn } from '$lib/utils/cn';
	import { fly } from 'svelte/transition';

	let { variant = 'full' }: { variant?: 'full' | 'auth' | 'loggedIn' } = $props();
	let menuOpen = $state(false);

	const links = [
		{ href: '/#how', label: 'How it works' },
		{ href: '/about', label: 'About' }
	];

	// On sign-in pages the only useful jump is to the other auth page.
	const authSwap = $derived(
		page.url.pathname.startsWith('/login') ? { href: '/register', label: 'Create an account' } : { href: '/login', label: 'Sign in' }
	);

	$effect(() => {
		void page.url.pathname;
		menuOpen = false;
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (menuOpen = false)} />

<header class="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
	<div
		class={cn(
			'pointer-events-auto mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-sheet bg-card/90 pr-2 pl-5 shadow-float backdrop-blur-md',
			variant === 'auth' && 'max-w-3xl'
		)}
	>
		<Logo size="sm" href="/" />

		{#if variant === 'auth'}
			<div class="flex items-center gap-1">
				<a href="/" class="hidden h-10 items-center rounded-pill px-4 text-sm font-semibold text-ink-soft hover:text-ink sm:inline-flex">Home</a>
				<Button href={authSwap.href} variant="secondary" size="sm">{authSwap.label}</Button>
			</div>
		{:else}
			<nav aria-label="Site" class="hidden items-center gap-1 md:flex">
				{#each links as l (l.href)}
					<a href={l.href} class="inline-flex h-10 items-center rounded-pill px-4 text-[15px] font-semibold text-ink-soft transition-colors hover:text-ink">{l.label}</a>
				{/each}
				{#if variant === 'full'}
					<a href="/login" class="inline-flex h-10 items-center rounded-pill px-4 text-[15px] font-semibold text-ink-soft transition-colors hover:text-ink">Sign in</a>
				{/if}
			</nav>

			<div class="flex items-center gap-2">
				{#if variant === 'loggedIn'}
					<Button href="/dashboard" variant="ink" size="sm" rightIcon={ArrowRight}>Open Letpai</Button>
					{#if $auth.user}
						<a href="/profile" class="hidden sm:block" aria-label="Your profile">
							<Avatar size="sm" src={$auth.user.avatar_url} fullName={$auth.user.full_name} phoneNumber={$auth.user.whatsapp_number} identifier={$auth.user.user_id} />
						</a>
					{/if}
				{:else}
					<Button href="/register" variant="ink" size="sm" class="hidden sm:inline-flex">Start a split</Button>
				{/if}
				<button
					type="button"
					class="grid size-10 place-items-center rounded-full text-ink hover:bg-mist md:hidden"
					aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={menuOpen}
					aria-controls="site-menu"
					onclick={() => (menuOpen = !menuOpen)}
				>
					{#if menuOpen}<X size={22} />{:else}<Menu size={22} />{/if}
				</button>
			</div>
		{/if}
	</div>

	{#if menuOpen}
		<nav
			id="site-menu"
			aria-label="Site"
			class="pointer-events-auto mx-auto mt-2 flex max-w-6xl flex-col rounded-sheet bg-card p-3 shadow-float md:hidden"
			transition:fly={{ y: -8, duration: 150 }}
		>
			{#each links as l (l.href)}
				<a href={l.href} class="rounded-card px-4 py-3 text-base font-semibold text-ink hover:bg-fog">{l.label}</a>
			{/each}
			{#if variant === 'full'}
				<a href="/login" class="rounded-card px-4 py-3 text-base font-semibold text-ink hover:bg-fog">Sign in</a>
				<Button href="/register" class="mt-2 w-full">Start a split, it's free</Button>
			{:else}
				<Button href="/dashboard" variant="ink" class="mt-2 w-full">Open Letpai</Button>
			{/if}
		</nav>
	{/if}
</header>
