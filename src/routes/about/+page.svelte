<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import SharedFooter from '$lib/components/layout/SharedFooter.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { ArtPhone, ArtReceipt, ArtHelmet } from '$lib/components/art';

	const host = [
		['Make a session', 'Name it after the night: "Friday dinner", "Bali villa".'],
		['Add people and what they had', 'Pick from your contacts or type a name and WhatsApp number. Split an item with everyone or only some people.'],
		['Send it', 'Everyone gets one WhatsApp message with their amount and your account.'],
		['Tick them off', 'Approve each transfer screenshot, or send it back with a note.']
	];
	const friend = [
		['Open the link', 'No app, no account. The page shows what they owe and what it is for.'],
		['Transfer and upload', 'Copy your account number, pay from any bank or e-wallet, upload the screenshot.'],
		['Get a confirmation', 'A WhatsApp message when you approve it.']
	];
	const promises = [
		['Your contacts stay yours', 'Letpai only sees the people you add or pick to import, never your whole phone book.'],
		['Friends see only their own bill', 'A payment link shows one person their share, nobody else\'s.'],
		['No spam in your name', 'Reminders to the same person wait at least 24 hours, so nobody gets nagged.'],
		['You stay in control', 'Only you approve a payment. Nobody can change an amount from their link.']
	];
</script>

<Seo title="About" description="Why Letpai exists, how a split works for you and your friends, and what we promise about your data." />

<main class="mx-auto max-w-6xl px-5 sm:px-6">
	<section class="grid gap-10 pt-12 pb-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:pt-20">
		<div>
			<p class="text-eyebrow">About Letpai</p>
			<h1 class="text-poster mt-4 text-[clamp(3rem,8vw,6.5rem)]">Splitting the bill <span class="text-coral">shouldn't cost a friendship.</span></h1>
		</div>
		<div class="relative h-44 lg:h-56" aria-hidden="true">
			<ArtReceipt class="absolute bottom-0 left-4 w-28 -rotate-6 lg:w-32" />
			<ArtPhone class="absolute bottom-2 left-36 w-24 rotate-6 lg:left-44 lg:w-28" />
			<ArtHelmet class="absolute bottom-0 left-56 w-24 lg:left-72 lg:w-32" />
		</div>
	</section>

	<section class="grid gap-8 border-t-[1.5px] border-dashed border-hairline py-14 lg:grid-cols-[0.8fr_1.2fr]">
		<h2 class="text-heading text-3xl">Why we built it</h2>
		<div class="max-w-[62ch] space-y-4 text-lg text-ink-soft">
			<p>
				Somebody always pays for the table. Then come the texts: how much was mine, did that include tax, which account again, I already sent it. The person who was generous ends up doing the admin.
			</p>
			<p>
				Letpai does the maths, sends each friend their exact share on WhatsApp, and keeps the transfer screenshots in one place. Your friends tap a link; they don't install anything.
			</p>
		</div>
	</section>

	<section class="grid gap-10 border-t-[1.5px] border-dashed border-hairline py-14 lg:grid-cols-2 lg:gap-16">
		{#each [['If you paid', host], ['If you got a link', friend]] as [title, steps] (title)}
			<div>
				<h2 class="text-heading text-3xl">{title}</h2>
				<ol class="mt-6 space-y-5">
					{#each steps as [step, body], i (step)}
						<li class="grid grid-cols-[2.25rem_1fr] gap-x-3">
							<span class="text-amount text-2xl text-coral" aria-hidden="true">{i + 1}</span>
							<div>
								<p class="text-lg font-bold">{step}</p>
								<p class="mt-1 text-ink-soft">{body}</p>
							</div>
						</li>
					{/each}
				</ol>
			</div>
		{/each}
	</section>

	<section class="border-t-[1.5px] border-dashed border-hairline py-14">
		<h2 class="text-heading text-3xl">What we promise</h2>
		<dl class="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
			{#each promises as [title, body] (title)}
				<div>
					<dt class="text-lg font-bold">{title}</dt>
					<dd class="mt-1.5 max-w-[46ch] text-ink-soft">{body}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section class="flex flex-wrap items-end justify-between gap-6 rounded-sheet bg-card p-8 shadow-raised sm:p-12">
		<div>
			<h2 class="text-poster text-[clamp(2.25rem,5vw,3.75rem)]">Try it on the next dinner.</h2>
			<p class="mt-3 text-lg text-ink-soft">Free. Your friends never need an account.</p>
		</div>
		<Button href="/register" size="lg">Start a split</Button>
	</section>
</main>

<SharedFooter />
