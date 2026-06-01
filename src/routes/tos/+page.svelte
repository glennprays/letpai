<script lang="ts">
  import SharedFooter from "$lib/components/layout/SharedFooter.svelte";
</script>

<svelte:head>
  <title>Terms of Service · Letpai</title>
  <meta name="description" content="The terms that govern your use of Letpai." />
</svelte:head>

<main class="legal-page">
  <article class="legal-prose">
    <p class="legal-eyebrow">Legal</p>
    <h1>Terms of Service</h1>
    <p class="legal-updated">Last updated: 2026-05-29</p>

    <p class="legal-callout">
      This is placeholder copy. The production terms will be drafted with
      legal review and will replace the text below.
    </p>

    <section>
      <h2>Acceptance</h2>
      <p>
        By creating an account or using Letpai you agree to these terms.
        If you don't agree, please don't use the service.
      </p>
    </section>

    <section>
      <h2>Use of the service</h2>
      <p>
        Letpai is a tool for organising bill splits and notifying the people
        you split with. You agree to use it only for that purpose, and to
        follow applicable laws — including the rules of WhatsApp's Business
        API for the messages we send on your behalf.
      </p>
    </section>

    <section>
      <h2>Accounts</h2>
      <p>
        You are responsible for keeping your account credentials safe and
        for any activity that happens under your account. Notify us
        immediately if you suspect unauthorised access.
      </p>
    </section>

    <section>
      <h2>Liability</h2>
      <p>
        Letpai is provided "as is". We don't guarantee the service will be
        uninterrupted or error-free. To the extent permitted by law, we are
        not liable for indirect or consequential losses arising from your
        use of the service.
      </p>
    </section>

    <section>
      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. Material changes will
        be communicated in the app or by message. Continued use after a
        change means you accept the new terms.
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
</style>
