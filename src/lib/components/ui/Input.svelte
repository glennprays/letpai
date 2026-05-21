<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Eye, EyeOff, X, AlertCircle, CheckCircle } from 'lucide-svelte';

  type InputType = 'text' | 'email' | 'password' | 'tel' | 'number';
  type InputSize = 'sm' | 'default' | 'lg';

  interface Props {
    type?: InputType;
    size?: InputSize;
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    error?: boolean;
    success?: boolean;
    class?: string;
    name?: string;
    id?: string;
    oninput?: (value: string) => void;
    onfocus?: () => void;
    onblur?: () => void;
    // lucide-svelte icons — broad typing for consumer compatibility.
    leftIcon?: any;
    showClear?: boolean;
    helperText?: string;
    errorText?: string;
    successText?: string;
    showCount?: boolean;
    maxLength?: number;
    label?: string;
  }

  let {
    type = 'text',
    size = 'default',
    placeholder = '',
    disabled = false,
    error = false,
    success = false,
    class: className,
    value = $bindable(''),
    name,
    id,
    oninput,
    onfocus,
    onblur,
    leftIcon,
    showClear = false,
    helperText,
    errorText,
    successText,
    showCount = false,
    maxLength,
    label,
    ...props
  }: Props = $props();

  let showPassword = $state(false);

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    default: 'h-11 px-4 text-[15px]',
    lg: 'h-12 px-5 text-base',
  };

  const baseClasses = $derived(
    cn(
      'w-full rounded-2xl font-medium transition-all duration-200 font-sans',
      'bg-[#f5dddb] text-[#251818] placeholder:text-[#584140]/50',
      'focus:outline-none focus:ring-2 focus:ring-[#ae2f34]/30 focus:bg-[#fbe3e1]',
      disabled && 'opacity-50 cursor-not-allowed',
      error && 'ring-2 ring-[#EF4444]/40 bg-[#EF4444]/10',
      success && 'ring-2 ring-[#10B981]/40 bg-[#10B981]/10',
      sizes[size],
      className
    )
  );

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    if (oninput) {
      oninput(target.value);
    }
  }

  function togglePassword() {
    showPassword = !showPassword;
  }

  function clearInput() {
    value = '';
    if (oninput) {
      oninput('');
    }
  }

  function handleFocus() {
    if (onfocus) onfocus();
  }

  function handleBlur() {
    if (onblur) onblur();
  }

  const hasValue = $derived(value && value.length > 0);
  const LeftIconComp = $derived(leftIcon);
</script>

<div class="flex flex-col gap-1.5">
  {#if label}
    <label
      for={id || name}
      class="block text-[13px] font-semibold text-[#584140] mb-1.5"
    >
      {label}
    </label>
  {/if}

  <div class="relative flex items-center">
    {#if LeftIconComp}
      <div class="absolute left-4 flex items-center justify-center pointer-events-none text-[#584140]">
        <LeftIconComp size={18} />
      </div>
    {/if}

    <input
      type={type === 'password' && showPassword ? 'text' : type}
      {id}
      {name}
      {placeholder}
      value={value}
      disabled={disabled}
      class={baseClasses}
      style="padding-left: {leftIcon ? '48px' : '16px'}; padding-right: {(type === 'password' || showClear) && hasValue ? '96px' : '16px'};"
      oninput={handleInput}
      onfocus={handleFocus}
      onblur={handleBlur}
      maxlength={maxLength}
      {...props}
    />

    {#if type === 'password' && hasValue}
      <button
        type="button"
        class="absolute right-12 flex items-center justify-center p-1 rounded-[10px] text-[#584140] hover:bg-[#fbe3e1] transition-colors"
        onclick={togglePassword}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {#if showPassword}
          <EyeOff size={18} />
        {:else}
          <Eye size={18} />
        {/if}
      </button>
    {/if}

    {#if showClear && hasValue}
      <button
        type="button"
        class="absolute right-4 flex items-center justify-center p-1 rounded-[10px] text-[#584140] hover:bg-[#fbe3e1] transition-colors"
        onclick={clearInput}
        aria-label="Clear input"
      >
        <X size={16} />
      </button>
    {/if}
  </div>

  {#if errorText && error}
    <div class="flex items-center gap-1.5 text-xs mt-1 text-[#EF4444]">
      <AlertCircle size={14} />
      <span>{errorText}</span>
    </div>
  {:else if successText && success}
    <div class="flex items-center gap-1.5 text-xs mt-1 text-[#10B981]">
      <CheckCircle size={14} />
      <span>{successText}</span>
    </div>
  {:else if helperText}
    <div class="flex items-center gap-1.5 text-xs mt-1 text-[#584140]">{helperText}</div>
  {/if}

  {#if showCount && maxLength !== undefined}
    <div class="flex justify-end text-xs mt-1">
      <span class={value.length > maxLength ? 'text-[#EF4444]' : 'text-[#584140]'}>
        {value.length}/{maxLength}
      </span>
    </div>
  {/if}
</div>
