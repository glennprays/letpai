<script lang="ts">
	import StatusPill from '$lib/components/ui/StatusPill.svelte';
	import Menu, { type MenuItem } from '$lib/components/ui/Menu.svelte';
	import SegmentBar from './SegmentBar.svelte';
	import { PaidStamp } from '$lib/components/art';
	import { formatIDR, formatRelativeTime } from '$lib/utils/format';
	import { sessionStatusOf } from '$lib/utils/status';
	import { ChevronLeft } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		status: string;
		createdAt: string;
		total: number;
		outstanding: number;
		counts: { paid: number; review: number; rejected: number; unpaid: number; total: number };
		menu?: MenuItem[];
		actions?: Snippet;
	}

	let { title, description, status, createdAt, total, outstanding, counts, menu = [], actions }: Props = $props();

	const st = $derived(sessionStatusOf(status));
	const settled = $derived(counts.total > 0 && counts.paid === counts.total);
</script>

<header>
	<div class="flex items-center justify-between gap-3">
		<a href="/sessions" class="-ml-2 inline-flex h-9 items-center gap-1 rounded-pill pr-3 pl-1.5 text-sm font-semibold text-ink-soft hover:bg-mist hover:text-ink">
			<ChevronLeft size={18} aria-hidden="true" /> Sessions
		</a>
		<div class="flex items-center gap-2">
			<StatusPill tone={st.tone}>{st.label}</StatusPill>
			{#if menu.length}<Menu items={menu} label="Session actions" text="Edit" />{/if}
		</div>
	</div>

	<h1 class="text-heading mt-3 max-w-[26ch] text-[clamp(1.75rem,4vw,2.5rem)] [overflow-wrap:anywhere]">{title}</h1>
	<p class="mt-1.5 text-sm text-ink-soft">
		Created {formatRelativeTime(createdAt)}{#if description}<span aria-hidden="true">{" · "}</span>{description}{/if}
	</p>

	{#if counts.total > 0}
		<div class="mt-6">
			{#if settled}
				<div class="flex flex-wrap items-center gap-4">
					<p class="text-amount text-[clamp(2.75rem,8vw,4rem)] leading-[0.9] tracking-[-0.045em]">{formatIDR(total)}</p>
					<PaidStamp label="All settled" animate />
				</div>
				<p class="mt-2 text-[17px] text-ink-soft">Everyone has paid.</p>
			{:else}
				<p class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
					<span class="text-amount text-[clamp(2.75rem,8vw,4rem)] leading-[0.9] tracking-[-0.045em] text-ink">{formatIDR(outstanding)}</span>
					<span class="text-[17px] text-ink-soft">still out of {formatIDR(total)}</span>
				</p>
			{/if}
			<SegmentBar class="mt-4" paid={counts.paid} review={counts.review} rejected={counts.rejected} total={counts.total} />
			<ul class="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-soft">
				<li><b class="text-ink tabular-nums">{counts.paid}</b> paid</li>
				{#if counts.review}<li><b class="text-ink tabular-nums">{counts.review}</b> to check</li>{/if}
				{#if counts.rejected}<li><b class="text-ink tabular-nums">{counts.rejected}</b> sent back</li>{/if}
				{#if counts.unpaid}<li><b class="text-ink tabular-nums">{counts.unpaid}</b> not paid yet</li>{/if}
			</ul>
		</div>
	{/if}

	{#if actions}<div class="mt-5 flex flex-wrap gap-2">{@render actions()}</div>{/if}
</header>
