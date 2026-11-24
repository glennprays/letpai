<script lang="ts">
	import { untrack } from 'svelte';
	import { CircleCheck, QrCode, RefreshCw } from 'lucide-svelte';
	import Seo from '$lib/components/Seo.svelte';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import StatusPill from '$lib/components/ui/StatusPill.svelte';
	import {
		generateQRCode,
		getWhatsAppStatus,
		registerGatewayPhone,
		type QRCodeResponse,
		type WhatsAppStatus
	} from '$lib/services/admin';
	import { toUserMessage } from '$lib/services/api';
	import { gatewayState, timeAgo } from '$lib/utils/admin';
	import { formatWhatsappDisplay } from '$lib/utils/phone';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Server snapshot first; refreshes and pairing overwrite it locally.
	let status = $state<WhatsAppStatus | null>(untrack(() => data.initialStatus));
	let refreshing = $state(false);
	let refreshError = $state('');
	let qr = $state<QRCodeResponse | null>(null);
	let qrLoading = $state(false);
	let qrError = $state('');
	let now = $state(Date.now());

	// Phone registration step: shown until a gateway JWT exists.
	let regPhone = $state('');
	let regLoading = $state(false);
	let regError = $state('');
	const needsRegistration = $derived(status === null || status.has_token !== true);

	const gateway = $derived(gatewayState(status));
	const connected = $derived(status?.is_connected === true);
	const secondsLeft = $derived(qr ? Math.max(0, Math.round((Date.parse(qr.qr_code_expires_at) - now) / 1000)) : 0);
	const expired = $derived(!!qr && secondsLeft === 0);
	const qrSrc = $derived(qr ? (/^data:image\//.test(qr.qr_code) ? qr.qr_code : `data:image/png;base64,${qr.qr_code}`) : '');

	// While a code is on screen: tick the countdown every second and ask the
	// gateway every 5 s whether the phone has linked.
	$effect(() => {
		if (!qr || connected) return;
		const tick = setInterval(() => (now = Date.now()), 1000);
		const poll = setInterval(() => !expired && refresh(true), 5000);
		return () => {
			clearInterval(tick);
			clearInterval(poll);
		};
	});

	async function refresh(quiet = false) {
		if (!quiet) refreshing = true;
		refreshError = '';
		try {
			status = await getWhatsAppStatus();
			if (status?.is_connected) qr = null;
		} catch (err) {
			if (!quiet) refreshError = toUserMessage(err, "Couldn't reach the gateway.");
		} finally {
			refreshing = false;
		}
	}

	async function pair() {
		qrError = '';
		qrLoading = true;
		try {
			qr = await generateQRCode();
			now = Date.now();
		} catch (err) {
			qr = null;
			qrError = toUserMessage(err, "The gateway didn't return a code. Try again.");
		} finally {
			qrLoading = false;
		}
	}

	async function register() {
		regError = '';
		regLoading = true;
		try {
			await registerGatewayPhone(regPhone);
			// Refresh status (now has_token) and jump straight to pairing.
			status = await getWhatsAppStatus();
			await pair();
		} catch (err) {
			regError = toUserMessage(err, "The gateway didn't accept that number. Try again.");
		} finally {
			regLoading = false;
		}
	}

	const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
</script>

<Seo title="WhatsApp gateway" noindex />

<AdminHeader title="WhatsApp gateway" description="Every bill, reminder and sign-in code goes out through this connection.">
	{#snippet actions()}
		<Button variant="secondary" size="sm" leftIcon={RefreshCw} loading={refreshing} onclick={() => refresh()}>Check now</Button>
	{/snippet}
</AdminHeader>

<div class="mt-6 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
	<Card class="self-start">
		<section aria-labelledby="gw-status">
			<div class="flex items-center justify-between gap-3">
				<h2 id="gw-status" class="text-eyebrow text-ink-soft">Status</h2>
				<StatusPill tone={gateway.tone}>{gateway.label}</StatusPill>
			</div>
			<p class="mt-4 text-ink">{gateway.detail}</p>
			<dl class="mt-5 grid grid-cols-2 gap-4 text-sm">
				<div>
					<dt class="text-ink-soft">Sending from</dt>
					<dd class="mt-0.5 font-semibold text-ink tabular-nums">{status?.token_phone || status?.phone_number ? formatWhatsappDisplay(status?.token_phone || status?.phone_number || '') : '—'}</dd>
				</div>
				<div>
					<dt class="text-ink-soft">Last connected</dt>
					<dd class="mt-0.5 font-semibold text-ink">{timeAgo(status?.last_connected_at)}</dd>
				</div>
			</dl>
			{#if status?.token_expires_at}
				<p class="mt-3 text-sm text-ink-soft">
					Token expires <strong class="text-ink">{new Date(status.token_expires_at).toLocaleDateString('en-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
				</p>
			{/if}
			{#if refreshError}<p class="mt-4 text-sm text-rejected" role="alert">{refreshError}</p>{/if}
		</section>
	</Card>

	<Card>
		<section aria-labelledby="gw-pair">
			{#if needsRegistration}
				<h2 id="gw-pair" class="text-heading text-lg">Connect WhatsApp</h2>
				<p class="mt-3 text-sm text-ink">Enter the WhatsApp number this workspace sends from. We'll register it with the gateway, then link the phone here.</p>
				<form class="mt-5 flex flex-col gap-4" onsubmit={(e) => { e.preventDefault(); register(); }}>
					<PhoneInput bind:value={regPhone} label="WhatsApp number" helperText="This is where bills, reminders and sign-in codes come from." />
					{#if regError}<p class="text-sm text-rejected" role="alert">{regError}</p>{/if}
					<Button type="submit" variant="ink" loading={regLoading} disabled={!regPhone}>Connect WhatsApp</Button>
				</form>
			{:else}
				<h2 id="gw-pair" class="text-heading text-lg">{status?.is_connected ? 'Link a different phone' : 'Link a phone'}</h2>
			<ol class="mt-3 flex flex-col gap-2 text-sm text-ink">
				{#each ['Show a code here.', 'On the sending phone, open WhatsApp → Settings → Linked devices → Link a device.', 'Scan the code. This page updates by itself once it links.'] as stepText, i (i)}
					<li class="flex gap-3">
						<span class="grid size-6 flex-none place-items-center rounded-full bg-mist text-xs font-bold text-ink tabular-nums">{i + 1}</span>
						<span class="pt-0.5">{stepText}</span>
					</li>
				{/each}
			</ol>

			{#if qr && !expired}
				<div class="mt-6 flex flex-col items-center gap-3 rounded-sheet bg-fog p-5">
					<img src={qrSrc} alt="WhatsApp pairing code" width="224" height="224" class="size-56 rounded-card bg-card p-3" />
					<p class="text-sm text-ink-soft" aria-live="polite">
						Expires in <strong class="text-ink tabular-nums">{mmss(secondsLeft)}</strong> · checking every 5 seconds
					</p>
				</div>
			{:else if expired}
				<div class="mt-6 rounded-sheet bg-fog p-5 text-center">
					<p class="font-semibold text-ink">That code expired</p>
					<p class="mt-1 text-sm text-ink-soft">Codes last a short while for safety. Show a fresh one and scan again.</p>
				</div>
			{:else if status?.is_connected && !qr}
				<p class="mt-5 flex items-center gap-2 text-sm font-semibold text-paid">
					<CircleCheck size={16} aria-hidden="true" /> Linked and sending. Only re-link if you're switching phones.
				</p>
			{/if}

			{#if qrError}<p class="mt-4 text-sm text-rejected" role="alert">{qrError}</p>{/if}

			<Button class="mt-5" variant={status?.is_connected ? 'secondary' : 'ink'} leftIcon={QrCode} loading={qrLoading} onclick={pair}>
				{qr ? 'Show a new code' : 'Show pairing code'}
			</Button>
			{/if}
		</section>
	</Card>
</div>

<section class="mt-4 rounded-card bg-mist p-5 text-sm text-ink-soft" aria-labelledby="gw-token">
	<h2 id="gw-token" class="font-semibold text-ink">How the connection works</h2>
	<p class="mt-1">
		Registering a number above mints a gateway token that lasts about a year. The backend stores it
		encrypted and renews the setup when the number changes. No env edit needed.
	</p>
</section>
