<script lang="ts">
	import { page } from '$app/state';
	import { buildSeo, type SeoInput } from '$lib/utils/seo';

	let props: SeoInput = $props();
	const seo = $derived(buildSeo(props, page.url.origin, page.url.pathname));
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	{#if seo.noindex}<meta name="robots" content="noindex, nofollow" />{/if}
	<link rel="canonical" href={seo.url} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Letpai" />
	<meta property="og:title" content={seo.ogTitle} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:url" content={seo.url} />
	<meta property="og:image" content={seo.image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={seo.imageAlt} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seo.ogTitle} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={seo.image} />
</svelte:head>
