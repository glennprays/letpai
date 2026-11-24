<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { CircleAlert, Pause, Play, ShieldCheck, ShieldMinus, Trash2, UserPlus, Users } from 'lucide-svelte';
	import Seo from '$lib/components/Seo.svelte';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Menu, { type MenuItem } from '$lib/components/ui/Menu.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import StatusPill from '$lib/components/ui/StatusPill.svelte';
	import { toast } from '$lib/stores/toast';
	import { adminRoleLabel, formatDay } from '$lib/utils/admin';
	import { formatWhatsappDisplay } from '$lib/utils/phone';
	import type { AdminListItem } from '$lib/services/admin';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// ── Invite ─────────────────────────────────────────────────────────
	let inviteOpen = $state(false);
	let inviting = $state(false);
	let inviteError = $state('');
	let name = $state('');
	let phone = $state('');
	let role = $state<'admin' | 'super_admin'>('admin');
	let withPassword = $state(false);

	function openInvite() {
		name = '';
		phone = '';
		role = 'admin';
		withPassword = false;
		inviteError = '';
		inviteOpen = true;
	}

	const submitInvite: SubmitFunction = () => {
		inviting = true;
		inviteError = '';
		return async ({ result, update }) => {
			inviting = false;
			if (result.type === 'success') {
				inviteOpen = false;
				toast.success(String(result.data?.message ?? 'Admin invited'));
				await update();
			} else if (result.type === 'failure') {
				inviteError = String(result.data?.error ?? "We couldn't invite them.");
			} else {
				await update();
			}
		};
	};

	// ── Row actions: one hidden form, filled in by the menu ────────────
	let actionForm = $state<HTMLFormElement>();
	let action = $state<{ kind: 'update' | 'delete'; admin_id: string; role?: string; is_active?: string } | null>(null);
	let busyId = $state<string | null>(null);
	let removing = $state<AdminListItem | null>(null);

	async function run(next: NonNullable<typeof action>) {
		action = next;
		await tick();
		actionForm?.requestSubmit();
	}

	const submitAction: SubmitFunction = () => {
		busyId = action?.admin_id ?? null;
		return async ({ result, update }) => {
			busyId = null;
			removing = null;
			if (result.type === 'success') toast.success(String(result.data?.message ?? 'Done'));
			else if (result.type === 'failure') toast.error(String(result.data?.error ?? 'That didn’t work. Try again.'));
			await update({ invalidateAll: true });
		};
	};

	function itemsFor(a: AdminListItem): MenuItem[] {
		const isSuper = a.role === 'super_admin';
		return [
			{
				label: isSuper ? 'Make regular admin' : 'Make super admin',
				icon: isSuper ? ShieldMinus : ShieldCheck,
				onclick: () => run({ kind: 'update', admin_id: a.admin_id, role: isSuper ? 'admin' : 'super_admin' })
			},
			{
				label: a.is_active ? 'Pause access' : 'Restore access',
				icon: a.is_active ? Pause : Play,
				onclick: () => run({ kind: 'update', admin_id: a.admin_id, is_active: a.is_active ? 'false' : 'true' })
			},
			{ label: 'Remove', icon: Trash2, danger: true, onclick: () => (removing = a) }
		];
	}

	const admins = $derived(
		[...data.admins].sort((a, b) => Number(b.is_active) - Number(a.is_active) || a.full_name.localeCompare(b.full_name))
	);
</script>

<Seo title="Admins" noindex />

