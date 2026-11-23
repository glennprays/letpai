<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import OtpInput from '$lib/components/ui/OtpInput.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { toast } from '$lib/stores/toast';
	import { register, verifyOTP } from '$lib/services/auth';
	import { toUserMessage } from '$lib/services/api';
	import { setToken, setUser } from '$lib/stores/auth';
	import { validatePhone, validatePassword, validateOTP } from '$lib/utils/validation';
	import { cn } from '$lib/utils/cn';
	import { ArrowLeft, MessageCircle } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	const RESEND_SECONDS = 60;

	let step = $state<'account' | 'code'>('account');
	let loading = $state(false);
	let phone = $state('');
	let password = $state('');
	let code = $state('');
	let errors = $state({ phone: '', password: '', code: '', form: '' });
	let resendIn = $state(0);
	let timer: ReturnType<typeof setInterval> | undefined;

	function startCountdown() {
		resendIn = RESEND_SECONDS;
		clearInterval(timer);
		timer = setInterval(() => {
			resendIn = Math.max(0, resendIn - 1);
			if (resendIn === 0) clearInterval(timer);
		}, 1000);
	}
	onDestroy(() => clearInterval(timer));

	// Readable "+62 812 3456 7890" for the confirmation copy.
	const prettyPhone = $derived(phone ? `+${phone.slice(0, 2)} ${phone.slice(2).replace(/(\d{3})(\d{4})(\d*)/, '$1 $2 $3').trim()}` : '');

	const strength = $derived.by(() => {
		if (!password) return null;
		let score = 0;
		if (password.length >= 8) score++;
		if (password.length >= 12) score++;
		if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
		if (/\d/.test(password)) score++;
		if (/[^A-Za-z0-9]/.test(password)) score++;
		if (password.length < 8 || score <= 2) return { bars: 1, label: 'Weak', tone: 'bg-rejected', text: 'text-rejected' };
		if (score <= 3) return { bars: 2, label: 'Okay', tone: 'bg-pending', text: 'text-pending' };
		return { bars: 3, label: 'Strong', tone: 'bg-paid', text: 'text-paid' };
	});

	async function sendCode() {
		const p = validatePhone(phone);
		const pw = validatePassword(password);
		errors = { phone: p.valid ? '' : (p.error ?? ''), password: pw.valid ? '' : (pw.error ?? ''), code: '', form: '' };
		if (!p.valid || !pw.valid) return;

		loading = true;
		try {
			const res = await register({ whatsapp_number: phone, password });
			if ('success' in res && res.success) {
				step = 'code';
				code = '';
				startCountdown();
			} else {
				errors.form = ('error' in res && res.error?.message) || 'We could not create your account. Try again.';
			}
		} catch (e) {
			errors.form = toUserMessage(e, 'We could not create your account. Try again.');
		} finally {
			loading = false;
		}
	}

	async function resend() {
		if (resendIn > 0) return;
		loading = true;
		try {
			await register({ whatsapp_number: phone, password });
			toast.success(`New code sent to ${prettyPhone}.`);
			startCountdown();
		} catch (e) {
			toast.error(toUserMessage(e, 'We could not send a new code.'));
		} finally {
			loading = false;
		}
	}

	async function verify() {
		const v = validateOTP(code);
		errors.code = v.valid ? '' : (v.error ?? '');
		if (!v.valid) return;
		loading = true;
		try {
			const res = await verifyOTP({ whatsapp_number: phone, otp: code });
			if ('success' in res && res.success) {
				setToken(res.token);
				setUser(res.user);
				toast.success("You're in. Let's split your first bill.");
				await invalidateAll();
				// Let the auth store settle before the guarded route loads.
				setTimeout(() => goto('/dashboard', { replaceState: true }), 100);
			} else {
				errors.code = ('error' in res && res.error?.message) || 'That code did not work. Check WhatsApp and try again.';
			}
		} catch (e) {
			errors.code = toUserMessage(e, 'That code did not work. Check WhatsApp and try again.');
		} finally {
			loading = false;
		}
	}
