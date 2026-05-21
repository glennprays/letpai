<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/ui/Button.svelte";
  import SharedFooter from "$lib/components/layout/SharedFooter.svelte";
  import {
    AlertCircle,
    MessageCircle,
    Users,
    Receipt,
    Calculator,
    X,
    Smartphone,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Shield,
    Globe,
    Clock,
    CreditCard,
  } from "lucide-svelte";

  function handleGetStarted() {
    goto("/register");
  }
</script>

<svelte:head>
  <title>About Letpai - Split Bills Effortlessly with Friends</title>
  <meta
    name="description"
    content="Learn how Letpai makes bill splitting easy with WhatsApp integration. No app needed for participants - just a link and they're done."
  />
</svelte:head>

<div
  class="min-h-screen bg-[#fff8f7] flex flex-col"
  style="font-family:'Plus Jakarta Sans',sans-serif;"
>
  <main class="flex-1">
    <div style="max-width:1200px; margin:0 auto; padding-top: 64px;">
      <!-- ── HERO SECTION ── -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">The Problem</div>
          <h1 class="hero-title">
            Splitting bills<br />
            <span class="highlight">shouldn't be awkward</span>
          </h1>
          <p class="hero-description">
            Letpai makes it easy to split expenses with friends using WhatsApp. No
            app needed for participants — just a link and they're done.
          </p>
          <div class="hero-actions">
            <Button
              variant="primary"
              size="lg"
              onbuttonclick={handleGetStarted}
              rightIcon={ArrowRight}
            >
              Get Started Free
            </Button>
            <span class="hero-subtitle"
              >Free forever · No sign-up for friends</span
            >
          </div>
        </div>

        <!-- Problem illustration -->
        <div class="hero-visual">
          <div class="visual-blob"></div>
          <div class="visual-card">
            <div class="chat-bubble left">
              <p>"Hey, can you send me your share?"</p>
            </div>
            <div class="chat-bubble right">
              <p>"Oh right, how much was it again?"</p>
            </div>
            <div class="chat-bubble left">
              <p>"Let me check the receipt... I think it was $24.50?"</p>
            </div>
            <div class="chat-bubble right">
              <p>"Did you include the tip?"</p>
            </div>
            <div class="problem-indicator">
              <AlertCircle size={20} />
              <span>Awkward conversations</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── PROBLEM SECTION ── -->
      <section class="problem-section">
        <div class="section-header">
          <p class="section-label">The Problem</p>
          <h2 class="section-title">Why splitting bills is hard</h2>
          <p class="section-description">
            Current methods create friction, awkwardness, and lost money
          </p>
        </div>

        <div class="problems-grid">
          {#each [
            {
              icon: AlertCircle,
              title: "Awkward Conversations",
              description: "Asking friends to pay back money creates tension and uncomfortable moments",
              color: "#ae2f34"
            },
            {
              icon: MessageCircle,
              title: "Payment Chasing",
              description: "Constant reminders needed, messages get lost in group chats",
              color: "#ae2f34"
            },
            {
              icon: Receipt,
              title: "Lost Receipts",
              description: "No proof of payment means disputes and uncertainty",
              color: "#ae2f34"
            },
            {
              icon: Calculator,
              title: "Math Errors",
              description: "Manual calculations lead to mistakes and unfair splits",
              color: "#ae2f34"
            },
            {
              icon: Users,
              title: "Group Chat Chaos",
              description: "Payment details buried in endless WhatsApp threads",
              color: "#ae2f34"
            },
            {
              icon: X,
              title: "No Tracking",
              description: "Forget who paid and who still owes you money",
              color: "#ae2f34"
            }
          ] as problem}
            <div class="problem-card">
              <div class="problem-icon" style="background:{problem.color}12;">
                <svelte:component this={problem.icon} size={24} color={problem.color} />
              </div>
              <h3 class="problem-title">{problem.title}</h3>
              <p class="problem-description">{problem.description}</p>
            </div>
          {/each}
        </div>
      </section>

      <!-- ── SOLUTION SECTION ── -->
      <section class="solution-section">
        <div class="section-header">
          <p class="section-label">How Letpai Works</p>
          <h2 class="section-title">Simple in 4 steps</h2>
          <p class="section-description">
            From creating a session to getting paid — all in minutes
          </p>
        </div>

        <div class="steps-container">
          <!-- Connector line (desktop only) -->
          <div class="steps-connector"></div>

          {#each [
            {
              step: "01",
              icon: Users,
              bg: "#ae2f34",
              title: "Create Session",
              description: "Add participants from your contacts or phone book"
            },
            {
              step: "02",
              icon: Receipt,
              bg: "#ae2f34",
              title: "Add Bills",
              description: "Split equally or assign specific amounts to each person"
            },
            {
              step: "03",
              icon: MessageCircle,
              bg: "#ae2f34",
              title: "Send Notifications",
              description: "WhatsApp messages with personal payment links"
            },
            {
              step: "04",
              icon: CheckCircle,
              bg: "#ae2f34",
              title: "Track Payments",
              description: "Participants upload proof, you approve — done!"
            }
          ] as step}
            <div class="step-card">
              <div class="step-dot" style="background:{step.bg}; box-shadow:0 4px 12px {step.bg}44;">
                <svelte:component this={step.icon} size={20} color="#fff" />
              </div>
              <span class="step-number">{step.step}</span>
              <h3 class="step-title">{step.title}</h3>
              <p class="step-description">{step.description}</p>
            </div>
          {/each}
        </div>
      </section>

      <!-- ── FEATURES SECTION ── -->
      <section class="features-section">
        <div class="section-header">
          <p class="section-label">Why Choose Letpai</p>
          <h2 class="section-title">Features that matter</h2>
          <p class="section-description">
            Built for real-world bill splitting scenarios
          </p>
        </div>

        <div class="bento-grid">
          <!-- Large card: WhatsApp Integration -->
          <div class="feature-card large">
            <div class="feature-icon" style="background:#fff0ef;">
              <MessageCircle size={28} color="#ae2f34" />
            </div>
            <div class="feature-content">
              <h3 class="feature-title">WhatsApp Integration</h3>
              <p class="feature-description">
                Participants receive instant notifications with personal payment
                links. No app installation needed — they tap, pay, and you're done.
              </p>
              <div class="feature-tags">
                <span class="tag">Automatic messages</span>
                <span class="tag">Payment tracking</span>
                <span class="tag">One-tap access</span>
              </div>
            </div>
          </div>

          <!-- Medium cards -->
          <div class="feature-card">
            <div class="feature-icon" style="background:#fff0ef;">
              <Users size={24} color="#ae2f34" />
            </div>
            <h3 class="feature-title">Contact Management</h3>
            <p class="feature-description">
              Save contacts once, reuse forever. Import from phone or add manually.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon" style="background:#fff0ef;">
              <Calculator size={24} color="#ae2f34" />
            </div>
            <h3 class="feature-title">Flexible Splitting</h3>
            <p class="feature-description">
              Equal splits or specific amounts. Handle complex scenarios easily.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon" style="background:#fff0ef;">
              <Shield size={24} color="#ae2f34" />
            </div>
            <h3 class="feature-title">Payment Verification</h3>
            <p class="feature-description">
              Upload proof, host approval. No more disputes about who paid.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon" style="background:#fff0ef;">
              <Globe size={24} color="#ae2f34" />
            </div>
            <h3 class="feature-title">Multi-Currency</h3>
            <p class="feature-description">
              Support for IDR, USD, EUR, and 10+ other currencies.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon" style="background:#fff0ef;">
              <Clock size={24} color="#ae2f34" />
            </div>
            <h3 class="feature-title">Smart Reminders</h3>
            <p class="feature-description">
              Time-restricted notifications prevent spam while keeping everyone accountable.
            </p>
          </div>

          <!-- Extra features -->
          <div class="feature-card">
            <div class="feature-icon" style="background:#fff0ef;">
              <CreditCard size={24} color="#ae2f34" />
            </div>
            <h3 class="feature-title">Payment Links</h3>
            <p class="feature-description">
              Shareable links work without app. Just open in browser.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon" style="background:#fff0ef;">
              <Sparkles size={24} color="#ae2f34" />
            </div>
            <h3 class="feature-title">Real-time Updates</h3>
            <p class="feature-description">
              See payment status instantly. Know who's paid and who hasn't.
            </p>
          </div>
        </div>
      </section>

      <!-- ── CTA SECTION ── -->
      <section class="cta-section">
        <div class="cta-banner">
          <div class="cta-decorations">
            <div class="cta-circle circle-1"></div>
            <div class="cta-circle circle-2"></div>
          </div>
          <div class="cta-content">
            <h2 class="cta-title">Ready to split bills without the awkwardness?</h2>
            <p class="cta-description">
              Free forever for groups. No credit card needed.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onbuttonclick={handleGetStarted}
            rightIcon={ArrowRight}
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  </main>

  <SharedFooter />
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

  :global(body) {
    font-family: "Plus Jakarta Sans", sans-serif;
    background: #fff8f7;
    margin: 0;
  }

  /* ── HERO SECTION ── */
  .hero-section {
    padding: 48px 24px 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }

  .hero-content {
    animation: fadeInUp 0.6s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .hero-badge {
    display: inline-block;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #ae2f34;
    background: #fff0ef;
    padding: 6px 14px;
    border-radius: 100px;
    margin-bottom: 20px;
  }

  .hero-title {
    font-size: clamp(32px, 4.5vw, 52px);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: #251818;
    margin: 0 0 24px;
  }

  .hero-title .highlight {
    color: #ae2f34;
  }

  .hero-description {
    font-size: 17px;
    color: #584140;
    line-height: 1.7;
    margin: 0 0 36px;
    max-width: 450px;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .hero-subtitle {
    font-size: 13px;
    color: #584140;
    font-weight: 500;
  }

  /* Hero visual */
  .hero-visual {
    position: relative;
  }

  .visual-blob {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #ae2f3418, #FF6B6B18);
    border-radius: 32px;
    transform: rotate(2deg);
  }

  .visual-card {
    position: relative;
    background: #fff;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(37,24,24,0.04);
  }

  .chat-bubble {
    background: #fff0ef;
    border-radius: 16px;
    padding: 12px 16px;
    margin-bottom: 12px;
    font-size: 14px;
    line-height: 1.5;
    color: #584140;
    max-width: 85%;
  }

  .chat-bubble.left {
    background: #fff0ef;
    border-bottom-left-radius: 4px;
  }

  .chat-bubble.right {
    background: #fff0ef;
    border-bottom-right-radius: 4px;
    margin-left: auto;
  }

  .problem-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ae2f34;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 12px;
    background: #fff0ef;
    border-radius: 8px;
    margin-top: 16px;
    width: fit-content;
  }

  /* ── SECTION STYLES ── */
  .problem-section,
  .solution-section,
  .features-section {
    padding: 64px 24px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 52px;
  }

  .section-label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #584140;
    margin: 0 0 12px;
  }

  .section-title {
    font-size: clamp(26px, 3vw, 38px);
    font-weight: 800;
    color: #251818;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
  }

  .section-description {
    font-size: 17px;
    color: #584140;
    margin: 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  /* ── PROBLEM CARDS ── */
  .problems-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .problem-card {
    background: #fff;
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 1px 3px rgba(37,24,24,0.04);
    transition: all 0.2s ease;
  }

  .problem-card:hover {
    box-shadow: 0 8px 32px rgba(255, 107, 107, 0.1);
    transform: translateY(-2px);
  }

  .problem-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .problem-title {
    font-size: 17px;
    font-weight: 800;
    color: #251818;
    margin: 0 0 10px;
    letter-spacing: -0.01em;
  }

  .problem-description {
    font-size: 14px;
    color: #584140;
    margin: 0;
    line-height: 1.6;
  }

  /* ── SOLUTION STEPS ── */
  .steps-container {
    position: relative;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .steps-connector {
    position: absolute;
    top: 38px;
    left: 12.5%;
    right: 12.5%;
    height: 2px;
    background: linear-gradient(90deg, #ae2f34, #FF6B6B);
    border-radius: 2px;
    z-index: 0;
  }

  .step-card {
    position: relative;
    z-index: 1;
    background: #fff0ef;
    border-radius: 24px;
    padding: 32px 24px;
    box-shadow: 0 1px 3px rgba(37,24,24,0.04);
    transition: all 0.2s ease;
  }

  .step-card:hover {
    box-shadow: 0 8px 32px rgba(20, 184, 166, 0.1);
    transform: translateY(-2px);
  }

  .step-dot {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  .step-number {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #ae2f34;
    margin-bottom: 16px;
    display: block;
  }

  .step-title {
    font-size: 17px;
    font-weight: 800;
    color: #251818;
    margin: 0 0 10px;
    letter-spacing: -0.01em;
  }

  .step-description {
    font-size: 14px;
    color: #584140;
    margin: 0;
    line-height: 1.65;
  }

  /* ── FEATURES BENTO GRID ── */
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .feature-card {
    background: #fff;
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 1px 3px rgba(37,24,24,0.04);
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .feature-card.large {
    grid-column: span 3;
    flex-direction: row;
    align-items: flex-start;
    gap: 32px;
  }

  .feature-card:hover {
    box-shadow: 0 8px 32px rgba(255, 107, 107, 0.1);
    transform: translateY(-2px);
  }

  .feature-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .feature-title {
    font-size: 20px;
    font-weight: 800;
    color: #251818;
    margin: 0 0 10px;
    letter-spacing: -0.02em;
  }

  .feature-description {
    font-size: 15px;
    color: #584140;
    margin: 0 0 20px;
    line-height: 1.65;
  }

  .feature-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag {
    font-size: 12px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 100px;
    background: #fff0ef;
    color: #584140;
  }

  /* ── CTA SECTION ── */
  .cta-section {
    padding: 0 24px 64px;
  }

  .cta-banner {
    background: linear-gradient(to bottom right, #ae2f34, #FF6B6B);
    border-radius: 28px;
    padding: 48px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
    position: relative;
    overflow: hidden;
  }

  .cta-decorations {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .cta-circle {
    position: absolute;
    border-radius: 50%;
  }

  .circle-1 {
    right: -48px;
    top: -48px;
    width: 240px;
    height: 240px;
    background: rgba(255, 255, 255, 0.12);
  }

  .circle-2 {
    right: 80px;
    bottom: -64px;
    width: 180px;
    height: 180px;
    background: rgba(255, 255, 255, 0.08);
  }

  .cta-content {
    flex: 1;
    min-width: 280px;
  }

  .cta-title {
    font-size: clamp(22px, 2.8vw, 34px);
    font-weight: 800;
    color: #fff;
    margin: 0 0 10px;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .cta-description {
    font-size: 15px;
    color: rgba(255,255,255,0.85);
    margin: 0;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1024px) {
    .problems-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .steps-container {
      grid-template-columns: repeat(2, 1fr);
    }

    .steps-connector {
      left: calc(25% - 20px);
      right: calc(25% - 20px);
    }
  }

  @media (max-width: 768px) {
    .hero-section {
      grid-template-columns: 1fr;
      gap: 40px;
      padding: 32px 20px 24px;
    }

    .hero-visual {
      max-width: 400px;
      margin: 0 auto;
    }

    .problem-section,
    .solution-section,
    .features-section {
      padding: 40px 20px;
    }

    .problems-grid {
      grid-template-columns: 1fr;
    }

    .steps-container {
      grid-template-columns: 1fr;
    }

    .steps-connector {
      display: none;
    }

    .bento-grid {
      grid-template-columns: 1fr;
    }

    .feature-card.large {
      grid-column: span 1;
      flex-direction: column;
    }

    .cta-section {
      padding: 0 16px 40px;
    }

    .cta-banner {
      padding: 32px 24px;
      border-radius: 20px;
    }
  }

  @media (max-width: 480px) {
    .hero-section {
      padding: 24px 16px 16px;
      gap: 32px;
    }

    .problem-section,
    .solution-section,
    .features-section {
      padding: 32px 16px;
    }

    .section-header {
      margin-bottom: 36px;
    }

    .problem-card,
    .step-card,
    .feature-card {
      padding: 20px;
    }

    .cta-banner {
      padding: 24px 20px;
      text-align: center;
      justify-content: center;
    }
  }
</style>
