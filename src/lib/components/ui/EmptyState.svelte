<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import Button from './Button.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Lucide icon (used when no `art` snippet is given). */
		icon?: any;
		/** Illustration from $lib/components/art. */
		art?: Snippet;
		title?: string;
		description?: string;
		action?: { label: string; onclick?: () => void; href?: string; icon?: any };
		secondaryAction?: { label: string; onclick?: () => void; href?: string };
		class?: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let {
		icon,
		art,
		title = 'Nothing here yet',
		description,
		action,
		secondaryAction,
		class: className,
		size = 'md'
	}: Props = $props();

	const pad = { sm: 'py-8 px-5', md: 'py-12 px-6', lg: 'py-16 px-8' };
	const Icon = $derived(icon);
</script>

<!-- Dashed hairline frame echoes the receipt's tear line: an empty slot
     waiting for its first entry. -->
<div
	class={cn(
		'flex flex-col items-center rounded-card border-2 border-dashed border-hairline text-center',
		pad[size],
		className
	)}
>
	{#if art}
		<div class="mb-5 w-28">{@render art()}</div>
	{:else if Icon}
		<div class="mb-4 grid size-14 place-items-center rounded-full bg-mist text-ink-soft" aria-hidden="true">
			<Icon size={26} />
		</div>
	{/if}

	<h3 class="text-heading text-xl text-ink">{title}</h3>
	{#if description}
		<p class="mt-2 max-w-sm text-[15px] text-ink-soft">{description}</p>
	{/if}

	{#if action || secondaryAction}
		<div class="mt-6 flex flex-wrap justify-center gap-2">
			{#if action}
				<Button href={action.href} onclick={action.onclick} leftIcon={action.icon}>{action.label}</Button>
			{/if}
			{#if secondaryAction}
				<Button variant="secondary" href={secondaryAction.href} onclick={secondaryAction.onclick}>{secondaryAction.label}</Button>
			{/if}
		</div>
	{/if}
</div>
