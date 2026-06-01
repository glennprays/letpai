<script lang="ts">
	import { Loader2, Send, Eye } from 'lucide-svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import { testSendAdminTemplate, type AdminMessageTemplate } from '$lib/services/admin';
	import { toast } from '$lib/stores/toast';
	import { validateWhatsappNumber } from '$lib/utils/phone';

	interface Props {
		template: AdminMessageTemplate;
		onclose: () => void;
	}

	let { template, onclose }: Props = $props();

	// Smart sample defaults for template variables
	const SAMPLE_DEFAULTS: Record<string, string> = {
		ParticipantName: 'John',
		SessionName: 'Dinner at Padella',
		MakerName: 'Sarah',
		Total: '350.000',
		Share: '87.500',
		URL: 'https://letpai.app/payment/abc123',
		Code: '123456',
		ExpiresMinutes: '5'
	};

	// Initialize variable values with smart defaults.
	// Use $derived.by so the map reacts to the template prop (silences
	// state_referenced_locally — template is stable for the modal's
	// lifetime but Svelte wants the dependency explicit).
	let varValues = $state<Record<string, string>>({});

	$effect(() => {
		varValues = Object.fromEntries(
			template.variables.map((v) => [v, SAMPLE_DEFAULTS[v] ?? v])
		);
	});

	let phone = $state('');
	let sending = $state(false);

	// Live preview: replace {{.VarName}} with current values
	let preview = $derived(
		template.body.replace(
			/\{\{\.(\w+)\}\}/g,
			(_, key) => varValues[key] ?? `{{.${key}}}`
		)
	);

	let phoneError = $derived(validateWhatsappNumber(phone));
	let canSend = $derived(phone.length >= 10 && !phoneError && !sending);

	async function handleSend() {
		if (!canSend) return;
		sending = true;
		try {
			const result = await testSendAdminTemplate(template.key, {
				phone_number: phone,
				variables: varValues
			});
			if (result.status === 'sent') {
				toast.success(`Test message sent to ${phone}`);
			} else {
				toast.error('Message rendered but delivery failed — WhatsApp gateway may be down.');
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to send test message';
			toast.error(msg);
		} finally {
			sending = false;
		}
	}
</script>

<Modal open={true} title={`Send Test: ${template.name}`} {onclose}>
	<div class="space-y-5">
		<!-- Variable inputs -->
		{#if template.variables.length > 0}
			<div>
				<p class="block text-xs font-semibold text-[#584140] uppercase tracking-wide mb-2">
					Template variables
				</p>
				<div class="space-y-2">
					{#each template.variables as v (v)}
						<div class="flex items-center gap-2">
							<label
								for="var-{v}"
								class="text-xs font-mono text-[#584140] w-32 flex-shrink-0"
							>
								{v}
							</label>
							<input
								id="var-{v}"
								type="text"
								bind:value={varValues[v]}
								class="flex-1 px-3 py-2 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
							/>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Live preview -->
		<div>
			<p class="flex items-center gap-1.5 text-xs font-semibold text-[#584140] uppercase tracking-wide mb-2">
				<Eye size={14} />
				Preview
			</p>
			<div class="bg-[#f5dddb]/50 rounded-2xl p-4 text-sm text-[#251818] whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
				{preview}
			</div>
		</div>

		<!-- Phone number -->
		<div>
			<PhoneInput
				bind:value={phone}
				label="Send to"
				placeholder="8123456789"
				error={phone && phoneError ? phoneError : undefined}
				id="test-phone"
			/>
		</div>

		<!-- Actions -->
		<div class="flex justify-end gap-2 pt-1">
			<button
				type="button"
				onclick={onclose}
				disabled={sending}
				class="px-4 py-2 text-sm font-medium text-[#251818] hover:bg-[#fff0ef] rounded-xl transition-colors disabled:opacity-50"
			>
				Cancel
			</button>
			<button
				type="button"
				onclick={handleSend}
				disabled={!canSend}
				class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:opacity-95 disabled:opacity-50 transition-colors"
			>
				{#if sending}
					<Loader2 size={16} class="animate-spin" />
				{:else}
					<Send size={16} />
				{/if}
				Send Test Message
			</button>
		</div>
	</div>
</Modal>
