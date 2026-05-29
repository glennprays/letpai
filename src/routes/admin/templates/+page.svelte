<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Loader2, Save, FileText, AlertCircle } from 'lucide-svelte';
	import { updateAdminTemplate, type AdminMessageTemplate } from '$lib/services/admin';
	import { toast } from '$lib/stores/toast';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Local edit buffers keyed by template_id. We keep them outside the
	// server-supplied list so unsaved edits survive an invalidateAll.
	type Draft = { name: string; body: string; description: string };
	let drafts = $state<Record<string, Draft>>({});
	let saving = $state<Record<string, boolean>>({});
	let errors = $state<Record<string, string>>({});

	function draftFor(t: AdminMessageTemplate): Draft {
		if (!drafts[t.template_id]) {
			drafts[t.template_id] = {
				name: t.name,
				body: t.body,
				description: t.description ?? ''
			};
		}
		return drafts[t.template_id];
	}

	function reset(t: AdminMessageTemplate) {
		drafts[t.template_id] = {
			name: t.name,
			body: t.body,
			description: t.description ?? ''
		};
		errors[t.template_id] = '';
	}

	async function save(t: AdminMessageTemplate) {
		const d = draftFor(t);
		saving[t.template_id] = true;
		errors[t.template_id] = '';
		try {
			await updateAdminTemplate(t.key, {
				name: d.name.trim() || undefined,
				description: d.description.trim() === '' ? null : d.description.trim(),
				body: d.body
			});
			toast.success(`${t.key} saved`);
			await invalidateAll();
			delete drafts[t.template_id];
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Save failed';
			errors[t.template_id] = msg;
			toast.error(msg);
		} finally {
			saving[t.template_id] = false;
		}
	}
</script>

<svelte:head>
	<title>Message templates · Letpai admin</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-8">
	<header class="mb-6 flex items-center gap-3">
		<div class="w-10 h-10 rounded-2xl bg-[#ae2f34]/10 flex items-center justify-center">
			<FileText size={18} class="text-[#ae2f34]" />
		</div>
		<div>
			<h1 class="text-2xl font-semibold text-[#251818]">Message templates</h1>
			<p class="text-sm text-[#584140]">
				Edit the WhatsApp message bodies sent for notifications, reminders, and OTPs.
				Use <code class="px-1 py-0.5 rounded bg-[#fbe3e1] text-[12px]">&#123;&#123;.VarName&#125;&#125;</code> placeholders.
			</p>
		</div>
	</header>

	{#if data.error}
		<div class="rounded-2xl bg-[#EF4444]/10 text-[#991B1B] p-4 mb-6 flex items-start gap-2">
			<AlertCircle size={18} class="flex-shrink-0 mt-0.5" />
			<p class="text-sm">{data.error}</p>
		</div>
	{/if}

	{#if data.templates.length === 0 && !data.error}
		<p class="text-sm text-[#584140]">No templates yet.</p>
	{/if}

	<div class="space-y-6">
		{#each data.templates as t (t.template_id)}
			{@const d = draftFor(t)}
			<section class="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
				<div class="flex items-start justify-between gap-3 mb-3">
					<div>
						<p class="text-xs font-mono text-[#584140] mb-0.5">{t.key}</p>
						<h2 class="text-base font-semibold text-[#251818]">{t.name}</h2>
					</div>
					<span class="text-xs text-[#584140] flex-shrink-0">
						Updated {new Date(t.updated_at).toLocaleString()}
					</span>
				</div>

				<div class="space-y-4">
					<div>
						<label for="name-{t.template_id}" class="block text-xs font-semibold text-[#584140] uppercase tracking-wide mb-1">Display name</label>
						<input
							id="name-{t.template_id}"
							type="text"
							bind:value={d.name}
							class="w-full px-3 py-2 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
						/>
					</div>

					<div>
						<label for="desc-{t.template_id}" class="block text-xs font-semibold text-[#584140] uppercase tracking-wide mb-1">Description</label>
						<input
							id="desc-{t.template_id}"
							type="text"
							bind:value={d.description}
							placeholder="What this template is used for"
							class="w-full px-3 py-2 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
						/>
					</div>

					<div>
						<label for="body-{t.template_id}" class="block text-xs font-semibold text-[#584140] uppercase tracking-wide mb-1">Body</label>
						<textarea
							id="body-{t.template_id}"
							bind:value={d.body}
							rows="10"
							class="w-full px-3 py-2 bg-[#fff0ef]/50 rounded-xl text-sm text-[#251818] font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
						></textarea>
					</div>

					{#if t.variables.length > 0}
						<div>
							<p class="block text-xs font-semibold text-[#584140] uppercase tracking-wide mb-1">Available variables</p>
							<div class="flex flex-wrap gap-1.5">
								{#each t.variables as v}
									<code class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#fbe3e1] text-[#251818]">
										&#123;&#123;.{v}&#125;&#125;
									</code>
								{/each}
							</div>
						</div>
					{/if}

					{#if errors[t.template_id]}
						<div class="rounded-xl bg-[#EF4444]/10 text-[#991B1B] p-3 text-sm flex items-start gap-2">
							<AlertCircle size={16} class="flex-shrink-0 mt-0.5" />
							<p>{errors[t.template_id]}</p>
						</div>
					{/if}

					<div class="flex justify-end gap-2">
						<button
							type="button"
							onclick={() => reset(t)}
							disabled={saving[t.template_id]}
							class="px-4 py-2 text-sm font-medium text-[#251818] hover:bg-[#fff0ef] rounded-xl transition-colors disabled:opacity-50"
						>
							Reset
						</button>
						<button
							type="button"
							onclick={() => save(t)}
							disabled={saving[t.template_id]}
							class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-xl hover:opacity-95 disabled:opacity-50 transition-colors"
						>
							{#if saving[t.template_id]}
								<Loader2 size={16} class="animate-spin" />
							{:else}
								<Save size={16} />
							{/if}
							Save
						</button>
					</div>
				</div>
			</section>
		{/each}
	</div>
</div>
