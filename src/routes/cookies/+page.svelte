<script lang="ts">
  import SharedFooter from "$lib/components/layout/SharedFooter.svelte";
</script>

<svelte:head>
  <title>Cookie Policy · Letpai</title>
  <meta name="description" content="How Letpai uses cookies." />
</svelte:head>

<main class="legal-page">
  <article class="legal-prose">
    <p class="legal-eyebrow">Legal</p>
    <h1>Cookie Policy</h1>
    <p class="legal-updated">Last updated: 2026-05-29</p>

    <p class="legal-callout">
      This is placeholder copy. The production cookie policy will be drafted
      with legal review and will replace the text below.
    </p>

    <section>
      <h2>What cookies we use</h2>
      <p>
        Letpai uses a small number of strictly-necessary cookies to keep you
        signed in (the <code>token</code> and <code>user</code> cookies)
        and to remember UI preferences. We don't use third-party advertising
        or tracking cookies.
      </p>
    </section>

    <section>
      <h2>Why</h2>
      <p>
        These cookies make it possible to authenticate your session on the
        server, which is how the navbar, dashboard, and protected pages know
        who you are when a page is rendered.
      </p>
    </section>

    <section>
      <h2>Managing cookies</h2>
      <p>
        You can clear Letpai's cookies through your browser settings at any
        time. Doing so signs you out — the next time you visit you'll be
        asked to sign in again.
      </p>
    </section>
  </article>
</main>

<SharedFooter />

<style>
  .legal-page {
    background: #fff8f7;
    padding: 64px 24px 96px;
    min-height: calc(100vh - 64px);
    font-family: "Plus Jakarta Sans", sans-serif;
  }

  .legal-prose {
    max-width: 720px;
    margin: 0 auto;
    color: #251818;
  }

  .legal-eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #ae2f34;
    margin: 0 0 12px;
  }

  .legal-prose h1 {
    font-size: clamp(32px, 5vw, 44px);
    line-height: 1.15;
    margin: 0 0 8px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .legal-updated {
    font-size: 14px;
    color: #584140;
    margin: 0 0 32px;
  }

  .legal-callout {
    background: #fff0ef;
    border-left: 3px solid #ae2f34;
    padding: 14px 18px;
    border-radius: 12px;
    font-size: 14px;
    color: #584140;
    margin: 0 0 40px;
    line-height: 1.6;
  }

  .legal-prose section {
    margin-bottom: 32px;
  }

  .legal-prose h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 12px;
    color: #251818;
    letter-spacing: -0.01em;
  }

  .legal-prose p {
    font-size: 16px;
    line-height: 1.7;
    color: #584140;
    margin: 0 0 12px;
  }

  .legal-prose code {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 14px;
    background: #fbe3e1;
    padding: 1px 6px;
    border-radius: 4px;
    color: #251818;
  }
</style>
