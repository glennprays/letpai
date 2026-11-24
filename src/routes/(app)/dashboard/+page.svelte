<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import SessionRow from '$lib/components/session/SessionRow.svelte';
	import { ArtReceipt, PaidStamp } from '$lib/components/art';
	import { formatIDR } from '$lib/utils/format';
	import { getFirstName } from '$lib/utils/avatar';
	import { needsAction } from '$lib/services/sessions-list';
	import { Plus, RefreshCw, ArrowRight, CloudOff } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let retrying = $state(false);

	const sessions = $derived(Array.isArray(data.sessions) ? data.sessions : []);
	const todo = $derived(needsAction(sessions));
	const settled = $derived(sessions.filter((s) => s.status === 'completed').slice(0, 3));
	const owed = $derived(data.stats?.total_pending ?? 0);
	const people = $derived(data.stats?.pending_payments ?? 0);
	const openCount = $derived(data.stats?.active_sessions ?? todo.length);

	const user = $derived(page.data.user as { full_name?: string; whatsapp_number?: string } | null);
	const hour = new Date().getHours();
	const greeting = hour < 5 ? 'Hi' : hour < 11 ? 'Good morning' : hour < 15 ? 'Good afternoon' : hour < 19 ? 'Good evening' : 'Evening';

	async function retry() {
		retrying = true;
		try {
			await invalidateAll();
		} finally {
			retrying = false;
		}
	}
</script>

<Seo title="Home" noindex />

<div class="mx-auto max-w-4xl px-4 pt-6 pb-10 sm:px-6 md:pt-10">
	<header class="flex items-center justify-between gap-4">
		<p class="text-[15px] font-semibold text-ink-soft">
			{greeting}{user?.full_name ? `, ${getFirstName(user.full_name, user.whatsapp_number)}` : ''}
		</p>
		<Button href="/sessions/new" leftIcon={Plus} size="sm" class="hidden md:inline-flex">New session</Button>
	</header>

	{#if data.error}
		<EmptyState
			class="mt-8"
			icon={CloudOff}
			title="We couldn't load your sessions"
			description="{data.error} Check your connection and try again."
			action={{ label: retrying ? 'Trying…' : 'Try again', onclick: retry, icon: RefreshCw }}
		/>
	{:else if sessions.length === 0}
		<section class="mt-6">
			<h1 class="text-poster text-[clamp(2.75rem,8vw,4.5rem)]">Paid for something? <span class="text-coral">Start here.</span></h1>
			<p class="mt-4 max-w-[44ch] text-lg text-ink-soft">
				Add the people and what they had. Letpai sends each of them their share on WhatsApp.
			</p>
			<EmptyState
				class="mt-8"
				title="No sessions yet"
				description="Your first one takes about a minute. Name it after the night: dinner, a trip, groceries."
				action={{ label: 'New session', href: '/sessions/new', icon: Plus }}
			>
				{#snippet art()}<ArtReceipt />{/snippet}
			</EmptyState>
		</section>
	{:else}
		<!-- The one number the host opens the app for. -->
		<section class="mt-4" aria-labelledby="owed-label">
			<p id="owed-label" class="text-eyebrow">Still owed to you</p>
			{#if owed > 0}
				<p class="text-amount mt-2 text-[clamp(3rem,11vw,5.5rem)] leading-[0.9] tracking-[-0.045em]">{formatIDR(owed)}</p>
				<p class="mt-3 text-[17px] text-ink-soft">
					{people} {people === 1 ? 'payment' : 'payments'} open across {openCount} {openCount === 1 ? 'session' : 'sessions'}
				</p>
			{:else}
				<div class="mt-3 flex flex-wrap items-center gap-4">
					<p class="text-amount text-[clamp(3rem,11vw,5.5rem)] leading-[0.9] tracking-[-0.045em]">{formatIDR(0)}</p>
					<PaidStamp label="All settled" animate />
				</div>
				<p class="mt-3 text-[17px] text-ink-soft">Nobody owes you anything right now.</p>
			{/if}
		</section>

		{#if todo.length > 0}
			<section class="mt-10" aria-labelledby="todo-h">
				<div class="mb-3 flex items-baseline justify-between px-1">
					<h2 id="todo-h" class="text-heading text-xl">Needs you</h2>
					<span class="text-sm text-ink-soft">Most unpaid first</span>
				</div>
				<Card padding="none" class="divide-y divide-mist overflow-hidden">
					{#each todo.slice(0, 6) as s (s.session_id)}<SessionRow session={s} />{/each}
				</Card>
			</section>
		{/if}

		{#if settled.length > 0}
			<section class="mt-10" aria-labelledby="settled-h">
				<h2 id="settled-h" class="text-heading mb-3 px-1 text-xl">Recently settled</h2>
				<Card padding="none" class="divide-y divide-mist overflow-hidden">
					{#each settled as s (s.session_id)}<SessionRow session={s} />{/each}
				</Card>
			</section>
		{/if}

		<div class="mt-8 flex justify-center">
			<Button href="/sessions" variant="secondary" rightIcon={ArrowRight}>All {sessions.length} sessions</Button>
		</div>
	{/if}
</div>
