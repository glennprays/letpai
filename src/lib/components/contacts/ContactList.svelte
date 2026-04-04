<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { checkScrollDirection } from '$lib/utils/scroll';
  import ContactCard from './ContactCard.svelte';
  import EmptyState from '../ui/EmptyState.svelte';
  import { Users } from 'lucide-svelte';
  import type { Contact } from '$lib/types/api';

  interface Props {
    contacts: Contact[];
    loading?: boolean;
    selectedContacts?: Set<string>;
    onSelect?: (contact: Contact) => void;
    onEdit?: (contact: Contact) => void;
    onDelete?: (contact: Contact) => void;
    onToggleFavorite?: (contact: Contact) => void;
    onCall?: (contact: Contact) => void;
    onMessage?: (contact: Contact) => void;
    showCheckbox?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    class?: string;
  }

  let {
    contacts,
    loading = false,
    selectedContacts = new Set(),
    onSelect,
    onEdit,
    onDelete,
    onToggleFavorite,
    onCall,
    onMessage,
    showCheckbox = false,
    emptyTitle = 'No contacts found',
    emptyDescription = 'Try adjusting your search or add a new contact.',
    class: className,
    ...props
  }: Props = $props();

  let listElement: HTMLDivElement;

  // Smooth scroll handling
  function handleScroll(e: Event) {
    const target = e.target as HTMLDivElement;
    checkScrollDirection(target);
  }
</script>

<div
  bind:this={listElement}
  onscroll={handleScroll}
  class={cn(
    'space-y-3 overflow-y-auto',
    'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400',
    className
  )}
  {...props}
>
  {#if loading}
    <!-- Skeleton Loading -->
    {#each Array(5) as _}
      <div class="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200">
        <div class="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div class="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
      </div>
    {/each}
  {:else if contacts.length === 0}
    <!-- Empty State -->
    <EmptyState
      icon={Users}
      title={emptyTitle}
      description={emptyDescription}
      size="md"
    />
  {:else}
    <!-- Contact List -->
    {#each contacts as contact (contact.contact_id)}
      <ContactCard
        {contact}
        selected={selectedContacts.has(contact.contact_id)}
        onSelect={onSelect ? () => onSelect(contact) : undefined}
        onEdit={onEdit ? () => onEdit(contact) : undefined}
        onDelete={onDelete ? () => onDelete(contact) : undefined}
        onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(contact) : undefined}
        onCall={onCall ? () => onCall(contact) : undefined}
        onMessage={onMessage ? () => onMessage(contact) : undefined}
        showActions={true}
        showCheckbox={showCheckbox}
      />
    {/each}
  {/if}
</div>

<style>
  /* Custom scrollbar for WebKit browsers */
  :global(.scrollbar-thin) {
    scrollbar-width: thin;
  }

  :global(.scrollbar-thin::-webkit-scrollbar) {
    width: 6px;
  }

  :global(.scrollbar-thin::-webkit-scrollbar-track) {
    background: #f1f1f1;
    border-radius: 3px;
  }

  :global(.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb) {
    background: #d1d5db;
    border-radius: 3px;
  }

  :global(.hover\:scrollbar-thumb-gray-400:hover::-webkit-scrollbar-thumb) {
    background: #9ca3af;
  }
</style>
