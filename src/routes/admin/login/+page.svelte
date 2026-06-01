<script lang="ts">
	import { enhance } from '$app/forms';
	import { Shield, ArrowRight, MessageCircle, KeyRound } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	// User can flip between OTP-via-WhatsApp and password modes. The
	// backend treats them as two separate flows; the UI keeps both
	// behind a single card with a toggle so the visual surface stays
	// small.
	let mode = $state<'otp' | 'password'>('otp');

	// If a server action returned with step=password (e.g. wrong
	// password), keep the password mode visible on next render.
	$effect(() => {
		const formStep = form && 'step' in form ? form.step : null;
		if (formStep === 'password') mode = 'password';
	});

	const step = $derived(
		(form && 'step' in form && form.step) || (mode === 'password' ? 'password' : 'initiate')
	);
	const error = $derived((form && 'error' in form && (form.error as string)) || '');
	const sessionId = $derived((form && 'session_id' in form && (form.session_id as string)) || '');
	const whatsappNumber = $derived(
		(form && 'whatsapp_number' in form && (form.whatsapp_number as string)) || ''
	);

	let submitting = $state(false);
</script>

<svelte:head>
	<title>Admin sign in · Letpai</title>
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
				<h1 class="text-xl font-bold text-[#251818] leading-tight">Admin sign in</h1>
				<p class="text-sm text-[#584140]">Letpai control panel</p>
			</div>
		</div>

		{#if step === 'verify'}
			<p class="text-sm text-[#584140] mb-6 mt-4">
				We sent a 6-digit code to <strong>{whatsappNumber || 'your WhatsApp'}</strong>. Enter it
				below to continue.
			</p>

			<form
				method="POST"
				action="?/verify"
				class="space-y-4"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						submitting = false;
						await update({ reset: false });
					};
				}}
			>
				<input type="hidden" name="session_id" value={sessionId} />
				<input type="hidden" name="whatsapp_number" value={whatsappNumber} />

				<div>
					<label for="otp_code" class="block text-sm font-semibold text-[#584140] mb-2">
						Verification code
					</label>
					<input
						id="otp_code"
						name="otp_code"
						type="text"
						inputmode="numeric"
						pattern="[0-9]*"
						maxlength="6"
						autocomplete="one-time-code"
						placeholder="123456"
						class="w-full px-4 py-3 text-center text-2xl tracking-[0.4em] font-semibold bg-[#fff0ef] rounded-2xl text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#ae2f34]/30"
						required
					/>
				</div>

				{#if error}
					<p class="text-sm text-[#EF4444]">{error}</p>
				{/if}

				<button
					type="submit"
					disabled={submitting}
					class="w-full inline-flex items-center justify-center gap-2 px-5 h-12 rounded-2xl text-sm font-semibold text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] hover:opacity-95 disabled:opacity-50 transition-all"
				>
					{submitting ? 'Verifying…' : 'Verify and continue'}
					{#if !submitting}<ArrowRight size={16} />{/if}
				</button>
			</form>

			<form method="POST" action="?/initiate" class="mt-4">
				<input type="hidden" name="whatsapp_number" value={whatsappNumber} />
				<button
					type="submit"
					class="w-full text-xs text-[#584140] hover:text-[#251818] underline-offset-4 hover:underline transition-colors"
				>
					Didn't get a code? Send a new one
				</button>
			</form>
		{:else if step === 'password'}
			<p class="text-sm text-[#584140] mb-6 mt-4">
				Sign in with the password you set on your profile. If you haven't set one yet, switch back
				to the WhatsApp code flow.
			</p>

			<form
				method="POST"
				action="?/password"
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
					<label for="whatsapp_number_pw" class="block text-sm font-semibold text-[#584140] mb-2">
						WhatsApp number
					</label>
					<div class="flex items-center gap-2 bg-[#fff0ef] rounded-2xl px-3">
						<MessageCircle size={18} color="#584140" />
						<input
							id="whatsapp_number_pw"
							name="whatsapp_number"
							type="tel"
							inputmode="numeric"
							placeholder="6281234567890"
							value={whatsappNumber}
							class="flex-1 py-3 bg-transparent text-sm text-[#251818] focus:outline-none placeholder:text-[#584140]/60"
							required
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
							autocomplete="current-password"
							placeholder="At least 8 characters"
							class="flex-1 py-3 bg-transparent text-sm text-[#251818] focus:outline-none placeholder:text-[#584140]/60"
							required
							minlength="8"
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
					{submitting ? 'Signing in…' : 'Sign in'}
					{#if !submitting}<ArrowRight size={16} />{/if}
				</button>

				<button
					type="button"
					onclick={() => (mode = 'otp')}
					class="w-full text-xs text-[#584140] hover:text-[#251818] underline-offset-4 hover:underline transition-colors"
				>
					Use a WhatsApp code instead
				</button>
			</form>
		{:else}
			<p class="text-sm text-[#584140] mb-6 mt-4">
				Enter the WhatsApp number registered for this admin. We'll send a one-time code via
				WhatsApp.
			</p>

			<form
				method="POST"
				action="?/initiate"
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
							class="flex-1 py-3 bg-transparent text-sm text-[#251818] focus:outline-none placeholder:text-[#584140]/60"
							required
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
					{submitting ? 'Sending…' : 'Send code'}
					{#if !submitting}<ArrowRight size={16} />{/if}
				</button>

				<button
					type="button"
					onclick={() => (mode = 'password')}
					class="w-full text-xs text-[#584140] hover:text-[#251818] underline-offset-4 hover:underline transition-colors"
				>
					Sign in with a password instead
				</button>
			</form>
		{/if}
	</div>
</div>
