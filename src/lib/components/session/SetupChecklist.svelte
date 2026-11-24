<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { cn } from '$lib/utils/cn';
	import { Check, UserPlus, Plus, Send } from 'lucide-svelte';

	interface Props {
		people: number;
		items: number;
		hasAccounts: boolean;
		sending?: boolean;
		onaddpeople: () => void;
		onadditem: () => void;
		onaccounts: () => void;
		onsend: () => void;
	}

	let { people, items, hasAccounts, sending = false, onaddpeople, onadditem, onaccounts, onsend }: Props = $props();

	const steps = $derived([
		{ done: people > 0, label: people > 0 ? `${people} ${people === 1 ? 'person' : 'people'} added` : 'Add the people', action: onaddpeople, cta: 'Add people', icon: UserPlus },
		{ done: items > 0, label: items > 0 ? `${items} ${items === 1 ? 'item' : 'items'} on the bill` : 'Add what you paid for', action: onadditem, cta: 'Add item', icon: Plus },
		{ done: hasAccounts, label: hasAccounts ? 'Transfer account set' : 'Where should they transfer?', action: onaccounts, cta: 'Add account', icon: Plus }
	]);
	const ready = $derived(people > 0 && items > 0);
</script>

<!-- Shown until the first WhatsApp send: the three things that make a
     useful message, then one button. -->
<section aria-labelledby="setup-h" class="rounded-card bg-card p-5 shadow-raised sm:p-6">
	<h2 id="setup-h" class="text-heading text-xl">Ready to send?</h2>
	<p class="mt-1 text-sm text-ink-soft">Everyone gets one WhatsApp message with their share and your account.</p>
	<ol class="mt-4 divide-y divide-mist">
		{#each steps as s, i (i)}
			{@const Icon = s.icon}
			<li class="flex items-center gap-3 py-3">
				<span class={cn('grid size-7 flex-none place-items-center rounded-full text-[13px] font-bold', s.done ? 'bg-ink text-card' : 'bg-mist text-ink-soft')}>
					{#if s.done}<Check size={15} strokeWidth={3} aria-hidden="true" /><span class="sr-only">Done:</span>{:else}{i + 1}{/if}
				</span>
				<span class={cn('flex-1 text-[15px]', s.done ? 'text-ink' : 'font-semibold text-ink')}>{s.label}</span>
				{#if !s.done}<Button size="sm" variant="secondary" leftIcon={Icon} onclick={s.action}>{s.cta}</Button>{/if}
			</li>
		{/each}
	</ol>
	<Button class="mt-3 w-full sm:w-auto" leftIcon={Send} disabled={!ready} loading={sending} onclick={onsend}>
		Send to {people || ''} {people === 1 ? 'person' : 'people'} on WhatsApp
	</Button>
	{#if !ready}<p class="mt-2 text-[13px] text-ink-soft">Add people and at least one item first.</p>{/if}
</section>
