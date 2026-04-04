<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Plus, Pencil, Trash2, X, Users, ChevronRight } from 'lucide-svelte';
  import Button from '../ui/Button.svelte';
  import Input from '../ui/Input.svelte';
  import GroupBadge from './GroupBadge.svelte';
  import ConfirmDialog from '../ui/ConfirmDialog.svelte';
  import type { ContactGroup } from '$lib/types/api';

  // Preset group colors with better visual distinction
  const GROUP_COLORS = [
    { name: 'Coral Red', value: '#FF6B6B', bg: 'bg-red-50', border: 'border-red-200' },
    { name: 'Teal Blue', value: '#14B8A6', bg: 'bg-teal-50', border: 'border-teal-200' },
    { name: 'Royal Purple', value: '#A855F7', bg: 'bg-purple-50', border: 'border-purple-200' },
    { name: 'Golden Amber', value: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200' },
    { name: 'Hot Pink', value: '#EC4899', bg: 'bg-pink-50', border: 'border-pink-200' },
    { name: 'Sky Blue', value: '#0EA5E9', bg: 'bg-sky-50', border: 'border-sky-200' },
    { name: 'Fresh Green', value: '#10B981', bg: 'bg-green-50', border: 'border-green-200' },
    { name: 'Vibrant Orange', value: '#F97316', bg: 'bg-orange-50', border: 'border-orange-200' },
    { name: 'Deep Indigo', value: '#6366F1', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { name: 'Rose Pink', value: '#F43F5E', bg: 'bg-rose-50', border: 'border-rose-200' }
  ] as const;

  interface Props {
    groups: ContactGroup[];
    loading?: boolean;
    oncreate?: (data: { name: string; color: string }) => void;
    onupdate?: (groupId: string, data: { name: string; color: string }) => void;
    ondelete?: (groupId: string) => void;
    class?: string;
  }

  let {
    groups,
    loading = false,
    oncreate,
    onupdate,
    ondelete,
    class: className,
    ...props
  }: Props = $props();

  let showCreateModal = $state(false);
  let editingGroup = $state<ContactGroup | null>(null);
  let deletingGroup = $state<ContactGroup | null>(null);

  let newGroupName = $state('');
  let newGroupColor = $state(GROUP_COLORS[0].value);
  let editGroupName = $state('');
  let editGroupColor = $state('');

  function openCreateModal() {
    newGroupName = '';
    newGroupColor = GROUP_COLORS[0].value;
    showCreateModal = true;
  }

  function closeCreateModal() {
    showCreateModal = false;
    newGroupName = '';
  }

  function handleCreate() {
    if (!newGroupName.trim()) return;

    if (oncreate) {
      oncreate({
        name: newGroupName.trim(),
        color: newGroupColor
      });
    }
    closeCreateModal();
  }

  function openEditGroup(group: ContactGroup) {
    editingGroup = group;
    editGroupName = group.name;
    editGroupColor = group.color;
    showCreateModal = true;
  }

  function closeEditGroup() {
    editingGroup = null;
    editGroupName = '';
    editGroupColor = '';
    showCreateModal = false;
  }

  function handleUpdate() {
    if (!editingGroup || !editGroupName.trim()) return;

    if (onupdate) {
      onupdate(editingGroup.group_id, {
        name: editGroupName.trim(),
        color: editGroupColor
      });
    }
    closeEditGroup();
  }

  function openDeleteGroup(group: ContactGroup) {
    deletingGroup = group;
  }

  function handleDelete() {
    if (!deletingGroup) return;

    const groupId = deletingGroup.group_id;
    deletingGroup = null;

    if (ondelete) {
      ondelete(groupId);
    }
  }

  function handleColorSelect(color: string) {
    newGroupColor = color;
  }

  function handleEditColorSelect(color: string) {
    editGroupColor = color;
  }

  const modalTitle = $derived(editingGroup ? 'Edit Group' : 'Create New Group');
  const submitButtonText = $derived(editingGroup ? 'Save Changes' : 'Create Group');
  const selectedColorIndex = $derived(GROUP_COLORS.findIndex(c => c.value === newGroupColor));
  const editColorIndex = $derived(GROUP_COLORS.findIndex(c => c.value === editGroupColor));
</script>

<div class={cn('space-y-4', className)} {...props}>
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold text-gray-900">Contact Groups</h3>
      <p class="text-sm text-gray-500 mt-0.5">
        Organize your contacts into groups
      </p>
    </div>
    <Button
      variant="primary"
      size="sm"
      onclick={openCreateModal}
      leftIcon={Plus}
    >
      New Group
    </Button>
  </div>

  <!-- Groups List -->
  {#if groups.length === 0}
    <div class="text-center py-8 px-4">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
        <Users class="w-8 h-8 text-gray-400" />
      </div>
      <h4 class="text-gray-900 font-medium mb-1">No groups yet</h4>
      <p class="text-gray-500 text-sm mb-4">Create your first group to organize contacts</p>
      <Button
        variant="secondary"
        size="sm"
        onclick={openCreateModal}
        leftIcon={Plus}
      >
        Create Group
      </Button>
    </div>
  {:else}
    <div class="space-y-2">
      {#each groups as group (group.group_id)}
        <div
          class="group/item flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-[#FF6B6B] hover:shadow-sm transition-all duration-150"
        >
          <!-- Color Indicator -->
          <div
            class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
            style="background-color: {group.color}15%"
          >
            <div
              class="w-4 h-4 rounded-full"
              style="background-color: {group.color};"
            ></div>
          </div>

          <!-- Group Info -->
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-gray-900 truncate">{group.name}</h4>
            <p class="text-xs text-gray-500 mt-0.5">
              {group.contact_count} {group.contact_count === 1 ? 'contact' : 'contacts'}
            </p>
          </div>

          <!-- Contact Count Badge -->
          <div class="flex-shrink-0">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {group.contact_count}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
            <button
              onclick={() => openEditGroup(group)}
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Edit group"
            >
              <Pencil class="w-4 h-4 text-gray-500" />
            </button>
            <button
              onclick={() => openDeleteGroup(group)}
              class="p-2 rounded-lg hover:bg-red-50 transition-colors"
              aria-label="Delete group"
            >
              <Trash2 class="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Create/Edit Modal -->
  {#if showCreateModal}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onclick={(e) => {
        if (e.target === e.currentTarget) closeEditGroup();
      }}
    >
      <div
        class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4"
        onclick={(e) => e.stopPropagation()}
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-900">{modalTitle}</h3>
          <button
            onclick={closeEditGroup}
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Form -->
        <div class="space-y-6">
          <!-- Group Name -->
          <div>
            <label
              for="group-name-input"
              class="block text-sm font-semibold text-gray-700 mb-2"
            >
              Group Name
            </label>
            <Input
              id="group-name-input"
              placeholder="e.g., Family, Friends, Work"
              bind:value={editingGroup ? editGroupName : newGroupName}
              disabled={loading}
              maxLength={30}
              showCount
              class="text-base"
            />
          </div>

          <!-- Color Selection -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              Choose Color
            </label>
            <div class="grid grid-cols-5 gap-3">
              {#each GROUP_COLORS as color (color.value)}
                <button
                  type="button"
                  onclick={() => editingGroup ? handleEditColorSelect(color.value) : handleColorSelect(color.value)}
                  class={cn(
                    'relative w-full aspect-square rounded-xl transition-all duration-150 hover:scale-105',
                    color.bg,
                    color.border,
                    'border-2'
                  )}
                  class:ring-2={editingGroup
                    ? editColorIndex === GROUP_COLORS.indexOf(color)
                    : selectedColorIndex === GROUP_COLORS.indexOf(color)}
                  class:ring-offset-2={editingGroup
                    ? editColorIndex === GROUP_COLORS.indexOf(color)
                    : selectedColorIndex === GROUP_COLORS.indexOf(color)}
                  class:ring-gray-400={editingGroup
                    ? editColorIndex === GROUP_COLORS.indexOf(color)
                    : selectedColorIndex === GROUP_COLORS.indexOf(color)}
                  aria-label={color.name}
                >
                  {#if (editingGroup && editColorIndex === GROUP_COLORS.indexOf(color)) ||
                      (!editingGroup && selectedColorIndex === GROUP_COLORS.indexOf(color))}
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  {/if}
                </button>
              {/each}
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Pick a color to easily identify this group
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onclick={closeEditGroup}
              disabled={loading}
              class="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onclick={editingGroup ? handleUpdate : handleCreate}
              disabled={loading || !(editingGroup ? editGroupName.trim() : newGroupName.trim())}
              loading={loading}
              class="flex-1"
            >
              {submitButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog
    open={!!deletingGroup}
    title="Delete Group?"
    message={`Are you sure you want to delete "${deletingGroup?.name}"? Contacts in this group won't be deleted.`}
    confirmText="Delete Group"
    cancelText="Cancel"
    variant="danger"
    onconfirm={handleDelete}
    oncancel={() => deletingGroup = null}
  />
</div>

<style>
  .group\/item:hover .group\/item\:opacity-100 {
    opacity: 1;
  }
</style>
