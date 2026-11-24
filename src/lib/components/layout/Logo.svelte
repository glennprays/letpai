<script lang="ts">
	import { cn } from '$lib/utils/cn';

	export type Size = 'sm' | 'md' | 'lg';

	interface Props {
		size?: Size;
		/** `light` for dark backgrounds: the ink half and wordmark turn fog. */
		tone?: 'ink' | 'light';
		/** Link target. Pass null to render without a link. */
		href?: string | null;
		/** Hide the wordmark (mark only). */
		markOnly?: boolean;
		class?: string;
	}

	let { size = 'md', tone = 'ink', href = '/', markOnly = false, class: className }: Props = $props();

	const dims = { sm: { mark: 24, text: 'text-[20px]' }, md: { mark: 28, text: 'text-[23px]' }, lg: { mark: 40, text: 'text-[32px]' } };
	const d = $derived(dims[size]);
	const ink = $derived(tone === 'light' ? 'fill-fog' : 'fill-ink');
</script>

<!-- The torn ticket: one bill, torn into shares. Same perforated edge as the
     receipts in the app. -->
{#snippet body()}
	<svg width={d.mark} height={d.mark} viewBox="0 0 64 64" aria-hidden="true" class="flex-none">
		<path class={ink} d="M14 6h17l-4 11 6 11-5 11 5 11-3 9-3.5-3-4 3-4-3-4 3-4-3L8 59V12a6 6 0 0 1 6-6z" />
		<path class="fill-coral" d="M38 9h13a6 6 0 0 1 6 6v47l-3.5-3-4 3-4-3-4 3-4-3-3 2 3-9-5-11 5-11-6-11z" />
	</svg>
	{#if !markOnly}
		<span class={cn('font-display leading-none font-bold tracking-[-0.045em]', d.text, tone === 'light' ? 'text-fog' : 'text-ink')}>letpai</span>
	{/if}
{/snippet}

{#if href}
	<a {href} class={cn('inline-flex items-center gap-2 rounded-field', className)} aria-label="Letpai home">{@render body()}</a>
{:else}
	<span class={cn('inline-flex items-center gap-2', className)} role="img" aria-label="Letpai">{@render body()}</span>
{/if}
