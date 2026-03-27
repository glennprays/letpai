<script lang="ts">
  import { cn } from '$lib/utils/cn';

  type InputType = 'text' | 'email' | 'password' | 'tel' | 'number';
  type InputSize = 'sm' | 'default' | 'lg';

  interface Props {
    type?: InputType;
    size?: InputSize;
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    error?: boolean;
    class?: string;
    name?: string;
    id?: string;
    oninput?: (value: string) => void;
    onfocus?: () => void;
    onblur?: () => void;
  }

  let {
    type = 'text',
    size = 'default',
    placeholder = '',
    disabled = false,
    error = false,
    class: className,
    value = '',
    name,
    id,
    oninput,
    onfocus,
    onblur,
    ...props
  }: Props = $props();

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-4 text-base',
    lg: 'h-12 px-5 text-lg',
  };

  const baseClasses = cn(
    'w-full border-[1.5px] rounded-[12px] font-medium transition-colors duration-150',
    'focus:outline-none focus:border-[#FF6B6B]',
    'placeholder:text-gray-400',
    'font-sans',
    disabled && 'opacity-50 cursor-not-allowed',
    error ? 'border-red-500' : 'border-gray-300',
    sizes[size],
    className
  );

  function handleInput(e: Event) {
    if (oninput) {
      const target = e.target as HTMLInputElement;
      oninput(target.value);
    }
  }
</script>

<input
  type={type}
  {id}
  {name}
  {placeholder}
  value={value}
  disabled={disabled}
  class={baseClasses}
  oninput={handleInput}
  onfocus={onfocus}
  onblur={onblur}
  {...props}
/>
