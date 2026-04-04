<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		open?: boolean;
		title?: string;
		children: import('svelte').Snippet;
	}

	let { open = false, title, children }: Props = $props();

	let dialogElement: HTMLDialogElement;

	function handleClose() {
		open = false;
	}

	// Close on escape key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}

	// Close on backdrop click
	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogElement) {
			handleClose();
		}
	}
</script>

{#if open}
	<div
		bind:this={dialogElement}
		onkeydown={handleKeydown}
		onclick={handleBackdropClick}
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div
			class="w-full max-w-md bg-white rounded-xl shadow-xl transition-all"
			transition:fly={{ y: 20, duration: 200 }}
		>
			<!-- Header -->
			{#if title}
				<div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
					<h2 id="modal-title" class="text-lg font-semibold text-gray-900">{title}</h2>
					<button
						onclick={handleClose}
						class="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
						aria-label="Close modal"
					>
						<X class="w-4 h-4 text-gray-500" />
					</button>
				</div>
			{/if}

			<!-- Content -->
			<div class="px-6 py-4">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom select arrow for select elements in modal */
	select {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 0.75rem center;
		background-repeat: no-repeat;
		background-size: 1.5em 1.5em;
	}
</style>
