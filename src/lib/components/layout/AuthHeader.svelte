<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  function handleLogoClick() {
    if ($page.url.pathname !== '/') {
      goto('/');
    }
  }
</script>

<header
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
  "
>
  <div style="width: 100%; max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
    <h1
      onclick={handleLogoClick}
      style="
        font-size: 22px;
        font-weight: 800;
        color: #111827;
        margin: 0;
        letter-spacing: -0.02em;
        cursor: pointer;
        transition: color 0.15s;
      "
      onmouseenter={(e) => (e.currentTarget.style.color = '#FF6B6B')}
      onmouseleave={(e) => (e.currentTarget.style.color = '#111827')}
    >
      Letpai
    </h1>

    <a
      href="/"
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
  </div>
</header>

<style>
  header {
    animation: fadeInDown 0.3s ease-out;
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
</style>
