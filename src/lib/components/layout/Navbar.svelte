<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ArrowRight, Menu, X } from 'lucide-svelte';
  import Logo from '$lib/components/layout/Logo.svelte';

  let { variant = 'full' } = $props<{ variant: 'full' | 'auth' }>();
  let mobileMenuOpen = $state(false);

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

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
    padding: 4px;
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
  }
</style>
