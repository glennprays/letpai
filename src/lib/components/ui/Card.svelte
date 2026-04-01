<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
    onclick?: () => void;
    children: import('svelte').Snippet;
  }

  let {
    class: className,
    onclick,
    children,
    ...props
  }: Props = $props();

  const baseClasses = cn(
    'bg-white border-2 border-gray-200 rounded-lg p-6',
    'hover:border-[#FF6B6B] transition-colors duration-150',
    onclick && 'cursor-pointer',
    className
  );
</script>

<div class={baseClasses} onclick={onclick} {...props}>
  {@render children()}
</div>
