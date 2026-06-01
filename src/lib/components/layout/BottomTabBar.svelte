<script lang="ts">
  import { page } from '$app/stores';
  import {
    LayoutDashboard,
    Users,
    Receipt,
    User
  } from 'lucide-svelte';

  interface Props {
    class?: string;
  }

  let { class: className }: Props = $props();

  const tabs = [
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
</script>

<nav
  aria-label="Primary"
  class="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/80 backdrop-blur-xl shadow-[0_-8px_24px_-4px_rgba(37,24,24,0.06)] {className}"
>
  <div class="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
    {#each tabs as tab}
      {@const Icon = tab.icon}
      {@const active = isActive(tab.href)}
      <a
        href={tab.href}
        aria-current={active ? 'page' : undefined}
        class={active
          ? 'flex flex-col items-center justify-center gap-1 px-4 py-1.5 min-h-[44px] min-w-[44px] rounded-2xl text-[#ae2f34] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]'
          : 'flex flex-col items-center justify-center gap-1 px-4 py-1.5 min-h-[44px] min-w-[44px] rounded-2xl text-[#584140]/80 hover:text-[#584140] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]'}
      >
        <div class="relative">
          <Icon size={22} aria-hidden="true" />
          {#if active}
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ae2f34]" aria-hidden="true"></div>
          {/if}
        </div>
        <span class="text-[11px] font-medium">{tab.label}</span>
      </a>
    {/each}
  </div>
</nav>
