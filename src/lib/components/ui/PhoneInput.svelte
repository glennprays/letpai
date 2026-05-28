<script lang="ts">
	import {
		COUNTRY_CODES,
		DEFAULT_COUNTRY_CODE,
		composeWhatsappNumber,
		digitsOnly,
		splitWhatsappNumber
	} from '$lib/utils/phone';
	import { AlertCircle } from 'lucide-svelte';

	interface Props {
		/** E.164-style digits only, e.g. "6281234567890". Two-way bound. */
		value?: string;
		label?: string;
		placeholder?: string;
		disabled?: boolean;
		error?: string;
		id?: string;
	}

	let {
		value = $bindable(''),
		label,
		placeholder = '8123456789',
		disabled = false,
		error,
		id
	}: Props = $props();

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
		const raw = (e.target as HTMLInputElement).value;
		local = digitsOnly(raw);
		value = composeWhatsappNumber(countryCode, local);
	}

	function handleCountryChange(e: Event) {
		countryCode = (e.target as HTMLSelectElement).value;
		value = composeWhatsappNumber(countryCode, local);
	}
</script>

<div class="space-y-1.5">
	{#if label}
		<label for={id} class="block text-[13px] font-semibold text-[#584140]">
			{label}
		</label>
	{/if}

	<div
		class="phone-input-group flex items-center bg-[#f5dddb] rounded-2xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#ae2f34]/30"
		class:has-error={!!error}
		class:opacity-50={disabled}
	>
		<select
			class="country-selector"
			value={countryCode}
			onchange={handleCountryChange}
			{disabled}
			aria-label="Country code"
		>
			{#each COUNTRY_CODES as country (country.code)}
				<option value={country.code}>{country.short} (+{country.code})</option>
			{/each}
		</select>

		<input
			{id}
			type="tel"
			inputmode="numeric"
			autocomplete="tel-national"
			class="phone-input"
			value={local}
			oninput={handleLocalInput}
			{placeholder}
			{disabled}
		/>
	</div>

	{#if error}
		<div class="flex items-center gap-1.5 text-xs text-[#EF4444]">
			<AlertCircle size={14} />
			<span>{error}</span>
		</div>
	{/if}
</div>

<style>
	.phone-input-group.has-error {
		box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
		background: #fef2f2;
	}

	.country-selector {
		min-width: 90px;
		padding: 12px 8px;
		border: none;
		border-right: 1px solid #fbe3e1;
		background: transparent;
		font: 14px 'Plus Jakarta Sans', sans-serif;
		color: #251818;
		cursor: pointer;
	}

	.phone-input {
		flex: 1;
		padding: 12px 16px;
		border: none;
		font: 14px 'Plus Jakarta Sans', sans-serif;
		color: #251818;
		background: transparent;
	}

	.country-selector:focus,
	.phone-input:focus {
		outline: none;
	}

	.country-selector:disabled,
	.phone-input:disabled {
		cursor: not-allowed;
	}
</style>
