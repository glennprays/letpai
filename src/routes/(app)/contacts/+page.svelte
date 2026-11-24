<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { CloudOff, FolderCog, Plus, RefreshCw, SearchX, Smartphone, SquareCheck } from 'lucide-svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { ArtPhone } from '$lib/components/art';
	import ContactList from '$lib/components/contacts/ContactList.svelte';
	import ContactSearch from '$lib/components/contacts/ContactSearch.svelte';
	import ContactForm from '$lib/components/contacts/ContactForm.svelte';
	import ContactImport from '$lib/components/contacts/ContactImport.svelte';
	import ContactGroups from '$lib/components/contacts/ContactGroups.svelte';
	import BulkActionsBar from '$lib/components/contacts/BulkActionsBar.svelte';
	import {
		createContact,
		updateContact,
		deleteContact,
		createContactGroup,
		updateContactGroup,
		deleteContactGroup,
		bulkImportContacts,
		bulkDeleteContacts,
		bulkAssignGroup
	} from '$lib/services/contacts';
	import { filterContacts, type ContactFilter } from '$lib/services/contacts-list';
	import { toUserMessage } from '$lib/services/api';
	import { toast } from '$lib/stores/toast';
	import { digitsOnly } from '$lib/utils/phone';
	import type { Contact, CreateContactRequest, UpdateContactRequest } from '$lib/types/api';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Writable deriveds: mutations update the list straight away, and the
	// next server load (invalidate below) replaces it with the real thing.
	let contacts = $derived(data.contacts);
	let groups = $derived(data.groups);

	let query = $state('');
	let filter = $state<ContactFilter>('all');
	const shown = $derived(filterContacts(contacts, query, filter));

	let selecting = $state(false);
	let selected = $state<Set<string>>(new Set());
	let saving = $state(false);

	let formOpen = $state(false);
	let editing = $state<Contact | null>(null);
	let importOpen = $state(false);
	let groupsOpen = $state(false);
	let deleting = $state<Contact | null>(null);
	let bulkDeleteOpen = $state(false);

	const counts = $derived(Object.fromEntries(groups.map((g) => [g.group_id, contacts.filter((c) => c.group_id === g.group_id).length])));
	const existingNumbers = $derived(new Set(contacts.map((c) => digitsOnly(c.whatsapp_number))));

	// A filter pointing at a group that no longer exists falls back to All.
	$effect(() => {
		if (filter !== 'all' && filter !== 'favorites' && !groups.some((g) => g.group_id === filter)) filter = 'all';
	});

	const refresh = () => invalidate('app:contacts');

	/** Run a mutation with one saving flag, one error toast, and a refresh. */
	async function run(task: () => Promise<unknown>, success?: string, fallback = 'Something went wrong. Try again.'): Promise<boolean> {
		saving = true;
		try {
			await task();
			if (success) toast(success);
			await refresh();
			return true;
		} catch (error) {
			toast(toUserMessage(error, fallback), 'error');
			return false;
		} finally {
			saving = false;
		}
	}

	function openAdd() {
		editing = null;
		formOpen = true;
	}

	function openEdit(c: Contact) {
		editing = c;
		formOpen = true;
	}

	async function submitForm(payload: CreateContactRequest | UpdateContactRequest) {
		const target = editing;
		const ok = await run(async () => {
			if (!target) {
				await createContact(payload as CreateContactRequest);
				return;
			}
			// PUT ignores an empty group_id, so "No group" goes through the bulk
			// endpoint, which accepts null.
			const { group_id, ...rest } = payload as UpdateContactRequest;
			if (Object.keys(rest).length || group_id) await updateContact(target.contact_id, group_id ? { ...rest, group_id } : rest);
			if (group_id === '') await bulkAssignGroup([target.contact_id], null);
		}, target ? 'Contact saved' : `${(payload as CreateContactRequest).name} added`);
		if (ok) formOpen = false;
	}

	async function toggleFavourite(c: Contact) {
		const next = !c.is_favorite;
		contacts = contacts.map((x) => (x.contact_id === c.contact_id ? { ...x, is_favorite: next } : x));
		await run(() => updateContact(c.contact_id, { is_favorite: next }), undefined, "We couldn't update favourites.");
	}

	async function confirmDelete() {
		const c = deleting;
		if (!c) return;
		const ok = await run(() => deleteContact(c.contact_id), `${c.name} deleted`);
		if (ok) deleting = null;
	}

	// ── Select mode ─────────────────────────────────────────────────────
	function toggleSelect(c: Contact) {
		const next = new Set(selected);
		if (next.has(c.contact_id)) next.delete(c.contact_id);
		else next.add(c.contact_id);
		selected = next;
	}

	function startSelecting() {
		selecting = true;
	}

	function stopSelecting() {
		selecting = false;
		selected = new Set();
	}

	const plural = (n: number) => `${n} ${n === 1 ? 'contact' : 'contacts'}`;

	async function bulkDelete() {
		const ids = [...selected];
		const ok = await run(() => bulkDeleteContacts({ contact_ids: ids }), `${plural(ids.length)} deleted`);
		if (ok) {
			bulkDeleteOpen = false;
			stopSelecting();
		}
	}

	async function bulkGroup(groupId: string) {
		const ids = [...selected];
		const name = groups.find((g) => g.group_id === groupId)?.name;
		const ok = await run(() => bulkAssignGroup(ids, groupId || null), name ? `${plural(ids.length)} moved to ${name}` : `${plural(ids.length)} removed from their group`);
		if (ok) stopSelecting();
	}

	async function bulkFavourite(isFavorite: boolean) {
		// No bulk favourite endpoint: one PUT per contact. Fine for the
		// handful of people a host selects at once.
		const ids = [...selected];
		const ok = await run(
			() => Promise.all(ids.map((id) => updateContact(id, { is_favorite: isFavorite }))),
			isFavorite ? `${plural(ids.length)} added to favourites` : `${plural(ids.length)} removed from favourites`
		);
		if (ok) stopSelecting();
	}

	// ── Groups and import ───────────────────────────────────────────────
	const createGroup = (d: { name: string; color: string }) => run(() => createContactGroup(d), `${d.name} created`).then(() => {});
	const updateGroup = (id: string, d: { name: string; color: string }) => run(() => updateContactGroup(id, d), 'Group saved').then(() => {});
	const removeGroup = (id: string) => run(() => deleteContactGroup(id), 'Group deleted').then(() => {});

	const importContacts = (list: CreateContactRequest[]) => run(() => bulkImportContacts({ contacts: list }));

	const pageMenu = $derived([
		{ label: 'Import from phone', icon: Smartphone, onclick: () => (importOpen = true) },
		{ label: 'Manage groups', icon: FolderCog, onclick: () => (groupsOpen = true) },
		...(contacts.length ? [{ label: 'Select contacts', icon: SquareCheck, onclick: startSelecting }] : [])
	]);
