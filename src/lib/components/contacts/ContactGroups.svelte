<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Check, Pencil, Plus, Trash2 } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import Button from '../ui/Button.svelte';
	import Input from '../ui/Input.svelte';
	import { groupColors } from '$lib/constants/design';
	import type { ContactGroup } from '$lib/types/api';

	interface Props {
		groups: ContactGroup[];
		/** Live member counts by group_id; falls back to group.contact_count. */
		counts?: Record<string, number>;
		loading?: boolean;
		oncreate?: (data: { name: string; color: string }) => void | Promise<void>;
		onupdate?: (groupId: string, data: { name: string; color: string }) => void | Promise<void>;
		ondelete?: (groupId: string) => void | Promise<void>;
		class?: string;
	}

	let { groups, counts, loading = false, oncreate, onupdate, ondelete, class: className }: Props = $props();

	// One thing open at a time: the "new group" editor, one group's editor,
	// or one group's delete confirmation. No dialogs stacked on the sheet.
	let editing = $state<'new' | string | null>(null);
	let confirming = $state<string | null>(null);
	let draftName = $state('');
	let draftColor = $state<string>(groupColors[0]);
	let nameError = $state('');

	const COLOR_NAMES: Record<string, string> = {
		[groupColors[0]]: 'Steel',
		[groupColors[1]]: 'Coral',
		[groupColors[2]]: 'Green',
		[groupColors[3]]: 'Amber',
		[groupColors[4]]: 'Violet',
		[groupColors[5]]: 'Teal',
		[groupColors[6]]: 'Slate',
		[groupColors[7]]: 'Rose'
	};

	function startNew() {
		confirming = null;
		editing = 'new';
		draftName = '';
		draftColor = groupColors[groups.length % groupColors.length];
		nameError = '';
	}

	function startEdit(g: ContactGroup) {
		confirming = null;
		editing = g.group_id;
		draftName = g.name;
		draftColor = g.color;
		nameError = '';
	}

	function cancel() {
		editing = null;
	}

	async function save(e: SubmitEvent) {
		e.preventDefault();
		const name = draftName.trim();
		if (!name) return void (nameError = 'Give the group a name.');
		const taken = groups.some((g) => g.group_id !== editing && g.name.toLowerCase() === name.toLowerCase());
		if (taken) return void (nameError = 'You already have a group with that name.');
		if (editing === 'new') await oncreate?.({ name, color: draftColor });
		else if (editing) await onupdate?.(editing, { name, color: draftColor });
		editing = null;
	}

	async function remove(id: string) {
		confirming = null;
		await ondelete?.(id);
	}

	const countOf = (g: ContactGroup) => counts?.[g.group_id] ?? g.contact_count ?? 0;
</script>

{#snippet editor(label: string)}
	<form class="flex flex-col gap-4 rounded-card bg-fog p-4" onsubmit={save} transition:slide={{ duration: 150 }} novalidate>
		<Input
			id="group-name"
			label="Group name"
			placeholder="Office, Futsal Thursday, Family"
			bind:value={draftName}
			error={!!nameError}
			errorText={nameError}
			maxLength={30}
			disabled={loading}
			autofocus
		/>
		<fieldset>
			<legend class="mb-2 text-sm font-semibold text-ink">Colour</legend>
			<div class="flex flex-wrap gap-2">
				{#each groupColors as c (c)}
					{@const on = draftColor.toLowerCase() === c}
					<button
						type="button"
						onclick={() => (draftColor = c)}
						aria-pressed={on}
						aria-label={COLOR_NAMES[c]}
						class={cn(
							'grid size-9 place-items-center rounded-full text-card transition-transform duration-150 hover:scale-105',
							on && 'ring-2 ring-ink ring-offset-2 ring-offset-fog'
						)}
						style:background-color={c}
					>
						{#if on}<Check size={16} strokeWidth={3} aria-hidden="true" />{/if}
					</button>
				{/each}
			</div>
		</fieldset>
		<div class="flex gap-2">
			<Button type="button" variant="ghost" size="sm" onclick={cancel} disabled={loading}>Cancel</Button>
			<Button type="submit" variant="ink" size="sm" {loading}>{label}</Button>
		</div>
	</form>
{/snippet}

<div class={cn('flex flex-col gap-3', className)}>
	<p class="text-sm text-ink-soft">Groups let you add a whole crew to a session in one tap.</p>

	{#if groups.length > 0}
		<ul class="divide-y divide-mist overflow-hidden rounded-card bg-card shadow-[inset_0_0_0_1.5px_var(--color-mist)]">
			{#each groups as g (g.group_id)}
				<li data-testid="group-row">
					{#if editing === g.group_id}
						<div class="p-2">{@render editor('Save group')}</div>
					{:else if confirming === g.group_id}
						<div class="flex flex-wrap items-center gap-3 bg-rejected-tint px-4 py-3" transition:slide={{ duration: 150 }}>
							<p class="min-w-0 flex-1 text-sm text-ink">
								Delete <strong>{g.name}</strong>? The {countOf(g) === 1 ? 'contact stays' : 'contacts stay'}, just without a group.
							</p>
							<div class="flex gap-2">
								<Button variant="ghost" size="sm" onclick={() => (confirming = null)}>Keep</Button>
								<Button variant="destructive" size="sm" onclick={() => remove(g.group_id)} {loading}>Delete</Button>
							</div>
						</div>
					{:else}
						<div class="flex items-center gap-3 px-4 py-3">
							<span class="size-3 flex-none rounded-full" style:background-color={g.color} aria-hidden="true"></span>
							<span class="min-w-0 flex-1">
								<span class="block truncate font-semibold text-ink">{g.name}</span>
								<span class="text-sm text-ink-soft tabular-nums">{countOf(g)} {countOf(g) === 1 ? 'person' : 'people'}</span>
							</span>
							<button
								type="button"
								onclick={() => startEdit(g)}
								class="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-fog hover:text-ink"
								aria-label="Edit {g.name}"
							>
								<Pencil size={16} aria-hidden="true" />
							</button>
							<button
								type="button"
								onclick={() => {
									editing = null;
									confirming = g.group_id;
								}}
								class="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-rejected-tint hover:text-rejected"
								aria-label="Delete {g.name}"
							>
								<Trash2 size={16} aria-hidden="true" />
							</button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if editing === 'new'}
		{@render editor('Create group')}
	{:else}
		<Button variant="secondary" leftIcon={Plus} onclick={startNew} class="self-start">New group</Button>
	{/if}
</div>
