<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { MoreHorizontal } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	export interface MenuItem {
		label: string;
		icon?: any;
		onclick?: () => void;
		href?: string;
		danger?: boolean;
		disabled?: boolean;
	}

	interface Props {
		items: MenuItem[];
		/** Accessible name of the trigger, e.g. "More actions for Citra". */
		label: string;
		align?: 'left' | 'right';
		/** Visible trigger text; icon-only when omitted. */
		text?: string;
		class?: string;
	}

	let { items, label, align = 'right', text, class: className }: Props = $props();

	const uid = $props.id();
	let open = $state(false);
	let root = $state<HTMLDivElement>();
	let trigger = $state<HTMLButtonElement>();

	function close(focusTrigger = false) {
		open = false;
		if (focusTrigger) trigger?.focus();
	}

	$effect(() => {
		if (!open) return;
		const first = root?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])');
		first?.focus();
		const onDoc = (e: MouseEvent) => {
			if (root && !root.contains(e.target as Node)) close();
		};
		document.addEventListener('click', onDoc);
		return () => document.removeEventListener('click', onDoc);
	});

	function onkeydown(e: KeyboardEvent) {
		if (!open) return;
		const els = [...(root?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
		const i = els.indexOf(document.activeElement as HTMLElement);
		if (e.key === 'Escape') {
			e.preventDefault();
			close(true);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			els[(i + 1) % els.length]?.focus();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			els[(i - 1 + els.length) % els.length]?.focus();
		} else if (e.key === 'Tab') close();
	}

	function pick(item: MenuItem) {
		if (item.disabled) return;
		close(true);
		item.onclick?.();
	}

	const itemClass = (item: MenuItem) =>
		cn(
			'flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium outline-none transition-colors',
			item.danger ? 'text-rejected hover:bg-rejected-tint focus:bg-rejected-tint' : 'text-ink hover:bg-fog focus:bg-fog',
			item.disabled && 'pointer-events-none opacity-40'
		);
</script>

<div class={cn('relative inline-flex', className)} bind:this={root} {onkeydown} role="presentation">
	<button
		bind:this={trigger}
		type="button"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-controls="{uid}-menu"
		aria-label={text ? undefined : label}
		onclick={(e) => {
			e.stopPropagation();
			open = !open;
		}}
		class={cn(
			'inline-flex items-center justify-center gap-1.5 rounded-pill text-ink-soft transition-colors hover:bg-mist hover:text-ink',
			text ? 'h-9 px-3.5 text-sm font-semibold shadow-[inset_0_0_0_1.5px_var(--color-hairline)]' : 'size-9'
		)}
	>
		<MoreHorizontal size={18} aria-hidden="true" />
		{#if text}<span>{text}</span>{/if}
	</button>
	{#if open}
		<div
			id="{uid}-menu"
			role="menu"
			aria-label={label}
			class={cn('absolute top-[calc(100%+6px)] z-40 w-60 rounded-card bg-card p-1.5 shadow-pop', align === 'right' ? 'right-0' : 'left-0')}
			transition:fly={{ y: -4, duration: 120 }}
		>
			{#each items as item (item.label)}
				{@const Icon = item.icon}
				{#if item.href}
					<a role="menuitem" href={item.href} class={itemClass(item)} aria-disabled={item.disabled || undefined} tabindex="-1" onclick={() => close()}>
						{#if Icon}<Icon size={16} aria-hidden="true" />{/if}{item.label}
					</a>
				{:else}
					<button role="menuitem" type="button" class={itemClass(item)} aria-disabled={item.disabled || undefined} tabindex="-1" onclick={() => pick(item)}>
						{#if Icon}<Icon size={16} aria-hidden="true" />{/if}{item.label}
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>
