<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { CloudOff, RotateCcw, Save, Send, TriangleAlert } from 'lucide-svelte';
	import Seo from '$lib/components/Seo.svelte';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { updateAdminTemplate, type AdminMessageTemplate } from '$lib/services/admin';
	import { toUserMessage } from '$lib/services/api';
	import { toast } from '$lib/stores/toast';
	import { cn } from '$lib/utils/cn';
	import { renderTemplate, templateVariables, timeAgo } from '$lib/utils/admin';
	import { samplesFor } from './samples';
	import TestSendModal from './TestSendModal.svelte';
	import WhatsAppPreview from './WhatsAppPreview.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Draft = { name: string; description: string; body: string };
	const seed = (t: AdminMessageTemplate): Draft => ({ name: t.name, description: t.description ?? '', body: t.body });

	// Drafts live per template so switching between them keeps unsaved edits.
	let drafts = $state<Record<string, Draft>>({});
	let selectedKey = $state<string | null>(null);
	let saving = $state(false);
	let saveError = $state('');
	let testing = $state<AdminMessageTemplate | null>(null);
	let bodyEl = $state<HTMLTextAreaElement>();

	const selected = $derived(data.templates.find((t) => t.key === selectedKey) ?? data.templates[0] ?? null);
	const draft = $derived(selected ? (drafts[selected.template_id] ?? seed(selected)) : null);

	function edit(field: keyof Draft, value: string) {
		if (!selected || !draft) return;
		drafts[selected.template_id] = { ...draft, [field]: value };
	}

	const isDirty = (t: AdminMessageTemplate) => {
		const d = drafts[t.template_id];
		return !!d && (d.name !== t.name || d.body !== t.body || d.description !== (t.description ?? ''));
	};

	const unknown = $derived(selected && draft ? templateVariables(draft.body).filter((v) => !selected.variables.includes(v)) : []);
	const preview = $derived(selected && draft ? renderTemplate(draft.body, samplesFor(selected.variables)) : '');

	function insert(variable: string) {
		if (!draft || !bodyEl) return;
		const token = `{{.${variable}}}`;
		const { selectionStart: a, selectionEnd: b } = bodyEl;
		edit('body', draft.body.slice(0, a) + token + draft.body.slice(b));
		requestAnimationFrame(() => {
			bodyEl?.focus();
			bodyEl?.setSelectionRange(a + token.length, a + token.length);
		});
	}

	function discard() {
		if (!selected) return;
		delete drafts[selected.template_id];
		saveError = '';
	}

	async function save() {
		if (!selected || !draft) return;
		saving = true;
		saveError = '';
		try {
			await updateAdminTemplate(selected.key, {
				name: draft.name.trim() || undefined,
				description: draft.description.trim() || null,
				body: draft.body
			});
			await invalidateAll();
			delete drafts[selected.template_id];
			toast.success(`${draft.name.trim() || selected.name} saved`);
		} catch (err) {
			saveError = toUserMessage(err, "That didn't save. Check the placeholders and try again.");
		} finally {
			saving = false;
		}
	}
</script>

<Seo title="Message templates" noindex />

<AdminHeader title="Message templates" description="What people receive on WhatsApp. The preview uses sample values; test-send to see it on a real phone." />

