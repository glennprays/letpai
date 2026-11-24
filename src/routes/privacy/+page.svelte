<script lang="ts">
	import LegalPage from '$lib/components/legal/LegalPage.svelte';

	const sections = [
		{ id: 'collect', title: 'What we collect' },
		{ id: 'use', title: 'How we use it' },
		{ id: 'who-sees', title: 'Who sees what' },
		{ id: 'keep', title: 'How long we keep it' },
		{ id: 'rights', title: 'Your choices' }
	];
</script>

<LegalPage
	title="Privacy policy"
	updated="2026-05-29"
	description="What Letpai collects, who sees it, and how to have it removed."
	summary="We keep what's needed to split a bill and chase it: names, WhatsApp numbers, amounts and payment proofs. We don't sell any of it, and we don't use advertising trackers."
	{sections}
>
	<section id="collect">
		<h2>What we collect</h2>
		<ul>
			<li>Your name, WhatsApp number and password (stored hashed).</li>
			<li>Contacts you save: their names, numbers and any note you add.</li>
			<li>Sessions: bill items, amounts, who owes what, and payment status.</li>
			<li>Payment proofs that people upload, and the bank or e-wallet details you show them.</li>
		</ul>
	</section>

	<section id="use">
		<h2>How we use it</h2>
		<p>Only to run Letpai: showing you your sessions, messaging the people you add, and keeping a record of who has paid. We do not sell your data.</p>
	</section>

	<section id="who-sees">
		<h2>Who sees what</h2>
		<p>
			Someone you add to a session sees your name, the bill, their own share and the payment details you chose to show. They don't see your
			other contacts or other people's proofs. Messages are delivered through our WhatsApp gateway provider. We share data with no one else
			unless the law requires it.
		</p>
	</section>

	<section id="keep">
		<h2>How long we keep it</h2>
		<p>Sessions and proofs stay so you and your friends can look back at them. Deleting a contact removes them from your list; past sessions still show their name and share.</p>
	</section>

	<section id="rights">
		<h2>Your choices</h2>
		<p>You can edit your name and contacts any time in the app. To get a copy of your data or have your account deleted, contact the Letpai team and we'll take care of it.</p>
	</section>
</LegalPage>
