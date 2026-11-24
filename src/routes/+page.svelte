<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import SharedFooter from '$lib/components/layout/SharedFooter.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { ArtCoin, ArtSatay, PaidStamp, Receipt } from '$lib/components/art';
	import { ArrowRight } from 'lucide-svelte';

	// Signed-in state comes from the server (cookie), so the CTA is right on
	// first paint instead of flipping after hydration.
	const signedIn = $derived(Boolean(page.data.isAuthenticated));
	const cta = $derived(signedIn ? { label: 'Open Letpai', href: '/dashboard' } : { label: "Start a split, it's free", href: '/register' });

	// Example bill used as the hero's evidence. Same numbers as the fixture
	// session in design/BRIEF.md so the maths is real.
	const items = [
		['Sate kambing ×6', '540.000'],
		['Es teh manis jumbo ×12', '168.000'],
		['Sop buntut ×3', '285.000'],
		['Service 5% · Tax 10%', '153.915']
	];
	const shares = [
		{ name: 'Alya', what: 'Sate, teh, sop', amount: 'Rp 177.870', paid: true },
		{ name: 'Dimas', what: 'Sate, teh, parking', amount: 'Rp 98.145' },
		{ name: 'Gita', what: 'Sate, teh', amount: 'Rp 68.145' }
	];

	const facts = [
		['Any bank or e-wallet', 'BCA, Mandiri, GoPay, OVO: add the accounts you use and friends copy the number in one tap.'],
		['Split by what people had', 'Share an item with everyone or just the three who ordered it. Service charge and tax follow each share.'],
		['Proof, not promises', 'Friends upload their transfer screenshot. You approve it or send it back with a note.'],
		['Reminders that wait', 'One tap sends a polite WhatsApp nudge, and Letpai waits 24 hours before allowing the next one.']
	];
</script>

<Seo image="landing" />

