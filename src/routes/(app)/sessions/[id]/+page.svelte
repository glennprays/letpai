<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import {
		ArrowLeft,
		Plus,
		UserPlus,
		CheckCircle2,
		Clock,
		XCircle,
		Loader2,
		Users,
		Receipt,
		Share2,
		Phone,
		Type,
		Trash2,
		Send,
		Bell,
		ImageIcon,
		ThumbsUp,
		ThumbsDown
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import { formatIDR, formatRelativeTime } from '$lib/utils/format';
	import {
		addParticipants,
		addBillItem,
		deleteBillItem,
		calculateSplits,
		sendNotifications,
		cancelSession
	} from '$lib/services/sessions';
	import { createContact } from '$lib/services/contacts';
	import { sendParticipantReminder, sendBulkReminder } from '$lib/services/notifications';
	import {
		approvePayment,
		rejectPayment,
		bulkApprove
	} from '$lib/services/payments';
	import Modal from '$lib/components/ui/Modal.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import { toast } from '$lib/stores/toast';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let showAddContactModal = $state(false);
	let showAddBillModal = $state(false);
	let showCancelDialog = $state(false);
	let isLoading = $state(false);
	let isSplitting = $state(false);
	let isNotifying = $state(false);
	let isCancelling = $state(false);
	let isBulkReminding = $state(false);
	let remindingParticipantId = $state<string | null>(null);
	let actingPaymentId = $state<string | null>(null);
	let isBulkApproving = $state(false);
	let contactsPickerSupported = $state(false);

	const submittedProofs = $derived(
		(data.session.participants || []).filter((p) => p.payment_status === 'submitted')
	);

	// Add-participant modal state
	type AddTab = 'contacts' | 'group' | 'manual';
	let addTab = $state<AddTab>('contacts');
	let contactSearch = $state('');
	let selectedContactIds = $state<string[]>([]);
	let selectedGroupId = $state<string>('');
	let groupSelectedIds = $state<string[]>([]);
	let manualName = $state('');
	let manualPhone = $state('');
	let manualSaveToContacts = $state(false);

	// Set of contact_ids already linked into this session (for dedupe).
	const linkedContactIds = $derived(
		new Set(
			(data.session.participants || [])
				.map((p) => p.contact_id)
				.filter((id): id is string => typeof id === 'string' && id.length > 0)
		)
	);

	const filteredContacts = $derived.by(() => {
		const q = contactSearch.trim().toLowerCase();
		const list = data.contacts || [];
		if (!q) return list;
		return list.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				(c.whatsapp_number || '').toLowerCase().includes(q)
		);
	});

	const selectedGroup = $derived(
		(data.groups || []).find((g) => g.group_id === selectedGroupId) || null
	);

	const groupMembers = $derived(
		selectedGroupId
			? (data.contacts || []).filter((c) => c.group_id === selectedGroupId)
			: []
	);

	// When the selected group changes, pre-select all its members that aren't
	// already participants.
	$effect(() => {
		if (selectedGroupId) {
			groupSelectedIds = groupMembers
				.filter((c) => !linkedContactIds.has(c.contact_id))
				.map((c) => c.contact_id);
		} else {
			groupSelectedIds = [];
		}
	});

	function resetAddModal() {
		addTab = 'contacts';
		contactSearch = '';
		selectedContactIds = [];
		selectedGroupId = '';
		groupSelectedIds = [];
		manualName = '';
		manualPhone = '';
		manualSaveToContacts = false;
	}

	function toggleContactId(list: string[], id: string): string[] {
		return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
	}

	// Temporary state for adding bill (single `description` field — matches backend)
	let newBillName = $state('');
	let newBillAmount = $state('');

	$effect(() => {
		contactsPickerSupported = 'contacts' in navigator && 'ContactsManager' in window;
	});

	function getCurrencySymbol(currency: string): string {
		const symbols: Record<string, string> = {
			IDR: 'Rp',
			USD: '$',
			EUR: '€',
			SGD: 'S$'
		};
		return symbols[currency] || currency;
	}

	function getStatusColor(status: string): string {
		if (status === 'draft') return 'text-[#584140] bg-[#fff0ef]';
		if (status === 'pending') return 'text-[#92400E] bg-[#F59E0B]/15';
		if (status === 'in_progress') return 'text-[#1E40AF] bg-[#3B82F6]/15';
		if (status === 'completed') return 'text-[#047857] bg-[#10B981]/15';
		return 'text-[#991B1B] bg-[#EF4444]/15';
	}

	function getStatusIcon(status: string) {
		if (status === 'draft') return Clock;
		if (status === 'pending') return Clock;
		if (status === 'in_progress') return Clock;
		if (status === 'completed') return CheckCircle2;
		return XCircle;
	}

	const HeaderStatusIcon = $derived(getStatusIcon(data.session.status));

	async function openContactsPicker() {
		if (!contactsPickerSupported) return;

		try {
			const contacts = await (navigator as { contacts?: { select: (fields: string[], opts: { multiple: boolean }) => Promise<Array<{ name?: string[]; tel?: string[] }>> } }).contacts!.select(
				['name', 'tel'],
				{ multiple: true }
			);

			if (contacts && contacts.length > 0) {
				const payload = contacts
					.map((c) => ({
						custom_name: Array.isArray(c.name) ? c.name[0] : (c.name as string | undefined) || 'Unknown',
						custom_whatsapp: c.tel?.[0] || ''
					}))
					.filter((p) => p.custom_whatsapp.length > 0);

				if (payload.length > 0) {
					isLoading = true;
					try {
						await addParticipants(data.session.session_id, { participants: payload });
						await invalidateAll();
					} finally {
						isLoading = false;
					}
				}
			}
		} catch (error) {
			console.error('Contacts picker error:', error);
			toast.error('Failed to import contacts');
		}
	}

	type ParticipantItem =
		| { contact_id: string }
		| { custom_name: string; custom_whatsapp: string };

	async function submitParticipants(items: ParticipantItem[]) {
		if (items.length === 0) {
			toast.error('Nothing to add');
			return;
		}
		isLoading = true;
		try {
			await addParticipants(data.session.session_id, { participants: items });
			showAddContactModal = false;
			resetAddModal();
			await invalidateAll();
			toast.success(items.length === 1 ? 'Participant added' : `${items.length} participants added`);
		} catch (error) {
			console.error('Add participant error:', error);
			toast.error('Failed to add participant');
		} finally {
			isLoading = false;
		}
	}

	async function handleAddFromContacts() {
		const fresh = selectedContactIds.filter((id) => !linkedContactIds.has(id));
		const dupes = selectedContactIds.length - fresh.length;
		if (dupes > 0) toast.warning(`${dupes} already in this session, skipped`);
		await submitParticipants(fresh.map((id) => ({ contact_id: id })));
	}

	async function handleAddFromGroup() {
		const fresh = groupSelectedIds.filter((id) => !linkedContactIds.has(id));
		const dupes = groupSelectedIds.length - fresh.length;
		if (dupes > 0) toast.warning(`${dupes} already in this session, skipped`);
		await submitParticipants(fresh.map((id) => ({ contact_id: id })));
	}

	async function handleAddManual() {
		const name = manualName.trim();
		const phone = manualPhone.trim();
		if (!name || phone.length < 10) {
			toast.error('Enter a name and a valid phone number');
			return;
		}

		isLoading = true;
		try {
			if (manualSaveToContacts) {
				try {
					const created = await createContact(
						{ name, whatsapp_number: phone },
						undefined,
						undefined
					);
					const contactId = created?.data?.contact_id;
					if (contactId) {
						await submitParticipants([{ contact_id: contactId }]);
						return;
					}
				} catch (err) {
					console.error('Save contact failed, falling back to custom:', err);
					toast.error('Could not save contact; added as one-off participant');
				}
			}
			await submitParticipants([{ custom_name: name, custom_whatsapp: phone }]);
		} finally {
			isLoading = false;
		}
	}

	async function handleCalculateSplits() {
		if (!data.session.participants?.length) {
			toast.error('Add participants first');
			return;
		}
		if (!data.session.bills?.length) {
			toast.error('Add at least one bill item first');
			return;
		}
		isSplitting = true;
		try {
			await calculateSplits(data.session.session_id);
			await invalidateAll();
			toast.success('Splits calculated');
		} catch (error) {
			console.error('Calculate splits error:', error);
			toast.error('Failed to calculate splits');
		} finally {
			isSplitting = false;
		}
	}

	async function handleAddBill() {
		if (!newBillName.trim() || !newBillAmount.trim()) return;
		const amount = parseFloat(newBillAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			toast.error('Enter a valid amount');
			return;
		}

		isLoading = true;
		try {
			await addBillItem(data.session.session_id, {
				description: newBillName.trim(),
				amount
			});
			// Recompute equal splits across participants now that bill totals changed
			if (data.session.participants?.length) {
				try {
					await calculateSplits(data.session.session_id);
				} catch (e) {
					console.warn('Auto-recalculate splits failed:', e);
				}
			}
			newBillName = '';
			newBillAmount = '';
			showAddBillModal = false;
			await invalidateAll();
		} catch (error) {
			console.error('Add bill error:', error);
			toast.error('Failed to add bill');
		} finally {
			isLoading = false;
		}
	}

	async function handleDeleteBill(billItemId: string) {
		if (!confirm('Are you sure you want to delete this bill?')) return;
		isLoading = true;
		try {
			await deleteBillItem(data.session.session_id, billItemId);
			if (data.session.participants?.length) {
				try {
					await calculateSplits(data.session.session_id);
				} catch (e) {
					console.warn('Auto-recalculate splits failed:', e);
				}
			}
			await invalidateAll();
		} catch (error) {
			console.error('Delete bill error:', error);
			toast.error('Failed to delete bill');
		} finally {
			isLoading = false;
		}
	}

	async function handleSendNotifications() {
		if (!data.session.participants?.length) {
			toast.error('Add participants first');
			return;
		}
		isNotifying = true;
		try {
			await sendNotifications(data.session.session_id);
			toast.success('Notifications sent');
		} catch (error) {
			console.error('Send notifications error:', error);
			toast.error('Failed to send notifications');
		} finally {
			isNotifying = false;
		}
	}

	function openAddBillModal() {
		if (!data.session.participants || data.session.participants.length === 0) {
			toast.error('Please add participants first before adding bills.');
			return;
		}
		showAddBillModal = true;
	}

	function handleBack() {
		goto('/dashboard');
	}

	async function handleRemindParticipant(participantId: string) {
		remindingParticipantId = participantId;
		try {
			const result = await sendParticipantReminder(participantId);
			toast.success(result.message || 'Reminder sent');
		} catch (error) {
			console.error('Send reminder error:', error);
			const msg = error instanceof Error ? error.message : 'Failed to send reminder';
			toast.error(msg);
		} finally {
			remindingParticipantId = null;
		}
	}

	async function handleBulkReminder() {
		if (!data.session.participants?.length) return;
		isBulkReminding = true;
		try {
			const result = await sendBulkReminder(data.session.session_id);
			toast.success(result.message || 'Reminders sent to all unpaid participants');
		} catch (error) {
			console.error('Bulk reminder error:', error);
			const msg = error instanceof Error ? error.message : 'Failed to send reminders';
			toast.error(msg);
		} finally {
			isBulkReminding = false;
		}
	}

	async function handleApprove(participantId: string) {
		actingPaymentId = participantId;
		try {
			await approvePayment(participantId);
			toast.success('Payment approved');
			await invalidateAll();
		} catch (error) {
			console.error('Approve payment error:', error);
			toast.error('Failed to approve payment');
		} finally {
			actingPaymentId = null;
		}
	}

	async function handleReject(participantId: string) {
		const reason = window.prompt('Reason for rejection (optional):') ?? undefined;
		actingPaymentId = participantId;
		try {
			await rejectPayment(participantId, reason);
			toast.success('Payment rejected');
			await invalidateAll();
		} catch (error) {
			console.error('Reject payment error:', error);
			toast.error('Failed to reject payment');
		} finally {
			actingPaymentId = null;
		}
	}

	async function handleBulkApproveAll() {
		const ids = submittedProofs.map((p) => p.participant_id);
		if (ids.length === 0) return;
		isBulkApproving = true;
		try {
			const result = await bulkApprove(ids);
			toast.success(result.message || `Approved ${ids.length} payments`);
			await invalidateAll();
		} catch (error) {
			console.error('Bulk approve error:', error);
			toast.error('Failed to approve payments');
		} finally {
			isBulkApproving = false;
		}
	}

	async function handleCancelSession() {
		isCancelling = true;
		try {
			await cancelSession(data.session.session_id);
			toast.success('Session cancelled');
			goto('/dashboard');
		} catch (error) {
			console.error('Cancel session error:', error);
			toast.error('Failed to cancel session');
		} finally {
			isCancelling = false;
			showCancelDialog = false;
		}
	}
