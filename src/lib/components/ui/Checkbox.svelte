<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Check } from 'lucide-svelte';

  interface Props {
    checked?: boolean;
    disabled?: boolean;
    class?: string;
    onchange?: (checked: boolean) => void;
    id?: string;
    label?: string;
  }

  let {
    checked = $bindable(false),
    disabled = false,
    class: className,
    onchange,
    id,
    label,
    ...props
  }: Props = $props();

  function handleChange() {
    if (disabled) return;
    checked = !checked;
    if (onchange) onchange(checked);
  }

  const baseClasses = cn(
    'relative inline-flex items-center justify-center',
    'min-h-[44px] min-w-[44px]', // Touch target size
    'w-6 h-6 rounded-lg border-2 transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2',
    disabled && 'opacity-50 cursor-not-allowed',
    !disabled && 'cursor-pointer',
    checked
      ? 'bg-[#FF6B6B] border-[#FF6B6B] shadow-md shadow-red-500/20'
      : 'border-gray-300 hover:border-[#FF6B6B] bg-white hover:shadow-sm',
    className
  );

  const checkboxId = $derived(id || `checkbox-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="inline-flex items-center gap-3">
  <!-- Subtle glow effect when checked -->
  {#if checked}
    <div
      class="absolute w-6 h-6 rounded-lg bg-[#FF6B6B] opacity-20 blur-sm -z-10"
      style="transform: scale(1.2);"
    ></div>
  {/if}

  <div
    role="checkbox"
    aria-checked={checked}
    aria-disabled={disabled}
    tabindex={!disabled ? 0 : undefined}
    class={baseClasses}
    onclick={handleChange}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleChange();
      }
    }}
    {...props}
  >
    {#if checked}
      <div class="absolute inset-0 flex items-center justify-center">
        <Check class="text-white" size={16} strokeWidth={3} class="animate-in zoom-in-50 duration-150" />
      </div>
    {/if}
  </div>

  {#if label}
    <label
      for={checkboxId}
      class={cn(
        'text-sm font-medium text-gray-700 cursor-pointer select-none transition-colors',
        'hover:text-gray-900',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onclick={!disabled ? handleChange : undefined}
    >
      {label}
    </label>
  {/if}
</div>

<style>
  /* Smooth scale animation for checkmark */
  @keyframes zoom-in {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-in.zoom-in-50 {
    animation: zoom-in 150ms ease-out;
  }
</style>
