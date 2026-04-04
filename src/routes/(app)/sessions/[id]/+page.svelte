<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		ArrowLeft,
		Plus,
		UserPlus,
		Trash2,
		Edit2,
		CheckCircle2,
		Clock,
		XCircle,
		Loader2,
		Users,
		Receipt,
		Share2
	} from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';
	import { formatIDR, formatRelativeTime } from '$lib/utils/format';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();

	let showAddContact = $state(false);
	let showAddBill = $state(false);
	let selectedContacts = $state<Set<string>>(new Set());
	let isLoading = $state(false);

	// Temporary state for adding contact
	let newContactName = $state('');
	let newContactPhone = $state('');

	// Temporary state for adding bill
	let newBillName = $state('');
	let newBillAmount = $state('');

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
		if (status === 'draft') return 'text-gray-600 bg-gray-50';
		if (status === 'pending') return 'text-amber-600 bg-amber-50';
		if (status === 'in_progress') return 'text-blue-600 bg-blue-50';
		if (status === 'completed') return 'text-emerald-600 bg-emerald-50';
		return 'text-red-600 bg-red-50';
	}

	function getStatusIcon(status: string) {
		if (status === 'draft') return Clock;
		if (status === 'pending') return Clock;
		if (status === 'in_progress') return Clock;
		if (status === 'completed') return CheckCircle2;
		return XCircle;
	}

	function toggleContactSelection(participantId: string) {
		if (selectedContacts.has(participantId)) {
			selectedContacts.delete(participantId);
		} else {
			selectedContacts.add(participantId);
		}
		selectedContacts = new Set(selectedContacts); // Trigger reactivity
	}

	async function handleAddContact() {
		if (!newContactName.trim() || !newContactPhone.trim()) return;

		isLoading = true;
		try {
			const response = await fetch(`/api/v1/sessions/${data.session.session_id}/participants`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify({
					participants: [
						{
							name: newContactName.trim(),
							whatsapp_number: newContactPhone.trim()
						}
					]
				})
			});

			if (response.ok) {
				newContactName = '';
				newContactPhone = '';
				showAddContact = false;
				// Reload page to show new participant
				window.location.reload();
			}
		} catch (error) {
			console.error('Add contact error:', error);
		} finally {
			isLoading = false;
		}
	}

	async function handleEqualSplit() {
		if (selectedContacts.size === 0) return;

		isLoading = true;
		try {
			// Calculate equal split: total / selected contacts
			const totalPerPerson = data.session.total_amount / selectedContacts.size;

			// Update each selected participant's share
			for (const participantId of selectedContacts) {
				await fetch(`/api/v1/sessions/${data.session.session_id}/participants/${participantId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${localStorage.getItem('token')}`
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

	function handleBack() {
		goto('/dashboard');
	}
</script>

<div class="min-h-screen bg-gray-50/50">
	<div class="max-w-4xl mx-auto px-4 py-8">
		<!-- Header -->
		<header class="flex items-center gap-4 mb-8">
			<button
				onclick={handleBack}
				class="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
			>
				<ArrowLeft class="w-5 h-5 text-gray-600" />
			</button>
			<div class="flex-1">
				<h1 class="text-xl font-semibold text-gray-900 tracking-tight">
					{data.session.session_name}
				</h1>
				<p class="text-sm text-gray-500 mt-0.5">
					Created {formatRelativeTime(data.session.created_at)}
				</p>
			</div>
			<span class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg {getStatusColor(data.session.status)}">
				<svelte:component this={getStatusIcon(data.session.status)} class="w-3.5 h-3.5" />
				{data.session.status}
			</span>
		</header>

		<!-- Description -->
		{#if data.session.session_description}
			<p class="text-gray-600 mb-6">{data.session.session_description}</p>
		{/if}

		<!-- Quick Stats -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
			<div class="bg-white rounded-xl border border-gray-200 p-5">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-[#FF6B6B]/10 rounded-lg flex items-center justify-center">
						<Receipt class="w-5 h-5 text-[#FF6B6B]" />
					</div>
					<div>
						<p class="text-sm text-gray-500">Total</p>
						<p class="text-lg font-semibold text-gray-900">
							{getCurrencySymbol(data.session.currency)} {(data.session.total_amount / 100).toLocaleString()}
						</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl border border-gray-200 p-5">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
						<Users class="w-5 h-5 text-blue-600" />
					</div>
					<div>
						<p class="text-sm text-gray-500">Participants</p>
						<p class="text-lg font-semibold text-gray-900">
							{data.session.participants?.length || 0}
						</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-xl border border-gray-200 p-5">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
						<CheckCircle2 class="w-5 h-5 text-emerald-600" />
					</div>
					<div>
						<p class="text-sm text-gray-500">Paid</p>
						<p class="text-lg font-semibold text-gray-900">{data.session.paid_count}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Participants Section -->
		<section class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Participants</h2>
				<button
					onclick={() => (showAddContact = true)}
					class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition-colors"
				>
					<UserPlus class="w-4 h-4" />
					Add Contact
				</button>
			</div>

			<!-- Add Contact Form -->
			{#if showAddContact}
				<div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
					<h3 class="text-sm font-medium text-gray-900 mb-3">Add New Contact</h3>
					<div class="space-y-3">
						<div>
							<label for="contact_name" class="block text-sm font-medium text-gray-700 mb-1">
								Name
							</label>
							<input
								type="text"
								id="contact_name"
								bind:value={newContactName}
								placeholder="Enter name"
								class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
							/>
						</div>
						<div>
							<label for="contact_phone" class="block text-sm font-medium text-gray-700 mb-1">
								WhatsApp Number
							</label>
							<input
								type="tel"
								id="contact_phone"
								bind:value={newContactPhone}
								placeholder="+6281234567890"
								class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent"
							/>
						</div>
						<div class="flex gap-2">
							<button
								onclick={handleAddContact}
								disabled={isLoading}
								class="px-4 py-2 text-sm font-medium text-white bg-[#FF6B6B] rounded-lg hover:bg-[#FF5252] disabled:opacity-50"
							>
								{#if isLoading}
									<Loader2 class="w-4 h-4 animate-spin" />
								{:else}
									Add
								{/if}
							</button>
							<button
								onclick={() => (showAddContact = false)}
								class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			{/if}

			<!-- Equal Split Action -->
			{#if data.session.participants && data.session.participants.length > 0}
				<div class="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-sm font-medium text-gray-900">Equal Split</h3>
							<p class="text-xs text-gray-600 mt-0.5">
								{selectedContacts.size > 0
									? `${selectedContacts.size} selected`
									: 'Select participants below to split total equally'}
							</p>
						</div>
						<button
							onclick={handleEqualSplit}
							disabled={selectedContacts.size === 0 || isLoading}
							class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
				<div class="text-center py-8 text-gray-500">
					<Users class="w-12 h-12 mx-auto text-gray-300 mb-3" />
					<p class="text-sm">No participants yet. Add contacts to get started.</p>
				</div>
			{:else}
				<div class="space-y-2">
					{#each data.session.participants as participant}
						<div
							class="flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer
							{selectedContacts.has(participant.participant_id)
								? 'bg-[#FF6B6B]/10 border-[#FF6B6B]'
								: 'bg-gray-50 border-gray-200 hover:border-gray-300'}"
							onclick={() => toggleContactSelection(participant.participant_id)}
						>
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sm font-medium text-gray-700 border border-gray-200">
									{participant.name.charAt(0).toUpperCase()}
								</div>
								<div>
									<p class="text-sm font-medium text-gray-900">{participant.name}</p>
									<p class="text-xs text-gray-500">{participant.whatsapp_number}</p>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<div class="text-right">
									<p class="text-sm font-medium text-gray-900">
										{formatIDR(participant.share_amount)}
									</p>
									<p class="text-xs text-gray-500">{participant.payment_status}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Bill Items Section -->
		<section class="bg-white rounded-xl border border-gray-200 p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-gray-900">Bill Items</h2>
				<button
					onclick={() => (showAddBill = true)}
					class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition-colors"
				>
					<Plus class="w-4 h-4" />
					Add Bill
				</button>
			</div>

			{#if !data.session.bill_items || data.session.bill_items.length === 0}
				<div class="text-center py-8 text-gray-500">
					<Receipt class="w-12 h-12 mx-auto text-gray-300 mb-3" />
					<p class="text-sm">No bill items yet. Add bills to track expenses.</p>
				</div>
			{:else}
				<div class="space-y-2">
					{#each data.session.bill_items as item}
						<div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
							<div>
								<p class="text-sm font-medium text-gray-900">{item.name}</p>
								{#if item.description}
									<p class="text-xs text-gray-500">{item.description}</p>
								{/if}
							</div>
							<p class="text-sm font-medium text-gray-900">{formatIDR(item.amount)}</p>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	</div>
</div>
