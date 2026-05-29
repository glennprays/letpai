<script lang="ts">
	import { goto } from '$app/navigation';
	import { Plus, X, Loader2 } from 'lucide-svelte';
	import type { ActionData } from './$types';

	interface Props {
		form?: ActionData;
	}

	let { form }: Props = $props();

	let sessionName = $state('');
	let sessionDescription = $state('');
	let currency = $state('IDR');
	let errors = $state<Record<string, string>>({});
	let touched = $state<Record<string, boolean>>({});
	let isSubmitting = $state(false);

	// Repeatable bank-account rows. Capped at 5 to match the backend.
	// Empty rows are dropped server-side; the FE just hides the
	// "+ Add" button when the cap is hit.
	type BankRow = { bank_name: string; account_number: string; account_holder: string };
	let bankRows = $state<BankRow[]>([
		{ bank_name: '', account_number: '', account_holder: '' }
	]);
	const MAX_BANK_ACCOUNTS = 5;
	function addBankRow() {
		if (bankRows.length >= MAX_BANK_ACCOUNTS) return;
		bankRows = [...bankRows, { bank_name: '', account_number: '', account_holder: '' }];
	}
	function removeBankRow(index: number) {
		bankRows = bankRows.filter((_, i) => i !== index);
		if (bankRows.length === 0) {
			bankRows = [{ bank_name: '', account_number: '', account_holder: '' }];
		}
	}

	const currencies = [
		{ code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
		{ code: 'USD', symbol: '$', name: 'US Dollar' },
		{ code: 'EUR', symbol: '€', name: 'Euro' },
		{ code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' }
	];

	function validateField(field: string, value: string) {
		if (field === 'sessionName' && !value.trim()) {
			errors.sessionName = 'Session name is required';
		} else {
			delete errors[field];
		}
	}

	function handleBlur(field: string, value: string) {
		touched[field] = true;
		validateField(field, value);
	}

	function handleInput(field: string, value: string) {
		if (touched[field]) {
			validateField(field, value);
		}
	}

	function isFormValid() {
		return sessionName.trim().length > 0 && Object.keys(errors).length === 0;
	}

	function handleCancel() {
		goto('/dashboard');
	}

	// Handle server errors - reset submitting state on error
	$effect(() => {
		if (form?.error) {
			isSubmitting = false;
		}
	});
</script>

<div class="min-h-screen">
	<div class="max-w-lg mx-auto px-4 py-8 sm:py-12">
		<!-- Header -->
		<header class="mb-8">
			<button
				onclick={handleCancel}
				class="inline-flex items-center gap-2 text-[#584140] hover:text-[#251818] transition-colors mb-4 text-sm"
			>
				<X class="w-4 h-4" />
				<span>Cancel</span>
			</button>
			<h1 class="text-2xl font-semibold text-[#251818] tracking-tight">Create New Session</h1>
			<p class="text-sm text-[#584140] mt-1"
				>Start a new bill splitting session. You can add contacts and bills after creating.</p
			>
		</header>

		<!-- Server Error -->
		{#if form?.error}
			<div class="mb-6 p-4 bg-[#EF4444]/15 rounded-2xl">
				<p class="text-sm text-[#991B1B]">{form.error}</p>
			</div>
		{/if}

		<!-- Form -->
		<form method="POST" class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] p-6 space-y-6">
			<!-- Session Name -->
			<div>
				<label for="title" class="block text-sm font-medium text-[#251818] mb-2">
					Session Name <span class="text-[#ae2f34]">*</span>
				</label>
				<input
					type="text"
					id="title"
					name="title"
					bind:value={sessionName}
					onblur={() => handleBlur('sessionName', sessionName)}
					oninput={() => handleInput('sessionName', sessionName)}
					placeholder="e.g., Lunch at Warung"
					required
					class="w-full px-4 py-3 bg-[#fff0ef]/50 rounded-xl text-[#251818] placeholder:text-[#584140]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition-all disabled:bg-[#fff0ef] disabled:cursor-not-allowed"
					disabled={isSubmitting}
				/>
				{#if errors.sessionName && touched.sessionName}
					<p class="mt-2 text-sm text-[#991B1B]">{errors.sessionName}</p>
				{/if}
			</div>

			<!-- Session Description -->
			<div>
				<label for="description" class="block text-sm font-medium text-[#251818] mb-2">
					Description <span class="text-[#584140]/50 font-normal">(optional)</span>
				</label>
				<textarea
					id="description"
					name="description"
					bind:value={sessionDescription}
					placeholder="Add a description to help everyone remember what this session is for..."
					rows="3"
					class="w-full px-4 py-3 bg-[#fff0ef]/50 rounded-xl text-[#251818] placeholder:text-[#584140]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition-all resize-none disabled:bg-[#fff0ef] disabled:cursor-not-allowed"
					disabled={isSubmitting}
				></textarea>
			</div>

			<!-- Currency -->
			<div>
				<label for="currency" class="block text-sm font-medium text-[#251818] mb-2">
					Currency
				</label>
				<select
					id="currency"
					name="currency"
					bind:value={currency}
					class="w-full px-4 py-3 bg-[#fff0ef]/50 rounded-xl text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition-all disabled:bg-[#fff0ef] disabled:cursor-not-allowed appearance-none bg-white"
					disabled={isSubmitting}
				>
					{#each currencies as curr}
						<option value={curr.code}>{curr.symbol} - {curr.name}</option>
					{/each}
				</select>
			</div>

			<!-- Bank info (shown to participants on their payment page) -->
			<div class="border-t border-[#fbe3e1] pt-6">
				<div class="flex items-start justify-between gap-3 mb-1">
					<p class="text-sm font-medium text-[#251818]">Transfer details <span class="text-[#584140]/60 font-normal">(optional)</span></p>
				</div>
				<p class="text-xs text-[#584140] mb-4">Add one or more transfer destinations — participants see all of them on their payment page and can pick the easiest.</p>

				<div class="space-y-4">
					{#each bankRows as row, i (i)}
						<div class="bg-[#fff0ef]/30 rounded-2xl p-4 border border-[#fbe3e1]">
							<div class="flex items-center justify-between mb-3">
								<p class="text-xs font-semibold text-[#584140] uppercase tracking-wide">Account #{i + 1}</p>
								{#if bankRows.length > 1}
									<button type="button" onclick={() => removeBankRow(i)} class="text-xs text-[#991B1B] underline hover:opacity-80" disabled={isSubmitting}>
										Remove
									</button>
								{/if}
							</div>
							<div class="space-y-3">
								<input
									name="bank_name[]"
									type="text"
									bind:value={row.bank_name}
									placeholder="Bank or e-wallet (e.g. BCA, GoPay)"
									maxlength="80"
									class="w-full px-4 py-2.5 bg-white rounded-xl text-sm text-[#251818] placeholder:text-[#584140]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] disabled:bg-[#fff0ef]"
									disabled={isSubmitting}
								/>
								<input
									name="account_number[]"
									type="text"
									bind:value={row.account_number}
									placeholder="Account number"
									maxlength="40"
									class="w-full px-4 py-2.5 bg-white rounded-xl text-sm text-[#251818] placeholder:text-[#584140]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] disabled:bg-[#fff0ef] font-mono"
									disabled={isSubmitting}
								/>
								<input
									name="account_holder[]"
									type="text"
									bind:value={row.account_holder}
									placeholder="Account holder name"
									maxlength="80"
									class="w-full px-4 py-2.5 bg-white rounded-xl text-sm text-[#251818] placeholder:text-[#584140]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] disabled:bg-[#fff0ef]"
									disabled={isSubmitting}
								/>
							</div>
						</div>
					{/each}

					{#if bankRows.length < MAX_BANK_ACCOUNTS}
						<button
							type="button"
							onclick={addBankRow}
							class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#251818] bg-white hover:bg-[#fff0ef] border-2 border-dashed border-[#fbe3e1] rounded-xl transition-colors disabled:opacity-50"
							disabled={isSubmitting}
						>
							<Plus class="w-4 h-4" />
							Add another transfer destination
						</button>
					{:else}
						<p class="text-xs text-[#584140] text-center">Maximum {MAX_BANK_ACCOUNTS} accounts.</p>
					{/if}
				</div>
			</div>

			<!-- Actions -->
			<div class="flex gap-3 pt-4">
				<button
					type="button"
					onclick={handleCancel}
					class="flex-1 px-6 py-3 text-sm font-medium text-[#251818] bg-white rounded-xl hover:bg-[#fff0ef] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={isSubmitting}
				>
					Cancel
				</button>
				<button
					type="submit"
					class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:from-[#9a282c] hover:to-[#FF5252] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={isSubmitting || !isFormValid()}
				>
					{#if isSubmitting}
						<Loader2 class="w-4 h-4 animate-spin" />
						Creating...
					{:else}
						<Plus class="w-4 h-4" />
						Create Session
					{/if}
				</button>
			</div>
		</form>

		<!-- Help Text -->
		<p class="text-center text-xs text-[#584140] mt-6">
			After creating, you can add contacts and split bills equally or assign specific amounts.
		</p>
	</div>
</div>

<style>
	/* Custom select arrow */
	select {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 0.75rem center;
		background-repeat: no-repeat;
		background-size: 1.5em 1.5em;
		padding-right: 2.5rem;
	}

	textarea::-webkit-resizer {
		display: none;
	}
</style>
