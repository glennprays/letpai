<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		actions?: Snippet;
	}

	let { title, description, actions }: Props = $props();
</script>

<!-- Admin pages use the heading scale, not the poster: this is a tool,
     read in short bursts, so the content starts higher on the screen. -->
<header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
	<div class="min-w-0">
		<h1 class="text-heading text-3xl">{title}</h1>
		{#if description}<p class="mt-1 max-w-2xl text-ink-soft">{description}</p>{/if}
	</div>
	{#if actions}<div class="flex flex-none items-center gap-2">{@render actions()}</div>{/if}
</header>