</script>

<Seo title="Contacts" noindex />

<div class="mx-auto max-w-3xl px-4 pt-6 pb-10 sm:px-6 md:pt-10" class:pb-40={selecting}>
	<header class="flex items-end justify-between gap-4">
		<div class="min-w-0">
			<h1 class="text-poster text-5xl sm:text-6xl">Contacts</h1>
			{#if contacts.length}
				<p class="mt-2 text-ink-soft">
					{contacts.length} {contacts.length === 1 ? 'person' : 'people'}{#if groups.length}{' '}in {groups.length} {groups.length === 1 ? 'group' : 'groups'}{/if}
				</p>
			{/if}
		</div>
		<div class="flex flex-none items-center gap-2">
			<Menu items={pageMenu} label="More contact actions" />
			<Button size="sm" leftIcon={Plus} onclick={openAdd}><span class="sm:hidden">Add</span><span class="hidden sm:inline">Add contact</span></Button>
		</div>
	</header>

	{#if data.error}
		<EmptyState
			class="mt-8"
			icon={CloudOff}
			title="We couldn't load your contacts"
			description="{data.error} Check your connection and try again."
			action={{ label: 'Try again', onclick: refresh, icon: RefreshCw }}
		/>
	{:else if contacts.length === 0}
		<EmptyState
			class="mt-8"
			title="Your people go here"
			description="Save the friends you split with once, then add them to any session in a tap."
			action={{ label: 'Add a contact', onclick: openAdd, icon: Plus }}
			secondaryAction={{ label: 'Import from phone', onclick: () => (importOpen = true) }}
		>
			{#snippet art()}<ArtPhone />{/snippet}
		</EmptyState>
	{:else}
		<div class="sticky top-0 z-10 -mx-4 mt-6 bg-fog/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
			<ContactSearch bind:searchQuery={query} bind:activeFilter={filter} {contacts} {groups} />
		</div>

		<ContactList
			class="mt-2"
			contacts={shown}
			{selecting}
			selectedIds={selected}
			onSelect={toggleSelect}
			onEdit={openEdit}
			onDelete={(c) => (deleting = c)}
			onToggleFavorite={toggleFavourite}
		>
			{#snippet empty()}
				<EmptyState
					class="mt-2"
					size="sm"
					icon={SearchX}
					title="No one matches"
					description={query ? `Nobody called "${query}" here.` : filter === 'favorites' ? 'Star people you split with often to keep them here.' : 'No one in this group yet.'}
					action={query ? { label: 'Clear search', onclick: () => (query = '') } : undefined}
				/>
			{/snippet}
		</ContactList>
	{/if}
</div>

{#if selecting}
	<BulkActionsBar
		selectedCount={selected.size}
		visibleCount={shown.length}
		{groups}
		loading={saving}
		onclear={stopSelecting}
		onselectall={() => (selected = new Set(shown.map((c) => c.contact_id)))}
		ondelete={() => (bulkDeleteOpen = true)}
		onassigngroup={bulkGroup}
		ontogglefavorite={bulkFavourite}
	/>
{/if}

<Modal bind:open={formOpen} title={editing ? 'Edit contact' : 'New contact'} busy={saving}>
	{#key editing?.contact_id ?? 'new'}
		<ContactForm
			contact={editing}
			{groups}
			loading={saving}
			onsubmit={submitForm}
			oncancel={() => (formOpen = false)}
			submitText={editing ? 'Save changes' : 'Add contact'}
		/>
	{/key}
</Modal>

<Modal bind:open={importOpen} title="Import from phone" busy={saving}>
	<ContactImport
		{existingNumbers}
		{groups}
		loading={saving}
		onimport={importContacts}
		onaddmanually={() => {
			importOpen = false;
			openAdd();
		}}
		oncancel={() => (importOpen = false)}
	/>
</Modal>

<Modal bind:open={groupsOpen} title="Groups">
	<ContactGroups {groups} {counts} loading={saving} oncreate={createGroup} onupdate={updateGroup} ondelete={removeGroup} />
</Modal>

<ConfirmDialog
	open={!!deleting}
	title="Delete {deleting?.name ?? 'contact'}?"
	message="They'll stay in past sessions. You can add them again any time."
	confirmText="Delete"
	variant="danger"
	loading={saving}
	onconfirm={confirmDelete}
	oncancel={() => (deleting = null)}
/>

<ConfirmDialog
	bind:open={bulkDeleteOpen}
	title="Delete {plural(selected.size)}?"
	message="They'll stay in past sessions. You can add them again any time."
	confirmText="Delete {selected.size}"
	variant="danger"
	loading={saving}
	onconfirm={bulkDelete}
/>
