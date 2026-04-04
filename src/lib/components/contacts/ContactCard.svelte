<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { getAvatarWithFallback } from '$lib/utils/avatar';
  import { MoreVertical, Star, StarOff, Phone, MessageCircle } from 'lucide-svelte';
  import Avatar from '../ui/Avatar.svelte';
  import GroupBadge from './GroupBadge.svelte';
  import type { Contact } from '$lib/types/api';

  interface Props {
    contact: Contact;
    selected?: boolean;
    onSelect?: () => void;
    onEdit?: (contact: Contact) => void;
    onDelete?: (contact: Contact) => void;
    onToggleFavorite?: (contact: Contact) => void;
    onCall?: (contact: Contact) => void;
    onMessage?: (contact: Contact) => void;
    showActions?: boolean;
    showCheckbox?: boolean;
    class?: string;
  }

  let {
    contact,
    selected = false,
    onSelect,
    onEdit,
    onDelete,
    onToggleFavorite,
    onCall,
    onMessage,
    showActions = true,
    showCheckbox = false,
    class: className,
    ...props
  }: Props = $props();

  let showMenu = $state(false);
  let menuElement: HTMLElement;

  function handleMenuClick(e: MouseEvent) {
    e.stopPropagation();
    showMenu = !showMenu;
  }

  function handleFavorite(e: MouseEvent) {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(contact);
    showMenu = false;
  }

  function handleEdit(e: MouseEvent) {
    e.stopPropagation();
    if (onEdit) onEdit(contact);
    showMenu = false;
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    if (onDelete) onDelete(contact);
    showMenu = false;
  }

  function handleCall(e: MouseEvent) {
    e.stopPropagation();
    if (onCall) onCall(contact);
  }

  function handleMessage(e: MouseEvent) {
    e.stopPropagation();
    if (onMessage) onMessage(contact);
  }

  function formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    // Backend sends: 6289876543240
    // Display as: +62 898-7654-3240
    let formatted = phone;

    // Ensure it starts with 62 for display
    if (formatted.startsWith('0')) {
      formatted = '62' + formatted.slice(1);
    } else if (!formatted.startsWith('62')) {
      formatted = '62' + formatted;
    }

    // Format as +62 XXX-XXXX-XXXX or +62 XX-XXXX-XXXX
    if (formatted.length >= 11) {
      return '+' + formatted.replace(/(\d{2})(\d{3})(\d{4})(\d+)/, '$1 $2-$3-$4');
    } else if (formatted.length > 2) {
      return '+' + formatted.replace(/(\d{2})(\d+)/, '$1 $2');
    }
    return '+' + formatted;
  }

  // Close menu when clicking outside
  $effect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (showMenu && menuElement && !menuElement.contains(e.target as Node)) {
        showMenu = false;
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<div
  class={cn(
    'group relative flex items-center gap-3 p-4 bg-white rounded-xl border-2 transition-all duration-150',
    selected ? 'border-[#FF6B6B] shadow-sm' : 'border-gray-200 hover:border-[#FF6B6B] hover:shadow-md',
    onSelect && 'cursor-pointer',
    className
  )}
  onclick={onSelect}
  {...props}
>
  <!-- Checkbox for bulk selection -->
  {#if showCheckbox}
    <div class="flex-shrink-0" onclick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={selected}
        onchange={onSelect}
        class="w-5 h-5 rounded border-2 border-gray-300 text-[#FF6B6B] focus:ring-[#FF6B6B] focus:ring-offset-0"
      />
    </div>
  {/if}

  <!-- Avatar -->
  <Avatar
    src={contact.avatar_url}
    alt={contact.name}
    fullName={contact.name}
    phoneNumber={contact.whatsapp_number}
    identifier={contact.contact_id}
    size="lg"
    class="flex-shrink-0"
  />

  <!-- Contact Info -->
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2 mb-0.5">
      <h3 class="font-semibold text-gray-900 truncate">
        {contact.name}
      </h3>
      {#if contact.is_favorite}
        <Star class="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
      {/if}
    </div>

    <div class="flex items-center gap-2 text-sm text-gray-600">
      <Phone class="w-3.5 h-3.5 flex-shrink-0" />
      <span class="truncate">{formatPhoneNumber(contact.whatsapp_number)}</span>
    </div>

    {#if contact.group_name}
      <div class="mt-1.5">
        <GroupBadge name={contact.group_name} color={contact.group_color} />
      </div>
    {/if}
  </div>

  <!-- Actions -->
  {#if showActions}
    <div class="flex items-center gap-1 flex-shrink-0">
      <!-- Quick Actions -->
      {#if onCall}
        <button
          onclick={handleCall}
          class="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors"
          aria-label="Call {contact.name}"
        >
          <Phone class="w-4 h-4" />
        </button>
      {/if}

      {#if onMessage}
        <button
          onclick={handleMessage}
          class="p-2 rounded-full hover:bg-[#25D366]/10 text-[#25D366] transition-colors"
          aria-label="Message {contact.name}"
        >
          <MessageCircle class="w-4 h-4" />
        </button>
      {/if}

      <!-- More Menu -->
      <div class="relative" bind:this={menuElement}>
        <button
          onclick={handleMenuClick}
          class="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="More options"
        >
          <MoreVertical class="w-4 h-4" />
        </button>

        {#if showMenu}
          <div class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            {#if onToggleFavorite}
              <button
                onclick={handleFavorite}
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
              >
                {#if contact.is_favorite}
                  <StarOff class="w-4 h-4 text-gray-500" />
                  <span>Remove from favorites</span>
                {:else}
                  <Star class="w-4 h-4 text-amber-500" />
                  <span>Add to favorites</span>
                {/if}
              </button>
            {/if}

            {#if onEdit}
              <button
                onclick={handleEdit}
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
            {/if}

            {#if onDelete}
              <div class="border-t border-gray-200 my-1"></div>
              <button
                onclick={handleDelete}
                class="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
