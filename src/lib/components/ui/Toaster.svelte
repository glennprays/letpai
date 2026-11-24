<script lang="ts">
	import { toasts, removeToast } from '$lib/stores/toast';
	import { X, CircleCheck, CircleAlert, TriangleAlert } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { cn } from '$lib/utils/cn';

	const meta = {
		success: { icon: CircleCheck, dot: 'text-lime' },
		error: { icon: CircleAlert, dot: 'text-coral-tint' },
		warning: { icon: TriangleAlert, dot: 'text-pending-tint' }
	} as const;
</script>

<!-- Ink toasts read on every surface; the icon colour carries the tone.
     Polite region for confirmations, assertive alert for errors. -->
<div
	class="pointer-events-none fixed inset-x-0 top-3 z-[70] flex flex-col items-center gap-2 px-3 sm:top-5"
	aria-live="polite"
>
	{#each $toasts as toast (toast.id)}
		{@const m = meta[toast.variant] ?? meta.success}
		{@const Icon = m.icon}
		<div
			class="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-card bg-ink py-3 pr-2 pl-4 text-card shadow-pop"
			role={toast.variant === 'error' ? 'alert' : 'status'}
			transition:fly={{ y: -12, duration: 160 }}
		>
			<Icon size={20} class={cn('mt-px flex-none', m.dot)} aria-hidden="true" />
			<p class="flex-1 text-sm leading-snug font-medium">{toast.message}</p>
			<button
				type="button"
				onclick={() => removeToast(toast.id)}
				class="-my-1 grid size-8 flex-none place-items-center rounded-full text-card/70 transition-colors hover:bg-card/10 hover:text-card"
				aria-label="Dismiss"
			>
				<X size={16} />
			</button>
		</div>
	{/each}
</div>
