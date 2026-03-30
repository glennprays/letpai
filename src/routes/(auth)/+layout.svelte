<script lang="ts">
  import Navbar from '$lib/components/layout/Navbar.svelte';
  import SharedFooter from '$lib/components/layout/SharedFooter.svelte';
  let { children } = $props();
</script>

<div class="auth-layout">
  <Navbar variant="auth" />

  <!-- Decorative background -->
  <div class="decorative-background">
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    <div class="gradient-orb orb-3"></div>
    <div class="gradient-orb orb-4"></div>
  </div>

  <main class="auth-main">
    <div class="auth-card-container">
      <div class="auth-card">{@render children()}</div>
    </div>
  </main>

  <SharedFooter />
</div>

<style>
  .auth-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #FAFAFA;
  }

  .decorative-background {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
    animation: float 12s ease-in-out infinite;
  }

  .orb-1 {
    width: 400px;
    height: 400px;
    background: rgba(255, 107, 107, 0.15);
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .orb-2 {
    width: 350px;
    height: 350px;
    background: rgba(20, 184, 166, 0.15);
    top: 50%;
    right: 10%;
    animation-delay: 2s;
  }

  .orb-3 {
    width: 300px;
    height: 300px;
    background: rgba(139, 92, 246, 0.1);
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
  }

  .orb-4 {
    width: 250px;
    height: 250px;
    background: rgba(245, 158, 11, 0.1);
    bottom: 10%;
    right: 25%;
    animation-delay: 6s;
  }

  @keyframes float {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    25% {
      transform: translate(30px, -30px) rotate(5deg);
    }
    50% {
      transform: translate(-20px, 20px) rotate(-5deg);
    }
    75% {
      transform: translate(-30px, -20px) rotate(3deg);
    }
  }

  .auth-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    z-index: 1;
  }

  .auth-card-container {
    width: 100%;
    max-width: 420px;
  }

  .auth-card {
    background: #FFFFFF;
    border: 1.5px solid #F0F0F0;
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.06);
    animation: pageEntrance 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes pageEntrance {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    .auth-main {
      padding: 16px;
      align-items: flex-start;
      padding-top: 24px;
    }

    .auth-card {
      padding: 28px 20px;
      border-radius: 20px;
    }

    .orb-1 {
      width: 200px;
      height: 200px;
    }

    .orb-2 {
      width: 180px;
      height: 180px;
    }

    .orb-3 {
      width: 150px;
      height: 150px;
    }

    .orb-4 {
      width: 120px;
      height: 120px;
    }
  }

  @media (max-width: 375px) {
    .auth-main {
      padding: 12px;
    }

    .auth-card {
      padding: 24px 16px;
    }
  }
</style>
