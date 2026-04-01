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
    leftIcon?: any;
    rightIcon?: any;
    ripple?: boolean;
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
    ripple = true,
    children,
    ...props
  }: Props = $props();

  const variants = {
    primary:
      'bg-[#FF6B6B] hover:bg-[#FF5252] text-white border border-transparent shadow-[0_4px_14px_rgba(255,107,107,0.35)] hover:shadow-[0_6px_20px_rgba(255,107,107,0.4)] hover:-translate-y-px',
    secondary:
      'bg-white border-[1.5px] border-[#F0F0F0] text-[#6B7280] hover:border-[#FF6B6B] hover:text-[#FF6B6B]',
    ghost: 'bg-transparent text-gray-500 hover:text-gray-900',
    destructive:
      'bg-[#EF4444] hover:bg-[#DC2626] text-white border border-transparent shadow-[0_4px_14px_rgba(239,68,68,0.35)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] hover:-translate-y-px',
    whatsapp:
      'bg-[#25D366] hover:bg-[#1EBE59] text-white border border-transparent shadow-[0_4px_14px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] hover:-translate-y-px',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-6 text-[15px]',
    lg: 'h-12 px-8 text-base',
  };

  const baseClasses = $derived(
    cn(
      'inline-flex items-center justify-center rounded-full font-bold transition-all duration-150 font-sans',
      'focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none',
      'cursor-pointer relative overflow-hidden',
      variants[variant],
      sizes[size],
      className
    )
  );

  function handleClick(e: MouseEvent) {
    if (!disabled && !loading && onbuttonclick) {
      onbuttonclick();

      // Ripple effect
      if (ripple) {
        createRipple(e);
      }
    }
  }

  function createRipple(e: MouseEvent) {
    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const circle = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const rippleContainer = button.getElementsByClassName('ripple-container')[0];
    if (rippleContainer) {
      rippleContainer.appendChild(circle);
    }

    setTimeout(() => circle.remove(), 600);
  }
</script>

<button
  type={type}
  disabled={disabled || loading}
  class={baseClasses}
  onclick={handleClick}
  {...props}
>
  <span class="ripple-container" style="position: absolute; inset: 0; overflow: hidden; pointer-events: none;"></span>

  {#if loading}
    <Loader2 class="animate-spin" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
  {:else}
    {#if leftIcon}
      <span class="icon-left" style="display: flex; align-items: center; margin-right: 8px;">
        <svelte:component this={leftIcon} size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      </span>
    {/if}

    {@render children()}

    {#if rightIcon}
      <span class="icon-right" style="display: flex; align-items: center; margin-left: 8px;">
        <svelte:component this={rightIcon} size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      </span>
    {/if}
  {/if}
</button>

<style>
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple-animation 600ms linear;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  button:active:not(:disabled) {
    transform: scale(0.98);
  }
</style>
