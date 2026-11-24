<script module lang="ts">
	import { PAYMENT_SEO } from '$lib/utils/seo';
</script>

<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { formatIDR, formatDate } from '$lib/utils/format';
	import { submitPayment } from '$lib/services/payments';
	import { toUserMessage } from '$lib/services/api';
	import Seo from '$lib/components/Seo.svelte';
	import Logo from '$lib/components/layout/Logo.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import CopyButton from '$lib/components/ui/CopyButton.svelte';
	import StatusPill from '$lib/components/ui/StatusPill.svelte';
	import TransferAccounts from '$lib/components/session/TransferAccounts.svelte';
	import ShareReceipt from '$lib/components/session/ShareReceipt.svelte';
	import BillPhotos from '$lib/components/session/BillPhotos.svelte';
	import { PaidStamp, ArtPhone } from '$lib/components/art';
	import { paymentStatusOf } from '$lib/utils/status';
	import { cn } from '$lib/utils/cn';
	import { ImagePlus, Upload, Clock, Undo2, CircleAlert, Check } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let fileInput = $state<HTMLInputElement>();
	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let isSubmitting = $state(false);
	let submitError = $state('');
	let replacing = $state(false);

	const p = $derived(data.page);
	const status = $derived(p.payment_status);
	const st = $derived(paymentStatusOf(status, 'guest'));
	const amount = $derived(p.fee_breakdown?.total ?? p.share_amount);
	const firstName = $derived(p.participant_name?.split(' ')[0] ?? '');
	const accounts = $derived(
		p.bank_accounts && p.bank_accounts.length > 0
			? p.bank_accounts
			: p.bank_name || p.bank_account_number || p.bank_account_holder
				? [{ bank_name: p.bank_name ?? null, account_number: p.bank_account_number ?? null, account_holder: p.bank_account_holder ?? null }]
				: []
	);
	const canUpload = $derived(!p.is_expired && status !== 'paid' && (status !== 'submitted' || replacing));

	// Step 1 transfer, 2 upload, 3 done (waiting for the host or paid).
	const step = $derived(status === 'paid' ? 4 : status === 'submitted' ? 3 : selectedFile ? 2 : 1);
	const steps = ['Transfer', 'Upload the screenshot', 'Done'];

	function handleFileChange(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			submitError = 'That file is not an image. Choose a screenshot or photo.';
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			submitError = `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`;
			return;
		}
		submitError = '';
		selectedFile = file;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = URL.createObjectURL(file);
	}

	function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				// The backend expects the raw base64 body without the data URI prefix.
				const comma = result.indexOf(',');
				resolve(comma >= 0 ? result.slice(comma + 1) : result);
			};
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}

	async function handleSubmit() {
		if (!selectedFile) {
			submitError = 'Choose your transfer screenshot first.';
			return;
		}
		isSubmitting = true;
		submitError = '';
		try {
			const base64 = await fileToBase64(selectedFile);
			const ext = selectedFile.name.split('.').pop()?.toLowerCase();
			await submitPayment(data.participantId, { proof_image: base64, file_name: selectedFile.name, file_format: ext || undefined });
			selectedFile = null;
			previewUrl = null;
			replacing = false;
			await invalidateAll();
		} catch (err) {
			console.error('Submit payment error:', err);
			submitError = toUserMessage(err, "We couldn't upload it. Check your connection and try again.");
		} finally {
			isSubmitting = false;
		}
	}
</script>

<!-- Generic on purpose: WhatsApp previews this link in the chat. -->
<Seo {...PAYMENT_SEO} />

