<script lang="ts">
  import { cn } from '$lib/utils/cn';

  type BadgeVariant = 'pending' | 'submitted' | 'paid' | 'rejected';

  interface Props {
    variant: BadgeVariant;
    class?: string;
    children: import('svelte').Snippet;
  }

  let {
    variant,
    class: className,
    children,
    ...props
  }: Props = $props();

  const variants = {
    pending: 'bg-[#F59E0B] text-gray-900',
    submitted: 'bg-[#3B82F6] text-white',
    paid: 'bg-[#10B981] text-white',
    rejected: 'bg-[#EF4444] text-white',
  };

  const baseClasses = cn(
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase',
    variants[variant],
    className
  );
</script>

<span class={baseClasses} {...props}>
  {@render children()}
</span>
