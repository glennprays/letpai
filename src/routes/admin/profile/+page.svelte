<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import {
		User,
		KeyRound,
		Save,
		CheckCircle2,
		AlertCircle,
		Calendar,
		Clock,
		LogOut
	} from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// `data.profile` is provided by the layout server load. We seed the
	// editable input from it via $effect (touching `data` lazily inside
	// $state would only capture the initial snapshot, per svelte-check).
	let nameInput = $state('');
	$effect(() => {
		nameInput = data.profile?.full_name ?? '';
	});

	const renameForm = $derived(form && form.kind === 'rename' ? form : null);
	const passwordForm = $derived(form && form.kind === 'setPassword' ? form : null);

	const passwordSetupRequired = $derived(
		(data.profile as { password_setup_required?: boolean } | null)?.password_setup_required ?? false
	);

	function formatAbsolute(iso?: string): string {
		if (!iso) return '—';
		const t = new Date(iso).getTime();
		if (Number.isNaN(t)) return '—';
		return new Date(t).toLocaleString();
	}

	function roleLabel(role?: string): string {
		if (role === 'super_admin') return 'Super admin';
		if (role === 'admin') return 'Admin';
		return role ?? '—';
	}
</script>

<svelte:head>
	<title>Your profile · Admin</title>
</svelte:head>

