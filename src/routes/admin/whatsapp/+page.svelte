<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import {
		RefreshCw,
		QrCode,
		KeyRound,
		Loader2,
		CheckCircle2,
		XCircle,
		Clock
	} from 'lucide-svelte';
	import {
		generateQRCode,
		getWhatsAppStatus,
		type QRCodeResponse,
		type WhatsAppStatus
	} from '$lib/services/admin';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// data is a prop, which is reactive but referencing it lazily inside
	// $state() captures only the initial value. The pattern svelte-check
	// recommends is initializing from the prop and reacting to changes
	// via $effect if needed; here the initial snapshot is the source of
	// truth, then user actions overwrite the local state.
	let status = $state<WhatsAppStatus | null>(null);
	let refreshing = $state(false);
	$effect(() => {
		status = data.initialStatus;
	});
	let qr = $state<QRCodeResponse | null>(null);
	let qrLoading = $state(false);
	let qrError = $state<string | null>(null);

	// Poll for status while a QR has been generated but the gateway hasn't
	// flipped to "connected" yet. Stop polling when the page is hidden or
	// the user navigates away.
	let pollTimer: ReturnType<typeof setInterval> | null = null;

	function startPoll() {
		if (pollTimer) return;
		pollTimer = setInterval(refreshStatus, 5000);
	}
	function stopPoll() {
		if (pollTimer) {
			clearInterval(pollTimer);
			pollTimer = null;
		}
	}

	$effect(() => {
		const connected = status?.is_connected === true;
		if (qr && !connected) startPoll();
		else stopPoll();
		return stopPoll;
	});

	async function refreshStatus() {
		refreshing = true;
		try {
			status = await getWhatsAppStatus();
			if (status?.is_connected) {
				qr = null;
				qrError = null;
			}
		} catch (err) {
			console.warn('refresh status failed:', err);
		} finally {
			refreshing = false;
		}
	}

	async function handleGenerateQR(e: Event) {
		e.preventDefault();
		// No phone input here — the gateway's JWT is already
		// phone-scoped. See generateQRCode() in services/admin.ts.
		qrError = null;
		qrLoading = true;
		try {
			qr = await generateQRCode();
			await refreshStatus();
		} catch (err) {
			qr = null;
			qrError = err instanceof Error ? err.message : 'Failed to generate QR';
		} finally {
			qrLoading = false;
		}
	}

	type ActionMsg = { error?: string; success?: boolean; message?: string };
	const tokenMsg = $derived<ActionMsg | null>(
		form && (form as { kind?: string }).kind === 'updateToken' ? (form as ActionMsg) : null
	);
	const dcMsg = $derived<ActionMsg | null>(
		form && (form as { kind?: string }).kind === 'disconnect' ? (form as ActionMsg) : null
	);

	const statusBadge = $derived.by(() => {
		if (!status) return { label: 'Unknown', tone: 'neutral' as const, Icon: Clock };
		if (status.is_connected) return { label: 'Connected', tone: 'success' as const, Icon: CheckCircle2 };
		if (status.gateway_token_valid)
			return { label: 'Token saved · not paired', tone: 'warning' as const, Icon: Clock };
		return { label: 'Not paired', tone: 'danger' as const, Icon: XCircle };
	});

	const badgeClasses = $derived(
		statusBadge.tone === 'success'
			? 'text-[#047857] bg-[#10B981]/15'
			: statusBadge.tone === 'warning'
				? 'text-[#92400E] bg-[#F59E0B]/15'
				: statusBadge.tone === 'danger'
					? 'text-[#991B1B] bg-[#EF4444]/15'
					: 'text-[#584140] bg-[#fff0ef]'
	);

	function lastConnectedRel(iso?: string): string {
		if (!iso) return 'never';
		const t = new Date(iso).getTime();
		if (Number.isNaN(t)) return 'never';
		const diffSec = Math.max(0, Math.round((Date.now() - t) / 1000));
		if (diffSec < 60) return 'just now';
		if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
		if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
		return `${Math.floor(diffSec / 86400)}d ago`;
	}
</script>

<svelte:head>
	<title>WhatsApp gateway · Admin</title>
</svelte:head>

