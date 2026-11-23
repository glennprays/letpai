<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Check } from 'lucide-svelte';

	interface Props {
		checked?: boolean;
		disabled?: boolean;
		class?: string;
		onchange?: (checked: boolean) => void;
		id?: string;
		label?: string;
		/** Accessible name when there is no visible label. */
		ariaLabel?: string;
	}

	let {
		checked = $bindable(false),
		disabled = false,
		class: className,
		onchange,
		id,
		label,
		ariaLabel
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `cb-${uid}`);
</script>

<!-- A real <input type="checkbox"> (visually replaced) keeps native keyboard,
     form and screen-reader behaviour; the whole row is a 44px hit target. -->
<label
	for={inputId}
	class={cn(
		'group inline-flex min-h-11 items-center gap-3 select-none',
		disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
		className
	)}
>
	<input
		id={inputId}
		type="checkbox"
		class="peer sr-only"
		bind:checked
		{disabled}
		aria-label={label ? undefined : ariaLabel}
		onchange={() => onchange?.(checked)}
	/>
	<span
		aria-hidden="true"
		class={cn(
			'grid size-[22px] flex-none place-items-center rounded-[7px] transition-colors duration-150',
			'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-steel',
			checked
				? 'bg-ink text-card'
				: 'bg-card shadow-[inset_0_0_0_1.5px_var(--color-hairline)] group-hover:shadow-[inset_0_0_0_1.5px_var(--color-ink-soft)]'
		)}
	>
		{#if checked}<Check size={14} strokeWidth={3} />{/if}
	</span>
	{#if label}<span class="text-sm font-medium text-ink">{label}</span>{/if}
</label>
