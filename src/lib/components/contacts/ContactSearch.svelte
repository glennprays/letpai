<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Search, SlidersHorizontal } from 'lucide-svelte';
  import SearchInput from '../ui/SearchInput.svelte';
  import Tabs from '../ui/Tabs.svelte';
  import type { ContactGroup } from '$lib/types/api';

  type FilterType = 'all' | 'favorites' | string;

  interface Props {
    searchQuery?: string;
    activeFilter?: FilterType;
    groups?: ContactGroup[];
    onsearchchange?: (query: string) => void;
    onfilterchange?: (filter: FilterType) => void;
    class?: string;
  }

  let {
    searchQuery = $bindable(''),
    activeFilter = $bindable('all'),
    groups = [],
    onsearchchange,
    onfilterchange,
    class: className,
    ...props
  }: Props = $props();

  let showFilters = $state(false);

  function handleSearchInput(value: string) {
    searchQuery = value;
    if (onsearchchange) onsearchchange(value);
  }

  function handleFilterChange(filter: FilterType) {
    activeFilter = filter;
    if (onfilterchange) onfilterchange(filter);
  }

  function toggleFilters() {
    showFilters = !showFilters;
  }

  const tabs = $derived([
    { value: 'all' as const, label: 'All', icon: undefined, count: undefined },
    { value: 'favorites' as const, label: 'Favorites', icon: undefined, count: undefined },
    ...groups.map(g => ({
      value: g.group_id,
      label: g.name,
      count: g.contact_count
    }))
  ]);

  const activeGroup = $derived(
    activeFilter !== 'all' && activeFilter !== 'favorites'
      ? groups.find(g => g.group_id === activeFilter)
      : null
  );
</script>

<div class={cn('space-y-4', className)} {...props}>
  <!-- Search Bar -->
  <div class="relative">
    <SearchInput
      placeholder="Search contacts..."
      bind:value={searchQuery}
      oninput={handleSearchInput}
    />

    <!-- Filter Toggle -->
    <button
      onclick={toggleFilters}
      class={cn(
        'absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]',
        showFilters || activeFilter !== 'all'
          ? 'bg-[#ae2f34] text-white'
          : 'bg-[#fff0ef] text-[#584140] hover:bg-[#fbe3e1]'
      )}
      aria-label="Toggle filters"
    >
      <SlidersHorizontal class="w-4 h-4" />
    </button>
  </div>

  <!-- Filters -->
  {#if showFilters || activeFilter !== 'all'}
    <div class="animate-in slide-in-from-top-2 duration-200">
      <Tabs
        tabs={tabs}
        bind:value={activeFilter}
        onchange={handleFilterChange}
        class="flex-wrap"
      />

      {#if activeGroup}
        <div class="mt-2 flex items-center justify-between">
          <span class="text-sm text-[#584140]">
            Filtering by <strong>{activeGroup.name}</strong>
          </span>
          <button
            onclick={() => handleFilterChange('all')}
            class="text-sm text-[#ae2f34] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] rounded"
          >
            Clear
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>
