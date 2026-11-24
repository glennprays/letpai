<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { KeyRound, LogOut, Settings } from 'lucide-svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import AccountGroup from '$lib/components/account/AccountGroup.svelte';
	import AccountRow from '$lib/components/account/AccountRow.svelte';
	import { auth } from '$lib/stores/auth';
	import { updateProfile } from '$lib/services/auth';
	import { toUserMessage } from '$lib/services/api';
	import { signOut } from '$lib/services/sign-out';
	import { toast } from '$lib/stores/toast';
	import { formatWhatsappDisplay } from '$lib/utils/phone';

	// The (app) layout sends people here until they have a name, so the page
	// has two jobs: a one-field welcome step, and the everyday profile.
	// The store fills in on the client; layout data has the cookie user during
	// SSR, so the first paint already shows the right mode.
	const user = $derived($auth.user ?? (page.data.user as typeof $auth.user));
	const initialName = untrack(() => user?.full_name ?? '');
	let saved = $state(initialName);
	let name = $state(initialName);
	const welcome = !initialName;

	let saving = $state(false);
	let error = $state('');

	const changed = $derived(name.trim() !== saved);

	async function save(e: SubmitEvent) {
		e.preventDefault();
		const next = name.trim();
		if (next.length < 2) {
			error = next ? 'Use at least 2 characters.' : 'Enter the name friends know you by.';
			return;
		}
		saving = true;
		error = '';
		try {
			const res = await updateProfile({ full_name: next });
			if (res && 'success' in res && !res.success) throw new Error('message' in res ? String(res.message) : '');
			saved = next;
			name = next;
			if (welcome) {
				await goto('/dashboard', { invalidateAll: true });
				return;
			}
			toast.success('Name updated.');
		} catch (err) {
			error = toUserMessage(err, "We couldn't save your name. Try again.");
		} finally {
			saving = false;
		}
	}
</script>

<Seo title={welcome ? 'Welcome' : 'Profile'} noindex />

{#if welcome}
	<div class="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10 pb-10 sm:px-6 md:pt-16">
		<div>
			<p class="text-eyebrow text-coral-ink">One last thing</p>
			<h1 class="text-poster mt-2 text-4xl sm:text-5xl">What do friends call you?</h1>
			<p class="mt-3 text-ink-soft">Your name goes on every WhatsApp message and payment page, so people know who's asking.</p>
		</div>
		<form class="flex flex-col gap-4 rounded-card bg-card p-5 shadow-raised sm:p-6" onsubmit={save} novalidate>
			<Input
				id="full_name"
				name="full_name"
				label="Your name"
				placeholder="Raka Pratama"
				autocomplete="name"
				bind:value={name}
				error={!!error}
				errorText={error}
				maxLength={100}
				disabled={saving}
			/>
			<Button type="submit" variant="ink" loading={saving} class="w-full">Continue</Button>
		</form>
	</div>
{:else}
	<div class="mx-auto flex max-w-2xl flex-col gap-8 px-4 pt-6 pb-10 sm:px-6 md:pt-10">
		<h1 class="text-poster text-5xl sm:text-6xl">Profile</h1>

		{#if user}
			<section class="flex items-center gap-4 rounded-sheet bg-mist p-5 sm:p-6" aria-label="Signed in as">
				<Avatar size="xl" src={user.avatar_url} fullName={saved || user.full_name} phoneNumber={user.whatsapp_number} identifier={user.user_id} />
				<div class="min-w-0">
					<p class="text-heading truncate text-2xl">{saved || user.full_name}</p>
					<p class="mt-0.5 text-ink-soft tabular-nums">{formatWhatsappDisplay(user.whatsapp_number)}</p>
				</div>
			</section>

			<form class="flex flex-col gap-4 rounded-card bg-card p-5 shadow-raised sm:p-6" onsubmit={save} novalidate>
				<Input
					id="full_name"
					name="full_name"
					label="Name"
					autocomplete="name"
					bind:value={name}
					error={!!error}
					errorText={error}
					helperText="Shown to friends in WhatsApp messages and on payment pages."
					maxLength={100}
					disabled={saving}
				/>
				<div class="flex flex-col gap-1.5">
					<span class="text-sm font-semibold text-ink">WhatsApp number</span>
					<p class="flex h-11 items-center rounded-field bg-fog px-4 font-medium text-ink-soft tabular-nums">{formatWhatsappDisplay(user.whatsapp_number)}</p>
					<p class="text-[13px] text-ink-soft">This is how you sign in, so it can't be changed here.</p>
				</div>
				{#if changed}
					<div class="flex gap-2 sm:justify-end">
						<Button
							type="button"
							variant="ghost"
							class="flex-1 sm:flex-none"
							disabled={saving}
							onclick={() => {
								name = saved;
								error = '';
							}}>Undo</Button
						>
						<Button type="submit" variant="ink" class="flex-1 sm:flex-none" loading={saving}>Save name</Button>
					</div>
				{/if}
			</form>
		{/if}

		<AccountGroup title="More">
			<AccountRow icon={Settings} label="Settings" detail="Reminders, currency and legal" href="/settings" />
			<AccountRow icon={KeyRound} label="Change password" href="/forgot-password" />
			<AccountRow icon={LogOut} label="Sign out" onclick={signOut} danger />
		</AccountGroup>
	</div>
{/if}
