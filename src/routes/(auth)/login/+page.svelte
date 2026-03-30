<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/Button.svelte';
  import { Input } from '$lib/components/ui/Input.svelte';
  import { toast } from '$lib/stores/toast';
  import { login } from '$lib/services/auth';
  import { validatePhone, validatePassword } from '$lib/utils/validation';
  import { formatPhoneNumber } from '$lib/utils/format';
  import { Lock, ArrowRight } from 'lucide-svelte';

  const countryCodes = [
    { code: '62', label: 'ID (Indonesia)', short: 'ID' },
    { code: '1', label: 'US (USA)', short: 'US' },
    { code: '44', label: 'GB (UK)', short: 'GB' },
    { code: '61', label: 'AU (Australia)', short: 'AU' },
    { code: '65', label: 'SG (Singapore)', short: 'SG' },
    { code: '60', label: 'MY (Malaysia)', short: 'MY' },
  ];

  let formData = $state({
    country_code: '62',
    whatsapp_number: '',
    password: '',
  });

  // Get return URL from query params
  const returnURL = $derived(() => {
    const returnParam = $page.url.searchParams.get('return');
    return returnParam ? decodeURIComponent(returnParam) : '/dashboard';
  });
</script>

<div class="login-container">
  <!-- Title and subtitle -->
  <div class="login-header">
    <h1 class="login-title animate-in" style="animation-delay: 0.08s;">
      Welcome Back
    </h1>
    <p class="login-subtitle animate-in" style="animation-delay: 0.16s;">
      Enter your credentials to access your account
    </p>
  </div>

  <!-- Form -->
  <form
    class="login-form"
    onsubmit={async (e) => {
      e.preventDefault();

      const whatsapp_number = formData.country_code + formatPhoneNumber(formData.whatsapp_number);
      const password = formData.password;

      // Validation
      const phoneValidation = validatePhone(whatsapp_number);
      const passwordValidation = validatePassword(password);

      if (!phoneValidation.valid) {
        toast.error(phoneValidation.error || 'Nomor WhatsApp tidak valid');
        return;
      }

      if (!passwordValidation.valid) {
        toast.error(passwordValidation.error || 'Password tidak valid');
        return;
      }

      try {
        const response = await login({ whatsapp_number, password });

        if (response.success) {
          // setToken and setUser are already called in the login function
          toast.success('Login berhasil!');
          goto(returnURL(), { replaceState: true });
        } else {
          toast.error(response.error?.message || 'Login gagal. Silakan coba lagi.');
        }
      } catch (error) {
        toast.error('Terjadi kesalahan. Silakan coba lagi.');
        console.error(error);
      }
    }}
  >
    <div class="form-group animate-in" style="animation-delay: 0.24s;">
      <label style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; display: block;">
        Nomor WhatsApp
      </label>
        <div class="phone-input-group">
          <select class="country-selector" bind:value={formData.country_code}>
            {#each countryCodes as country}
              <option value={country.code}>{country.short} (+{country.code})</option>
            {/each}
          </select>
        <input
          type="tel"
          name="whatsapp_number"
          bind:value={formData.whatsapp_number}
          class="phone-input"
          placeholder="8123456789"
          required
          style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500; color: #374151; background: white;"
        />
      </div>
      <p style="font-size: 12px; color: #9CA3AF; margin-top: 6px; line-height: 1.5;">
        We'll send you a WhatsApp notification if needed
      </p>
    </div>

    <div class="form-group animate-in" style="animation-delay: 0.32s;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <label for="password" style="font-size: 13px; font-weight: 600; color: #374151;">
          Password
        </label>
        <a
          href="/forgot-password"
          style="font-size: 13px; font-weight: 600; color: #FF6B6B; text-decoration: none; transition: color 0.15s;"
          onmouseenter={(e) => (e.currentTarget.style.color = '#FF5252')}
          onmouseleave={(e) => (e.currentTarget.style.color = '#FF6B6B')}
        >
          Forgot password?
        </a>
      </div>
      <Input
        type="password"
        name="password"
        placeholder="Masukkan password"
        bind:value={formData.password}
        required
        showClear
        id="password"
      />
    </div>

    <div class="form-group animate-in" style="animation-delay: 0.4s;">
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #6B7280;">
        <input type="checkbox" style="width: 18px; height: 18px; accent-color: #FF6B6B; cursor: pointer;" />
        <span>Remember me</span>
      </label>
    </div>

    <div class="form-group animate-in" style="animation-delay: 0.48s;">
      <Button
        type="submit"
        variant="primary"
        size="default"
        class="submit-button"
        rightIcon={ArrowRight}
      >
        Login
      </Button>
    </div>
  </form>

  <!-- Bottom links -->
  <div class="login-footer animate-in" style="animation-delay: 0.72s;">
    <p style="font-size: 14px; color: #6B7280; margin: 0 0 8px;">
      Don't have an account?
    </p>
    <a
      href="/register"
      style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 600;
        color: #FF6B6B;
        text-decoration: none;
        transition: all 0.15s;
      "
      onmouseenter={(e) => {
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.color = '#FF5252';
      }}
      onmouseleave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.color = '#FF6B6B';
      }}
    >
      Create an account
      <ArrowRight size={16} />
    </a>
  </div>

  <!-- Terms & Privacy -->
  <div class="terms-links animate-in" style="animation-delay: 0.8s;">
    <p style="font-size: 12px; color: #9CA3AF; margin: 0; text-align: center;">
      By logging in, you agree to our
      <a
        href="/"
        style="color: #FF6B6B; text-decoration: none; transition: color 0.15s;"
        onmouseenter={(e) => (e.currentTarget.style.color = '#FF5252')}
        onmouseleave={(e) => (e.currentTarget.style.color = '#FF6B6B')}
      >
        Terms of Service
      </a>
      and
      <a
        href="/"
        style="color: #FF6B6B; text-decoration: none; transition: color 0.15s;"
        onmouseenter={(e) => (e.currentTarget.style.color = '#FF5252')}
        onmouseleave={(e) => (e.currentTarget.style.color = '#FF6B6B')}
      >
        Privacy Policy
      </a>
    </p>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .login-header {
    text-align: center;
    margin-bottom: 8px;
  }

  .login-title {
    font-size: 28px;
    font-weight: 800;
    color: #111827;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
  }

  .login-subtitle {
    font-size: 15px;
    color: #6B7280;
    margin: 0;
    line-height: 1.6;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .phone-input-group {
    display: flex;
    align-items: stretch;
    gap: 0;
  }

  .country-selector {
    width: auto;
    min-width: 90px;
    padding: 12px 8px;
    border: 2px solid #D1D5DB;
    border-right: none;
    border-radius: 8px 0 0 8px;
    background: #F9FAFB;
    font: 14px 'Plus Jakarta Sans', sans-serif;
    color: #374151;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .phone-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #D1D5DB;
    border-left: none;
    border-radius: 0 8px 8px 0;
    font: 14px 'Plus Jakarta Sans', sans-serif;
    color: #374151;
    background: white;
    transition: border-color 0.15s;
  }

  .country-selector:focus,
  .phone-input:focus {
    outline: none;
    border-color: #FF6B6B;
  }

  .country-selector:focus + .phone-input {
    border-color: #FF6B6B;
  }

  .submit-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }

  .login-footer {
    text-align: center;
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px solid #F0F0F0;
  }

  .terms-links {
    margin-top: 8px;
  }

  .animate-in {
    opacity: 0;
    transform: translateY(24px);
    animation: slideIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes slideIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    .login-title {
      font-size: 24px;
    }

    .login-subtitle {
      font-size: 14px;
    }

    .country-selector {
      min-width: 80px;
      padding: 12px 6px;
      font-size: 13px;
    }
  }

  @media (max-width: 375px) {
    .login-container {
      gap: 20px;
    }

    .login-form {
      gap: 16px;
    }
  }
</style>
