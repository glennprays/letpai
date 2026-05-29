<script lang="ts">
	import { enhance } from '$app/forms';
	import { Shield, ArrowRight, MessageCircle, User, KeyRound } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let submitting = $state(false);

	const error = $derived(form?.error ?? '');
	const whatsappNumber = $derived((form && form.whatsapp_number) || '');
	const fullName = $derived((form && form.full_name) || '');
</script>

<svelte:head>
	<title>Set up super admin · Letpai</title>
</svelte:head>

<div
	class="min-h-screen flex items-center justify-center px-4 py-10 bg-[#fff8f7]"
	style="font-family:'Plus Jakarta Sans',sans-serif;"
>
	<div class="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_32px_-4px_rgba(37,24,24,0.08)] p-8">
		<div class="flex items-center gap-3 mb-2">
			<div
				class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] flex items-center justify-center"
			>
				<Shield size={20} color="#fff" />
			</div>
			<div>
				<h1 class="text-xl font-bold text-[#251818] leading-tight">First-time setup</h1>
				<p class="text-sm text-[#584140]">Create your super admin</p>
			</div>
		</div>

		<p class="text-sm text-[#584140] mb-6 mt-4">
			Letpai needs one super admin account before you can sign in. This setup card stays
			available only until that first account exists.
		</p>

		<form
			method="POST"
			class="space-y-4"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update({ reset: false });
				};
			}}
		>
			<div>
				<label for="whatsapp_number" class="block text-sm font-semibold text-[#584140] mb-2">
					WhatsApp number
				</label>
				<div class="flex items-center gap-2 bg-[#fff0ef] rounded-2xl px-3">
					<MessageCircle size={18} color="#584140" />
					<input
						id="whatsapp_number"
						name="whatsapp_number"
						type="tel"
						inputmode="numeric"
						placeholder="6281234567890"
						value={whatsappNumber}
						required
						minlength="10"
						class="flex-1 py-3 bg-transparent text-sm text-[#251818] focus:outline-none placeholder:text-[#584140]/60"
					/>
				</div>
				<p class="text-xs text-[#584140]/80 mt-1">
					E.164 format, no leading <code>+</code>. This is how you'll sign in via OTP later.
				</p>
			</div>

			<div>
				<label for="full_name" class="block text-sm font-semibold text-[#584140] mb-2">
					Full name
				</label>
				<div class="flex items-center gap-2 bg-[#fff0ef] rounded-2xl px-3">
					<User size={18} color="#584140" />
					<input
						id="full_name"
						name="full_name"
						type="text"
						placeholder="Your name"
						value={fullName}
						required
						minlength="2"
						maxlength="100"
						class="flex-1 py-3 bg-transparent text-sm text-[#251818] focus:outline-none placeholder:text-[#584140]/60"
					/>
				</div>
			</div>

			<div>
				<label for="password" class="block text-sm font-semibold text-[#584140] mb-2">
					Password
				</label>
				<div class="flex items-center gap-2 bg-[#fff0ef] rounded-2xl px-3">
					<KeyRound size={18} color="#584140" />
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="new-password"
						placeholder="At least 8 characters"
						required
						minlength="8"
						maxlength="100"
						class="flex-1 py-3 bg-transparent text-sm text-[#251818] focus:outline-none placeholder:text-[#584140]/60 font-mono"
					/>
				</div>
			</div>

			<div>
				<label for="confirm" class="block text-sm font-semibold text-[#584140] mb-2">
					Confirm password
				</label>
				<div class="flex items-center gap-2 bg-[#fff0ef] rounded-2xl px-3">
					<KeyRound size={18} color="#584140" />
					<input
						id="confirm"
						name="confirm"
						type="password"
						autocomplete="new-password"
						placeholder="Re-enter password"
						required
						minlength="8"
						maxlength="100"
						class="flex-1 py-3 bg-transparent text-sm text-[#251818] focus:outline-none placeholder:text-[#584140]/60 font-mono"
					/>
				</div>
			</div>

			{#if error}
				<p class="text-sm text-[#EF4444]">{error}</p>
			{/if}

			<button
				type="submit"
				disabled={submitting}
				class="w-full inline-flex items-center justify-center gap-2 px-5 h-12 rounded-2xl text-sm font-semibold text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] hover:opacity-95 disabled:opacity-50 transition-all"
			>
				{submitting ? 'Creating…' : 'Create super admin'}
				{#if !submitting}<ArrowRight size={16} />{/if}
			</button>
		</form>
	</div>
</div>
