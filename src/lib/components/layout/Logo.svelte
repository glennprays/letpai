<script lang="ts">
  export type Size = 'sm' | 'md' | 'lg';

  let { size = 'md' }: { size?: Size } = $props();

  const dimensions = {
    sm: { icon: 28, text: 15, gap: 7 },
    md: { icon: 36, text: 20, gap: 9 },
    lg: { icon: 48, text: 28, gap: 12 },
  };

  const d = dimensions[size];
</script>

<button class="logo-wrap" style="height: {d.icon}px;" aria-label="Letpai">
  <svg
    width={d.icon}
    height={d.icon}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="logo-icon"
  >
    <!--
      Split Mark
      ──────────
      Rounded square sliced diagonally.
      Coral top-left  |  Dark bottom-right
      Thin white gap between = the split
    -->
    <defs>
      <linearGradient id="lp-coral" x1="0" y1="0" x2="80" y2="80">
        <stop offset="0%" stop-color="#FF6B6B" />
        <stop offset="100%" stop-color="#FF5252" />
      </linearGradient>
    </defs>

    <!-- Dark bottom-right half -->
    <path
      d="M26 4C13.85 4 4 13.85 4 26V74C4 86.15 13.85 96 26 96H74C86.15 96 96 86.15 96 74V26C96 13.85 86.15 4 74 4H26ZM26 96L96 26V74C96 86.15 86.15 96 74 96H26Z"
      fill="#111827"
    />

    <!-- Dark rectangle layer on bottom-right -->
    <rect x="30" y="30" width="66" height="66" rx="14" fill="#111827" opacity="0.2" />

    <!-- Coral top-left half -->
    <path
      d="M74 4C86.15 4 96 13.85 96 26L26 96C13.85 96 4 86.15 4 74V26C4 13.85 13.85 4 26 4H74Z"
      fill="url(#lp-coral)"
    />

    <!-- Diagonal slice gap -->
    <line x1="4" y1="96" x2="96" y2="4" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.9" />
  </svg>
  <span class="logo-text" style="font-size: {d.text}px;">
    Letpai
  </span>
</button>

<style>
  .logo-wrap {
    display: inline-flex;
    align-items: center;
    gap: var(--gap, 8px);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;
    text-decoration: none;
    transition: opacity 0.15s;
  }

  .logo-wrap:hover {
    opacity: 0.85;
  }

  .logo-text {
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.03em;
    line-height: 1;
    margin: 0;
    padding: 0;
  }

  .logo-icon {
    flex-shrink: 0;
  }
</style>
