<script lang="ts">
	import { ArtReceipt, ArtSatay, ArtCoin } from '$lib/components/art';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!-- Desktop: the promise on the left, the form on the right. Mobile: only the
     form, so the keyboard never pushes the fields off screen. -->
<div class="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-6xl items-center gap-12 px-4 pt-6 pb-12 sm:px-6 lg:grid-cols-[1fr_440px] lg:gap-20 lg:pt-10">
	<section class="relative hidden lg:block" aria-hidden="true">
		<p class="text-poster max-w-[11ch] text-[88px]">Get it back, <span class="text-coral">without the awkward texts.</span></p>
		<div class="relative mt-12 h-48">
			<ArtReceipt class="absolute top-0 left-6 w-32 -rotate-6" />
			<ArtSatay class="absolute top-20 left-40 w-48 rotate-3" />
			<ArtCoin class="absolute top-4 left-[22rem] w-20" />
		</div>
	</section>

	<main class="mx-auto w-full max-w-[440px]">
		<div class="rounded-sheet bg-card p-6 shadow-float sm:p-8">
			{@render children()}
		</div>
		<p class="mt-5 text-center text-[13px] text-ink-soft">
			<a href="/tos" class="hover:text-ink">Terms</a>
			<span class="mx-2" aria-hidden="true">·</span>
			<a href="/privacy" class="hover:text-ink">Privacy</a>
			<span class="mx-2" aria-hidden="true">·</span>
			<a href="/cookies" class="hover:text-ink">Cookies</a>
		</p>
	</main>
</div>
