<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { FolderInput, FolderMinus, Star, StarOff, Trash2, X } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import Menu, { type MenuItem } from '../ui/Menu.svelte';
	import type { ContactGroup } from '$lib/types/api';

	interface Props {
		selectedCount: number;
		/** How many contacts are visible, for the "Select all" shortcut. */
		visibleCount?: number;
		groups?: ContactGroup[];
		loading?: boolean;
		onclear?: () => void;
		onselectall?: () => void;
		ondelete?: () => void;
		/** Empty string means "remove from group". */
		onassigngroup?: (groupId: string) => void;
		ontogglefavorite?: (isFavorite: boolean) => void;
		class?: string;
	}

	let {
		selectedCount,
		visibleCount = 0,
		groups = [],
		loading = false,
		onclear,
		onselectall,
		ondelete,
		onassigngroup,
		ontogglefavorite,
		class: className
	}: Props = $props();

	const none = $derived(selectedCount === 0 || loading);

	const favouriteItems = $derived<MenuItem[]>([
		{ label: 'Add to favourites', icon: Star, onclick: () => ontogglefavorite?.(true), disabled: none },
		{ label: 'Remove from favourites', icon: StarOff, onclick: () => ontogglefavorite?.(false), disabled: none }
	]);

	const groupItems = $derived<MenuItem[]>([
		...groups.map((g) => ({ label: `Move to ${g.name}`, icon: FolderInput, onclick: () => onassigngroup?.(g.group_id), disabled: none })),
		{ label: 'Remove from group', icon: FolderMinus, onclick: () => onassigngroup?.(''), disabled: none }
	]);

	const action =
		'h-10 w-full justify-center rounded-pill bg-fog px-3 text-sm font-semibold text-ink shadow-none hover:bg-mist sm:w-auto';
</script>

<!-- Pinned where the tab bar sits on mobile (select mode replaces it), and
     floating centred over the content column on desktop. -->
<div
	class={cn(
		'fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50',
		'md:inset-x-auto md:bottom-6 md:left-[calc(50%+7.5rem)] md:w-max md:-translate-x-1/2',
		className
	)}
	role="toolbar"
	aria-label="Selected contacts"
	transition:fly={{ y: 16, duration: 180 }}
>
	<div class="flex flex-wrap items-center gap-2 rounded-sheet bg-card p-2 shadow-pop sm:flex-nowrap sm:rounded-pill">
		<button
			type="button"
			onclick={onclear}
			class="grid size-10 flex-none place-items-center rounded-full text-ink-soft transition-colors hover:bg-fog hover:text-ink focus-visible:outline-2 focus-visible:outline-steel"
			aria-label="Done selecting"
		>
			<X size={18} aria-hidden="true" />
		</button>
		<p class="min-w-0 flex-1 text-sm font-semibold text-ink sm:flex-none sm:pr-2" aria-live="polite">
			{selectedCount} selected
		</p>
		{#if onselectall && visibleCount > selectedCount}
			<button
				type="button"
				onclick={onselectall}
				class="h-10 rounded-pill px-3 text-sm font-semibold text-steel transition-colors hover:bg-fog"
			>
				Select all {visibleCount}
			</button>
		{/if}

		<div class="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto">
			{#if ontogglefavorite}
				<Menu items={favouriteItems} label="Favourite selected contacts" text="Favourite" icon={Star} side="top" align="left" triggerClass={action} class="w-full sm:w-auto" />
			{/if}
			{#if onassigngroup}
				<Menu items={groupItems} label="Move selected contacts to a group" text="Group" icon={FolderInput} side="top" triggerClass={action} class="w-full sm:w-auto" />
			{/if}
			{#if ondelete}
				<button
					type="button"
					onclick={ondelete}
					disabled={none}
					class="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-pill bg-rejected-tint px-3 text-sm font-semibold text-rejected transition-colors hover:bg-rejected hover:text-card disabled:pointer-events-none disabled:opacity-40 sm:w-auto"
				>
					<Trash2 size={16} aria-hidden="true" />Delete
				</button>
			{/if}
		</div>
	</div>
</div>
