<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { CircleAlert } from 'lucide-svelte';
	import Seo from '$lib/components/Seo.svelte';
	import AdminAuthCard from '$lib/components/admin/AdminAuthCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import OtpInput from '$lib/components/ui/OtpInput.svelte';
	import { formatWhatsappDisplay } from '$lib/utils/phone';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	// Two ways in: a WhatsApp code (default) or a password, for when the
	// gateway that delivers codes is the thing that's broken.
	let mode = $state<'otp' | 'password'>('otp');
	let phone = $state('');
	let password = $state('');
	let code = $state('');
	let submitting = $state(false);
	let verifyForm = $state<HTMLFormElement>();

	// "Use a different number" leaves the code step without a round trip by
	// ignoring the form result that put us there.
	let dismissed = $state<ActionData | null>(null);
	const formStep = $derived(form && form !== dismissed && 'step' in form ? form.step : null);
	const step = $derived(formStep === 'verify' ? 'verify' : mode === 'password' ? 'password' : 'initiate');
	const error = $derived((form && form !== dismissed && 'error' in form && (form.error as string)) || '');
	const sessionId = $derived((form && 'session_id' in form && (form.session_id as string)) || '');
	const sentTo = $derived((form && 'whatsapp_number' in form && (form.whatsapp_number as string)) || phone);

	// Keep the number the server echoed back, so a failed attempt doesn't
	// make the admin type it again.
	$effect(() => {
		if (form && 'whatsapp_number' in form && form.whatsapp_number) phone = String(form.whatsapp_number);
		if (formStep === 'password') mode = 'password';
	});

	// A wrong code clears the boxes so the next attempt starts clean.
	$effect(() => {
		if (formStep === 'verify' && error) code = '';
	});

	const submit: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	};
</script>

<Seo title="Admin sign in" noindex />

<AdminAuthCard
	title={step === 'verify' ? 'Check WhatsApp' : 'Admin sign in'}
	description={step === 'verify'
		? `We sent a 6-digit code to ${formatWhatsappDisplay(sentTo) || 'your WhatsApp'}.`
		: step === 'password'
			? 'Use the password from your admin account.'
			: "We'll send a one-time code to the WhatsApp number on your admin account."}
>
	{#if error}
		<p class="mb-5 flex items-start gap-2 rounded-field bg-rejected-tint px-4 py-3 text-sm font-medium text-rejected" role="alert">
			<CircleAlert size={18} class="mt-px flex-none" aria-hidden="true" />
			{error}
		</p>
	{/if}

	{#if step === 'verify'}
		<form method="POST" action="?/verify" class="flex flex-col gap-5" use:enhance={submit} bind:this={verifyForm}>
			<input type="hidden" name="session_id" value={sessionId} />
			<input type="hidden" name="whatsapp_number" value={sentTo} />
			<input type="hidden" name="otp_code" value={code} />
			<OtpInput label="Code" bind:value={code} autofocus disabled={submitting} oncomplete={async () => {
				// Let the hidden otp_code field pick up the last digit first.
				await tick();
				verifyForm?.requestSubmit();
			}} />
			<Button type="submit" variant="ink" size="lg" loading={submitting} disabled={code.length !== 6} class="w-full">Verify and continue</Button>
		</form>
		<div class="mt-4 flex items-center justify-center gap-4">
			<form method="POST" action="?/initiate" use:enhance={submit}>
				<input type="hidden" name="whatsapp_number" value={sentTo} />
				<button type="submit" class="text-sm font-semibold text-steel hover:text-ink" disabled={submitting}>Send a new code</button>
			</form>
			<span class="text-hairline" aria-hidden="true">·</span>
			<button type="button" class="text-sm font-semibold text-steel hover:text-ink" onclick={() => (dismissed = form)}>Use a different number</button>
		</div>
	{:else if step === 'password'}
		<form method="POST" action="?/password" class="flex flex-col gap-5" use:enhance={submit} novalidate>
			<PhoneInput id="admin-phone" label="WhatsApp number" bind:value={phone} autofocus />
			<input type="hidden" name="whatsapp_number" value={phone} />
			<Input id="admin-password" type="password" name="password" label="Password" autocomplete="current-password" bind:value={password} />
			<Button type="submit" variant="ink" size="lg" loading={submitting} class="w-full">Sign in</Button>
		</form>
		<p class="mt-4 text-center">
			<button type="button" class="text-sm font-semibold text-steel hover:text-ink" onclick={() => (mode = 'otp')}>Get a WhatsApp code instead</button>
		</p>
	{:else}
		<form method="POST" action="?/initiate" class="flex flex-col gap-5" use:enhance={submit} novalidate>
			<PhoneInput id="admin-phone" label="WhatsApp number" bind:value={phone} autofocus />
			<input type="hidden" name="whatsapp_number" value={phone} />
			<Button type="submit" variant="ink" size="lg" loading={submitting} class="w-full">Send code</Button>
		</form>
		<p class="mt-4 text-center">
			<button type="button" class="text-sm font-semibold text-steel hover:text-ink" onclick={() => (mode = 'password')}>Use a password instead</button>
		</p>
	{/if}
</AdminAuthCard>
