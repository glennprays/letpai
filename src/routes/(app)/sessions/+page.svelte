<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import SearchInput from '$lib/components/ui/SearchInput.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import SessionRow from '$lib/components/session/SessionRow.svelte';
	import { ArtReceipt } from '$lib/components/art';
	import { sessionGroup, type SessionGroup } from '$lib/utils/status';
	import { Plus, CloudOff, RefreshCw, SearchX } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Filter = 'all' | SessionGroup;
	let filter = $state<Filter>('all');
	let query = $state('');

	const counts = $derived({
		all: data.sessions.length,
		open: data.sessions.filter((s) => sessionGroup(s.status) === 'open').length,
		settled: data.sessions.filter((s) => sessionGroup(s.status) === 'settled').length,
		cancelled: data.sessions.filter((s) => sessionGroup(s.status) === 'cancelled').length
	});
	const shown = $derived(
		data.sessions
			.filter((s) => filter === 'all' || sessionGroup(s.status) === filter)
			.filter((s) => !query.trim() || s.title.toLowerCase().includes(query.trim().toLowerCase()))
			.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
	);
</script>

<Seo title="Sessions" noindex />

<div class="mx-auto max-w-4xl px-4 pt-6 pb-10 sm:px-6 md:pt-10">
	<header class="flex items-end justify-between gap-4">
		<h1 class="text-poster text-5xl sm:text-6xl">Sessions</h1>
		<Button href="/sessions/new" leftIcon={Plus} size="sm" class="hidden md:inline-flex">New session</Button>
	</header>

	{#if data.error}
		<EmptyState
			class="mt-8"
			icon={CloudOff}
			title="We couldn't load your sessions"
			description="{data.error} Check your connection and try again."
			action={{ label: 'Try again', onclick: () => invalidateAll(), icon: RefreshCw }}
		/>
	{:else if data.sessions.length === 0}
		<EmptyState class="mt-8" title="No sessions yet" description="Start one after your next dinner, trip or groceries run." action={{ label: 'New session', href: '/sessions/new', icon: Plus }}>
			{#snippet art()}<ArtReceipt />{/snippet}
		</EmptyState>
	{:else}
		<div class="sticky top-0 z-10 -mx-4 mt-6 flex flex-col gap-3 bg-fog/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:px-6">
			<Tabs
				bind:value={filter}
				label="Filter sessions"
				tabs={[
					{ value: 'all', label: 'All', count: counts.all },
					{ value: 'open', label: 'Collecting', count: counts.open },
					{ value: 'settled', label: 'Settled', count: counts.settled },
					{ value: 'cancelled', label: 'Cancelled', count: counts.cancelled }
				]}
			/>
			<SearchInput bind:value={query} placeholder="Search by name" label="Search sessions" class="sm:ml-auto sm:w-64" />
		</div>

		{#if shown.length === 0}
			<EmptyState class="mt-4" size="sm" icon={SearchX} title="No sessions match" description={query ? `Nothing called "${query}" here.` : 'None in this group yet.'} />
		{:else}
			<Card padding="none" class="mt-2 divide-y divide-mist overflow-hidden">
				{#each shown as s (s.session_id)}<SessionRow session={s} />{/each}
			</Card>
		{/if}
	{/if}
</div>
