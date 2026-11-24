<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		title?: string;
		/** One line under the title explaining what the dialog is for. */
		description?: string;
		size?: 'sm' | 'md' | 'lg';
		/** Block closing (Escape, backdrop, X) while something is saving. */
		busy?: boolean;
		onclose?: () => void;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		open = $bindable(false),
		title,
		description,
		size = 'md',
		busy = false,
		onclose,
		children,
		footer
	}: Props = $props();

	const uid = $props.id();
	let panel = $state<HTMLDivElement>();
	let returnFocus: HTMLElement | null = null;

	function close() {
		if (busy) return;
		open = false;
		onclose?.();
	}

	// Move focus into the dialog when it opens and give it back when it
	// closes, so keyboard users don't lose their place in the page.
	$effect(() => {
		if (!open || !panel) return;
		returnFocus = document.activeElement as HTMLElement | null;
		const first = panel.querySelector<HTMLElement>(
			'[autofocus], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]):not([data-close]), a[href]'
		);
		(first ?? panel).focus();
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevOverflow;
			returnFocus?.focus?.();
		};
	});

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			close();
			return;
		}
		if (e.key !== 'Tab' || !panel) return;
		const focusables = [...panel.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
			(el) => !el.hasAttribute('disabled')
		);
		if (!focusables.length) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	const widths = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-xl' };
</script>

{#if open}
	<div class="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="presentation" {onkeydown}>
		<button
			type="button"
			class="absolute inset-0 cursor-default bg-ink/40"
			aria-label="Close dialog"
			tabindex="-1"
			data-close
			onclick={close}
			transition:fade={{ duration: 150 }}
		></button>
		<div
			bind:this={panel}
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? `${uid}-title` : undefined}
			aria-describedby={description ? `${uid}-desc` : undefined}
			tabindex="-1"
			class={cn(
				'relative flex max-h-[92dvh] w-full flex-col rounded-t-sheet bg-card shadow-pop outline-none sm:rounded-sheet',
				widths[size]
			)}
			transition:fly={{ y: 24, duration: 200, easing: cubicOut }}
		>
			{#if title}
				<header class="flex items-start gap-3 px-5 pt-5 pb-2 sm:px-6 sm:pt-6">
					<div class="min-w-0 flex-1">
						<h2 id="{uid}-title" class="text-heading text-[22px] text-ink">{title}</h2>
						{#if description}<p id="{uid}-desc" class="mt-1 text-sm text-ink-soft">{description}</p>{/if}
					</div>
					<button
						type="button"
						data-close
						onclick={close}
						disabled={busy}
						class="-mt-1 -mr-2 grid size-10 flex-none place-items-center rounded-full text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:opacity-40"
						aria-label="Close"
					>
						<X size={20} />
					</button>
				</header>
			{/if}
			{#if children}
				<div class="overflow-y-auto px-5 py-3 sm:px-6">
					{@render children()}
				</div>
			{/if}
			{#if footer}
				<footer class="flex flex-col-reverse gap-2 px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
					{@render footer()}
				</footer>
			{:else}
				<div class="h-4 sm:h-3"></div>
			{/if}
		</div>
	</div>
{/if}
