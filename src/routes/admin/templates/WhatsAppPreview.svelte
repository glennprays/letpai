<script lang="ts">
	import { whatsappRuns } from './samples';

	interface Props {
		text: string;
		label?: string;
	}

	let { text, label = 'Preview' }: Props = $props();
	const runs = $derived(whatsappRuns(text));
</script>

<!-- How the recipient sees it: an incoming bubble on the chat wallpaper. -->
<figure class="rounded-card bg-chat-bg p-3 sm:p-4" aria-label={label}>
	<div class="max-w-[34ch] rounded-[4px_14px_14px_14px] bg-card px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap text-ink shadow-raised [overflow-wrap:anywhere]">
		{#each runs as r, i (i)}{#if r.bold}<strong>{r.text}</strong>{:else}{r.text}{/if}{/each}
	</div>
</figure>
