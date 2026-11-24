<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import { CircleCheck, Smartphone, UserPlus } from 'lucide-svelte';
	import Button from '../ui/Button.svelte';
	import Checkbox from '../ui/Checkbox.svelte';
	import { ArtPhone } from '../art';
	import { isContactPickerSupported, selectDeviceContacts, getUniquePhoneNumbers } from '$lib/utils/contactPicker';
	import { digitsOnly, formatWhatsappDisplay } from '$lib/utils/phone';
	import type { ContactGroup, CreateContactRequest } from '$lib/types/api';

	interface Row {
		id: string;
		name: string;
		phone: string;
		existing: boolean;
		selected: boolean;
	}

	interface Props {
		/** Digits-only WhatsApp numbers already saved, for duplicate detection. */
		existingNumbers?: Set<string>;
		groups?: ContactGroup[];
		loading?: boolean;
		/** Resolve true when the import succeeded. */
		onimport?: (contacts: CreateContactRequest[]) => Promise<boolean> | boolean;
		/** Offered when the device can't share contacts. */
		onaddmanually?: () => void;
		oncancel?: () => void;
		class?: string;
	}

	let { existingNumbers = new Set(), groups = [], loading = false, onimport, onaddmanually, oncancel, class: className }: Props = $props();

	let step = $state<'intro' | 'review' | 'done'>('intro');
	let rows = $state<Row[]>([]);
	let groupId = $state('');
	let error = $state('');
	let imported = $state(0);
	// Unknown until mounted: the Contact Picker API only exists in the browser.
	let supported = $state<boolean | null>(null);

	onMount(() => {
		supported = isContactPickerSupported();
	});

	async function pick() {
		error = '';
		const result = await selectDeviceContacts();
		if (!result.success || !result.contacts) {
			// Closing the picker without choosing isn't an error worth shouting about.
			if (result.error && result.error !== 'No contacts selected.') error = result.error;
			return;
		}
		rows = result.contacts
			.map((c) => {
				const phone = getUniquePhoneNumbers(c)[0] ?? '';
				const existing = existingNumbers.has(digitsOnly(phone));
				return { id: c.id, name: c.name?.trim() || 'No name', phone, existing, selected: !existing };
			})
			.filter((r) => r.phone);
		if (rows.length === 0) {
			error = "None of those contacts have a phone number we can use.";
			return;
		}
		step = 'review';
	}

	const fresh = $derived(rows.filter((r) => !r.existing));
	const chosen = $derived(fresh.filter((r) => r.selected));
	const allChosen = $derived(fresh.length > 0 && chosen.length === fresh.length);

	function toggleAll() {
		const next = !allChosen;
		for (const r of rows) if (!r.existing) r.selected = next;
	}

	async function runImport() {
		error = '';
		const payload: CreateContactRequest[] = chosen.map((r) => ({
			name: r.name,
			whatsapp_number: r.phone,
			...(groupId && { group_id: groupId })
		}));
		const ok = (await onimport?.(payload)) ?? false;
		if (!ok) {
			error = "We couldn't import those contacts. Try again in a moment.";
			return;
		}
		imported = payload.length;
		step = 'done';
	}

	function restart() {
		step = 'intro';
		rows = [];
		groupId = '';
		error = '';
	}
</script>

