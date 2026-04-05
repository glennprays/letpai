<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { AlertTriangle, X } from 'lucide-svelte';
  import Button from './Button.svelte';
  type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'whatsapp';

  interface Props {
    open?: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onconfirm?: () => void;
    oncancel?: () => void;
  }

  let {
    open = false,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    onconfirm,
    oncancel,
    ...props
  }: Props = $props();

  let dialogElement: HTMLDivElement;

  function handleConfirm() {
    if (onconfirm) onconfirm();
    open = false;
  }

  function handleCancel() {
    if (oncancel) oncancel();
    open = false;
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === dialogElement) {
      handleCancel();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleCancel();
    }
  }

  const variantStyles: Record<string, { icon: string; iconBg: string; button: ButtonVariant }> = {
    danger: {
      icon: 'text-red-500',
      iconBg: 'bg-red-100',
      button: 'destructive'
    },
    warning: {
      icon: 'text-amber-500',
      iconBg: 'bg-amber-100',
      button: 'primary'
    },
    info: {
      icon: 'text-blue-500',
      iconBg: 'bg-blue-100',
      button: 'secondary'
    }
  };

  const currentStyle = $derived(variantStyles[variant]);
</script>

{#if open}
  <div
    bind:this={dialogElement}
    onkeydown={handleKeydown}
    onclick={handleBackdropClick}
    class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-dialog-title"
    tabindex="-1"
  >
    <div
      class="w-full max-w-sm bg-white rounded-xl shadow-xl p-6 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:animate-in"
      {...props}
    >
      <!-- Icon -->
      <div class="flex justify-center mb-4">
        <div class={cn('w-12 h-12 rounded-full flex items-center justify-center', currentStyle.iconBg)}>
          <AlertTriangle class={cn('w-6 h-6', currentStyle.icon)} />
        </div>
      </div>

      <!-- Content -->
      <div class="text-center mb-6">
        <h3
          id="confirm-dialog-title"
          class="text-lg font-semibold text-gray-900 mb-2"
        >
          {title}
        </h3>
        <p class="text-sm text-gray-600">
          {message}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          onclick={handleCancel}
          class="flex-1 h-10 px-6 text-[15px] font-bold rounded-full border-[1.5px] border-[#F0F0F0] text-[#6B7280] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors"
        >
          {cancelText}
        </button>
        <button
          onclick={handleConfirm}
          class="flex-1 h-10 px-6 text-[15px] font-bold rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white transition-colors"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
