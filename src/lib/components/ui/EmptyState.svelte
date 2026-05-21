<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    icon?: any;
    title?: string;
    description?: string;
    action?: {
      label: string;
      onclick: () => void;
    };
    class?: string;
    size?: 'sm' | 'md' | 'lg';
  }

  let {
    icon,
    title = 'No data found',
    description = 'There are no items to display yet.',
    action,
    class: className,
    size = 'md',
    ...props
  }: Props = $props();

  const sizes = {
    sm: 'py-8 px-4',
    md: 'py-12 px-6',
    lg: 'py-16 px-8'
  };

  const iconSizes = {
    sm: 32,
    md: 48,
    lg: 64
  };
</script>

<div
  class={cn(
    'flex flex-col items-center justify-center text-center bg-[#fff0ef] rounded-3xl',
    sizes[size],
    className
  )}
  {...props}
>
  {#if icon}
    {@const Icon = icon}
    <div class="mb-4 text-[#584140]/30">
      <Icon size={iconSizes[size]} />
    </div>
  {/if}

  <h3 class="text-lg font-semibold text-[#251818] mb-2">
    {title}
  </h3>

  <p class="text-sm text-[#584140] max-w-sm mb-6">
    {description}
  </p>

  {#if action}
    <button
      onclick={action.onclick}
      class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] text-white rounded-2xl font-medium hover:shadow-md transition-all"
    >
      {action.label}
    </button>
  {/if}
</div>
