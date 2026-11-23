<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { CircleAlert } from 'lucide-svelte';

	interface Props {
		/** Whole currency units (rupiah). null while empty. Two-way bound. */
		value?: number | null;
		label?: string;
		id?: string;
		currency?: string;
		placeholder?: string;
		error?: string;
		helperText?: string;
		size?: 'md' | 'lg';
		disabled?: boolean;
	}

	let { value = $bindable(null), label = 'Amount', id, currency = 'IDR', placeholder = '0', error, helperText, size = 'lg', disabled = false }: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `amt-${uid}`);
	const symbol = $derived(({ IDR: 'Rp', USD: '$', SGD: 'S$', EUR: '€', MYR: 'RM' } as Record<string, string>)[currency] ?? currency);

	// Indonesian grouping (540.000). Typing, pasting "Rp 50.000" or "50,000"
	// all end up as the same whole number.
	const fmt = (n: number | null) => (n == null ? '' : new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(n));
	let text = $state(fmt(value));
	$effect(() => {
		const digits = text.replace(/\D/g, '');
		const current = digits ? Number(digits) : null;
		if (current !== value) text = fmt(value);
	});

	function oninput(e: Event) {
		const el = e.currentTarget as HTMLInputElement;
		const digits = el.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 13);
		value = digits ? Number(digits) : null;
		text = fmt(value);
		el.value = text;
	}

	const message = $derived(error || helperText);
</script>

<div class="flex flex-col gap-1.5">
	<label for={inputId} class="text-sm font-semibold text-ink">{label}</label>
	<div
		class={cn(
			'flex items-baseline gap-2 rounded-field bg-card px-4 transition-shadow',
			'shadow-[inset_0_0_0_1.5px_var(--color-hairline)] focus-within:shadow-[inset_0_0_0_2px_var(--color-steel)]',
			error && 'shadow-[inset_0_0_0_2px_var(--color-rejected)]',
			size === 'lg' ? 'py-3' : 'py-2',
			disabled && 'opacity-60'
		)}
	>
		<span class={cn('text-amount text-ink-soft', size === 'lg' ? 'text-2xl' : 'text-lg')} aria-hidden="true">{symbol}</span>
		<input
			id={inputId}
			type="text"
			inputmode="numeric"
			autocomplete="off"
			value={text}
			{oninput}
			{placeholder}
			{disabled}
			aria-invalid={!!error || undefined}
			aria-describedby={message ? `${uid}-msg` : undefined}
			class={cn('text-amount min-w-0 flex-1 bg-transparent text-ink placeholder:text-hairline focus:outline-none', size === 'lg' ? 'text-[34px] leading-tight' : 'text-xl')}
		/>
	</div>
	{#if message}
		<p id="{uid}-msg" class={cn('flex items-start gap-1.5 text-[13px]', error ? 'text-rejected' : 'text-ink-soft')}>
			{#if error}<CircleAlert size={15} class="mt-px flex-none" />{/if}{message}
		</p>
	{/if}
</div>
