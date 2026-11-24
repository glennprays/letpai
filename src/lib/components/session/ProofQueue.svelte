<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import { formatIDR } from '$lib/utils/format';
	import { Check, Undo2, ImageIcon, CheckCheck } from 'lucide-svelte';
	import type { Participant } from '$lib/types/api';

	interface Props {
		proofs: Participant[];
		actingId?: string | null;
		bulkApproving?: boolean;
		onapprove: (id: string) => void;
		onsendback: (id: string, name: string) => void;
		onapproveall: () => void;
	}

	let { proofs, actingId = null, bulkApproving = false, onapprove, onsendback, onapproveall }: Props = $props();
</script>

<section aria-labelledby="proofs-h">
	<header class="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-1">
		<h2 id="proofs-h" class="text-heading flex items-center gap-2 text-xl whitespace-nowrap">
			Check these proofs
			<span class="rounded-pill bg-ink px-2 py-0.5 font-sans text-xs font-semibold text-card tabular-nums">{proofs.length}</span>
		</h2>
		{#if proofs.length > 1}
			<Button size="sm" variant="secondary" leftIcon={CheckCheck} loading={bulkApproving} onclick={onapproveall}>Approve all {proofs.length}</Button>
		{/if}
	</header>
	<Card padding="none" class="divide-y divide-mist">
		{#each proofs as p (p.participant_id)}
			{@const busy = actingId === p.participant_id || bulkApproving}
			<article class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 p-4 sm:p-5" aria-label="Proof from {p.name}">
				<div class="flex min-w-0 gap-3">
					<Avatar size="md" fullName={p.name} phoneNumber={p.whatsapp_number} identifier={p.contact_id || p.participant_id} src={p.contact_avatar_url || p.avatar_url} />
					<div class="min-w-0">
						<p class="truncate font-semibold">{p.name}</p>
						<p class="text-[13px] text-ink-soft">Sent a transfer screenshot for <b class="text-amount font-semibold text-ink">{formatIDR(p.share_amount)}</b></p>
						<div class="mt-3 flex flex-wrap gap-2">
							<Button size="sm" variant="ink" leftIcon={Check} loading={actingId === p.participant_id} disabled={busy} onclick={() => onapprove(p.participant_id)}>Approve</Button>
							<Button size="sm" variant="secondary" leftIcon={Undo2} disabled={busy} onclick={() => onsendback(p.participant_id, p.name)}>Send back</Button>
						</div>
					</div>
				</div>
				{#if p.payment_proof_url}
					<a
						href={p.payment_proof_url}
						target="_blank"
						rel="noopener noreferrer"
						class="block h-24 w-[4.5rem] overflow-hidden rounded-[10px] bg-fog shadow-raised transition-transform hover:scale-[1.03]"
						aria-label="Open {p.name}'s screenshot in a new tab"
					>
						<img src={p.payment_proof_url} alt="" class="size-full object-cover" />
					</a>
				{:else}
					<div class="grid h-24 w-[4.5rem] place-items-center rounded-[10px] bg-fog text-ink-soft" aria-label="No image"><ImageIcon size={20} /></div>
				{/if}
			</article>
		{/each}
	</Card>
</section>
