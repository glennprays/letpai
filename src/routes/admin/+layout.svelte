<script lang="ts">
	import { page } from '$app/state';
	import { FileText, LayoutDashboard, LogOut, MessageCircle, UserRound, Users } from 'lucide-svelte';
	import Logo from '$lib/components/layout/Logo.svelte';
	import { cn } from '$lib/utils/cn';
	import { adminRoleLabel } from '$lib/utils/admin';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const isSuperAdmin = $derived(data.profile?.role === 'super_admin');

	const nav = $derived([
		{ href: '/admin', icon: LayoutDashboard, label: 'Overview', exact: true },
		{ href: '/admin/whatsapp', icon: MessageCircle, label: 'WhatsApp', exact: false },
		{ href: '/admin/templates', icon: FileText, label: 'Templates', exact: false },
		...(isSuperAdmin ? [{ href: '/admin/admins', icon: Users, label: 'Admins', exact: false }] : []),
		{ href: '/admin/profile', icon: UserRound, label: 'Your account', exact: false }
	]);

	// Keep the current page's pill in view on the scrolling mobile nav.
	let mobileNav = $state<HTMLElement>();
	$effect(() => {
		void page.url.pathname;
		mobileNav?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	});

	function isActive(href: string, exact: boolean): boolean {
		const p = page.url.pathname;
		return exact ? p === href : p === href || p.startsWith(href + '/');
	}
</script>

{#snippet signOut(extra: string)}
	<form method="POST" action="/admin?/logout">
		<button
			type="submit"
			class={cn('inline-flex items-center gap-2 rounded-pill font-semibold text-card/75 transition-colors hover:bg-card/10 hover:text-card', extra)}
		>
			<LogOut size={16} aria-hidden="true" /> Sign out
		</button>
	</form>
{/snippet}

{#if !data.profile}
	{@render children()}
{:else}
	<a href="#admin-main" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-pill focus:bg-card focus:px-4 focus:py-2 focus:text-ink">
		Skip to content
	</a>

	<!-- Ink rail: the admin tools are visibly a different place from the
	     host app (fog sidebar), with the same type and spacing. -->
	<aside class="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col bg-ink px-3 py-6 md:flex">
		<div class="flex items-center gap-2.5 px-3 pb-8">
			<Logo size="sm" tone="light" href="/admin" />
			<span class="rounded-pill bg-card/10 px-2 py-0.5 text-[11px] font-semibold text-card">Admin</span>
		</div>

		<nav aria-label="Admin" class="flex flex-col gap-0.5">
			{#each nav as item (item.href)}
				{@const Icon = item.icon}
				{@const active = isActive(item.href, item.exact)}
				<a
					href={item.href}
					aria-current={active ? 'page' : undefined}
					class={cn(
						'flex h-10 items-center gap-3 rounded-pill px-3.5 text-sm font-semibold transition-colors duration-150',
						active ? 'bg-card text-ink' : 'text-card/70 hover:bg-card/10 hover:text-card'
					)}
				>
					<Icon size={17} aria-hidden="true" />
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="mt-auto px-3">
			<p class="truncate text-sm font-semibold text-card">{data.profile.full_name}</p>
			<p class="text-xs text-card/60">{adminRoleLabel(data.profile.role)}</p>
			{@render signOut('-ml-2 mt-3 h-9 px-2 text-sm')}
		</div>
	</aside>

	<!-- Mobile: ink bar with the name and sign out, then a scrolling pill row. -->
	<header class="sticky top-0 z-30 md:hidden">
		<div class="flex items-center gap-3 bg-ink px-4 py-3">
			<Logo size="sm" tone="light" href="/admin" markOnly />
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-semibold text-card">{data.profile.full_name}</p>
				<p class="text-[11px] text-card/60">{adminRoleLabel(data.profile.role)}</p>
			</div>
			{@render signOut('h-9 px-3 text-xs')}
		</div>
		<nav aria-label="Admin" bind:this={mobileNav} class="flex gap-1.5 overflow-x-auto bg-fog/95 px-3 py-2 backdrop-blur [scrollbar-width:none]">
			{#each nav as item (item.href)}
				{@const Icon = item.icon}
				{@const active = isActive(item.href, item.exact)}
				<a
					href={item.href}
					aria-current={active ? 'page' : undefined}
					class={cn(
						'inline-flex h-9 flex-none items-center gap-1.5 rounded-pill px-3 text-sm font-semibold transition-colors',
						active ? 'bg-ink text-card' : 'bg-card text-ink-soft shadow-[inset_0_0_0_1.5px_var(--color-hairline)] hover:text-ink'
					)}
				>
					<Icon size={15} aria-hidden="true" />
					{item.label}
				</a>
			{/each}
		</nav>
	</header>

	<main id="admin-main" class="min-h-dvh md:ml-56">
		<div class="mx-auto max-w-5xl px-4 pt-6 pb-12 sm:px-8 md:pt-10">
			{@render children()}
		</div>
	</main>
{/if}
