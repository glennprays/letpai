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
    'bg-white rounded-3xl p-6 transition-all duration-200',
    'shadow-[0_1px_3px_rgba(37,24,24,0.04)]',
    onclick && 'cursor-pointer hover:bg-[#fff0ef] hover:shadow-[0_4px_12px_rgba(37,24,24,0.06)]',
    className
  );
</script>

<div class={baseClasses} onclick={onclick} {...props}>
  {@render children()}
</div>
