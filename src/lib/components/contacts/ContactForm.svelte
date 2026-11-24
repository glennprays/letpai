<script lang="ts">
	import { untrack } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import { Check } from 'lucide-svelte';
	import Input from '../ui/Input.svelte';
	import PhoneInput from '../ui/PhoneInput.svelte';
	import Button from '../ui/Button.svelte';
	import { digitsOnly, validateWhatsappNumber } from '$lib/utils/phone';
	import type { Contact, ContactGroup, CreateContactRequest, UpdateContactRequest } from '$lib/types/api';

	interface Props {
		contact?: Contact | null;
		groups?: ContactGroup[];
		loading?: boolean;
		/**
		 * New contact: the full create payload. Edit: only changed fields;
		 * `group_id: ''` means "take them out of their group" (PUT can't
		 * clear it, so the page routes that through the bulk endpoint).
		 */
		onsubmit?: (data: CreateContactRequest | UpdateContactRequest) => void;
		oncancel?: () => void;
		submitText?: string;
		class?: string;
	}

	let { contact = null, groups = [], loading = false, onsubmit, oncancel, submitText = 'Save contact', class: className }: Props = $props();

	// Fields start from the contact at mount; the modal remounts per contact.
	let name = $state(untrack(() => contact?.name ?? ''));
	let phone = $state(untrack(() => contact?.whatsapp_number ?? ''));
	let groupId = $state(untrack(() => contact?.group_id ?? ''));
	let notes = $state(untrack(() => contact?.notes ?? ''));
	let errors = $state<{ name?: string; phone?: string }>({});

	function validate(): boolean {
		const next: typeof errors = {};
		if (name.trim().length < 2) next.name = name.trim() ? 'Use at least 2 characters.' : 'Enter a name.';
		const phoneErr = validateWhatsappNumber(phone);
		if (phoneErr) next.phone = phoneErr;
		errors = next;
		return !next.name && !next.phone;
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate()) return;
		const trimmedName = name.trim();
		const trimmedNotes = notes.trim();

		if (!contact) {
			onsubmit?.({
				name: trimmedName,
				whatsapp_number: phone,
				...(groupId && { group_id: groupId }),
				...(trimmedNotes && { notes: trimmedNotes })
			});
			return;
		}

		const changes: UpdateContactRequest = {};
		if (trimmedName !== contact.name) changes.name = trimmedName;
		if (digitsOnly(phone) !== digitsOnly(contact.whatsapp_number)) changes.whatsapp_number = phone;
		if (groupId !== (contact.group_id ?? '')) changes.group_id = groupId;
		if (trimmedNotes !== (contact.notes ?? '')) changes.notes = trimmedNotes;
		onsubmit?.(changes);
	}

	const groupOptions = $derived([{ group_id: '', name: 'No group', color: '' }, ...groups]);
</script>

<form class={cn('flex flex-col gap-5', className)} onsubmit={handleSubmit} novalidate>
	<Input
		id="contact-name"
		label="Name"
		placeholder="Citra Lestari"
		autocomplete="off"
		bind:value={name}
		error={!!errors.name}
		errorText={errors.name}
		disabled={loading}
		maxLength={100}
	/>

	<PhoneInput id="contact-phone" label="WhatsApp number" bind:value={phone} error={errors.phone} disabled={loading} helperText="Reminders and payment links go here." />

	{#if groups.length > 0}
		<fieldset>
			<legend class="mb-2 text-sm font-semibold text-ink">Group</legend>
			<div class="flex flex-wrap gap-2">
				{#each groupOptions as g (g.group_id)}
					{@const on = groupId === g.group_id}
					<button
						type="button"
						aria-pressed={on}
						disabled={loading}
						onclick={() => (groupId = g.group_id)}
						class={cn(
							'inline-flex h-9 items-center gap-2 rounded-pill px-3.5 text-sm font-semibold transition-colors duration-150',
							on ? 'bg-ink text-card' : 'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--color-hairline)] hover:bg-fog'
						)}
					>
						{#if on}
							<Check size={14} strokeWidth={3} aria-hidden="true" />
						{:else if g.color}
							<span class="size-2 rounded-full" style:background-color={g.color} aria-hidden="true"></span>
						{/if}
						{g.name}
					</button>
				{/each}
			</div>
		</fieldset>
	{/if}

	<div class="flex flex-col gap-1.5">
		<label for="contact-notes" class="text-sm font-semibold text-ink">Note <span class="font-normal text-ink-soft">(optional)</span></label>
		<textarea
			id="contact-notes"
			bind:value={notes}
			disabled={loading}
			placeholder="Prefers BCA transfers"
			rows="2"
			maxlength={500}
			class="resize-none rounded-field bg-card px-4 py-3 text-[15px] text-ink shadow-[inset_0_0_0_1.5px_var(--color-hairline)] placeholder:text-ink-soft/70 focus:shadow-[inset_0_0_0_2px_var(--color-steel)] focus:outline-none disabled:opacity-60"
		></textarea>
		<p class="text-[13px] text-ink-soft">Only you see this.</p>
	</div>

	<div class="flex gap-3 pt-1">
		{#if oncancel}
			<Button type="button" variant="ghost" onclick={oncancel} disabled={loading} class="flex-1">Cancel</Button>
		{/if}
		<Button type="submit" variant="ink" {loading} class="flex-1">{submitText}</Button>
	</div>
</form>
