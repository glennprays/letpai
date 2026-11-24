<script lang="ts" generics="T extends string">
	import { cn } from '$lib/utils/cn';

	interface Tab {
		value: T;
		label: string;
		icon?: any;
		count?: number;
		disabled?: boolean;
	}

	interface Props {
		tabs: Tab[];
		value?: T;
		class?: string;
		/** Accessible name for the group, e.g. "Filter sessions". */
		label?: string;
		onchange?: (value: T) => void;
	}

	let { tabs, value = $bindable(tabs[0]?.value), class: className, label = 'Filter', onchange }: Props = $props();

	// Pill filter, not a tab panel: it narrows one list in place, so it is a
	// radio-style group (aria-pressed buttons) rather than role="tablist".
	function select(tab: Tab) {
		if (tab.disabled) return;
		value = tab.value;
		onchange?.(tab.value);
	}
</script>

<div
	class={cn('-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)}
	role="group"
	aria-label={label}
>
	{#each tabs as tab (tab.value)}
		{@const on = value === tab.value}
		<button
			type="button"
			aria-pressed={on}
			disabled={tab.disabled}
			onclick={() => select(tab)}
			class={cn(
				'inline-flex h-9 flex-none items-center gap-2 rounded-pill px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-150',
				on ? 'bg-ink text-card' : 'bg-card text-ink-soft shadow-raised hover:text-ink',
				tab.disabled && 'opacity-50'
			)}
		>
			{#if tab.icon}
				{@const TabIcon = tab.icon}
				<TabIcon size={16} aria-hidden="true" />
			{/if}
			<span>{tab.label}</span>
			{#if tab.count !== undefined}
				<span class={cn('min-w-5 rounded-pill px-1.5 text-xs tabular-nums', on ? 'bg-card/20 text-card' : 'bg-mist text-ink-soft')}>
					{tab.count}
				</span>
			{/if}
		</button>
	{/each}
</div>
