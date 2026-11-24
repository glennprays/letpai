<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { toast } from '$lib/stores/toast';
	import { sendResetLink } from '$lib/services/auth';
	import { toUserMessage } from '$lib/services/api';
	import { validatePhone } from '$lib/utils/validation';
	import { ArtPhone } from '$lib/components/art';
	import { onDestroy } from 'svelte';

	let phone = $state('');
	let error = $state('');
	let loading = $state(false);
	let sent = $state(false);
	let resendIn = $state(0);
	let timer: ReturnType<typeof setInterval> | undefined;
	onDestroy(() => clearInterval(timer));

	function countdown() {
		resendIn = 60;
		clearInterval(timer);
		timer = setInterval(() => {
			resendIn = Math.max(0, resendIn - 1);
			if (resendIn === 0) clearInterval(timer);
		}, 1000);
	}

	async function send() {
		const v = validatePhone(phone);
		error = v.valid ? '' : (v.error ?? '');
		if (!v.valid) return;
		loading = true;
		try {
			const res = await sendResetLink({ whatsapp_number: phone });
			if ('success' in res && res.success) {
				if (sent) toast.success('We sent another link.');
				sent = true;
				countdown();
			} else {
				error = ('error' in res && res.error?.message) || 'We could not send the link. Try again.';
			}
		} catch (e) {
			error = toUserMessage(e, 'We could not send the link. Try again.');
		} finally {
			loading = false;
		}
	}
</script>

<Seo title="Reset your password" noindex />

{#if !sent}
	<h1 class="text-heading text-[32px]">Forgot your password?</h1>
	<p class="mt-1.5 text-ink-soft">Enter your WhatsApp number and we'll send you a link to set a new one.</p>
	<form class="mt-6 flex flex-col gap-5" novalidate onsubmit={(e) => (e.preventDefault(), send())}>
		<PhoneInput label="WhatsApp number" id="whatsapp" bind:value={phone} error={error || undefined} autofocus />
		<Button type="submit" size="lg" {loading} class="w-full">Send reset link</Button>
	</form>
{:else}
	<ArtPhone class="mx-auto w-20" />
	<h1 class="text-heading mt-5 text-center text-[30px]">Check WhatsApp</h1>
	<p class="mt-2 text-center text-ink-soft">If an account uses this number, a reset link is on its way. It can take a minute.</p>
	<div class="mt-6 flex flex-col gap-2">
		<Button href="/login" variant="ink" size="lg" class="w-full">Back to sign in</Button>
		<Button variant="secondary" size="lg" class="w-full" disabled={resendIn > 0} {loading} onclick={send}>
			{resendIn > 0 ? `Send again in 0:${String(resendIn).padStart(2, '0')}` : 'Send again'}
		</Button>
		<button type="button" class="mt-1 text-sm font-semibold text-ink-soft hover:text-ink" onclick={() => (sent = false)}>Use a different number</button>
	</div>
{/if}

{#if !sent}
	<p class="mt-6 text-center text-[15px] text-ink-soft">
		Remembered it? <a href="/login" class="font-semibold text-ink underline decoration-hairline decoration-2 underline-offset-4 hover:decoration-ink">Sign in</a>
	</p>
{/if}
