<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ArrowRight, Menu, X, User, LogOut, Settings } from 'lucide-svelte';
  import Logo from '$lib/components/layout/Logo.svelte';
  import { auth, logout } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';
  import { getFirstName, getAvatarWithFallback } from '$lib/utils/avatar';

  let { variant = 'full' } = $props<{ variant: 'full' | 'auth' | 'loggedIn' }>();
  let mobileMenuOpen = $state(false);
  let userMenuOpen = $state(false);

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function handleLogout() {
    logout();
    toast.success('Logged out successfully');
    goto('/');
    userMenuOpen = false;
  }

  function toggleUserMenu() {
    userMenuOpen = !userMenuOpen;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      userMenuOpen = false;
    }
  }

  function getUserAvatar(avatarUrl: string | undefined | null, fullName: string | undefined | null): string {
    return getAvatarWithFallback(avatarUrl, fullName, $auth.user?.whatsapp_number, $auth.user?.user_id);
  }
</script>

<svelte:window onclick={handleClickOutside} />

<header
  class="sticky top-0 z-50 bg-[#fff8f7]/90 backdrop-blur-xl font-sans animate-[fadeInDown_0.3s_ease-out]"
>
  <div class="max-w-[1200px] mx-auto h-16 px-6 flex items-center justify-between">
    <a
      href="/"
      class="inline-flex no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f7] rounded-2xl"
      onclick={(e) => { if ($page.url.pathname === '/') e.preventDefault(); }}
    >
      <Logo size="md" />
    </a>

    {#if variant === 'full'}
      <nav aria-label="Primary" class="hidden md:flex items-center gap-8">
        <a href="/about" class="text-sm font-medium text-[#584140] hover:text-[#251818] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] rounded-md">About</a>
        <a href="/login" class="text-sm font-medium text-[#584140] hover:text-[#251818] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] rounded-md">Sign in</a>
        <a href="/register" class="text-sm font-medium text-[#584140] hover:text-[#251818] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] rounded-md">Register</a>
        <button
          class="inline-flex items-center gap-2 px-5 h-11 rounded-2xl text-[15px] font-semibold text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] shadow-[0_4px_14px_rgba(174,47,52,0.18)] hover:shadow-[0_6px_20px_rgba(174,47,52,0.24)] hover:opacity-95 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f7]"
          onclick={() => goto('/register')}
        >
          Get Started <ArrowRight size={16} />
        </button>
      </nav>

      <button
        class="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-2xl text-[#251818] hover:bg-[#fbe3e1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {#if mobileMenuOpen}<X size={24} />{:else}<Menu size={24} />{/if}
      </button>
    {:else if variant === 'auth'}
      <nav aria-label="Primary" class="hidden md:flex items-center gap-8">
        <a href="/" class="text-sm font-medium text-[#584140] hover:text-[#251818] transition-colors">Back to home</a>
      </nav>
    {:else if variant === 'loggedIn'}
      <nav aria-label="Primary" class="hidden md:flex items-center gap-8">
        <a href="/dashboard" class="text-sm font-medium text-[#584140] hover:text-[#251818] transition-colors">Dashboard</a>
        <a href="/sessions" class="text-sm font-medium text-[#584140] hover:text-[#251818] transition-colors">Sessions</a>
        <a href="/contacts" class="text-sm font-medium text-[#584140] hover:text-[#251818] transition-colors">Contacts</a>

        <div class="user-menu-container relative flex items-center">
          <button
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fbe3e1] hover:bg-[#f5dddb] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
            onclick={toggleUserMenu}
            aria-label="User menu"
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
          >
            <div class="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                src={getUserAvatar($auth.user?.avatar_url, $auth.user?.full_name)}
                alt={getFirstName($auth.user?.full_name, $auth.user?.whatsapp_number)}
                class="w-full h-full rounded-full object-cover"
              />
            </div>
            <span class="text-sm font-semibold text-[#251818] max-w-[120px] truncate">
              {getFirstName($auth.user?.full_name, $auth.user?.whatsapp_number)}
            </span>
          </button>

          {#if userMenuOpen}
            <div
              role="menu"
              class="absolute top-[calc(100%+8px)] right-0 w-[280px] bg-white rounded-[20px] shadow-[0_24px_48px_-4px_rgba(37,24,24,0.12)] p-3 animate-[fadeInDown_0.2s_ease-out] z-[100]"
            >
              <div class="flex items-center gap-3 p-2">
                <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    src={getUserAvatar($auth.user?.avatar_url, $auth.user?.full_name)}
                    alt={getFirstName($auth.user?.full_name, $auth.user?.whatsapp_number)}
                    class="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div class="flex flex-col gap-0.5 overflow-hidden">
                  <span class="text-sm font-semibold text-[#251818] truncate">{getFirstName($auth.user?.full_name, $auth.user?.whatsapp_number)}</span>
                  <span class="text-xs text-[#584140] truncate">{$auth.user?.whatsapp_number || ''}</span>
                </div>
              </div>
              <div class="h-2"></div>
              <a
                href="/profile"
                role="menuitem"
                class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#251818] rounded-[14px] hover:bg-[#fff0ef] transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
                onclick={() => userMenuOpen = false}
              >
                <User size={16} /> Profile
              </a>
              <a
                href="/settings"
                role="menuitem"
                class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#251818] rounded-[14px] hover:bg-[#fff0ef] transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
                onclick={() => userMenuOpen = false}
              >
                <Settings size={16} /> Settings
              </a>
              <div class="h-2"></div>
              <button
                role="menuitem"
                class="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm font-medium text-[#ae2f34] rounded-[14px] hover:bg-[#fbe3e1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
                onclick={handleLogout}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          {/if}
        </div>
      </nav>

      <button
        class="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-2xl text-[#251818] hover:bg-[#fbe3e1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {#if mobileMenuOpen}<X size={24} />{:else}<Menu size={24} />{/if}
      </button>
    {/if}
  </div>

  {#if mobileMenuOpen && variant === 'full'}
    <nav
      aria-label="Mobile"
      class="md:hidden flex flex-col gap-0 px-6 pb-6 bg-[#fff0ef] animate-[fadeIn_0.2s_ease-out]"
    >
      <a href="/about" class="text-base font-semibold text-[#251818] hover:text-[#ae2f34] py-4 transition-colors no-underline" onclick={closeMobileMenu}>About</a>
      <a href="/login" class="text-base font-semibold text-[#251818] hover:text-[#ae2f34] py-4 transition-colors no-underline" onclick={closeMobileMenu}>Sign in</a>
      <a href="/register" class="text-base font-semibold text-[#251818] hover:text-[#ae2f34] py-4 transition-colors no-underline" onclick={closeMobileMenu}>Register</a>
      <button
        class="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 h-12 rounded-2xl text-base font-semibold text-white bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] hover:opacity-95 active:scale-[0.98] transition-all duration-150"
        onclick={() => { mobileMenuOpen = false; goto('/register'); }}
      >
        Get Started <ArrowRight size={16} />
      </button>
    </nav>
  {/if}

  {#if mobileMenuOpen && variant === 'loggedIn'}
    <nav
      aria-label="Mobile"
      class="md:hidden flex flex-col gap-0 px-6 pb-6 bg-[#fff0ef] animate-[fadeIn_0.2s_ease-out]"
    >
      <a href="/dashboard" class="text-base font-semibold text-[#251818] hover:text-[#ae2f34] py-4 transition-colors no-underline" onclick={closeMobileMenu}>Dashboard</a>
      <a href="/sessions" class="text-base font-semibold text-[#251818] hover:text-[#ae2f34] py-4 transition-colors no-underline" onclick={closeMobileMenu}>Sessions</a>
      <a href="/contacts" class="text-base font-semibold text-[#251818] hover:text-[#ae2f34] py-4 transition-colors no-underline" onclick={closeMobileMenu}>Contacts</a>
      <a href="/profile" class="text-base font-semibold text-[#251818] hover:text-[#ae2f34] py-4 transition-colors no-underline" onclick={closeMobileMenu}>Profile</a>
      <a href="/settings" class="text-base font-semibold text-[#251818] hover:text-[#ae2f34] py-4 transition-colors no-underline" onclick={closeMobileMenu}>Settings</a>
      <button
        class="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 h-12 rounded-2xl text-base font-semibold text-[#ae2f34] bg-[#fbe3e1] hover:bg-[#f5dddb] active:scale-[0.98] transition-all duration-150"
        onclick={() => { handleLogout(); mobileMenuOpen = false; }}
      >
        <LogOut size={16} /> Logout
      </button>
    </nav>
  {/if}
</header>

<style>
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
