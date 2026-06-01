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
		ThumbsDown,
		MoreVertical,
		Pencil,
		Wallet,
		Copy,
		Percent
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import type { Participant } from '$lib/types/api';
	import { formatIDR, formatRelativeTime } from '$lib/utils/format';
	import {
		addParticipants,
		addBillItem,
		updateBillItem,
		deleteBillItem,
		calculateSplits,
		sendNotifications,
		resendNotifications,
		cancelSession,
		removeParticipant,
		updateSession,
		replaceBankAccounts,
		uploadBillImage,
		getBillImages,
		deleteBillImage as deleteBillImageApi,
		updateFeeConfig,
		type BankAccountInput
	} from '$lib/services/sessions';
	import { createContact } from '$lib/services/contacts';
	import {
		sendParticipantReminder,
		sendBulkReminder,
		retryParticipantNotification
	} from '$lib/services/notifications';
	import { ApiError } from '$lib/services/api';
	import {
		approvePayment,
		rejectPayment,
		bulkApprove,
		markPaidWithoutProof
	} from '$lib/services/payments';
	import Modal from '$lib/components/ui/Modal.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import RejectReasonModal from '$lib/components/ui/RejectReasonModal.svelte';
	import { validateWhatsappNumber } from '$lib/utils/phone';
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

	// Delete-participant state. We use ConfirmDialog with copy that
	// branches on payment_status so the host sees the right warning
	// before nuking a row that already has a proof or has paid.
	let removingParticipant = $state<Participant | null>(null);
	let isRemovingParticipant = $state(false);

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

	// Temporary state for adding bill (single `description` field — matches backend).
	// Amount is held as number|null so it round-trips cleanly with
	// <input type="number" bind:value> — the earlier string + .trim()
	// shape broke once Loop 4 switched the input to type=number,
	// permanently disabling the submit button.
	let newBillName = $state('');
	let newBillAmount = $state<number | null>(null);
	let newBillScope = $state<'everyone' | 'specific'>('everyone');
	let newBillParticipantIds = $state<string[]>([]);

	function resetAddBill() {
		newBillName = '';
		newBillAmount = null;
		newBillScope = 'everyone';
		newBillParticipantIds = [];
		newBillIncludesServiceCharge = true;
		newBillIncludesTax = true;
		// Pre-fill fee % from session config if it exists
		newBillFeeSC = data.session.fee_config?.service_charge_percentage ?? 0;
		newBillFeeTax = data.session.fee_config?.tax_percentage ?? 0;
	}

	// Edit bill state
	let showEditBillModal = $state(false);
	let editBillId = $state('');
	let editBillName = $state('');
	let editBillAmount = $state<number | null>(null);
	let editBillScope = $state<'everyone' | 'specific'>('everyone');
	let editBillParticipantIds = $state<string[]>([]);

	function openEditBillModal(item: { bill_item_id: string; description: string; amount: number; participant_ids?: string[]; includes_service_charge?: boolean; includes_tax?: boolean }) {
		editBillId = item.bill_item_id;
		editBillName = item.description;
		editBillAmount = item.amount;
		editBillParticipantIds = item.participant_ids ?? [];
		editBillScope = editBillParticipantIds.length > 0 ? 'specific' : 'everyone';
		editBillIncludesServiceCharge = item.includes_service_charge !== false;
		editBillIncludesTax = item.includes_tax !== false;
		editBillFeeSC = data.session.fee_config?.service_charge_percentage ?? 0;
		editBillFeeTax = data.session.fee_config?.tax_percentage ?? 0;
		showEditBillModal = true;
	}

	async function handleEditBill() {
		if (!editBillName.trim() || editBillAmount === null) return;
		const amount = editBillAmount;
		if (!Number.isFinite(amount) || amount <= 0) {
			toast.error('Enter a valid amount');
			return;
		}
		isLoading = true;
		try {
			await updateBillItem(data.session.session_id, editBillId, {
				description: editBillName.trim(),
				amount,
				participant_ids: editBillScope === 'specific' ? editBillParticipantIds : [],
				includes_service_charge: editBillIncludesServiceCharge,
				includes_tax: editBillIncludesTax
			});
			if (data.session.participants?.length) {
				try {
					await calculateSplits(data.session.session_id);
				} catch (e) {
					console.warn('Auto-recalculate splits failed:', e);
				}
			}
			showEditBillModal = false;
			await invalidateAll();
			toast.success('Bill updated');
		} catch (error) {
			console.error('Edit bill error:', error);
			toast.error('Failed to update bill');
		} finally {
			isLoading = false;
		}
	}

	// Bill image upload state
	let showAddImageModal = $state(false);
	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let uploadError = $state<string | null>(null);

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			uploadError = 'Please select a JPG, PNG, or WebP image';
			return;
		}

		// Validate file size (5MB)
		if (file.size > 5 * 1024 * 1024) {
			uploadError = 'File size must be under 5MB';
			return;
		}

		selectedFile = file;
		uploadError = null;

		// Generate preview
		const reader = new FileReader();
		reader.onload = () => {
			previewUrl = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	async function handleUploadImage() {
		if (!selectedFile) return;

		isUploading = true;
		uploadProgress = 0;
		uploadError = null;

		try {
			const ext = selectedFile.name.split('.').pop()?.toLowerCase();
			await uploadBillImage(
				data.session.session_id,
				// Convert to base64 (same as payment proof)
				await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => {
						const result = reader.result as string;
						const comma = result.indexOf(',');
						resolve(comma >= 0 ? result.slice(comma + 1) : result);
					};
					reader.onerror = () => reject(reader.error);
					reader.readAsDataURL(selectedFile!);
				}),
				selectedFile.name,
				ext || undefined
			);
			showAddImageModal = false;
			selectedFile = null;
			previewUrl = null;
			await invalidateAll();
			toast.success('Bill image attached');
		} catch (error) {
			console.error('Upload error:', error);
			uploadError = error instanceof Error ? error.message : 'Upload failed';
		} finally {
			isUploading = false;
		}
	}

	async function handleDeleteImage(imageId: string) {
		if (!confirm('Remove this image?')) return;

		try {
			await deleteBillImageApi(data.session.session_id, imageId);
			await invalidateAll();
			toast.success('Image removed');
		} catch (error) {
			console.error('Delete error:', error);
			toast.error('Failed to remove image');
		}
	}

	function toggleEditBillParticipant(id: string) {
		editBillParticipantIds = editBillParticipantIds.includes(id)
			? editBillParticipantIds.filter((x) => x !== id)
			: [...editBillParticipantIds, id];
	}

	function toggleBillParticipant(id: string) {
		newBillParticipantIds = newBillParticipantIds.includes(id)
			? newBillParticipantIds.filter((x) => x !== id)
			: [...newBillParticipantIds, id];
	}

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

	const REMINDER_COOLDOWN_MS = 24 * 60 * 60 * 1000;

	function paymentStatusLabel(p: { payment_status: string; paid_manually?: boolean }): string {
		if (p.payment_status === 'paid') return p.paid_manually ? 'Paid (marked by you)' : 'Paid';
		if (p.payment_status === 'submitted') return 'Submitted';
		if (p.payment_status === 'rejected') return 'Update requested';
		return 'Pending';
	}

	function paymentStatusBadgeClass(status: string): string {
		if (status === 'paid') return 'text-[#047857] bg-[#10B981]/15';
		if (status === 'submitted') return 'text-[#1E40AF] bg-[#3B82F6]/15';
		if (status === 'rejected') return 'text-[#92400E] bg-[#F59E0B]/15';
		return 'text-[#584140] bg-[#fff0ef]';
	}

	function reminderAvailableInMs(participant: { last_notification_at?: string }): number {
		if (!participant.last_notification_at) return 0;
		const last = new Date(participant.last_notification_at).getTime();
		if (Number.isNaN(last)) return 0;
		const remaining = last + REMINDER_COOLDOWN_MS - Date.now();
		return remaining > 0 ? remaining : 0;
	}

	function formatCooldown(ms: number): string {
		const hours = Math.ceil(ms / (60 * 60 * 1000));
		return hours <= 1 ? '<1h' : `${hours}h`;
	}

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
		if (!name) {
			toast.error('Enter a name for the participant');
			return;
		}
		const phoneErr = validateWhatsappNumber(phone);
		if (phoneErr) {
			toast.error(phoneErr);
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
		if (!newBillName.trim() || newBillAmount === null) return;
		const amount = newBillAmount;
		if (!Number.isFinite(amount) || amount <= 0) {
			toast.error('Enter a valid amount');
			return;
		}

		if (newBillScope === 'specific' && newBillParticipantIds.length === 0) {
			toast.error('Pick at least one participant for this bill');
			return;
		}

		isLoading = true;
		try {
			// Save fee percentages to session if user entered them
			if (newBillFeeSC > 0 || newBillFeeTax > 0) {
				await saveFeeConfigIfNeeded(newBillFeeSC, newBillFeeTax);
			}
			await addBillItem(data.session.session_id, {
				description: newBillName.trim(),
				amount,
				participant_ids: newBillScope === 'specific' ? newBillParticipantIds : [],
				includes_service_charge: newBillIncludesServiceCharge,
				includes_tax: newBillIncludesTax
			});
			// Recompute splits across participants now that bill totals changed
			if (data.session.participants?.length) {
				try {
					await calculateSplits(data.session.session_id);
				} catch (e) {
					console.warn('Auto-recalculate splits failed:', e);
				}
			}
			resetAddBill();
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

	// Send-notifications gated path. On the backend's SESSION_NOT_DIRTY
	// 409 we surface a confirm modal: the host already notified everyone
	// and nothing has changed, so re-firing the batch is opt-in via the
	// /resend escape hatch.
	let showResendConfirm = $state(false);
	let resendLastNotifiedAt = $state<string | null>(null);

	// pollUntilSent runs a short invalidate loop after a send/retry so
	// the per-participant chips flip from "Sending…" to "Sent" /
	// "Failed" without the host having to refresh. The async backend
	// goroutine writes its log row a moment after the HTTP send
	// returns, so a single invalidate (the way the page originally
	// worked) frequently caught the row in `queued` and stuck the
	// chip there.
	let pollingNotifications = $state(false);
	async function pollUntilSent(opts: { tries?: number; everyMs?: number } = {}) {
		const tries = opts.tries ?? 5;
		const everyMs = opts.everyMs ?? 1500;
		pollingNotifications = true;
		try {
			for (let i = 0; i < tries; i++) {
				await new Promise((r) => setTimeout(r, everyMs));
				await invalidateAll();
				const anyQueued = (data.session.participants ?? []).some(
					(p) => p.last_notification?.status === 'queued'
				);
				if (!anyQueued) return;
			}
		} finally {
			pollingNotifications = false;
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
			toast.success('Sending — chips will update as messages land');
			await invalidateAll();
		} catch (error) {
			if (
				error instanceof ApiError &&
				error.status === 409 &&
				error.code === 'SESSION_NOT_DIRTY'
			) {
				const body = error.body as { last_notified_at?: string } | undefined;
				resendLastNotifiedAt = body?.last_notified_at ?? null;
				showResendConfirm = true;
			} else {
				console.error('Send notifications error:', error);
				toast.error(error instanceof Error ? error.message : 'Failed to send notifications');
			}
		} finally {
			isNotifying = false;
		}
		// Background poll outside the isNotifying spinner so the
		// button doesn't stay disabled for the entire 7-second window.
		pollUntilSent();
	}

	async function handleConfirmResend() {
		isNotifying = true;
		try {
			await resendNotifications(data.session.session_id);
			toast.success('Re-sending — chips will update as messages land');
			await invalidateAll();
		} catch (error) {
			console.error('Resend notifications error:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to resend');
		} finally {
			isNotifying = false;
			showResendConfirm = false;
			resendLastNotifiedAt = null;
		}
	}

	// Per-participant retry — fires the chip's Retry button.
	let retryingParticipantId = $state<string | null>(null);
	async function handleRetryNotification(participantId: string) {
		retryingParticipantId = participantId;
		try {
			await retryParticipantNotification(participantId);
			toast.success('Retry queued');
			await invalidateAll();
		} catch (error) {
			console.error('Retry error:', error);
			toast.error(error instanceof Error ? error.message : 'Retry failed');
		} finally {
			retryingParticipantId = null;
		}
		// Same short poll as the bulk send so the single retry's
		// "Sending…" → "Sent" / "Failed" transition lands without a
		// manual refresh.
		pollUntilSent();
	}

	// Send vs Resend label is server-driven via is_dirty (computed
	// from last_notified_at + sessions.updated_at + hasUnpaid).
	const sendLabel = $derived(
		data.session.is_dirty || !data.session.last_notified_at
			? 'Send notifications'
			: 'Resend notifications'
	);

	// Friendly status chip background tint, mapped from the use-case
	// boundary's friendly_status string. Falls back to neutral.
	function chipTone(friendly: string | undefined): string {
		if (!friendly) return 'bg-[#fff0ef] text-[#584140]';
		if (friendly.includes('Sent')) return 'bg-[#10B981]/15 text-[#047857]';
		if (friendly.includes('Sending')) return 'bg-[#3B82F6]/15 text-[#1E40AF]';
		if (friendly.includes('Stuck')) return 'bg-[#F59E0B]/15 text-[#92400E]';
		if (friendly.includes('Failed')) return 'bg-[#EF4444]/15 text-[#991B1B]';
		return 'bg-[#fff0ef] text-[#584140]';
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

	// "Request update" replaces the legacy window.prompt with a real
	// modal (RejectReasonModal) so the host gets char-count feedback,
	// validation copy, and keyboard shortcuts. The participant being
	// updated is captured here; the modal commits via submitReject().
	let rejectingParticipant = $state<{ id: string; name?: string | null } | null>(null);
	let rejectSubmitting = $state(false);

	function openRequestUpdate(participantId: string, participantName?: string | null) {
		rejectingParticipant = { id: participantId, name: participantName ?? null };
	}

	async function submitReject(reason: string) {
		if (!rejectingParticipant) return;
		const participantId = rejectingParticipant.id;
		rejectSubmitting = true;
		try {
			await rejectPayment(participantId, reason);
			toast.success('Update requested');
			rejectingParticipant = null;
			await invalidateAll();
		} catch (error) {
			console.error('Request update error:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to request update');
		} finally {
			rejectSubmitting = false;
		}
	}

	async function handleMarkPaid(participantId: string) {
		actingPaymentId = participantId;
		try {
			await markPaidWithoutProof(participantId);
			toast.success('Marked as paid');
			await invalidateAll();
		} catch (error) {
			console.error('Mark as paid error:', error);
			const msg = error instanceof Error ? error.message : 'Failed to mark as paid';
			toast.error(msg);
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

	// Status-branched delete copy. Calling out submitted proofs and
	// (especially) prior payment in plain language is the only thing
	// stopping a host from accidentally removing someone who's already
	// settled up — the backend doesn't gate this by design (host owns
	// their session).
	const removeConfirmMessage = $derived.by(() => {
		const p = removingParticipant;
		if (!p) return '';
		const name = p.name || 'this participant';
		if (p.payment_status === 'paid') {
			return `Remove ${name}? They've paid ${formatIDR(p.share_amount)} — removing won't refund anything, and the remaining shares will rebalance across the rest.`;
		}
		if (p.payment_status === 'submitted' || p.payment_status === 'rejected') {
			return `Remove ${name}? They've already submitted a proof; the upload will be discarded.`;
		}
		return `Remove ${name} from this session?`;
	});

	function openRemoveParticipantDialog(p: Participant) {
		removingParticipant = p;
	}

	async function handleRemoveParticipant() {
		const target = removingParticipant;
		if (!target) return;
		isRemovingParticipant = true;
		try {
			await removeParticipant(data.session.session_id, target.participant_id);
			toast.success(`${target.name || 'Participant'} removed`);
			removingParticipant = null;
			await invalidateAll();
		} catch (error) {
			console.error('Remove participant error:', error);
			const msg = error instanceof Error ? error.message : 'Failed to remove participant';
			toast.error(msg);
		} finally {
			isRemovingParticipant = false;
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

	// Overflow menu (replaces the lone X icon that sat next to the
	// status badge — too easy to click by accident, and Cancel is
	// always one-tap-away-from-data-loss). Edit / Bank accounts /
	// Cancel session all live under the same trigger now.
	let showOverflowMenu = $state(false);
	$effect(() => {
		if (!showOverflowMenu) return;
		function handleClickOutside(e: MouseEvent) {
			const t = e.target as HTMLElement | null;
			if (t && t.closest('[data-session-overflow]')) return;
			showOverflowMenu = false;
		}
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	// Edit-session modal (title + description). PUT /sessions/:id is
	// already wired; just need a local form + invalidate.
	let showEditSession = $state(false);
	let editTitle = $state('');
	let editDescription = $state('');
	let isSavingEdit = $state(false);
	function openEditSession() {
		editTitle = data.session.title ?? '';
		editDescription = data.session.description ?? '';
		showEditSession = true;
		showOverflowMenu = false;
	}
	async function handleSaveEdit() {
		const title = editTitle.trim();
		if (!title) {
			toast.error('Title is required.');
			return;
		}
		isSavingEdit = true;
		try {
			await updateSession(data.session.session_id, {
				title,
				description: editDescription.trim()
			});
			toast.success('Session updated');
			showEditSession = false;
			await invalidateAll();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Save failed');
		} finally {
			isSavingEdit = false;
		}
	}

	// Bank-accounts management modal. Reuses the repeatable-rows
	// shape from the new-session form; PUTs /sessions/:id/bank-accounts.
	type BankRow = { bank_name: string; account_number: string; account_holder: string };
	const MAX_BANK_ACCOUNTS = 5;
	let showBankModal = $state(false);
	let bankRows = $state<BankRow[]>([]);
	let isSavingBanks = $state(false);
	function openBankModal() {
		const existing = data.session.bank_accounts ?? [];
		bankRows = existing.length
			? existing.map((a) => ({
					bank_name: a.bank_name ?? '',
					account_number: a.account_number ?? '',
					account_holder: a.account_holder ?? ''
			  }))
			: [{ bank_name: '', account_number: '', account_holder: '' }];
		showBankModal = true;
		showOverflowMenu = false;
	}
	function addBankRow() {
		if (bankRows.length >= MAX_BANK_ACCOUNTS) return;
		bankRows = [...bankRows, { bank_name: '', account_number: '', account_holder: '' }];
	}
	function removeBankRow(i: number) {
		bankRows = bankRows.filter((_, idx) => idx !== i);
		if (bankRows.length === 0) {
			bankRows = [{ bank_name: '', account_number: '', account_holder: '' }];
		}
	}
	async function handleSaveBanks() {
		// Drop fully-blank rows up front — backend would silently
		// drop them too but this keeps the count we report honest.
		const accounts: BankAccountInput[] = bankRows
			.map((r) => ({
				bank_name: r.bank_name.trim() || undefined,
				account_number: r.account_number.trim() || undefined,
				account_holder: r.account_holder.trim() || undefined
			}))
			.filter((r) => r.bank_name || r.account_number || r.account_holder);
		isSavingBanks = true;
		try {
			await replaceBankAccounts(data.session.session_id, accounts);
			toast.success(accounts.length ? 'Bank accounts updated' : 'Bank accounts cleared');
			showBankModal = false;
			await invalidateAll();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Save failed');
		} finally {
			isSavingBanks = false;
		}
	}

	// Tap-to-copy a bank account number on the inline card.
	async function copyText(text: string | null | undefined) {
		if (!text) return;
		try {
			await navigator.clipboard?.writeText(text);
			toast.success('Copied');
		} catch {
			toast.error('Copy failed');
		}
	}

	// Fee helper: save fee config to session (called from bill item modals)
	async function saveFeeConfigIfNeeded(sc: number, tax: number) {
		const currentSC = data.session.fee_config?.service_charge_percentage ?? 0;
		const currentTax = data.session.fee_config?.tax_percentage ?? 0;
		if (sc === currentSC && tax === currentTax) return;
		try {
			await updateFeeConfig(data.session.session_id, {
				service_charge_percentage: sc || undefined,
				tax_percentage: tax || undefined
			});
		} catch (e) {
			console.warn('Save fee config failed:', e);
		}
	}

	// Per-bill fee state (used in add & edit modals)
	let newBillIncludesServiceCharge = $state(true);
	let newBillIncludesTax = $state(true);
	let newBillFeeSC = $state<number>(0);
	let newBillFeeTax = $state<number>(0);

	// Edit bill fee state
	let editBillIncludesServiceCharge = $state(true);
	let editBillIncludesTax = $state(true);
	let editBillFeeSC = $state<number>(0);
	let editBillFeeTax = $state<number>(0);

	// Derived: session has fee config already
	const sessionHasFees = $derived(
		(data.session.fee_config?.service_charge_percentage ?? 0) > 0 ||
		(data.session.fee_config?.tax_percentage ?? 0) > 0
	);
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
					<div class="relative" data-session-overflow>
						<button
							type="button"
							onclick={(e) => { e.stopPropagation(); showOverflowMenu = !showOverflowMenu; }}
							class="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-[#584140] hover:bg-[#fbe3e1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
							title="More actions"
							aria-haspopup="menu"
							aria-expanded={showOverflowMenu}
							aria-label="More actions"
						>
							<MoreVertical class="w-5 h-5" />
						</button>
						{#if showOverflowMenu}
							<div
								role="menu"
								class="absolute right-0 top-[calc(100%+8px)] w-[240px] bg-white rounded-2xl shadow-[0_24px_48px_-4px_rgba(37,24,24,0.18)] p-1.5 z-30 animate-[fadeInDown_0.15s_ease-out]"
							>
								<button
									type="button"
									role="menuitem"
									onclick={openEditSession}
									class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#251818] hover:bg-[#fff0ef] transition-colors"
								>
									<Pencil class="w-4 h-4 text-[#584140]" />
									<span>Edit title &amp; description</span>
								</button>
								<button
									type="button"
									role="menuitem"
									onclick={openBankModal}
									class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#251818] hover:bg-[#fff0ef] transition-colors"
								>
									<Wallet class="w-4 h-4 text-[#584140]" />
									<span>Manage bank accounts</span>
								</button>
								<button
									type="button"
									role="menuitem"
									onclick={() => { showOverflowMenu = false; showCancelDialog = true; }}
									class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#991B1B] hover:bg-[#EF4444]/10 transition-colors"
								>
									<XCircle class="w-4 h-4" />
									<span>Cancel session…</span>
								</button>
							</div>
						{/if}
					</div>
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

		<!-- Bank accounts (host view) -->
		<section class="bg-white rounded-2xl p-6 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-[#251818]">Transfer destinations</h2>
				<button
					type="button"
					onclick={openBankModal}
					class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#251818] bg-[#fff0ef] hover:bg-[#fbe3e1] rounded-xl transition-colors"
				>
					<Pencil class="w-3.5 h-3.5" />
					{data.session.bank_accounts && data.session.bank_accounts.length > 0 ? 'Manage' : 'Add'}
				</button>
			</div>
			{#if data.session.bank_accounts && data.session.bank_accounts.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each data.session.bank_accounts as acct (acct.account_id)}
						<div class="rounded-2xl border border-[#fbe3e1] bg-[#fff0ef]/40 p-4">
							{#if acct.bank_name}
								<p class="text-xs uppercase tracking-wider text-[#584140] font-semibold">{acct.bank_name}</p>
							{:else}
								<p class="text-xs uppercase tracking-wider text-[#584140]/60 font-semibold">Bank #{acct.ordinal + 1}</p>
							{/if}
							{#if acct.account_number}
								<div class="mt-1 flex items-center gap-2">
									<p class="text-sm font-mono text-[#251818]">{acct.account_number}</p>
									<button
										type="button"
										onclick={() => copyText(acct.account_number)}
										title="Copy account number"
										aria-label="Copy account number"
										class="text-[#584140] hover:text-[#251818]"
									>
										<Copy class="w-3.5 h-3.5" />
									</button>
								</div>
							{/if}
							{#if acct.account_holder}
								<p class="mt-1 text-sm text-[#584140]">{acct.account_holder}</p>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="rounded-2xl border border-dashed border-[#fbe3e1] p-5 text-center">
					<Wallet class="w-7 h-7 mx-auto text-[#584140]/40 mb-2" />
					<p class="text-sm text-[#584140]">
						No transfer destinations yet. Add one so participants know where to pay.
					</p>
				</div>
			{/if}
		</section>

		<!-- Bill Images Section -->
		<section class="bg-white rounded-2xl p-6 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-[#251818]">Bill Attachments</h2>
				<button
					onclick={() => (showAddImageModal = true)}
					disabled={(data.session.bill_images?.length || 0) >= 5}
					class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#FF6B6B] bg-[#fff0ef] hover:bg-[#fbe3e1] rounded-xl transition-colors disabled:opacity-50"
				>
					<Plus class="w-3.5 h-3.5" />
					Add Image
				</button>
			</div>

			{#if !data.session.bill_images || data.session.bill_images.length === 0}
				<div class="rounded-2xl border border-dashed border-[#fbe3e1] p-5 text-center">
					<Receipt class="w-7 h-7 mx-auto text-[#584140]/40 mb-2" />
					<p class="text-sm text-[#584140]">
						Attach bill images so participants can see the original receipt.
					</p>
				</div>
			{:else}
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{#each data.session.bill_images as img (img.bill_image_id)}
						<div class="relative group">
							<a
								href={img.image_url}
								target="_blank"
								rel="noopener noreferrer"
								class="block aspect-square rounded-2xl overflow-hidden bg-[#fff0ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
								title="Open full size"
							>
								<img
									src={img.thumbnail_url || img.image_url}
									alt={img.file_name}
									class="w-full h-full object-cover"
								/>
							</a>
							<button
								onclick={() => handleDeleteImage(img.bill_image_id)}
								class="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#991B1B] hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
								title="Delete image"
							>
								<Trash2 class="w-3.5 h-3.5" />
							</button>
							<div class="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/60 to-transparent">
								<p class="text-[10px] text-white truncate">{img.file_name}</p>
							</div>
						</div>
					{/each}
				</div>
				<p class="text-xs text-[#584140] mt-2 text-center">
					{data.session.bill_images.length}/5 images • All participants can view these
				</p>
			{/if}
		</section>

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
			{#if data.session.participants && data.session.participants.length > 1}
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
							{sendLabel}
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
						{@const cooldown = reminderAvailableInMs(participant)}
						{@const isAlreadyPaid = participant.payment_status === 'paid'}
						{@const reminderDisabled = isAlreadyPaid || cooldown > 0 || isLoading || remindingParticipantId === participant.participant_id}
						<li class="flex items-center justify-between p-3 rounded-2xl bg-[#fff0ef]/50">
							<a
								href={`/sessions/${data.session.session_id}/participants/${participant.participant_id}`}
								class="flex items-center gap-3 min-w-0 flex-1 no-underline rounded-xl -m-1 p-1 hover:bg-[#fbe3e1]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
								title="Open participant details"
							>
								<div class="w-10 h-10 bg-[#fff0ef] rounded-full flex items-center justify-center text-sm font-medium text-[#251818] flex-shrink-0">
									{(participant.name || '?').charAt(0).toUpperCase()}
								</div>
								<div class="min-w-0">
									<p class="text-sm font-medium text-[#251818] truncate">{participant.name}</p>
									<p class="text-xs text-[#584140] truncate">{participant.whatsapp_number}</p>
									{#if (participant.notification_count ?? 0) > 0}
										<p class="text-[11px] text-[#584140]/80 mt-0.5">
											Reminded {participant.notification_count}×{#if participant.last_notification_at} · last {formatRelativeTime(participant.last_notification_at)}{/if}
										</p>
									{/if}
								</div>
							</a>
							<div class="flex items-center gap-2 flex-shrink-0">
								<div class="text-right">
									<p class="text-sm font-medium text-[#251818]">
										{formatIDR(participant.share_amount)}
									</p>
									<span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium {paymentStatusBadgeClass(participant.payment_status)}">
										{paymentStatusLabel(participant)}
									</span>
									{#if participant.last_notification}
										{@const ln = participant.last_notification}
										{@const isSending = ln.status === 'queued' && !ln.friendly_status.includes('Stuck')}
										{@const canRetry = ln.friendly_status.includes('retry') || ln.friendly_status.includes('Failed') || ln.friendly_status.includes('Stuck')}
										<div class="mt-1 flex items-center gap-1.5 justify-end">
											<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium {chipTone(ln.friendly_status)}" class:animate-pulse={isSending}>
												{#if isSending}
													<Loader2 class="w-2.5 h-2.5 animate-spin" />
												{/if}
												{ln.friendly_status}
											</span>
											{#if canRetry}
												<button
													type="button"
													onclick={(e) => { e.preventDefault(); e.stopPropagation(); handleRetryNotification(participant.participant_id); }}
													disabled={retryingParticipantId === participant.participant_id}
													class="text-[10px] underline text-[#ae2f34] hover:opacity-80 disabled:opacity-50"
												>
													{retryingParticipantId === participant.participant_id ? '…' : 'Retry'}
												</button>
											{/if}
										</div>
									{:else if data.session.last_notified_at}
										<span class="mt-1 inline-block text-[10px] text-[#584140]/70">Not sent yet</span>
									{/if}
								</div>
								{#if !isAlreadyPaid}
									<button
										type="button"
										onclick={() => handleMarkPaid(participant.participant_id)}
										disabled={actingPaymentId === participant.participant_id || isLoading}
										class="inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-full text-[#047857] hover:bg-[#10B981]/15 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
										title="Mark as paid (no proof needed)"
										aria-label="Mark {participant.name} as paid"
									>
										{#if actingPaymentId === participant.participant_id}
											<Loader2 class="w-4 h-4 animate-spin" />
										{:else}
											<CheckCircle2 class="w-4 h-4" />
										{/if}
									</button>
								{/if}
								{#if !isAlreadyPaid}
									<button
										type="button"
										onclick={() => handleRemindParticipant(participant.participant_id)}
										disabled={reminderDisabled}
										class="inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-full text-[#584140] hover:bg-[#fbe3e1] disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
										title={cooldown > 0 ? `Next reminder available in ${formatCooldown(cooldown)}` : 'Send reminder'}
										aria-label="Send reminder to {participant.name}"
									>
										{#if remindingParticipantId === participant.participant_id}
											<Loader2 class="w-4 h-4 animate-spin" />
										{:else}
											<Bell class="w-4 h-4" />
										{/if}
									</button>
								{/if}
								<button
									type="button"
									onclick={() => openRemoveParticipantDialog(participant)}
									disabled={isLoading || isRemovingParticipant}
									class="inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-full text-[#991B1B] hover:bg-[#EF4444]/10 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
									title="Remove from session"
									aria-label="Remove {participant.name || 'participant'} from session"
								>
									<Trash2 class="w-4 h-4" />
								</button>
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
									onclick={() => openRequestUpdate(proof.participant_id, proof.name)}
									disabled={actingPaymentId === proof.participant_id}
									class="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-medium text-[#92400E] bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
								>
									<ThumbsDown class="w-4 h-4" />
									Request update
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
						{@const hasSc = data.session.fee_config && item.includes_service_charge !== false && (data.session.fee_config.service_charge_percentage ?? 0) > 0}
						{@const hasTax = data.session.fee_config && item.includes_tax !== false && (data.session.fee_config.tax_percentage ?? 0) > 0}
						{@const sc = hasSc ? Math.round(item.amount * (data.session.fee_config!.service_charge_percentage!) / 100) : 0}
						{@const tax = hasTax ? Math.round(item.amount * (data.session.fee_config!.tax_percentage!) / 100) : 0}
						{@const lineTotal = item.amount + sc + tax}
						<div class="p-4 rounded-2xl bg-[#fff0ef]/50">
							<!-- Header row: name + badges + delete -->
							<div class="flex items-center justify-between gap-3">
								<div class="flex items-center gap-2 min-w-0">
									<Receipt class="w-4 h-4 text-[#584140] flex-shrink-0" />
									<p class="text-sm font-medium text-[#251818] truncate">{item.description}</p>
									{#if item.participant_ids && item.participant_ids.length > 0}
										<span class="inline-flex items-center text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#FF6B6B]/15 text-[#ae2f34] flex-shrink-0">
											{item.participant_ids.length} people
										</span>
									{/if}
								</div>
								<button
									onclick={() => handleDeleteBill(item.bill_item_id)}
									class="p-2 text-[#584140] hover:text-[#991B1B] hover:bg-[#EF4444]/10 rounded-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
									title="Delete bill"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
							<!-- Breakdown -->
							<div class="mt-2 ml-6 space-y-1">
								<div class="flex items-center justify-between text-xs">
									<span class="text-[#584140]">Price</span>
									<span class="text-[#251818]">{formatIDR(item.amount)}</span>
								</div>
								{#if hasSc}
									<div class="flex items-center justify-between text-xs">
										<span class="text-[#584140]">Service charge ({data.session.fee_config!.service_charge_percentage}%)</span>
										<span class="text-[#251818]">{formatIDR(sc)}</span>
									</div>
								{/if}
								{#if hasTax}
									<div class="flex items-center justify-between text-xs">
										<span class="text-[#584140]">Tax ({data.session.fee_config!.tax_percentage}%)</span>
										<span class="text-[#251818]">{formatIDR(tax)}</span>
									</div>
								{/if}
								{#if hasSc || hasTax}
									<div class="h-px bg-[#fbe3e1]"></div>
									<div class="flex items-center justify-between text-xs font-semibold">
										<span class="text-[#251818]">Total</span>
										<span class="text-[#ae2f34]">{formatIDR(lineTotal)}</span>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Total Summary -->
			{#if data.session.bills && data.session.bills.length > 0}
				{@const totalItems = data.session.bills.reduce((sum, i) => sum + i.amount, 0)}
				{@const totalSc = data.session.fee_config ? data.session.bills.reduce((sum, i) => sum + (i.includes_service_charge !== false ? Math.round(i.amount * (data.session.fee_config!.service_charge_percentage ?? 0) / 100) : 0), 0) : 0}
				{@const totalTax = data.session.fee_config ? data.session.bills.reduce((sum, i) => sum + (i.includes_tax !== false ? Math.round(i.amount * (data.session.fee_config!.tax_percentage ?? 0) / 100) : 0), 0) : 0}
				{@const grandTotal = totalItems + totalSc + totalTax}
				<div class="mt-4 pt-4 border-t border-[#fbe3e1]">
					<p class="text-xs font-semibold text-[#584140] uppercase tracking-wide mb-2">Summary</p>
					<div class="space-y-1">
						<div class="flex items-center justify-between text-sm">
							<span class="text-[#584140]">Total items</span>
							<span class="text-[#251818]">{formatIDR(totalItems)}</span>
						</div>
						{#if totalSc > 0}
							<div class="flex items-center justify-between text-sm">
								<span class="text-[#584140]">Total service charge</span>
								<span class="text-[#251818]">{formatIDR(totalSc)}</span>
							</div>
						{/if}
						{#if totalTax > 0}
							<div class="flex items-center justify-between text-sm">
								<span class="text-[#584140]">Total tax</span>
								<span class="text-[#251818]">{formatIDR(totalTax)}</span>
							</div>
						{/if}
					</div>
					{#if totalSc > 0 || totalTax > 0}
						<div class="h-px bg-[#fbe3e1] my-2"></div>
						<div class="flex items-center justify-between text-sm font-semibold">
							<span class="text-[#251818]">Grand total</span>
							<span class="text-[#ae2f34]">{formatIDR(grandTotal)}</span>
						</div>
					{/if}
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
						maxlength={100}
						class="w-full pl-10 pr-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
					/>
				</div>
			</div>

			{@const manualPhoneError = manualPhone.length > 0 ? validateWhatsappNumber(manualPhone) ?? undefined : undefined}
			<PhoneInput
				id="manual_phone"
				label="WhatsApp Number"
				placeholder="8123456789"
				bind:value={manualPhone}
				error={manualPhoneError}
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
					disabled={isLoading || !manualName.trim() || validateWhatsappNumber(manualPhone) !== null}
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

<!-- Upload Bill Image Modal -->
<Modal bind:open={showAddImageModal} title="Attach Bill Image" onclose={() => { showAddImageModal = false; selectedFile = null; previewUrl = null; uploadError = null; }}>
	<div class="space-y-4">
		<!-- Drop zone -->
		<div class="relative">
			<input
				type="file"
				id="bill_image_upload"
				accept="image/jpeg,image/png,image/webp"
				onchange={handleFileSelect}
				disabled={isUploading}
				class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
			/>
			<div class="border-2 border-dashed border-[#fbe3e1] rounded-2xl p-6 text-center {isUploading ? 'bg-[#fff0ef] border-[#FF6B6B]' : ''}">
				{#if previewUrl}
					<img src={previewUrl} alt="Preview" class="max-h-48 mx-auto rounded-xl mb-3" />
				{:else}
					<Receipt class="w-10 h-10 mx-auto text-[#584140]/40 mb-2" />
					<p class="text-sm text-[#251818] font-medium">Drop receipt image here</p>
					<p class="text-xs text-[#584140] mt-1">or click to browse</p>
				{/if}
				<p class="text-[10px] text-[#584140] mt-2">
					JPG, PNG, or WebP • Max 5MB • 5 images per session
				</p>
			</div>
		</div>

		{#if uploadError}
			<p class="text-sm text-[#991B1B] bg-[#EF4444]/10 px-3 py-2 rounded-xl">{uploadError}</p>
		{/if}

		{#if isUploading}
			<div class="flex items-center gap-2">
				<Loader2 class="w-4 h-4 animate-spin text-[#FF6B6B]" />
				<div class="flex-1">
					<div class="h-2 bg-[#fff0ef] rounded-full overflow-hidden">
						<div class="h-full bg-[#FF6B6B] transition-all" style="width: {uploadProgress}%"></div>
					</div>
				</div>
				<span class="text-xs text-[#584140]">{uploadProgress}%</span>
			</div>
		{/if}

		<div class="flex gap-3 pt-2">
			<button
				onclick={() => { showAddImageModal = false; selectedFile = null; previewUrl = null; uploadError = null; }}
				disabled={isUploading}
				class="flex-1 px-4 py-2.5 text-sm font-medium text-[#251818] bg-white rounded-xl hover:bg-[#fff0ef] transition-colors disabled:opacity-50"
			>
				Cancel
			</button>
			<button
				onclick={handleUploadImage}
				disabled={!selectedFile || isUploading}
				class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{#if isUploading}
					<Loader2 class="w-4 h-4 animate-spin mx-auto" />
				{:else}
					Upload
				{/if}
			</button>
		</div>
	</div>
</Modal>

<!-- Edit Bill Modal -->
<Modal bind:open={showEditBillModal} title="Edit Bill Item" onclose={() => showEditBillModal = false}>
	<div class="space-y-4">
		<div>
			<label for="edit_bill_name" class="block text-sm font-medium text-[#251818] mb-1">Description</label>
			<input
				type="text"
				id="edit_bill_name"
				bind:value={editBillName}
				maxlength="200"
				placeholder="e.g., Nasi Goreng"
				class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
			/>
		</div>

		<div>
			<label for="edit_bill_amount" class="block text-sm font-medium text-[#251818] mb-1">Amount (IDR)</label>
			<input
				type="number"
				id="edit_bill_amount"
				bind:value={editBillAmount}
				min="1"
				step="1"
				placeholder="e.g., 50000"
				class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
			/>
		</div>

		<!-- Participant scope -->
		<div>
			<label class="block text-sm font-medium text-[#251818] mb-2">Split with</label>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={() => { editBillScope = 'everyone'; editBillParticipantIds = []; }}
					class={editBillScope === 'everyone' ? 'flex-1 py-2 text-sm font-medium rounded-xl bg-[#FF6B6B] text-white' : 'flex-1 py-2 text-sm font-medium rounded-xl bg-[#fff0ef] text-[#584140] hover:bg-[#fbe3e1]'}
				>
					Everyone
				</button>
				<button
					type="button"
					onclick={() => editBillScope = 'specific'}
					class={editBillScope === 'specific' ? 'flex-1 py-2 text-sm font-medium rounded-xl bg-[#FF6B6B] text-white' : 'flex-1 py-2 text-sm font-medium rounded-xl bg-[#fff0ef] text-[#584140] hover:bg-[#fbe3e1]'}
				>
					Specific people
				</button>
			</div>
			{#if editBillScope === 'specific' && data.session.participants?.length}
				<div class="mt-2 space-y-1">
					{#each data.session.participants as p}
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={editBillParticipantIds.includes(p.participant_id)}
								onchange={() => toggleEditBillParticipant(p.participant_id)}
								class="w-4 h-4 accent-[#ae2f34]"
							/>
							<span class="text-sm text-[#251818]">{p.name}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Fee flags (shown when session has fee config) -->
		{#if sessionHasFees}
			<div class="pt-2 border-t border-[#fbe3e1]">
				<p class="block text-sm font-medium text-[#251818] mb-2">Fees apply to this item</p>
				{#if data.session.fee_config?.service_charge_percentage}
					<label class="flex items-center gap-2 mb-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={editBillIncludesServiceCharge}
							class="w-4 h-4 accent-[#ae2f34]"
						/>
						<span class="text-sm text-[#251818]">Service charge ({data.session.fee_config.service_charge_percentage}%)</span>
					</label>
				{/if}
				{#if data.session.fee_config?.tax_percentage}
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={editBillIncludesTax}
							class="w-4 h-4 accent-[#ae2f34]"
						/>
						<span class="text-sm text-[#251818]">Tax ({data.session.fee_config.tax_percentage}%)</span>
					</label>
				{/if}
			</div>
		{/if}

		<div class="flex gap-3 pt-2">
			<button
				onclick={() => showEditBillModal = false}
				disabled={isLoading}
				class="flex-1 px-4 py-2.5 text-sm font-medium text-[#251818] bg-white rounded-xl hover:bg-[#fff0ef] transition-colors disabled:opacity-50"
			>
				Cancel
			</button>
			<button
				onclick={handleEditBill}
				disabled={isLoading}
				class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{#if isLoading}
					<Loader2 class="w-4 h-4 animate-spin mx-auto" />
				{:else}
					Save Changes
				{/if}
			</button>
		</div>
	</div>
</Modal>

<!-- Add Bill Modal -->
<Modal bind:open={showAddBillModal} title="Add Bill Item" onclose={resetAddBill}>
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
				maxlength={200}
				class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
			/>
		</div>

		<div>
			<label for="bill_amount" class="block text-sm font-medium text-[#251818] mb-1">
				Amount ({getCurrencySymbol(data.session.currency)}) <span class="text-[#ae2f34]">*</span>
			</label>
			<input
				type="number"
				id="bill_amount"
				bind:value={newBillAmount}
				placeholder="0"
				inputmode="numeric"
				min="1"
				step="1"
				onpaste={(e) => {
					// Strip non-digit chars on paste so "Rp 50.000" pastes as 50000.
					const text = e.clipboardData?.getData('text') ?? '';
					const cleaned = text.replace(/\D+/g, '');
					if (cleaned !== text) {
						e.preventDefault();
						const parsed = parseInt(cleaned, 10);
						newBillAmount = Number.isFinite(parsed) ? parsed : null;
					}
				}}
				class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
			/>
		</div>

		<!-- Apply to -->
		<div>
			<p class="block text-sm font-medium text-[#251818] mb-2">Apply to</p>
			<div class="flex gap-2 mb-2">
				<label class="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer bg-[#fff0ef]/60 border-2 {newBillScope === 'everyone' ? 'border-[#FF6B6B]' : 'border-transparent'}">
					<input type="radio" name="bill_scope" value="everyone" bind:group={newBillScope} class="accent-[#ae2f34]" />
					<span class="text-sm text-[#251818]">Everyone ({data.session.participants?.length || 0})</span>
				</label>
				<label class="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer bg-[#fff0ef]/60 border-2 {newBillScope === 'specific' ? 'border-[#FF6B6B]' : 'border-transparent'}">
					<input type="radio" name="bill_scope" value="specific" bind:group={newBillScope} class="accent-[#ae2f34]" />
					<span class="text-sm text-[#251818]">Specific people</span>
				</label>
			</div>

			{#if newBillScope === 'specific'}
				{#if !data.session.participants || data.session.participants.length === 0}
					<p class="text-xs text-[#584140]">Add participants first to use this option.</p>
				{:else}
					<div class="max-h-40 overflow-y-auto -mx-1 px-1 space-y-1">
						{#each data.session.participants as p (p.participant_id)}
							{@const checked = newBillParticipantIds.includes(p.participant_id)}
							<label class="flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[#fff0ef]/60">
								<input
									type="checkbox"
									class="w-4 h-4 accent-[#ae2f34]"
									checked={checked}
									onchange={() => toggleBillParticipant(p.participant_id)}
								/>
								<span class="text-sm text-[#251818] flex-1 truncate">{p.name}</span>
								<span class="text-xs text-[#584140]">{p.whatsapp_number}</span>
							</label>
						{/each}
					</div>
					<p class="text-xs text-[#584140] mt-1">{newBillParticipantIds.length} selected</p>
				{/if}
			{:else}
				<p class="text-xs text-[#584140]">Split equally across every participant in the session.</p>
			{/if}
		</div>

			<!-- Fee & Tax section -->
			<div class="pt-2 border-t border-[#fbe3e1]">
				{#if sessionHasFees}
					<p class="block text-sm font-medium text-[#251818] mb-2">Fees apply to this item</p>
					{#if data.session.fee_config?.service_charge_percentage}
						<label class="flex items-center gap-2 mb-2 cursor-pointer">
							<input
								type="checkbox"
								checked={newBillIncludesServiceCharge}
								onchange={() => newBillIncludesServiceCharge = !newBillIncludesServiceCharge}
								class="w-4 h-4 accent-[#ae2f34]"
							/>
							<span class="text-sm text-[#251818]">Service charge ({data.session.fee_config.service_charge_percentage}%)</span>
						</label>
					{/if}
					{#if data.session.fee_config?.tax_percentage}
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={newBillIncludesTax}
								onchange={() => newBillIncludesTax = !newBillIncludesTax}
								class="w-4 h-4 accent-[#ae2f34]"
							/>
							<span class="text-sm text-[#251818]">Tax ({data.session.fee_config.tax_percentage}%)</span>
						</label>
					{/if}
				{:else}
					<p class="block text-sm font-medium text-[#251818] mb-2">Service charge & tax <span class="font-normal text-[#584140]">(optional)</span></p>
					<div class="grid grid-cols-2 gap-3">
						<div>
							<div class="relative">
								<input
									type="number"
									bind:value={newBillFeeSC}
									min="0"
									max="100"
									step="0.1"
									placeholder="0"
									class="w-full pl-3 pr-8 py-2 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
								/>
								<span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#584140] text-xs">%</span>
							</div>
							<p class="text-[10px] text-[#584140] mt-0.5">Service charge</p>
						</div>
						<div>
							<div class="relative">
								<input
									type="number"
									bind:value={newBillFeeTax}
									min="0"
									max="100"
									step="0.1"
									placeholder="0"
									class="w-full pl-3 pr-8 py-2 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
								/>
								<span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#584140] text-xs">%</span>
							</div>
							<p class="text-[10px] text-[#584140] mt-0.5">Tax (GST/VAT)</p>
						</div>
					</div>
					<p class="text-[10px] text-[#584140] mt-1">Set once — next items will reuse these rates</p>
				{/if}
			</div>

			<!-- Preview -->
			{#if newBillAmount !== null && newBillAmount > 0}
				{@const amount = newBillAmount}
				{@const splitCount = newBillScope === 'specific' ? newBillParticipantIds.length : (data.session.participants?.length || 0)}
				{@const sharePer = splitCount > 0 ? amount / splitCount : 0}
				{@const feeSC = sessionHasFees ? (data.session.fee_config?.service_charge_percentage ?? 0) : (newBillFeeSC || 0)}
				{@const feeTax = sessionHasFees ? (data.session.fee_config?.tax_percentage ?? 0) : (newBillFeeTax || 0)}
				{@const scPerPerson = newBillIncludesServiceCharge && splitCount > 0 ? sharePer * feeSC / 100 : 0}
				{@const taxableBase = sharePer + scPerPerson}
				{@const taxPerPerson = newBillIncludesTax && splitCount > 0 ? taxableBase * feeTax / 100 : 0}
				{@const totalPerPerson = sharePer + scPerPerson + taxPerPerson}
				<div class="p-3 bg-[#fff0ef] rounded-2xl space-y-1">
					<p class="text-xs text-[#584140] font-medium">Preview</p>
					<div class="flex items-center justify-between text-sm">
						<span class="text-[#251818]">{newBillName.trim() || 'New bill'}</span>
						<span class="font-semibold text-[#251818]">{formatIDR(amount)}</span>
					</div>
					{#if splitCount > 0}
						<div class="h-px bg-[#fbe3e1] my-1"></div>
						<p class="text-xs text-[#584140]">Each person:</p>
						<div class="flex items-center justify-between text-xs">
							<span class="text-[#584140]">Items share</span>
							<span class="text-[#251818]">{formatIDR(sharePer)}</span>
						</div>
						{#if feeSC > 0 && newBillIncludesServiceCharge}
							<div class="flex items-center justify-between text-xs">
								<span class="text-[#584140]">Service charge ({feeSC}%)</span>
								<span class="text-[#251818]">+ {formatIDR(scPerPerson)}</span>
							</div>
						{/if}
						{#if feeTax > 0 && newBillIncludesTax}
							<div class="flex items-center justify-between text-xs">
								<span class="text-[#584140]">Tax ({feeTax}%)</span>
								<span class="text-[#251818]">+ {formatIDR(taxPerPerson)}</span>
							</div>
						{/if}
						<div class="h-px bg-[#fbe3e1] my-1"></div>
						<div class="flex items-center justify-between text-sm font-semibold">
							<span class="text-[#251818]">Total per person</span>
							<span class="text-[#ae2f34]">{formatIDR(totalPerPerson)}</span>
						</div>
						<p class="text-[10px] text-[#584140] mt-1">({splitCount} {splitCount === 1 ? 'person' : 'people'})</p>
					{/if}
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
				disabled={isLoading || !newBillName.trim() || newBillAmount === null || !(newBillAmount > 0)}
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

<!-- Request-update modal (replaces window.prompt) -->
<RejectReasonModal
	open={rejectingParticipant !== null}
	participantName={rejectingParticipant?.name ?? null}
	submitting={rejectSubmitting}
	onsubmit={submitReject}
	oncancel={() => (rejectingParticipant = null)}
/>

<!-- Edit session (title + description) -->
<Modal bind:open={showEditSession} title="Edit session">
	<div class="space-y-4">
		<div>
			<label for="edit_title" class="block text-sm font-medium text-[#251818] mb-1">
				Title <span class="text-[#ae2f34]">*</span>
			</label>
			<input
				id="edit_title"
				type="text"
				bind:value={editTitle}
				maxlength={200}
				disabled={isSavingEdit}
				class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
			/>
		</div>
		<div>
			<label for="edit_desc" class="block text-sm font-medium text-[#251818] mb-1">
				Description <span class="text-[#584140]/60 font-normal">(optional)</span>
			</label>
			<textarea
				id="edit_desc"
				rows="3"
				bind:value={editDescription}
				maxlength={1000}
				disabled={isSavingEdit}
				class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] resize-none"
			></textarea>
			<p class="text-[11px] text-[#584140]/70 mt-1 text-right">{editDescription.length}/1000</p>
		</div>
		<div class="flex justify-end gap-2 pt-2">
			<button type="button" onclick={() => (showEditSession = false)} disabled={isSavingEdit} class="px-4 py-2 rounded-2xl text-sm font-medium text-[#251818] hover:bg-[#fff0ef] disabled:opacity-50">Cancel</button>
			<button type="button" onclick={handleSaveEdit} disabled={isSavingEdit || !editTitle.trim()} class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] hover:opacity-95 disabled:opacity-50">
				{#if isSavingEdit}<Loader2 class="w-4 h-4 animate-spin" />{/if}
				Save
			</button>
		</div>
	</div>
</Modal>

<!-- Manage bank accounts -->
<Modal bind:open={showBankModal} title="Bank accounts">
	<div class="space-y-3">
		<p class="text-xs text-[#584140]">
			Add up to {MAX_BANK_ACCOUNTS} transfer destinations. Participants see all of them on their payment page.
		</p>
		{#each bankRows as row, i (i)}
			<div class="bg-[#fff0ef]/40 rounded-2xl p-4 border border-[#fbe3e1]">
				<div class="flex items-center justify-between mb-2">
					<p class="text-xs font-semibold text-[#584140] uppercase tracking-wide">Account #{i + 1}</p>
					{#if bankRows.length > 1}
						<button type="button" onclick={() => removeBankRow(i)} disabled={isSavingBanks} class="text-xs text-[#991B1B] underline hover:opacity-80 disabled:opacity-50">Remove</button>
					{/if}
				</div>
				<div class="space-y-2">
					<input type="text" bind:value={row.bank_name} placeholder="Bank or e-wallet (e.g. BCA, GoPay)" maxlength={80} disabled={isSavingBanks} class="w-full px-3 py-2 bg-white rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]" />
					<input type="text" bind:value={row.account_number} placeholder="Account number" maxlength={40} disabled={isSavingBanks} class="w-full px-3 py-2 bg-white rounded-xl text-sm font-mono text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]" />
					<input type="text" bind:value={row.account_holder} placeholder="Account holder name" maxlength={80} disabled={isSavingBanks} class="w-full px-3 py-2 bg-white rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]" />
				</div>
			</div>
		{/each}
		{#if bankRows.length < MAX_BANK_ACCOUNTS}
			<button type="button" onclick={addBankRow} disabled={isSavingBanks} class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#251818] bg-white hover:bg-[#fff0ef] border-2 border-dashed border-[#fbe3e1] rounded-xl disabled:opacity-50">
				<Plus class="w-4 h-4" /> Add another
			</button>
		{/if}
		<div class="flex justify-end gap-2 pt-2">
			<button type="button" onclick={() => (showBankModal = false)} disabled={isSavingBanks} class="px-4 py-2 rounded-2xl text-sm font-medium text-[#251818] hover:bg-[#fff0ef] disabled:opacity-50">Cancel</button>
			<button type="button" onclick={handleSaveBanks} disabled={isSavingBanks} class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] hover:opacity-95 disabled:opacity-50">
				{#if isSavingBanks}<Loader2 class="w-4 h-4 animate-spin" />{/if}
				Save
			</button>
		</div>
	</div>
</Modal>
<!-- Resend (force) confirm -->
<ConfirmDialog
	open={showResendConfirm}
	title="Send notifications again?"
	message={resendLastNotifiedAt
		? `You already sent these ${formatRelativeTime(resendLastNotifiedAt)}. Send again anyway?`
		: 'You already sent these. Send again anyway?'}
	confirmText={isNotifying ? 'Sending…' : 'Send again'}
	cancelText="Keep as-is"
	variant="info"
	onconfirm={handleConfirmResend}
	oncancel={() => {
		showResendConfirm = false;
		resendLastNotifiedAt = null;
	}}
/>

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

<!-- Remove Participant confirm -->
<ConfirmDialog
	open={removingParticipant !== null}
	title="Remove participant?"
	message={removeConfirmMessage}
	confirmText={isRemovingParticipant ? 'Removing…' : 'Remove'}
	cancelText="Keep"
	variant="danger"
	onconfirm={handleRemoveParticipant}
	oncancel={() => (removingParticipant = null)}
/>
