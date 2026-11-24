<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import { CircleAlert } from 'lucide-svelte';
	import Seo from '$lib/components/Seo.svelte';
	import AdminAuthCard from '$lib/components/admin/AdminAuthCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let phone = $state(untrack(() => form?.whatsapp_number ?? ''));
	let fullName = $state(untrack(() => form?.full_name ?? ''));
	let password = $state('');
	let confirm = $state('');
	let submitting = $state(false);

	const mismatch = $derived(confirm.length > 0 && confirm !== password);
	const error = $derived(form?.error ?? '');
</script>

<Seo title="Set up admin" noindex />

<AdminAuthCard
	title="Create the first admin"
	description="Letpai needs one super admin before anyone can sign in. This page closes for good once that account exists."
>
	{#if error}
		<p class="mb-5 flex items-start gap-2 rounded-field bg-rejected-tint px-4 py-3 text-sm font-medium text-rejected" role="alert">
			<CircleAlert size={18} class="mt-px flex-none" aria-hidden="true" />
			{error}
		</p>
	{/if}

	<form
		method="POST"
		class="flex flex-col gap-5"
		novalidate
		use:enhance={({ cancel }) => {
			if (mismatch) return cancel();
			submitting = true;
			return async ({ update }) => {
				await update({ reset: false });
				submitting = false;
			};
		}}
	>
		<Input id="full_name" name="full_name" label="Your name" autocomplete="name" bind:value={fullName} maxLength={100} />
		<PhoneInput id="whatsapp_number" label="WhatsApp number" bind:value={phone} helperText="Sign-in codes are sent here." />
		<input type="hidden" name="whatsapp_number" value={phone} />
		<Input id="password" name="password" type="password" label="Password" autocomplete="new-password" bind:value={password} helperText="At least 8 characters. Works even when WhatsApp is down." />
		<Input
			id="confirm"
			name="confirm"
			type="password"
			label="Type it again"
			autocomplete="new-password"
			bind:value={confirm}
			error={mismatch}
			errorText={mismatch ? "These don't match yet." : undefined}
		/>
		<Button type="submit" variant="ink" size="lg" loading={submitting} class="w-full">Create super admin</Button>
	</form>
</AdminAuthCard>
