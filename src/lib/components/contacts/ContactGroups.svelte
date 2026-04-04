<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Plus, MoreVertical, Pencil, Trash2, X } from 'lucide-svelte';
  import Button from '../ui/Button.svelte';
  import Input from '../ui/Input.svelte';
  import GroupBadge from './GroupBadge.svelte';
  import ConfirmDialog from '../ui/ConfirmDialog.svelte';
  import type { ContactGroup } from '$lib/types/api';

  // Preset group colors
  const GROUP_COLORS = [
    { name: 'Coral', value: '#FF6B6B' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Sky', value: '#0EA5E9' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' }
  ];

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

  let showCreateForm = $state(false);
  let editingGroup = $state<ContactGroup | null>(null);
  let deletingGroup = $state<ContactGroup | null>(null);

  let newGroupName = $state('');
  let newGroupColor = $state(GROUP_COLORS[0].value);
  let editGroupName = $state('');
  let editGroupColor = $state('');

  function openCreateForm() {
    newGroupName = '';
    newGroupColor = GROUP_COLORS[0].value;
    showCreateForm = true;
  }

  function closeCreateForm() {
    showCreateForm = false;
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
    closeCreateForm();
  }

  function openEditGroup(group: ContactGroup) {
    editingGroup = group;
    editGroupName = group.name;
    editGroupColor = group.color;
  }

  function closeEditGroup() {
    editingGroup = null;
    editGroupName = '';
    editGroupColor = '';
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
</script>

<div class={cn('space-y-4', className)} {...props}>
  <!-- Create Group Form -->
  {#if showCreateForm}
    <div class="bg-white rounded-xl border-2 border-[#FF6B6B] p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-gray-900">Create New Group</h3>
        <button
          onclick={closeCreateForm}
          class="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X class="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <Input
        label="Group Name"
        placeholder="e.g., Family, Friends, Work"
        bind:value={newGroupName}
        disabled={loading}
        maxLength={50}
      />

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          Group Color
        </label>
        <div class="flex flex-wrap gap-2">
          {#each GROUP_COLORS as color}
            <button
              type="button"
              onclick={() => newGroupColor = color.value}
              class={cn(
                'w-8 h-8 rounded-full transition-all duration-150',
                newGroupColor === color.value
                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                  : 'hover:scale-105'
              )}
              style="background-color: {color.value};"
              title={color.name}
              aria-label={color.name}
            ></button>
          {/each}
        </div>
      </div>

      <Button
        variant="primary"
        onbuttonclick={handleCreate}
        disabled={!newGroupName.trim() || loading}
        loading={loading}
        class="w-full"
      >
        Create Group
      </Button>
    </div>
  {:else}
    <Button
      variant="secondary"
      onbuttonclick={openCreateForm}
      disabled={loading}
      leftIcon={Plus}
      class="w-full"
    >
      Create New Group
    </Button>
  {/if}

  <!-- Groups List -->
  <div class="space-y-2">
    {#each groups as group (group.group_id)}
      <div
        class="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6B6B] transition-all duration-150 p-4"
      >
        {#if editingGroup?.group_id === group.group_id}
          <!-- Edit Form -->
          <div class="space-y-3">
            <Input
              label="Group Name"
              placeholder="Group name"
              bind:value={editGroupName}
              disabled={loading}
              maxLength={50}
              size="sm"
            />

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-2">
                Group Color
              </label>
              <div class="flex flex-wrap gap-2">
                {#each GROUP_COLORS as color}
                  <button
                    type="button"
                    onclick={() => editGroupColor = color.value}
                    class={cn(
                      'w-6 h-6 rounded-full transition-all duration-150',
                      editGroupColor === color.value
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                        : 'hover:scale-105'
                    )}
                    style="background-color: {color.value};"
                    title={color.name}
                  ></button>
                {/each}
              </div>
            </div>

            <div class="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onbuttonclick={closeEditGroup}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onbuttonclick={handleUpdate}
                disabled={!editGroupName.trim() || loading}
                loading={loading}
              >
                Save
              </Button>
            </div>
          </div>
        {:else}
          <!-- Group Display -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <GroupBadge name={group.name} color={group.color} />
              <span class="text-sm text-gray-500">
                {group.contact_count} {group.contact_count === 1 ? 'contact' : 'contacts'}
              </span>
            </div>

            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onclick={() => openEditGroup(group)}
                class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Edit group"
              >
                <Pencil class="w-4 h-4 text-gray-500" />
              </button>
              <button
                onclick={() => openDeleteGroup(group)}
                class="p-2 rounded-full hover:bg-red-50 transition-colors"
                aria-label="Delete group"
              >
                <Trash2 class="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog
    open={!!deletingGroup}
    title="Delete Group?"
    message="This will remove the group from all contacts but won't delete the contacts themselves."
    confirmText="Delete Group"
    cancelText="Cancel"
    variant="danger"
    onconfirm={handleDelete}
    oncancel={() => deletingGroup = null}
  />
</div>
