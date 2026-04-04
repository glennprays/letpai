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
    'w-5 h-5 rounded border-2 transition-all duration-150',
    'focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2',
    disabled && 'opacity-50 cursor-not-allowed',
    !disabled && 'cursor-pointer',
    checked
      ? 'bg-[#FF6B6B] border-[#FF6B6B]'
      : 'border-gray-300 hover:border-[#FF6B6B] bg-white',
    className
  );

  const checkboxId = $derived(id || `checkbox-${Math.random().toString(36).slice(2, 9)}`);
</script>

<div class="inline-flex items-center gap-2">
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
      <Check class="text-white" size={14} strokeWidth={3} />
    {/if}
  </div>

  {#if label}
    <label
      for={checkboxId}
      class={cn(
        'text-sm font-medium text-gray-700 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onclick={!disabled ? handleChange : undefined}
    >
      {label}
    </label>
  {/if}
</div>
