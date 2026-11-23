<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { auth, logout } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';
	import { Plus, LogOut, Settings } from 'lucide-svelte';
	import Logo from './Logo.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { cn } from '$lib/utils/cn';
	import { getFirstName } from '$lib/utils/avatar';
	import { APP_NAV, isActive } from './nav';

	let { class: className }: { class?: string } = $props();

	async function handleLogout() {
		logout();
		toast.success('Signed out.');
		await goto('/', { invalidateAll: true });
	}

	const item = 'flex h-11 items-center gap-3 rounded-pill px-4 text-[15px] font-semibold transition-colors duration-150';
</script>

<!-- Same fog as the page: the sidebar is separated by space, not a line. -->
<aside class={cn('fixed inset-y-0 left-0 z-40 hidden w-60 flex-col px-4 py-6 md:flex', className)}>
	<div class="px-3 pb-8"><Logo size="sm" href="/dashboard" /></div>

	<nav aria-label="Main" class="flex flex-col gap-1">
		{#each APP_NAV as nav (nav.href)}
			{@const Icon = nav.icon}
			{@const active = isActive(nav.href, page.url.pathname)}
			<a
				href={nav.href}
				aria-current={active ? 'page' : undefined}
				class={cn(item, active ? 'bg-card text-ink shadow-raised' : 'text-ink-soft hover:bg-mist hover:text-ink')}
			>
				<Icon size={19} aria-hidden="true" />
				{nav.label}
			</a>
		{/each}
	</nav>

	<Button href="/sessions/new" leftIcon={Plus} class="mt-5 w-full">New session</Button>

	<div class="mt-auto flex flex-col gap-1">
		{#if $auth.user}
			<a href="/profile" class="mb-2 flex items-center gap-3 rounded-card px-3 py-2 transition-colors hover:bg-mist">
				<Avatar size="sm" src={$auth.user.avatar_url} fullName={$auth.user.full_name} phoneNumber={$auth.user.whatsapp_number} identifier={$auth.user.user_id} />
				<span class="min-w-0">
					<span class="block truncate text-sm font-semibold text-ink">{getFirstName($auth.user.full_name, $auth.user.whatsapp_number)}</span>
					<span class="block truncate text-xs text-ink-soft">{$auth.user.whatsapp_number}</span>
				</span>
			</a>
		{/if}
		<a
			href="/settings"
			aria-current={page.url.pathname === '/settings' ? 'page' : undefined}
			class={cn(item, 'h-10 text-sm', page.url.pathname === '/settings' ? 'bg-card text-ink shadow-raised' : 'text-ink-soft hover:bg-mist hover:text-ink')}
		>
			<Settings size={17} aria-hidden="true" /> Settings
		</a>
		<button type="button" onclick={handleLogout} class={cn(item, 'h-10 text-sm text-ink-soft hover:bg-mist hover:text-ink')}>
			<LogOut size={17} aria-hidden="true" /> Sign out
		</button>
	</div>
</aside>
