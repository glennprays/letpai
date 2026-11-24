<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import { formatIDR } from '$lib/utils/format';
	import { ChevronDown, ExternalLink, Trash2 } from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';
	import { slide } from 'svelte/transition';
	import { untrack } from 'svelte';
	import type { Participant } from '$lib/types/api';

	interface Props {
		sessionId: string;
		people: Participant[];
		onremove: (p: Participant) => void;
		/** Start open (e.g. when everyone has paid). */
		open?: boolean;
	}

	let { sessionId, people, onremove, open = false }: Props = $props();
	// Initial state only; the host toggles it afterwards.
	let expanded = $state(untrack(() => open));
	const collected = $derived(people.reduce((sum, p) => sum + (p.share_amount ?? 0), 0));
	const uid = $props.id();
</script>

<!-- Paid people collapse into one row: they need nothing from the host. -->
<Card padding="none" class="overflow-hidden">
	<button
		type="button"
		class="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-fog sm:px-5"
		aria-expanded={expanded}
		aria-controls="{uid}-paid"
		onclick={() => (expanded = !expanded)}
	>
		<span class="flex -space-x-2" aria-hidden="true">
			{#each people.slice(0, 5) as p (p.participant_id)}
				<Avatar size="sm" fullName={p.name} identifier={p.contact_id || p.participant_id} src={p.contact_avatar_url || p.avatar_url} class="ring-2 ring-card" />
			{/each}
		</span>
		<span class="flex-1 text-[15px]"><b>{people.length} paid</b> <span class="text-ink-soft">· {formatIDR(collected)} collected</span></span>
		<ChevronDown size={18} class={cn('text-ink-soft transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
	</button>
	{#if expanded}
		<ul id="{uid}-paid" class="divide-y divide-mist border-t border-mist" transition:slide={{ duration: 160 }}>
			{#each people as p (p.participant_id)}
				<li class="flex items-center gap-3 px-4 py-3 sm:px-5">
					<Avatar size="sm" fullName={p.name} identifier={p.contact_id || p.participant_id} src={p.contact_avatar_url || p.avatar_url} />
					<a href="/sessions/{sessionId}/participants/{p.participant_id}" class="min-w-0 flex-1 truncate font-medium hover:underline">{p.name}</a>
					<span class="text-[13px] text-ink-soft">{p.paid_manually ? 'Marked by you' : 'Proof approved'}</span>
					<span class="text-amount text-[15px] text-ink-soft">{formatIDR(p.share_amount)}</span>
					<Menu
						label="More for {p.name}"
						items={[
							{ label: 'Open details', icon: ExternalLink, href: `/sessions/${sessionId}/participants/${p.participant_id}` },
							{ label: 'Remove from session', icon: Trash2, onclick: () => onremove(p), danger: true }
						]}
					/>
				</li>
			{/each}
		</ul>
	{/if}
</Card>