<main>
	<!-- Hero: the promise on the left, a real split receipt as the evidence. -->
	<section class="mx-auto grid max-w-6xl gap-14 px-5 pt-12 pb-10 sm:px-6 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 lg:pt-20">
		<div class="lg:pt-6">
			<h1 class="text-poster text-[clamp(3.4rem,9.4vw,7.25rem)]">
				You paid. <span class="text-coral">They pay you back.</span>
			</h1>
			<p class="mt-7 max-w-[32ch] text-lg text-ink-soft sm:text-xl">
				Send every friend their exact share on WhatsApp, then watch the transfers come in. They don't need an app.
			</p>
			<div class="mt-8 flex flex-wrap items-center gap-3">
				<Button href={cta.href} size="lg" rightIcon={signedIn ? ArrowRight : undefined}>{cta.label}</Button>
				<Button href="#how" variant="secondary" size="lg">See how it works</Button>
			</div>
			<p class="mt-5 text-sm text-ink-soft">Any bank or e-wallet. Service charge and tax split for you.</p>
		</div>

		<div class="relative mx-auto w-full max-w-[400px] lg:mx-0 lg:mt-2">
						<Receipt float tilt={1.5} paperClass="px-6 pt-7 pb-10 sm:px-7">
				<div class="flex items-baseline justify-between text-eyebrow"><span>Sate Khas Senayan</span><span>Fri 21:04</span></div>
				<p class="text-heading mt-2 mb-4 text-[28px]">Friday dinner</p>
				<dl class="space-y-1.5 text-[15px]">
					{#each items as [label, value] (label)}
						<div class="flex justify-between gap-4 {label.startsWith('Service') ? 'text-ink-soft' : ''}">
							<dt>{label}</dt>
							<dd class="font-semibold tabular-nums">{value}</dd>
						</div>
					{/each}
				</dl>
				<div class="my-4 border-t-[1.5px] border-dashed border-hairline"></div>
				<ul class="space-y-3">
					{#each shares as s (s.name)}
						<li class="flex items-center justify-between gap-4">
							<div>
								<p class="flex items-center gap-2 font-bold">{s.name}{#if s.paid}<PaidStamp size="sm" animate class="ml-1" />{/if}</p>
								<p class="text-[13px] text-ink-soft">{s.what}</p>
							</div>
							<p class="text-amount text-lg">{s.amount}</p>
						</li>
					{/each}
				</ul>
				<div class="my-4 border-t-[1.5px] border-dashed border-hairline"></div>
				<div class="flex items-baseline justify-between font-bold"><span>12 people</span><span class="text-amount text-xl">Rp 1.176.915</span></div>
			</Receipt>
			<ArtSatay class="absolute -bottom-10 -left-6 w-32 -rotate-6 sm:-left-24 sm:w-44" />
			<ArtCoin class="absolute -right-2 -bottom-8 w-14 sm:-right-6 sm:w-16" />
		</div>
	</section>

	<!-- How it works: the actual WhatsApp exchange, not a numbered diagram. -->
	<section id="how" class="mx-auto grid max-w-6xl scroll-mt-24 gap-10 px-5 pt-24 pb-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
		<div>
			<h2 class="text-poster text-[clamp(2.6rem,5.4vw,4.25rem)]">This is the whole thing.</h2>
			<p class="mt-5 max-w-[36ch] text-lg text-ink-soft">
				Your friends get one message with their amount and your account. When they transfer, they send the screenshot back through the same link.
			</p>
		</div>
		<div class="flex flex-col gap-2.5 rounded-sheet bg-chat-bg p-4 sm:p-6" aria-label="Example WhatsApp conversation with a friend">
			<span class="self-center rounded-[8px] bg-card/70 px-2.5 py-1 text-xs font-semibold text-ink-soft">Today</span>
			<div class="max-w-[85%] self-start rounded-card rounded-tl-[4px] bg-card px-3.5 pt-2.5 pb-1.5 text-[15px] shadow-raised">
				Hi Gita, your share for <b>Friday dinner</b> is <b>Rp 68.145</b>. Transfer to BCA 5270 1234 88 (Raka Pratama), then upload the proof:
				<span class="font-semibold text-review">letpai.xyz/payment/7KQ2</span>
				<span class="mt-0.5 block text-right text-[11px] text-ink-soft">21:12</span>
			</div>
			<div class="max-w-[85%] self-end rounded-card rounded-tr-[4px] bg-chat-out px-3.5 pt-2.5 pb-1.5 text-[15px] shadow-raised">
				done, sent the screenshot
				<span class="mt-0.5 block text-right text-[11px] text-ink-soft">21:20</span>
			</div>
			<div class="max-w-[85%] self-start rounded-card rounded-tl-[4px] bg-card px-3.5 pt-2.5 pb-1.5 text-[15px] shadow-raised">
				Raka approved your payment for <b>Friday dinner</b>. You're all settled.
				<span class="mt-0.5 block text-right text-[11px] text-ink-soft">21:31</span>
			</div>
			<div class="max-w-[85%] self-end rounded-card rounded-tr-[4px] bg-chat-out px-3.5 pt-2.5 pb-1.5 text-[15px] shadow-raised">
				thanks for booking the table
				<span class="mt-0.5 block text-right text-[11px] text-ink-soft">21:32</span>
			</div>
		</div>
	</section>

	<!-- Details as a ruled list, like lines on a receipt. -->
	<section class="mx-auto max-w-6xl px-5 pt-20 sm:px-6">
		<h2 class="text-heading text-3xl sm:text-4xl">The details people ask about</h2>
		<dl class="mt-8 grid border-t-[1.5px] border-dashed border-hairline sm:grid-cols-2">
			{#each facts as [title, body], i (title)}
				<div class="border-b-[1.5px] border-dashed border-hairline py-6 sm:pr-10 {i % 2 === 1 ? 'sm:pl-10 sm:border-l-[1.5px]' : ''}">
					<dt class="text-lg font-bold">{title}</dt>
					<dd class="mt-1.5 max-w-[46ch] text-ink-soft">{body}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section class="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-8 px-5 pt-24 sm:px-6">
		<h2 class="text-poster max-w-[12ch] text-[clamp(2.8rem,6.4vw,5.25rem)]">Next round's on them.</h2>
		<Button href={cta.href} size="lg">{signedIn ? 'Open Letpai' : 'Start a split'}</Button>
	</section>
</main>

<SharedFooter />
