<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		/** Inner padding. `none` for lists that pad their own rows. */
		padding?: 'none' | 'sm' | 'md' | 'lg';
		/** Makes the whole card a button. */
		onclick?: () => void;
		/** Makes the whole card a link. */
		href?: string;
		label?: string;
		children: Snippet;
	}

	let { class: className, padding = 'md', onclick, href, label, children }: Props = $props();

	const pad = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' };
	const interactive = 'block w-full text-left transition-[box-shadow,transform] duration-150 hover:shadow-float active:scale-[0.995]';
	const classes = $derived(cn('bg-card rounded-card shadow-raised', pad[padding], (onclick || href) && interactive, className));
</script>

{#if href}
	<a {href} class={classes} aria-label={label}>{@render children()}</a>
{:else if onclick}
	<button type="button" class={classes} {onclick} aria-label={label}>{@render children()}</button>
{:else}
	<div class={classes}>{@render children()}</div>
{/if}
