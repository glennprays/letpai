<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { Info, Send } from 'lucide-svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import { testSendAdminTemplate, type AdminMessageTemplate } from '$lib/services/admin';
	import { toUserMessage } from '$lib/services/api';
	import { toast } from '$lib/stores/toast';
	import { renderTemplate } from '$lib/utils/admin';
	import { digitsOnly, formatWhatsappDisplay, validateWhatsappNumber } from '$lib/utils/phone';
	import { samplesFor } from './samples';
	import WhatsAppPreview from './WhatsAppPreview.svelte';

	interface Props {
		template: AdminMessageTemplate;
		/** The editor has changes that aren't saved; the backend sends the saved body. */
		unsaved?: boolean;
		onclose: () => void;
	}

	let { template, unsaved = false, onclose }: Props = $props();

	let open = $state(true);
	let values = $state<Record<string, string>>(untrack(() => samplesFor(template.variables)));
	// Default to the admin's own phone: the usual target for a test.
	let phone = $state(untrack(() => digitsOnly((page.data.profile as { whatsapp_number?: string } | null)?.whatsapp_number ?? '')));
	let sending = $state(false);
	let error = $state('');

	const preview = $derived(renderTemplate(template.body, values));
	const phoneError = $derived(phone ? validateWhatsappNumber(phone) : 'Enter a WhatsApp number.');

	async function send(e: SubmitEvent) {
		e.preventDefault();
		if (phoneError) return;
		sending = true;
		error = '';
		try {
			const result = await testSendAdminTemplate(template.key, { phone_number: phone, variables: values });
			if (result.status !== 'sent') {
				error = 'The message rendered, but the gateway did not deliver it. Check WhatsApp status.';
				return;
			}
			toast.success(`Test sent to ${formatWhatsappDisplay(phone)}`);
			open = false;
			onclose();
		} catch (err) {
			error = toUserMessage(err, "Couldn't send the test.");
		} finally {
			sending = false;
		}
	}
</script>

<Modal bind:open title="Test “{template.name}”" description="Sends one real WhatsApp message." busy={sending} {onclose} size="lg">
	<form class="flex flex-col gap-5" onsubmit={send} novalidate>
		{#if unsaved}
			<p class="flex items-start gap-2 rounded-field bg-pending-tint px-4 py-3 text-sm text-ink" role="status">
				<Info size={16} class="mt-0.5 flex-none text-pending" aria-hidden="true" />
				You have unsaved edits. The test uses the saved version below; save first to test your changes.
			</p>
		{/if}

		{#if template.variables.length}
			<fieldset class="grid gap-3 sm:grid-cols-2">
				<legend class="mb-2 text-sm font-semibold text-ink">Sample values</legend>
				{#each template.variables as v (v)}
					<Input id="var-{v}" label={v} size="sm" value={values[v]} oninput={(val) => (values[v] = val)} />
				{/each}
			</fieldset>
		{/if}

		<WhatsAppPreview text={preview} label="Message to be sent" />

		<PhoneInput id="test-phone" label="Send to" bind:value={phone} error={phone && phoneError ? phoneError : undefined} />

		{#if error}<p class="text-sm text-rejected" role="alert">{error}</p>{/if}

		<div class="flex gap-3">
			<Button type="button" variant="ghost" class="flex-1" onclick={() => ((open = false), onclose())} disabled={sending}>Cancel</Button>
			<Button type="submit" variant="ink" class="flex-1" leftIcon={Send} loading={sending} disabled={!!phoneError}>Send test</Button>
		</div>
	</form>
</Modal>
