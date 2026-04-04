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

  // Close user menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      userMenuOpen = false;
    }
  }

  // Get avatar URL with fallback
  function getUserAvatar(avatarUrl: string | undefined | null, fullName: string | undefined | null): string {
    return getAvatarWithFallback(avatarUrl, fullName, $auth.user?.user_id);
  }
</script>

<svelte:window onclick={handleClickOutside} />

<header
  class="navbar"
>
  <div class="navbar-inner">
    <a href="/" class="logo-link" onclick={(e) => { if ($page.url.pathname === '/') e.preventDefault(); }}>
      <Logo size="md" />
    </a>

    {#if variant === 'full'}
      <nav class="desktop-nav">
        <a href="/about" class="nav-link">About</a>
        <a href="/login" class="nav-link">Sign in</a>
        <a href="/register" class="nav-link">Register</a>
        <button
          class="btn-coral"
          onclick={() => goto('/register')}
        >
          Get Started <ArrowRight size={16} />
        </button>
      </nav>

      <button class="hamburger" onclick={() => (mobileMenuOpen = !mobileMenuOpen)} aria-label="Toggle menu">
        {#if mobileMenuOpen}
          <X size={24} color="#111827" />
        {:else}
          <Menu size={24} color="#111827" />
        {/if}
      </button>
    {:else if variant === 'auth'}
      <nav class="desktop-nav">
        <a href="/" class="nav-link">Back to home</a>
      </nav>
    {:else if variant === 'loggedIn'}
      <nav class="desktop-nav">
        <a href="/dashboard" class="nav-link">Dashboard</a>
        <a href="/sessions" class="nav-link">Sessions</a>
        <a href="/contacts" class="nav-link">Contacts</a>

        <div class="user-menu-container">
          <button class="user-avatar-btn" onclick={toggleUserMenu} aria-label="User menu">
            <div class="user-avatar">
              <img
                src={getUserAvatar($auth.user?.avatar_url, $auth.user?.full_name)}
                alt={getFirstName($auth.user?.full_name)}
                class="w-full h-full rounded-full object-cover"
              />
            </div>
            <span class="user-name">{getFirstName($auth.user?.full_name)}</span>
          </button>

          {#if userMenuOpen}
            <div class="user-dropdown">
              <div class="user-info">
                <div class="user-avatar-large">
                  <img
                    src={getUserAvatar($auth.user?.avatar_url, $auth.user?.full_name)}
                    alt={getFirstName($auth.user?.full_name)}
                    class="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div class="user-details">
                  <span class="user-display-name">{getFirstName($auth.user?.full_name)}</span>
                  <span class="user-phone">{$auth.user?.whatsapp_number || ''}</span>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <a href="/profile" class="dropdown-item" onclick={() => userMenuOpen = false}>
                <User size={16} />
                Profile
              </a>
              <a href="/settings" class="dropdown-item" onclick={() => userMenuOpen = false}>
                <Settings size={16} />
                Settings
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-item" onclick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          {/if}
        </div>
      </nav>

      <button class="hamburger" onclick={() => (mobileMenuOpen = !mobileMenuOpen)} aria-label="Toggle menu">
        {#if mobileMenuOpen}
          <X size={24} color="#111827" />
        {:else}
          <Menu size={24} color="#111827" />
        {/if}
      </button>
    {/if}
  </div>

  {#if mobileMenuOpen && variant === 'full'}
    <div class="mobile-menu">
      <a href="/about" class="mobile-link" onclick={closeMobileMenu}>About</a>
      <a href="/login" class="mobile-link" onclick={closeMobileMenu}>Sign in</a>
      <a href="/register" class="mobile-link" onclick={closeMobileMenu}>Register</a>
      <button
        class="btn-coral mobile-cta"
        onclick={() => { mobileMenuOpen = false; goto('/register'); }}
      >
        Get Started <ArrowRight size={16} />
      </button>
    </div>
  {/if}

  {#if mobileMenuOpen && variant === 'loggedIn'}
    <div class="mobile-menu">
      <a href="/dashboard" class="mobile-link" onclick={closeMobileMenu}>Dashboard</a>
      <a href="/sessions" class="mobile-link" onclick={closeMobileMenu}>Sessions</a>
      <a href="/contacts" class="mobile-link" onclick={closeMobileMenu}>Contacts</a>
      <a href="/profile" class="mobile-link" onclick={closeMobileMenu}>Profile</a>
      <a href="/settings" class="mobile-link" onclick={closeMobileMenu}>Settings</a>
      <button
        class="mobile-logout-btn"
        onclick={() => { handleLogout(); mobileMenuOpen = false; }}
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  {/if}
</header>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid #F3F4F6;
    font-family: 'Plus Jakarta Sans', sans-serif;
    animation: fadeInDown 0.3s ease-out;
  }

  .navbar-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo-link {
    display: inline-flex;
    text-decoration: none;
  }

  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .nav-link {
    font-size: 14px;
    font-weight: 500;
    color: #4b5563;
    text-decoration: none;
    transition: color 0.15s;
  }

  .nav-link:hover {
    color: #111827;
  }

  .hamburger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    min-height: 44px;
    min-width: 44px;
  }

  .btn-coral {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #ff6b6b;
    color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 15px;
    padding: 10px 22px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    transition: background 0.15s, transform 0.12s, box-shadow 0.15s;
    box-shadow: 0 4px 14px rgba(255, 107, 107, 0.35);
  }

  .btn-coral:hover {
    background: #ff5252;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }

  .mobile-menu {
    display: none;
    flex-direction: column;
    gap: 0;
    padding: 0 24px 24px;
    border-top: 1px solid #F3F4F6;
    animation: fadeIn 0.2s ease-out;
  }

  .mobile-link {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    text-decoration: none;
    padding: 16px 0;
    border-bottom: 1px solid #F3F4F6;
    transition: color 0.15s;
  }

  .mobile-link:hover {
    color: #FF6B6B;
  }

  .mobile-cta {
    margin-top: 16px;
    width: 100%;
    justify-content: center;
    font-size: 16px;
    padding: 14px 24px;
  }

  .user-menu-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .user-avatar-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .user-avatar-btn:hover {
    background: #F3F4F6;
    border-color: #D1D5DB;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .user-name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 280px;
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    padding: 12px;
    animation: fadeInDown 0.2s ease-out;
    z-index: 100;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
  }

  .user-avatar-large {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }

  .user-display-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-phone {
    font-size: 12px;
    color: #6B7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-divider {
    height: 1px;
    background: #E5E7EB;
    margin: 8px 0;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    text-decoration: none;
    border-radius: 8px;
    transition: background 0.15s;
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
  }

  .dropdown-item:hover {
    background: #F9FAFB;
  }

  .logout-item {
    color: #DC2626;
  }

  .logout-item:hover {
    background: #FEF2F2;
  }

  .mobile-logout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    padding: 14px 24px;
    font-size: 16px;
    font-weight: 600;
    color: #DC2626;
    background: #FEF2F2;
    border: none;
    border-radius: 100px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .mobile-logout-btn:hover {
    background: #FEE2E2;
  }

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

  @media (max-width: 768px) {
    .desktop-nav {
      display: none;
    }

    .hamburger {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mobile-menu {
      display: flex;
    }

    .user-name {
      display: none;
    }

    .user-dropdown {
      display: none;
    }
  }
</style>
