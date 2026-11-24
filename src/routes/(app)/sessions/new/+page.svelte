<script lang="ts">
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ProgressStepper from '$lib/components/ui/ProgressStepper.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { Receipt } from '$lib/components/art';
	import { cn } from '$lib/utils/cn';
	import { ArrowLeft, ArrowRight, Plus, X, CircleAlert } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { form }: { form?: ActionData } = $props();

	// Two steps on this page (name, where to pay). The session is created on
	// submit; people and items are added on the session page, which picks up
	// with its own checklist. The server action is unchanged.
	let step = $state<1 | 2>(1);
	let title = $state('');
	let description = $state('');
	let currency = $state('IDR');
	let titleError = $state('');
	let submitting = $state(false);

	const suggestions = ['Dinner', 'Lunch', 'Trip', 'Groceries', 'Karaoke', 'Futsal', 'Birthday gift', 'Kos bills'];
	const currencies = [
		{ code: 'IDR', label: 'Rupiah (Rp)' },
		{ code: 'SGD', label: 'Singapore dollar (S$)' },
		{ code: 'USD', label: 'US dollar ($)' },
		{ code: 'EUR', label: 'Euro (€)' }
	];

	type BankRow = { bank_name: string; account_number: string; account_holder: string };
	const MAX_BANK_ACCOUNTS = 5;
	let bankRows = $state<BankRow[]>([{ bank_name: '', account_number: '', account_holder: '' }]);
	const commonBanks = ['BCA', 'Mandiri', 'BRI', 'BNI', 'GoPay', 'OVO', 'DANA', 'ShopeePay'];

	function addBankRow() {
		if (bankRows.length < MAX_BANK_ACCOUNTS) bankRows = [...bankRows, { bank_name: '', account_number: '', account_holder: '' }];
	}
	function removeBankRow(i: number) {
		bankRows = bankRows.filter((_, idx) => idx !== i);
		if (bankRows.length === 0) bankRows = [{ bank_name: '', account_number: '', account_holder: '' }];
	}

	async function next() {
		titleError = title.trim() ? '' : 'Give it a name your friends will recognise.';
		if (titleError) {
			document.getElementById('title')?.focus();
			return;
		}
		step = 2;
		await tick();
		document.getElementById('step-2-h')?.focus();
	}

	$effect(() => {
		if (form?.error) submitting = false;
	});
</script>

<Seo title="New session" noindex />