</script>

<div class="min-h-screen">
	<div class="max-w-4xl mx-auto px-4 py-8">
		<!-- Header -->
		<header class="flex items-center gap-4 mb-8">
			<button
				onclick={handleBack}
				class="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl bg-white hover:bg-[#fff0ef] transition-colors"
			>
				<ArrowLeft class="w-5 h-5 text-[#584140]" />
			</button>
			<div class="flex-1">
				<h1 class="text-xl font-semibold text-[#251818] tracking-tight">
					{data.session.title}
				</h1>
				<p class="text-sm text-[#584140] mt-0.5">
					Created {formatRelativeTime(data.session.created_at)}
				</p>
			</div>
			<div class="flex items-center gap-2">
				<span class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full {getStatusColor(data.session.status)}">
					<HeaderStatusIcon class="w-3.5 h-3.5" />
					{data.session.status}
				</span>
				{#if data.session.status !== 'cancelled' && data.session.status !== 'completed'}
					<button
						type="button"
						onclick={() => (showCancelDialog = true)}
						class="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-[#584140] hover:bg-[#fbe3e1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
						title="Cancel session"
						aria-label="Cancel session"
					>
						<XCircle class="w-5 h-5" />
					</button>
				{/if}
			</div>
		</header>

		<!-- Description -->
		{#if data.session.description}
			<p class="text-[#584140] mb-6">{data.session.description}</p>
		{/if}

		<!-- Quick Stats -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
			<div class="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-[#FF6B6B]/10 rounded-xl flex items-center justify-center">
						<Receipt class="w-5 h-5 text-[#FF6B6B]" />
					</div>
					<div>
						<p class="text-sm text-[#584140]">Total</p>
						<p class="text-lg font-semibold text-[#251818]">
							{formatIDR(data.session.total_amount)}
						</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
						<Users class="w-5 h-5 text-blue-600" />
					</div>
					<div>
						<p class="text-sm text-[#584140]">Participants</p>
						<p class="text-lg font-semibold text-[#251818]">
							{data.session.participants?.length || 0}
						</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-[#10B981]/15 rounded-2xl flex items-center justify-center">
						<CheckCircle2 class="w-5 h-5 text-[#047857]" />
					</div>
					<div>
						<p class="text-sm text-[#584140]">Paid</p>
						<p class="text-lg font-semibold text-[#251818]">{data.session.paid_count}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Participants Section -->
		<section class="bg-white rounded-2xl p-6 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-[#251818]">Participants</h2>
				<button
					onclick={() => (showAddContactModal = true)}
					class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-xl transition-colors"
				>
					<UserPlus class="w-4 h-4" />
					Add Contact
				</button>
			</div>

			<!-- Actions -->
			{#if data.session.participants && data.session.participants.length > 0}
				<div class="mb-4 p-4 bg-[#fff0ef] rounded-2xl flex flex-wrap items-center justify-between gap-3">
					<div>
						<h3 class="text-sm font-medium text-[#251818]">Equal Split &amp; Notify</h3>
						<p class="text-xs text-[#584140] mt-0.5">
							Divide the total across all {data.session.participants.length} participants, then notify everyone.
						</p>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<button
							type="button"
							onclick={handleCalculateSplits}
							disabled={isSplitting || isLoading || !data.session.bills?.length}
							class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#006b5f] bg-[#6df5e1] rounded-2xl hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
						>
							{#if isSplitting}
								<Loader2 class="w-4 h-4 animate-spin" />
							{:else}
								<Share2 class="w-4 h-4" />
							{/if}
							Calculate Splits
						</button>
						<button
							type="button"
							onclick={handleSendNotifications}
							disabled={isNotifying || isLoading}
							class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-2xl hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
						>
							{#if isNotifying}
								<Loader2 class="w-4 h-4 animate-spin" />
							{:else}
								<Send class="w-4 h-4" />
							{/if}
							Send Notifications
						</button>
						<button
							type="button"
							onclick={handleBulkReminder}
							disabled={isBulkReminding || isLoading}
							class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#251818] bg-white rounded-2xl hover:bg-[#fff0ef] disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
							title="Send a reminder to every unpaid participant"
						>
							{#if isBulkReminding}
								<Loader2 class="w-4 h-4 animate-spin" />
							{:else}
								<Bell class="w-4 h-4" />
							{/if}
							Remind All
						</button>
					</div>
				</div>
			{/if}

			<!-- Participants List -->
			{#if !data.session.participants || data.session.participants.length === 0}
				<div class="text-center py-8 text-[#584140]">
					<Users class="w-12 h-12 mx-auto text-[#584140]/30 mb-3" />
					<p class="text-sm">No participants yet. Add contacts to get started.</p>
				</div>
			{:else}
				<ul class="space-y-2">
					{#each data.session.participants as participant}
						<li class="flex items-center justify-between p-3 rounded-2xl bg-[#fff0ef]/50">
							<div class="flex items-center gap-3 min-w-0">
								<div class="w-10 h-10 bg-[#fff0ef] rounded-full flex items-center justify-center text-sm font-medium text-[#251818] flex-shrink-0">
									{participant.name.charAt(0).toUpperCase()}
								</div>
								<div class="min-w-0">
									<p class="text-sm font-medium text-[#251818] truncate">{participant.name}</p>
									<p class="text-xs text-[#584140] truncate">{participant.whatsapp_number}</p>
								</div>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<div class="text-right">
									<p class="text-sm font-medium text-[#251818]">
										{formatIDR(participant.share_amount)}
									</p>
									<p class="text-xs text-[#584140]">{participant.payment_status}</p>
								</div>
								{#if participant.payment_status !== 'paid'}
									<button
										type="button"
										onclick={() => handleRemindParticipant(participant.participant_id)}
										disabled={remindingParticipantId === participant.participant_id || isLoading}
										class="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-[#584140] hover:bg-[#fbe3e1] disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
										title="Send reminder"
										aria-label="Send reminder to {participant.name}"
									>
										{#if remindingParticipantId === participant.participant_id}
											<Loader2 class="w-4 h-4 animate-spin" />
										{:else}
											<Bell class="w-4 h-4" />
										{/if}
									</button>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<!-- Payment Proofs Review -->
		{#if submittedProofs.length > 0}
			<section class="bg-white rounded-2xl p-6 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
				<div class="flex items-center justify-between mb-4 flex-wrap gap-3">
					<div>
						<h2 class="text-lg font-semibold text-[#251818]">Payment Review</h2>
						<p class="text-xs text-[#584140] mt-0.5">
							{submittedProofs.length} pending {submittedProofs.length === 1 ? 'proof' : 'proofs'}
						</p>
					</div>
					{#if submittedProofs.length > 1}
						<button
							type="button"
							onclick={handleBulkApproveAll}
							disabled={isBulkApproving}
							class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#006b5f] bg-[#6df5e1] rounded-2xl hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
						>
							{#if isBulkApproving}
								<Loader2 class="w-4 h-4 animate-spin" />
							{:else}
								<ThumbsUp class="w-4 h-4" />
							{/if}
							Approve All
						</button>
					{/if}
				</div>

				<ul class="space-y-3">
					{#each submittedProofs as proof}
						<li class="p-3 rounded-2xl bg-[#fff0ef]/50 flex items-start gap-3 flex-wrap">
							{#if proof.payment_proof_url}
								<a
									href={proof.payment_proof_url}
									target="_blank"
									rel="noopener noreferrer"
									class="block w-16 h-16 rounded-2xl overflow-hidden bg-white flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
									title="Open proof"
								>
									<img
										src={proof.payment_proof_url}
										alt="Payment proof from {proof.name}"
										class="w-full h-full object-cover"
									/>
								</a>
							{:else}
								<div class="w-16 h-16 rounded-2xl bg-[#fbe3e1] flex items-center justify-center flex-shrink-0">
									<ImageIcon class="w-6 h-6 text-[#584140]/50" />
								</div>
							{/if}

							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-[#251818] truncate">{proof.name}</p>
								<p class="text-xs text-[#584140] truncate">{proof.whatsapp_number}</p>
								<p class="text-sm text-[#251818] mt-1">
									{formatIDR(proof.share_amount)}
								</p>
							</div>

							<div class="flex items-center gap-2 flex-shrink-0">
								<button
									type="button"
									onclick={() => handleApprove(proof.participant_id)}
									disabled={actingPaymentId === proof.participant_id}
									class="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-medium text-[#047857] bg-[#10B981]/15 hover:bg-[#10B981]/25 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
								>
									{#if actingPaymentId === proof.participant_id}
										<Loader2 class="w-4 h-4 animate-spin" />
									{:else}
										<ThumbsUp class="w-4 h-4" />
									{/if}
									Approve
								</button>
								<button
									type="button"
									onclick={() => handleReject(proof.participant_id)}
									disabled={actingPaymentId === proof.participant_id}
									class="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-medium text-[#991B1B] bg-[#EF4444]/15 hover:bg-[#EF4444]/25 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
								>
									<ThumbsDown class="w-4 h-4" />
									Reject
								</button>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- Bill Items Section -->
		<section class="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-[#251818]">Bill Items</h2>
				<button
					onclick={openAddBillModal}
					class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-xl transition-colors"
				>
					<Plus class="w-4 h-4" />
					Add Bill
				</button>
			</div>

			{#if !data.session.bills || data.session.bills.length === 0}
				<div class="text-center py-8 text-[#584140]">
					<Receipt class="w-12 h-12 mx-auto text-[#584140]/30 mb-3" />
					<p class="text-sm">No bill items yet. Add bills to track expenses.</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each data.session.bills as item}
						<div class="p-4 rounded-2xl bg-[#fff0ef]/50">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<Receipt class="w-4 h-4 text-[#584140] flex-shrink-0" />
										<p class="text-sm font-medium text-[#251818] truncate">{item.description}</p>
									</div>
									{#if item.category}
										<p class="text-xs text-[#584140] mt-1 ml-6 capitalize">{item.category}</p>
									{/if}
								</div>
								<div class="flex items-center gap-3 flex-shrink-0">
									<p class="text-sm font-semibold text-[#251818]">{formatIDR(item.amount)}</p>
									<button
										onclick={() => handleDeleteBill(item.bill_item_id)}
										class="p-2.5 text-[#584140] hover:text-[#991B1B] hover:bg-[#EF4444]/10 rounded-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
										title="Delete bill"
									>
										<Trash2 class="w-5 h-5" />
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Total Summary -->
			{#if data.session.bills && data.session.bills.length > 0}
				<div class="mt-4 pt-4">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-[#584140]">Total Bills</span>
						<span class="text-lg font-semibold text-[#251818]">
							{formatIDR(data.session.total_amount)}
						</span>
					</div>
				</div>
			{/if}
		</section>
	</div>
</div>

<!-- Add Participant Modal -->
<Modal bind:open={showAddContactModal} title="Add Participant" onclose={resetAddModal}>
	<div class="space-y-4">
		<!-- Tabs -->
		<div class="flex gap-1 bg-[#fff0ef]/60 p-1 rounded-xl text-sm">
			{#each [
				{ id: 'contacts' as AddTab, label: 'From Contacts' },
				{ id: 'group' as AddTab, label: 'From Group' },
				{ id: 'manual' as AddTab, label: 'Manual' }
			] as tab}
				<button
					type="button"
					onclick={() => (addTab = tab.id)}
					class="flex-1 px-3 py-1.5 rounded-lg font-medium transition-colors {addTab ===
					tab.id
						? 'bg-white text-[#251818] shadow-sm'
						: 'text-[#584140] hover:bg-white/60'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>

		{#if addTab === 'contacts'}
			{#if !data.contacts || data.contacts.length === 0}
				<p class="text-sm text-[#584140] text-center py-6">
					You don't have any saved contacts yet. Use the Manual tab to add one.
				</p>
			{:else}
				<div>
					<input
						type="text"
						bind:value={contactSearch}
						placeholder="Search contacts…"
						class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
					/>
				</div>

				<div class="max-h-64 overflow-y-auto -mx-1 px-1 space-y-1">
					{#each filteredContacts as contact (contact.contact_id)}
						{@const linked = linkedContactIds.has(contact.contact_id)}
						{@const checked = selectedContactIds.includes(contact.contact_id)}
						<label
							class="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-[#fff0ef]/60 {linked
								? 'opacity-50 cursor-not-allowed'
								: ''}"
						>
							<input
								type="checkbox"
								class="w-4 h-4 accent-[#ae2f34]"
								disabled={linked}
								checked={checked || linked}
								onchange={() => {
									if (!linked)
										selectedContactIds = toggleContactId(selectedContactIds, contact.contact_id);
								}}
							/>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-[#251818] truncate">{contact.name}</p>
								<p class="text-xs text-[#584140] truncate">{contact.whatsapp_number}</p>
							</div>
							{#if linked}
								<span class="text-[10px] uppercase tracking-wide text-[#584140]">In session</span>
							{/if}
						</label>
					{/each}
					{#if filteredContacts.length === 0}
						<p class="text-sm text-[#584140] text-center py-6">No contacts match "{contactSearch}".</p>
					{/if}
				</div>

				<div class="flex items-center justify-between text-xs text-[#584140] pt-1">
					<span>{selectedContactIds.length} selected</span>
					{#if contactsPickerSupported}
						<button
							type="button"
							onclick={openContactsPicker}
							class="inline-flex items-center gap-1 text-[#FF6B6B] hover:underline"
						>
							<Phone class="w-3 h-3" /> Import from device
						</button>
					{/if}
				</div>
			{/if}
		{:else if addTab === 'group'}
			{#if !data.groups || data.groups.length === 0}
				<p class="text-sm text-[#584140] text-center py-6">
					You haven't created any contact groups yet. Manage groups from /contacts.
				</p>
			{:else}
				<div>
					<label for="group_select" class="block text-sm font-medium text-[#251818] mb-1">Group</label>
					<select
						id="group_select"
						bind:value={selectedGroupId}
						class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
					>
						<option value="">Choose a group…</option>
						{#each data.groups as g (g.group_id)}
							<option value={g.group_id}>{g.name}</option>
						{/each}
					</select>
				</div>

				{#if selectedGroup}
					{#if groupMembers.length === 0}
						<p class="text-sm text-[#584140] text-center py-6">
							"{selectedGroup.name}" has no contacts.
						</p>
					{:else}
						<div class="max-h-56 overflow-y-auto -mx-1 px-1 space-y-1">
							{#each groupMembers as contact (contact.contact_id)}
								{@const linked = linkedContactIds.has(contact.contact_id)}
								{@const checked = groupSelectedIds.includes(contact.contact_id)}
								<label
									class="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-[#fff0ef]/60 {linked
										? 'opacity-50 cursor-not-allowed'
										: ''}"
								>
									<input
										type="checkbox"
										class="w-4 h-4 accent-[#ae2f34]"
										disabled={linked}
										checked={checked || linked}
										onchange={() => {
											if (!linked)
												groupSelectedIds = toggleContactId(groupSelectedIds, contact.contact_id);
										}}
									/>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium text-[#251818] truncate">{contact.name}</p>
										<p class="text-xs text-[#584140] truncate">{contact.whatsapp_number}</p>
									</div>
									{#if linked}
										<span class="text-[10px] uppercase tracking-wide text-[#584140]">In session</span>
									{/if}
								</label>
							{/each}
						</div>
						<p class="text-xs text-[#584140]">{groupSelectedIds.length} of {groupMembers.length} selected</p>
					{/if}
				{/if}
			{/if}
		{:else}
			<div>
				<label for="manual_name" class="block text-sm font-medium text-[#251818] mb-1">Name</label>
				<div class="relative">
					<Type class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#584140]" />
					<input
						type="text"
						id="manual_name"
						bind:value={manualName}
						placeholder="Enter name"
						class="w-full pl-10 pr-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
					/>
				</div>
			</div>

			<PhoneInput
				id="manual_phone"
				label="WhatsApp Number"
				placeholder="8123456789"
				bind:value={manualPhone}
			/>

			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					class="w-4 h-4 accent-[#ae2f34]"
					bind:checked={manualSaveToContacts}
				/>
				<span class="text-sm text-[#584140]">Save to my contacts</span>
			</label>
		{/if}

		<div class="flex gap-3 pt-2">
			<button
				onclick={() => (showAddContactModal = false)}
				class="flex-1 px-4 py-2.5 text-sm font-medium text-[#251818] bg-white rounded-xl hover:bg-[#fff0ef] transition-colors"
			>
				Cancel
			</button>
			{#if addTab === 'contacts'}
				<button
					onclick={handleAddFromContacts}
					disabled={isLoading || selectedContactIds.length === 0}
					class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:from-[#9a282c] hover:to-[#FF5252] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{#if isLoading}
						<Loader2 class="w-4 h-4 animate-spin mx-auto" />
					{:else}
						Add {selectedContactIds.length || ''}
					{/if}
				</button>
			{:else if addTab === 'group'}
				<button
					onclick={handleAddFromGroup}
					disabled={isLoading || groupSelectedIds.length === 0}
					class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:from-[#9a282c] hover:to-[#FF5252] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{#if isLoading}
						<Loader2 class="w-4 h-4 animate-spin mx-auto" />
					{:else}
						Add {groupSelectedIds.length || ''}
					{/if}
				</button>
			{:else}
				<button
					onclick={handleAddManual}
					disabled={isLoading || !manualName.trim() || manualPhone.length < 10}
					class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:from-[#9a282c] hover:to-[#FF5252] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{#if isLoading}
						<Loader2 class="w-4 h-4 animate-spin mx-auto" />
					{:else}
						Add Contact
					{/if}
				</button>
			{/if}
		</div>
	</div>
</Modal>

<!-- Add Bill Modal -->
<Modal bind:open={showAddBillModal} title="Add Bill Item">
	<div class="space-y-4">
		<div>
			<label for="bill_name" class="block text-sm font-medium text-[#251818] mb-1">
				Bill Name <span class="text-[#ae2f34]">*</span>
			</label>
			<input
				type="text"
				id="bill_name"
				bind:value={newBillName}
				placeholder="e.g., Nasi Goreng"
				class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
			/>
		</div>

		<div>
			<label for="bill_amount" class="block text-sm font-medium text-[#251818] mb-1">
				Amount ({getCurrencySymbol(data.session.currency)}) <span class="text-[#ae2f34]">*</span>
			</label>
			<input
				type="text"
				id="bill_amount"
				bind:value={newBillAmount}
				placeholder="0"
				inputmode="decimal"
				pattern="[0-9]*[.,]?[0-9]*"
				class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
			/>
			<p class="text-xs text-[#584140] mt-1.5">
				This bill is added to the session total and split equally across all {data.session.participants?.length || 0} participants.
			</p>
		</div>

		<!-- Preview -->
		{#if newBillAmount}
			<div class="p-3 bg-[#fff0ef] rounded-2xl">
				<p class="text-xs text-[#584140] font-medium mb-1">Preview</p>
				<div class="flex items-center justify-between text-sm">
					<span class="text-[#251818]">{newBillName.trim() || 'New bill'}</span>
					<span class="font-semibold text-[#251818]">
						{formatIDR(parseFloat(newBillAmount || '0'))}
					</span>
				</div>
			</div>
		{/if}

		<div class="flex gap-3 pt-2">
			<button
				onclick={() => (showAddBillModal = false)}
				class="flex-1 px-4 py-2.5 text-sm font-medium text-[#251818] bg-white rounded-xl hover:bg-[#fff0ef] transition-colors"
			>
				Cancel
			</button>
			<button
				onclick={handleAddBill}
				disabled={isLoading || !newBillName.trim() || !newBillAmount.trim()}
				class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{#if isLoading}
					<Loader2 class="w-4 h-4 animate-spin mx-auto" />
				{:else}
					Add Bill
				{/if}
			</button>
		</div>
	</div>
</Modal>

<!-- Cancel Session confirm -->
<ConfirmDialog
	open={showCancelDialog}
	title="Cancel session?"
	message="Cancelling closes this session for everyone. Participants will no longer receive notifications or be able to submit payments. This cannot be undone."
	confirmText={isCancelling ? 'Cancelling…' : 'Cancel session'}
	cancelText="Keep session"
	variant="danger"
	onconfirm={handleCancelSession}
	oncancel={() => (showCancelDialog = false)}
/>
