<script lang="ts">
  import { toasts, removeToast } from '$lib/stores/toast';
  import { X } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';

  const variants: Record<string, string> = {
    success: 'bg-[#10B981] text-white',
    error: 'bg-[#EF4444] text-white',
    warning: 'bg-[#F59E0B] text-[#251818]',
  };
</script>

<div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
  {#each $toasts as toast}
    {@const variantClass = variants[toast.variant as string]}

    <div
      class={cn(
        'min-w-[300px] max-w-md px-4 py-3 rounded-2xl flex items-center justify-between gap-3',
        'shadow-[0_24px_48px_-4px_rgba(37,24,24,0.12)]',
        'animate-slide-down transition-all duration-150',
        variantClass
      )}
      role="alert"
    >
      <span class="flex-1 text-sm font-medium">{toast.message}</span>
      
      <button
        onclick={() => removeToast(toast.id)}
        class="opacity-75 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  {/each}
</div>

<style>
  @keyframes slide-down {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-down {
    animation: slide-down 150ms ease-out;
  }
</style>
