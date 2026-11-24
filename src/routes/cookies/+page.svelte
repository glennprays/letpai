<script lang="ts">
	import LegalPage from '$lib/components/legal/LegalPage.svelte';

	const sections = [
		{ id: 'which', title: 'Which cookies' },
		{ id: 'why', title: 'Why they are needed' },
		{ id: 'manage', title: 'Clearing them' }
	];
</script>

<LegalPage
	title="Cookies"
	updated="2026-05-29"
	description="The few cookies Letpai uses to keep you signed in."
	summary="Letpai sets only the cookies it needs to know you're signed in. No advertising cookies, no third-party trackers."
	{sections}
>
	<section id="which">
		<h2>Which cookies</h2>
		<ul>
			<li><code>token</code> and <code>user</code> keep you signed in to the app.</li>
			<li><code>admin_token</code> does the same for Letpai's own team on the admin panel.</li>
		</ul>
		<p>People opening a payment link don't get any cookies; the link itself is enough.</p>
	</section>

	<section id="why">
		<h2>Why they are needed</h2>
		<p>They let the server know who you are when it builds a page, so your dashboard and sessions load already filled in rather than after a flash of an empty screen.</p>
	</section>

	<section id="manage">
		<h2>Clearing them</h2>
		<p>You can clear Letpai's cookies in your browser settings at any time. That signs you out; you'll be asked to sign in on your next visit.</p>
	</section>
</LegalPage>
