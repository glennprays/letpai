<script lang="ts">
  import { ArrowRight } from "lucide-svelte";
  import Logo from "$lib/components/layout/Logo.svelte";

  const footerLinks = {
    product: [
      { label: "How it works", href: "/" },
      { label: "Features", href: "/" },
      { label: "Pricing", href: "/" },
    ],
    company: [
      { label: "About", href: "/" },
      { label: "Contact", href: "/" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/" },
      { label: "Terms of Service", href: "/" },
      { label: "Cookie Policy", href: "/" },
    ],
  };
</script>

<footer
  style="background: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif;"
>
  <!-- Top accent line -->
  <div
    style="
      height: 3px;
      background: linear-gradient(90deg, #FF6B6B, #14B8A6);
      width: 100%;
    "
  ></div>

  <div
    style="
      max-width: 1200px;
      margin: 0 auto;
      padding: 56px 24px 0;
    "
  >
  <!-- Main footer grid -->
  <div class="footer-grid">
      <!-- Decorative circles -->
      <div
        style="
          position: absolute;
          right: -48px;
          top: -24px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 107, 107, 0.12);
          pointer-events: none;
        "
      ></div>
      <div
        style="
          position: absolute;
          right: 120px;
          bottom: -32px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(20, 184, 166, 0.1);
          pointer-events: none;
        "
      ></div>

      <!-- Brand column -->
      <div style="position: relative; z-index: 1;">
        <div style="margin-bottom: 16px;">
          <Logo size="sm" />
        </div>
        <p
          style="
            font-size: 14px;
            color: #64748B;
            line-height: 1.7;
            margin: 0 0 20px;
            max-width: 240px;
          "
        >
          Split bills, not friendships. WhatsApp notification payments for your
          whole group.
        </p>
      </div>

      <!-- Product links -->
      <div style="position: relative; z-index: 1;">
        <p
          style="
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #4B5563;
            margin: 0 0 16px;
          "
        >
          Product
        </p>
        <nav style="display: flex; flex-direction: column; gap: 12px;">
          {#each footerLinks.product as link}
            <a
              href={link.href}
              style="
                font-size: 14px;
                color: #9CA3AF;
                text-decoration: none;
                transition: color 0.15s;
                display: flex;
                align-items: center;
                gap: 4px;
              "
              onmouseenter={(e) => {
                const arrow = e.currentTarget.querySelector(".link-arrow");
                if (arrow) arrow.style.transform = "translateX(4px)";
              }}
              onmouseleave={(e) => {
                const arrow = e.currentTarget.querySelector(".link-arrow");
                if (arrow) arrow.style.transform = "translateX(0)";
              }}
            >
              {link.label}
              <ArrowRight
                class="link-arrow"
                size={14}
                style="transition: transform 0.15s; opacity: 0.6;"
              />
            </a>
          {/each}
        </nav>
      </div>

      <!-- Company links -->
      <div style="position: relative; z-index: 1;">
        <p
          style="
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #4B5563;
            margin: 0 0 16px;
          "
        >
          Company
        </p>
        <nav style="display: flex; flex-direction: column; gap: 12px;">
          {#each footerLinks.company as link}
            <a
              href={link.href}
              style="
                font-size: 14px;
                color: #9CA3AF;
                text-decoration: none;
                transition: color 0.15s;
                display: flex;
                align-items: center;
                gap: 4px;
              "
              onmouseenter={(e) => {
                const arrow = e.currentTarget.querySelector(".link-arrow");
                if (arrow) arrow.style.transform = "translateX(4px)";
              }}
              onmouseleave={(e) => {
                const arrow = e.currentTarget.querySelector(".link-arrow");
                if (arrow) arrow.style.transform = "translateX(0)";
              }}
            >
              {link.label}
              <ArrowRight
                class="link-arrow"
                size={14}
                style="transition: transform 0.15s; opacity: 0.6;"
              />
            </a>
          {/each}
        </nav>
      </div>

      <!-- Legal links -->
      <div style="position: relative; z-index: 1;">
        <p
          style="
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #4B5563;
            margin: 0 0 16px;
          "
        >
          Legal
        </p>
        <nav style="display: flex; flex-direction: column; gap: 12px;">
          {#each footerLinks.legal as link}
            <a
              href={link.href}
              style="
                font-size: 14px;
                color: #9CA3AF;
                text-decoration: none;
                transition: color 0.15s;
                display: flex;
                align-items: center;
                gap: 4px;
              "
              onmouseenter={(e) => {
                const arrow = e.currentTarget.querySelector(".link-arrow");
                if (arrow) arrow.style.transform = "translateX(4px)";
              }}
              onmouseleave={(e) => {
                const arrow = e.currentTarget.querySelector(".link-arrow");
                if (arrow) arrow.style.transform = "translateX(0)";
              }}
            >
              {link.label}
              <ArrowRight
                class="link-arrow"
                size={14}
                style="transition: transform 0.15s; opacity: 0.6;"
              />
            </a>
          {/each}
        </nav>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="footer-bottom">
      <p style="font-size: 13px; color: #334155; margin: 0;">
        © 2026 Letpai. All rights reserved.
      </p>
    </div>
  </div>
</footer>

<style>
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    padding-bottom: 48px;
    border-bottom: 1px solid #1E293B;
    position: relative;
  }

  .footer-bottom {
    padding: 20px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    position: relative;
    z-index: 1;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @media (max-width: 768px) {
    .footer-grid {
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
  }

  @media (max-width: 480px) {
    .footer-grid {
      grid-template-columns: 1fr;
      gap: 32px;
      padding-bottom: 32px;
    }

    .footer-bottom {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
</style>
