<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';
	import { cn } from '$lib/utils/cn';
	import { Undo2 } from 'lucide-svelte';

	interface Props {
		open: boolean;
		participantName?: string | null;
		submitting?: boolean;
		// Minimum length is enforced server-side (5 chars per the approve/reject
		// use case); mirrored here so the host gets inline feedback.
		minLength?: number;
		maxLength?: number;
		onsubmit: (reason: string) => void;
		oncancel: () => void;
	}

	let { open, participantName, submitting = false, minLength = 5, maxLength = 500, onsubmit, oncancel }: Props = $props();

	const uid = $props.id();
	let reason = $state('');
	let touched = $state(false);

	// Quick reasons cover most send-backs; tapping one fills the field.
	const quick = [
		'The screenshot is cut off. Please send the full one.',
		'The amount does not match your share.',
		'I cannot see the transfer date or reference.'
	];

	// Reset every time it opens so one person's note never leaks into the next.
	$effect(() => {
		if (open) {
			reason = '';
			touched = false;
		}
	});

	const trimmed = $derived(reason.trim());
	const remaining = $derived(maxLength - reason.length);
	const problem = $derived(
		trimmed.length === 0 ? 'Write a short note so they know what to fix.' : trimmed.length < minLength ? `Use at least ${minLength} characters.` : ''
	);
	const canSubmit = $derived(!problem && reason.length <= maxLength && !submitting);

	function submit() {
		if (!canSubmit) {
			touched = true;
			return;
		}
		onsubmit(trimmed);
	}

	function onkeydown(e: KeyboardEvent) {
		// Cmd/Ctrl-Enter submits, like most comment boxes.
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			submit();
		}
	}
</script>

<Modal
	{open}
	title="Send the proof back"
	description={participantName
		? `${participantName} will see your note on their payment page and can upload a new screenshot.`
		: 'They will see your note on their payment page and can upload a new screenshot.'}
	busy={submitting}
	onclose={oncancel}
>
	<div class="flex flex-wrap gap-2 pb-3">
		{#each quick as q (q)}
			<button
				type="button"
				onclick={() => (reason = q)}
				class={cn(
					'rounded-pill px-3 py-1.5 text-left text-[13px] font-medium transition-colors',
					reason === q ? 'bg-ink text-card' : 'bg-mist text-ink hover:bg-hairline'
				)}
			>
				{q}
			</button>
		{/each}
	</div>

	<label for="{uid}-reason" class="text-sm font-semibold text-ink">Your note</label>
	<textarea
		id="{uid}-reason"
		bind:value={reason}
		rows="3"
		maxlength={maxLength}
		onblur={() => (touched = true)}
		{onkeydown}
		disabled={submitting}
		aria-invalid={(touched && !!problem) || undefined}
		aria-describedby="{uid}-hint"
		placeholder="What should they fix?"
		class={cn(
			'mt-1.5 w-full resize-none rounded-field bg-card px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/70',
			'shadow-[inset_0_0_0_1.5px_var(--color-hairline)] focus:shadow-[inset_0_0_0_2px_var(--color-steel)] focus:outline-none',
			touched && problem && 'shadow-[inset_0_0_0_2px_var(--color-rejected)]'
		)}
	></textarea>
	<div id="{uid}-hint" class="mt-1 flex justify-between gap-3 text-[13px]">
		<span class={touched && problem ? 'text-rejected' : 'text-ink-soft'}>{touched && problem ? problem : 'They get this on WhatsApp too.'}</span>
		<span class={cn('tabular-nums', remaining < 50 ? 'text-pending' : 'text-ink-soft')}>{remaining}</span>
	</div>

	{#snippet footer()}
		<Button variant="secondary" onclick={oncancel} disabled={submitting}>Cancel</Button>
		<Button variant="ink" leftIcon={Undo2} onclick={submit} loading={submitting}>Send back</Button>
	{/snippet}
</Modal>
