<script lang="ts">
  import { cn } from '$lib/utils/cn';

  // Preset group colors from design system
  const GROUP_COLORS = {
    coral: '#FF6B6B',
    teal: '#14B8A6',
    purple: '#A855F7',
    amber: '#F59E0B',
    rose: '#F43F5E',
    sky: '#0EA5E9',
    green: '#10B981',
    orange: '#F97316',
    pink: '#EC4899',
    indigo: '#6366F1'
  } as const;

  type GroupColor = keyof typeof GROUP_COLORS;

  interface Props {
    name: string;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }

  let {
    name,
    color,
    size = 'sm',
    class: className,
    ...props
  }: Props = $props();

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  // Get the actual color value, fallback to coral if not found
  const colorValue = $derived(
    color && color in GROUP_COLORS
      ? GROUP_COLORS[color as GroupColor]
      : color || GROUP_COLORS.coral
  );

  const baseClasses = cn(
    'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
    sizes[size],
    className
  );
</script>

<span
  class={baseClasses}
  style="background-color: {colorValue}15; color: {colorValue};"
  {...props}
>
  <span
    class="w-1.5 h-1.5 rounded-full flex-shrink-0"
    style="background-color: {colorValue};"
  ></span>
  {name}
</span>
