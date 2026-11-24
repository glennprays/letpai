<script lang="ts">
	import StatusPill from '$lib/components/ui/StatusPill.svelte';
	import SegmentBar from './SegmentBar.svelte';
	import { formatIDR, formatRelativeTime } from '$lib/utils/format';
	import { sessionStatusOf, sessionGroup } from '$lib/utils/status';
	import { unpaidCount } from '$lib/services/sessions-list';
	import { ChevronRight } from 'lucide-svelte';
	import type { Session } from '$lib/types/api';

	let { session }: { session: Session } = $props();

	const st = $derived(sessionStatusOf(session.status));
	const open = $derived(sessionGroup(session.status) === 'open');
	const people = $derived(session.participant_count ?? 0);
	const unpaid = $derived(unpaidCount(session));
	const meta = $derived(
		people === 0
			? 'Nobody added yet'
			: !open
				? `${session.paid_count} of ${people} paid`
				: unpaid === 0
					? `All ${people} paid`
					: `${unpaid} of ${people} still to pay`
	);
</script>

<a
	href="/sessions/{session.session_id}"
	class="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-fog sm:px-5"
>
	<div class="min-w-0">
		<div class="flex items-center gap-2">
			<p class="truncate font-semibold text-ink">{session.title}</p>
			{#if !open || st.label !== 'Collecting'}<StatusPill tone={st.tone} class="flex-none">{st.label}</StatusPill>{/if}
		</div>
		<p class="mt-0.5 text-[13px] text-ink-soft">{meta} · {formatRelativeTime(session.created_at)}</p>
	</div>
	<div class="flex items-center gap-2">
		<span class="text-amount text-right text-[17px] {open ? 'text-ink' : 'text-ink-soft'}">{formatIDR(session.total_amount)}</span>
		<ChevronRight size={18} class="text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
	</div>
	{#if people > 0 && open}
		<SegmentBar class="col-span-2" size="sm" paid={session.paid_count ?? 0} total={people} />
	{/if}
</a>
