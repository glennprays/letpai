<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Loader2 } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	// primary   coral fill: the one highest-intent action on a screen
	// ink       navy fill: strong secondary actions (Approve, Send again)
	// secondary outlined pill: neutral alternatives (Cancel, Edit)
	// ghost     text only: low-emphasis actions inside lists
	// destructive / danger  red fill for irreversible actions
	// whatsapp  WhatsApp-branded send action
	type ButtonVariant = 'primary' | 'ink' | 'secondary' | 'ghost' | 'destructive' | 'danger' | 'whatsapp';
	type ButtonSize = 'sm' | 'default' | 'lg';

	interface Props extends Omit<HTMLButtonAttributes, 'class' | 'children' | 'onclick'> {
		variant?: ButtonVariant;
		size?: ButtonSize;
		disabled?: boolean;
		loading?: boolean;
		class?: string;
		type?: 'button' | 'submit' | 'reset';
		/** Render as a link instead of a button. */
		href?: string;
		onclick?: (event: MouseEvent) => void;
		// lucide-svelte icons are class components; typed loosely for both call styles.
		leftIcon?: any;
		rightIcon?: any;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'default',
		disabled = false,
		loading = false,
		type = 'button',
		href,
		class: className,
		onclick,
		leftIcon,
		rightIcon,
		children,
		...props
	}: Props = $props();

	const variants: Record<ButtonVariant, string> = {
		primary: 'bg-coral text-card hover:bg-coral-hover',
		ink: 'bg-ink text-card hover:bg-ink-hover',
		secondary: 'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--color-hairline)] hover:bg-fog',
		ghost: 'bg-transparent text-ink hover:bg-mist',
		destructive: 'bg-rejected text-card hover:brightness-110',
		danger: 'bg-rejected text-card hover:brightness-110',
		whatsapp: 'bg-whatsapp text-card hover:bg-whatsapp-hover'
	};

	const sizes: Record<ButtonSize, string> = {
		sm: 'h-9 px-4 text-sm gap-1.5',
		default: 'h-11 px-5 text-[15px] gap-2',
		lg: 'h-13 px-7 text-base gap-2'
	};
	const iconSize = $derived(size === 'sm' ? 16 : 18);
	const inactive = $derived(disabled || loading);

	const classes = $derived(
		cn(
			'relative inline-flex items-center justify-center rounded-pill font-semibold whitespace-nowrap select-none',
			'transition-[background-color,box-shadow,transform,filter] duration-150 active:scale-[0.98]',
			'disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none',
			variants[variant],
			sizes[size],
			className
		)
	);

	// Guard in JS too: a link can't be `disabled`, and callers must never get
	// a click while a request is still in flight.
	function handleClick(event: MouseEvent) {
		if (inactive) {
			event.preventDefault();
			return;
		}
		onclick?.(event);
	}
</script>

{#snippet content()}
	{#if loading}
		<Loader2 class="animate-spin" size={iconSize} aria-hidden="true" />
		<span class="sr-only">Working…</span>
	{:else if leftIcon}
		{@const LeftIcon = leftIcon}
		<LeftIcon size={iconSize} aria-hidden="true" />
	{/if}
	{@render children()}
	{#if rightIcon && !loading}
		{@const RightIcon = rightIcon}
		<RightIcon size={iconSize} aria-hidden="true" />
	{/if}
{/snippet}

{#if href}
	<a
		href={inactive ? undefined : href}
		class={classes}
		aria-disabled={inactive || undefined}
		aria-busy={loading || undefined}
		onclick={handleClick}
		{...props as Record<string, unknown>}
	>
		{@render content()}
	</a>
{:else}
	<button
		{type}
		disabled={inactive}
		aria-busy={loading || undefined}
		class={classes}
		onclick={handleClick}
		{...props}
	>
		{@render content()}
	</button>
{/if}
