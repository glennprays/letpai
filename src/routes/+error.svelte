<script lang="ts">
  import { page } from "$app/stores";
  import { ArrowRight } from "lucide-svelte";

  const status = $derived($page.status);
  const headline = $derived.by(() => {
    if (status === 404) return "Page not found";
    if (status >= 500) return "Something broke on our side";
    return $page.error?.message || "Something went wrong";
  });
  const body = $derived.by(() => {
    if (status === 404) {
      return "The page you're looking for moved or never existed. Let's get you back somewhere familiar.";
    }
    if (status >= 500) {
      return "We've been notified. Try refreshing in a moment, or head back home.";
    }
    return "Try again, or head back home.";
  });
</script>

<svelte:head>
  <title>{status} · Letpai</title>
</svelte:head>

<main class="error-page">
  <div class="error-card">
    <p class="error-code">{status}</p>
    <h1>{headline}</h1>
    <p class="error-body">{body}</p>

    <div class="error-actions">
      <a href="/" class="btn-primary">
        Go home <ArrowRight size={16} />
      </a>
      <a href="/login" class="btn-secondary">Sign in</a>
    </div>
  </div>
</main>

<style>
  .error-page {
    min-height: 100vh;
    background: #fff8f7;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: "Plus Jakarta Sans", sans-serif;
  }

  .error-card {
    max-width: 480px;
    width: 100%;
    text-align: center;
  }

  .error-code {
    font-size: clamp(72px, 14vw, 112px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
    margin: 0 0 12px;
    background: linear-gradient(135deg, #ae2f34, #FF6B6B);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .error-card h1 {
    font-size: clamp(22px, 3vw, 28px);
    font-weight: 700;
    color: #251818;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
  }

  .error-body {
    font-size: 16px;
    line-height: 1.6;
    color: #584140;
    margin: 0 0 32px;
  }

  .error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 22px;
    border-radius: 16px;
    background: linear-gradient(135deg, #ae2f34, #FF6B6B);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s, transform 0.15s;
  }

  .btn-primary:hover {
    opacity: 0.95;
  }

  .btn-primary:active {
    transform: scale(0.98);
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    padding: 12px 22px;
    border-radius: 16px;
    background: #fff;
    color: #251818;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid #fbe3e1;
    transition: background 0.15s;
  }

  .btn-secondary:hover {
    background: #fff0ef;
  }
</style>
