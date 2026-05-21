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
    'min-h-[44px] min-w-[44px]',
    'w-6 h-6 rounded-[10px] transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f7]',
    disabled && 'opacity-50 cursor-not-allowed',
    !disabled && 'cursor-pointer',
    checked
      ? 'bg-[#ae2f34] border-[#ae2f34] shadow-[0_1px_3px_rgba(174,47,52,0.18)]'
      : 'border-2 border-[#e0bfbd] hover:border-[#ae2f34] bg-[#f5dddb]',
    className
  );

  const checkboxId = $derived(id || `checkbox-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="inline-flex items-center gap-3">
  <!-- Subtle glow effect when checked -->
  {#if checked}
    <div
      class="absolute w-6 h-6 rounded-[10px] bg-[#ae2f34] opacity-20 blur-sm -z-10"
      style="transform: scale(1.2);"
      aria-hidden="true"
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
        <Check class="text-white animate-in zoom-in-50 duration-150" size={16} strokeWidth={3} />
      </div>
    {/if}
  </div>

  {#if label}
    <label
      for={checkboxId}
      class={cn(
        'text-sm font-medium text-[#251818] cursor-pointer select-none transition-colors',
        'hover:text-[#ae2f34]',
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