<div class="mx-auto max-w-[34rem] px-4 pt-5 pb-16 sm:pt-8">
	<header class="flex items-center justify-between">
		<Logo size="sm" href="/" />
		<StatusPill tone={st.tone}>{st.label}</StatusPill>
	</header>

	<!-- 1 · How much, for what -->
	<section class="mt-8" aria-labelledby="amount-h">
		<p class="text-[15px] text-ink-soft">Hi {firstName}, your share of</p>
		<p class="text-heading mt-0.5 text-xl [overflow-wrap:anywhere]">{p.session_name}</p>
		<div class="mt-4 flex flex-wrap items-center gap-3">
			<h1 id="amount-h" class="text-amount text-[clamp(3rem,15vw,4.5rem)] leading-[0.9] tracking-[-0.045em]">{formatIDR(amount)}</h1>
			{#if status === 'paid'}
				<PaidStamp size="lg" animate />
			{:else if !p.is_expired}
				<CopyButton value={String(Math.round(amount))} label="Copy the amount" text />
			{/if}
		</div>
	</section>

	{#if !p.is_expired}
		<ol class="mt-7 grid grid-cols-3 gap-2" aria-label="Steps">
			{#each steps as label, i (label)}
				{@const n = i + 1}
				{@const state = step > n ? 'done' : step === n ? 'current' : 'todo'}
				<li aria-current={state === 'current' ? 'step' : undefined}>
					<div class={cn('h-1.5 rounded-pill', state === 'done' ? 'bg-ink' : state === 'current' ? 'bg-coral' : 'bg-hairline')}></div>
					<p class={cn('mt-1.5 flex items-center gap-1 text-[12px] font-semibold leading-tight', state === 'todo' ? 'text-ink-soft' : 'text-ink')}>
						{#if state === 'done'}<Check size={13} strokeWidth={3} aria-hidden="true" />{/if}{label}
					</p>
				</li>
			{/each}
		</ol>
	{/if}

	<div class="mt-6 flex flex-col gap-5">
		{#if p.is_expired}
			<section class="flex flex-col items-center rounded-card bg-card px-6 py-8 text-center shadow-raised">
				<Clock size={28} class="text-ink-soft" aria-hidden="true" />
				<h2 class="text-heading mt-3 text-xl">This link has expired</h2>
				<p class="mt-1.5 max-w-[34ch] text-[15px] text-ink-soft">
					{#if p.link_expires_at}It stopped working on {formatDate(p.link_expires_at)}. {/if}Ask the person who sent it for a fresh link on WhatsApp.
				</p>
			</section>
		{:else if status === 'paid'}
			<section class="rounded-card bg-card p-5 shadow-raised sm:p-6">
				<h2 class="text-heading text-xl">You're all settled</h2>
				<p class="mt-1 text-[15px] text-ink-soft">Your payment for {p.session_name} was approved. Nothing else to do.</p>
			</section>
		{:else if status === 'submitted' && !replacing}
			<section class="flex gap-4 rounded-card bg-card p-5 shadow-raised sm:p-6">
				<ArtPhone class="w-14 flex-none" />
				<div>
					<h2 class="text-heading text-xl">Screenshot sent</h2>
					<p class="mt-1 text-[15px] text-ink-soft">The host is checking it. You'll get a WhatsApp message when it's approved.</p>
					<button type="button" class="mt-3 text-sm font-semibold text-steel hover:text-ink" onclick={() => (replacing = true)}>Sent the wrong one? Upload again</button>
				</div>
			</section>
		{/if}

		{#if status === 'rejected' && p.rejection_reason && !p.is_expired}
			<section class="rounded-card bg-rejected-tint p-5 text-rejected" role="status">
				<h2 class="flex items-center gap-2 font-bold"><Undo2 size={18} aria-hidden="true" />The host needs a new screenshot</h2>
				<p class="mt-1.5 text-[15px]">"{p.rejection_reason}"</p>
			</section>
		{/if}

		{#if canUpload}
			<!-- 2 · Where to transfer -->
			{#if status !== 'submitted'}
				<TransferAccounts {accounts} title="Transfer to" />
			{/if}

			<!-- 3 · Proof -->
			<section class="rounded-card bg-card p-5 shadow-raised sm:p-6" aria-labelledby="upload-h">
				<h2 id="upload-h" class="text-heading text-xl">{status === 'rejected' ? 'Upload a new screenshot' : 'Then upload the screenshot'}</h2>
				<p class="mt-1 text-[15px] text-ink-soft">The one from your banking or e-wallet app that shows the amount.</p>

				<!-- No `capture` attribute: transfer screenshots live in the gallery,
				     and capture would force the camera on phones. -->
				<input bind:this={fileInput} type="file" accept="image/*" class="sr-only" id="proof" onchange={handleFileChange} disabled={isSubmitting} />
				<label
					for="proof"
					class={cn(
						'mt-4 flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed px-4 text-center transition-colors',
						previewUrl ? 'border-transparent bg-fog p-3' : 'border-hairline bg-fog py-8 hover:border-ink-soft',
						isSubmitting && 'pointer-events-none opacity-60'
					)}
				>
					{#if previewUrl}
						<img src={previewUrl} alt="Your selected screenshot" class="max-h-72 rounded-[10px] object-contain" />
						<span class="mt-3 text-sm font-semibold text-steel">Choose a different one</span>
					{:else}
						<ImagePlus size={28} class="text-ink-soft" aria-hidden="true" />
						<span class="mt-2 font-semibold">Choose screenshot</span>
						<span class="mt-0.5 text-[13px] text-ink-soft">Image up to 5 MB</span>
					{/if}
				</label>

				{#if submitError}
					<p class="mt-3 flex items-start gap-2 text-[14px] font-medium text-rejected" role="alert"><CircleAlert size={17} class="mt-px flex-none" />{submitError}</p>
				{/if}

				<Button size="lg" class="mt-4 w-full" leftIcon={Upload} loading={isSubmitting} disabled={!selectedFile} onclick={handleSubmit}>
					Send screenshot
				</Button>
				{#if status === 'submitted'}
					<button type="button" class="mt-3 w-full text-sm font-semibold text-ink-soft hover:text-ink" onclick={() => ((replacing = false), (selectedFile = null), (previewUrl = null))}>Keep the one I sent</button>
				{/if}
				<p class="mt-3 text-center text-[12px] text-ink-soft">Only the host sees it, to confirm your payment.</p>
			</section>
		{/if}

		{#if p.payment_proof_url && (status === 'submitted' || status === 'paid' || status === 'rejected') && !canUpload}
			<section aria-labelledby="mine-h">
				<h2 id="mine-h" class="text-eyebrow mb-2 px-1">Your screenshot</h2>
				<a href={p.payment_proof_url} target="_blank" rel="noopener noreferrer" class="block overflow-hidden rounded-card bg-card shadow-raised" aria-label="Open your screenshot full size">
					<img src={p.payment_proof_url} alt="" class="max-h-72 w-full bg-fog object-contain" />
				</a>
			</section>
		{/if}

		<ShareReceipt page={p} class="mt-2" />

		{#if p.bill_images && p.bill_images.length > 0}
			<BillPhotos photos={p.bill_images} title="The receipt" />
		{/if}
	</div>

	<p class="mt-10 text-center text-[13px] text-ink-soft">
		Sent with <a href="/" class="font-semibold text-ink hover:underline">Letpai</a>, the easy way to split a bill.
	</p>
</div>
