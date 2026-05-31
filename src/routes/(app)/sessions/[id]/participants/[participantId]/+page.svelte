<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import {
		ArrowLeft,
		Bell,
		CheckCircle2,
		Clock,
		ImageIcon,
		Loader2,
		ThumbsDown,
		ThumbsUp,
		Trash2,
		XCircle
	} from 'lucide-svelte';
	import { formatIDR } from '$lib/utils/format';
	import {
		approvePayment,
		rejectPayment,
		markPaidWithoutProof
	} from '$lib/services/payments';
	import { removeParticipant } from '$lib/services/sessions';
	import { sendParticipantReminder } from '$lib/services/notifications';
	import { ApiError } from '$lib/services/api';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import RejectReasonModal from '$lib/components/ui/RejectReasonModal.svelte';
	import { toast } from '$lib/stores/toast';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let acting = $state(false);
	let showRemove = $state(false);

	const status = $derived(data.page.payment_status);
	const isPaid = $derived(status === 'paid');
	const proofUrl = $derived(data.page.payment_proof_url ?? null);

	// Reminder cooldown — initialised from the server load and refreshed
	// on each click (so a successful send pushes the next-available
	// timestamp out for the user). `now` ticks every second whenever a
	// countdown is showing so the displayed "23h 12m" stays live.
	// One-shot read of data.reminderStatus is intentional here; the
	// 24h cooldown timestamp is updated locally on click + on the next
	// page load. svelte-check warns because it can't infer the intent.
	// svelte-ignore state_referenced_locally
	let reminderUnavailableUntil = $state<number | null>(
		// svelte-ignore state_referenced_locally
		data.reminderStatus?.can_send === false && data.reminderStatus.next_available_at
			// svelte-ignore state_referenced_locally
			? new Date(data.reminderStatus.next_available_at).getTime()
			: null
	);
	let now = $state(Date.now());
	$effect(() => {
		if (reminderUnavailableUntil === null) return;
		const tick = setInterval(() => {
			now = Date.now();
			if (reminderUnavailableUntil !== null && now >= reminderUnavailableUntil) {
				reminderUnavailableUntil = null;
				clearInterval(tick);
			}
		}, 1000);
		return () => clearInterval(tick);
	});

	function formatCooldown(ms: number): string {
		const totalSec = Math.max(0, Math.ceil(ms / 1000));
		const h = Math.floor(totalSec / 3600);
		const m = Math.floor((totalSec % 3600) / 60);
		const s = totalSec % 60;
		if (h > 0) return `${h}h ${m}m`;
		if (m > 0) return `${m}m ${s}s`;
		return `${s}s`;
	}

	const remainingMs = $derived(
		reminderUnavailableUntil !== null ? Math.max(0, reminderUnavailableUntil - now) : 0
	);
	const reminderDisabled = $derived(acting || remainingMs > 0 || isPaid);

	const statusMeta = $derived.by(() => {
		switch (status) {
			case 'paid':
				return { label: 'Paid', tone: 'text-[#047857] bg-[#10B981]/15', Icon: CheckCircle2 };
			case 'submitted':
				return { label: 'Proof submitted', tone: 'text-[#1E40AF] bg-[#3B82F6]/15', Icon: Clock };
			case 'rejected':
				return { label: 'Update requested', tone: 'text-[#92400E] bg-[#F59E0B]/15', Icon: XCircle };
			default:
				return { label: 'Pending', tone: 'text-[#584140] bg-[#fff0ef]', Icon: Clock };
		}
	});

	async function handleApprove() {
		acting = true;
		try {
			await approvePayment(data.participantId);
			toast.success('Approved');
			await invalidateAll();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Approve failed');
		} finally {
			acting = false;
		}
	}

	// "Request update" replaces window.prompt with RejectReasonModal
	// for char-count feedback + min/max validation. acting also
	// stays true so the surrounding action buttons are disabled
	// during the request.
	let showRejectModal = $state(false);
	let rejectSubmitting = $state(false);

	function openRequestUpdate() {
		showRejectModal = true;
	}

	async function submitReject(reason: string) {
		rejectSubmitting = true;
		acting = true;
		try {
			await rejectPayment(data.participantId, reason);
			toast.success('Update requested');
			showRejectModal = false;
			await invalidateAll();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Request update failed');
		} finally {
			rejectSubmitting = false;
			acting = false;
		}
	}

	async function handleMarkPaid() {
		acting = true;
		try {
			await markPaidWithoutProof(data.participantId);
			toast.success('Marked as paid');
			await invalidateAll();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Mark as paid failed');
		} finally {
			acting = false;
		}
	}

	async function handleRemind() {
		acting = true;
		try {
			const r = await sendParticipantReminder(data.participantId);
			toast.success(r.message || 'Reminder queued');
			// Optimistically push the cooldown out by 24h — the next page
			// load will re-fetch the authoritative timestamp from the
			// rate-limit service. Done this way so the button locks
			// immediately and the user can't double-fire while the
			// goroutine is still dispatching.
			reminderUnavailableUntil = Date.now() + 24 * 60 * 60 * 1000;
		} catch (e) {
			if (e instanceof ApiError && e.status === 429) {
				if (e.nextAvailableAt) {
					reminderUnavailableUntil = new Date(e.nextAvailableAt).getTime();
				} else if (typeof e.retryAfterSeconds === 'number') {
					reminderUnavailableUntil = Date.now() + e.retryAfterSeconds * 1000;
				}
				toast.error(e.message || 'Too soon to remind again');
			} else {
				toast.error(e instanceof Error ? e.message : 'Reminder failed');
			}
		} finally {
			acting = false;
		}
	}

	async function handleRemove() {
		acting = true;
		try {
			await removeParticipant(data.sessionId, data.participantId);
			toast.success('Participant removed');
			goto(`/sessions/${data.sessionId}`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Remove failed');
		} finally {
			acting = false;
			showRemove = false;
		}
	}
</script>

<svelte:head>
	<title>{data.page.participant_name} · {data.page.session_name}</title>
</svelte:head>

<div class="min-h-screen">
	<div class="max-w-2xl mx-auto px-4 py-8">
		<header class="flex items-center gap-3 mb-6">
			<button
				type="button"
				onclick={() => goto(`/sessions/${data.sessionId}`)}
				class="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl bg-white hover:bg-[#fff0ef] transition-colors"
				aria-label="Back to session"
			>
				<ArrowLeft class="w-5 h-5 text-[#584140]" />
			</button>
			<div class="flex-1 min-w-0">
				<p class="text-xs uppercase tracking-wider text-[#584140] font-semibold">Participant in {data.page.session_name}</p>
				<h1 class="text-2xl font-semibold text-[#251818] truncate">{data.page.participant_name}</h1>
			</div>
		</header>

		<section class="rounded-3xl p-4 mb-6 flex items-center gap-3 {statusMeta.tone}">
			<statusMeta.Icon class="w-5 h-5 flex-shrink-0" />
			<div class="flex-1">
				<p class="text-sm font-semibold">{statusMeta.label}</p>
				<p class="text-sm">Share: <strong>{formatIDR(data.page.fee_breakdown?.total ?? data.page.share_amount)}</strong></p>
			</div>
		</section>

		<section class="bg-white rounded-3xl p-5 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
			<h2 class="text-sm font-semibold text-[#251818] mb-3">Bill breakdown</h2>
			{#if data.page.bill_items.length === 0}
				<p class="text-sm text-[#584140]">No bills assigned yet.</p>
			{:else}
				<ul class="space-y-3">
					{#each data.page.bill_items as item}
						<li class="text-sm">
							<div class="flex items-start justify-between gap-3">
								<span class="text-[#251818] truncate">{item.description}</span>
								<span class="text-[#251818] font-semibold flex-shrink-0">{formatIDR(item.your_share)}</span>
							</div>
							<p class="text-xs text-[#584140] mt-0.5">
								{formatIDR(item.amount)} ÷ {item.shared_with} {item.shared_with === 1 ? 'person' : 'people'}
							</p>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

			{#if data.page.fee_breakdown && (data.page.fee_breakdown.service_charge_share > 0 || data.page.fee_breakdown.tax_share > 0)}
				<section class="bg-white rounded-3xl p-5 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
					<h2 class="text-sm font-semibold text-[#251818] mb-3">Fee breakdown</h2>
					<ul class="space-y-2">
						<li class="flex items-center justify-between text-sm">
							<span class="text-[#584140]">Your items</span>
							<span class="text-[#251818]">{formatIDR(data.page.fee_breakdown.items_total)}</span>
						</li>
						{#if data.page.fee_breakdown.service_charge_share > 0}
							<li class="flex items-center justify-between text-sm">
								<span class="text-[#584140]">Service charge</span>
								<span class="text-[#251818]">{formatIDR(data.page.fee_breakdown.service_charge_share)}</span>
							</li>
						{/if}
						{#if data.page.fee_breakdown.tax_share > 0}
							<li class="flex items-center justify-between text-sm">
								<span class="text-[#584140]">Tax</span>
								<span class="text-[#251818]">{formatIDR(data.page.fee_breakdown.tax_share)}</span>
							</li>
						{/if}
						<li class="h-px bg-[#fbe3e1] my-1"></li>
						<li class="flex items-center justify-between text-sm font-semibold">
							<span class="text-[#251818]">Total due</span>
							<span class="text-[#ae2f34]">{formatIDR(data.page.fee_breakdown.total)}</span>
						</li>
					</ul>
				</section>
			{/if}

		{#if proofUrl}
			<section class="bg-white rounded-3xl p-5 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
				<h2 class="text-sm font-semibold text-[#251818] mb-3">Payment proof</h2>
				<a
					href={proofUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="block rounded-2xl overflow-hidden bg-[#fff0ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
				>
					<img src={proofUrl} alt="Payment proof from {data.page.participant_name}" class="w-full max-h-[320px] object-contain" />
				</a>
			</section>
		{:else if status === 'pending' || status === 'rejected'}
			<section class="bg-white rounded-3xl p-5 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)] flex items-center gap-3">
				<ImageIcon class="w-6 h-6 text-[#584140]/40" />
				<p class="text-sm text-[#584140]">No proof uploaded yet.</p>
			</section>
		{/if}

		{#if data.page.rejection_reason}
			<section class="bg-[#F59E0B]/15 rounded-3xl p-4 mb-6 text-sm text-[#92400E]">
				<p class="font-semibold mb-1">Last update reason</p>
				<p>{data.page.rejection_reason}</p>
			</section>
		{/if}

		<section class="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
			<h2 class="text-sm font-semibold text-[#251818] mb-3">Actions</h2>
			<div class="flex flex-wrap gap-2">
				{#if status === 'submitted'}
					<button
						type="button"
						onclick={handleApprove}
						disabled={acting}
						class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-[#047857] bg-[#10B981]/15 hover:bg-[#10B981]/25 disabled:opacity-50 transition-colors"
					>
						{#if acting}<Loader2 class="w-4 h-4 animate-spin" />{:else}<ThumbsUp class="w-4 h-4" />{/if}
						Approve
					</button>
					<button
						type="button"
						onclick={openRequestUpdate}
						disabled={acting}
						class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-[#92400E] bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 disabled:opacity-50 transition-colors"
					>
						<ThumbsDown class="w-4 h-4" />
						Request update
					</button>
				{/if}
				{#if !isPaid}
					<button
						type="button"
						onclick={handleMarkPaid}
						disabled={acting}
						class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-[#047857] hover:bg-[#10B981]/10 disabled:opacity-50 transition-colors"
					>
						<CheckCircle2 class="w-4 h-4" /> Mark as paid
					</button>
					<button
						type="button"
						onclick={handleRemind}
						disabled={reminderDisabled}
						title={remainingMs > 0 ? `Next reminder available in ${formatCooldown(remainingMs)}` : 'Send WhatsApp reminder'}
						class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-[#251818] bg-[#fff0ef] hover:bg-[#fbe3e1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						<Bell class="w-4 h-4" />
						{#if remainingMs > 0}
							Wait {formatCooldown(remainingMs)}
						{:else}
							Remind
						{/if}
					</button>
				{/if}
				<button
					type="button"
					onclick={() => (showRemove = true)}
					disabled={acting}
					class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-[#991B1B] hover:bg-[#EF4444]/10 disabled:opacity-50 transition-colors"
				>
					<Trash2 class="w-4 h-4" /> Remove
				</button>
			</div>
		</section>
	</div>
</div>

<RejectReasonModal
	open={showRejectModal}
	participantName={data.page.participant_name}
	submitting={rejectSubmitting}
	onsubmit={submitReject}
	oncancel={() => (showRejectModal = false)}
/>

<ConfirmDialog
	open={showRemove}
	title="Remove participant?"
	message={isPaid
		? `${data.page.participant_name} has already paid ${formatIDR(data.page.share_amount)}. Removing won't refund anything; remaining shares will rebalance.`
		: status === 'submitted' || status === 'rejected'
		? `${data.page.participant_name} has submitted a proof. Removing discards their upload.`
		: `Remove ${data.page.participant_name} from this session?`}
	confirmText={acting ? 'Removing…' : 'Remove'}
	cancelText="Keep"
	variant="danger"
	onconfirm={handleRemove}
	oncancel={() => (showRemove = false)}
/>