<div style="font-family:'Plus Jakarta Sans',sans-serif;">
	<main class="max-w-4xl mx-auto px-6 py-10">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-[#251818]">WhatsApp gateway</h1>
			<p class="text-sm text-[#584140] mt-1">
				Pair Letpai's bill notifications with a WhatsApp account through the gateway.
			</p>
		</div>

		<!-- Status card -->
		<section
			class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] p-6 mb-6"
		>
			<div class="flex items-start justify-between gap-4 flex-wrap">
				<div>
					<p class="text-xs font-semibold uppercase tracking-wide text-[#584140] mb-1">Status</p>
					<div class="flex items-center gap-2">
						<span
							class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold {badgeClasses}"
						>
							<statusBadge.Icon size={14} />
							{statusBadge.label}
						</span>
						{#if status?.phone_number}
							<span class="text-sm text-[#251818] font-medium">+{status.phone_number}</span>
						{/if}
					</div>
					{#if status?.message}
						<p class="text-xs text-[#584140] mt-2">{status.message}</p>
					{/if}
					<p class="text-xs text-[#584140]/80 mt-1">
						Phone linked through your gateway token.
					</p>
					{#if status?.last_connected_at}
						<p class="text-xs text-[#584140]/80 mt-1">
							Last connected {lastConnectedRel(status.last_connected_at)}
						</p>
					{/if}
				</div>
				<button
					type="button"
					onclick={refreshStatus}
					disabled={refreshing}
					class="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium text-[#251818] bg-[#fff0ef] hover:bg-[#f5dddb] transition-colors disabled:opacity-50"
				>
					{#if refreshing}
						<Loader2 class="w-4 h-4 animate-spin" />
					{:else}
						<RefreshCw size={16} />
					{/if}
					Refresh
				</button>
			</div>
		</section>

		<!-- QR pairing card -->
		<section class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] p-6 mb-6">
			<div class="flex items-center gap-2 mb-1">
				<QrCode size={18} class="text-[#ae2f34]" />
				<h2 class="text-lg font-semibold text-[#251818]">Pair a device</h2>
			</div>
			<p class="text-sm text-[#584140] mb-4">
				Click <strong>Generate QR</strong>, then scan it from the WhatsApp phone you want to
				pair (Settings → Linked devices → Link a device). The gateway already knows which
				phone to pair from the token you configured server-side.
			</p>

			<form onsubmit={handleGenerateQR}>
				<button
					type="submit"
					disabled={qrLoading}
					class="inline-flex items-center justify-center gap-2 px-5 h-12 rounded-2xl text-sm font-semibold text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] hover:opacity-95 disabled:opacity-50 transition-all"
				>
					{#if qrLoading}
						<Loader2 class="w-4 h-4 animate-spin" />
					{:else}
						<QrCode size={16} />
					{/if}
					{qr ? 'Refresh QR' : 'Generate QR'}
				</button>
			</form>

			{#if qrError}
				<p class="text-sm text-[#EF4444] mt-3">{qrError}</p>
			{/if}

			{#if qr}
				<div class="mt-6 flex flex-col items-center gap-3">
					{#if /^data:image\//.test(qr.qr_code)}
						<img
							src={qr.qr_code}
							alt="WhatsApp pairing QR"
							class="w-64 h-64 rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(37,24,24,0.06)]"
						/>
					{:else}
						<img
							src={`data:image/png;base64,${qr.qr_code}`}
							alt="WhatsApp pairing QR"
							class="w-64 h-64 rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(37,24,24,0.06)]"
						/>
					{/if}
					<p class="text-xs text-[#584140]">
						QR expires {lastConnectedRel(qr.qr_code_expires_at) === 'just now'
							? 'soon'
							: `at ${new Date(qr.qr_code_expires_at).toLocaleTimeString()}`}.
						Polling every 5s — this page will update when the device connects.
					</p>
				</div>
			{/if}
		</section>

		<!-- Token override card -->
		<section class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] p-6">
			<div class="flex items-center gap-2 mb-1">
				<KeyRound size={18} class="text-[#ae2f34]" />
				<h2 class="text-lg font-semibold text-[#251818]">Gateway token</h2>
			</div>
			<p class="text-sm text-[#584140] mb-4">
				Paste a fresh gateway token if you've rotated it on the WhatsApp gateway service.
			</p>

			<form
				method="POST"
				action="?/updateToken"
				class="space-y-3"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						await invalidateAll();
					};
				}}
			>
				<input
					type="password"
					name="gateway_token"
					placeholder="Paste gateway token"
					autocomplete="off"
					class="w-full px-4 py-3 bg-[#fff0ef] rounded-2xl text-sm text-[#251818] focus:outline-none focus:ring-2 focus:ring-[#ae2f34]/30 font-mono"
				/>
				{#if tokenMsg?.error}
					<p class="text-sm text-[#EF4444]">{tokenMsg.error}</p>
				{:else if tokenMsg?.success}
					<p class="text-sm text-[#047857]">{tokenMsg.message ?? 'Saved'}</p>
				{/if}
				<button
					type="submit"
					class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-white bg-[#251818] hover:bg-[#1a1010] transition-colors"
				>
					Save token
				</button>
			</form>
		</section>

		<!-- Danger zone: drop the current pairing -->
		<section class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] p-6 mt-6 border border-[#EF4444]/15">
			<div class="flex items-center gap-2 mb-1">
				<XCircle size={18} class="text-[#991B1B]" />
				<h2 class="text-lg font-semibold text-[#251818]">Disconnect device</h2>
			</div>
			<p class="text-sm text-[#584140] mb-4">
				Drops the gateway pairing for the current phone. The next time you generate a QR, the
				gateway will pair from scratch. Notifications will pause until a new pairing is in
				place.
			</p>

			{#if dcMsg?.error}
				<p class="text-sm text-[#EF4444] mb-3">{dcMsg.error}</p>
			{:else if dcMsg?.success}
				<p class="text-sm text-[#047857] mb-3">{dcMsg.message ?? 'Disconnected'}</p>
			{/if}

			<form
				method="POST"
				action="?/disconnect"
				use:enhance={({ cancel }) => {
					if (!confirm('Disconnect this device from the gateway?')) {
						cancel();
						return;
					}
					return async ({ update, result }) => {
						await update();
						if (result.type === 'success') {
							await invalidateAll();
							await refreshStatus();
						}
					};
				}}
			>
				<button
					type="submit"
					disabled={!status?.is_connected && !status?.gateway_token_valid}
					class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-[#991B1B] bg-[#EF4444]/10 hover:bg-[#EF4444]/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					title={!status?.gateway_token_valid ? 'No pairing to disconnect' : 'Disconnect device'}
				>
					<XCircle size={16} /> Disconnect device
				</button>
			</form>
		</section>
	</main>
</div>
