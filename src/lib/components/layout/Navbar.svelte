<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ArrowRight } from 'lucide-svelte';

  let { variant = 'full' } = $props<{ variant: 'full' | 'auth' }>();

  function handleLogoClick() {
    if ($page.url.pathname !== '/') {
      goto('/');
    }
  }
</script>

<header
  class="navbar"
  style="
    position: sticky;
    top: 0;
    z-index: 50;
    height: 64px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid #F3F4F6;
    display: flex;
    align-items: center;
    padding: 0 24px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    animation: fadeInDown 0.3s ease-out;
  "
>
  <div
    style="width: 100%; max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;"
  >
    <button
      onclick={handleLogoClick}
      style="
        font-size: 22px;
        font-weight: 800;
        color: #111827;
        margin: 0;
        padding: 0;
        letter-spacing: -0.02em;
        cursor: pointer;
        transition: color 0.15s;
        background: none;
        border: none;
        font-family: 'Plus Jakarta Sans', sans-serif;
      "
      onmouseenter={(e) => (e.currentTarget.style.color = '#FF6B6B')}
      onmouseleave={(e) => (e.currentTarget.style.color = '#111827')}
    >
      Letpai
    </button>

    {#if variant === 'full'}
      <nav style="display: flex; align-items: center; gap: 32px;">
        <a
          href="/about"
          class="nav-link"
          style="
            font-size: 14px;
            font-weight: 500;
            color: #4b5563;
            text-decoration: none;
            transition: color 0.15s;
          "
          onmouseenter={(e) => (e.currentTarget.style.color = '#111827')}
          onmouseleave={(e) => (e.currentTarget.style.color = '#4b5563')}
        >
          About
        </a>
        <a
          href="/login"
          class="nav-link"
          style="
            font-size: 14px;
            font-weight: 500;
            color: #4b5563;
            text-decoration: none;
            transition: color 0.15s;
          "
          onmouseenter={(e) => (e.currentTarget.style.color = '#111827')}
          onmouseleave={(e) => (e.currentTarget.style.color = '#4b5563')}
        >
          Sign in
        </a>
        <a
          href="/register"
          class="nav-link"
          style="
            font-size: 14px;
            font-weight: 500;
            color: #4b5563;
            text-decoration: none;
            transition: color 0.15s;
          "
          onmouseenter={(e) => (e.currentTarget.style.color = '#111827')}
          onmouseleave={(e) => (e.currentTarget.style.color = '#4b5563')}
        >
          Register
        </a>
        <button
          class="btn-coral"
          style="
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
          "
          onclick={() => goto('/register')}
          onmouseenter={(e) => {
            e.currentTarget.style.background = '#ff5252';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
          }}
          onmouseleave={(e) => {
            e.currentTarget.style.background = '#ff6b6b';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 107, 107, 0.35)';
          }}
        >
          Get Started <ArrowRight size={16} />
        </button>
      </nav>
    {:else if variant === 'auth'}
      <nav style="display: flex; align-items: center;">
        <a
          href="/"
          class="nav-link"
          style="
            font-size: 14px;
            font-weight: 500;
            color: #4B5563;
            text-decoration: none;
            transition: color 0.15s;
          "
          onmouseenter={(e) => (e.currentTarget.style.color = '#111827')}
          onmouseleave={(e) => (e.currentTarget.style.color = '#4B5563')}
        >
          Back to home
        </a>
      </nav>
    {/if}
  </div>
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

  @media (max-width: 640px) {
    .navbar nav {
      gap: 16px;
    }

    .navbar a:nth-child(1) {
      display: none;
    }
  }
</style>
