<script lang="ts">
	import {
		COUNTRY_CODES,
		DEFAULT_COUNTRY_CODE,
		composeWhatsappNumber,
		digitsOnly,
		splitWhatsappNumber
	} from '$lib/utils/phone';
	import { cn } from '$lib/utils/cn';
	import { CircleAlert, ChevronDown } from 'lucide-svelte';

	interface Props {
		/** E.164-style digits only, e.g. "6281234567890". Two-way bound. */
		value?: string;
		label?: string;
		placeholder?: string;
		disabled?: boolean;
		error?: string;
		helperText?: string;
		id?: string;
		name?: string;
		autofocus?: boolean;
	}

	let {
		value = $bindable(''),
		label,
		placeholder = '812 3456 7890',
		disabled = false,
		error,
		helperText,
		id,
		name,
		autofocus = false
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `phone-${uid}`);
	const msgId = `${uid}-msg`;

	const initial = splitWhatsappNumber(value);
	let countryCode = $state(initial.countryCode || DEFAULT_COUNTRY_CODE);
	let local = $state(initial.local);

	// When the bound value changes from outside (e.g. parent resets it),
	// rebuild local state from it. Skip the trivial round-trip where the
	// composed local state already matches the new value.
	$effect(() => {
		const composed = composeWhatsappNumber(countryCode, local);
		if (value !== composed) {
			const next = splitWhatsappNumber(value);
			countryCode = next.countryCode || DEFAULT_COUNTRY_CODE;
			local = next.local;
		}
	});

	function handleLocalInput(e: Event) {
		local = digitsOnly((e.target as HTMLInputElement).value);
		value = composeWhatsappNumber(countryCode, local);
	}

	function handleCountryChange(e: Event) {
		countryCode = (e.target as HTMLSelectElement).value;
		value = composeWhatsappNumber(countryCode, local);
	}

	const message = $derived(error || helperText);
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label for={inputId} class="text-sm font-semibold text-ink">{label}</label>
	{/if}

	<div
		class={cn(
			'flex h-11 items-stretch overflow-hidden rounded-field bg-card transition-shadow duration-150',
			'shadow-[inset_0_0_0_1.5px_var(--color-hairline)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink-soft)]',
			'focus-within:shadow-[inset_0_0_0_2px_var(--color-steel)] focus-within:hover:shadow-[inset_0_0_0_2px_var(--color-steel)]',
			error && 'shadow-[inset_0_0_0_2px_var(--color-rejected)] hover:shadow-[inset_0_0_0_2px_var(--color-rejected)]',
			disabled && 'opacity-60'
		)}
	>
		<div class="relative flex items-center">
			<select
				class="h-full cursor-pointer appearance-none bg-transparent pr-8 pl-4 text-[15px] font-semibold text-ink focus:outline-none disabled:cursor-not-allowed"
				value={countryCode}
				onchange={handleCountryChange}
				{disabled}
				aria-label="Country code"
			>
				{#each COUNTRY_CODES as country (country.code)}
					<option value={country.code}>{country.short} +{country.code}</option>
				{/each}
			</select>
			<ChevronDown size={16} class="pointer-events-none absolute right-2.5 text-ink-soft" />
		</div>
		<span class="my-2.5 w-px bg-hairline" aria-hidden="true"></span>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			id={inputId}
			{name}
			type="tel"
			inputmode="numeric"
			autocomplete="tel-national"
			class="min-w-0 flex-1 bg-transparent px-3 text-[15px] font-medium text-ink tabular-nums placeholder:text-ink-soft/70 focus:outline-none disabled:cursor-not-allowed"
			value={local}
			oninput={handleLocalInput}
			{placeholder}
			{disabled}
			{autofocus}
			aria-invalid={!!error || undefined}
			aria-describedby={message ? msgId : undefined}
		/>
	</div>

	{#if message}
		<p id={msgId} class={cn('flex items-start gap-1.5 text-[13px]', error ? 'text-rejected' : 'text-ink-soft')} role={error ? 'alert' : undefined}>
			{#if error}<CircleAlert size={15} class="mt-px flex-none" />{/if}
			<span>{message}</span>
		</p>
	{/if}
</div>
