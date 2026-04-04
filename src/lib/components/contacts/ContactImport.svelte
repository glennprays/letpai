<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Upload, X, Phone, AlertCircle, CheckCircle, Edit2 } from 'lucide-svelte';
  import Button from '../ui/Button.svelte';
  import Input from '../ui/Input.svelte';
  import EmptyState from '../ui/EmptyState.svelte';
  import {
    selectDeviceContacts,
    formatDevicePhoneNumber,
    isDuplicatePhoneNumber,
    getUniquePhoneNumbers,
    type DeviceContact
  } from '$lib/utils/contactPicker';
  import type { ContactGroup, CreateContactRequest } from '$lib/types/api';

  interface ImportContact {
    id: string;
    name: string;
    phone_numbers: string[];
    status: 'new' | 'existing';
    existing_id?: string;
    selected: boolean;
    editing: boolean;
  }

  interface Props {
    existingContacts?: Map<string, string>; // phone -> contact_id mapping
    groups?: ContactGroup[];
    loading?: boolean;
    onimport?: (contacts: CreateContactRequest[]) => void;
    oncancel?: () => void;
    class?: string;
  }

  let {
    existingContacts = new Map(),
    groups = [],
    loading = false,
    onimport,
    oncancel,
    class: className,
    ...props
  }: Props = $props();

  let step = $state<'intro' | 'preview' | 'success'>('intro');
  let importContacts = $state<ImportContact[]>([]);
  let selectedGroupId = $state('');
  let importError = $state('');
  let successCount = $state(0);

  async function handleSelectContacts() {
    importError = '';

    const result = await selectDeviceContacts();

    if (!result.success || !result.contacts) {
      importError = result.error || 'Failed to access contacts';
      return;
    }

    // Transform to import contacts with duplicate detection
    importContacts = result.contacts.map(contact => {
      const uniquePhones = getUniquePhoneNumbers(contact);
      let status: 'new' | 'existing' = 'new';
      let existingId: string | undefined;

      // Check for duplicates
      for (const phone of uniquePhones) {
        const existingIdForPhone = existingContacts.get(phone);
        if (existingIdForPhone) {
          status = 'existing';
          existingId = existingIdForPhone;
          break;
        }
      }

      return {
        id: contact.id,
        name: contact.name,
        phone_numbers: uniquePhones,
        status,
        existing_id: existingId,
        selected: status === 'new', // Auto-select new contacts
        editing: false
      };
    }).filter(c => c.phone_numbers.length > 0);

    step = 'preview';
  }

  function handleToggleSelect(contactId: string) {
    const contact = importContacts.find(c => c.id === contactId);
    if (contact) {
      contact.selected = !contact.selected;
    }
  }

  function handleToggleAll() {
    const allSelected = importContacts.every(c => c.selected);
    importContacts.forEach(c => {
      c.selected = !allSelected && c.status === 'new';
    });
  }

  function handleToggleEdit(contactId: string) {
    const contact = importContacts.find(c => c.id === contactId);
    if (contact) {
      contact.editing = !contact.editing;
    }
  }

  function handleImport() {
    const contactsToImport: CreateContactRequest[] = importContacts
      .filter(c => c.selected && c.status === 'new')
      .map(c => ({
        name: c.name.trim(),
        whatsapp_number: c.phone_numbers[0], // Use first phone number
        ...(selectedGroupId && { group_id: selectedGroupId })
      }));

    if (contactsToImport.length === 0) {
      importError = 'Please select at least one contact to import';
      return;
    }

    if (onimport) {
      onimport(contactsToImport);
      successCount = contactsToImport.length;
      step = 'success';
    }
  }

  function handleReset() {
    step = 'intro';
    importContacts = [];
    importError = '';
    selectedGroupId = '';
    successCount = 0;
  }

  function handleCancel() {
    handleReset();
    if (oncancel) oncancel();
  }

  const newContactsCount = $derived(
    importContacts.filter(c => c.status === 'new').length
  );

  const existingContactsCount = $derived(
    importContacts.filter(c => c.status === 'existing').length
  );

  const selectedCount = $derived(
    importContacts.filter(c => c.selected).length
  );

  const allSelected = $derived(
    importContacts.length > 0 && importContacts.every(c => c.selected)
  );
</script>

