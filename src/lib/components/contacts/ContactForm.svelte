<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import Input from '../ui/Input.svelte';
  import Button from '../ui/Button.svelte';
  import type { Contact, ContactGroup, CreateContactRequest, UpdateContactRequest } from '$lib/types/api';

  interface Props {
    contact?: Contact | null;
    groups?: ContactGroup[];
    loading?: boolean;
    onsubmit?: (data: CreateContactRequest | UpdateContactRequest) => void;
    oncancel?: () => void;
    submitText?: string;
    class?: string;
  }

  let {
    contact = null,
    groups = [],
    loading = false,
    onsubmit,
    oncancel,
    submitText = 'Save Contact',
    class: className,
    ...props
  }: Props = $props();

  let name = $state(contact?.name || '');
  let phone = $state(contact?.whatsapp_number || '');
  let groupId = $state(contact?.group_id || '');
  let selectedGroupIds = $state<string[]>(contact?.group_id ? [contact.group_id] : []);
  let notes = $state(contact?.notes || '');
  let errors = $state<{ name?: string; phone?: string }>({});

  function validate(): boolean {
    errors = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      // Validate Indonesian phone format (with or without 62 prefix)
      const cleanedPhone = normalizePhoneNumber(phone);
      if (cleanedPhone.length < 10 || cleanedPhone.length > 14) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    return Object.keys(errors).length === 0;
  }

  // Normalize phone number to match backend format (always starts with 62)
  function normalizePhoneNumber(value: string): string {
    let cleaned = value.replace(/\D/g, '');

    // Remove leading 0 and add 62
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }

    // Ensure it starts with 62
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }

    return cleaned;
  }

  function handleSubmit() {
    if (!validate()) return;

    // Normalize phone number for API (backend expects: 6289876543240)
    const normalizedPhone = normalizePhoneNumber(phone);

    // Use first selected group (TODO: backend support for multiple groups coming soon)
    const primaryGroupId = selectedGroupIds.length > 0 ? selectedGroupIds[0] : undefined;

    // For editing, use UpdateContactRequest format (optional fields)
    // For creating, use CreateContactRequest format (required fields)
    const data = contact
      ? {
          ...(name.trim() !== contact.name && { name: name.trim() }),
          ...(normalizedPhone !== contact.whatsapp_number && { whatsapp_number: normalizedPhone }),
          ...(primaryGroupId !== contact.group_id && { group_id: primaryGroupId || undefined }),
          ...(notes.trim() !== (contact.notes || '') && { notes: notes.trim() || undefined })
        }
      : {
          name: name.trim(),
          whatsapp_number: normalizedPhone,
          ...(primaryGroupId && { group_id: primaryGroupId }),
          ...(notes.trim() && { notes: notes.trim() })
        };

    if (onsubmit) onsubmit(data);
  }

  function handleCancel() {
    if (oncancel) oncancel();
  }

  function formatPhone(value: string): string {
    // Remove all non-digits for processing
    let cleaned = value.replace(/\D/g, '');

    // Remove leading 0 and add 62 for display
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }

    // Ensure it starts with 62
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }

    // Format as 62-8XX-XXXX-XXXX for display (without + for cleaner display)
    if (cleaned.length > 6) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{4})(\d+)/, '$1-$2-$3-$4');
    } else if (cleaned.length > 2) {
      return cleaned.replace(/(\d{2})(\d+)/, '$1-$2');
    }

    return cleaned;
  }
</script>

<form
  class={cn('space-y-4', className)}
  onsubmit={(e) => {
    e.preventDefault();
    handleSubmit();
  }}
  {...props}
>
  <!-- Name -->
  <div>
    <Input
      id="contact-name"
      label="Full Name"
      placeholder="Enter contact name"
      bind:value={name}
      error={!!errors.name}
      errorText={errors.name}
      disabled={loading}
      maxLength={100}
      showCount
    />
  </div>

  <!-- Phone Number -->
  <div>
    <div class="relative">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#584140] pointer-events-none z-10">
        +62
      </span>
      <Input
        id="contact-phone"
        type="tel"
        label="WhatsApp Number"
        placeholder="e.g., 812-3456-7890"
        bind:value={phone}
        oninput={(val) => phone = formatPhone(val)}
        error={!!errors.phone}
        errorText={errors.phone}
        disabled={loading}
        class="pl-14"
      />
    </div>
  </div>

  <!-- Groups (Multiple Selection) -->
  {#if groups && groups.length > 0}
    <div>
      <label class="block text-sm font-semibold text-[#584140] mb-2">
        Groups {selectedGroupIds.length > 0 ? `(${selectedGroupIds.length})` : ''}
      </label>

      <!-- Group Chips Grid -->
      <div class="flex flex-wrap gap-2">
        {#each groups as group (group.group_id)}
          {@const isSelected = selectedGroupIds.includes(group.group_id)}
          <button
            type="button"
            onclick={() => {
              if (isSelected) {
                selectedGroupIds = selectedGroupIds.filter(id => id !== group.group_id);
              } else {
                selectedGroupIds = [...selectedGroupIds, group.group_id];
              }
            }}
            class={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium bg-[#f5dddb] transition-all duration-150',
              'hover:scale-105 active:scale-95',
              isSelected
                ? 'bg-opacity-100'
                : 'bg-[#fff0ef] hover:bg-[#f5dddb]'
            )}
            style={isSelected
              ? `background-color: ${group.color}; color: white;`
              : `background-color: ${group.color}15; color: ${group.color};`}
          >
            {#if isSelected}
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            {/if}
            <span>{group.name}</span>
          </button>
        {/each}
      </div>

      {#if selectedGroupIds.length === 0}
        <p class="text-xs text-[#584140]/60 mt-1">
          Select groups to organize this contact
        </p>
      {:else}
        <p class="text-xs text-[#584140] mt-1">
          {selectedGroupIds.length} group{selectedGroupIds.length === 1 ? '' : 's'} selected
        </p>
      {/if}
    </div>
  {/if}

  <!-- Notes -->
  <div>
    <label
      for="contact-notes"
      class="block text-sm font-semibold text-[#584140] mb-2"
    >
      Notes (Optional)
    </label>
    <textarea
      id="contact-notes"
      bind:value={notes}
      disabled={loading}
      placeholder="Add notes about this contact..."
      rows="3"
      maxlength={500}
      class="w-full px-4 py-3 bg-[#f5dddb] rounded-2xl font-medium text-[15px] text-[#251818] focus:ring-2 focus:ring-[#ae2f34]/30 transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none placeholder:text-[#584140]/50"
    ></textarea>
    {#if notes}
      <div class="text-right text-xs text-[#584140]/60 mt-1">
        {notes.length}/500
      </div>
    {/if}
  </div>

  <!-- Actions -->
  <div class="flex gap-3 pt-2">
    {#if oncancel}
      <Button
        type="button"
        variant="secondary"
        onbuttonclick={handleCancel}
        disabled={loading}
        class="flex-1"
      >
        Cancel
      </Button>
    {/if}

    <Button
      type="submit"
      variant="primary"
      loading={loading}
      class="flex-1"
    >
      {submitText}
    </Button>
  </div>
</form>
