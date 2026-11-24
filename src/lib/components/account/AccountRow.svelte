<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { ChevronRight } from 'lucide-svelte';

	interface Props {
		label: string;
		/** One line under the label. */
		detail?: string;
		/** Right-aligned value for read-only facts, e.g. "IDR". */
		value?: string;
		icon?: any;
		href?: string;
		onclick?: () => void;
		/** Red text, for sign out and other leave-the-app actions. */
		danger?: boolean;
	}

	let { label, detail, value, icon, href, onclick, danger = false }: Props = $props();
	const Icon = $derived(icon);
	const interactive = $derived(!!href || !!onclick);

	const rowClass = $derived(
		cn(
			'flex w-full items-center gap-3.5 px-4 py-3.5 text-left sm:px-5',
			interactive && 'transition-colors duration-150 hover:bg-fog/70 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-steel'
		)
	);
</script>

{#snippet content()}
	{#if Icon}
		<span class={cn('grid size-9 flex-none place-items-center rounded-full', danger ? 'bg-rejected-tint text-rejected' : 'bg-fog text-ink')}>
			<Icon size={18} aria-hidden="true" />
		</span>
	{/if}
	<span class="min-w-0 flex-1">
		<span class={cn('block font-semibold', danger ? 'text-rejected' : 'text-ink')}>{label}</span>
		{#if detail}<span class="mt-0.5 block text-sm text-ink-soft">{detail}</span>{/if}
	</span>
	{#if value}<span class="flex-none text-sm font-semibold text-ink-soft tabular-nums">{value}</span>{/if}
	{#if href}<ChevronRight size={18} class="flex-none text-ink-soft" aria-hidden="true" />{/if}
{/snippet}

<li>
	{#if href}
		<a {href} class={rowClass}>{@render content()}</a>
	{:else if onclick}
		<button type="button" {onclick} class={rowClass}>{@render content()}</button>
	{:else}
		<div class={rowClass}>{@render content()}</div>
	{/if}
</li>