<div class={cn('space-y-4', className)} {...props}>
  {#if step === 'intro'}
    <!-- Intro Step -->
    <div class="text-center py-8">
      <div class="w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Upload class="w-8 h-8 text-white" />
      </div>

      <h3 class="text-xl font-bold text-gray-900 mb-2">
        Import from Device
      </h3>

      <p class="text-gray-600 mb-6 max-w-md mx-auto">
        Select contacts from your device to import. You can edit them before saving and assign them to groups.
      </p>

      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
        <div class="flex gap-3">
          <AlertCircle class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-amber-900">
              Contact Picker API
            </p>
            <p class="text-xs text-amber-700 mt-1">
              This feature only works on Chrome or Edge browsers on Android. Other browsers are not supported yet.
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 justify-center">
        {#if oncancel}
          <button
            onclick={handleCancel}
            class="h-10 px-6 text-[15px] font-bold rounded-full border-[1.5px] border-[#F0F0F0] text-[#6B7280] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors"
          >
            Cancel
          </button>
        {/if}

        <Button
          variant="primary"
          onbuttonclick={handleSelectContacts}
          leftIcon={Upload}
        >
          Select Contacts
        </Button>
      </div>

      {#if importError}
        <p class="text-sm text-red-600 mt-4">{importError}</p>
      {/if}
    </div>

  {:else if step === 'preview'}
    <!-- Preview Step -->
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-gray-900">
            Review Contacts
          </h3>
          <p class="text-sm text-gray-500">
            {newContactsCount} new, {existingContactsCount} already exist
          </p>
        </div>
        <button
          onclick={handleCancel}
          class="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X class="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <!-- Group Assignment -->
      {#if groups && groups.length > 0}
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Assign to Group (Optional)
          </label>
          <select
            bind:value={selectedGroupId}
            class="w-full h-11 px-4 border-[1.5px] border-gray-300 rounded-[12px] font-medium text-[15px] focus:border-[#FF6B6B] focus:shadow-[0_0_0_3px_rgba(255,107,107,0.12)] transition-all duration-150 focus:outline-none"
          >
            <option value="">No group</option>
            {#each groups as group}
              <option value={group.group_id}>{group.name}</option>
            {/each}
          </select>
        </div>
      {/if}

      <!-- Select All -->
      {#if newContactsCount > 0}
        <button
          onclick={handleToggleAll}
          class="text-sm font-medium text-[#FF6B6B] hover:underline"
        >
          {allSelected ? 'Deselect All' : 'Select All New'}
        </button>
      {/if}

      <!-- Contact List -->
      <div class="max-h-96 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {#each importContacts as contact (contact.id)}
          <div
            class={cn(
              'bg-white rounded-xl border-2 p-3 transition-all',
              contact.selected ? 'border-[#FF6B6B]' : 'border-gray-200',
              contact.status === 'existing' && 'opacity-60'
            )}
          >
            <div class="flex items-start gap-3">
              <!-- Checkbox -->
              {#if contact.status === 'new'}
                <input
                  type="checkbox"
                  checked={contact.selected}
                  onchange={() => handleToggleSelect(contact.id)}
                  class="mt-1 w-4 h-4 rounded border-2 border-gray-300 text-[#FF6B6B] focus:ring-[#FF6B6B]"
                />
              {:else}
                <div class="mt-1 w-4 h-4 flex items-center justify-center">
                  <CheckCircle class="w-4 h-4 text-gray-400" />
                </div>
              {/if}

              <!-- Info -->
              <div class="flex-1 min-w-0">
                {#if contact.editing}
                  <Input
                    value={contact.name}
                    oninput={(val) => contact.name = val}
                    size="sm"
                    class="mb-2"
                  />
                {:else}
                  <h4 class="font-medium text-gray-900 truncate">
                    {contact.name || 'Unknown'}
                  </h4>
                {/if}

                <div class="space-y-1">
                  {#each contact.phone_numbers as phone}
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <Phone class="w-3 h-3 flex-shrink-0" />
                      <span>{phone}</span>
                    </div>
                  {/each}
                </div>

                {#if contact.status === 'existing'}
                  <p class="text-xs text-amber-600 mt-1">
                    Already in your contacts
                  </p>
                {/if}
              </div>

              <!-- Edit Button -->
              {#if contact.status === 'new'}
                <button
                  onclick={() => handleToggleEdit(contact.id)}
                  class="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Edit contact"
                >
                  <Edit2 class="w-4 h-4 text-gray-500" />
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <Button
          variant="secondary"
          onbuttonclick={handleCancel}
          disabled={loading}
          class="flex-1"
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          onbuttonclick={handleImport}
          disabled={selectedCount === 0 || loading}
          loading={loading}
          class="flex-1"
        >
          Import {selectedCount} {selectedCount === 1 ? 'Contact' : 'Contacts'}
        </Button>
      </div>

      {#if importError}
        <p class="text-sm text-red-600 text-center">{importError}</p>
      {/if}
    </div>

  {:else if step === 'success'}
    <!-- Success Step -->
    <div class="text-center py-8">
      <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <CheckCircle class="w-8 h-8 text-green-600" />
      </div>

      <h3 class="text-xl font-bold text-gray-900 mb-2">
        Import Complete!
      </h3>

      <p class="text-gray-600 mb-6">
        {successCount} {successCount === 1 ? 'contact has' : 'contacts have'} been imported successfully.
      </p>

      <div class="flex gap-3 justify-center">
        <Button
          variant="secondary"
          onbuttonclick={handleReset}
        >
          Import More
        </Button>

        <Button
          variant="primary"
          onbuttonclick={handleCancel}
        >
          Done
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .scrollbar-thin {
    scrollbar-width: thin;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
</style>
