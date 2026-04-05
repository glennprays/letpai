<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ArrowLeft, Plus, Upload, Menu, SlidersHorizontal } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
  import ContactList from '$lib/components/contacts/ContactList.svelte';
  import ContactSearch from '$lib/components/contacts/ContactSearch.svelte';
  import ContactForm from '$lib/components/contacts/ContactForm.svelte';
  import ContactImport from '$lib/components/contacts/ContactImport.svelte';
  import ContactGroups from '$lib/components/contacts/ContactGroups.svelte';
  import BulkActionsBar from '$lib/components/contacts/BulkActionsBar.svelte';
  import {
    getContacts,
    getContactGroups,
    createContact,
    updateContact,
    deleteContact,
    createContactGroup,
    updateContactGroup,
    deleteContactGroup,
    bulkImportContacts,
    bulkDeleteContacts,
    bulkUpdateContacts
  } from '$lib/services/contacts';
  import type { Contact, ContactGroup, CreateContactRequest, UpdateContactRequest } from '$lib/types/api';

  // In SvelteKit, server load data is accessed via $page store
  // The data is in $page.data for the current route

  // State - Initialize with server data from $page store
  let contacts = $state<Contact[]>([]);
  let groups = $state<ContactGroup[]>([]);
  let filteredContacts = $state<Contact[]>([]);

  // Initialize data from $page store
  $effect(() => {
    const serverContacts = $page.data?.contacts as Contact[] | undefined;
    const serverGroups = $page.data?.groups as ContactGroup[] | undefined;

    if (serverContacts) {
      contacts = serverContacts;
    }
    if (serverGroups) {
      groups = serverGroups;
    }
  });

  let searchQuery = $state('');
  let activeFilter = $state<'all' | 'favorites' | string>('all');
  let selectedContacts = $state<Set<string>>(new Set());

  let isLoading = $state(false);
  let isSaving = $state(false);

  // Modals
  let showAddModal = $state(false);
  let showEditModal = $state(false);
  let showImportModal = $state(false);
  let showGroupsModal = $state(false);
  let showDeleteDialog = $state(false);
  let showBulkDeleteDialog = $state(false);

  let editingContact = $state<Contact | null>(null);
  let deletingContact = $state<Contact | null>(null);

  let isBulkMode = $state(false);

  // Initial filter application
  $effect(() => {
    applyFilters();
  });

  // Refresh data (for after mutations)
  async function refreshData() {
    isLoading = true;
    try {
      const [contactsResponse, groupsResponse] = await Promise.all([
        getContacts(),
        getContactGroups()
      ]);
      if (contactsResponse.success) {
        contacts = contactsResponse.data;
      }
      if (groupsResponse.success) {
        groups = groupsResponse.data;
      }
      applyFilters();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      isLoading = false;
    }
  }

  // Filtering
  function applyFilters() {
    filteredContacts = contacts.filter(contact => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.whatsapp_number.includes(searchQuery);

      // Category filter
      let matchesCategory = true;
      if (activeFilter === 'favorites') {
        matchesCategory = contact.is_favorite;
      } else if (activeFilter !== 'all') {
        matchesCategory = contact.group_id === activeFilter;
      }

      return matchesSearch && matchesCategory;
    });
  }

  $effect(() => {
    applyFilters();
  });

  // Contact CRUD
  async function handleCreateContact(data: CreateContactRequest) {
    isSaving = true;
    try {
      const response = await createContact(data);
      if (response.success) {
        contacts = [...contacts, response.data];
        showAddModal = false;
      }
    } catch (error) {
      console.error('Failed to create contact:', error);
    } finally {
      isSaving = false;
    }
  }

  async function handleUpdateContact(data: UpdateContactRequest) {
    if (!editingContact) return;

    isSaving = true;
    try {
      const response = await updateContact(editingContact.contact_id, data);
      if (response.success) {
        contacts = contacts.map(c =>
          c.contact_id === editingContact.contact_id ? response.data : c
        );
        showEditModal = false;
        editingContact = null;
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
    } finally {
      isSaving = false;
    }
  }

  async function handleDeleteContact() {
    if (!deletingContact) return;

    isSaving = true;
    try {
      await deleteContact(deletingContact.contact_id);
      contacts = contacts.filter(c => c.contact_id !== deletingContact.contact_id);
      showDeleteDialog = false;
      deletingContact = null;
    } catch (error) {
      console.error('Failed to delete contact:', error);
    } finally {
      isSaving = false;
    }
  }

  async function handleToggleFavorite(contact: Contact) {
    try {
      const response = await updateContact(contact.contact_id, {
        is_favorite: !contact.is_favorite
      });
      if (response.success) {
        contacts = contacts.map(c =>
          c.contact_id === contact.contact_id ? response.data : c
        );
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }

  function handleEditContact(contact: Contact) {
    editingContact = contact;
    showEditModal = true;
  }

  function openDeleteDialog(contact: Contact) {
    deletingContact = contact;
    showDeleteDialog = true;
  }

  // Bulk Operations
  function handleSelectContact(contact: Contact) {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contact.contact_id)) {
      newSelected.delete(contact.contact_id);
    } else {
      newSelected.add(contact.contact_id);
    }
    selectedContacts = newSelected;
  }

  function handleClearSelection() {
    selectedContacts = new Set();
  }

  async function handleBulkDelete() {
    if (selectedContacts.size === 0) return;

    isSaving = true;
    try {
      const response = await bulkDeleteContacts({
        contact_ids: Array.from(selectedContacts)
      });
      if (response.success) {
        contacts = contacts.filter(c => !selectedContacts.has(c.contact_id));
        selectedContacts = new Set();
        showBulkDeleteDialog = false;
      }
    } catch (error) {
      console.error('Failed to delete contacts:', error);
    } finally {
      isSaving = false;
    }
  }

  async function handleBulkAssignGroup(groupId: string) {
    if (selectedContacts.size === 0) return;

    isSaving = true;
    try {
      const response = await bulkUpdateContacts({
        contact_ids: Array.from(selectedContacts),
        updates: { group_id: groupId || undefined }
      });
      if (response.success) {
        await refreshData();
        selectedContacts = new Set();
      }
    } catch (error) {
      console.error('Failed to assign group:', error);
    } finally {
      isSaving = false;
    }
  }

  async function handleBulkToggleFavorite(isFavorite: boolean) {
    if (selectedContacts.size === 0) return;

    isSaving = true;
    try {
      const response = await bulkUpdateContacts({
        contact_ids: Array.from(selectedContacts),
        updates: { is_favorite: isFavorite }
      });
      if (response.success) {
        await refreshData();
        selectedContacts = new Set();
      }
    } catch (error) {
      console.error('Failed to toggle favorites:', error);
    } finally {
      isSaving = false;
    }
  }

  // Groups CRUD
  async function handleCreateGroup(data: { name: string; color: string }) {
    try {
      const response = await createContactGroup(data);
      if (response.success) {
        groups = [...groups, response.data];
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  }

  async function handleUpdateGroup(groupId: string, data: { name: string; color: string }) {
    try {
      const response = await updateContactGroup(groupId, data);
      if (response.success) {
        groups = groups.map(g => g.group_id === groupId ? response.data : g);
        await refreshData(); // Refresh to see updated group names
      }
    } catch (error) {
      console.error('Failed to update group:', error);
    }
  }

  async function handleDeleteGroup(groupId: string) {
    try {
      await deleteContactGroup(groupId);
      groups = groups.filter(g => g.group_id !== groupId);
      await refreshData(); // Refresh to remove deleted group from contacts
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  }

  // Import
  async function handleImportContacts(newContacts: CreateContactRequest[]) {
    try {
      const response = await bulkImportContacts({ contacts: newContacts });
      if (response.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to import contacts:', error);
    }
  }

  // Quick actions
  function handleCall(contact: Contact) {
    window.location.href = `tel:+62${contact.whatsapp_number}`;
  }

  function handleMessage(contact: Contact) {
    window.open(`https://wa.me/62${contact.whatsapp_number}`, '_blank');
  }

  // Build existing contacts map for duplicate detection
  const existingContactsMap = $derived(
    new Map(contacts.map(c => [c.whatsapp_number, c.contact_id]))
  );

  function toggleBulkMode() {
    isBulkMode = !isBulkMode;
    if (!isBulkMode) {
      selectedContacts = new Set();
    }
  }
</script>

<div class="h-screen flex flex-col bg-gray-50">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200 flex-shrink-0 z-30">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between gap-4">
        <!-- Back Button & Title -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <button
            onclick={() => goto('/dashboard')}
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft class="w-5 h-5 text-gray-600" />
          </button>
          <h1 class="text-xl font-bold text-gray-900">Contacts</h1>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Bulk Mode Toggle -->
          <Button
            variant={isBulkMode ? 'primary' : 'ghost'}
            size="sm"
            onclick={toggleBulkMode}
            leftIcon={isBulkMode ? undefined : SlidersHorizontal}
          >
            {isBulkMode ? `${selectedContacts.size} Selected` : 'Select'}
          </Button>

          <!-- Import Button -->
          <Button
            variant="secondary"
            size="sm"
            onclick={() => showImportModal = true}
            leftIcon={Upload}
          >
            <span class="hidden sm:inline">Import</span>
          </Button>

          <!-- Groups Button -->
          <Button
            variant="secondary"
            size="sm"
            onclick={() => showGroupsModal = true}
            leftIcon={Menu}
          >
            <span class="hidden sm:inline">Groups</span>
          </Button>

          <!-- Add Button -->
          <Button
            variant="primary"
            size="sm"
            onclick={() => showAddModal = true}
            leftIcon={Plus}
          >
            <span class="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="container mx-auto px-4 py-6 flex-1 flex flex-col min-h-0">
    <!-- Search & Filters -->
    <div class="mb-6 flex-shrink-0">
      <ContactSearch
        bind:searchQuery
        bind:activeFilter
        {groups}
      />
    </div>

    <!-- Contact List -->
    <div class="flex-1 min-h-0 mb-4">
      <ContactList
        contacts={filteredContacts}
        {selectedContacts}
        loading={isLoading}
        onSelect={handleSelectContact}
        onEdit={handleEditContact}
        onDelete={openDeleteDialog}
        onToggleFavorite={handleToggleFavorite}
        onCall={handleCall}
        onMessage={handleMessage}
        class="h-full"
      />
    </div>

    <!-- Bulk Actions Bar -->
    <div class="flex-shrink-0">
      <BulkActionsBar
        selectedCount={selectedContacts.size}
        {groups}
        loading={isSaving}
        onclear={handleClearSelection}
        ondelete={() => showBulkDeleteDialog = true}
        onassigngroup={handleBulkAssignGroup}
        ontogglefavorite={handleBulkToggleFavorite}
      />
    </div>
  </main>
</div>

<!-- Modals - Rendered outside main container to avoid overflow constraints -->
<!-- Add Contact Modal -->
<Modal open={showAddModal} title="Add Contact" onclose={() => showAddModal = false}>
  <ContactForm
    {groups}
    loading={isSaving}
    onsubmit={handleCreateContact}
    oncancel={() => showAddModal = false}
    submitText="Add Contact"
  />
</Modal>

<!-- Edit Contact Modal -->
<Modal open={showEditModal} title="Edit Contact" onclose={() => showEditModal = false}>
  <ContactForm
    contact={editingContact}
    {groups}
    loading={isSaving}
    onsubmit={handleUpdateContact}
    oncancel={() => {
      showEditModal = false;
      editingContact = null;
    }}
    submitText="Save Changes"
  />
</Modal>

<!-- Import Modal -->
<Modal open={showImportModal} title="Import Contacts" onclose={() => showImportModal = false}>
  <ContactImport
    existingContacts={existingContactsMap}
    {groups}
    loading={isSaving}
    onimport={handleImportContacts}
    oncancel={() => showImportModal = false}
  />
</Modal>

<!-- Groups Modal -->
<Modal open={showGroupsModal} title="Manage Groups" onclose={() => showGroupsModal = false}>
  <ContactGroups
    {groups}
    loading={isSaving}
    oncreate={handleCreateGroup}
    onupdate={handleUpdateGroup}
    ondelete={handleDeleteGroup}
  />
</Modal>

<!-- Delete Contact Confirmation -->
<ConfirmDialog
  open={showDeleteDialog}
  title="Delete Contact?"
  message={`Are you sure you want to delete ${deletingContact?.name}? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  onconfirm={handleDeleteContact}
  oncancel={() => {
    showDeleteDialog = false;
    deletingContact = null;
  }}
/>

<!-- Bulk Delete Confirmation -->
<ConfirmDialog
  open={showBulkDeleteDialog}
  title="Delete Contacts?"
  message={`Are you sure you want to delete ${selectedContacts.size} contacts? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  onconfirm={handleBulkDelete}
  oncancel={() => showBulkDeleteDialog = false}
/>
