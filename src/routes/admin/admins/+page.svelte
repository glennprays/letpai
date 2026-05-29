<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import {
		Plus,
		Users,
		ShieldCheck,
		ToggleLeft,
		ToggleRight,
		Trash2,
		AlertCircle,
		CheckCircle2,
		Loader2,
		X
	} from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showCreate = $state(false);

	// Track which row is being acted on so the button knows to spin.
	let pendingAdminId = $state<string | null>(null);

	const createForm = $derived(form && form.kind === 'create' ? form : null);
	const updateForm = $derived(form && form.kind === 'update' ? form : null);
	const deleteForm = $derived(form && form.kind === 'delete' ? form : null);

	function formatRelative(iso: string): string {
		const t = new Date(iso).getTime();
		if (Number.isNaN(t)) return '';
		const d = new Date(t);
		return d.toLocaleDateString();
	}

	function roleLabel(r: string): string {
		return r === 'super_admin' ? 'Super admin' : 'Admin';
	}
</script>

<svelte:head>
	<title>Admins · Letpai admin</title>
</svelte:head>

<div class="px-6 py-10 max-w-5xl mx-auto" style="font-family:'Plus Jakarta Sans',sans-serif;">
	<header class="flex items-start justify-between gap-3 mb-8">
		<div>
			<p class="text-xs uppercase tracking-wide font-semibold text-[#584140] mb-1">Admins</p>
			<h1 class="text-3xl font-bold text-[#251818]">Admin team</h1>
			<p class="text-sm text-[#584140] mt-1">
				Invite, update, and remove other admins. Only super admins can make these changes.
			</p>
		</div>
		<button
			type="button"
			onclick={() => (showCreate = true)}
			class="inline-flex items-center gap-2 px-4 h-11 rounded-2xl text-sm font-semibold text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] hover:opacity-95 transition-all flex-shrink-0"
		>
			<Plus size={16} /> Invite admin
		</button>
	</header>

	{#if form?.error}
		<div
			class="bg-[#FEF2F2] border border-[#EF4444]/30 rounded-2xl p-3 flex items-start gap-2 mb-4"
		>
			<AlertCircle size={16} class="text-[#EF4444] mt-0.5 flex-shrink-0" />
			<p class="text-sm text-[#991B1B]">{form.error}</p>
		</div>
	{:else if form?.success}
		<div
			class="bg-[#ECFDF5] border border-[#10B981]/30 rounded-2xl p-3 flex items-start gap-2 mb-4"
		>
			<CheckCircle2 size={16} class="text-[#047857] mt-0.5 flex-shrink-0" />
			<p class="text-sm text-[#047857]">{form.message ?? 'Done'}</p>
		</div>
	{/if}

	<section class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] overflow-hidden">
		{#if !data.admins || data.admins.length === 0}
			<div class="text-center py-12 text-[#584140]">
				<Users size={28} class="mx-auto text-[#584140]/30 mb-3" />
				<p class="text-sm">No admins yet.</p>
			</div>
		{:else}
			<table class="w-full text-sm">
				<thead>
					<tr class="text-left text-[11px] uppercase tracking-wide text-[#584140] bg-[#fff0ef]/60">
						<th class="px-5 py-3 font-semibold">Name</th>
						<th class="px-5 py-3 font-semibold">WhatsApp</th>
						<th class="px-5 py-3 font-semibold">Role</th>
						<th class="px-5 py-3 font-semibold">Status</th>
						<th class="px-5 py-3 font-semibold">Joined</th>
						<th class="px-5 py-3 font-semibold text-right">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.admins as admin (admin.admin_id)}
						{@const isSelf = admin.admin_id === data.profile?.admin_id}
						{@const isSuper = admin.role === 'super_admin'}
						{@const acting = pendingAdminId === admin.admin_id}
						<tr class="border-t border-[#fff0ef]">
							<td class="px-5 py-3 align-middle">
								<p class="font-medium text-[#251818] truncate">{admin.full_name}</p>
								{#if isSelf}
									<p class="text-[11px] text-[#584140]">You</p>
								{/if}
							</td>
							<td class="px-5 py-3 align-middle text-[#251818]">+{admin.whatsapp_number}</td>
							<td class="px-5 py-3 align-middle">
								<span
									class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold {isSuper
										? 'text-[#5B21B6] bg-[#8B5CF6]/15'
										: 'text-[#1E40AF] bg-[#3B82F6]/15'}"
								>
									{#if isSuper}
										<ShieldCheck size={12} />
									{/if}
									{roleLabel(admin.role)}
								</span>
							</td>
							<td class="px-5 py-3 align-middle">
								{#if admin.is_active}
									<span class="inline-flex items-center gap-1 text-xs text-[#047857]">
										<CheckCircle2 size={14} /> Active
									</span>
								{:else}
									<span class="inline-flex items-center gap-1 text-xs text-[#92400E]">
										<X size={14} /> Inactive
									</span>
								{/if}
							</td>
							<td class="px-5 py-3 align-middle text-[#584140]">{formatRelative(admin.created_at)}</td>
							<td class="px-5 py-3 align-middle">
								<div class="flex justify-end gap-1">
									<!-- Toggle role (admin <-> super_admin) -->
									<form
										method="POST"
										action="?/update"
										use:enhance={() => {
											pendingAdminId = admin.admin_id;
											return async ({ update }) => {
												await update();
												await invalidateAll();
												pendingAdminId = null;
											};
										}}
									>
										<input type="hidden" name="admin_id" value={admin.admin_id} />
										<input type="hidden" name="role" value={isSuper ? 'admin' : 'super_admin'} />
										<button
											type="submit"
											disabled={isSelf || acting}
											title={isSuper ? 'Demote to admin' : 'Promote to super admin'}
											class="inline-flex items-center justify-center w-9 h-9 rounded-xl text-[#584140] hover:bg-[#fff0ef] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
											aria-label={isSuper ? 'Demote' : 'Promote'}
										>
											{#if acting}
												<Loader2 class="w-4 h-4 animate-spin" />
											{:else}
												<ShieldCheck size={16} />
											{/if}
										</button>
									</form>
									<!-- Toggle active -->
									<form
										method="POST"
										action="?/update"
										use:enhance={() => {
											pendingAdminId = admin.admin_id;
											return async ({ update }) => {
												await update();
												await invalidateAll();
												pendingAdminId = null;
											};
										}}
									>
										<input type="hidden" name="admin_id" value={admin.admin_id} />
										<input type="hidden" name="is_active" value={admin.is_active ? 'false' : 'true'} />
										<button
											type="submit"
											disabled={isSelf || acting}
											title={admin.is_active ? 'Deactivate' : 'Activate'}
											class="inline-flex items-center justify-center w-9 h-9 rounded-xl text-[#584140] hover:bg-[#fff0ef] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
											aria-label={admin.is_active ? 'Deactivate' : 'Activate'}
										>
											{#if acting}
												<Loader2 class="w-4 h-4 animate-spin" />
											{:else if admin.is_active}
												<ToggleRight size={18} />
											{:else}
												<ToggleLeft size={18} />
											{/if}
										</button>
									</form>
									<!-- Delete -->
									<form
										method="POST"
										action="?/delete"
										use:enhance={({ cancel }) => {
											if (!confirm(`Remove ${admin.full_name}? This cannot be undone.`)) {
												cancel();
												return;
											}
											pendingAdminId = admin.admin_id;
											return async ({ update }) => {
												await update();
												await invalidateAll();
												pendingAdminId = null;
											};
										}}
									>
										<input type="hidden" name="admin_id" value={admin.admin_id} />
										<button
											type="submit"
											disabled={isSelf || acting}
											title="Remove admin"
											class="inline-flex items-center justify-center w-9 h-9 rounded-xl text-[#991B1B] hover:bg-[#EF4444]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
											aria-label="Remove admin"
										>
											{#if acting}
												<Loader2 class="w-4 h-4 animate-spin" />
											{:else}
												<Trash2 size={16} />
											{/if}
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>

	{#if showCreate}
		<div
			class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#251818]/30 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			onclick={(e) => {
				if (e.target === e.currentTarget) showCreate = false;
			}}
			onkeydown={(e) => {
				if (e.key === 'Escape') showCreate = false;
			}}
		>
			<div class="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_32px_-4px_rgba(37,24,24,0.12)] p-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-[#251818]">Invite admin</h2>
					<button
						type="button"
						onclick={() => (showCreate = false)}
						class="inline-flex items-center justify-center w-9 h-9 rounded-full text-[#584140] hover:bg-[#fff0ef] transition-colors"
						aria-label="Close"
					>
						<X size={18} />
					</button>
				</div>
				<form
					method="POST"
					action="?/create"
					class="space-y-3"
					use:enhance={() => {
						return async ({ update, result }) => {
							await update();
							if (result.type === 'success') {
								showCreate = false;
								await invalidateAll();
							}
						};
					}}
				>
					<div>
						<label for="full_name" class="block text-xs font-semibold text-[#584140] mb-1"
							>Name</label
						>
						<input
							id="full_name"
							name="full_name"
							type="text"
							required
							value={createForm?.full_name || ''}
							placeholder="Jane Doe"
							class="w-full px-4 py-3 bg-[#fff0ef] rounded-2xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#ae2f34]/30"
						/>
					</div>
					<div>
						<label
							for="whatsapp_number"
							class="block text-xs font-semibold text-[#584140] mb-1">WhatsApp number (E.164, no +)</label
						>
						<input
							id="whatsapp_number"
							name="whatsapp_number"
							type="tel"
							inputmode="numeric"
							required
							value={createForm?.whatsapp_number || ''}
							placeholder="6281234567890"
							class="w-full px-4 py-3 bg-[#fff0ef] rounded-2xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#ae2f34]/30"
						/>
					</div>
					<div>
						<label for="role" class="block text-xs font-semibold text-[#584140] mb-1">Role</label>
						<select
							id="role"
							name="role"
							value={createForm?.role || 'admin'}
							class="w-full px-4 py-3 bg-[#fff0ef] rounded-2xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#ae2f34]/30"
						>
							<option value="admin">Admin</option>
							<option value="super_admin">Super admin</option>
						</select>
					</div>

					{#if createForm?.error}
						<p class="text-sm text-[#EF4444]">{createForm.error}</p>
					{/if}

					<div class="flex gap-2 pt-1">
						<button
							type="button"
							onclick={() => (showCreate = false)}
							class="flex-1 px-4 py-2.5 rounded-2xl text-sm font-medium text-[#251818] bg-white hover:bg-[#fff0ef] transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] hover:opacity-95 transition-all"
						>
							Send invite
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Surface per-row update/delete errors as toast-y banners -->
	{#if (updateForm && updateForm.error) || (deleteForm && deleteForm.error)}
		<div class="fixed bottom-6 right-6 z-50 bg-[#FEF2F2] border border-[#EF4444]/30 rounded-2xl p-3 max-w-sm shadow-lg">
			<p class="text-sm text-[#991B1B]">
				{updateForm?.error ?? deleteForm?.error}
			</p>
		</div>
	{/if}
</div>
