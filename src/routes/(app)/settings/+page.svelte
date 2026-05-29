<script lang="ts">
	import { Bell, CreditCard, Globe, LogOut, ShieldCheck, User } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { auth, logout } from '$lib/stores/auth';
	import { toast } from '$lib/stores/toast';

	async function handleLogout() {
		logout();
		toast.success('Logged out');
		await goto('/', { invalidateAll: true });
	}
</script>

<svelte:head>
	<title>Settings · Letpai</title>
</svelte:head>

<div class="min-h-screen">
	<div class="max-w-2xl mx-auto px-4 py-8 space-y-6">
		<header>
			<h1 class="text-3xl font-semibold text-[#251818] tracking-tight">Settings</h1>
			<p class="text-sm text-[#584140] mt-1">Account, notifications, and how Letpai handles money.</p>
		</header>

		<!-- Account -->
		<section class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] overflow-hidden">
			<div class="px-6 py-4">
				<h2 class="text-sm font-semibold uppercase tracking-wider text-[#584140]">Account</h2>
			</div>
			<a
				href="/profile"
				class="flex items-center gap-3 px-6 py-4 hover:bg-[#fff0ef] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] no-underline"
			>
				<div class="w-10 h-10 bg-[#fff0ef] rounded-2xl flex items-center justify-center flex-shrink-0">
					<User class="w-5 h-5 text-[#ae2f34]" />
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-[#251818]">Profile</p>
					<p class="text-xs text-[#584140] truncate">
						{$auth.user?.full_name || 'No name set'} · {$auth.user?.whatsapp_number || ''}
					</p>
				</div>
				<span class="text-[#584140]">›</span>
			</a>
		</section>

		<!-- Preferences (placeholders for now — wire to real prefs when backend exposes them) -->
		<section class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] overflow-hidden">
			<div class="px-6 py-4">
				<h2 class="text-sm font-semibold uppercase tracking-wider text-[#584140]">Preferences</h2>
			</div>
			<div class="flex items-center gap-3 px-6 py-4 border-b border-[#fbe3e1]/0">
				<div class="w-10 h-10 bg-[#F59E0B]/15 rounded-2xl flex items-center justify-center flex-shrink-0">
					<Bell class="w-5 h-5 text-[#92400E]" />
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-[#251818]">WhatsApp reminders</p>
					<p class="text-xs text-[#584140]">Send participants reminders if they haven't paid.</p>
				</div>
				<span class="text-xs text-[#584140]">Always on</span>
			</div>
			<div class="flex items-center gap-3 px-6 py-4">
				<div class="w-10 h-10 bg-[#3B82F6]/15 rounded-2xl flex items-center justify-center flex-shrink-0">
					<Globe class="w-5 h-5 text-[#1E40AF]" />
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-[#251818]">Default currency</p>
					<p class="text-xs text-[#584140]">Used for new sessions you create.</p>
				</div>
				<span class="text-xs text-[#584140]">IDR</span>
			</div>
			<div class="flex items-center gap-3 px-6 py-4">
				<div class="w-10 h-10 bg-[#10B981]/15 rounded-2xl flex items-center justify-center flex-shrink-0">
					<CreditCard class="w-5 h-5 text-[#047857]" />
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-[#251818]">Payment methods</p>
					<p class="text-xs text-[#584140]">Coming soon — accept QRIS, GoPay, OVO directly.</p>
				</div>
				<span class="text-xs text-[#584140]">Soon</span>
			</div>
		</section>

		<!-- Security -->
		<section class="bg-white rounded-3xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] overflow-hidden">
			<div class="px-6 py-4">
				<h2 class="text-sm font-semibold uppercase tracking-wider text-[#584140]">Security</h2>
			</div>
			<a
				href="/forgot-password"
				class="flex items-center gap-3 px-6 py-4 hover:bg-[#fff0ef] transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
			>
				<div class="w-10 h-10 bg-[#6df5e1]/30 rounded-2xl flex items-center justify-center flex-shrink-0">
					<ShieldCheck class="w-5 h-5 text-[#006b5f]" />
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-[#251818]">Change password</p>
					<p class="text-xs text-[#584140]">We'll send a verification code to your WhatsApp.</p>
				</div>
				<span class="text-[#584140]">›</span>
			</a>
		</section>

		<!-- Sign out -->
		<button
			type="button"
			onclick={handleLogout}
			class="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#ae2f34] bg-white rounded-2xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] hover:bg-[#fbe3e1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
		>
			<LogOut class="w-4 h-4" />
			Sign out
		</button>
	</div>
</div>
