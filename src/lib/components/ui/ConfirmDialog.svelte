<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { AlertTriangle } from 'lucide-svelte';

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

  const variantStyles = {
    danger: {
      icon: 'text-[#EF4444]',
      iconBg: 'bg-[#fef2f2]',
      button: 'bg-gradient-to-br from-[#dc2626] to-[#EF4444] text-white'
    },
    warning: {
      icon: 'text-amber-500',
      iconBg: 'bg-amber-50',
      button: 'bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] text-white'
    },
    info: {
      icon: 'text-[#006b5f]',
      iconBg: 'bg-[#6df5e1]/20',
      button: 'bg-[#6df5e1] text-[#006b5f]'
    }
  };

  const currentStyle = $derived(variantStyles[variant]);
</script>

{#if open}
  <div
    bind:this={dialogElement}
    onkeydown={handleKeydown}
    onclick={handleBackdropClick}
    class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-dialog-title"
    tabindex="-1"
  >
    <div
      class="w-full max-w-sm bg-white rounded-3xl shadow-[0_8px_32px_-4px_rgba(37,24,24,0.12)] p-6"
      {...props}
    >
      <!-- Icon -->
      <div class="flex justify-center mb-4">
        <div class={cn('w-12 h-12 rounded-2xl flex items-center justify-center', currentStyle.iconBg)}>
          <AlertTriangle class={cn('w-6 h-6', currentStyle.icon)} />
        </div>
      </div>

      <!-- Content -->
      <div class="text-center mb-6">
        <h3
          id="confirm-dialog-title"
          class="text-lg font-semibold text-[#251818] mb-2"
        >
          {title}
        </h3>
        <p class="text-sm text-[#584140]">
          {message}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          onclick={handleCancel}
          class="flex-1 h-10 px-6 text-[15px] font-bold rounded-2xl bg-[#f5dddb] text-[#584140] hover:bg-[#fbe3e1] transition-colors"
        >
          {cancelText}
        </button>
        <button
          onclick={handleConfirm}
          class={cn('flex-1 h-10 px-6 text-[15px] font-bold rounded-2xl transition-all', currentStyle.button)}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
