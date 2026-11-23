<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';

	interface Props {
		open?: boolean;
		title?: string;
		message?: string;
		confirmText?: string;
		cancelText?: string;
		/** danger: irreversible (red). warning: needs care (coral). info: neutral (ink). */
		variant?: 'danger' | 'warning' | 'info';
		loading?: boolean;
		onconfirm?: () => void;
		oncancel?: () => void;
	}

	let {
		open = $bindable(false),
		title = 'Are you sure?',
		message = '',
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		variant = 'danger',
		loading = false,
		onconfirm,
		oncancel
	}: Props = $props();

	const confirmVariant = $derived(variant === 'danger' ? 'destructive' : variant === 'warning' ? 'primary' : 'ink');

	function cancel() {
		oncancel?.();
		open = false;
	}
	function confirm() {
		onconfirm?.();
		open = false;
	}
</script>

<Modal bind:open {title} description={message || undefined} size="sm" busy={loading} onclose={() => oncancel?.()}>
	{#snippet footer()}
		<Button variant="secondary" onclick={cancel} disabled={loading}>{cancelText}</Button>
		<Button variant={confirmVariant} onclick={confirm} {loading}>{confirmText}</Button>
	{/snippet}
</Modal>