<AdminHeader title="Admins" description="People who can run the gateway and edit templates. Super admins can also manage this list.">
	{#snippet actions()}
		<Button size="sm" variant="ink" leftIcon={UserPlus} onclick={openInvite}>Invite admin</Button>
	{/snippet}
</AdminHeader>

{#snippet pills(a: AdminListItem)}
	{#if !a.is_active}<StatusPill tone="neutral">Paused</StatusPill>{/if}
	<StatusPill tone={a.role === 'super_admin' ? 'review' : 'neutral'} dot={false}>{adminRoleLabel(a.role)}</StatusPill>
{/snippet}

{#if admins.length === 0}
	<EmptyState class="mt-6" icon={Users} title="Couldn't load the team" description="Refresh the page in a moment." />
{:else}
	<ul class="mt-6 divide-y divide-mist overflow-hidden rounded-card bg-card shadow-raised">
		{#each admins as a (a.admin_id)}
			{@const self = a.admin_id === data.profile?.admin_id}
			<li class="flex items-center gap-3 px-4 py-3 sm:px-5" data-testid="admin-row" aria-busy={busyId === a.admin_id}>
				<Avatar size="md" fullName={a.full_name} phoneNumber={a.whatsapp_number} identifier={a.admin_id} class="flex-none" />
				<div class="min-w-0 flex-1">
					<p class="flex items-center gap-2">
						<span class={['truncate font-semibold', a.is_active ? 'text-ink' : 'text-ink-soft']}>{a.full_name}</span>
						{#if self}<span class="flex-none rounded-pill bg-mist px-2 py-0.5 text-[11px] font-semibold text-ink-soft">You</span>{/if}
					</p>
					<p class="mt-0.5 text-sm whitespace-nowrap text-ink-soft tabular-nums">
						{formatWhatsappDisplay(a.whatsapp_number)}<span class="hidden sm:inline"> · joined {formatDay(a.created_at)}</span>
					</p>
					<!-- Mobile: pills go under the name so it isn't squeezed. -->
					<div class="mt-1.5 flex flex-wrap gap-1.5 sm:hidden">{@render pills(a)}</div>
				</div>
				<div class="hidden flex-none items-center gap-2 sm:flex">{@render pills(a)}</div>
				{#if self}
					<!-- Keep the column aligned; nobody demotes or removes themselves. -->
					<span class="size-9 flex-none" aria-hidden="true"></span>
				{:else}
					<Menu items={itemsFor(a)} label="Actions for {a.full_name}" />
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<form method="POST" action={action?.kind === 'delete' ? '?/delete' : '?/update'} use:enhance={submitAction} bind:this={actionForm} class="hidden">
	<input type="hidden" name="admin_id" value={action?.admin_id ?? ''} />
	{#if action?.role}<input type="hidden" name="role" value={action.role} />{/if}
	{#if action?.is_active}<input type="hidden" name="is_active" value={action.is_active} />{/if}
</form>

<ConfirmDialog
	open={!!removing}
	title="Remove {removing?.full_name ?? 'admin'}?"
	message="They lose access straight away. Invite them again if you need them back."
	confirmText="Remove"
	loading={!!busyId}
	onconfirm={() => removing && run({ kind: 'delete', admin_id: removing.admin_id })}
	oncancel={() => (removing = null)}
/>

<Modal bind:open={inviteOpen} title="Invite an admin" description="They sign in with a WhatsApp code sent to this number." busy={inviting}>
	<form method="POST" action="?/create" class="flex flex-col gap-5" use:enhance={submitInvite} novalidate>
		{#if inviteError}
			<p class="flex items-start gap-2 rounded-field bg-rejected-tint px-4 py-3 text-sm font-medium text-rejected" role="alert">
				<CircleAlert size={18} class="mt-px flex-none" aria-hidden="true" />{inviteError}
			</p>
		{/if}
		<Input id="invite-name" name="full_name" label="Name" autocomplete="off" bind:value={name} maxLength={100} />
		<PhoneInput id="invite-phone" label="WhatsApp number" bind:value={phone} />
		<input type="hidden" name="whatsapp_number" value={phone} />
		<Segmented
			label="Role"
			bind:value={role}
			options={[
				{ value: 'admin', label: 'Admin' },
				{ value: 'super_admin', label: 'Super admin' }
			]}
		/>
		<input type="hidden" name="role" value={role} />
		<div class="flex flex-col gap-2">
			<Checkbox bind:checked={withPassword} label="Also set a temporary password" />
			{#if withPassword}
				<input type="hidden" name="set_temp_password" value="on" />
				<Input
					id="invite-password"
					name="password"
					type="password"
					label="Temporary password"
					autocomplete="new-password"
					helperText="For when WhatsApp codes aren't arriving. Share it privately; they'll be asked to change it."
				/>
			{/if}
		</div>
		<div class="flex gap-3 pt-1">
			<Button type="button" variant="ghost" class="flex-1" onclick={() => (inviteOpen = false)} disabled={inviting}>Cancel</Button>
			<Button type="submit" variant="ink" class="flex-1" loading={inviting}>Send invite</Button>
		</div>
	</form>
</Modal>
