<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		name: string;
		/** Hex colour the user picked for the group (stored on the backend). */
		color?: string;
		/** `pill` sits on its own; `inline` reads as part of a meta line. */
		variant?: 'pill' | 'inline';
		class?: string;
	}

	let { name, color, variant = 'inline', class: className }: Props = $props();

	// The user's colour only paints the dot. Text stays ink-soft, so contrast
	// never depends on whatever colour is stored (older groups used bright
	// tints that fail AA as text).
	const dot = $derived(color && /^#[0-9a-f]{3,8}$/i.test(color) ? color : 'var(--color-ink-soft)');
</script>

<span
	class={cn(
		'inline-flex min-w-0 items-center gap-1.5 font-medium whitespace-nowrap text-ink-soft',
		variant === 'pill' ? 'rounded-pill bg-fog px-2.5 py-1 text-xs' : 'text-[inherit]',
		className
	)}
>
	<span class="size-2 flex-none rounded-full" style:background-color={dot} aria-hidden="true"></span>
	<span class="truncate">{name}</span>
</span>
