<script lang="ts">
	import { ThumbsDown, Loader2, X } from 'lucide-svelte';

	interface Props {
		open: boolean;
		participantName?: string | null;
		submitting?: boolean;
		// Minimum length is enforced server-side (5 chars per the
		// approve/reject use case); we mirror it here so the host gets
		// inline feedback instead of a toast after submit.
		minLength?: number;
		maxLength?: number;
		onsubmit: (reason: string) => void;
		oncancel: () => void;
	}

	let {
		open,
		participantName,
		submitting = false,
		minLength = 5,
		maxLength = 500,
		onsubmit,
		oncancel
	}: Props = $props();

	let reason = $state('');
	let touched = $state(false);

	// Reset the field every time the modal opens so a previous
	// request's draft doesn't bleed into the next one.
	$effect(() => {
		if (open) {
			reason = '';
			touched = false;
		}
	});

	const trimmed = $derived(reason.trim());
	const remaining = $derived(maxLength - reason.length);
	const tooShort = $derived(trimmed.length > 0 && trimmed.length < minLength);
	const canSubmit = $derived(trimmed.length >= minLength && reason.length <= maxLength && !submitting);

	function handleSubmit() {
		if (!canSubmit) {
			touched = true;
			return;
		}
		onsubmit(trimmed);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && !submitting) {
			e.preventDefault();
			oncancel();
		}
		// Cmd/Ctrl-Enter submits — power-user shortcut, mirrors the
		// behaviour of most note/comment composers.
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
		role="dialog"
		aria-modal="true"
		aria-labelledby="reject-reason-title"
		onkeydown={handleKeydown}
		tabindex="-1"
	>
		<div
			class="relative w-full max-w-md bg-white rounded-3xl shadow-[0_24px_48px_-4px_rgba(37,24,24,0.18)] p-5"
			role="document"
		>
			<div class="flex items-start gap-3 mb-4">
				<div class="w-10 h-10 rounded-2xl bg-[#F59E0B]/15 flex items-center justify-center flex-shrink-0">
					<ThumbsDown class="w-5 h-5 text-[#92400E]" />
				</div>
				<div class="flex-1 min-w-0">
					<h2 id="reject-reason-title" class="text-base font-semibold text-[#251818]">
						Request an update
					</h2>
					<p class="text-xs text-[#584140] mt-0.5">
						{participantName ? `Tell ${participantName} what to fix` : 'Tell the participant what to fix'} — they'll see this on their payment page.
					</p>
				</div>
				<button
					type="button"
					onclick={oncancel}
					disabled={submitting}
					aria-label="Close"
					class="text-[#584140] hover:text-[#251818] disabled:opacity-50 p-1 -m-1"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<label class="block">
				<span class="text-xs font-semibold text-[#584140] uppercase tracking-wide">Reason</span>
				<textarea
					bind:value={reason}
					rows="4"
					maxlength={maxLength}
					onblur={() => (touched = true)}
					disabled={submitting}
					placeholder="e.g. The transfer screenshot is cut off — could you re-take it including the timestamp?"
					class="mt-1 w-full px-3 py-2.5 bg-[#fff0ef]/50 rounded-2xl text-sm text-[#251818] placeholder:text-[#584140]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] resize-none disabled:bg-[#fff0ef]"
				></textarea>
			</label>

			<div class="mt-1 flex items-center justify-between text-[11px]">
				{#if touched && tooShort}
					<span class="text-[#991B1B]">At least {minLength} characters.</span>
				{:else if touched && trimmed.length === 0}
					<span class="text-[#991B1B]">Enter a short note.</span>
				{:else}
					<span class="text-[#584140]/70">Min {minLength}, max {maxLength}.</span>
				{/if}
				<span class={remaining < 50 ? 'text-[#92400E]' : 'text-[#584140]/70'}>
					{remaining} left
				</span>
			</div>

			<div class="mt-5 flex gap-2 justify-end">
				<button
					type="button"
					onclick={oncancel}
					disabled={submitting}
					class="px-4 py-2 rounded-2xl text-sm font-medium text-[#251818] hover:bg-[#fff0ef] disabled:opacity-50 transition-colors"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleSubmit}
					disabled={!canSubmit}
					class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-[#92400E] bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{#if submitting}
						<Loader2 class="w-4 h-4 animate-spin" />
					{:else}
						<ThumbsDown class="w-4 h-4" />
					{/if}
					Request update
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
