<script lang="ts">
	import Logo from '$lib/components/layout/Logo.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		children: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<!-- Same card as the host sign-in, on an ink band so nobody mistakes the
     control panel for the app their friends use. -->
<div class="min-h-dvh bg-fog">
	<div class="bg-ink px-4 pt-8 pb-28 sm:px-6">
		<div class="mx-auto flex max-w-md items-center gap-3">
			<Logo size="sm" tone="light" href={null} />
			<span class="rounded-pill bg-card/10 px-2.5 py-1 text-xs font-semibold text-card">Admin</span>
		</div>
	</div>
	<main class="mx-auto -mt-20 max-w-md px-4 pb-12 sm:px-6">
		<div class="rounded-sheet bg-card p-6 shadow-float sm:p-8">
			<h1 class="text-heading text-[28px]">{title}</h1>
			{#if description}<p class="mt-1.5 text-ink-soft">{description}</p>{/if}
			<div class="mt-6">{@render children()}</div>
		</div>
		<p class="mt-5 text-center text-[13px] text-ink-soft">
			Looking for your bills? <a href="/login" class="font-semibold text-ink hover:underline">Sign in to Letpai</a>
		</p>
	</main>
</div>
