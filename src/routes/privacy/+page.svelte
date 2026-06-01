<script lang="ts">
  import SharedFooter from "$lib/components/layout/SharedFooter.svelte";
</script>

<svelte:head>
  <title>Privacy Policy · Letpai</title>
  <meta name="description" content="How Letpai handles your data." />
</svelte:head>

<main class="legal-page">
  <article class="legal-prose">
    <p class="legal-eyebrow">Legal</p>
    <h1>Privacy Policy</h1>
    <p class="legal-updated">Last updated: 2026-05-29</p>

    <p class="legal-callout">
      This is placeholder copy. The production privacy policy will be drafted
      with legal review and will replace the text below.
    </p>

    <section>
      <h2>Information we collect</h2>
      <p>
        We collect the information you provide when you create an account
        (your name, WhatsApp number) and the bill-splitting activity you
        generate inside the app (sessions, participants, payment status,
        proof uploads).
      </p>
    </section>

    <section>
      <h2>How we use it</h2>
      <p>
        Your data is used to operate the service: showing you your
        sessions, sending WhatsApp notifications to participants you invite,
        and keeping a record of payments. We do not sell your data.
      </p>
    </section>

    <section>
      <h2>Sharing</h2>
      <p>
        Participants you add to a session see your name and the share they
        owe. We share data with the WhatsApp Business API provider that
        delivers your notifications. We share with no one else without your
        consent except where legally required.
      </p>
    </section>

    <section>
      <h2>Your rights</h2>
      <p>
        You can export or delete your account at any time from Settings.
        Contact us if you want help with any data request.
      </p>
    </section>

    <section>
      <h2>Contact</h2>
      <p>
        Reach out via the WhatsApp number on your Letpai dashboard for
        questions about this policy.
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
