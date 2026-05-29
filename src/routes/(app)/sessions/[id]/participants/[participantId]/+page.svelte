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
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import { toast } from '$lib/stores/toast';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let acting = $state(false);
	let showRemove = $state(false);

	const status = $derived(data.page.payment_status);
	const isPaid = $derived(status === 'paid');
	const proofUrl = $derived(data.page.payment_proof_url ?? null);

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

	async function handleRequestUpdate() {
		const reason = window.prompt('What needs to be fixed?') ?? undefined;
		if (reason !== undefined && reason.trim().length < 5) {
			toast.error('Note must be at least 5 characters');
			return;
		}
		acting = true;
		try {
			await rejectPayment(data.participantId, reason);
			toast.success('Update requested');
			await invalidateAll();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Request update failed');
		} finally {
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
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Reminder failed');
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
				<p class="text-sm">Share: <strong>{formatIDR(data.page.share_amount)}</strong></p>
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
						onclick={handleRequestUpdate}
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
						disabled={acting}
						class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-[#251818] bg-[#fff0ef] hover:bg-[#fbe3e1] disabled:opacity-50 transition-colors"
					>
						<Bell class="w-4 h-4" /> Remind
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
