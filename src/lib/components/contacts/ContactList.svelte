<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import ContactCard from './ContactCard.svelte';
	import { sectionByLetter } from '$lib/services/contacts-list';
	import type { Contact } from '$lib/types/api';
	import type { Snippet } from 'svelte';

	interface Props {
		contacts: Contact[];
		loading?: boolean;
		selecting?: boolean;
		selectedIds?: Set<string>;
		onSelect?: (contact: Contact) => void;
		onEdit?: (contact: Contact) => void;
		onDelete?: (contact: Contact) => void;
		onToggleFavorite?: (contact: Contact) => void;
		/** Shown when `contacts` is empty and not loading. */
		empty?: Snippet;
		class?: string;
	}

	let {
		contacts,
		loading = false,
		selecting = false,
		selectedIds = new Set(),
		onSelect,
		onEdit,
		onDelete,
		onToggleFavorite,
		empty,
		class: className
	}: Props = $props();

	// Letter headings help scanning a long address book; for a short list
	// they only chop it into tiny cards.
	const SECTION_FROM = 20;
	const sections = $derived(
		contacts.length >= SECTION_FROM ? sectionByLetter(contacts) : [{ key: '', contacts: sectionByLetter(contacts).flatMap((s) => s.contacts) }]
	);
</script>

{#if loading}
	<div class={cn('overflow-hidden rounded-card bg-card shadow-raised', className)} aria-busy="true" aria-label="Loading contacts">
		{#each Array(5) as _, i (i)}
			<div class="flex items-center gap-3 px-4 py-3 sm:px-5">
				<div class="size-10 animate-pulse rounded-full bg-mist"></div>
				<div class="flex-1 space-y-2">
					<div class="h-3.5 w-36 animate-pulse rounded-pill bg-mist"></div>
					<div class="h-3 w-48 animate-pulse rounded-pill bg-mist"></div>
				</div>
			</div>
		{/each}
	</div>
{:else if contacts.length === 0}
	{@render empty?.()}
{:else}
	<div class={cn('space-y-4', className)}>
		{#each sections as section (section.key)}
			<section aria-labelledby={section.key ? `contacts-${section.key}` : undefined} aria-label={section.key ? undefined : 'Contacts'}>
				{#if section.key}
					<h2 id="contacts-{section.key}" class="text-eyebrow mb-1.5 px-1 text-ink-soft">
						<span class="sr-only">{'Contacts starting with '}</span>{section.key}
					</h2>
				{/if}
				<ul class="divide-y divide-mist overflow-hidden rounded-card bg-card shadow-raised">
					{#each section.contacts as contact (contact.contact_id)}
						<ContactCard
							{contact}
							{selecting}
							selected={selectedIds.has(contact.contact_id)}
							{onSelect}
							{onEdit}
							{onDelete}
							{onToggleFavorite}
						/>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
{/if}
