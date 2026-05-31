<script lang="ts">
	import { Camera, CheckCircle2, Clock, Loader2, Upload, XCircle, Receipt, ImageIcon } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import { formatIDR } from '$lib/utils/format';
	import { submitPayment } from '$lib/services/payments';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let fileInput = $state<HTMLInputElement>();
	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let isSubmitting = $state(false);
	let submitError = $state('');

	function handleFileChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			submitError = 'Please select an image file.';
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			submitError = 'Image must be 5 MB or smaller.';
			return;
		}
		submitError = '';
		selectedFile = file;
		previewUrl = URL.createObjectURL(file);
	}

	function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				// Strip the data URI prefix; backend expects the raw base64 body.
				const comma = result.indexOf(',');
				resolve(comma >= 0 ? result.slice(comma + 1) : result);
			};
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}

	async function handleSubmit() {
		if (!selectedFile) {
			submitError = 'Choose a proof image first.';
			return;
		}
		isSubmitting = true;
		submitError = '';
		try {
			const base64 = await fileToBase64(selectedFile);
			const ext = selectedFile.name.split('.').pop()?.toLowerCase();
			await submitPayment(data.participantId, {
				proof_image: base64,
				file_name: selectedFile.name,
				file_format: ext || undefined
			});
			selectedFile = null;
			previewUrl = null;
			await invalidateAll();
		} catch (err) {
			console.error('Submit payment error:', err);
			submitError = err instanceof Error ? err.message : 'Failed to upload proof. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	const statusMeta = $derived.by(() => {
		switch (data.page.payment_status) {
			case 'paid':
				return {
					label: 'Payment approved',
					tone: 'text-[#047857] bg-[#10B981]/15',
					icon: CheckCircle2,
					body: 'Your payment has been received and approved. Thanks!'
				};
			case 'submitted':
				return {
					label: 'Proof received',
					tone: 'text-[#1E40AF] bg-[#3B82F6]/15',
					icon: Clock,
					body: "We've received your proof and the host is reviewing it. You'll hear back via WhatsApp."
				};
			case 'rejected':
				return {
					label: 'Proof rejected',
					tone: 'text-[#991B1B] bg-[#EF4444]/15',
					icon: XCircle,
					body: 'Your last proof was rejected. Please re-upload a clearer screenshot of the transfer.'
				};
			default:
				return {
					label: 'Awaiting payment',
					tone: 'text-[#92400E] bg-[#F59E0B]/15',
					icon: Clock,
					body: 'Pay the amount below to the host, then upload a screenshot of the transfer as proof.'
				};
		}
	});

	const StatusIcon = $derived(statusMeta.icon);
</script>

<svelte:head>
	<title>Pay {formatIDR(data.page.fee_breakdown?.total ?? data.page.share_amount)} · Letpai</title>
</svelte:head>

