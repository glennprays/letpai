<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import StatusPill from '$lib/components/ui/StatusPill.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import { formatIDR, formatRelativeTime } from '$lib/utils/format';
	import { deliveryOf, paymentStatusOf } from '$lib/utils/status';
	import { Bell, RotateCw, CircleAlert, Loader2, ExternalLink, CircleCheck, Trash2, UserPlus } from 'lucide-svelte';
	import type { Participant } from '$lib/types/api';

	interface Props {
		sessionId: string;
		people: Participant[];
		/** Has the first WhatsApp batch gone out? Reminders only make sense after it. */
		sent: boolean;
		remindingId?: string | null;
		retryingId?: string | null;
		actingId?: string | null;
		bulkReminding?: boolean;
		cooldownMs: (p: Participant) => number;
		onremind: (id: string) => void;
		onremindall: () => void;
		onretry: (id: string) => void;
		onmarkpaid: (id: string) => void;
		onremove: (p: Participant) => void;
		onadd: () => void;
	}

	let {
		sessionId,
		people,
		sent,
		remindingId = null,
		retryingId = null,
		actingId = null,
		bulkReminding = false,
		cooldownMs,
		onremind,
		onremindall,
		onretry,
		onmarkpaid,
		onremove,
		onadd
	}: Props = $props();

	function hours(ms: number) {
		const h = Math.ceil(ms / 3_600_000);
		return h <= 1 ? 'under an hour' : `${h} h`;
	}
</script>

<section aria-labelledby="owes-h">
	<header class="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-1">
		<h2 id="owes-h" class="text-heading flex items-center gap-2 text-xl whitespace-nowrap">
			Still owes
			<span class="rounded-pill bg-ink px-2 py-0.5 font-sans text-xs font-semibold text-card tabular-nums">{people.length}</span>
		</h2>
		<div class="flex gap-2">
			<Button size="sm" variant="ghost" leftIcon={UserPlus} onclick={onadd}>Add</Button>
			{#if sent && people.length > 1}
				<Button size="sm" variant="secondary" leftIcon={Bell} loading={bulkReminding} onclick={onremindall}>Remind all</Button>
			{/if}
		</div>
	</header>
	<Card padding="none" class="divide-y divide-mist">
		{#each people as p (p.participant_id)}
			{@const st = paymentStatusOf(p.payment_status)}
			{@const d = deliveryOf(p.last_notification)}
			{@const wait = cooldownMs(p)}
			<article class="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-1 p-4 sm:px-5" aria-label={p.name}>
				<Avatar size="md" fullName={p.name} phoneNumber={p.whatsapp_number} identifier={p.contact_id || p.participant_id} src={p.contact_avatar_url || p.avatar_url} class="row-span-2" />
				<a href="/sessions/{sessionId}/participants/{p.participant_id}" class="truncate self-center font-semibold hover:underline">{p.name}</a>
				<p class="text-amount self-center text-right text-[17px]">{formatIDR(p.share_amount)}</p>

				<div class="col-span-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-soft">
					<StatusPill tone={st.tone}>{st.label}</StatusPill>
					{#if d.state === 'failed'}
						<span class="inline-flex items-center gap-1 font-semibold text-rejected"><CircleAlert size={14} aria-hidden="true" />WhatsApp message not delivered</span>
					{:else if d.state === 'sending'}
						<span class="inline-flex items-center gap-1"><Loader2 size={13} class="animate-spin" aria-hidden="true" />Sending…</span>
					{:else if d.state === 'retrying'}
						<span class="inline-flex items-center gap-1"><RotateCw size={13} aria-hidden="true" />Message retrying</span>
					{:else if p.payment_status === 'rejected'}
						<span>Waiting for a new screenshot</span>
					{:else if wait > 0}
						<span>Can remind again in {hours(wait)}</span>
					{:else if p.last_notification_at}
						<span>Messaged {formatRelativeTime(p.last_notification_at)}</span>
					{:else if !sent}
						<span>Not messaged yet</span>
					{/if}
				</div>

				<div class="col-span-2 col-start-2 mt-2 flex flex-wrap items-center gap-2">
					{#if d.state === 'failed'}
						<Button size="sm" variant="ink" leftIcon={RotateCw} loading={retryingId === p.participant_id} onclick={() => onretry(p.participant_id)}>Send again</Button>
					{:else if sent && p.payment_status === 'pending'}
						<Button
							size="sm"
							variant="secondary"
							leftIcon={Bell}
							loading={remindingId === p.participant_id}
							disabled={wait > 0}
							onclick={() => onremind(p.participant_id)}
							aria-label="Remind {p.name}"
						>Remind</Button>
					{/if}
					<Menu
						label="More for {p.name}"
						items={[
							{ label: 'Open details', icon: ExternalLink, href: `/sessions/${sessionId}/participants/${p.participant_id}` },
							{ label: 'Mark as paid (no proof)', icon: CircleCheck, onclick: () => onmarkpaid(p.participant_id), disabled: actingId === p.participant_id },
							{ label: 'Remove from session', icon: Trash2, onclick: () => onremove(p), danger: true }
						]}
					/>
				</div>
			</article>
		{/each}
	</Card>
</section>
