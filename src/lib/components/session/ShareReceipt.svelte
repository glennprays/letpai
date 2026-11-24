<script lang="ts">
	import { Receipt } from '$lib/components/art';
	import { formatIDR } from '$lib/utils/format';
	import type { PaymentPageData } from '$lib/services/payments';
	import type { Snippet } from 'svelte';

	interface Props {
		page: Pick<PaymentPageData, 'bill_items' | 'fee_breakdown' | 'fee_config' | 'share_amount'>;
		title?: string;
		/** Extra content at the top of the paper (e.g. the amount hero). */
		header?: Snippet;
		class?: string;
	}

	let { page, title = 'What it covers', header, class: className }: Props = $props();

	const scPct = $derived(page.fee_config?.service_charge_percentage ?? 0);
	const taxPct = $derived(page.fee_config?.tax_percentage ?? 0);
	const total = $derived(page.fee_breakdown?.total ?? page.share_amount);

	// One line per item: the person's share, with that item's service and
	// tax folded in (service on the share, tax on share + service), matching
	// how the backend computes fee_breakdown.
	function lineTotal(i: PaymentPageData['bill_items'][number]) {
		const sc = i.includes_service_charge && scPct > 0 ? Math.round((i.your_share * scPct) / 100) : 0;
		const tax = i.includes_tax && taxPct > 0 ? Math.round(((i.your_share + sc) * taxPct) / 100) : 0;
		return i.your_share + sc + tax;
	}
</script>

<Receipt class={className} paperClass="px-5 pt-5 pb-9 sm:px-6">
	{@render header?.()}
	<h2 class="text-eyebrow">{title}</h2>
	{#if page.bill_items.length === 0}
		<p class="mt-3 text-[15px] text-ink-soft">No items assigned yet.</p>
	{:else}
		<ul class="mt-3 space-y-2.5">
			{#each page.bill_items as item (item.bill_item_id)}
				<li class="flex items-start justify-between gap-4">
					<div class="min-w-0">
						<p class="text-[15px] [overflow-wrap:anywhere]">{item.description}</p>
						<p class="text-[13px] text-ink-soft tabular-nums">
							{item.shared_with === 1 ? 'Just you' : `${formatIDR(item.amount)} split ${item.shared_with} ways`}
						</p>
					</div>
					<span class="pt-px text-[15px] font-semibold tabular-nums">{formatIDR(lineTotal(item))}</span>
				</li>
			{/each}
		</ul>
		<div class="my-4 border-t-[1.5px] border-dashed border-hairline"></div>
		{#if page.fee_breakdown && (page.fee_breakdown.service_charge_share > 0 || page.fee_breakdown.tax_share > 0)}
			<dl class="mb-3 space-y-1 text-[14px] text-ink-soft">
				<div class="flex justify-between"><dt>Items</dt><dd class="tabular-nums">{formatIDR(page.fee_breakdown.items_total)}</dd></div>
				{#if page.fee_breakdown.service_charge_share > 0}<div class="flex justify-between"><dt>Service {scPct}%</dt><dd class="tabular-nums">{formatIDR(page.fee_breakdown.service_charge_share)}</dd></div>{/if}
				{#if page.fee_breakdown.tax_share > 0}<div class="flex justify-between"><dt>Tax {taxPct}%</dt><dd class="tabular-nums">{formatIDR(page.fee_breakdown.tax_share)}</dd></div>{/if}
			</dl>
		{/if}
		<div class="flex items-baseline justify-between font-bold"><span>Total</span><span class="text-amount text-xl">{formatIDR(total)}</span></div>
	{/if}
</Receipt>
