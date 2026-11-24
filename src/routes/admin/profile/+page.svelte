<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import { LogOut } from 'lucide-svelte';
	import Seo from '$lib/components/Seo.svelte';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import StatusPill from '$lib/components/ui/StatusPill.svelte';
	import { toast } from '$lib/stores/toast';
	import { adminRoleLabel, formatDay, timeAgo } from '$lib/utils/admin';
	import { formatWhatsappDisplay } from '$lib/utils/phone';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const profile = $derived(data.profile);
	let name = $state(untrack(() => data.profile?.full_name ?? ''));
	let newPassword = $state('');
	let confirm = $state('');
	let renameError = $state('');
	let passwordError = $state('');
	let saving = $state<'rename' | 'password' | null>(null);

	const changed = $derived(name.trim() !== (profile?.full_name ?? ''));
	const needsPassword = $derived(profile?.password_setup_required ?? false);
	const mismatch = $derived(confirm.length > 0 && confirm !== newPassword);

	function submitter(kind: 'rename' | 'password', setError: (m: string) => void, onDone?: () => void): SubmitFunction {
		return () => {
			saving = kind;
			setError('');
			return async ({ result, update }) => {
				saving = null;
				if (result.type === 'success') {
					toast.success(String(result.data?.message ?? 'Saved'));
					onDone?.();
					await update({ reset: false, invalidateAll: true });
				} else if (result.type === 'failure') {
					setError(String(result.data?.error ?? "That didn't save."));
				} else await update();
			};
		};
	}
</script>

<Seo title="Your admin account" noindex />

<AdminHeader title="Your account" />

{#if profile}
	<section class="mt-6 flex items-center gap-4 rounded-sheet bg-mist p-5" aria-label="Signed in as">
		<Avatar size="lg" fullName={profile.full_name} phoneNumber={profile.whatsapp_number} identifier={profile.admin_id} />
		<div class="min-w-0 flex-1">
			<p class="text-heading truncate text-xl">{profile.full_name}</p>
			<p class="text-sm text-ink-soft tabular-nums">{formatWhatsappDisplay(profile.whatsapp_number)}</p>
		</div>
		<StatusPill tone={profile.role === 'super_admin' ? 'review' : 'neutral'} dot={false}>{adminRoleLabel(profile.role)}</StatusPill>
	</section>

	<div class="mt-4 grid gap-4 lg:grid-cols-2">
		<Card>
			<form method="POST" action="?/rename" class="flex flex-col gap-4" novalidate use:enhance={submitter('rename', (m) => (renameError = m))}>
				<h2 class="text-heading text-lg">Name</h2>
				<Input id="admin-name" name="full_name" label="Shown to other admins" bind:value={name} error={!!renameError} errorText={renameError} maxLength={100} />
				<p class="text-[13px] text-ink-soft">Your number is how you sign in, so only a super admin can change it.</p>
				<Button type="submit" variant="ink" size="sm" class="self-start" disabled={!changed} loading={saving === 'rename'}>Save name</Button>
			</form>
		</Card>

		<Card>
			<form
				method="POST"
				action="?/setPassword"
				class="flex flex-col gap-4"
				novalidate
				use:enhance={submitter('password', (m) => (passwordError = m), () => {
					newPassword = '';
					confirm = '';
				})}
			>
				<div class="flex items-center justify-between gap-3">
					<h2 class="text-heading text-lg">Password</h2>
					{#if needsPassword}<StatusPill tone="pending">Not set</StatusPill>{:else}<StatusPill tone="paid">Set</StatusPill>{/if}
				</div>
				<p class="text-sm text-ink-soft">
					{needsPassword
						? 'Set one so you can still sign in when WhatsApp codes stop arriving.'
						: 'A backup for when WhatsApp codes stop arriving. Codes keep working either way.'}
				</p>
				<Input id="new-password" name="new_password" type="password" label="New password" autocomplete="new-password" bind:value={newPassword} helperText="At least 8 characters." />
				<Input
					id="confirm-password"
					name="confirm"
					type="password"
					label="Type it again"
					autocomplete="new-password"
					bind:value={confirm}
					error={mismatch || !!passwordError}
					errorText={mismatch ? "These don't match yet." : passwordError || undefined}
				/>
				<Button type="submit" variant="ink" size="sm" class="self-start" disabled={newPassword.length < 8 || mismatch} loading={saving === 'password'}>
					{needsPassword ? 'Set password' : 'Change password'}
				</Button>
			</form>
		</Card>
	</div>

	<section class="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-card bg-card p-5 shadow-raised" aria-label="Sessions">
		<dl class="flex gap-8 text-sm">
			<div>
				<dt class="text-ink-soft">Admin since</dt>
				<dd class="mt-0.5 font-semibold text-ink">{formatDay(profile.created_at)}</dd>
			</div>
			<div>
				<dt class="text-ink-soft">Last sign-in</dt>
				<dd class="mt-0.5 font-semibold text-ink">{timeAgo(profile.last_login_at)}</dd>
			</div>
		</dl>
		<form method="POST" action="/admin?/logout">
			<Button type="submit" variant="ghost" size="sm" leftIcon={LogOut}>Sign out</Button>
		</form>
	</section>
{/if}
