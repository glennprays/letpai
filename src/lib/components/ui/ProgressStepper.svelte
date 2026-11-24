<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Check } from 'lucide-svelte';

	interface Step {
		id: number;
		label: string;
	}

	interface Props {
		steps: Step[];
		/** 1-based index of the step in progress. */
		currentStep: number;
		class?: string;
	}

	let { steps, currentStep, class: className }: Props = $props();
</script>

<!-- Segmented track: one bar per step, the label under it. Done steps are
     ink, the current one coral, upcoming ones hairline. -->
<ol class={cn('grid gap-2', className)} style="grid-template-columns: repeat({steps.length}, minmax(0, 1fr));">
	{#each steps as step, i (step.id)}
		{@const state = i + 1 < currentStep ? 'done' : i + 1 === currentStep ? 'current' : 'todo'}
		<li aria-current={state === 'current' ? 'step' : undefined}>
			<div
				class={cn(
					'h-1.5 rounded-pill transition-colors duration-200',
					state === 'done' ? 'bg-ink' : state === 'current' ? 'bg-coral' : 'bg-hairline'
				)}
			></div>
			<div class={cn('mt-2 flex items-center gap-1.5 text-[13px] font-semibold', state === 'todo' ? 'text-ink-soft' : 'text-ink')}>
				{#if state === 'done'}<Check size={14} strokeWidth={3} aria-hidden="true" />{:else}<span class="tabular-nums">{i + 1}</span>{/if}
				<span class="truncate">{step.label}</span>
				{#if state === 'done'}<span class="sr-only">(done)</span>{/if}
			</div>
		</li>
	{/each}
</ol>
