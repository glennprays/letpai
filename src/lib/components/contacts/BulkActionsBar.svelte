<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Trash2, FolderOpen, X, Star, StarOff } from 'lucide-svelte';
  import Button from '../ui/Button.svelte';
  import type { ContactGroup } from '$lib/types/api';

  interface Props {
    selectedCount: number;
    groups?: ContactGroup[];
    loading?: boolean;
    onclear?: () => void;
    ondelete?: () => void;
    onassigngroup?: (groupId: string) => void;
    ontogglefavorite?: (isFavorite: boolean) => void;
    class?: string;
  }

  let {
    selectedCount,
    groups = [],
    loading = false,
    onclear,
    ondelete,
    onassigngroup,
    ontogglefavorite,
    class: className,
    ...props
  }: Props = $props();

  let showGroupMenu = $state(false);
  let showFavoriteMenu = $state(false);
  let menuElement: HTMLElement;

  function handleAssignGroup(groupId: string) {
    if (onassigngroup) onassigngroup(groupId);
    showGroupMenu = false;
  }

  function handleToggleFavorite(isFavorite: boolean) {
    if (ontogglefavorite) ontogglefavorite(isFavorite);
    showFavoriteMenu = false;
  }

  // Close menus when clicking outside
  $effect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (menuElement && !menuElement.contains(target)) {
        showGroupMenu = false;
        showFavoriteMenu = false;
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

{#if selectedCount > 0}
  <div
    bind:this={menuElement}
    class={cn(
      'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40',
      'md:static md:border md:rounded-xl md:shadow-md md:p-3',
      'animate-in slide-in-from-bottom-4 duration-200',
      className
    )}
    {...props}
  >
    <div class="flex items-center justify-between gap-4 p-4 md:p-0">
      <!-- Selection Info -->
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-gray-900">
          {selectedCount} {selectedCount === 1 ? 'contact' : 'contacts'} selected
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Clear Selection -->
        <Button
          variant="ghost"
          size="sm"
          onbuttonclick={onclear}
          disabled={loading}
          leftIcon={X}
        >
          Clear
        </Button>

        <!-- Toggle Favorite -->
        {#if ontogglefavorite}
          <div class="relative" bind:this={menuElement}>
            <Button
              variant="secondary"
              size="sm"
              onbuttonclick={() => showFavoriteMenu = !showFavoriteMenu}
              disabled={loading}
              leftIcon={Star}
            >
              Favorite
            </Button>

            {#if showFavoriteMenu}
              <div class="absolute bottom-full mb-2 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onclick={() => handleToggleFavorite(true)}
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                >
                  <Star class="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Add to favorites</span>
                </button>
                <button
                  onclick={() => handleToggleFavorite(false)}
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                >
                  <StarOff class="w-4 h-4 text-gray-400" />
                  <span>Remove from favorites</span>
                </button>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Assign to Group -->
        {#if onassigngroup && groups.length > 0}
          <div class="relative" bind:this={menuElement}>
            <Button
              variant="secondary"
              size="sm"
              onbuttonclick={() => showGroupMenu = !showGroupMenu}
              disabled={loading}
              leftIcon={FolderOpen}
            >
              Add to Group
            </Button>

            {#if showGroupMenu}
              <div class="absolute bottom-full mb-2 left-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 max-h-64 overflow-y-auto">
                <button
                  onclick={() => handleAssignGroup('')}
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-gray-600"
                >
                  Remove from group
                </button>
                <div class="border-t border-gray-200 my-1"></div>
                {#each groups as group}
                  <button
                    onclick={() => handleAssignGroup(group.group_id)}
                    class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                  >
                    <span
                      class="w-3 h-3 rounded-full flex-shrink-0"
                      style="background-color: {group.color};"
                    ></span>
                    <span>{group.name}</span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- Delete -->
        {#if ondelete}
          <Button
            variant="destructive"
            size="sm"
            onbuttonclick={ondelete}
            disabled={loading}
            leftIcon={Trash2}
          >
            Delete
          </Button>
        {/if}
      </div>
    </div>
  </div>
{/if}
