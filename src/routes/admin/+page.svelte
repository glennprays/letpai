<script lang="ts">
	import { ArrowRight, CircleCheck, FileText, KeyRound, Info, MessageCircle, Users } from 'lucide-svelte';
	import Seo from '$lib/components/Seo.svelte';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import StatusPill from '$lib/components/ui/StatusPill.svelte';
	import { gatewayState, timeAgo } from '$lib/utils/admin';
	import { formatWhatsappDisplay } from '$lib/utils/phone';
	import { getFirstName } from '$lib/utils/avatar';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const gateway = $derived(gatewayState(data.status));
	const isSuper = $derived(data.profile?.role === 'super_admin');
	const active = $derived((data.admins ?? []).filter((a) => a.is_active));
	const supers = $derived(active.filter((a) => a.role === 'super_admin').length);

	// Things only an admin can fix, most urgent first.
	const alerts = $derived(
		[
			!gateway.healthy && {
				icon: MessageCircle,
				title: gateway.label === 'Unknown' ? "Can't confirm WhatsApp is sending" : "WhatsApp isn't sending",
				body: gateway.detail,
				href: '/admin/whatsapp',
				cta: 'Open WhatsApp'
			},
			data.profile?.password_setup_required && {
				icon: KeyRound,
				title: 'Set your own password',
				body: "You don't have one yet, or another admin set it for you. With your own, you can sign in even when WhatsApp is down.",
				href: '/admin/profile',
				cta: 'Set password'
			}
		].filter(Boolean) as { icon: typeof MessageCircle; title: string; body: string; href: string; cta: string }[]
	);
</script>

<Seo title="Admin overview" noindex />

<AdminHeader title="Hi {getFirstName(data.profile?.full_name, data.profile?.whatsapp_number)}" description="The WhatsApp gateway, message templates and the admin team." />

<section aria-label="Needs attention" class="mt-6">
	{#if alerts.length}
		<ul class="flex flex-col gap-2">
			{#each alerts as a (a.title)}
				{@const Icon = a.icon}
				<li class="flex flex-col gap-3 rounded-card bg-pending-tint p-4 sm:flex-row sm:items-center sm:gap-4">
					<span class="grid size-10 flex-none place-items-center rounded-full bg-card text-pending"><Icon size={18} aria-hidden="true" /></span>
					<div class="min-w-0 flex-1">
						<p class="font-semibold text-ink">{a.title}</p>
						<p class="mt-0.5 text-sm text-ink-soft">{a.body}</p>
					</div>
					<a href={a.href} class="inline-flex h-9 flex-none items-center gap-1.5 self-start rounded-pill bg-ink px-4 text-sm font-semibold text-card hover:bg-ink-hover sm:self-auto">
						{a.cta} <ArrowRight size={15} aria-hidden="true" />
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="flex items-center gap-2 rounded-card bg-paid-tint px-4 py-3 text-sm font-semibold text-paid">
			<CircleCheck size={18} aria-hidden="true" /> Nothing needs you right now.
		</p>
	{/if}
</section>

<div class="mt-6 grid gap-4 md:grid-cols-2">
	<Card href="/admin/whatsapp">
		<div class="flex items-start justify-between gap-3">
			<MessageCircle size={20} class="text-ink-soft" aria-hidden="true" />
			<StatusPill tone={gateway.tone}>{gateway.label}</StatusPill>
		</div>
		<h2 class="text-heading mt-4 text-lg">WhatsApp gateway</h2>
		{#if data.status?.phone_number}
			<p class="mt-1 text-ink tabular-nums">{formatWhatsappDisplay(data.status.phone_number)}</p>
			<p class="text-sm text-ink-soft">Last connected {timeAgo(data.status.last_connected_at)}</p>
		{:else}
			<p class="mt-1 text-sm text-ink-soft">{gateway.detail}</p>
		{/if}
	</Card>

	<Card href="/admin/templates">
		<FileText size={20} class="text-ink-soft" aria-hidden="true" />
		<h2 class="text-heading mt-4 text-lg">Message templates</h2>
		<p class="mt-1 text-sm text-ink-soft">The WhatsApp texts for new bills, reminders and sign-in codes. Preview and test before saving.</p>
	</Card>

	{#if isSuper}
		<Card href="/admin/admins">
			<Users size={20} class="text-ink-soft" aria-hidden="true" />
			<h2 class="text-heading mt-4 text-lg">Admin team</h2>
			{#if data.admins}
				<p class="mt-1 text-sm text-ink-soft tabular-nums">
					{active.length} active · {supers} {supers === 1 ? 'super admin' : 'super admins'}
				</p>
			{:else}
				<p class="mt-1 text-sm text-ink-soft">Couldn't load the team just now.</p>
			{/if}
		</Card>
	{/if}
</div>

{#if !isSuper}
	<p class="mt-4 flex items-center gap-2 text-sm text-ink-soft">
		<Info size={15} aria-hidden="true" /> Only super admins can invite or remove admins.
	</p>
{/if}
