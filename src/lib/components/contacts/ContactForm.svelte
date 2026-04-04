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
      // Validate Indonesian phone format
      const cleanedPhone = phone.replace(/\D/g, '');
      if (cleanedPhone.length < 10 || cleanedPhone.length > 14) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const data: CreateContactRequest | UpdateContactRequest = {
      name: name.trim(),
      whatsapp_number: phone.replace(/\D/g, ''),
      ...(groupId && { group_id: groupId }),
      ...(notes.trim() && { notes: notes.trim() })
    };

    if (onsubmit) onsubmit(data);
  }

  function handleCancel() {
    if (oncancel) oncancel();
  }

  function formatPhone(value: string): string {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, '');

    // Format as +62 XXX-XXXX-XXXX for display
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }

    if (cleaned.length <= 12) {
      if (cleaned.length > 6) {
        return cleaned.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
      } else if (cleaned.length > 3) {
        return cleaned.replace(/(\d{3})(\d+)/, '$1-$2');
      }
    }

    return value;
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
      leftIcon={() => ''}
    >
      {#if phone}
        <span slot="leftIcon" class="text-sm text-gray-500 mr-1">+62</span>
      {/if}
    </Input>
  </div>

  <!-- Group -->
  {#if groups && groups.length > 0}
    <div>
      <label
        for="contact-group"
        class="block text-sm font-semibold text-gray-700 mb-2"
      >
        Group (Optional)
      </label>
      <select
        id="contact-group"
        bind:value={groupId}
        disabled={loading}
        class="w-full h-11 px-4 border-[1.5px] border-gray-300 rounded-[12px] font-medium text-[15px] focus:border-[#FF6B6B] focus:shadow-[0_0_0_3px_rgba(255,107,107,0.12)] transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">No group</option>
        {#each groups as group}
          <option value={group.group_id}>{group.name}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- Notes -->
  <div>
    <label
      for="contact-notes"
      class="block text-sm font-semibold text-gray-700 mb-2"
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
      class="w-full px-4 py-3 border-[1.5px] border-gray-300 rounded-[12px] font-medium text-[15px] focus:border-[#FF6B6B] focus:shadow-[0_0_0_3px_rgba(255,107,107,0.12)] transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none placeholder:text-gray-400"
    ></textarea>
    {#if notes}
      <div class="text-right text-xs text-gray-400 mt-1">
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
        onclick={handleCancel}
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
