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
		/** Trigger icon; defaults to the three-dot glyph. */
		icon?: any;
		/** Open above the trigger, for bars pinned to the bottom of the screen. */
		side?: 'bottom' | 'top';
		triggerClass?: string;
		class?: string;
	}

	let { items, label, align = 'right', text, icon, side = 'bottom', triggerClass, class: className }: Props = $props();
	const TriggerIcon = $derived(icon ?? MoreHorizontal);

	const uid = $props.id();
	let open = $state(false);
	let root = $state<HTMLDivElement>();
	let trigger = $state<HTMLButtonElement>();
	let panel = $state<HTMLDivElement>();

	// Popup geometry measured from the trigger, in viewport coordinates. The
	// panel is portal-ed to <body> and fixed-positioned so no ancestor can
	// clip it (list cards' overflow, the receipt's mask + drop-shadow filter)
	// or offset it (transformed wrappers). The viewport clamp keeps the 240px
	// panel on-screen however the trigger's row happens to wrap or align.
	const MENU_WIDTH = 240;
	const MENU_GAP = 6;
	const EDGE = 8;
	let menuX = $state(0);
	let menuY = $state(0);

	function place() {
		const t = trigger;
		if (!t) return;
		const r = t.getBoundingClientRect();
		const vw = document.documentElement.clientWidth;
		const height = panel?.offsetHeight ?? Math.min(items.length * 48 + 12, 288);

		let x = align === 'right' ? r.right - MENU_WIDTH : r.left;
		x = Math.max(EDGE, Math.min(x, vw - MENU_WIDTH - EDGE));

		let y;
		if (side === 'top') {
			// `top` styles the panel's top edge, so subtract its height to keep
			// the panel's bottom 6px above the trigger.
			y = r.top - height - MENU_GAP;
		} else {
			y = r.bottom + MENU_GAP;
			// Flip above when the panel would spill past the bottom edge and
			// there is genuinely more room above the trigger.
			if (y + height > window.innerHeight - EDGE && r.top - height - MENU_GAP > EDGE) {
				y = r.top - height - MENU_GAP;
			}
		}

		menuX = x;
		menuY = y;
	}

	/** Move the rendered panel to <body> so clipping/containing ancestors can't touch it. */
	function portal(node: HTMLDivElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	$effect(() => {
		if (!open) return;
		place();
		// Captured scroll: any scrollable ancestor re-anchors the trigger.
		window.addEventListener('scroll', place, true);
		window.addEventListener('resize', place);
		return () => {
			window.removeEventListener('scroll', place, true);
			window.removeEventListener('resize', place);
		};
	});

	function close(focusTrigger = false) {
		open = false;
		if (focusTrigger) trigger?.focus();
	}

	$effect(() => {
		if (!open) return;
		const first = panel?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])');
		first?.focus();
		const onDoc = (e: MouseEvent) => {
			const target = e.target as Node;
			if (root?.contains(target) || panel?.contains(target)) return;
			close();
		};
		document.addEventListener('click', onDoc);
		return () => document.removeEventListener('click', onDoc);
	});

	function onkeydown(e: KeyboardEvent) {
		if (!open) return;
		const els = [...(panel?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
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
			text ? 'h-9 px-3.5 text-sm font-semibold shadow-[inset_0_0_0_1.5px_var(--color-hairline)]' : 'size-9',
			triggerClass
		)}
	>
		<TriggerIcon size={18} aria-hidden="true" />
		{#if text}<span>{text}</span>{/if}
	</button>
	{#if open}
		<div
			bind:this={panel}
			use:portal
			id="{uid}-menu"
			role="menu"
			aria-label={label}
			tabindex="-1"
			class="fixed z-[60] max-h-72 w-60 overflow-y-auto rounded-card bg-card p-1.5 shadow-pop"
			style:left="{menuX}px"
			style:top="{menuY}px"
			{onkeydown}
			in:fly={{ y: side === 'top' ? 4 : -4, duration: 120 }}
		>
			{#each items as item, i (i)}
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
