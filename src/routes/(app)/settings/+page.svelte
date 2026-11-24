<script lang="ts">
	import { BellRing, CircleUserRound, Coins, Cookie, FileText, KeyRound, LogOut, ShieldCheck } from 'lucide-svelte';
	import Seo from '$lib/components/Seo.svelte';
	import AccountGroup from '$lib/components/account/AccountGroup.svelte';
	import AccountRow from '$lib/components/account/AccountRow.svelte';
	import { auth } from '$lib/stores/auth';
	import { signOut } from '$lib/services/sign-out';
</script>

<Seo title="Settings" noindex />

<div class="mx-auto flex max-w-2xl flex-col gap-8 px-4 pt-6 pb-10 sm:px-6 md:pt-10">
	<h1 class="text-poster text-5xl sm:text-6xl">Settings</h1>

	<AccountGroup title="Account">
		<AccountRow
			icon={CircleUserRound}
			label="Profile"
			detail={$auth.user?.full_name || 'Add your name'}
			href="/profile"
		/>
		<AccountRow icon={KeyRound} label="Change password" detail="We'll send a code to your WhatsApp." href="/forgot-password" />
	</AccountGroup>

	<!-- Facts about how Letpai behaves today. Read-only until the backend
	     exposes preferences; no toggles that don't do anything. -->
	<AccountGroup title="How Letpai works for you" note="These are fixed for now. Tell us if you need them changed.">
		<AccountRow icon={BellRing} label="Reminders" detail="You send them. Each person gets at most one a day." />
		<AccountRow icon={Coins} label="Currency" detail="Used for every session and payment link." value="IDR" />
	</AccountGroup>

	<AccountGroup title="Legal">
		<AccountRow icon={FileText} label="Terms of service" href="/tos" />
		<AccountRow icon={ShieldCheck} label="Privacy policy" href="/privacy" />
		<AccountRow icon={Cookie} label="Cookies" href="/cookies" />
	</AccountGroup>

	<AccountGroup title="This device">
		<AccountRow icon={LogOut} label="Sign out" detail="You'll need your number and password to come back." onclick={signOut} danger />
	</AccountGroup>
</div>
