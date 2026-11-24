<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Tone } from '$lib/utils/status';
	import type { Snippet } from 'svelte';

	interface Props {
		tone?: Tone;
		/** Show the leading status dot (default true). */
		dot?: boolean;
		class?: string;
		children: Snippet;
	}

	let { tone = 'neutral', dot = true, class: className, children }: Props = $props();

	const tones: Record<Tone, string> = {
		pending: 'bg-pending-tint text-pending',
		review: 'bg-review-tint text-review',
		paid: 'bg-paid-tint text-paid',
		rejected: 'bg-rejected-tint text-rejected',
		accent: 'bg-coral-tint text-coral-ink',
		neutral: 'bg-mist text-ink-soft'
	};
</script>

<span
	class={cn(
		'inline-flex h-6 items-center gap-1.5 rounded-pill px-2.5 text-xs font-semibold whitespace-nowrap',
		tones[tone],
		className
	)}
>
	{#if dot}<span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>{/if}
	{@render children()}
</span>
