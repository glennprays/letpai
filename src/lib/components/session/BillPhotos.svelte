<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Plus, X } from 'lucide-svelte';

	interface Photo {
		bill_image_id: string;
		image_url: string;
		thumbnail_url?: string;
		file_name: string;
	}

	interface Props {
		photos: Photo[];
		max?: number;
		onadd?: (() => void) | null;
		ondelete?: ((id: string) => void) | null;
		title?: string;
	}

	let { photos, max = 5, onadd = null, ondelete = null, title = 'Receipt photos' }: Props = $props();
</script>

<Card padding="sm" class="sm:p-5">
	<div class="flex items-center justify-between gap-3">
		<h2 class="text-eyebrow">{title}</h2>
		{#if onadd && photos.length < max}
			<Button size="sm" variant="ghost" leftIcon={Plus} onclick={onadd} class="-mr-2">Add</Button>
		{/if}
	</div>
	{#if photos.length === 0}
		<p class="mt-3 text-[15px] text-ink-soft">{onadd ? 'Attach the receipt so friends can check the bill themselves.' : 'No photos attached.'}</p>
	{:else}
		<ul class="mt-3 flex flex-wrap gap-2.5">
			{#each photos as img (img.bill_image_id)}
				<li class="group relative">
					<a href={img.image_url} target="_blank" rel="noopener noreferrer" class="block h-24 w-[4.5rem] overflow-hidden rounded-[10px] bg-fog shadow-raised" aria-label="Open {img.file_name}">
						<img src={img.thumbnail_url || img.image_url} alt="" class="size-full object-cover" loading="lazy" />
					</a>
					{#if ondelete}
						<button
							type="button"
							onclick={() => ondelete(img.bill_image_id)}
							class="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-ink text-card shadow-float transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
							aria-label="Remove {img.file_name}"
						>
							<X size={14} />
						</button>
					{/if}
				</li>
			{/each}
		</ul>
		{#if onadd}<p class="mt-2 text-xs text-ink-soft">{photos.length} of {max} · Everyone in the session can see these.</p>{/if}
	{/if}
</Card>
