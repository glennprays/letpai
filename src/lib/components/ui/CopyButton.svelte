<script lang="ts">
	import { Copy, Check } from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		value: string;
		/** Accessible name, e.g. "Copy BCA account number". */
		label?: string;
		/** Show the word "Copy" next to the icon. */
		text?: boolean;
		class?: string;
	}

	let { value, label = 'Copy', text = false, class: className }: Props = $props();
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		// Copy digits only for account numbers typed with spaces ("5270 1234 88").
		const clean = /^[\d\s-]+$/.test(value) ? value.replace(/[\s-]/g, '') : value;
		try {
			await navigator.clipboard.writeText(clean);
		} catch {
			// Older in-app browsers: fall back to a hidden textarea.
			const ta = document.createElement('textarea');
			ta.value = clean;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			ta.remove();
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1800);
	}
</script>

<button
	type="button"
	onclick={copy}
	aria-label={text ? undefined : copied ? 'Copied' : label}
	class={cn(
		'inline-flex flex-none items-center justify-center gap-1.5 rounded-pill font-semibold transition-colors',
		text ? 'h-9 px-3.5 text-sm' : 'size-10',
		copied ? 'bg-paid-tint text-paid' : 'bg-fog text-ink hover:bg-mist',
		className
	)}
>
	{#if copied}<Check size={17} aria-hidden="true" />{:else}<Copy size={17} aria-hidden="true" />{/if}
	{#if text}<span>{copied ? 'Copied' : 'Copy'}</span>{/if}
	<span class="sr-only" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</span>
</button>
