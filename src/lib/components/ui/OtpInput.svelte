<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { CircleAlert } from 'lucide-svelte';

	interface Props {
		/** The code typed so far (digits only). Two-way bound. */
		value?: string;
		length?: number;
		label?: string;
		error?: string;
		disabled?: boolean;
		autofocus?: boolean;
		/** Called once every box is filled. */
		oncomplete?: (code: string) => void;
	}

	let { value = $bindable(''), length = 6, label = 'Code', error, disabled = false, autofocus = false, oncomplete }: Props = $props();

	const uid = $props.id();
	let boxes = $state<HTMLInputElement[]>([]);
	const digits = $derived(Array.from({ length }, (_, i) => value[i] ?? ''));

	// The code fills left to right with no gaps: typing at a box replaces it
	// and everything after; clearing a box clears it and everything after.
	function setFrom(index: number, raw: string) {
		const incoming = raw.replace(/\D/g, '');
		const at = Math.min(index, value.length);
		value = (value.slice(0, at) + incoming).slice(0, length);
		const next = Math.min(incoming ? value.length : at, length - 1);
		boxes[next]?.focus();
		if (incoming && value.length === length) oncomplete?.(value);
	}

	// Typing over a filled box gives two characters: keep the new one.
	// Three or more means autofill (iOS/Android SMS-style codes): spread them.
	function oninput(e: Event, i: number) {
		const el = e.currentTarget as HTMLInputElement;
		const v = el.value.replace(/\D/g, '');
		el.value = digits[i];
		setFrom(i, v.length <= 2 ? v.slice(-1) : v);
	}

	function onkeydown(e: KeyboardEvent, i: number) {
		if (e.key === 'Backspace' && !digits[i] && i > 0) {
			e.preventDefault();
			value = value.slice(0, i - 1);
			boxes[i - 1]?.focus();
		} else if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1]?.focus();
		else if (e.key === 'ArrowRight' && i < length - 1) boxes[i + 1]?.focus();
	}

	function onpaste(e: ClipboardEvent, i: number) {
		e.preventDefault();
		setFrom(i, e.clipboardData?.getData('text') ?? '');
	}
</script>

<fieldset class="flex flex-col gap-2" aria-describedby={error ? `${uid}-err` : undefined}>
	<legend class="mb-2 text-sm font-semibold text-ink">{label}</legend>
	<div class="flex gap-2">
		{#each digits as d, i (i)}
			<!-- svelte-ignore a11y_autofocus -->
			<input
				bind:this={boxes[i]}
				value={d}
				inputmode="numeric"
				autocomplete={i === 0 ? 'one-time-code' : 'off'}
				maxlength={length}
				{disabled}
				autofocus={autofocus && i === 0}
				aria-label="Digit {i + 1} of {length}"
				aria-invalid={!!error || undefined}
				class={cn(
					'text-amount h-14 w-full min-w-0 rounded-field bg-card text-center text-2xl text-ink transition-shadow',
					'shadow-[inset_0_0_0_1.5px_var(--color-hairline)] focus:shadow-[inset_0_0_0_2px_var(--color-steel)] focus:outline-none',
					d && 'shadow-[inset_0_0_0_1.5px_var(--color-ink-soft)]',
					error && 'shadow-[inset_0_0_0_2px_var(--color-rejected)]'
				)}
				oninput={(e) => oninput(e, i)}
				onkeydown={(e) => onkeydown(e, i)}
				onpaste={(e) => onpaste(e, i)}
				onfocus={(e) => (e.currentTarget as HTMLInputElement).select()}
			/>
		{/each}
	</div>
	{#if error}
		<p id="{uid}-err" class="flex items-start gap-1.5 text-[13px] text-rejected" role="alert">
			<CircleAlert size={15} class="mt-px flex-none" />{error}
		</p>
	{/if}
</fieldset>
