<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import StatusPill from '$lib/components/ui/StatusPill.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import SearchInput from '$lib/components/ui/SearchInput.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import RejectReasonModal from '$lib/components/ui/RejectReasonModal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ProgressStepper from '$lib/components/ui/ProgressStepper.svelte';
	import { toast } from '$lib/stores/toast';
	import { color } from '$lib/constants/design';
	import { Bell, Check, Plus, Inbox, Send } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import type { Tone } from '$lib/utils/status';


	let name = $state('Friday dinner');
	let phone = $state('6281234567890');
	let search = $state('');
	let agree = $state(true);
	let filter = $state<'all' | 'collecting' | 'settled'>('all');
	let modalOpen = $state(false);
	let confirmOpen = $state(false);
	let rejectOpen = $state(false);

	const tones: Array<[Tone, string]> = [
		['pending', 'Not paid'],
		['review', 'Check proof'],
		['paid', 'Paid'],
		['rejected', 'Sent back'],
		['accent', 'Collecting'],
		['neutral', 'Draft']
	];
	const swatches = Object.entries(color);
</script>

<svelte:head><title>Styleguide · Letpai</title></svelte:head>

{#snippet section(title: string, body: Snippet)}
	<section class="py-8">
		<h2 class="text-heading mb-5 text-2xl">{title}</h2>
		{@render body()}
	</section>
{/snippet}

<main class="mx-auto max-w-5xl px-5 pt-24 pb-24">
	<p class="text-eyebrow">Internal</p>
	<h1 class="text-poster mt-2 text-6xl sm:text-8xl">Styleguide</h1>
	<p class="mt-4 max-w-prose text-lg text-ink-soft">Every primitive in every state, on the real tokens. Not linked from the app.</p>

	{#snippet colours()}
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#each swatches as [key, value] (key)}
				<div class="rounded-card bg-card p-2 shadow-raised">
					<div class="h-12 rounded-[10px] shadow-[inset_0_0_0_1px_var(--color-mist)]" style="background:{value}"></div>
					<p class="mt-2 text-sm font-semibold">{key}</p>
					<p class="text-xs text-ink-soft tabular-nums">{value}</p>
				</div>
			{/each}
		</div>
	{/snippet}
	{@render section('Colour', colours)}

	{#snippet type()}
		<div class="space-y-4">
			<p class="text-poster text-6xl">You paid. <span class="text-coral">They pay you back.</span></p>
			<p class="text-heading text-3xl">Check these proofs</p>
			<p class="text-amount text-5xl">Rp 726.465</p>
			<p class="text-eyebrow">Friends transfer to</p>
			<p class="max-w-prose text-base">Body copy in Plus Jakarta Sans. Send every friend their exact share on WhatsApp, then watch the transfers come in.</p>
			<p class="text-sm text-ink-soft">Secondary text for meta and hints.</p>
		</div>
	{/snippet}
	{@render section('Type', type)}

	{#snippet buttons()}
		<div class="flex flex-wrap items-center gap-3">
			<Button leftIcon={Plus}>New session</Button>
			<Button variant="ink" leftIcon={Check}>Approve</Button>
			<Button variant="secondary">Cancel</Button>
			<Button variant="ghost" leftIcon={Bell}>Remind</Button>
			<Button variant="destructive">Delete</Button>
			<Button variant="whatsapp" leftIcon={Send}>Send on WhatsApp</Button>
		</div>
		<div class="mt-4 flex flex-wrap items-center gap-3">
			<Button size="sm">Small</Button>
			<Button>Default</Button>
			<Button size="lg">Large</Button>
			<Button loading>Saving</Button>
			<Button disabled>Disabled</Button>
			<Button href="/dev/styleguide" variant="secondary">As a link</Button>
		</div>
	{/snippet}
	{@render section('Buttons', buttons)}

	{#snippet pills()}
		<div class="flex flex-wrap gap-2">
			{#each tones as [tone, label] (tone)}<StatusPill {tone}>{label}</StatusPill>{/each}
		</div>
	{/snippet}
	{@render section('Status pills', pills)}

	{#snippet fields()}
		<div class="grid gap-5 sm:grid-cols-2">
			<Input label="Session name" bind:value={name} helperText="Shown to everyone in the WhatsApp message." showClear />
			<Input label="Password" type="password" value="hunter22" />
			<Input label="Amount" value="12" error errorText="Enter at least Rp 1.000." />
			<Input label="Disabled" value="Read only" disabled />
			<PhoneInput label="WhatsApp number" bind:value={phone} helperText="We send the code here." />
			<PhoneInput label="With an error" value="62812" error="That number looks too short." />
			<SearchInput bind:value={search} placeholder="Search contacts" />
			<Checkbox bind:checked={agree} label="Split service charge and tax too" />
		</div>
	{/snippet}
	{@render section('Fields', fields)}

	{#snippet nav()}
		<Tabs
			bind:value={filter}
			label="Filter sessions"
			tabs={[
				{ value: 'all', label: 'All', count: 5 },
				{ value: 'collecting', label: 'Collecting', count: 3 },
				{ value: 'settled', label: 'Settled', count: 1 }
			]}
		/>
		<div class="mt-6 max-w-md"><ProgressStepper currentStep={2} steps={[{ id: 1, label: 'Details' }, { id: 2, label: 'People' }, { id: 3, label: 'Items' }, { id: 4, label: 'Send' }]} /></div>
	{/snippet}
	{@render section('Filters and steps', nav)}

	{#snippet cards()}
		<div class="grid gap-4 sm:grid-cols-3">
			<Card><p class="text-eyebrow">Static</p><p class="text-amount mt-2 text-3xl">Rp 450.450</p></Card>
			<Card onclick={() => toast.success('Card clicked')} label="Open session"><p class="font-semibold">Clickable card</p><p class="text-sm text-ink-soft">Lifts on hover.</p></Card>
			<Card padding="none"><div class="flex items-center gap-3 p-4"><Avatar fullName="Citra Wulandari" identifier="c-3" /><Avatar fullName="Bima Santoso" identifier="c-2" size="sm" /><Avatar fullName="Alya" identifier="c-1" size="lg" /></div></Card>
		</div>
	{/snippet}
	{@render section('Cards and avatars', cards)}

	{#snippet empty()}
		<EmptyState icon={Inbox} title="No sessions yet" description="Start one after your next dinner, trip or groceries run." action={{ label: 'New session', icon: Plus, href: '/dev/styleguide' }} />
	{/snippet}
	{@render section('Empty state', empty)}

	{#snippet overlays()}
		<div class="flex flex-wrap gap-3">
			<Button variant="secondary" onclick={() => (modalOpen = true)}>Open modal</Button>
			<Button variant="secondary" onclick={() => (confirmOpen = true)}>Open confirm</Button>
			<Button variant="secondary" onclick={() => (rejectOpen = true)}>Open send-back</Button>
			<Button variant="secondary" onclick={() => toast.success('Reminder sent to Citra')}>Success toast</Button>
			<Button variant="secondary" onclick={() => toast.error('That number is not on WhatsApp.')}>Error toast</Button>
		</div>
		<Modal bind:open={modalOpen} title="Edit session" description="Changes are saved for everyone.">
			<Input label="Name" bind:value={name} />
			{#snippet footer()}
				<Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
				<Button onclick={() => (modalOpen = false)}>Save</Button>
			{/snippet}
		</Modal>
		<ConfirmDialog bind:open={confirmOpen} title="Cancel this session?" message="Nobody will be able to pay through their link any more." confirmText="Cancel session" cancelText="Keep it" />
		<RejectReasonModal open={rejectOpen} participantName="Dimas" onsubmit={() => (rejectOpen = false)} oncancel={() => (rejectOpen = false)} />
	{/snippet}
	{@render section('Overlays', overlays)}

</main>
