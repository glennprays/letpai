<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import { Pencil, Plus, Wallet } from 'lucide-svelte';

	interface Account {
		account_id?: string;
		bank_name?: string | null;
		account_number?: string | null;
		account_holder?: string | null;
	}

	interface Props {
		accounts: Account[];
		/** Host view shows an edit button; the payment page passes null. */
		onmanage?: (() => void) | null;
		title?: string;
	}

	let { accounts, onmanage = null, title = 'Friends transfer to' }: Props = $props();
</script>

<Card padding="sm" class="sm:p-5">
	<div class="flex items-center justify-between gap-3">
		<h2 class="text-eyebrow">{title}</h2>
		{#if onmanage}
			<Button size="sm" variant="ghost" leftIcon={accounts.length ? Pencil : Plus} onclick={onmanage} class="-mr-2">{accounts.length ? 'Edit' : 'Add'}</Button>
		{/if}
	</div>
	{#if accounts.length === 0}
		<div class="mt-3 flex items-start gap-3 text-[15px] text-ink-soft">
			<Wallet size={20} class="mt-0.5 flex-none" aria-hidden="true" />
			<p>No account yet. Add one so friends know where to send the money.</p>
		</div>
	{:else}
		<ul class="mt-3 divide-y divide-mist">
			{#each accounts as a, i (a.account_id ?? i)}
				<li class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
					<div class="min-w-0">
						<p class="truncate text-[13px] text-ink-soft">
							{a.bank_name || `Account ${i + 1}`}{#if a.account_holder}<span aria-hidden="true">{" · "}</span>{a.account_holder}{/if}
						</p>
						{#if a.account_number}<p class="text-amount truncate text-lg tracking-[0.01em]">{a.account_number}</p>{/if}
					</div>
					{#if a.account_number}<CopyButton value={a.account_number} label="Copy {a.bank_name ?? ''} account number" />{/if}
				</li>
			{/each}
		</ul>
	{/if}
</Card>
