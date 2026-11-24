<script lang="ts">
	import { tick } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { Plus, UserPlus, Send, Pencil, Wallet, XCircle, Calculator, ImageIcon, Loader2, Phone, Search } from 'lucide-svelte';
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
	import { ApiError, toUserMessage } from '$lib/services/api';
	import {
		approvePayment,
		rejectPayment,
		bulkApprove,
		markPaidWithoutProof
	} from '$lib/services/payments';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import SessionHeader from '$lib/components/session/SessionHeader.svelte';
	import SetupChecklist from '$lib/components/session/SetupChecklist.svelte';
	import ProofQueue from '$lib/components/session/ProofQueue.svelte';
	import OwesList from '$lib/components/session/OwesList.svelte';
	import PaidList from '$lib/components/session/PaidList.svelte';
	import BillReceipt from '$lib/components/session/BillReceipt.svelte';
	import BillItemForm from '$lib/components/session/BillItemForm.svelte';
	import TransferAccounts from '$lib/components/session/TransferAccounts.svelte';
	import BillPhotos from '$lib/components/session/BillPhotos.svelte';
	import { deliveryOf } from '$lib/utils/status';
	import type { MenuItem } from '$lib/components/ui/Menu.svelte';
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

	// When the user picks a group, pre-select all its members that aren't
	// already participants. Driven by the <select>'s onchange rather than an
	// $effect: groupSelectedIds is also user-editable (the checkboxes toggle
	// it), and an effect would re-run on unrelated reactive changes and stomp
	// those edits. This runs only on an actual group change.
	function preselectGroupMembers() {
		if (selectedGroupId) {
			groupSelectedIds = groupMembers
				.filter((c) => !linkedContactIds.has(c.contact_id))
				.map((c) => c.contact_id);
		} else {
			groupSelectedIds = [];
		}
	}

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
			toast.error('Enter an amount above zero.');
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
			toast.success('Item updated.');
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
			toast.success('Photo attached.');
		} catch (error) {
			console.error('Upload error:', error);
			uploadError = error instanceof Error ? error.message : 'Upload failed';
		} finally {
			isUploading = false;
		}
	}

	async function handleDeleteImage(imageId: string) {

		try {
			await deleteBillImageApi(data.session.session_id, imageId);
			await invalidateAll();
			toast.success('Photo removed.');
		} catch (error) {
			console.error('Delete error:', error);
			toast.error("We couldn't remove the photo.");
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





	const REMINDER_COOLDOWN_MS = 24 * 60 * 60 * 1000;



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
			toast.success(items.length === 1 ? 'Added to the session.' : `${items.length} people added.`);
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
			toast.error('Enter their name.');
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
			toast.error('Add people first.');
			return;
		}
		if (!data.session.bills?.length) {
			toast.error('Add at least one item first.');
			return;
		}
		isSplitting = true;
		try {
			await calculateSplits(data.session.session_id);
			await invalidateAll();
			toast.success('Shares recalculated.');
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
			toast.error('Enter an amount above zero.');
			return;
		}

		if (newBillScope === 'specific' && newBillParticipantIds.length === 0) {
			toast.error('Pick at least one person for this item.');
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
	// Statuses that mean "delivery is still in flight" and the chip should keep
	// polling. Since the durable outbox worker landed, a queued send moves
	// through pending → sending → sent (the legacy synchronous path used
	// `queued`), so all three count as in-flight.
	const IN_FLIGHT_NOTIFICATION_STATUSES = ['queued', 'pending', 'sending'];
	let pollingNotifications = $state(false);
	async function pollUntilSent(opts: { tries?: number; everyMs?: number } = {}) {
		// Tuned for the outbox worker (≈5s tick) rather than the old in-request
		// goroutine: ~12s of polling catches most sends without hanging the UI.
		const tries = opts.tries ?? 6;
		const everyMs = opts.everyMs ?? 2000;
		pollingNotifications = true;
		try {
			for (let i = 0; i < tries; i++) {
				await new Promise((r) => setTimeout(r, everyMs));
				await invalidateAll();
				// Let the reactive `data` prop settle to the freshly-loaded value
				// before reading it, so we don't evaluate against a stale snapshot.
				await tick();
				const anyInFlight = (data.session.participants ?? []).some(
					(p) =>
						p.last_notification != null &&
						IN_FLIGHT_NOTIFICATION_STATUSES.includes(p.last_notification.status)
				);
				if (!anyInFlight) return;
			}
		} finally {
			pollingNotifications = false;
		}
	}

	async function handleSendNotifications() {
		if (!data.session.participants?.length) {
			toast.error('Add people first.');
			return;
		}
		isNotifying = true;
		try {
			await sendNotifications(data.session.session_id);
			toast.success('Sending on WhatsApp. Each person updates here as it lands.');
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
			toast.success('Sending again on WhatsApp.');
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
			toast.success('Sending the message again.');
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


	function openAddBillModal() {
		if (!data.session.participants || data.session.participants.length === 0) {
			toast.error('Add people first, then the items.');
			return;
		}
		showAddBillModal = true;
	}


	// Format a server-provided cooldown (from a 429 ApiError) into a short
	// "try again in N" so the host sees the authoritative wait, not a generic
	// error. Falls back to toUserMessage when there's no cooldown info.
	function reminderErrorMessage(error: unknown): string {
		if (error instanceof ApiError && error.status === 429) {
			const secs = error.retryAfterSeconds;
			if (typeof secs === 'number' && secs > 0) {
				const mins = Math.ceil(secs / 60);
				return mins > 1 ? `You reminded them recently. Try again in about ${mins} min.` : 'You reminded them recently. Try again in a minute.';
			}
			return 'You reminded them recently. Try again later.';
		}
		return toUserMessage(error, 'Failed to send reminder');
	}

	async function handleRemindParticipant(participantId: string) {
		remindingParticipantId = participantId;
		try {
			const result = await sendParticipantReminder(participantId);
			toast.success(result.message || 'Reminder sent.');
		} catch (error) {
			console.error('Send reminder error:', error);
			toast.error(reminderErrorMessage(error));
		} finally {
			remindingParticipantId = null;
		}
	}

	async function handleBulkReminder() {
		if (!data.session.participants?.length) return;
		isBulkReminding = true;
		try {
			const result = await sendBulkReminder(data.session.session_id);
			toast.success(result.message || 'Reminders sent to everyone who has not paid.');
		} catch (error) {
			console.error('Bulk reminder error:', error);
			toast.error(reminderErrorMessage(error));
		} finally {
			isBulkReminding = false;
		}
	}

	async function handleApprove(participantId: string) {
		actingPaymentId = participantId;
		try {
			await approvePayment(participantId);
			toast.success('Payment approved.');
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
			toast.success('Sent back. They can upload a new screenshot.');
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
			toast.success('Marked as paid.');
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
			toast.success(`${target.name || 'They'} left the session.`);
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
			toast.success('Session cancelled.');
			goto('/dashboard');
		} catch (error) {
			console.error('Cancel session error:', error);
			toast.error('Failed to cancel session');
		} finally {
			isCancelling = false;
			showCancelDialog = false;
		}
	}


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
	}
	async function handleSaveEdit() {
		const title = editTitle.trim();
		if (!title) {
			toast.error('Give the session a name.');
			return;
		}
		isSavingEdit = true;
		try {
			await updateSession(data.session.session_id, {
				title,
				description: editDescription.trim()
			});
			toast.success('Saved.');
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
			toast.success(accounts.length ? 'Transfer accounts saved.' : 'Transfer accounts cleared.');
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

	// ── Redesign: grouping for the review queue ──────────────────────────
	const everyone = $derived(data.session.participants ?? []);
	const paidPeople = $derived(everyone.filter((p) => p.payment_status === 'paid'));
	// Failed WhatsApp deliveries first (nothing else works until they get the
	// message), then sent-back proofs, then the biggest unpaid shares.
	const owing = $derived(
		everyone
			.filter((p) => p.payment_status === 'pending' || p.payment_status === 'rejected')
			.map((p) => ({ p, failed: deliveryOf(p.last_notification).state === 'failed' }))
			.sort((a, b) => Number(b.failed) - Number(a.failed) || Number(b.p.payment_status === 'rejected') - Number(a.p.payment_status === 'rejected') || b.p.share_amount - a.p.share_amount)
			.map((x) => x.p)
	);
	const counts = $derived({
		paid: paidPeople.length,
		review: submittedProofs.length,
		rejected: everyone.filter((p) => p.payment_status === 'rejected').length,
		unpaid: everyone.filter((p) => p.payment_status === 'pending').length,
		total: everyone.length
	});
	const outstanding = $derived(everyone.filter((p) => p.payment_status !== 'paid').reduce((s, p) => s + (p.share_amount ?? 0), 0));
	const sessionTotal = $derived(everyone.reduce((s, p) => s + (p.share_amount ?? 0), 0) || data.session.total_amount);
	const isClosed = $derived(data.session.status === 'cancelled' || data.session.status === 'completed');
	const hasSent = $derived(!!data.session.last_notified_at);

	const menu = $derived<MenuItem[]>(
		isClosed
			? []
			: [
					{ label: 'Edit name and note', icon: Pencil, onclick: openEditSession },
					{ label: 'Add people', icon: UserPlus, onclick: () => (showAddContactModal = true) },
					{ label: 'Transfer accounts', icon: Wallet, onclick: openBankModal },
					{ label: 'Recalculate shares', icon: Calculator, onclick: handleCalculateSplits, disabled: isSplitting },
					...(hasSent ? [{ label: 'Send everyone the link again', icon: Send, onclick: handleSendNotifications }] : []),
					{ label: 'Cancel session…', icon: XCircle, onclick: () => (showCancelDialog = true), danger: true }
				]
	);

	// Styled confirmations instead of window.confirm().
	let pendingDelete = $state<{ kind: 'bill' | 'photo'; id: string; label: string } | null>(null);
	function askDeleteBill(id: string) {
		const b = data.session.bills?.find((x) => x.bill_item_id === id);
		pendingDelete = { kind: 'bill', id, label: b?.description ?? 'this item' };
	}
	function askDeletePhoto(id: string) {
		pendingDelete = { kind: 'photo', id, label: 'this photo' };
	}
	async function confirmDelete() {
		const d = pendingDelete;
		pendingDelete = null;
		if (!d) return;
		if (d.kind === 'bill') await handleDeleteBill(d.id);
		else await handleDeleteImage(d.id);
	}
	function closeImageModal() {
		showAddImageModal = false;
		selectedFile = null;
		previewUrl = null;
		uploadError = null;
	}
</script>

<Seo title={data.session.title} noindex />

<div class="mx-auto max-w-6xl px-4 pt-5 pb-12 sm:px-6 md:pt-8">
	<SessionHeader
		title={data.session.title}
		description={data.session.description}
		status={data.session.status}
		createdAt={data.session.created_at}
		total={sessionTotal}
		{outstanding}
		{counts}
		{menu}
	>
		{#snippet actions()}
			{#if hasSent && data.session.is_dirty && !isClosed}
				<Button leftIcon={Send} loading={isNotifying} onclick={handleSendNotifications}>Send the updated shares</Button>
				<p class="self-center text-[13px] text-ink-soft">Shares changed since you last sent them.</p>
			{/if}
		{/snippet}
	</SessionHeader>

	<div class="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
		<!-- The queue: what needs the host, in the order it needs them. -->
		<div class="flex min-w-0 flex-col gap-8">
			{#if !hasSent && !isClosed}
				<SetupChecklist
					people={everyone.length}
					items={data.session.bills?.length ?? 0}
					hasAccounts={(data.session.bank_accounts?.length ?? 0) > 0}
					sending={isNotifying}
					onaddpeople={() => (showAddContactModal = true)}
					onadditem={openAddBillModal}
					onaccounts={openBankModal}
					onsend={handleSendNotifications}
				/>
			{/if}

			{#if submittedProofs.length > 0}
				<ProofQueue
					proofs={submittedProofs}
					actingId={actingPaymentId}
					bulkApproving={isBulkApproving}
					onapprove={handleApprove}
					onsendback={openRequestUpdate}
					onapproveall={handleBulkApproveAll}
				/>
			{/if}

			{#if owing.length > 0}
				<OwesList
					sessionId={data.session.session_id}
					people={owing}
					sent={hasSent}
					remindingId={remindingParticipantId}
					retryingId={retryingParticipantId}
					actingId={actingPaymentId}
					bulkReminding={isBulkReminding}
					cooldownMs={reminderAvailableInMs}
					onremind={handleRemindParticipant}
					onremindall={handleBulkReminder}
					onretry={handleRetryNotification}
					onmarkpaid={handleMarkPaid}
					onremove={openRemoveParticipantDialog}
					onadd={() => (showAddContactModal = true)}
				/>
			{/if}

			{#if paidPeople.length > 0}
				<PaidList sessionId={data.session.session_id} people={paidPeople} onremove={openRemoveParticipantDialog} open={paidPeople.length === everyone.length} />
			{/if}

			{#if pollingNotifications}
				<p class="flex items-center gap-2 text-[13px] text-ink-soft" aria-live="polite"><Loader2 size={14} class="animate-spin" />Checking WhatsApp delivery…</p>
			{/if}
		</div>

		<!-- Reference material: the bill, where to pay, the receipt photos. -->
		<aside class="flex flex-col gap-4 lg:sticky lg:top-6" aria-label="Bill and payment details">
			<BillReceipt
				bills={data.session.bills ?? []}
				participants={everyone}
				fees={data.session.fee_config}
				editable={!isClosed}
				onadd={openAddBillModal}
				onedit={openEditBillModal}
				ondelete={askDeleteBill}
			/>
			<TransferAccounts accounts={data.session.bank_accounts ?? []} onmanage={isClosed ? null : openBankModal} />
			<BillPhotos photos={data.session.bill_images ?? []} onadd={isClosed ? null : () => (showAddImageModal = true)} ondelete={isClosed ? null : askDeletePhoto} />
		</aside>
	</div>
</div>

<!-- Add people -->
<Modal bind:open={showAddContactModal} title="Add people" description="They'll get their share on WhatsApp when you send." onclose={resetAddModal} size="lg">
	<div class="flex flex-col gap-4">
		<Segmented
			label="Add from"
			bind:value={addTab}
			options={[
				{ value: 'contacts', label: 'Contacts' },
				{ value: 'group', label: 'A group' },
				{ value: 'manual', label: 'New person' }
			]}
		/>

		{#if addTab === 'contacts'}
			{#if !data.contacts || data.contacts.length === 0}
				<p class="py-6 text-center text-[15px] text-ink-soft">No saved contacts yet. Use <b class="text-ink">New person</b> to add someone by number.</p>
			{:else}
				<Input type="search" bind:value={contactSearch} placeholder="Search name or number" leftIcon={Search} aria-label="Search contacts" />
				<div class="-mx-1 max-h-72 overflow-y-auto px-1">
					{#each filteredContacts as contact (contact.contact_id)}
						{@const linked = linkedContactIds.has(contact.contact_id)}
						<div class="flex items-center gap-3 rounded-field px-2 hover:bg-fog {linked ? 'opacity-60' : ''}">
							<Checkbox
								ariaLabel={contact.name}
								checked={linked || selectedContactIds.includes(contact.contact_id)}
								disabled={linked}
								onchange={() => (selectedContactIds = toggleContactId(selectedContactIds, contact.contact_id))}
							/>
							<div class="min-w-0 flex-1">
								<p class="truncate text-[15px] font-semibold">{contact.name}</p>
								<p class="truncate text-[13px] text-ink-soft tabular-nums">{contact.whatsapp_number}</p>
							</div>
							{#if linked}<span class="text-xs font-semibold text-ink-soft">Already in</span>{/if}
						</div>
					{/each}
					{#if filteredContacts.length === 0}<p class="py-6 text-center text-[15px] text-ink-soft">Nobody matches "{contactSearch}".</p>{/if}
				</div>
				{#if contactsPickerSupported}
					<button type="button" onclick={openContactsPicker} class="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-steel hover:text-ink">
						<Phone size={15} /> Pick from this phone's contacts
					</button>
				{/if}
			{/if}
		{:else if addTab === 'group'}
			{#if !data.groups || data.groups.length === 0}
				<p class="py-6 text-center text-[15px] text-ink-soft">No groups yet. Make one on the <a href="/contacts" class="font-semibold text-ink underline">Contacts</a> page.</p>
			{:else}
				<div class="flex flex-col gap-1.5">
					<label for="group_select" class="text-sm font-semibold">Group</label>
					<select
						id="group_select"
						bind:value={selectedGroupId}
						onchange={preselectGroupMembers}
						class="h-11 rounded-field bg-card px-4 text-[15px] font-medium shadow-[inset_0_0_0_1.5px_var(--color-hairline)] focus:shadow-[inset_0_0_0_2px_var(--color-steel)] focus:outline-none"
					>
						<option value="">Choose a group</option>
						{#each data.groups as g (g.group_id)}<option value={g.group_id}>{g.name} ({g.contact_count})</option>{/each}
					</select>
				</div>
				{#if selectedGroup}
					{#if groupMembers.length === 0}
						<p class="py-4 text-center text-[15px] text-ink-soft">"{selectedGroup.name}" has nobody in it yet.</p>
					{:else}
						<div class="-mx-1 max-h-64 overflow-y-auto px-1">
							{#each groupMembers as contact (contact.contact_id)}
								{@const linked = linkedContactIds.has(contact.contact_id)}
								<div class="flex items-center gap-3 rounded-field px-2 hover:bg-fog {linked ? 'opacity-60' : ''}">
									<Checkbox
										ariaLabel={contact.name}
										checked={linked || groupSelectedIds.includes(contact.contact_id)}
										disabled={linked}
										onchange={() => (groupSelectedIds = toggleContactId(groupSelectedIds, contact.contact_id))}
									/>
									<p class="min-w-0 flex-1 truncate text-[15px] font-semibold">{contact.name}</p>
									{#if linked}<span class="text-xs font-semibold text-ink-soft">Already in</span>{/if}
								</div>
							{/each}
						</div>
						<p class="text-[13px] text-ink-soft">{groupSelectedIds.length} of {groupMembers.length} selected</p>
					{/if}
				{/if}
			{/if}
		{:else}
			{@const manualPhoneError = manualPhone.length > 0 ? (validateWhatsappNumber(manualPhone) ?? undefined) : undefined}
			<Input label="Name" id="manual_name" bind:value={manualName} placeholder="Their name" maxLength={100} />
			<PhoneInput id="manual_phone" label="WhatsApp number" bind:value={manualPhone} error={manualPhoneError} />
			<Checkbox label="Save to my contacts" bind:checked={manualSaveToContacts} />
		{/if}
	</div>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (showAddContactModal = false)}>Cancel</Button>
		{#if addTab === 'contacts'}
			<Button loading={isLoading} disabled={selectedContactIds.length === 0} onclick={handleAddFromContacts}>Add {selectedContactIds.length || ''} {selectedContactIds.length === 1 ? 'person' : 'people'}</Button>
		{:else if addTab === 'group'}
			<Button loading={isLoading} disabled={groupSelectedIds.length === 0} onclick={handleAddFromGroup}>Add {groupSelectedIds.length || ''} {groupSelectedIds.length === 1 ? 'person' : 'people'}</Button>
		{:else}
			<Button loading={isLoading} disabled={!manualName.trim() || validateWhatsappNumber(manualPhone) !== null} onclick={handleAddManual}>Add {manualName.trim().split(' ')[0] || 'person'}</Button>
		{/if}
	{/snippet}
</Modal>

<!-- Receipt photo -->
<Modal bind:open={showAddImageModal} title="Attach a receipt photo" description="Everyone in the session can see it on their payment page." onclose={closeImageModal} busy={isUploading}>
	<label class="relative grid cursor-pointer place-items-center rounded-card border-2 border-dashed border-hairline bg-fog p-6 text-center transition-colors hover:border-ink-soft">
		<input type="file" accept="image/jpeg,image/png,image/webp" onchange={handleFileSelect} disabled={isUploading} class="sr-only" />
		{#if previewUrl}
			<img src={previewUrl} alt="Selected receipt" class="max-h-56 rounded-[10px]" />
			<span class="mt-3 text-sm font-semibold text-steel">Choose a different photo</span>
		{:else}
			<ImageIcon size={28} class="text-ink-soft" aria-hidden="true" />
			<span class="mt-2 font-semibold">Choose a photo</span>
			<span class="mt-1 text-[13px] text-ink-soft">JPG, PNG or WebP, up to 5 MB</span>
		{/if}
	</label>
	{#if uploadError}<p class="mt-3 rounded-field bg-rejected-tint px-3 py-2 text-sm text-rejected" role="alert">{uploadError}</p>{/if}
	{#snippet footer()}
		<Button variant="secondary" onclick={closeImageModal} disabled={isUploading}>Cancel</Button>
		<Button onclick={handleUploadImage} loading={isUploading} disabled={!selectedFile}>Attach photo</Button>
	{/snippet}
</Modal>

<!-- Edit item -->
<Modal bind:open={showEditBillModal} title="Edit item" onclose={() => (showEditBillModal = false)} busy={isLoading}>
	<BillItemForm
		bind:name={editBillName}
		bind:amount={editBillAmount}
		bind:scope={editBillScope}
		bind:participantIds={editBillParticipantIds}
		bind:includesServiceCharge={editBillIncludesServiceCharge}
		bind:includesTax={editBillIncludesTax}
		participants={everyone}
		fees={data.session.fee_config}
		currency={data.session.currency}
	/>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (showEditBillModal = false)} disabled={isLoading}>Cancel</Button>
		<Button onclick={handleEditBill} loading={isLoading} disabled={!editBillName.trim() || !editBillAmount}>Save item</Button>
	{/snippet}
</Modal>

<!-- Add item -->
<Modal bind:open={showAddBillModal} title="Add an item" onclose={resetAddBill} busy={isLoading}>
	<BillItemForm
		bind:name={newBillName}
		bind:amount={newBillAmount}
		bind:scope={newBillScope}
		bind:participantIds={newBillParticipantIds}
		bind:includesServiceCharge={newBillIncludesServiceCharge}
		bind:includesTax={newBillIncludesTax}
		bind:feeSC={newBillFeeSC}
		bind:feeTax={newBillFeeTax}
		participants={everyone}
		fees={data.session.fee_config}
		currency={data.session.currency}
		allowFeeSetup
	/>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (showAddBillModal = false)}>Cancel</Button>
		<Button onclick={handleAddBill} loading={isLoading} disabled={!newBillName.trim() || !newBillAmount || newBillAmount <= 0}>Add item</Button>
	{/snippet}
</Modal>

<RejectReasonModal
	open={rejectingParticipant !== null}
	participantName={rejectingParticipant?.name ?? null}
	submitting={rejectSubmitting}
	onsubmit={submitReject}
	oncancel={() => (rejectingParticipant = null)}
/>

<!-- Edit session -->
<Modal bind:open={showEditSession} title="Edit session" busy={isSavingEdit}>
	<div class="flex flex-col gap-4">
		<Input label="Name" id="edit_title" bind:value={editTitle} maxLength={200} disabled={isSavingEdit} />
		<div class="flex flex-col gap-1.5">
			<label for="edit_desc" class="text-sm font-semibold">Note for everyone <span class="font-normal text-ink-soft">(optional)</span></label>
			<textarea
				id="edit_desc"
				rows="3"
				bind:value={editDescription}
				maxlength={1000}
				disabled={isSavingEdit}
				placeholder="Thanks for coming! Transfer to either account."
				class="resize-none rounded-field bg-card px-4 py-3 text-[15px] shadow-[inset_0_0_0_1.5px_var(--color-hairline)] placeholder:text-ink-soft/70 focus:shadow-[inset_0_0_0_2px_var(--color-steel)] focus:outline-none"
			></textarea>
			<p class="text-right text-xs text-ink-soft tabular-nums">{editDescription.length}/1000</p>
		</div>
	</div>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (showEditSession = false)} disabled={isSavingEdit}>Cancel</Button>
		<Button onclick={handleSaveEdit} loading={isSavingEdit} disabled={!editTitle.trim()}>Save</Button>
	{/snippet}
</Modal>

<!-- Transfer accounts -->
<Modal bind:open={showBankModal} title="Transfer accounts" description="Friends see every account on their payment page and can copy the number." busy={isSavingBanks} size="lg">
	<div class="flex flex-col gap-3">
		{#each bankRows as row, i (i)}
			<fieldset class="rounded-card bg-fog p-4">
				<div class="mb-3 flex items-center justify-between">
					<legend class="text-eyebrow">Account {i + 1}</legend>
					{#if bankRows.length > 1}
						<button type="button" onclick={() => removeBankRow(i)} disabled={isSavingBanks} class="text-sm font-semibold text-rejected hover:underline">Remove</button>
					{/if}
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					<Input label="Bank or e-wallet" bind:value={row.bank_name} placeholder="BCA, GoPay…" maxLength={80} disabled={isSavingBanks} />
					<Input label="Account number" bind:value={row.account_number} placeholder="5270 1234 88" maxLength={40} inputmode="numeric" disabled={isSavingBanks} />
					<div class="sm:col-span-2"><Input label="Name on the account" bind:value={row.account_holder} placeholder="As shown by the bank" maxLength={80} disabled={isSavingBanks} /></div>
				</div>
			</fieldset>
		{/each}
		{#if bankRows.length < MAX_BANK_ACCOUNTS}
			<Button variant="secondary" leftIcon={Plus} onclick={addBankRow} disabled={isSavingBanks} class="self-start">Add another account</Button>
		{/if}
	</div>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (showBankModal = false)} disabled={isSavingBanks}>Cancel</Button>
		<Button onclick={handleSaveBanks} loading={isSavingBanks}>Save accounts</Button>
	{/snippet}
</Modal>

<ConfirmDialog
	open={showResendConfirm}
	title="Send everyone the link again?"
	message={resendLastNotifiedAt
		? `You sent it ${formatRelativeTime(resendLastNotifiedAt)} and nothing has changed since.`
		: 'You already sent it and nothing has changed since.'}
	confirmText="Send again"
	cancelText="Not now"
	variant="info"
	loading={isNotifying}
	onconfirm={handleConfirmResend}
	oncancel={() => {
		showResendConfirm = false;
		resendLastNotifiedAt = null;
	}}
/>

<ConfirmDialog
	open={showCancelDialog}
	title="Cancel this session?"
	message="Nobody will be able to pay through their link, and reminders stop. This can't be undone."
	confirmText="Cancel session"
	cancelText="Keep it"
	variant="danger"
	loading={isCancelling}
	onconfirm={handleCancelSession}
	oncancel={() => (showCancelDialog = false)}
/>

<ConfirmDialog
	open={removingParticipant !== null}
	title="Remove {removingParticipant?.name ?? 'them'}?"
	message={removeConfirmMessage}
	confirmText="Remove"
	cancelText="Keep"
	variant="danger"
	loading={isRemovingParticipant}
	onconfirm={handleRemoveParticipant}
	oncancel={() => (removingParticipant = null)}
/>

<ConfirmDialog
	open={pendingDelete !== null}
	title={pendingDelete?.kind === 'bill' ? `Delete "${pendingDelete.label}"?` : 'Remove this photo?'}
	message={pendingDelete?.kind === 'bill' ? 'Shares are recalculated for everyone.' : 'Friends will no longer see it on their payment page.'}
	confirmText={pendingDelete?.kind === 'bill' ? 'Delete item' : 'Remove photo'}
	cancelText="Keep"
	variant="danger"
	onconfirm={confirmDelete}
	oncancel={() => (pendingDelete = null)}
/>
