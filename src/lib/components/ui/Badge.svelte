<script lang="ts">
  import { cn } from '$lib/utils/cn';

  type BadgeVariant = 'pending' | 'submitted' | 'paid' | 'rejected' | 'active' | 'completed' | 'cancelled';

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

  // Social Ledger badges: low-opacity tint background + saturated text.
  const variants = {
    pending:   'bg-[#F59E0B]/15 text-[#92400E]',
    submitted: 'bg-[#3B82F6]/15 text-[#1E40AF]',
    paid:      'bg-[#10B981]/15 text-[#047857]',
    rejected:  'bg-[#EF4444]/15 text-[#991B1B]',
    active:    'bg-[#fff0ef] text-[#ae2f34]',
    completed: 'bg-[#6df5e1]/30 text-[#006b5f]',
    cancelled: 'bg-[#ecd5d3] text-[#584140]',
  };

  const baseClasses = $derived(cn(
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
    variants[variant],
    className
  ));
</script>

<span class={baseClasses} {...props}>
  {@render children()}
</span>
