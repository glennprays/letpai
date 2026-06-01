<script lang="ts">
  import { cn } from '$lib/utils/cn';

  type SocialProvider = 'google' | 'apple' | 'facebook' | 'twitter';

  interface Props {
    provider: SocialProvider;
    onclick?: () => void;
    loading?: boolean;
    class?: string;
  }

  let { provider, onclick, loading = false, class: className }: Props = $props();

  const providers = {
    google: {
      name: 'Google',
      icon: 'G',
      iconType: 'text',
      color: '#4285F4',
    },
    apple: {
      name: 'Apple',
      icon: '',
      iconType: 'text',
      color: '#000000',
    },
    facebook: {
      name: 'Facebook',
      icon: 'f',
      iconType: 'text',
      color: '#1877F2',
    },
    twitter: {
      name: 'X (Twitter)',
      icon: '𝕏',
      iconType: 'text',
      color: '#000000',
    },
  };

  const currentProvider = $derived(providers[provider]);
</script>

<button
  onclick={onclick}
  disabled={loading}
  class={cn(
    'w-full flex items-center justify-center gap-3 bg-[#fff0ef] rounded-2xl h-10 px-6 text-[15px] font-bold text-[#251818] transition-all duration-150 font-sans hover:bg-[#fbe3e1] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden',
    className
  )}
>
  <span class="provider-icon" style="font-size: 20px; font-weight: 700; line-height: 1;">
    {currentProvider.icon}
  </span>
  <span class="provider-name">Continue with {currentProvider.name}</span>

  {#if loading}
    <div class="loading-overlay" style="position: absolute; inset: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center;">
      <svg
        class="animate-spin"
        style="width: 20px; height: 20px; color: #FF6B6B;"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8 018 8 0 018-8 8 018z"
        ></path>
      </svg>
    </div>
  {/if}
</button>

<style>
  button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  button:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .provider-icon {
    transition: transform 0.15s;
  }

  button:hover .provider-icon {
    transform: scale(1.1);
  }
</style>
