<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import {
		Shield,
		LayoutDashboard,
		MessageCircle,
		Users,
		User,
		LogOut
	} from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const onLoginRoute = $derived($page.url.pathname === '/admin/login');
	const isSuperAdmin = $derived(data.profile?.role === 'super_admin');

	const nav = $derived([
		{ href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
		{ href: '/admin/whatsapp', icon: MessageCircle, label: 'WhatsApp', exact: false },
		{ href: '/admin/profile', icon: User, label: 'Profile', exact: false },
		...(isSuperAdmin
			? [{ href: '/admin/admins', icon: Users, label: 'Admins', exact: false }]
			: [])
	]);

	function isActive(href: string, exact: boolean): boolean {
		const pathname = $page.url.pathname;
		return exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');
	}
</script>

{#if onLoginRoute || !data.profile}
	{@render children()}
{:else}
	<div
		class="min-h-screen flex bg-[#fff8f7]"
		style="font-family:'Plus Jakarta Sans',sans-serif;"
	>
		<aside
			class="hidden md:flex flex-col w-60 h-screen bg-[#fff0ef]/80 backdrop-blur-xl fixed left-0 top-0 z-40"
		>
			<div class="px-6 py-6 flex items-center gap-3">
				<div
					class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] flex items-center justify-center"
				>
					<Shield size={18} color="#fff" />
				</div>
				<div class="overflow-hidden">
					<p class="text-sm font-semibold text-[#251818] leading-tight truncate">Letpai admin</p>
					<p class="text-xs text-[#584140] leading-tight truncate">
						{data.profile.full_name}
					</p>
				</div>
			</div>

			<nav aria-label="Admin" class="flex-1 px-3 space-y-1 mt-2">
				{#each nav as item (item.href)}
					{@const Icon = item.icon}
					{@const active = isActive(item.href, item.exact)}
					<a
						href={item.href}
						class="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors {active
							? 'bg-[#ae2f34]/10 text-[#ae2f34]'
							: 'text-[#584140] hover:bg-[#fbe3e1]'}"
					>
						<Icon size={18} />
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>

			<div class="px-3 py-4">
				<div class="text-xs text-[#584140] px-3 mb-2 uppercase tracking-wide font-semibold">
					Signed in as
				</div>
				<div class="px-3 py-2 rounded-2xl bg-white">
					<p class="text-sm font-medium text-[#251818] truncate">{data.profile.full_name}</p>
					<p class="text-xs text-[#584140]">{data.profile.role.replace('_', ' ')}</p>
				</div>
				<form
					method="POST"
					action="/admin?/logout"
					class="mt-2"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
						};
					}}
				>
					<button
						type="submit"
						class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium text-[#ae2f34] hover:bg-[#fbe3e1] transition-colors"
					>
						<LogOut size={16} /> Sign out
					</button>
				</form>
			</div>
		</aside>

		<!-- Mobile top bar (collapsed sidebar) -->
		<header
			class="md:hidden sticky top-0 z-30 w-full bg-[#fff0ef]/90 backdrop-blur-xl border-b border-[#f5dddb] px-4 py-3 flex items-center gap-3"
		>
			<div
				class="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] flex items-center justify-center flex-shrink-0"
			>
				<Shield size={16} color="#fff" />
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-semibold text-[#251818] truncate">Letpai admin</p>
				<p class="text-[11px] text-[#584140] truncate">{data.profile.full_name} · {data.profile.role.replace('_', ' ')}</p>
			</div>
			<form method="POST" action="/admin?/logout">
				<button
					type="submit"
					class="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium text-[#ae2f34] hover:bg-[#fbe3e1] transition-colors"
				>
					<LogOut size={14} /> Sign out
				</button>
			</form>
		</header>

		<!-- Mobile horizontal nav -->
		<nav class="md:hidden sticky top-[60px] z-20 bg-[#fff8f7] border-b border-[#f5dddb] px-3 py-2 flex gap-2 overflow-x-auto">
			{#each nav as item (item.href)}
				{@const Icon = item.icon}
				{@const active = isActive(item.href, item.exact)}
				<a
					href={item.href}
					class="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-medium whitespace-nowrap transition-colors {active
						? 'bg-[#ae2f34]/10 text-[#ae2f34]'
						: 'text-[#584140] hover:bg-[#fbe3e1]'}"
				>
					<Icon size={14} />
					{item.label}
				</a>
			{/each}
		</nav>

		<main class="flex-1 md:ml-60 min-h-screen">
			{@render children()}
		</main>
	</div>
{/if}
