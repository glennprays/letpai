<script lang="ts">
  import { page } from '$app/stores';
  import { auth, logout } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import { goto } from '$app/navigation';
  import {
    LayoutDashboard,
    Users,
    Receipt,
    User,
    LogOut
  } from 'lucide-svelte';
  import Logo from './Logo.svelte';
  import { getFirstName, getAvatarWithFallback } from '$lib/utils/avatar';

  interface Props {
    class?: string;
  }

  let { class: className }: Props = $props();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/contacts', icon: Users, label: 'Contacts' },
    { href: '/sessions', icon: Receipt, label: 'Sessions' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  function isActive(href: string): boolean {
    if (href === '/dashboard' && $page.url.pathname === '/dashboard') return true;
    if (href === '/contacts' && $page.url.pathname.startsWith('/contacts')) return true;
    if (href === '/sessions' && $page.url.pathname.startsWith('/sessions')) return true;
    if (href === '/profile' && $page.url.pathname === '/profile') return true;
    return false;
  }

  async function handleLogout() {
    logout();
    toast.success('Logged out successfully');
    await goto('/', { invalidateAll: true });
  }
</script>

<aside
  class="hidden md:flex flex-col w-60 h-screen bg-[#fff0ef]/80 backdrop-blur-xl fixed left-0 top-0 z-40 {className}"
>
  <div class="px-6 py-6 flex-shrink-0">
    <a
      href="/dashboard"
      class="inline-flex rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f7]"
    >
      <Logo size="sm" />
    </a>
  </div>

  <nav aria-label="Primary" class="flex-1 px-3 space-y-1">
    {#each navItems as item}
      {@const Icon = item.icon}
      {@const active = isActive(item.href)}
      <a
        href={item.href}
        aria-current={active ? 'page' : undefined}
        class={active
          ? 'flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#ffe9e7] text-[#ae2f34] font-semibold text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f7]'
          : 'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[#584140] hover:bg-[#fbe3e1] font-medium text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f7]'}
      >
        <Icon size={20} aria-hidden="true" />
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>

  <div class="px-3 pb-4 space-y-1">
    {#if $auth.user}
      <div class="flex items-center gap-3 px-3 py-2 mb-1">
        <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#f5dddb]">
          <img
            src={getAvatarWithFallback($auth.user?.avatar_url, $auth.user?.full_name, $auth.user?.whatsapp_number, $auth.user?.user_id)}
            alt={getFirstName($auth.user?.full_name, $auth.user?.whatsapp_number)}
            class="w-full h-full object-cover"
          />
        </div>
        <span class="text-sm font-medium text-[#251818] truncate">
          {getFirstName($auth.user?.full_name, $auth.user?.whatsapp_number)}
        </span>
      </div>
    {/if}

    <button
      onclick={handleLogout}
      class="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[#ae2f34] hover:bg-[#fbe3e1] font-medium text-sm transition-all duration-150 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f7]"
    >
      <LogOut size={20} aria-hidden="true" />
      <span>Sign Out</span>
    </button>
  </div>
</aside>
