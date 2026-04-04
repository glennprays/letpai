<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
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
	let handleSubmit = $state<(() => void) | undefined>(undefined);

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

	// Initialize enhance only on client side
	onMount(() => {
		handleSubmit = enhance(() => {
			return async ({ action, formData }) => {
				isSubmitting = true;
				try {
					const response = await action(formData);
					return response;
				} finally {
					isSubmitting = false;
				}
			};
		});
	});

	// Handle successful form submission - redirect to session detail
	$effect(() => {
		if (form?.success && form.sessionId) {
			goto(`/sessions/${form.sessionId}`);
		}
	});

	// Handle server errors - reset submitting state on error
	$effect(() => {
		if (form?.error) {
			isSubmitting = false;
		}
	});
</script>

<div class="min-h-screen bg-gray-50/50">
	<div class="max-w-lg mx-auto px-4 py-8 sm:py-12">
		<!-- Header -->
		<header class="mb-8">
			<button
				onclick={handleCancel}
				class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4 text-sm"
			>
				<X class="w-4 h-4" />
				<span>Cancel</span>
			</button>
			<h1 class="text-2xl font-semibold text-gray-900 tracking-tight">Create New Session</h1>
			<p class="text-sm text-gray-500 mt-1"
				>Start a new bill splitting session. You can add contacts and bills after creating.</p
			>
		</header>

		<!-- Server Error -->
		{#if form?.error}
			<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
				<p class="text-sm text-red-700">{form.error}</p>
			</div>
		{/if}

		<!-- Form -->
		<form method="POST" class="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
			<!-- Session Name -->
			<div>
				<label for="session_name" class="block text-sm font-medium text-gray-700 mb-2">
					Session Name <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="session_name"
					name="session_name"
					bind:value={sessionName}
					onblur={() => handleBlur('sessionName', sessionName)}
					oninput={() => handleInput('sessionName', sessionName)}
					placeholder="e.g., Lunch at Warung"
					required
					class="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
					disabled={isSubmitting}
				/>
				{#if errors.sessionName && touched.sessionName}
					<p class="mt-2 text-sm text-red-600">{errors.sessionName}</p>
				{/if}
			</div>

			<!-- Session Description -->
			<div>
				<label for="session_description" class="block text-sm font-medium text-gray-700 mb-2">
					Description <span class="text-gray-400 font-normal">(optional)</span>
				</label>
				<textarea
					id="session_description"
					name="session_description"
					bind:value={sessionDescription}
					placeholder="Add a description to help everyone remember what this session is for..."
					rows="3"
					class="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
					disabled={isSubmitting}
				></textarea>
			</div>

			<!-- Currency -->
			<div>
				<label for="currency" class="block text-sm font-medium text-gray-700 mb-2">
					Currency
				</label>
				<select
					id="currency"
					name="currency"
					bind:value={currency}
					class="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed appearance-none bg-white"
					disabled={isSubmitting}
				>
					{#each currencies as curr}
						<option value={curr.code}>{curr.symbol} - {curr.name}</option>
					{/each}
				</select>
			</div>

			<!-- Actions -->
			<div class="flex gap-3 pt-4 border-t border-gray-100">
				<button
					type="button"
					onclick={handleCancel}
					class="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={isSubmitting}
				>
					Cancel
				</button>
				<button
					type="submit"
					class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#FF6B6B] rounded-lg hover:bg-[#FF5252] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
		<p class="text-center text-xs text-gray-400 mt-6">
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
