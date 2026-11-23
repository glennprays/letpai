<script lang="ts">
	import { Receipt } from '$lib/components/art';
	import Button from '$lib/components/ui/Button.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import { formatIDR } from '$lib/utils/format';
	import { Plus, Pencil, Trash2 } from 'lucide-svelte';
	import type { BillItem, FeeConfig, Participant } from '$lib/types/api';

	interface Props {
		bills: BillItem[];
		participants: Participant[];
		fees?: FeeConfig | null;
		editable?: boolean;
		onadd: () => void;
		onedit: (item: BillItem) => void;
		ondelete: (id: string) => void;
	}

	let { bills, participants, fees, editable = true, onadd, onedit, ondelete }: Props = $props();

	const scPct = $derived(fees?.service_charge_percentage ?? 0);
	const taxPct = $derived(fees?.tax_percentage ?? 0);
	// Same maths as the participants' shares (and the payment page): service
	// on the item, tax on item + service. Each flag is opt-out per item.
	const itemSc = (b: BillItem) => (b.includes_service_charge !== false ? Math.round((b.amount * scPct) / 100) : 0);
	const itemsTotal = $derived(bills.reduce((s, b) => s + b.amount, 0));
	const sc = $derived(bills.reduce((s, b) => s + itemSc(b), 0));
	const tax = $derived(bills.reduce((s, b) => s + (b.includes_tax !== false ? Math.round(((b.amount + itemSc(b)) * taxPct) / 100) : 0), 0));

	function who(b: BillItem): string | null {
		const ids = b.participant_ids ?? [];
		if (!ids.length) return null;
		const names = ids.map((id) => participants.find((p) => p.participant_id === id)?.name?.split(' ')[0]).filter(Boolean);
		return names.length <= 2 ? names.join(', ') : `${names.length} people`;
	}
</script>

<section aria-labelledby="bill-h">
	<Receipt paperClass="px-5 pt-5 pb-9">
		<div class="flex items-center justify-between gap-3">
			<h2 id="bill-h" class="text-eyebrow">The bill</h2>
			{#if editable}<Button size="sm" variant="ghost" leftIcon={Plus} onclick={onadd} class="-mr-2">Add item</Button>{/if}
		</div>

		{#if bills.length === 0}
			<p class="mt-4 text-[15px] text-ink-soft">No items yet. Add what you paid for, and Letpai works out each share.</p>
		{:else}
			<ul class="mt-3 space-y-1">
				{#each bills as b (b.bill_item_id)}
					{@const scope = who(b)}
					<li class="group -mx-2 flex items-start gap-2 rounded-[10px] px-2 py-1.5 hover:bg-fog">
						<div class="min-w-0 flex-1 text-[15px]">
							<span class="[overflow-wrap:anywhere]">{b.description}</span>
							{#if scope}<span class="text-ink-soft"> · {scope}</span>{/if}
							{#if (scPct || taxPct) && (b.includes_service_charge === false || b.includes_tax === false)}
								<span class="block text-xs text-ink-soft">
									{b.includes_service_charge === false && b.includes_tax === false ? 'No service or tax' : b.includes_service_charge === false ? 'No service charge' : 'No tax'}
								</span>
							{/if}
						</div>
						<span class="pt-px text-[15px] tabular-nums">{formatIDR(b.amount).replace(/^Rp\s?/, '')}</span>
						{#if editable}
							<Menu
								label="Edit {b.description}"
								items={[
									{ label: 'Edit item', icon: Pencil, onclick: () => onedit(b) },
									{ label: 'Delete item', icon: Trash2, onclick: () => ondelete(b.bill_item_id), danger: true }
								]}
								class="-my-1.5 -mr-1"
							/>
						{/if}
					</li>
				{/each}
			</ul>
			<div class="my-3 border-t-[1.5px] border-dashed border-hairline"></div>
			<dl class="space-y-1 text-[15px]">
				{#if sc || tax}
					<div class="flex justify-between text-ink-soft"><dt>Items</dt><dd class="tabular-nums">{formatIDR(itemsTotal)}</dd></div>
				{/if}
				{#if sc}<div class="flex justify-between text-ink-soft"><dt>Service {scPct}%</dt><dd class="tabular-nums">{formatIDR(sc)}</dd></div>{/if}
				{#if tax}<div class="flex justify-between text-ink-soft"><dt>Tax {taxPct}%</dt><dd class="tabular-nums">{formatIDR(tax)}</dd></div>{/if}
			</dl>
			{#if sc || tax}<div class="my-3 border-t-[1.5px] border-dashed border-hairline"></div>{/if}
			<div class="flex items-baseline justify-between font-bold"><span>Total</span><span class="text-amount text-xl">{formatIDR(itemsTotal + sc + tax)}</span></div>
		{/if}
	</Receipt>
</section>