<div class="px-6 py-10 max-w-3xl mx-auto" style="font-family:'Plus Jakarta Sans',sans-serif;">
	<header class="mb-8">
		<p class="text-xs uppercase tracking-wide font-semibold text-[#584140] mb-1">Profile</p>
		<h1 class="text-3xl font-bold text-[#251818]">Your account</h1>
		<p class="text-sm text-[#584140] mt-1">
			Manage your display name and sign-in options.
		</p>
	</header>

	<!-- Identity card -->
	<section class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] p-6 mb-6">
		<div class="flex items-center gap-2 mb-1">
			<User size={18} class="text-[#ae2f34]" />
			<h2 class="text-lg font-semibold text-[#251818]">Identity</h2>
		</div>
		<p class="text-sm text-[#584140] mb-4">
			The WhatsApp number is locked to keep your sign-in identifier stable. Ask a super admin if
			it needs to change.
		</p>

		<form
			method="POST"
			action="?/rename"
			class="space-y-4"
			use:enhance={() => {
				return async ({ update, result }) => {
					await update({ reset: false });
					if (result.type === 'success') await invalidateAll();
				};
			}}
		>
			<div class="grid sm:grid-cols-2 gap-4">
				<div>
					<label for="whatsapp_number" class="block text-xs font-semibold text-[#584140] mb-1.5"
						>WhatsApp number</label
					>
					<input
						id="whatsapp_number"
						type="text"
						value={'+' + (data.profile?.whatsapp_number ?? '')}
						readonly
						class="w-full px-4 py-3 bg-[#fff0ef] rounded-2xl text-sm text-[#584140] cursor-not-allowed"
					/>
				</div>
				<div>
					<label for="role" class="block text-xs font-semibold text-[#584140] mb-1.5">Role</label>
					<input
						id="role"
						type="text"
						value={roleLabel(data.profile?.role)}
						readonly
						class="w-full px-4 py-3 bg-[#fff0ef] rounded-2xl text-sm text-[#584140] cursor-not-allowed"
					/>
				</div>
			</div>

			<div>
				<label for="full_name" class="block text-xs font-semibold text-[#584140] mb-1.5"
					>Full name</label
				>
				<input
					id="full_name"
					name="full_name"
					type="text"
					bind:value={nameInput}
					minlength="2"
					maxlength="100"
					required
					class="w-full px-4 py-3 bg-[#fff0ef] rounded-2xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#ae2f34]/30"
				/>
			</div>

			{#if renameForm?.error}
				<div class="flex items-start gap-2 text-sm text-[#EF4444]">
					<AlertCircle size={14} class="mt-0.5" /> {renameForm.error}
				</div>
			{:else if renameForm?.success}
				<div class="flex items-start gap-2 text-sm text-[#047857]">
					<CheckCircle2 size={14} class="mt-0.5" /> {renameForm.message ?? 'Saved'}
				</div>
			{/if}

			<button
				type="submit"
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] hover:opacity-95 transition-all"
			>
				<Save size={14} /> Save changes
			</button>
		</form>
	</section>

	<!-- Password card -->
	<section class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] p-6 mb-6">
		<div class="flex items-center justify-between gap-3 mb-1">
			<div class="flex items-center gap-2">
				<KeyRound size={18} class="text-[#ae2f34]" />
				<h2 class="text-lg font-semibold text-[#251818]">Sign-in password</h2>
			</div>
			{#if passwordSetupRequired}
				<span
					class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-[#92400E] bg-[#F59E0B]/15"
				>
					Not set
				</span>
			{:else}
				<span
					class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-[#047857] bg-[#10B981]/15"
				>
					<CheckCircle2 size={12} /> Set
				</span>
			{/if}
		</div>
		<p class="text-sm text-[#584140] mb-4">
			{passwordSetupRequired
				? 'Set a password as a backup sign-in method for when the WhatsApp gateway is unavailable.'
				: 'Change your password. You can keep using WhatsApp codes either way.'}
		</p>

		<form
			method="POST"
			action="?/setPassword"
			class="space-y-3"
			use:enhance={() => {
				return async ({ update, result }) => {
					await update({ reset: true });
					if (result.type === 'success') await invalidateAll();
				};
			}}
		>
			<div>
				<label for="new_password" class="block text-xs font-semibold text-[#584140] mb-1.5"
					>{passwordSetupRequired ? 'New password' : 'New password'}</label
				>
				<input
					id="new_password"
					name="new_password"
					type="password"
					autocomplete="new-password"
					minlength="8"
					maxlength="100"
					required
					class="w-full px-4 py-3 bg-[#fff0ef] rounded-2xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#ae2f34]/30 font-mono"
				/>
			</div>
			<div>
				<label for="confirm" class="block text-xs font-semibold text-[#584140] mb-1.5"
					>Confirm</label
				>
				<input
					id="confirm"
					name="confirm"
					type="password"
					autocomplete="new-password"
					minlength="8"
					maxlength="100"
					required
					class="w-full px-4 py-3 bg-[#fff0ef] rounded-2xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#ae2f34]/30 font-mono"
				/>
			</div>

			{#if passwordForm?.error}
				<div class="flex items-start gap-2 text-sm text-[#EF4444]">
					<AlertCircle size={14} class="mt-0.5" /> {passwordForm.error}
				</div>
			{:else if passwordForm?.success}
				<div class="flex items-start gap-2 text-sm text-[#047857]">
					<CheckCircle2 size={14} class="mt-0.5" /> {passwordForm.message ?? 'Saved'}
				</div>
			{/if}

			<button
				type="submit"
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] hover:opacity-95 transition-all"
			>
				<Save size={14} />
				{passwordSetupRequired ? 'Save password' : 'Update password'}
			</button>
		</form>
	</section>

	<!-- Account card -->
	<section class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] p-6">
		<h2 class="text-lg font-semibold text-[#251818] mb-3">Account</h2>
		<dl class="grid sm:grid-cols-2 gap-3 text-sm">
			<div class="flex items-start gap-2">
				<Calendar size={16} class="text-[#584140] mt-0.5" />
				<div>
					<dt class="text-xs text-[#584140]">Joined</dt>
					<dd class="text-[#251818] font-medium">{formatAbsolute(data.profile?.created_at)}</dd>
				</div>
			</div>
			<div class="flex items-start gap-2">
				<Clock size={16} class="text-[#584140] mt-0.5" />
				<div>
					<dt class="text-xs text-[#584140]">Last sign-in</dt>
					<dd class="text-[#251818] font-medium">{formatAbsolute(data.profile?.last_login_at)}</dd>
				</div>
			</div>
		</dl>

		<form method="POST" action="/admin?/logout" class="mt-4">
			<button
				type="submit"
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-[#ae2f34] hover:bg-[#fbe3e1] transition-colors"
			>
				<LogOut size={14} /> Sign out
			</button>
		</form>
	</section>
</div>
