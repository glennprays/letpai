<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { getAvatarWithFallback, getInitials } from '$lib/utils/avatar';

  interface Props {
    src?: string | null;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    fullName?: string | null;
    phoneNumber?: string | null;
    identifier?: string | null;
    class?: string;
  }

  let {
    src,
    alt = 'Avatar',
    size = 'md',
    fullName,
    phoneNumber,
    identifier,
    class: className,
    ...props
  }: Props = $props();

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl'
  };

  const pixelSizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 96
  };

  const avatarUrl = $derived(
    getAvatarWithFallback(
      src,
      fullName,
      phoneNumber,
      identifier || fullName || phoneNumber,
      pixelSizes[size]
    )
  );

  const initials = $derived(getInitials(fullName, phoneNumber));

  const baseClasses = cn(
    'rounded-full object-cover flex-shrink-0',
    sizes[size],
    className
  );
</script>

<img
  src={avatarUrl}
  alt={alt}
  class={baseClasses}
  {...props}
/>
