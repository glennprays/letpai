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
    class: className,
    ...props
  }: Props = $props();

  let showMenu = $state(false);
  let menuElement = $state<HTMLElement>();

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
    'group relative flex items-center gap-3 p-4 bg-white rounded-2xl transition-all duration-300 ease-out',
    selected
      ? 'bg-[#fff0ef] ring-2 ring-[#ae2f34]/20 shadow-[0_10px_30px_rgba(37,24,24,0.06)] scale-[1.01]'
      : 'hover:shadow-[0_1px_3px_rgba(37,24,24,0.04)] hover:scale-[1.005]',
    className
  )}
  {...props}
>
  <!-- Modern Checkbox with enhanced UX -->
  <div class="flex-shrink-0 relative">
    <!-- Touch target wrapper -->
    <label class="relative flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer group/check">
      <input
        type="checkbox"
        checked={selected}
        onchange={onSelect}
        class="peer appearance-none w-6 h-6 rounded-[10px] border-2 border-[#e0bfbd] bg-[#f5dddb] checked:border-[#ae2f34] checked:bg-[#ae2f34] checked:shadow-[0_1px_3px_rgba(174,47,52,0.18)] transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f7] hover:border-[#ae2f34]"
        aria-label="Select {contact.name}"
      />

      <!-- Custom checkmark with animation -->
      <svg
        class="absolute inset-0 m-auto w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-all duration-200 ease-out peer-checked:scale-100 scale-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>

      <!-- Subtle glow effect when checked -->
      <div class="absolute inset-0 rounded-[10px] bg-[#ae2f34] opacity-0 peer-checked:opacity-20 blur-sm transition-opacity duration-300 -z-10 peer-checked:scale-110 scale-100"></div>
    </label>
  </div>

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
      <h3 class="font-semibold text-[#251818] truncate">
        {contact.name}
      </h3>
      {#if contact.is_favorite}
        <Star class="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] flex-shrink-0" />
      {/if}
    </div>

    <div class="flex items-center gap-2 text-sm text-[#584140]">
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
          class="p-2 rounded-full hover:bg-[#6df5e1]/30 text-[#006b5f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
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
          class="p-2 rounded-full hover:bg-[#fbe3e1] text-[#584140] transition-colors"
          aria-label="More options"
        >
          <MoreVertical class="w-4 h-4" />
        </button>

        {#if showMenu}
          <div class="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-[0_8px_32px_-4px_rgba(37,24,24,0.12)] py-1 z-10">
            {#if onToggleFavorite}
              <button
                onclick={handleFavorite}
                class="w-full px-4 py-2 text-left text-sm text-[#251818] hover:bg-[#fff0ef] flex items-center gap-3"
              >
                {#if contact.is_favorite}
                  <StarOff class="w-4 h-4 text-[#584140]" />
                  <span>Remove from favorites</span>
                {:else}
                  <Star class="w-4 h-4 text-[#F59E0B]" />
                  <span>Add to favorites</span>
                {/if}
              </button>
            {/if}

            {#if onEdit}
              <button
                onclick={handleEdit}
                class="w-full px-4 py-2 text-left text-sm hover:bg-[#fff0ef] flex items-center gap-3 text-[#251818]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
            {/if}

            {#if onDelete}
              <div class="h-2"></div>
              <button
                onclick={handleDelete}
                class="w-full px-4 py-2 text-left text-sm hover:bg-[#EF4444]/10 flex items-center gap-3 text-[#991B1B]"
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
