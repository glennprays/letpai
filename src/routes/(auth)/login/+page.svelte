<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Input from '$lib/components/ui/Input.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { validatePhone, validatePassword } from '$lib/utils/validation';
	import { CircleAlert } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { form }: { form?: ActionData } = $props();

	let phone = $state('');
	let password = $state('');
	let errors = $state({ phone: '', password: '' });
	let submitting = $state(false);

	const returnURL = $derived(page.url.searchParams.get('return') || '/dashboard');
</script>

<Seo title="Sign in" description="Sign in to Letpai to see who still owes you." />

<h1 class="text-heading text-[32px]">Welcome back</h1>
<p class="mt-1.5 text-ink-soft">Sign in with your WhatsApp number.</p>

{#if form?.message}
	<p class="mt-5 flex items-start gap-2 rounded-field bg-rejected-tint px-4 py-3 text-sm font-medium text-rejected" role="alert">
		<CircleAlert size={18} class="mt-px flex-none" />
		{form.message}
	</p>
{/if}

<form
	method="POST"
	class="mt-6 flex flex-col gap-5"
	novalidate
	use:enhance={({ cancel }) => {
		const p = validatePhone(phone);
		const pw = validatePassword(password);
		errors = { phone: p.valid ? '' : (p.error ?? ''), password: pw.valid ? '' : (pw.error ?? '') };
		if (!p.valid || !pw.valid) {
			cancel();
			return;
		}
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	<PhoneInput label="WhatsApp number" id="whatsapp" bind:value={phone} error={errors.phone || undefined} autofocus />
	<input type="hidden" name="whatsapp_number" value={phone} />
	<input type="hidden" name="return" value={returnURL} />

	<div class="flex flex-col gap-1.5">
		<div class="flex items-baseline justify-between">
			<label for="password" class="text-sm font-semibold text-ink">Password</label>
			<a href="/forgot-password" class="text-sm font-semibold text-steel hover:text-ink">Forgot it?</a>
		</div>
		<Input
			type="password"
			name="password"
			id="password"
			autocomplete="current-password"
			bind:value={password}
			error={!!errors.password}
			errorText={errors.password}
		/>
	</div>

	<Button type="submit" size="lg" loading={submitting} class="mt-1 w-full">Sign in</Button>
</form>

<p class="mt-6 text-center text-[15px] text-ink-soft">
	New to Letpai? <a href="/register" class="font-semibold text-ink underline decoration-hairline decoration-2 underline-offset-4 hover:decoration-ink">Create an account</a>
</p>
