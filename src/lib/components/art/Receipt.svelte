<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Which edges are torn. Bottom by default, like a till receipt. */
		edge?: 'bottom' | 'top' | 'both';
		/** Slight rotation for editorial moments (landing, OG). App screens stay straight. */
		tilt?: number;
		/** Lift off the page with a floating shadow (default: a resting shadow). */
		float?: boolean;
		class?: string;
		/** Classes for the paper itself (padding, background). */
		paperClass?: string;
		children: Snippet;
	}

	let { edge = 'bottom', tilt = 0, float = false, class: className, paperClass, children }: Props = $props();

	// Half-circle perforations punched with a radial-gradient mask. A mask also
	// clips box-shadow, so the shadow comes from a drop-shadow filter on the
	// wrapper instead.
	const hole = (y: string) => `radial-gradient(circle 7px at 50% ${y}, #0000 98%, #000) 0 0 / 18px 100% repeat-x`;
	const mask = $derived(edge === 'bottom' ? hole('100%') : edge === 'top' ? hole('0') : `${hole('100%')}, ${hole('0')}`);
	const composite = $derived(edge === 'both' ? 'intersect' : 'add');
</script>

<div
	class={cn(float ? 'drop-shadow-[0_9px_25px_rgba(29,36,66,0.12)]' : 'drop-shadow-[0_1px_3px_rgba(29,36,66,0.08)]', className)}
	style:transform={tilt ? `rotate(${tilt}deg)` : undefined}
>
	<div
		class={cn(
			'bg-card px-5 pt-5 pb-8 sm:px-6',
			edge === 'bottom' && 'rounded-t-card',
			edge === 'top' && 'rounded-b-card pt-8',
			edge === 'both' && 'pt-8',
			paperClass
		)}
		style:mask
		style:-webkit-mask={mask}
		style:mask-composite={composite}
		style:-webkit-mask-composite={edge === 'both' ? 'source-in' : 'source-over'}
	>
		{@render children()}
	</div>
</div>
