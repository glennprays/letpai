<script lang="ts">
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/auth";
  import Button from "$lib/components/ui/Button.svelte";
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import SharedFooter from "$lib/components/layout/SharedFooter.svelte";
  import {
    Smartphone,
    MessageCircle,
    Camera,
    CheckCircle,
    ArrowRight,
  } from "lucide-svelte";
  import { initAuth } from "$lib/stores/auth";

  $effect(() => {
    if ($user.isAuthenticated) {
      goto("/dashboard");
    }
  });

  function handleGetStarted() {
    goto("/login");
  }
</script>

<div
  class="min-h-screen bg-white flex flex-col"
  style="font-family:'Plus Jakarta Sans',sans-serif;"
>
  <!-- ── HEADER / NAV ── -->
  <Navbar variant="full" />

  <main class="flex-1">
    <div style="max-width:1200px; margin:0 auto;">
      <!-- ── HERO ── -->
      <section
        style="padding:80px 24px 72px; display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center;"
      >
        <!-- Left: text -->
        <div>
          <h2
            style="font-size:clamp(40px,4.5vw,62px); font-weight:800; line-height:1.08; letter-spacing:-0.03em; color:#111827; margin:0 0 24px;"
          >
            <span class="hero-word" style="animation-delay:0s;"
              >Split bills</span
            ><br />
            <span class="hero-word" style="animation-delay:0.08s;"
              >effortlessly</span
            ><br />
            <span
              class="hero-word"
              style="animation-delay:0.16s; color:#FF6B6B;">with friends.</span
            >
          </h2>

          <p
            style="font-size:17px; color:#6B7280; line-height:1.7; margin:0 0 36px; font-weight:400; max-width:400px;"
          >
            WhatsApp notifications included. No app needed for participants —
            just a link and they're done.
          </p>

          <div
            style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;"
          >
            <button class="btn-coral" onclick={handleGetStarted}>
              Get Started <ArrowRight size={16} />
            </button>
            <span style="font-size:13px; color:#9CA3AF; font-weight:500;"
              >Free to use · No sign-up for friends</span
            >
          </div>
        </div>

        <!-- Right: phone mockup card -->
        <div style="position:relative;">
          <!-- Background blob -->
          <div
            style="position:absolute; inset:0; background:linear-gradient(135deg,#FF6B6B18,#14B8A618); border-radius:32px; transform:rotate(2deg);"
          ></div>

          <!-- Card -->
          <div
            style="position:relative; background:#fff; border-radius:24px; padding:0; border:1.5px solid #F0F0F0; box-shadow:0 20px 60px rgba(0,0,0,0.08); overflow:hidden;"
          >
            <!-- Card header -->
            <div
              style="background:linear-gradient(135deg,#FF6B6B,#ff5252); padding:20px 24px; display:flex; align-items:center; justify-content:space-between;"
            >
              <div>
                <p
                  style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.7); margin:0 0 3px; letter-spacing:0.05em; text-transform:uppercase;"
                >
                  Active session
                </p>
                <p
                  style="font-size:18px; font-weight:800; color:#fff; margin:0; letter-spacing:-0.02em;"
                >
                  Tokyo Dinner
                </p>
              </div>
              <div style="text-align:right;">
                <p
                  style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.7); margin:0 0 3px; letter-spacing:0.05em; text-transform:uppercase;"
                >
                  Total
                </p>
                <p
                  style="font-size:22px; font-weight:800; color:#fff; margin:0;"
                >
                  $73.50
                </p>
              </div>
            </div>

            <!-- Participants -->
            <div style="padding:8px 0;">
              {#each [{ name: "Alex T.", initials: "A", amount: "$24.50", paid: true }, { name: "Priya M.", initials: "P", amount: "$24.50", paid: false }, { name: "Sam K.", initials: "S", amount: "$24.50", paid: false }] as person}
                <div
                  style="display:flex; align-items:center; justify-content:space-between; padding:12px 24px; border-bottom:1px solid #F9FAFB;"
                >
                  <div style="display:flex; align-items:center; gap:12px;">
                    <div
                      style="width:36px; height:36px; border-radius:50%; background:{person.paid
                        ? '#DCFCE7'
                        : '#F3F4F6'}; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:{person.paid
                        ? '#16A34A'
                        : '#6B7280'};"
                    >
                      {person.initials}
                    </div>
                    <span
                      style="font-size:14px; font-weight:600; color:#111827;"
                      >{person.name}</span
                    >
                  </div>
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span
                      style="font-size:15px; font-weight:700; color:#111827;"
                      >{person.amount}</span
                    >
                    <span
                      style="font-size:11px; font-weight:700; padding:3px 10px; border-radius:100px; background:{person.paid
                        ? '#DCFCE7'
                        : '#FEF2F2'}; color:{person.paid
                        ? '#16A34A'
                        : '#EF4444'};"
                    >
                      {person.paid ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>
              {/each}
            </div>

            <!-- WhatsApp button -->
            <div style="padding:16px 24px;">
              <button
                style="width:100%; background:#25D366; color:#fff; border:none; border-radius:12px; padding:13px; font-family:'Plus Jakarta Sans',sans-serif; font-weight:700; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background 0.15s;"
                onmouseenter={(e) =>
                  (e.currentTarget.style.background = "#1ebe59")}
                onmouseleave={(e) =>
                  (e.currentTarget.style.background = "#25D366")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  ><path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                  /><path
                    d="M12 0C5.373 0 0 5.373 0 12c0 2.122.555 4.112 1.529 5.84L0 24l6.335-1.56C8.053 23.418 9.985 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.895 0-3.668-.52-5.184-1.424l-.371-.22-3.762.927.999-3.648-.242-.377C2.551 15.724 2 13.924 2 12 2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"
                  /></svg
                >
                Notify all via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ── WHY LETPAI ── -->
      <section
        style="padding:72px 24px; background:#FAFAFA; border-radius:32px; margin:0 16px 16px;"
      >
        <div style="text-align:center; margin-bottom:52px;">
          <p
            style="font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9CA3AF; margin:0 0 12px;"
          >
            Why Letpai
          </p>
          <h3
            style="font-size:clamp(26px,3vw,38px); font-weight:800; color:#111827; margin:0; letter-spacing:-0.02em;"
          >
            Built for the group chat era
          </h3>
        </div>

        <!-- Bento grid — same 4-card structure as original, improved -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <!-- Big card: WhatsApp -->
          <div
            class="feature-card"
            style="grid-column:span 2; background:linear-gradient(135deg,#FFF5F5,#fff); display:flex; gap:32px; align-items:flex-start;"
          >
            <div
              class="icon-bubble"
              style="background:#FF6B6B; flex-shrink:0; width:56px; height:56px; border-radius:18px;"
            >
              <MessageCircle size={26} color="#fff" />
            </div>
            <div>
              <h4
                style="font-size:20px; font-weight:800; color:#111827; margin:0 0 10px; letter-spacing:-0.02em;"
              >
                WhatsApp Integration
              </h4>
              <p
                style="font-size:15px; color:#6B7280; margin:0 0 20px; line-height:1.65; max-width:520px;"
              >
                Participants receive instant notifications with personal payment
                links. No app installation needed — they tap, pay, and you're
                done.
              </p>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                {#each ["Automatic messages", "Payment tracking", "One-tap access"] as tag}
                  <span
                    style="font-size:12px; font-weight:600; padding:5px 12px; border-radius:100px; background:#fff; border:1.5px solid #F0F0F0; color:#6B7280;"
                    >{tag}</span
                  >
                {/each}
              </div>
            </div>
          </div>

          <!-- Small cards -->
          <div class="feature-card">
            <div class="icon-bubble" style="background:#14B8A6;">
              <Smartphone size={22} color="#fff" />
            </div>
            <h4
              style="font-size:17px; font-weight:800; color:#111827; margin:0 0 8px; letter-spacing:-0.01em;"
            >
              Create in Seconds
            </h4>
            <p
              style="font-size:14px; color:#6B7280; margin:0; line-height:1.6;"
            >
              Quick setup — name the session, add bills and people, send. Done
              in under a minute.
            </p>
          </div>

          <div class="feature-card">
            <div class="icon-bubble" style="background:#14B8A6;">
              <Camera size={22} color="#fff" />
            </div>
            <h4
              style="font-size:17px; font-weight:800; color:#111827; margin:0 0 8px; letter-spacing:-0.01em;"
            >
              Proof Upload
            </h4>
            <p
              style="font-size:14px; color:#6B7280; margin:0; line-height:1.6;"
            >
              Easy photo capture and submission. No more "I already paid" —
              you'll have proof on file.
            </p>
          </div>

          <div class="feature-card">
            <div class="icon-bubble" style="background:#FF6B6B;">
              <CheckCircle size={22} color="#fff" />
            </div>
            <h4
              style="font-size:17px; font-weight:800; color:#111827; margin:0 0 8px; letter-spacing:-0.01em;"
            >
              No App Needed
            </h4>
            <p
              style="font-size:14px; color:#6B7280; margin:0; line-height:1.6;"
            >
              Friends pay via a link in their browser. No downloads, no
              sign-ups, no friction.
            </p>
          </div>

          <div class="feature-card">
            <div class="icon-bubble" style="background:#FF6B6B;">
              <ArrowRight size={22} color="#fff" />
            </div>
            <h4
              style="font-size:17px; font-weight:800; color:#111827; margin:0 0 8px; letter-spacing:-0.01em;"
            >
              Real-time Dashboard
            </h4>
            <p
              style="font-size:14px; color:#6B7280; margin:0; line-height:1.6;"
            >
              See who has paid, who is pending, and close the session when
              everyone's settled up.
            </p>
          </div>
        </div>
      </section>

      <!-- ── HOW IT WORKS ── -->
      <section style="padding:80px 24px;">
        <div style="text-align:center; margin-bottom:52px;">
          <p
            style="font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9CA3AF; margin:0 0 12px;"
          >
            Process
          </p>
          <h3
            style="font-size:clamp(26px,3vw,38px); font-weight:800; color:#111827; margin:0; letter-spacing:-0.02em;"
          >
            How It Works
          </h3>
        </div>

        <!-- 3 step cards with connector line -->
        <div
          style="position:relative; display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px;"
        >
          <!-- Connector line behind cards -->
          <div
            style="position:absolute; top:38px; left:calc(33.3% - 24px); right:calc(33.3% - 24px); height:2px; background:linear-gradient(90deg,#FF6B6B,#14B8A6); border-radius:2px; z-index:0;"
          ></div>

          {#each [{ n: "01", icon: Smartphone, bg: "#FF6B6B", title: "Create Session", body: "Add participants and bills. Set equal or custom splits in seconds." }, { n: "02", icon: MessageCircle, bg: "#14B8A6", title: "Send via WhatsApp", body: "One click notifies everyone with their personal payment link." }, { n: "03", icon: Camera, bg: "#14B8A6", title: "Track Payments", body: "Real-time status updates as proof uploads come in. Close when settled." }] as step}
            <div class="step-card" style="position:relative; z-index:1;">
              <!-- Step dot -->
              <div
                style="width:44px; height:44px; border-radius:14px; background:{step.bg}; display:flex; align-items:center; justify-content:center; margin-bottom:20px; box-shadow:0 4px 12px {step.bg}44;"
              >
                <svelte:component this={step.icon} size={20} color="#fff" />
              </div>
              <span class="step-number">{step.n}</span>
              <h4
                style="font-size:17px; font-weight:800; color:#111827; margin:0 0 10px; letter-spacing:-0.01em;"
              >
                {step.title}
              </h4>
              <p
                style="font-size:14px; color:#6B7280; margin:0; line-height:1.65;"
              >
                {step.body}
              </p>
            </div>
          {/each}
        </div>
      </section>

      <!-- ── CTA BANNER ── -->
      <section style="padding:0 24px 80px;">
        <div
          style="background:#111827; border-radius:28px; padding:56px 52px; display:flex; align-items:center; justify-content:space-between; gap:32px; flex-wrap:wrap; position:relative; overflow:hidden;"
        >
          <!-- Decorative circles -->
          <div
            style="position:absolute; right:-48px; top:-48px; width:240px; height:240px; border-radius:50%; background:rgba(255,107,107,0.12);"
          ></div>
          <div
            style="position:absolute; right:80px; bottom:-64px; width:180px; height:180px; border-radius:50%; background:rgba(20,184,166,0.1);"
          ></div>

          <div style="position:relative; z-index:1;">
            <h3
              style="font-size:clamp(22px,2.8vw,34px); font-weight:800; color:#fff; margin:0 0 10px; letter-spacing:-0.02em; line-height:1.2;"
            >
              Ready to split your first bill?
            </h3>
            <p style="font-size:15px; color:#6B7280; margin:0;">
              Free forever for groups. No credit card needed.
            </p>
          </div>

          <button
            class="btn-coral"
            style="position:relative; z-index:1; white-space:nowrap; font-size:16px; padding:15px 32px;"
            onclick={handleGetStarted}
          >
            Get Started Free <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  </main>

  <!-- Footer -->
  <SharedFooter />
</div>

<style>
  /* ── Google Fonts: same family feel, just swap to a slightly more characterful sans ── */
  @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

  :global(body) {
    font-family: "Plus Jakarta Sans", sans-serif;
    background: #ffffff;
    margin: 0;
  }

  /* Hero heading animation */
  .hero-word {
    display: inline-block;
    opacity: 0;
    transform: translateY(24px);
    animation: wordRise 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  @keyframes wordRise {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Nav */
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

  /* Primary CTA */
  .btn-coral {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #ff6b6b;
    color: #fff;
    font-family: "Plus Jakarta Sans", sans-serif;
    font-weight: 700;
    font-size: 15px;
    padding: 13px 28px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    transition:
      background 0.15s,
      transform 0.12s,
      box-shadow 0.15s;
    box-shadow: 0 4px 14px rgba(255, 107, 107, 0.35);
  }
  .btn-coral:hover {
    background: #ff5252;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }

  /* Feature card */
  .feature-card {
    background: #fff;
    border: 1.5px solid #f0f0f0;
    border-radius: 20px;
    padding: 28px;
    transition:
      border-color 0.2s,
      box-shadow 0.2s,
      transform 0.2s;
  }
  .feature-card:hover {
    border-color: #ff6b6b;
    box-shadow: 0 8px 32px rgba(255, 107, 107, 0.1);
    transform: translateY(-2px);
  }

  /* Icon bubble */
  .icon-bubble {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  /* Step card */
  .step-card {
    background: #fff;
    border: 1.5px solid #f0f0f0;
    border-radius: 20px;
    padding: 32px 28px;
    transition:
      border-color 0.2s,
      box-shadow 0.2s,
      transform 0.2s;
  }
  .step-card:hover {
    border-color: #14b8a6;
    box-shadow: 0 8px 32px rgba(20, 184, 166, 0.1);
    transform: translateY(-2px);
  }

  .step-number {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 16px;
    display: block;
  }
</style>
