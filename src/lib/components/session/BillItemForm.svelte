<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import AmountInput from '$lib/components/ui/AmountInput.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import { formatIDR } from '$lib/utils/format';
	import type { FeeConfig, Participant } from '$lib/types/api';

	interface Props {
		name: string;
		amount: number | null;
		scope: 'everyone' | 'specific';
		participantIds: string[];
		includesServiceCharge: boolean;
		includesTax: boolean;
		/** Only used when the session has no fee config yet (first item sets it). */
		feeSC?: number;
		feeTax?: number;
		participants: Participant[];
		fees?: FeeConfig | null;
		currency?: string;
		/** Offer fee % inputs when the session has none yet (add flow only). */
		allowFeeSetup?: boolean;
	}

	let {
		name = $bindable(),
		amount = $bindable(),
		scope = $bindable(),
		participantIds = $bindable(),
		includesServiceCharge = $bindable(),
		includesTax = $bindable(),
		feeSC = $bindable(0),
		feeTax = $bindable(0),
		participants,
		fees,
		currency = 'IDR',
		allowFeeSetup = false
	}: Props = $props();

	const hasFees = $derived((fees?.service_charge_percentage ?? 0) > 0 || (fees?.tax_percentage ?? 0) > 0);
	const sc = $derived(hasFees ? (fees?.service_charge_percentage ?? 0) : feeSC || 0);
	const tx = $derived(hasFees ? (fees?.tax_percentage ?? 0) : feeTax || 0);

	function toggle(id: string) {
		participantIds = participantIds.includes(id) ? participantIds.filter((x) => x !== id) : [...participantIds, id];
	}

	// Per-person preview using the same maths as before the redesign:
	// service on the share, tax on share + service.
	const preview = $derived.by(() => {
		if (!amount || amount <= 0) return null;
		const n = scope === 'specific' ? participantIds.length : participants.length;
		if (n === 0) return null;
		const share = amount / n;
		const s = includesServiceCharge ? (share * sc) / 100 : 0;
		const t = includesTax ? ((share + s) * tx) / 100 : 0;
		return { n, each: share + s + t, hasExtras: s + t > 0 };
	});
</script>

<div class="flex flex-col gap-5">
	<Input label="What was it?" bind:value={name} placeholder="Sate kambing, parking, villa…" maxLength={200} />
	<AmountInput label="How much?" bind:value={amount} {currency} />

	<div>
		<Segmented
			label="Who shares it?"
			bind:value={scope}
			options={[
				{ value: 'everyone', label: `Everyone (${participants.length})` },
				{ value: 'specific', label: 'Some people' }
			]}
			onchange={(v) => v === 'everyone' && (participantIds = [])}
		/>
		{#if scope === 'specific'}
			{#if participants.length === 0}
				<p class="mt-2 text-[13px] text-ink-soft">Add people to the session first.</p>
			{:else}
				<div class="mt-2 grid max-h-52 grid-cols-1 overflow-y-auto rounded-field bg-fog px-3 py-1 sm:grid-cols-2">
					{#each participants as p (p.participant_id)}
						<Checkbox label={p.name} checked={participantIds.includes(p.participant_id)} onchange={() => toggle(p.participant_id)} />
					{/each}
				</div>
				<p class="mt-1.5 text-[13px] text-ink-soft">{participantIds.length} selected</p>
			{/if}
		{/if}
	</div>

	{#if hasFees}
		<fieldset>
			<legend class="mb-1 text-sm font-semibold text-ink">Fees on this item</legend>
			{#if fees?.service_charge_percentage}<Checkbox label="Service charge {fees.service_charge_percentage}%" bind:checked={includesServiceCharge} />{/if}
			{#if fees?.tax_percentage}<Checkbox label="Tax {fees.tax_percentage}%" bind:checked={includesTax} />{/if}
		</fieldset>
	{:else if allowFeeSetup}
		<fieldset>
			<legend class="text-sm font-semibold text-ink">Service charge and tax <span class="font-normal text-ink-soft">(optional)</span></legend>
			<div class="mt-2 grid grid-cols-2 gap-3">
				<label class="flex items-center gap-2 rounded-field bg-card px-3 shadow-[inset_0_0_0_1.5px_var(--color-hairline)] focus-within:shadow-[inset_0_0_0_2px_var(--color-steel)]">
					<span class="text-sm text-ink-soft">Service</span>
					<input type="number" bind:value={feeSC} min="0" max="100" step="0.1" class="h-11 min-w-0 flex-1 bg-transparent text-right font-semibold tabular-nums focus:outline-none" aria-label="Service charge percent" />
					<span class="text-sm text-ink-soft">%</span>
				</label>
				<label class="flex items-center gap-2 rounded-field bg-card px-3 shadow-[inset_0_0_0_1.5px_var(--color-hairline)] focus-within:shadow-[inset_0_0_0_2px_var(--color-steel)]">
					<span class="text-sm text-ink-soft">Tax</span>
					<input type="number" bind:value={feeTax} min="0" max="100" step="0.1" class="h-11 min-w-0 flex-1 bg-transparent text-right font-semibold tabular-nums focus:outline-none" aria-label="Tax percent" />
					<span class="text-sm text-ink-soft">%</span>
				</label>
			</div>
			<p class="mt-1.5 text-[13px] text-ink-soft">Set once; later items reuse these rates.</p>
		</fieldset>
	{/if}

	{#if preview}
		<p class="rounded-field bg-fog px-4 py-3 text-[15px]" aria-live="polite">
			<span class="text-amount text-lg">{formatIDR(Math.round(preview.each))}</span>
			<span class="text-ink-soft"> each for {preview.n} {preview.n === 1 ? 'person' : 'people'}{preview.hasExtras ? ', with service and tax' : ''}</span>
		</p>
	{/if}
</div>
