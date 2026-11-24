<script lang="ts">
	import StatusPill from './StatusPill.svelte';
	import type { Tone } from '$lib/utils/status';
	import type { Snippet } from 'svelte';

	// Legacy API kept for existing call sites; new code uses StatusPill + utils/status.
	type BadgeVariant = 'pending' | 'submitted' | 'paid' | 'rejected' | 'active' | 'completed' | 'cancelled';

	interface Props {
		variant: BadgeVariant;
		class?: string;
		children: Snippet;
	}

	let { variant, class: className, children }: Props = $props();

	const toneOf: Record<BadgeVariant, Tone> = {
		pending: 'pending',
		submitted: 'review',
		paid: 'paid',
		rejected: 'rejected',
		active: 'accent',
		completed: 'paid',
		cancelled: 'neutral'
	};
</script>

<StatusPill tone={toneOf[variant]} class={className}>{@render children()}</StatusPill>