<div class={cn('flex flex-col gap-4', className)}>
	{#if step === 'intro'}
		<div class="flex flex-col items-center gap-4 py-2 text-center">
			<ArtPhone class="h-28 w-auto" />
			<p class="max-w-sm text-ink-soft">
				Pick people from your phone's address book. You'll see the list before anything is saved, and numbers you already have are skipped.
			</p>
		</div>

		{#if supported === false}
			<div class="rounded-card bg-pending-tint p-4 text-sm text-ink" role="status">
				<p class="font-semibold text-pending">This browser can't share your phone's contacts</p>
				<p class="mt-1">Importing works in Chrome on Android. On other devices, add people one at a time; it takes a few seconds each.</p>
			</div>
		{/if}

		{#if error}<p class="text-sm text-rejected" role="alert">{error}</p>{/if}

		<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			{#if oncancel}<Button variant="ghost" onclick={oncancel}>Cancel</Button>{/if}
			{#if supported === false && onaddmanually}
				<Button variant="ink" leftIcon={UserPlus} onclick={onaddmanually}>Add a contact</Button>
			{:else}
				<Button variant="ink" leftIcon={Smartphone} onclick={pick} disabled={!supported}>Choose from phone</Button>
			{/if}
		</div>
	{:else if step === 'review'}
		<div class="flex items-baseline justify-between gap-3">
			<p class="text-sm text-ink-soft">
				<strong class="text-ink">{fresh.length} new</strong>{#if rows.length > fresh.length}, {rows.length - fresh.length} already saved{/if}
			</p>
			{#if fresh.length > 1}
				<button type="button" onclick={toggleAll} class="text-sm font-semibold text-steel hover:underline">
					{allChosen ? 'Clear all' : 'Select all'}
				</button>
			{/if}
		</div>

		<ul class="max-h-80 divide-y divide-mist overflow-y-auto rounded-card bg-card shadow-[inset_0_0_0_1.5px_var(--color-mist)]">
			{#each rows as row (row.id)}
				<li>
					{#if row.existing}
						<div class="flex items-center gap-3 bg-fog/60 px-4 py-2.5">
							<CircleCheck size={22} class="flex-none text-ink-soft" aria-hidden="true" />
							<span class="min-w-0 flex-1">
								<span class="block truncate font-medium text-ink-soft">{row.name}</span>
								<span class="text-sm text-ink-soft tabular-nums">{formatWhatsappDisplay(row.phone)} · already saved</span>
							</span>
						</div>
					{:else}
						<Checkbox bind:checked={row.selected} ariaLabel="Import {row.name}" class="flex w-full px-4 py-2.5">
							<span class="min-w-0 flex-1">
								<span class="block truncate font-medium text-ink">{row.name}</span>
								<span class="text-sm text-ink-soft tabular-nums">{formatWhatsappDisplay(row.phone)}</span>
							</span>
						</Checkbox>
					{/if}
				</li>
			{/each}
		</ul>

		{#if groups.length > 0}
			<div class="flex flex-col gap-1.5">
				<label for="import-group" class="text-sm font-semibold text-ink">Put them in a group <span class="font-normal text-ink-soft">(optional)</span></label>
				<select
					id="import-group"
					bind:value={groupId}
					class="h-11 rounded-field bg-card px-4 text-[15px] font-medium text-ink shadow-[inset_0_0_0_1.5px_var(--color-hairline)] focus:shadow-[inset_0_0_0_2px_var(--color-steel)] focus:outline-none"
				>
					<option value="">No group</option>
					{#each groups as g (g.group_id)}<option value={g.group_id}>{g.name}</option>{/each}
				</select>
			</div>
		{/if}

		{#if error}<p class="text-sm text-rejected" role="alert">{error}</p>{/if}

		<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<Button variant="ghost" onclick={restart} disabled={loading}>Pick again</Button>
			<Button variant="ink" onclick={runImport} disabled={chosen.length === 0} {loading}>
				Import {chosen.length} {chosen.length === 1 ? 'contact' : 'contacts'}
			</Button>
		</div>
	{:else}
		<div class="flex flex-col items-center gap-2 py-4 text-center" role="status">
			<span class="grid size-12 place-items-center rounded-full bg-paid-tint text-paid"><CircleCheck size={24} aria-hidden="true" /></span>
			<p class="text-heading text-xl">{imported} {imported === 1 ? 'contact' : 'contacts'} added</p>
			<p class="text-sm text-ink-soft">They're ready to add to your next session.</p>
		</div>
		<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<Button variant="ghost" onclick={restart}>Import more</Button>
			{#if oncancel}<Button variant="ink" onclick={oncancel}>Done</Button>{/if}
		</div>
	{/if}
</div>