<div class="mx-auto grid max-w-5xl gap-10 px-4 pt-6 pb-12 sm:px-6 md:pt-10 lg:grid-cols-[minmax(0,1fr)_320px]">
	<div class="min-w-0">
		<a href="/dashboard" class="-ml-2 inline-flex h-9 items-center gap-1 rounded-pill pr-3 pl-1.5 text-sm font-semibold text-ink-soft hover:bg-mist hover:text-ink">
			<ArrowLeft size={17} aria-hidden="true" /> Cancel
		</a>
		<h1 class="text-poster mt-4 text-[clamp(2.5rem,7vw,4rem)]">New session</h1>
		<ProgressStepper
			class="mt-6 max-w-lg"
			currentStep={step}
			steps={[
				{ id: 1, label: 'Name' },
				{ id: 2, label: 'Transfer to' },
				{ id: 3, label: 'People & items' }
			]}
		/>

		{#if form?.error}
			<p class="mt-6 flex items-start gap-2 rounded-field bg-rejected-tint px-4 py-3 text-sm font-medium text-rejected" role="alert">
				<CircleAlert size={18} class="mt-px flex-none" />{form.error}
			</p>
		{/if}

		<form
			method="POST"
			class="mt-8"
			novalidate
			use:enhance={({ cancel }) => {
				if (!title.trim()) {
					step = 1;
					titleError = 'Give it a name your friends will recognise.';
					cancel();
					return;
				}
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<!-- Both steps stay in the DOM so every field is submitted. -->
			<section class={cn('flex flex-col gap-6', step !== 1 && 'hidden')} aria-labelledby="step-1-h">
				<h2 id="step-1-h" class="sr-only">Step 1: name</h2>
				<div class="flex flex-col gap-3">
					<Input
						label="What's it for?"
						id="title"
						name="title"
						bind:value={title}
						placeholder="Friday dinner"
						maxLength={200}
						error={!!titleError}
						errorText={titleError}
						size="lg"
						autofocus
						onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), next())}
					/>
					<div class="flex flex-wrap gap-2" role="group" aria-label="Suggestions">
						{#each suggestions as s (s)}
							<button
								type="button"
								onclick={() => ((title = s), (titleError = ''))}
								class={cn(
									'h-8 rounded-pill px-3 text-sm font-semibold transition-colors',
									title === s ? 'bg-ink text-card' : 'bg-card text-ink-soft shadow-raised hover:text-ink'
								)}
							>
								{s}
							</button>
						{/each}
					</div>
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="description" class="text-sm font-semibold">Note for everyone <span class="font-normal text-ink-soft">(optional)</span></label>
					<textarea
						id="description"
						name="description"
						bind:value={description}
						rows="2"
						maxlength={1000}
						placeholder="Thanks for coming! Transfer by Sunday please."
						class="resize-none rounded-field bg-card px-4 py-3 text-[15px] shadow-[inset_0_0_0_1.5px_var(--color-hairline)] placeholder:text-ink-soft/70 focus:shadow-[inset_0_0_0_2px_var(--color-steel)] focus:outline-none"
					></textarea>
					<p class="text-[13px] text-ink-soft">Shown in the WhatsApp message and on their payment page.</p>
				</div>

				<div class="flex flex-col gap-1.5 sm:max-w-xs">
					<label for="currency" class="text-sm font-semibold">Currency</label>
					<select
						id="currency"
						name="currency"
						bind:value={currency}
						class="h-11 rounded-field bg-card px-4 text-[15px] font-medium shadow-[inset_0_0_0_1.5px_var(--color-hairline)] focus:shadow-[inset_0_0_0_2px_var(--color-steel)] focus:outline-none"
					>
						{#each currencies as c (c.code)}<option value={c.code}>{c.label}</option>{/each}
					</select>
				</div>

				<Button size="lg" rightIcon={ArrowRight} onclick={next} class="self-start">Next</Button>
			</section>

			<section class={cn('flex flex-col gap-5', step !== 2 && 'hidden')} aria-labelledby="step-2-h">
				<div>
					<h2 id="step-2-h" tabindex="-1" class="text-heading text-2xl outline-none">Where should they transfer?</h2>
					<p class="mt-1 text-[15px] text-ink-soft">Friends copy this from their payment page. You can add or change it later.</p>
				</div>

				{#each bankRows as row, i (i)}
					<fieldset class="rounded-card bg-card p-4 shadow-raised sm:p-5">
						<div class="mb-3 flex items-center justify-between">
							<legend class="text-eyebrow">Account {i + 1}</legend>
							{#if bankRows.length > 1}
								<button type="button" onclick={() => removeBankRow(i)} class="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-mist hover:text-ink" aria-label="Remove account {i + 1}">
									<X size={16} />
								</button>
							{/if}
						</div>
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="flex flex-col gap-2">
								<Input label="Bank or e-wallet" name="bank_name[]" bind:value={row.bank_name} placeholder="BCA" maxLength={80} list="banks" />
								<div class="flex flex-wrap gap-1.5">
									{#each commonBanks.slice(0, 5) as b (b)}
										<button type="button" onclick={() => (row.bank_name = b)} class={cn('h-7 rounded-pill px-2.5 text-xs font-semibold', row.bank_name === b ? 'bg-ink text-card' : 'bg-mist text-ink-soft hover:text-ink')}>{b}</button>
									{/each}
								</div>
							</div>
							<Input label="Account or phone number" name="account_number[]" bind:value={row.account_number} placeholder="5270 1234 88" maxLength={40} inputmode="numeric" />
							<div class="sm:col-span-2">
								<Input label="Name on the account" name="account_holder[]" bind:value={row.account_holder} placeholder="As the bank shows it" maxLength={80} />
							</div>
						</div>
					</fieldset>
				{/each}
				<datalist id="banks">{#each commonBanks as b (b)}<option value={b}></option>{/each}</datalist>
				{#if bankRows.length < MAX_BANK_ACCOUNTS}
					<Button variant="secondary" leftIcon={Plus} onclick={addBankRow} class="self-start">Add another account</Button>
				{/if}

				<div class="mt-2 flex flex-wrap items-center gap-3">
					<Button type="submit" size="lg" loading={submitting} rightIcon={ArrowRight}>Create and add people</Button>
					<Button variant="ghost" onclick={() => (step = 1)} leftIcon={ArrowLeft} disabled={submitting}>Back</Button>
				</div>
			</section>
		</form>
	</div>

	<!-- Live preview of what friends will see at the top of their bill. -->
	<aside class="hidden lg:block" aria-label="Preview">
		<p class="text-eyebrow mb-3 px-1">What friends will see</p>
		<Receipt tilt={1} float paperClass="px-6 pt-6 pb-10">
			<p class="text-eyebrow">Payment request</p>
			<p class="text-heading mt-2 text-2xl [overflow-wrap:anywhere]">{title.trim() || 'Your session'}</p>
			{#if description.trim()}<p class="mt-2 text-[15px] text-ink-soft [overflow-wrap:anywhere]">{description}</p>{/if}
			<div class="my-4 border-t-[1.5px] border-dashed border-hairline"></div>
			<p class="text-[13px] text-ink-soft">Your share</p>
			<!-- Placeholder amount: ink-soft, not hairline, so it still passes contrast. -->
			<p class="text-amount text-3xl text-ink-soft">{currency === 'IDR' ? 'Rp' : currency} —</p>
			{#each bankRows.filter((r) => r.bank_name || r.account_number) as r, i (i)}
				<div class="mt-4 rounded-field bg-fog px-3 py-2">
					<p class="text-[12px] text-ink-soft">{r.bank_name || 'Bank'}{r.account_holder ? ` · ${r.account_holder}` : ''}</p>
					<p class="text-amount text-[17px]">{r.account_number || '—'}</p>
				</div>
			{/each}
		</Receipt>
		<p class="mt-4 px-1 text-[13px] text-ink-soft">Shares appear once you add people and items on the next screen.</p>
	</aside>
</div>
