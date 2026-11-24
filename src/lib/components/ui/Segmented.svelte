<script lang="ts" generics="T extends string">
	import { cn } from '$lib/utils/cn';

	interface Props {
		options: Array<{ value: T; label: string }>;
		value: T;
		label: string;
		onchange?: (value: T) => void;
		class?: string;
	}

	let { options, value = $bindable(), label, onchange, class: className }: Props = $props();
	const uid = $props.id();
</script>

<!-- A two-to-four way choice that is one decision (e.g. split with everyone
     or specific people). Native radios keep arrow-key behaviour. -->
<fieldset class={cn('flex flex-col gap-1.5', className)}>
	<legend class="mb-1.5 text-sm font-semibold text-ink">{label}</legend>
	<div class="flex rounded-pill bg-mist p-1">
		{#each options as o (o.value)}
			<label class="flex-1">
				<input type="radio" name={uid} value={o.value} bind:group={value} class="peer sr-only" onchange={() => onchange?.(o.value)} />
				<span
					class="flex h-9 cursor-pointer items-center justify-center rounded-pill px-3 text-sm font-semibold text-ink-soft transition-colors peer-checked:bg-card peer-checked:text-ink peer-checked:shadow-raised peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-steel"
				>
					{o.label}
				</span>
			</label>
		{/each}
	</div>
</fieldset>
