<script lang="ts">
	import {
		MessageCircle,
		Users,
		ArrowRight,
		CheckCircle2,
		XCircle,
		Clock,
		Shield,
		AlertTriangle
	} from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const statusBadge = $derived.by(() => {
		const s = data.status;
		if (!s) return { label: 'Unknown', tone: 'neutral' as const, Icon: Clock };
		if (s.is_connected) return { label: 'Connected', tone: 'success' as const, Icon: CheckCircle2 };
		if (s.gateway_token_valid)
			return { label: 'Token saved · not paired', tone: 'warning' as const, Icon: Clock };
		return { label: 'Not paired', tone: 'danger' as const, Icon: XCircle };
	});

	const badgeClasses = $derived(
		statusBadge.tone === 'success'
			? 'text-[#047857] bg-[#10B981]/15'
			: statusBadge.tone === 'warning'
				? 'text-[#92400E] bg-[#F59E0B]/15'
				: statusBadge.tone === 'danger'
					? 'text-[#991B1B] bg-[#EF4444]/15'
					: 'text-[#584140] bg-[#fff0ef]'
	);

	const activeAdminCount = $derived(
		(data.admins ?? []).filter((a) => a.is_active).length
	);
	const superAdminCount = $derived(
		(data.admins ?? []).filter((a) => a.is_active && a.role === 'super_admin').length
	);
</script>

<svelte:head>
	<title>Admin dashboard · Letpai</title>
</svelte:head>

<div class="px-6 py-10 max-w-5xl mx-auto" style="font-family:'Plus Jakarta Sans',sans-serif;">
	<header class="mb-8">
		<p class="text-xs uppercase tracking-wide font-semibold text-[#584140] mb-1">Dashboard</p>
		<h1 class="text-3xl font-bold text-[#251818]">Hi {data.profile?.full_name || 'admin'} 👋</h1>
		<p class="text-sm text-[#584140] mt-1">
			Manage Letpai's WhatsApp integration and admin team from one place.
		</p>
	</header>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
		<!-- WhatsApp status tile -->
		<a
			href="/admin/whatsapp"
			class="group bg-white rounded-3xl p-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)] hover:shadow-[0_8px_32px_rgba(174,47,52,0.08)] transition-all no-underline"
		>
			<div class="flex items-start justify-between gap-3">
				<div
					class="w-11 h-11 rounded-2xl bg-[#ae2f34]/10 text-[#ae2f34] flex items-center justify-center"
				>
					<MessageCircle size={20} />
				</div>
				<span
					class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold {badgeClasses}"
				>
					<statusBadge.Icon size={14} />
					{statusBadge.label}
				</span>
			</div>
			<h2 class="text-lg font-semibold text-[#251818] mt-4">WhatsApp gateway</h2>
			<p class="text-sm text-[#584140] mt-1">
				{#if data.status?.phone_number}
					Currently paired with <strong>+{data.status.phone_number}</strong>.
				{:else}
					No device paired yet. Generate a QR to connect one.
				{/if}
			</p>
			{#if data.status?.message}
				<p class="text-xs text-[#584140]/80 mt-2">{data.status.message}</p>
			{/if}
			<p
				class="text-sm font-medium text-[#ae2f34] mt-4 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
			>
				Open WhatsApp settings <ArrowRight size={14} />
			</p>
		</a>

		<!-- Admin team tile -->
		<a
			href={data.profile?.role === 'super_admin' ? '/admin/admins' : '/admin'}
			class:opacity-60={data.profile?.role !== 'super_admin'}
			class:pointer-events-none={data.profile?.role !== 'super_admin'}
			class="group bg-white rounded-3xl p-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)] hover:shadow-[0_8px_32px_rgba(174,47,52,0.08)] transition-all no-underline"
		>
			<div class="flex items-start justify-between gap-3">
				<div class="w-11 h-11 rounded-2xl bg-[#14B8A6]/15 text-[#0F766E] flex items-center justify-center">
					<Users size={20} />
				</div>
				{#if data.profile?.role === 'super_admin'}
					<span class="text-xs font-semibold text-[#584140]">Super admin</span>
				{:else}
					<span class="inline-flex items-center gap-1 text-xs text-[#584140]"
						><Shield size={12} /> Restricted</span
					>
				{/if}
			</div>
			<h2 class="text-lg font-semibold text-[#251818] mt-4">Admin team</h2>
			{#if data.admins}
				<p class="text-sm text-[#584140] mt-1">
					{activeAdminCount} active · {superAdminCount}
					{superAdminCount === 1 ? 'super admin' : 'super admins'}
				</p>
			{:else if data.profile?.role === 'super_admin'}
				<p class="text-sm text-[#584140] mt-1">Couldn't load the admin list right now.</p>
			{:else}
				<p class="text-sm text-[#584140] mt-1">
					Only super admins can manage the team. Ask one of them for changes.
				</p>
			{/if}
			{#if data.profile?.role === 'super_admin'}
				<p
					class="text-sm font-medium text-[#ae2f34] mt-4 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
				>
					Manage admins <ArrowRight size={14} />
				</p>
			{/if}
		</a>
	</div>

	<!-- Heads up if no admins are listed -->
	{#if data.status && !data.status.gateway_token_valid}
		<div
			class="bg-[#FFFBEB] border border-[#F59E0B]/40 rounded-2xl p-4 flex items-start gap-3 mb-6"
		>
			<AlertTriangle size={18} class="text-[#92400E] mt-0.5 flex-shrink-0" />
			<div>
				<p class="text-sm font-medium text-[#92400E]">No gateway token configured</p>
				<p class="text-xs text-[#92400E]/90 mt-0.5">
					Notifications won't be delivered until the gateway has a valid token. Paste one from
					the WhatsApp gateway service in <a class="underline" href="/admin/whatsapp"
						>WhatsApp settings</a
					>.
				</p>
			</div>
		</div>
	{/if}

	{#if data.profile?.password_setup_required}
		<div
			class="bg-[#FFFBEB] border border-[#F59E0B]/40 rounded-2xl p-4 flex items-start gap-3 mb-6"
		>
			<AlertTriangle size={18} class="text-[#92400E] mt-0.5 flex-shrink-0" />
			<div>
				<p class="text-sm font-medium text-[#92400E]">Set a password</p>
				<p class="text-xs text-[#92400E]/90 mt-0.5">
					You're currently signing in by OTP only. Set a backup password so you can sign in if
					the WhatsApp gateway is down. (Coming soon.)
				</p>
			</div>
		</div>
	{/if}
</div>
