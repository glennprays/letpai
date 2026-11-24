<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import SearchInput from '../ui/SearchInput.svelte';
	import Tabs from '../ui/Tabs.svelte';
	import type { Contact, ContactGroup } from '$lib/types/api';
	import type { ContactFilter } from '$lib/services/contacts-list';

	interface Props {
		searchQuery?: string;
		activeFilter?: ContactFilter;
		contacts?: Contact[];
		groups?: ContactGroup[];
		class?: string;
	}

	let { searchQuery = $bindable(''), activeFilter = $bindable('all'), contacts = [], groups = [], class: className }: Props = $props();

	// Counts come from the loaded contacts, not group.contact_count, so they
	// stay right straight after a bulk move or delete.
	const tabs = $derived([
		{ value: 'all', label: 'All', count: contacts.length },
		{ value: 'favorites', label: 'Favourites', count: contacts.filter((c) => c.is_favorite).length },
		...groups.map((g) => ({ value: g.group_id, label: g.name, count: contacts.filter((c) => c.group_id === g.group_id).length }))
	]);
</script>

<div class={cn('flex flex-col gap-3', className)}>
	<SearchInput bind:value={searchQuery} placeholder="Search by name or number" label="Search contacts" />
	<Tabs {tabs} bind:value={activeFilter} label="Filter contacts" />
</div>