</script>

<Seo title="Create an account" description="Create a Letpai account with your WhatsApp number." />

{#if step === 'account'}
	<p class="text-eyebrow">Step 1 of 2</p>
	<h1 class="text-heading mt-2 text-[32px]">Create your account</h1>
	<p class="mt-1.5 text-ink-soft">We'll send a code to your WhatsApp to check it's you.</p>

	{#if errors.form}
		<p class="mt-5 rounded-field bg-rejected-tint px-4 py-3 text-sm font-medium text-rejected" role="alert">{errors.form}</p>
	{/if}

	<form class="mt-6 flex flex-col gap-5" novalidate onsubmit={(e) => (e.preventDefault(), sendCode())}>
		<PhoneInput label="WhatsApp number" id="whatsapp" bind:value={phone} error={errors.phone || undefined} autofocus />
		<div class="flex flex-col gap-2">
			<Input
				label="Password"
				type="password"
				id="password"
				autocomplete="new-password"
				bind:value={password}
				error={!!errors.password}
				errorText={errors.password}
				helperText={errors.password ? undefined : 'At least 8 characters.'}
			/>
			{#if strength}
				<div class="flex items-center gap-3" aria-live="polite">
					<div class="grid flex-1 grid-cols-3 gap-1">
						{#each [1, 2, 3] as b (b)}
							<span class={cn('h-1 rounded-pill', b <= strength.bars ? strength.tone : 'bg-hairline')}></span>
						{/each}
					</div>
					<span class={cn('text-xs font-semibold', strength.text)}>{strength.label}</span>
				</div>
			{/if}
		</div>
		<Button type="submit" size="lg" {loading} leftIcon={MessageCircle} class="mt-1 w-full">Send me a code</Button>
	</form>

	<p class="mt-6 text-center text-[15px] text-ink-soft">
		Already have an account? <a href="/login" class="font-semibold text-ink underline decoration-hairline decoration-2 underline-offset-4 hover:decoration-ink">Sign in</a>
	</p>
	<p class="mt-3 text-center text-[13px] text-ink-soft">
		By creating an account you agree to the <a href="/tos" class="underline underline-offset-2 hover:text-ink">Terms</a> and
		<a href="/privacy" class="underline underline-offset-2 hover:text-ink">Privacy Policy</a>.
	</p>
{:else}
	<button type="button" onclick={() => (step = 'account')} class="-ml-2 inline-flex items-center gap-1 rounded-pill px-2 py-1 text-sm font-semibold text-ink-soft hover:text-ink">
		<ArrowLeft size={16} /> Change number
	</button>
	<p class="text-eyebrow mt-3">Step 2 of 2</p>
	<h1 class="text-heading mt-2 text-[32px]">Check WhatsApp</h1>
	<p class="mt-1.5 text-ink-soft">We sent a 6-digit code to <b class="text-ink tabular-nums">{prettyPhone}</b>.</p>

	<form class="mt-6 flex flex-col gap-5" novalidate onsubmit={(e) => (e.preventDefault(), verify())}>
		<OtpInput label="Code" bind:value={code} error={errors.code || undefined} autofocus disabled={loading} oncomplete={verify} />
		<Button type="submit" size="lg" {loading} class="w-full">Verify and continue</Button>
	</form>

	<p class="mt-5 text-center text-sm text-ink-soft" aria-live="polite">
		{#if resendIn > 0}
			No code yet? You can ask for a new one in <span class="font-semibold tabular-nums text-ink">0:{String(resendIn).padStart(2, '0')}</span>.
		{:else}
			No code yet? <button type="button" onclick={resend} disabled={loading} class="font-semibold text-ink underline decoration-hairline decoration-2 underline-offset-4 hover:decoration-ink">Send a new code</button>
		{/if}
	</p>
{/if}