{#if data.error}
	<EmptyState class="mt-6" icon={CloudOff} title="Couldn't load templates" description={data.error} action={{ label: 'Try again', onclick: () => invalidateAll() }} />
{:else if !selected || !draft}
	<EmptyState class="mt-6" title="No templates yet" description="The backend seeds them on first run. Check its migrations." />
{:else}
	<div class="mt-6 grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
		<nav aria-label="Templates" class="-mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
			{#each data.templates as t (t.template_id)}
				{@const on = t.template_id === selected.template_id}
				<button
					type="button"
					aria-current={on ? 'true' : undefined}
					onclick={() => {
						selectedKey = t.key;
						saveError = '';
					}}
					class={cn(
						'flex flex-none items-center gap-2 rounded-pill px-4 py-2 text-left text-sm font-semibold transition-colors lg:rounded-card lg:py-3',
						on ? 'bg-ink text-card' : 'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--color-mist)] hover:bg-mist'
					)}
				>
					<span class="min-w-0 flex-1">
						<span class="block truncate">{drafts[t.template_id]?.name || t.name}</span>
						<span class={cn('hidden truncate font-mono text-xs font-normal lg:block', on ? 'text-card/70' : 'text-ink-soft')}>{t.key}</span>
					</span>
					{#if isDirty(t)}<span class="size-2 flex-none rounded-full bg-coral" aria-label="Unsaved changes"></span>{/if}
				</button>
			{/each}
		</nav>

		<Card>
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div>
					<p class="font-mono text-xs text-ink-soft">{selected.key}</p>
					<p class="text-sm text-ink-soft">Saved {timeAgo(selected.updated_at)}</p>
				</div>
				<Button variant="secondary" size="sm" leftIcon={Send} onclick={() => (testing = selected)}>Send a test</Button>
			</div>

			<div class="mt-5 grid gap-4 sm:grid-cols-2">
				<Input id="tpl-name" label="Name" value={draft.name} oninput={(v) => edit('name', v)} />
				<Input id="tpl-desc" label="When it's sent" placeholder="Sent when…" value={draft.description} oninput={(v) => edit('description', v)} />
			</div>

			<div class="mt-5 grid gap-5 xl:grid-cols-2">
				<div class="flex flex-col gap-2">
					<label for="tpl-body" class="text-sm font-semibold text-ink">Message</label>
					<textarea
						id="tpl-body"
						bind:this={bodyEl}
						value={draft.body}
						oninput={(e) => edit('body', e.currentTarget.value)}
						rows="12"
						spellcheck="false"
						class="resize-y rounded-field bg-card px-4 py-3 font-mono text-[13px] leading-relaxed text-ink shadow-[inset_0_0_0_1.5px_var(--color-hairline)] focus:shadow-[inset_0_0_0_2px_var(--color-steel)] focus:outline-none"
					></textarea>
					{#if selected.variables.length}
						<div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="Insert a placeholder">
							<span class="text-[13px] text-ink-soft">Insert:</span>
							{#each selected.variables as v (v)}
								<button
									type="button"
									onclick={() => insert(v)}
									class="rounded-pill bg-mist px-2.5 py-1 font-mono text-xs text-ink transition-colors hover:bg-hairline"
								>
									{v}
								</button>
							{/each}
						</div>
					{/if}
					{#if unknown.length}
						<p class="flex items-start gap-2 text-sm text-pending" role="status">
							<TriangleAlert size={16} class="mt-0.5 flex-none" aria-hidden="true" />
							<span>
								{unknown.map((u) => `{{.${u}}}`).join(', ')}
								{unknown.length === 1 ? "isn't" : "aren't"} filled for this message and will show up literally.
							</span>
						</p>
					{/if}
				</div>
				<div class="flex flex-col gap-2">
					<p class="text-sm font-semibold text-ink">Preview</p>
					<WhatsAppPreview text={preview} label="Preview of {draft.name}" />
				</div>
			</div>

			{#if saveError}<p class="mt-4 text-sm text-rejected" role="alert">{saveError}</p>{/if}

			<div class="mt-5 flex flex-wrap items-center justify-end gap-2">
				{#if isDirty(selected)}
					<span class="mr-auto text-sm text-ink-soft">Unsaved changes</span>
					<Button variant="ghost" size="sm" leftIcon={RotateCcw} onclick={discard} disabled={saving}>Discard</Button>
				{/if}
				<Button variant="ink" size="sm" leftIcon={Save} onclick={save} loading={saving} disabled={!isDirty(selected)}>Save</Button>
			</div>
		</Card>
	</div>
{/if}

{#if testing}
	<TestSendModal template={testing} unsaved={isDirty(testing)} onclose={() => (testing = null)} />
{/if}
