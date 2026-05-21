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
      <div class="w-16 h-16 bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Upload class="w-8 h-8 text-white" />
      </div>

      <h3 class="text-xl font-bold text-[#251818] mb-2">
        Import from Device
      </h3>

      <p class="text-[#584140] mb-6 max-w-md mx-auto">
        Select contacts from your device to import. You can edit them before saving and assign them to groups.
      </p>

      <div class="bg-[#F59E0B]/15 rounded-2xl p-4 mb-6 text-left">
        <div class="flex gap-3">
          <AlertCircle class="w-5 h-5 text-[#92400E] flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-medium text-[#92400E]">
              Contact Picker API
            </p>
            <p class="text-xs text-[#92400E]/80 mt-1">
              This feature only works on Chrome or Edge browsers on Android. Other browsers are not supported yet.
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 justify-center">
        {#if oncancel}
          <button
            onclick={handleCancel}
            class="h-11 px-5 text-[15px] font-bold rounded-2xl bg-[#f5dddb] text-[#584140] hover:bg-[#fbe3e1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
          >
            Cancel
          </button>
        {/if}

        <Button
          variant="primary"
          onclick={handleSelectContacts}
          leftIcon={Upload}
        >
          Select Contacts
        </Button>
      </div>

      {#if importError}
        <p class="text-sm text-[#991B1B] mt-4">{importError}</p>
      {/if}
    </div>

  {:else if step === 'preview'}
    <!-- Preview Step -->
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-[#251818]">
            Review Contacts
          </h3>
          <p class="text-sm text-[#584140]">
            {newContactsCount} new, {existingContactsCount} already exist
          </p>
        </div>
        <button
          onclick={handleCancel}
          class="p-2 rounded-full hover:bg-[#fbe3e1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
        >
          <X class="w-5 h-5 text-[#584140]" />
        </button>
      </div>

      <!-- Group Assignment -->
      {#if groups && groups.length > 0}
        <div>
          <label for="import-assign-group" class="block text-sm font-semibold text-[#584140] mb-2">
            Assign to Group (Optional)
          </label>
          <select
            id="import-assign-group"
            bind:value={selectedGroupId}
            class="w-full h-11 px-4 bg-[#f5dddb] rounded-2xl font-medium text-[15px] text-[#251818] focus:ring-2 focus:ring-[#ae2f34]/30 transition-all duration-150 focus:outline-none"
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
          class="text-sm font-medium text-[#ae2f34] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] rounded"
        >
          {allSelected ? 'Deselect All' : 'Select All New'}
        </button>
      {/if}

      <!-- Contact List -->
      <div class="max-h-96 overflow-y-auto space-y-2 pr-2 social-ledger-scrollbar">
        {#each importContacts as contact (contact.id)}
          <div
            class={cn(
              'bg-white rounded-2xl p-3 transition-all',
              contact.selected
                ? 'ring-2 ring-[#ae2f34]/30'
                : '',
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
                  class="mt-1 w-4 h-4 rounded-[6px] border-2 border-[#e0bfbd] text-[#ae2f34] focus:ring-[#ae2f34]/30"
                />
              {:else}
                <div class="mt-1 w-4 h-4 flex items-center justify-center">
                  <CheckCircle class="w-4 h-4 text-[#584140]/60" />
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
                  <h4 class="font-medium text-[#251818] truncate">
                    {contact.name || 'Unknown'}
                  </h4>
                {/if}

                <div class="space-y-1">
                  {#each contact.phone_numbers as phone}
                    <div class="flex items-center gap-2 text-sm text-[#584140]">
                      <Phone class="w-3 h-3 flex-shrink-0" />
                      <span>{phone}</span>
                    </div>
                  {/each}
                </div>

                {#if contact.status === 'existing'}
                  <p class="text-xs text-[#92400E] mt-1">
                    Already in your contacts
                  </p>
                {/if}
              </div>

              <!-- Edit Button -->
              {#if contact.status === 'new'}
                <button
                  onclick={() => handleToggleEdit(contact.id)}
                  class="p-1.5 rounded-full hover:bg-[#fbe3e1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
                  aria-label="Edit contact"
                >
                  <Edit2 class="w-4 h-4 text-[#584140]" />
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
          onclick={handleCancel}
          disabled={loading}
          class="flex-1"
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          onclick={handleImport}
          disabled={selectedCount === 0 || loading}
          loading={loading}
          class="flex-1"
        >
          Import {selectedCount} {selectedCount === 1 ? 'Contact' : 'Contacts'}
        </Button>
      </div>

      {#if importError}
        <p class="text-sm text-[#991B1B] text-center">{importError}</p>
      {/if}
    </div>

  {:else if step === 'success'}
    <!-- Success Step -->
    <div class="text-center py-8">
      <div class="w-16 h-16 bg-[#10B981]/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <CheckCircle class="w-8 h-8 text-[#047857]" />
      </div>

      <h3 class="text-xl font-bold text-[#251818] mb-2">
        Import Complete!
      </h3>

      <p class="text-[#584140] mb-6">
        {successCount} {successCount === 1 ? 'contact has' : 'contacts have'} been imported successfully.
      </p>

      <div class="flex gap-3 justify-center">
        <Button
          variant="secondary"
          onclick={handleReset}
        >
          Import More
        </Button>

        <Button
          variant="primary"
          onclick={handleCancel}
        >
          Done
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .social-ledger-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #e0bfbd #fff0ef;
  }

  .social-ledger-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .social-ledger-scrollbar::-webkit-scrollbar-track {
    background: #fff0ef;
    border-radius: 3px;
  }

  .social-ledger-scrollbar::-webkit-scrollbar-thumb {
    background: #e0bfbd;
    border-radius: 3px;
  }

  .social-ledger-scrollbar:hover::-webkit-scrollbar-thumb {
    background: #8c706f;
  }
</style>
