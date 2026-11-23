<script lang="ts">
	import { page } from '$app/state';
	import { Plus } from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';
	import { APP_NAV, isActive } from './nav';

	let { class: className }: { class?: string } = $props();

	// Home, Sessions, [New], Contacts, Profile. The New button sits inside the
	// bar (not floating above it) so it never covers list content.
	const left = APP_NAV.slice(0, 2);
	const right = APP_NAV.slice(2);
</script>

{#snippet tab(nav: (typeof APP_NAV)[number])}
	{@const Icon = nav.icon}
	{@const active = isActive(nav.href, page.url.pathname)}
	<a
		href={nav.href}
		aria-current={active ? 'page' : undefined}
		class={cn(
			'flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-sheet text-[11px] font-semibold transition-colors',
			active ? 'text-ink' : 'text-ink-soft hover:text-ink'
		)}
	>
		<Icon size={21} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
		{nav.label}
	</a>
{/snippet}

<nav
	aria-label="Main"
	class={cn('fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 md:hidden', className)}
>
	<div class="flex items-center gap-1 rounded-sheet bg-card/95 p-1.5 shadow-float backdrop-blur">
		{#each left as nav (nav.href)}{@render tab(nav)}{/each}
		<a
			href="/sessions/new"
			aria-label="New session"
			aria-current={page.url.pathname === '/sessions/new' ? 'page' : undefined}
			class="mx-1 grid size-12 flex-none place-items-center rounded-full bg-coral text-card transition-colors hover:bg-coral-hover active:scale-95"
		>
			<Plus size={24} strokeWidth={2.4} aria-hidden="true" />
		</a>
		{#each right as nav (nav.href)}{@render tab(nav)}{/each}
	</div>
</nav>
