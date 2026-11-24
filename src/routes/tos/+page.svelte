<script lang="ts">
	import LegalPage from '$lib/components/legal/LegalPage.svelte';

	const sections = [
		{ id: 'acceptance', title: 'Agreeing to these terms' },
		{ id: 'use', title: 'What Letpai is for' },
		{ id: 'messages', title: 'Messages we send for you' },
		{ id: 'accounts', title: 'Your account' },
		{ id: 'money', title: 'Money stays between you' },
		{ id: 'liability', title: 'Liability' },
		{ id: 'changes', title: 'Changes' }
	];
</script>

<LegalPage
	title="Terms of service"
	updated="2026-05-29"
	description="The terms for using Letpai to split bills and collect payments over WhatsApp."
	summary="Use Letpai to split real bills with people who expect to hear from you. Keep your password to yourself. Letpai keeps track of who paid; it never holds or moves your money."
	{sections}
>
	<section id="acceptance">
		<h2>Agreeing to these terms</h2>
		<p>By creating an account or using Letpai you agree to these terms. If you don't agree, please don't use the service.</p>
	</section>

	<section id="use">
		<h2>What Letpai is for</h2>
		<p>Letpai helps you split a bill, send each person their share, and keep track of who has paid. Use it only for that, and within the law.</p>
	</section>

	<section id="messages">
		<h2>Messages we send for you</h2>
		<p>
			When you share a session or send a reminder, Letpai messages the people you added on WhatsApp. Only add people who know you and expect to
			hear about the bill. Follow WhatsApp's rules for those messages; repeated reminders are limited to one a day per person for this reason.
		</p>
	</section>

	<section id="accounts">
		<h2>Your account</h2>
		<p>You're responsible for keeping your password safe and for what happens under your account. Tell us straight away if you think someone else has signed in.</p>
	</section>

	<section id="money">
		<h2>Money stays between you</h2>
		<p>
			Payments go directly from each person to you, by bank transfer or e-wallet. Letpai never holds, moves or guarantees money. A
			<strong>Paid</strong> mark means you approved their proof, not that Letpai checked the transfer.
		</p>
	</section>

	<section id="liability">
		<h2>Liability</h2>
		<p>
			Letpai is provided "as is". We don't promise it will always be available or free of errors. As far as the law allows, we aren't liable
			for indirect or consequential losses from using it.
		</p>
	</section>

	<section id="changes">
		<h2>Changes</h2>
		<p>We may update these terms. We'll tell you about important changes in the app or on WhatsApp. Using Letpai after a change means you accept it.</p>
	</section>
</LegalPage>
