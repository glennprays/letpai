<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import OtpInput from '$lib/components/ui/OtpInput.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { ArtPhone } from '$lib/components/art';
	import { resetPassword, sendResetCode } from '$lib/services/auth';
	import { toUserMessage } from '$lib/services/api';
	import { toast } from '$lib/stores/toast';
	import { validateOTP, validatePassword, validatePhone } from '$lib/utils/validation';
	import { ArrowLeft, MessageCircle } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	const RESEND_SECONDS = 60;

	let step = $state<'phone' | 'code' | 'complete'>('phone');
	let phone = $state('');
	let code = $state('');
	let password = $state('');
	let loading = $state(false);
	let resendIn = $state(0);
	let errors = $state({ phone: '', code: '', password: '', form: '' });
	let timer: ReturnType<typeof setInterval> | undefined;

	const prettyPhone = $derived(phone ? `+${phone.slice(0, 2)} ${phone.slice(2).replace(/(\d{3})(\d{4})(\d*)/, '$1 $2 $3').trim()}` : '');

	function startCountdown() {
		resendIn = RESEND_SECONDS;
		clearInterval(timer);
		timer = setInterval(() => {
			resendIn = Math.max(0, resendIn - 1);
			if (resendIn === 0) clearInterval(timer);
		}, 1000);
	}

	onDestroy(() => clearInterval(timer));

	async function sendCode() {
		const validatedPhone = validatePhone(phone);
		errors = { phone: validatedPhone.valid ? '' : (validatedPhone.error ?? ''), code: '', password: '', form: '' };
		if (!validatedPhone.valid) return;

		loading = true;
		try {
			const res = await sendResetCode({ whatsapp_number: phone });
			if ('success' in res && res.success) {
				step = 'code';
				code = '';
				startCountdown();
			} else {
				errors.form = ('error' in res && res.error?.message) || 'We could not send a code. Try again.';
			}
		} catch (error) {
			errors.form = toUserMessage(error, 'We could not send a code. Try again.');
		} finally {
			loading = false;
		}
	}

	async function resend() {
		if (resendIn > 0) return;
		loading = true;
		try {
			const res = await sendResetCode({ whatsapp_number: phone });
			if ('success' in res && res.success) {
				code = '';
				startCountdown();
				toast.success(`New code sent to ${prettyPhone}.`);
			} else {
				errors.form = ('error' in res && res.error?.message) || 'We could not send a new code. Try again.';
			}
		} catch (error) {
			errors.form = toUserMessage(error, 'We could not send a new code. Try again.');
		} finally {
			loading = false;
		}
	}

	async function completeReset() {
		const validatedCode = validateOTP(code);
		const validatedPassword = validatePassword(password);
		errors = {
			phone: '',
			code: validatedCode.valid ? '' : (validatedCode.error ?? ''),
			password: validatedPassword.valid ? '' : (validatedPassword.error ?? ''),
			form: ''
		};
		if (!validatedCode.valid || !validatedPassword.valid) return;

		loading = true;
		try {
			const res = await resetPassword({ whatsapp_number: phone, otp: code, new_password: password });
			if ('success' in res && res.success) {
				step = 'complete';
				toast.success('Password updated. Sign in with your new password.');
			} else {
				errors.code = ('error' in res && res.error?.message) || 'That code did not work. Check WhatsApp and try again.';
			}
		} catch (error) {
			errors.code = toUserMessage(error, 'That code did not work. Check WhatsApp and try again.');
		} finally {
			loading = false;
		}
	}

	function useDifferentNumber() {
		step = 'phone';
		code = '';
		password = '';
		errors = { phone: '', code: '', password: '', form: '' };
		clearInterval(timer);
		resendIn = 0;
	}
</script>

<Seo title="Reset your password" noindex />

{#if step === 'phone'}
	<p class="text-eyebrow">Step 1 of 2</p>
	<h1 class="text-heading mt-2 text-[32px]">Forgot your password?</h1>
	<p class="mt-1.5 text-ink-soft">Enter your WhatsApp number and we’ll send a 6-digit code to verify it’s you.</p>

	{#if errors.form}
		<p class="mt-5 rounded-field bg-rejected-tint px-4 py-3 text-sm font-medium text-rejected" role="alert">{errors.form}</p>
	{/if}

	<form class="mt-6 flex flex-col gap-5" novalidate onsubmit={(event) => (event.preventDefault(), sendCode())}>
		<PhoneInput label="WhatsApp number" id="whatsapp" bind:value={phone} error={errors.phone || undefined} autofocus />
		<Button type="submit" size="lg" {loading} leftIcon={MessageCircle} class="w-full">Send me a code</Button>
	</form>

	<p class="mt-6 text-center text-[15px] text-ink-soft">
		Remembered it? <a href="/login" class="font-semibold text-ink underline decoration-hairline decoration-2 underline-offset-4 hover:decoration-ink">Sign in</a>
	</p>
{:else if step === 'code'}
	<button type="button" onclick={useDifferentNumber} class="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-pill px-2 py-1 text-sm font-semibold text-ink-soft hover:text-ink">
		<ArrowLeft size={16} /> Use a different number
	</button>
	<p class="text-eyebrow mt-3">Step 2 of 2</p>
	<h1 class="text-heading mt-2 text-[32px]">Check WhatsApp</h1>
	<p class="mt-1.5 text-ink-soft">We sent a 6-digit code to <b class="text-ink tabular-nums">{prettyPhone}</b>.</p>

	{#if errors.form}
		<p class="mt-5 rounded-field bg-rejected-tint px-4 py-3 text-sm font-medium text-rejected" role="alert">{errors.form}</p>
	{/if}

	<form class="mt-6 flex flex-col gap-5" novalidate onsubmit={(event) => (event.preventDefault(), completeReset())}>
		<OtpInput label="Code" bind:value={code} error={errors.code || undefined} autofocus disabled={loading} />
		<Input
			label="New password"
			type="password"
			id="new-password"
			autocomplete="new-password"
			bind:value={password}
			error={!!errors.password}
			errorText={errors.password}
			helperText={errors.password ? undefined : 'At least 8 characters.'}
		/>
		<Button type="submit" size="lg" {loading} class="w-full">Reset password</Button>
	</form>

	<p class="mt-5 text-center text-sm text-ink-soft" aria-live="polite">
		{#if resendIn > 0}
			No code yet? You can ask for a new one in <span class="font-semibold tabular-nums text-ink">0:{String(resendIn).padStart(2, '0')}</span>.
		{:else}
			No code yet? <button type="button" onclick={resend} disabled={loading} class="font-semibold text-ink underline decoration-hairline decoration-2 underline-offset-4 hover:decoration-ink">Send a new code</button>
		{/if}
	</p>
{:else}
	<ArtPhone class="mx-auto w-20" />
	<h1 class="text-heading mt-5 text-center text-[30px]">Password updated</h1>
	<p class="mt-2 text-center text-ink-soft">Sign in with your new password.</p>
	<Button href="/login" variant="ink" size="lg" class="mt-6 w-full">Back to sign in</Button>
{/if}
