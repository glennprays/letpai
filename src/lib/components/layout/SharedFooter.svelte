<script lang="ts">
	import Logo from './Logo.svelte';

	const groups = [
		{
			title: 'Product',
			links: [
				{ label: 'How it works', href: '/#how' },
				{ label: 'Start a split', href: '/register' },
				{ label: 'Sign in', href: '/login' }
			]
		},
		{ title: 'Company', links: [{ label: 'About', href: '/about' }] }
	];
	const year = new Date().getFullYear();
</script>

<!-- Calm, light footer on the page canvas, opened by the receipt's dashed
     tear line. -->
<footer class="mt-16 text-ink">
	<div class="mx-auto max-w-6xl px-5 pb-10 sm:px-6">
		<div class="border-t-[1.5px] border-dashed border-hairline pt-10"></div>
		<div class="grid gap-10 sm:grid-cols-[1.6fr_repeat(2,1fr)]">
			<div>
				<Logo size="sm" />
				<p class="mt-3 max-w-[30ch] text-sm text-ink-soft">You paid. They pay you back. Bill splitting with WhatsApp reminders.</p>
			</div>
			{#each groups as g (g.title)}
				<nav aria-label={g.title}>
					<h2 class="text-eyebrow">{g.title}</h2>
					<ul class="mt-3 space-y-2">
						{#each g.links as l (l.href)}
							<li><a href={l.href} class="text-[15px] font-medium text-ink-soft transition-colors hover:text-ink">{l.label}</a></li>
						{/each}
					</ul>
				</nav>
			{/each}
		</div>
		<p class="mt-10 text-[13px] text-ink-soft">© {year} Letpai</p>
	</div>
</footer>