<main class="min-h-screen bg-[#fff8f7] py-10 px-4">
	<div class="max-w-md mx-auto">
		<header class="mb-6">
			<p class="text-xs uppercase tracking-wider text-[#584140] font-semibold">Payment for</p>
			<h1 class="text-3xl font-semibold text-[#251818] tracking-tight mt-1">
				{data.page.session_name}
			</h1>
			<p class="text-sm text-[#584140] mt-1">Hi {data.page.participant_name}, your share is:</p>
			<p class="text-4xl font-bold text-[#251818] mt-2">{formatIDR(data.page.fee_breakdown?.total ?? data.page.share_amount)}</p>
		</header>

		<section
			class="rounded-3xl p-5 mb-6 flex items-start gap-3 shadow-[0_1px_3px_rgba(37,24,24,0.04)] {statusMeta.tone}"
		>
			<StatusIcon class="w-5 h-5 flex-shrink-0 mt-0.5" />
			<div>
				<p class="text-sm font-semibold">{statusMeta.label}</p>
				<p class="text-sm mt-1">{statusMeta.body}</p>
			</div>
		</section>

		{#if data.page.bill_items.length > 0}
			<section class="bg-white rounded-3xl p-5 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
				<h2 class="text-sm font-semibold text-[#251818] mb-3">What you're paying for</h2>
				<ul class="space-y-3">
					{#each data.page.bill_items as item}
						<li class="text-sm">
							<div class="flex items-start justify-between gap-3">
								<span class="text-[#251818] truncate">{item.description}</span>
								<span class="text-[#251818] font-semibold flex-shrink-0">{formatIDR(item.your_share)}</span>
							</div>
							<p class="text-xs text-[#584140] mt-0.5">
								{formatIDR(item.amount)} ÷ {item.shared_with} {item.shared_with === 1 ? 'person' : 'people'}
							</p>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

			{#if data.page.bill_images && data.page.bill_images.length > 0}
				<section class="bg-white rounded-3xl p-5 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
					<h2 class="text-sm font-semibold text-[#251818] mb-3">Bill Attachments</h2>
					<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{#each data.page.bill_images as img (img.bill_image_id)}
							<a
								href={img.image_url}
								target="_blank"
								rel="noopener noreferrer"
								class="block aspect-square rounded-2xl overflow-hidden bg-[#fff0ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
								title="Open full size"
							>
								<img
									src={img.thumbnail_url || img.image_url}
									alt={img.file_name}
									class="w-full h-full object-cover"
								/>
							</a>
						{/each}
					</div>
					<p class="text-xs text-[#584140] mt-2 text-center">
						Original bill images from the host
					</p>
				</section>
			{/if}

			{#if data.page.fee_breakdown && (data.page.fee_breakdown.service_charge_share > 0 || data.page.fee_breakdown.tax_share > 0)}
				<section class="bg-white rounded-3xl p-5 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
					<h2 class="text-sm font-semibold text-[#251818] mb-3">Fee breakdown</h2>
					<ul class="space-y-2">
						<li class="flex items-center justify-between text-sm">
							<span class="text-[#584140]">Your items</span>
							<span class="text-[#251818]">{formatIDR(data.page.fee_breakdown.items_total)}</span>
						</li>
						{#if data.page.fee_breakdown.service_charge_share > 0}
							<li class="flex items-center justify-between text-sm">
								<span class="text-[#584140]">Service charge</span>
								<span class="text-[#251818]">{formatIDR(data.page.fee_breakdown.service_charge_share)}</span>
							</li>
						{/if}
						{#if data.page.fee_breakdown.tax_share > 0}
							<li class="flex items-center justify-between text-sm">
								<span class="text-[#584140]">Tax</span>
								<span class="text-[#251818]">{formatIDR(data.page.fee_breakdown.tax_share)}</span>
							</li>
						{/if}
						<li class="h-px bg-[#fbe3e1] my-1"></li>
						<li class="flex items-center justify-between text-sm font-semibold">
							<span class="text-[#251818]">Total due</span>
							<span class="text-[#ae2f34]">{formatIDR(data.page.fee_breakdown.total)}</span>
						</li>
					</ul>
				</section>
			{/if}

		{#if (data.page.bank_accounts && data.page.bank_accounts.length > 0) || data.page.bank_name || data.page.bank_account_number || data.page.bank_account_holder}
			{@const accounts = data.page.bank_accounts && data.page.bank_accounts.length > 0
				? data.page.bank_accounts
				: [{
					bank_name: data.page.bank_name ?? null,
					account_number: data.page.bank_account_number ?? null,
					account_holder: data.page.bank_account_holder ?? null
				}]}
			<section class="mb-6 space-y-3">
				<h2 class="text-sm font-semibold text-[#251818]">
					Transfer to {accounts.length > 1 ? `(${accounts.length} options)` : ''}
				</h2>
				{#each accounts as acct (acct.account_number ?? acct.bank_name ?? acct.account_holder)}
					<div class="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
						<dl class="text-sm space-y-1.5">
							{#if acct.bank_name}
								<div class="flex justify-between gap-3">
									<dt class="text-[#584140]">Bank</dt>
									<dd class="text-[#251818] font-medium">{acct.bank_name}</dd>
								</div>
							{/if}
							{#if acct.account_number}
								<div class="flex justify-between gap-3 items-center">
									<dt class="text-[#584140]">Account no.</dt>
									<dd class="flex items-center gap-2">
										<span class="text-[#251818] font-medium font-mono">{acct.account_number}</span>
										<button
											type="button"
											onclick={() => navigator.clipboard?.writeText(acct.account_number ?? '')}
											class="text-[11px] underline text-[#ae2f34] hover:opacity-80"
										>Copy</button>
									</dd>
								</div>
							{/if}
							{#if acct.account_holder}
								<div class="flex justify-between gap-3">
									<dt class="text-[#584140]">Account holder</dt>
									<dd class="text-[#251818] font-medium">{acct.account_holder}</dd>
								</div>
							{/if}
						</dl>
					</div>
				{/each}
			</section>
		{/if}

		{#if data.page.payment_status === 'rejected' && data.page.rejection_reason}
			<section class="bg-[#F59E0B]/15 rounded-3xl p-4 mb-6 text-sm text-[#92400E]">
				<p class="font-semibold mb-1">Why we asked for an update</p>
				<p>{data.page.rejection_reason}</p>
			</section>
		{/if}

		{#if data.page.payment_proof_url && ['submitted', 'paid', 'rejected'].includes(data.page.payment_status)}
			{@const proofUrl = data.page.payment_proof_url}
			<section class="bg-white rounded-3xl p-5 mb-6 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
				<h2 class="text-sm font-semibold text-[#251818] mb-3">
					{data.page.payment_status === 'rejected' ? 'Your last upload' : 'Your proof'}
				</h2>
				<a
					href={proofUrl}
					target="_blank"
					rel="noopener noreferrer"
					title="Open full size"
					class="block rounded-2xl overflow-hidden bg-[#fff0ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
				>
					<img
						src={proofUrl}
						alt="Proof you uploaded"
						class="w-full max-h-[360px] object-contain"
					/>
				</a>
				<p class="text-xs text-[#584140] mt-2">Tap the image to open it at full size.</p>
			</section>
		{/if}

		{#if data.page.payment_status !== 'paid' && !data.page.is_expired}
			<section class="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
				<h2 class="text-base font-semibold text-[#251818] mb-3">
					{data.page.payment_status === 'rejected' ? 'Upload a new proof' : data.page.payment_status === 'submitted' ? 'Upload again if needed' : 'Upload payment proof'}
				</h2>

				{#if previewUrl}
					<div class="mb-3 rounded-2xl overflow-hidden bg-[#fff0ef]">
						<img
							src={previewUrl}
							alt="Selected proof preview"
							class="w-full max-h-[320px] object-contain"
						/>
					</div>
				{/if}

				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					capture="environment"
					class="hidden"
					onchange={handleFileChange}
				/>

				<div class="flex gap-2">
					<button
						type="button"
						onclick={() => fileInput?.click()}
						disabled={isSubmitting}
						class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[#251818] bg-[#fff0ef] rounded-2xl hover:bg-[#fbe3e1] disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
					>
						<Camera class="w-4 h-4" />
						{selectedFile ? 'Change image' : 'Choose image'}
					</button>
					<button
						type="button"
						onclick={handleSubmit}
						disabled={!selectedFile || isSubmitting}
						class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] rounded-2xl hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
					>
						{#if isSubmitting}
							<Loader2 class="w-4 h-4 animate-spin" />
						{:else}
							<Upload class="w-4 h-4" />
						{/if}
						Submit proof
					</button>
				</div>

				{#if submitError}
					<p class="text-sm text-[#991B1B] mt-3">{submitError}</p>
				{/if}
				<p class="text-xs text-[#584140] mt-3">
					JPG, PNG or WebP up to 5 MB. We use the image only to verify your payment.
				</p>
			</section>
		{:else if data.page.is_expired}
			<section class="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(37,24,24,0.04)] text-center">
				<XCircle class="w-10 h-10 mx-auto text-[#584140]/40 mb-2" />
				<p class="text-sm text-[#584140]">This payment link has expired.</p>
			</section>
		{/if}
	</div>
</main>
