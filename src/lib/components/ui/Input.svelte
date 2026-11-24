<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Eye, EyeOff, X, CircleAlert, CircleCheck } from 'lucide-svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'search' | 'url';
	type InputSize = 'sm' | 'default' | 'lg';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'size' | 'value' | 'class' | 'oninput' | 'onfocus' | 'onblur'> {
		type?: InputType;
		size?: InputSize;
		value?: string;
		error?: boolean;
		success?: boolean;
		class?: string;
		oninput?: (value: string) => void;
		onfocus?: () => void;
		onblur?: () => void;
		onclear?: () => void;
		// lucide-svelte icon component
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
		onclear,
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

	const uid = $props.id();
	const inputId = $derived(id || name || `in-${uid}`);
	const msgId = `${uid}-msg`;
	let showPassword = $state(false);

	const sizes = { sm: 'h-9 text-sm', default: 'h-11 text-[15px]', lg: 'h-13 text-base' };

	const invalid = $derived(error || (!!errorText && error));
	const hasValue = $derived(!!value && value.length > 0);
	const trailing = $derived((type === 'password' ? 1 : 0) + (showClear && hasValue ? 1 : 0));
	const message = $derived(invalid && errorText ? errorText : success && successText ? successText : helperText);

	const classes = $derived(
		cn(
			'w-full rounded-field bg-card font-medium text-ink placeholder:text-ink-soft/70',
			'shadow-[inset_0_0_0_1.5px_var(--color-hairline)] transition-shadow duration-150',
			'hover:shadow-[inset_0_0_0_1.5px_var(--color-ink-soft)]',
			'focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--color-steel)]',
			'disabled:cursor-not-allowed disabled:bg-fog disabled:opacity-60',
			invalid && 'shadow-[inset_0_0_0_2px_var(--color-rejected)] hover:shadow-[inset_0_0_0_2px_var(--color-rejected)]',
			success && !invalid && 'shadow-[inset_0_0_0_2px_var(--color-paid)]',
			leftIcon ? 'pl-11' : 'pl-4',
			trailing === 2 ? 'pr-20' : trailing === 1 ? 'pr-11' : 'pr-4',
			sizes[size],
			className
		)
	);

	function handleInput(e: Event) {
		value = (e.currentTarget as HTMLInputElement).value;
		oninput?.(value);
	}

	function clearInput() {
		value = '';
		oninput?.('');
		onclear?.();
	}

	const LeftIcon = $derived(leftIcon);
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label for={inputId} class="text-sm font-semibold text-ink">{label}</label>
	{/if}

	<div class="relative flex items-center">
		{#if LeftIcon}
			<span class="pointer-events-none absolute left-4 text-ink-soft" aria-hidden="true"><LeftIcon size={18} /></span>
		{/if}

		<input
			type={type === 'password' && showPassword ? 'text' : type}
			id={inputId}
			{name}
			{value}
			{disabled}
			class={classes}
			oninput={handleInput}
			onfocus={() => onfocus?.()}
			onblur={() => onblur?.()}
			maxlength={maxLength}
			aria-invalid={invalid || undefined}
			aria-describedby={message ? msgId : undefined}
			{...props}
		/>

		<div class="absolute right-1.5 flex items-center">
			{#if showClear && hasValue}
				<button
					type="button"
					class="grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-mist hover:text-ink"
					onclick={clearInput}
					aria-label="Clear"
				>
					<X size={16} />
				</button>
			{/if}
			{#if type === 'password'}
				<button
					type="button"
					class="grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-mist hover:text-ink"
					onclick={() => (showPassword = !showPassword)}
					aria-label={showPassword ? 'Hide password' : 'Show password'}
					aria-pressed={showPassword}
				>
					{#if showPassword}<EyeOff size={18} />{:else}<Eye size={18} />{/if}
				</button>
			{/if}
		</div>
	</div>

	{#if message || (showCount && maxLength !== undefined)}
		<div class="flex items-start justify-between gap-3 text-[13px]">
			{#if message}
				<p
					id={msgId}
					class={cn('flex items-start gap-1.5', invalid ? 'text-rejected' : success ? 'text-paid' : 'text-ink-soft')}
					role={invalid ? 'alert' : undefined}
				>
					{#if invalid}<CircleAlert size={15} class="mt-px flex-none" />{:else if success}<CircleCheck size={15} class="mt-px flex-none" />{/if}
					<span>{message}</span>
				</p>
			{:else}<span></span>{/if}
			{#if showCount && maxLength !== undefined}
				<span class={cn('tabular-nums', value.length > maxLength ? 'text-rejected' : 'text-ink-soft')}>{value.length}/{maxLength}</span>
			{/if}
		</div>
	{/if}
</div>
