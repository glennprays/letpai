<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { MessageCircle, Pencil, Star, StarOff, Trash2 } from 'lucide-svelte';
	import Avatar from '../ui/Avatar.svelte';
	import Checkbox from '../ui/Checkbox.svelte';
	import Menu, { type MenuItem } from '../ui/Menu.svelte';
	import GroupBadge from './GroupBadge.svelte';
	import { formatWhatsappDisplay, whatsappChatLink } from '$lib/utils/phone';
	import type { Contact } from '$lib/types/api';

	interface Props {
		contact: Contact;
		/** Select mode: the whole row toggles a checkbox and actions hide. */
		selecting?: boolean;
		selected?: boolean;
		onSelect?: (contact: Contact) => void;
		onEdit?: (contact: Contact) => void;
		onDelete?: (contact: Contact) => void;
		onToggleFavorite?: (contact: Contact) => void;
		class?: string;
	}

	let { contact, selecting = false, selected = false, onSelect, onEdit, onDelete, onToggleFavorite, class: className }: Props = $props();

	const phone = $derived(formatWhatsappDisplay(contact.whatsapp_number));

	const items = $derived<MenuItem[]>([
		...(onToggleFavorite
			? [
					{
						label: contact.is_favorite ? 'Remove from favourites' : 'Add to favourites',
						icon: contact.is_favorite ? StarOff : Star,
						onclick: () => onToggleFavorite(contact)
					}
				]
			: []),
		...(onEdit ? [{ label: 'Edit', icon: Pencil, onclick: () => onEdit(contact) }] : []),
		...(onDelete ? [{ label: 'Delete', icon: Trash2, danger: true, onclick: () => onDelete(contact) }] : [])
	]);
</script>

{#snippet body()}
	<Avatar
		src={contact.avatar_url}
		alt=""
		fullName={contact.name}
		phoneNumber={contact.whatsapp_number}
		identifier={contact.contact_id}
		size="md"
		class="flex-none"
	/>
	<span class="min-w-0 flex-1">
		<span class="flex items-center gap-1.5">
			<span class="truncate font-semibold text-ink">{contact.name}</span>
			{#if contact.is_favorite}
				<Star size={14} class="flex-none fill-coral text-coral" aria-label="Favourite" />
			{/if}
		</span>
		<span class="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-ink-soft">
			<span class="tabular-nums">{phone}</span>
			{#if contact.group_name}
				<GroupBadge name={contact.group_name} color={contact.group_color} class="max-w-full" />
			{/if}
		</span>
		{#if contact.notes}
			<span class="mt-0.5 block truncate text-xs text-ink-soft">{contact.notes}</span>
		{/if}
	</span>
{/snippet}

<li
	class={cn('group/row transition-colors duration-150', selected ? 'bg-fog' : 'hover:bg-fog/60', className)}
	data-testid="contact-row"
	data-contact-id={contact.contact_id}
>
	{#if selecting}
		<Checkbox
			checked={selected}
			ariaLabel="Select {contact.name}"
			onchange={() => onSelect?.(contact)}
			class="flex w-full gap-3 px-4 py-3 sm:px-5"
		>
			{@render body()}
		</Checkbox>
	{:else}
		<div class="flex items-center gap-3 px-4 py-3 sm:px-5">
			{@render body()}
			<a
				href={whatsappChatLink(contact.whatsapp_number)}
				target="_blank"
				rel="noopener noreferrer"
				class="grid size-9 flex-none place-items-center rounded-pill text-whatsapp transition-colors hover:bg-paid-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel"
				aria-label="Message {contact.name} on WhatsApp"
			>
				<MessageCircle size={18} aria-hidden="true" />
			</a>
			{#if items.length}
				<Menu {items} label="More actions for {contact.name}" />
			{/if}
		</div>
	{/if}
</li>
