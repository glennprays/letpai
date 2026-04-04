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
      'w-full border-[1.5px] rounded-[12px] font-medium transition-all duration-150 font-sans',
      'placeholder:text-gray-400',
      disabled && 'opacity-50 cursor-not-allowed',
      error
        ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
        : 'border-gray-300 focus:border-[#FF6B6B] focus:shadow-[0_0_0_3px_rgba(255,107,107,0.12)]',
      success && 'border-green-500 focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]',
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
</script>

<div class="input-wrapper">
  {#if label}
    <label
      for={id || name}
      style="
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 6px;
      "
    >
      {label}
    </label>
  {/if}

  <div class="input-container">
    {#if leftIcon}
      <div class="input-left-icon">
        <svelte:component this={leftIcon} size={18} style="color: #9CA3AF;" />
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
        class="input-right-icon password-toggle"
        onclick={togglePassword}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {#if showPassword}
          <EyeOff size={18} style="color: #6B7280;" />
        {:else}
          <Eye size={18} style="color: #6B7280;" />
        {/if}
      </button>
    {/if}

    {#if showClear && hasValue}
      <button
        type="button"
        class="input-right-icon clear-button"
        onclick={clearInput}
        aria-label="Clear input"
      >
        <X size={16} style="color: #9CA3AF;" />
      </button>
    {/if}
  </div>

  {#if errorText && error}
    <div class="input-error">
      <AlertCircle size={14} />
      <span>{errorText}</span>
    </div>
  {:else if successText && success}
    <div class="input-success">
      <CheckCircle size={14} />
      <span>{successText}</span>
    </div>
  {:else if helperText}
    <div class="input-helper">{helperText}</div>
  {/if}

  {#if showCount && maxLength !== undefined}
    <div class="input-count">
      <span style="color: {value.length > maxLength ? '#EF4444' : '#9CA3AF'};">
        {value.length}/{maxLength}
      </span>
    </div>
  {/if}
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-left-icon {
    position: absolute;
    left: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .input-right-icon {
    position: absolute;
    right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    transition: all 0.15s;
    border-radius: 8px;
  }

  .input-right-icon:hover {
    background: #F3F4F6;
  }

  .input-right-icon.password-toggle {
    right: 48px;
  }

  .clear-button {
    right: 16px;
  }

  .input-error,
  .input-success,
  .input-helper,
  .input-count {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    margin-top: 4px;
  }

  .input-error {
    color: #EF4444;
  }

  .input-success {
    color: #10B981;
  }

  .input-helper {
    color: #9CA3AF;
  }

  .input-count {
    justify-content: flex-end;
  }

  input:focus {
    outline: none;
  }

  input::placeholder {
    color: #9CA3AF;
  }
</style>
