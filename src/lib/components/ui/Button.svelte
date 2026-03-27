<script lang="ts">
  import { cn } from '$lib/utils/cn';

  type ButtonVariant = 'primary' | 'secondary' | 'ghost';
  type ButtonSize = 'sm' | 'default' | 'lg';

  interface Props {
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    class?: string;
    type?: 'button' | 'submit' | 'reset';
    onbuttonclick?: () => void;
    children: import('svelte').Snippet;
  }

  let {
    variant = 'primary',
    size = 'default',
    disabled = false,
    loading = false,
    type = 'button',
    class: className,
    onbuttonclick,
    children,
    ...props
  }: Props = $props();

  const variants = {
    primary:
      'bg-[#FF6B6B] hover:bg-[#FF5252] text-white border border-transparent shadow-[0_4px_14px_rgba(255,107,107,0.35)] hover:shadow-[0_6px_20px_rgba(255,107,107,0.4)] hover:-translate-y-px',
    secondary:
      'bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white',
    ghost: 'bg-transparent text-gray-500 hover:text-gray-900',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-6 text-[15px]',
    lg: 'h-12 px-8 text-base',
  };

  const baseClasses = $derived(
    cn(
      'inline-flex items-center justify-center rounded-full font-bold transition-all duration-150',
      'focus:outline-none',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      loading && 'cursor-wait',
      variants[variant],
      sizes[size],
      className
    )
  );

  function handleClick(e: MouseEvent) {
    if (!disabled && !loading && onbuttonclick) {
      onbuttonclick();
    }
  }
</script>

<button
  type={type}
  disabled={disabled || loading}
  class={baseClasses}
  onclick={handleClick}
  {...props}
>
  {#if loading}
    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 018 8 0 018-8 8 018z"></path>
    </svg>
  {:else}
    {@render children()}
  {/if}
</button>
