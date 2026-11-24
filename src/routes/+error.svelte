<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeft, RefreshCw } from 'lucide-svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { ArtReceipt, ArtHelmet } from '$lib/components/art';

	const status = $derived(page.status);
	const signedIn = $derived(!!page.data?.isAuthenticated);
	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));
	const home = $derived(isAdmin ? '/admin' : signedIn ? '/dashboard' : '/');
	const homeLabel = $derived(isAdmin ? 'Admin overview' : signedIn ? 'Go to dashboard' : 'Go to Letpai');

	const copy = $derived.by(() => {
		if (status === 404)
			return {
				title: "This page isn't here",
				body: page.url.pathname.startsWith('/payment/')
					? 'The payment link may have a typo, or the host cancelled the session. Ask them to send it again.'
					: 'The link may be old or mistyped.'
			};
		if (status === 403) return { title: "You can't open this", body: page.error?.message || 'Your account doesn’t have access to this page.' };
		if (status >= 500) return { title: 'Something broke on our side', body: "It isn't you. Try again in a moment." };
		return { title: 'Something went wrong', body: page.error?.message || 'Try again, or head back.' };
	});
</script>

<Seo title={copy.title} noindex />

<main class="mx-auto grid min-h-[70dvh] max-w-4xl content-center items-center gap-6 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] md:gap-16">
	<div>
		<p class="text-eyebrow text-coral-ink">Error {status}</p>
		<h1 class="text-poster mt-3 max-w-[14ch] text-5xl sm:text-6xl">{copy.title}</h1>
		<p class="mt-4 max-w-md text-lg text-ink-soft">{copy.body}</p>
		<div class="mt-8 flex flex-wrap gap-3">
			{#if status >= 500}
				<Button variant="ink" leftIcon={RefreshCw} onclick={() => location.reload()}>Try again</Button>
				<Button variant="secondary" href={home}>{homeLabel}</Button>
			{:else}
				<Button variant="ink" href={home}>{homeLabel}</Button>
				<Button variant="ghost" leftIcon={ArrowLeft} onclick={() => history.back()}>Go back</Button>
			{/if}
		</div>
	</div>
	<div class="order-first justify-self-start md:order-none md:justify-self-center" aria-hidden="true">
		{#if status >= 500}
			<ArtHelmet class="w-24 md:w-48" />
		{:else}
			<ArtReceipt class="w-20 -rotate-6 md:w-44" />
		{/if}
	</div>
</main>
