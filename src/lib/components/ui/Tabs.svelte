<script lang="ts" generics="T extends string">
  import { cn } from '$lib/utils/cn';

  interface Tab {
    value: T;
    label: string;
    icon?: any;
    count?: number;
    disabled?: boolean;
  }

  interface Props {
    tabs: Tab[];
    value?: T;
    class?: string;
    onchange?: (value: T) => void;
  }

  let {
    tabs,
    value = $bindable(tabs[0]?.value),
    class: className,
    onchange,
    ...props
  }: Props = $props();

  function handleChange(tabValue: T) {
    const tab = tabs.find(t => t.value === tabValue);
    if (tab?.disabled) return;

    value = tabValue;
    if (onchange) onchange(tabValue);
  }
</script>

<div
  class={cn('flex items-center gap-1 overflow-x-auto scrollbar-hide', className)}
  role="tablist"
  {...props}
>
  {#each tabs as tab (tab.value)}
    <button
      role="tab"
      aria-selected={value === tab.value}
      aria-disabled={tab.disabled}
      disabled={tab.disabled}
      onclick={() => handleChange(tab.value)}
      class={cn(
        'relative inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap',
        'focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30 focus:ring-offset-2 focus:ring-offset-[#fff8f7]',
        value === tab.value
          ? 'bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] text-white shadow-sm'
          : 'text-[#584140] hover:bg-[#fbe3e1]',
        tab.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {#if tab.icon}
        <svelte:component this={tab.icon} size={16} />
      {/if}

      <span>{tab.label}</span>

      {#if tab.count !== undefined}
        <span
          class={cn(
            'text-xs px-1.5 py-0.5 rounded-full',
            value === tab.value
              ? 'bg-white/20 text-white'
              : 'bg-[#ffe9e7] text-[#584140]'
          )}
        >
          {tab.count}
        </span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
