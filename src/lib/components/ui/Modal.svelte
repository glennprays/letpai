<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	interface Props {
		open?: boolean;
		title?: string;
		onclose?: () => void;
		children: import('svelte').Snippet;
	}

	let { open = $bindable(false), title, onclose, children }: Props = $props();

	let dialogElement = $state<HTMLDivElement>();

	function handleClose() {
		open = false;
		if (onclose) onclose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}

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
		class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#251818]/30 backdrop-blur-sm overflow-y-auto"
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'modal-title' : undefined}
		tabindex="-1"
	>
		<div
			class="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_32px_-4px_rgba(37,24,24,0.12)] transition-all max-h-[90vh] flex flex-col my-8"
			transition:fly={{ y: 20, duration: 200 }}
		>
			<!-- Header -->
			{#if title}
				<div class="flex items-center justify-between px-6 py-4 flex-shrink-0">
					<h2 id="modal-title" class="text-lg font-semibold text-[#251818]">{title}</h2>
					<button
						onclick={handleClose}
						class="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full hover:bg-[#fbe3e1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
						aria-label="Close modal"
					>
						<X class="w-5 h-5 text-[#584140]" />
					</button>
				</div>
			{/if}

			<!-- Content -->
			<div class="px-6 py-4 overflow-y-auto">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

