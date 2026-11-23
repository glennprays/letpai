<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { Bell, Check, CircleCheck, Undo2, Trash2, ChevronLeft, ImageIcon } from 'lucide-svelte';
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
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import StatusPill from '$lib/components/ui/StatusPill.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import ShareReceipt from '$lib/components/session/ShareReceipt.svelte';
	import { PaidStamp } from '$lib/components/art';
	import { paymentStatusOf } from '$lib/utils/status';
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

	const st = $derived(paymentStatusOf(status));
	const share = $derived(data.page.fee_breakdown?.total ?? data.page.share_amount);

	async function handleApprove() {
		acting = true;
		try {
			await approvePayment(data.participantId);
			toast.success('Payment approved.');
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
			toast.success('Sent back. They can upload a new screenshot.');
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
			toast.success('Marked as paid.');
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
			toast.success(r.message || 'Reminder sent.');
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
				toast.error(e.message || 'You reminded them recently. Try again later.');
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
			toast.success(`${data.page.participant_name} left the session.`);
			goto(`/sessions/${data.sessionId}`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Remove failed');
		} finally {
			acting = false;
			showRemove = false;
		}
	}
</script>

<Seo title="{data.page.participant_name} · {data.page.session_name}" noindex />

<div class="mx-auto max-w-5xl px-4 pt-5 pb-12 sm:px-6 md:pt-8">
	<a href="/sessions/{data.sessionId}" class="-ml-2 inline-flex h-9 max-w-full items-center gap-1 rounded-pill pr-3 pl-1.5 text-sm font-semibold text-ink-soft hover:bg-mist hover:text-ink">
		<ChevronLeft size={18} class="flex-none" aria-hidden="true" /><span class="truncate">{data.page.session_name}</span>
	</a>

	<div class="mt-4 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
		<div class="flex min-w-0 flex-col gap-6">
			<header class="flex items-center gap-4">
				<Avatar size="xl" fullName={data.page.participant_name} identifier={data.participantId} />
				<div class="min-w-0">
					<h1 class="text-heading text-[clamp(1.75rem,4vw,2.5rem)] [overflow-wrap:anywhere]">{data.page.participant_name}</h1>
					<div class="mt-1.5 flex flex-wrap items-center gap-2">
						<StatusPill tone={st.tone}>{st.label}</StatusPill>
						{#if data.page.is_expired}<StatusPill tone="neutral">Link expired</StatusPill>{/if}
					</div>
				</div>
			</header>

			<section class="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Their share">
				<p class="text-amount text-[clamp(2.75rem,8vw,4rem)] leading-[0.9] tracking-[-0.045em]">{formatIDR(share)}</p>
				{#if isPaid}<PaidStamp animate />{/if}
			</section>

			<!-- The one decision this screen exists for, first. -->
			{#if status === 'submitted'}
				<Card>
					<h2 class="text-heading text-xl">Check the screenshot</h2>
					<p class="mt-1 text-[15px] text-ink-soft">Does the transfer match {formatIDR(share)}?</p>
					<div class="mt-4 flex flex-wrap gap-2">
						<Button variant="ink" leftIcon={Check} loading={acting && !rejectSubmitting} disabled={acting} onclick={handleApprove}>Approve</Button>
						<Button variant="secondary" leftIcon={Undo2} disabled={acting} onclick={openRequestUpdate}>Send back</Button>
					</div>
				</Card>
			{:else if !isPaid}
				<Card>
					<h2 class="text-heading text-xl">{status === 'rejected' ? 'Waiting for a new screenshot' : 'Not paid yet'}</h2>
					{#if data.page.rejection_reason}
						<p class="mt-2 rounded-field bg-rejected-tint px-4 py-3 text-[15px] text-rejected">You said: "{data.page.rejection_reason}"</p>
					{:else}
						<p class="mt-1 text-[15px] text-ink-soft">They haven't uploaded a transfer screenshot.</p>
					{/if}
					<div class="mt-4 flex flex-wrap gap-2">
						<Button variant="secondary" leftIcon={Bell} disabled={reminderDisabled} onclick={handleRemind}>
							{remainingMs > 0 ? `Remind again in ${formatCooldown(remainingMs)}` : 'Remind on WhatsApp'}
						</Button>
						<Button variant="ghost" leftIcon={CircleCheck} disabled={acting} onclick={handleMarkPaid}>Mark as paid (no proof)</Button>
					</div>
				</Card>
			{/if}

			<section aria-labelledby="proof-h">
				<h2 id="proof-h" class="text-heading mb-3 text-xl">{status === 'rejected' ? 'Last screenshot' : 'Transfer screenshot'}</h2>
				{#if proofUrl}
					<a href={proofUrl} target="_blank" rel="noopener noreferrer" class="block overflow-hidden rounded-card bg-card shadow-raised" aria-label="Open the screenshot full size">
						<img src={proofUrl} alt="Transfer screenshot from {data.page.participant_name}" class="max-h-[440px] w-full bg-fog object-contain" />
					</a>
				{:else}
					<div class="flex items-center gap-3 rounded-card border-2 border-dashed border-hairline px-5 py-6 text-[15px] text-ink-soft">
						<ImageIcon size={22} aria-hidden="true" />{isPaid ? 'Marked as paid by you, no screenshot.' : 'Nothing uploaded yet.'}
					</div>
				{/if}
			</section>

		</div>

		<aside class="lg:sticky lg:top-6" aria-label="Their bill">
			<ShareReceipt page={data.page} title="Their share" />
		</aside>

		<!-- Destructive action last, after the receipt on phones. -->
		<div class="border-t-[1.5px] border-dashed border-hairline pt-5 lg:col-start-1">
			<Button variant="ghost" leftIcon={Trash2} disabled={acting} onclick={() => (showRemove = true)} class="-ml-3 text-rejected hover:bg-rejected-tint">Remove from session</Button>
		</div>
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
	title="Remove {data.page.participant_name}?"
	message={isPaid
		? `They already paid ${formatIDR(data.page.share_amount)}. Removing them won't refund it, and the other shares change.`
		: status === 'submitted' || status === 'rejected'
			? 'Their uploaded screenshot will be discarded.'
			: 'The other shares are recalculated without them.'}
	confirmText="Remove"
	cancelText="Keep"
	variant="danger"
	loading={acting}
	onconfirm={handleRemove}
	oncancel={() => (showRemove = false)}
/>
