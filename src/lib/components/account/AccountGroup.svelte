<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** Optional sentence under the list, for context that applies to every row. */
		note?: string;
		class?: string;
		children: Snippet;
	}

	let { title, note, class: className, children }: Props = $props();
	const uid = $props.id();
</script>

<section aria-labelledby="{uid}-title" class={cn('flex flex-col gap-2', className)}>
	<h2 id="{uid}-title" class="text-eyebrow px-1 text-ink-soft">{title}</h2>
	<ul class="divide-y divide-mist overflow-hidden rounded-card bg-card shadow-raised">
		{@render children()}
	</ul>
	{#if note}<p class="px-1 text-[13px] text-ink-soft">{note}</p>{/if}
</section>
