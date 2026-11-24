<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils/cn';
	import SharedFooter from '$lib/components/layout/SharedFooter.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** ISO date the text last changed. */
		updated: string;
		/** One or two sentences: the gist, before the detail. */
		summary: string;
		description: string;
		/** Section ids and titles, in page order, for the contents list. */
		sections: Array<{ id: string; title: string }>;
		children: Snippet;
	}

	let { title, updated, summary, description, sections, children }: Props = $props();

	const updatedLabel = $derived(new Date(updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));

	const policies = [
		{ href: '/tos', label: 'Terms of service' },
		{ href: '/privacy', label: 'Privacy policy' },
		{ href: '/cookies', label: 'Cookies' }
	];
</script>

<Seo {title} {description} />

<!-- An editorial column: a contents list on the left (sticky on desktop),
     the text on the right at a readable measure. -->
<main class="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:px-6 md:pt-14">
	<header class="max-w-2xl">
		<p class="text-eyebrow text-ink-soft">Legal</p>
		<h1 class="text-poster mt-2 text-5xl sm:text-6xl">{title}</h1>
		<p class="mt-3 text-sm text-ink-soft">Last updated <time datetime={updated}>{updatedLabel}</time></p>
		<p class="mt-6 text-lg leading-relaxed text-ink">{summary}</p>
		<p class="mt-5 rounded-card bg-pending-tint px-4 py-3 text-sm text-ink">
			<strong class="text-pending">Draft.</strong> This text is a placeholder until it has been through legal review.
		</p>
	</header>

	<div class="mt-10 grid gap-10 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-14">
		<nav aria-label="On this page" class="md:sticky md:top-24 md:self-start">
			<p class="text-eyebrow mb-3 text-ink-soft">On this page</p>
			<ol class="flex flex-col gap-1 border-l-2 border-mist">
				{#each sections as s, i (s.id)}
					<li>
						<a href="#{s.id}" class="-ml-0.5 block border-l-2 border-transparent py-1 pl-4 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink">
							<span class="tabular-nums">{i + 1}.</span>
							{s.title}
						</a>
					</li>
				{/each}
			</ol>
		</nav>

		<article
			class="max-w-[68ch] text-[17px] leading-[1.7] text-ink [&_code]:rounded-sm [&_code]:bg-mist [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[14px] [&_h2]:text-heading [&_h2]:mb-3 [&_h2]:text-2xl [&_p+p]:mt-4 [&_section]:scroll-mt-24 [&_section+section]:mt-10 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
		>
			{@render children()}
		</article>
	</div>

	<nav aria-label="Other policies" class="mt-16 flex flex-wrap gap-2">
		{#each policies as p (p.href)}
			{@const here = page.url.pathname === p.href}
			<a
				href={p.href}
				aria-current={here ? 'page' : undefined}
				class={cn(
					'inline-flex h-10 items-center rounded-pill px-4 text-sm font-semibold transition-colors',
					here ? 'bg-ink text-card' : 'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--color-hairline)] hover:bg-mist'
				)}
			>
				{p.label}
			</a>
		{/each}
	</nav>
</main>

<SharedFooter />
