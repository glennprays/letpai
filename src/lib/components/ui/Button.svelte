<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Loader2 } from 'lucide-svelte';

  type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'whatsapp';
  type ButtonSize = 'sm' | 'default' | 'lg';

  interface Props {
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    class?: string;
    type?: 'button' | 'submit' | 'reset';
    onbuttonclick?: () => void;
    // lucide-svelte icons are class components — broad typing for compatibility with both old & new consumer call sites.
    leftIcon?: any;
    rightIcon?: any;
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
    leftIcon,
    rightIcon,
    ...props
  }: Props = $props();

  const variants = {
    primary:
      'bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] text-white shadow-[0_4px_14px_rgba(174,47,52,0.18)] hover:shadow-[0_6px_20px_rgba(174,47,52,0.24)] hover:-translate-y-px',
    secondary:
      'bg-[#6df5e1] text-[#006b5f] hover:brightness-95',
    ghost: 'bg-transparent text-[#ae2f34] hover:bg-[#fbe3e1]',
    destructive:
      'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_4px_14px_rgba(37,24,24,0.08)] hover:shadow-[0_6px_20px_rgba(37,24,24,0.10)] hover:-translate-y-px',
    whatsapp:
      'bg-[#25D366] hover:bg-[#1EBE59] text-white shadow-[0_4px_14px_rgba(37,24,24,0.08)] hover:shadow-[0_6px_20px_rgba(37,24,24,0.10)] hover:-translate-y-px',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    default: 'h-11 px-5 text-[15px]',
    lg: 'h-12 px-7 text-base',
  };

  const baseClasses = $derived(
    cn(
      'inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-200 font-sans',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f7]',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none',
      'cursor-pointer relative overflow-hidden',
      variants[variant],
      sizes[size],
      className
    )
  );

  function handleClick() {
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
    <Loader2 class="animate-spin" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
  {:else}
    {#if leftIcon}
      {@const LeftIcon = leftIcon}
      <span class="flex items-center mr-2">
        <LeftIcon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      </span>
    {/if}

    {@render children()}

    {#if rightIcon}
      {@const RightIcon = rightIcon}
      <span class="flex items-center ml-2">
        <RightIcon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      </span>
    {/if}
  {/if}
</button>

<style>
  button:active:not(:disabled) {
    transform: scale(0.98);
  }
</style>
