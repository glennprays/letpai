<script lang="ts">
	import { goto } from '$app/navigation';
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
		User
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import { formatIDR, formatRelativeTime } from '$lib/utils/format';
	import Modal from '$lib/components/ui/Modal.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let showAddContactModal = $state(false);
	let showAddBillModal = $state(false);
	let selectedContacts = $state<Set<string>>(new Set());
	let isLoading = $state(false);
	let contactsPickerSupported = $state(false);

	// Temporary state for adding contact
	let newContactName = $state('');
	let newContactPhone = $state('');

	// Temporary state for adding bill
	let newBillName = $state('');
	let newBillAmount = $state('');
	let newBillDescription = $state('');
	let selectedBillParticipant = $state<string>('');

	// Check if Contacts Picker API is supported
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

	function toggleContactSelection(participantId: string) {
		if (selectedContacts.has(participantId)) {
			selectedContacts.delete(participantId);
		} else {
			selectedContacts.add(participantId);
		}
		selectedContacts = new Set(selectedContacts);
	}

	async function openContactsPicker() {
		if (!contactsPickerSupported) return;

		try {
			const contacts = await (navigator as any).contacts.select(['name', 'tel'], {
				multiple: true
			});

			if (contacts && contacts.length > 0) {
				// Add each contact to the session
				for (const contact of contacts) {
					await addParticipantToSession(
						contact.name || 'Unknown',
						contact.tel?.[0] || ''
					);
				}
				// Reload to show new participants
				window.location.reload();
			}
		} catch (error) {
			console.error('Contacts picker error:', error);
		}
	}

	async function handleManualAddContact() {
		if (!newContactName.trim() || !newContactPhone.trim()) return;

		const success = await addParticipantToSession(
			newContactName.trim(),
			newContactPhone.trim()
		);

		if (success) {
			newContactName = '';
			newContactPhone = '';
			showAddContactModal = false;
			window.location.reload();
		}
	}

	async function addParticipantToSession(name: string, phone: string): Promise<boolean> {
		isLoading = true;
		try {
			const response = await fetch(`/api/v1/sessions/${data.session.session_id}/participants`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify({
					participants: [
						{
							name,
							whatsapp_number: phone
						}
					]
				})
			});

			return response.ok;
		} catch (error) {
			console.error('Add contact error:', error);
			return false;
		} finally {
			isLoading = false;
		}
	}

	async function handleEqualSplit() {
		if (selectedContacts.size === 0) return;

		isLoading = true;
		try {
			const totalPerPerson = data.session.total_amount / selectedContacts.size;

			for (const participantId of selectedContacts) {
				await fetch(`/api/v1/sessions/${data.session.session_id}/participants/${participantId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`
					},
					body: JSON.stringify({ share_amount: totalPerPerson })
				});
			}

			selectedContacts = new Set();
			window.location.reload();
		} catch (error) {
			console.error('Equal split error:', error);
		} finally {
			isLoading = false;
		}
	}

	async function handleAddBill() {
		if (!newBillName.trim() || !newBillAmount.trim() || !selectedBillParticipant) return;

		isLoading = true;
		try {
			const amountInCents = Math.round(parseFloat(newBillAmount) * 100);

			// Add the bill item
			const billResponse = await fetch(`/api/v1/sessions/${data.session.session_id}/bills`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify({
					name: newBillName.trim(),
					description: newBillDescription.trim() || undefined,
					amount: amountInCents
				})
			});

			if (billResponse.ok) {
				// Update the participant's share amount
				const participant = data.session.participants?.find(
					(p) => p.participant_id === selectedBillParticipant
				);

				if (participant) {
					const newShareAmount = participant.share_amount + amountInCents;

					await fetch(
						`/api/v1/sessions/${data.session.session_id}/participants/${selectedBillParticipant}`,
						{
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${localStorage.getItem('token')}`
							},
							body: JSON.stringify({ share_amount: newShareAmount })
						}
					);
				}

				// Reset form and close modal
				newBillName = '';
				newBillAmount = '';
				newBillDescription = '';
				selectedBillParticipant = '';
				showAddBillModal = false;

				// Reload to show updated data
				window.location.reload();
			}
		} catch (error) {
			console.error('Add bill error:', error);
		} finally {
			isLoading = false;
		}
	}

	async function handleDeleteBill(billItemId: string) {
		if (!confirm('Are you sure you want to delete this bill?')) return;

		isLoading = true;
		try {
			await fetch(`/api/v1/sessions/${data.session.session_id}/bills/${billItemId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`
				}
			});

			window.location.reload();
		} catch (error) {
			console.error('Delete bill error:', error);
		} finally {
			isLoading = false;
		}
	}

	function openAddBillModal() {
		if (!data.session.participants || data.session.participants.length === 0) {
			alert('Please add participants first before adding bills.');
			return;
		}
		showAddBillModal = true;
	}

	// Group bills by participant for display
	function getBillsByParticipant() {
		const grouped: Record<string, typeof data.session.bill_items> = {};

		if (!data.session.bill_items) return grouped;

		// Note: In a real implementation, bills would have a participant_id field
		// For now, we'll just show all bills together
		grouped['all'] = data.session.bill_items;

		return grouped;
	}

	function getTotalForParticipant(participantId: string): number {
		const participant = data.session.participants?.find(
			(p) => p.participant_id === participantId
		);
		return participant?.share_amount || 0;
	}

	function handleBack() {
		goto('/dashboard');
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
					{data.session.session_name}
				</h1>
				<p class="text-sm text-[#584140] mt-0.5">
					Created {formatRelativeTime(data.session.created_at)}
				</p>
			</div>
			<span class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full {getStatusColor(data.session.status)}">
				<HeaderStatusIcon class="w-3.5 h-3.5" />
				{data.session.status}
			</span>
		</header>

		<!-- Description -->
		{#if data.session.session_description}
			<p class="text-[#584140] mb-6">{data.session.session_description}</p>
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
							{getCurrencySymbol(data.session.currency)} {(data.session.total_amount / 100).toLocaleString()}
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

			<!-- Equal Split Action -->
			{#if data.session.participants && data.session.participants.length > 0}
				<div class="mb-4 p-4 bg-[#fff0ef] rounded-xl">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-sm font-medium text-[#251818]">Equal Split</h3>
							<p class="text-xs text-[#584140] mt-0.5">
								{selectedContacts.size > 0
									? `${selectedContacts.size} selected`
									: 'Select participants below to split total equally'}
							</p>
						</div>
						<button
							onclick={handleEqualSplit}
							disabled={selectedContacts.size === 0 || isLoading}
							class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:from-[#9a282c] hover:to-[#FF5252] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{#if isLoading}
								<Loader2 class="w-4 h-4 animate-spin" />
							{:else}
								<Share2 class="w-4 h-4" />
							{/if}
							Split Equally
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
				<div class="space-y-2">
					{#each data.session.participants as participant}
						<button
							type="button"
							class="w-full text-left flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]
							{selectedContacts.has(participant.participant_id)
								? 'bg-[#FF6B6B]/10'
								: 'bg-[#fff0ef]/50 hover:bg-[#fff0ef]'}"
							onclick={() => toggleContactSelection(participant.participant_id)}
						>
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 bg-[#fff0ef] rounded-full flex items-center justify-center text-sm font-medium text-[#251818]">
									{participant.name.charAt(0).toUpperCase()}
								</div>
								<div>
									<p class="text-sm font-medium text-[#251818]">{participant.name}</p>
									<p class="text-xs text-[#584140]">{participant.whatsapp_number}</p>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<div class="text-right">
									<p class="text-sm font-medium text-[#251818]">
										{formatIDR(participant.share_amount)}
									</p>
									<p class="text-xs text-[#584140]">{participant.payment_status}</p>
								</div>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</section>

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

			{#if !data.session.bill_items || data.session.bill_items.length === 0}
				<div class="text-center py-8 text-[#584140]">
					<Receipt class="w-12 h-12 mx-auto text-[#584140]/30 mb-3" />
					<p class="text-sm">No bill items yet. Add bills to track expenses.</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each data.session.bill_items as item}
						<div class="p-4 rounded-xl bg-[#fff0ef]/50">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<Receipt class="w-4 h-4 text-[#584140] flex-shrink-0" />
										<p class="text-sm font-medium text-[#251818] truncate">{item.name}</p>
									</div>
									{#if item.description}
										<p class="text-xs text-[#584140] mt-1 ml-6">{item.description}</p>
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
			{#if data.session.bill_items && data.session.bill_items.length > 0}
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

<!-- Add Contact Modal -->
<Modal open={showAddContactModal} title="Add Contact">
	<div class="space-y-4">
		<!-- Contacts Picker Button -->
		{#if contactsPickerSupported}
			<button
				onclick={openContactsPicker}
				class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#584140]/30 rounded-xl hover:border-[#FF6B6B] hover:bg-[#FF6B6B]/5 transition-colors group"
			>
				<Phone class="w-5 h-5 text-[#584140] group-hover:text-[#FF6B6B]" />
				<span class="text-sm font-medium text-[#251818] group-hover:text-[#FF6B6B]">
					Import from Device Contacts
				</span>
			</button>
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-[#584140]/10"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-white text-[#584140]">or add manually</span>
				</div>
			</div>
		{/if}

		<!-- Manual Entry -->
		<div>
			<label for="contact_name" class="block text-sm font-medium text-[#251818] mb-1">
				Name
			</label>
			<div class="relative">
				<Type class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#584140]" />
				<input
					type="text"
					id="contact_name"
					bind:value={newContactName}
					placeholder="Enter name"
					class="w-full pl-10 pr-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
				/>
			</div>
		</div>

		<div>
			<label for="contact_phone" class="block text-sm font-medium text-[#251818] mb-1">
				WhatsApp Number
			</label>
			<div class="relative">
				<Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#584140]" />
				<input
					type="tel"
					id="contact_phone"
					bind:value={newContactPhone}
					placeholder="+6281234567890"
					class="w-full pl-10 pr-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
				/>
			</div>
		</div>

		<div class="flex gap-3 pt-2">
			<button
				onclick={() => (showAddContactModal = false)}
				class="flex-1 px-4 py-2.5 text-sm font-medium text-[#251818] bg-white rounded-xl hover:bg-[#fff0ef] transition-colors"
			>
				Cancel
			</button>
			<button
				onclick={handleManualAddContact}
				disabled={isLoading || !newContactName.trim() || !newContactPhone.trim()}
				class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:from-[#9a282c] hover:to-[#FF5252] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{#if isLoading}
					<Loader2 class="w-4 h-4 animate-spin mx-auto" />
				{:else}
					Add Contact
				{/if}
			</button>
		</div>
	</div>
</Modal>

<!-- Add Bill Modal -->
<Modal open={showAddBillModal} title="Add Bill Item">
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
			<label for="bill_description" class="block text-sm font-medium text-[#251818] mb-1">
				Description <span class="text-[#584140]/50 font-normal">(optional)</span>
			</label>
			<textarea
				id="bill_description"
				bind:value={newBillDescription}
				placeholder="Add details about this bill..."
				rows="2"
				class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent resize-none"
			></textarea>
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
				step="0.01"
				min="0"
				class="w-full px-4 py-2.5 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
			/>
		</div>

		<div>
			<label for="bill_participant" class="block text-sm font-medium text-[#251818] mb-1">
				Assign to <span class="text-[#ae2f34]">*</span>
			</label>
			<div class="relative">
				<User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#584140] pointer-events-none" />
				<select
					id="bill_participant"
					bind:value={selectedBillParticipant}
					class="w-full pl-10 pr-10 py-2.5 bg-[#f5dddb] rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent appearance-none bg-no-repeat bg-[length:1.25em_1.25em] bg-[right_0.75rem_center]"
					style="background-image:url(&quot;data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23584140' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e&quot;);"
				>
					<option value="">Select participant</option>
					{#each data.session.participants || [] as participant}
						<option value={participant.participant_id}>{participant.name}</option>
					{/each}
				</select>
			</div>
			<p class="text-xs text-[#584140] mt-1.5">
				This bill will be added to the selected participant's share.
			</p>
		</div>

		<!-- Preview -->
		{#if newBillAmount && selectedBillParticipant}
			<div class="p-3 bg-blue-50 rounded-xl">
				<p class="text-xs text-blue-700 font-medium mb-1">Preview</p>
				<div class="flex items-center justify-between text-sm">
					<span class="text-blue-600">
						{data.session.participants?.find((p) => p.participant_id === selectedBillParticipant)
							?.name}
					</span>
					<span class="font-semibold text-blue-900">
						{formatIDR(Math.round(parseFloat(newBillAmount || '0') * 100))}
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
				disabled={isLoading || !newBillName.trim() || !newBillAmount.trim() || !selectedBillParticipant}
				class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:from-[#9a282c] hover:to-[#FF5252] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
