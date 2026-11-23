<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		label?: string;
		size?: 'sm' | 'md' | 'lg';
		/** Play the stamp-down motion on mount (skipped for reduced motion). */
		animate?: boolean;
		class?: string;
	}

	// The one lime element on a screen (see design/DECISION.md). Use it only
	// for a settled state: a paid participant, a fully collected session.
	let { label = 'Paid', size = 'md', animate = false, class: className }: Props = $props();

	const sizes = { sm: 'px-2.5 py-1 text-[11px] rounded-[7px]', md: 'px-3.5 py-1.5 text-[15px] rounded-[10px]', lg: 'px-5 py-2.5 text-2xl rounded-[14px]' };
</script>

<span
	class={cn(
		'stamp inline-grid place-items-center bg-lime font-display leading-none font-extrabold tracking-[0.08em] text-ink uppercase',
		'shadow-[inset_0_0_0_2px_var(--color-ink)]',
		sizes[size],
		animate && 'stamp-in',
		className
	)}
>
	{label}
</span>

<style>
	.stamp {
		rotate: -8deg;
	}
	.stamp-in {
		animation: stamp-in 260ms cubic-bezier(0.2, 1.4, 0.4, 1) both;
	}
	@keyframes stamp-in {
		from {
			opacity: 0;
			scale: 1.6;
			rotate: -14deg;
		}
	}
</style>
