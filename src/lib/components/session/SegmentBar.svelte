<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		paid: number;
		/** Proofs waiting for the host. */
		review?: number;
		/** Proofs sent back. */
		rejected?: number;
		total: number;
		size?: 'sm' | 'md';
		class?: string;
	}

	let { paid, review = 0, rejected = 0, total, size = 'md', class: className }: Props = $props();

	// One segment per person reads like ticking people off; past 16 people
	// the segments get too thin, so it becomes one continuous bar.
	const perPerson = $derived(total > 0 && total <= 16);
	const segments = $derived(
		Array.from({ length: total }, (_, i) => (i < paid ? 'paid' : i < paid + review ? 'review' : i < paid + review + rejected ? 'rejected' : 'todo'))
	);
	const colour = { paid: 'bg-ink', review: 'bg-review/60', rejected: 'bg-rejected/50', todo: 'bg-hairline' };
	const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
	const label = $derived(`${paid} of ${total} paid${review ? `, ${review} to check` : ''}${rejected ? `, ${rejected} sent back` : ''}`);
</script>

<div role="img" aria-label={label} class={cn('flex w-full', size === 'sm' ? 'h-1.5 gap-0.5' : 'h-2.5 gap-[3px]', className)}>
	{#if total === 0}
		<span class="flex-1 rounded-[3px] bg-hairline"></span>
	{:else if perPerson}
		{#each segments as seg, i (i)}
			<span class={cn('flex-1 rounded-[3px]', colour[seg as keyof typeof colour])}></span>
		{/each}
	{:else}
		<span class="flex w-full overflow-hidden rounded-[3px] bg-hairline">
			<span class="bg-ink" style:width="{pct(paid)}%"></span>
			<span class="bg-review/60" style:width="{pct(review)}%"></span>
			<span class="bg-rejected/50" style:width="{pct(rejected)}%"></span>
		</span>
	{/if}
</div>
