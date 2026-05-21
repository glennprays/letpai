<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import Input from '$lib/components/ui/Input.svelte';
  import { validatePhone, validatePassword } from '$lib/utils/validation';
  import { formatPhoneNumber } from '$lib/utils/format';
  import { ArrowRight, Shield } from 'lucide-svelte';
  import type { ActionData } from './$types';

  interface Props {
    form?: ActionData;
  }

  let { form }: Props = $props();

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

  let clientErrors = $state({
    whatsapp_number: '',
    password: '',
  });

  // Get return URL from query params
  const returnURL = $derived(() => {
    const returnParam = $page.url.searchParams.get('return');
    return returnParam ? returnParam : '/dashboard';
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

  <!-- Server error message -->
  {#if form?.message}
    <div class="error-banner">
      <Shield size={16} />
      {form.message}
    </div>
  {/if}

  <!-- Form -->
  <form
    method="POST"
    class="login-form"
    use:enhance={({ formData, cancel }) => {
      const whatsapp_number_raw = formData.get('whatsapp_number_raw') as string;
      const country_code_hidden = formData.get('country_code_hidden') as string;
      const password = formData.get('password') as string;

      // Client-side validation
      const fullPhone = country_code_hidden + formatPhoneNumber(whatsapp_number_raw);
      const phoneValidation = validatePhone(fullPhone);
      const passwordValidation = validatePassword(password);

      if (!phoneValidation.valid) {
        clientErrors.whatsapp_number = phoneValidation.error || 'Invalid phone number';
        cancel();
      } else if (!passwordValidation.valid) {
        clientErrors.password = passwordValidation.error || 'Invalid password';
        cancel();
      } else {
        clientErrors = { whatsapp_number: '', password: '' };
        // Remove raw fields and set formatted phone number
        formData.delete('whatsapp_number_raw');
        formData.delete('country_code_hidden');
        formData.set('whatsapp_number', fullPhone);
        // Add return URL to form data
        formData.set('return', returnURL());
      }
    }}
  >
    <!-- Phone Number -->
    <div class="form-group animate-in" style="animation-delay: 0.24s;">
      <span class="form-label">WhatsApp Number</span>
      <div class="phone-input-group" class:error={!!clientErrors.whatsapp_number}>
        <select class="country-selector" bind:value={formData.country_code}>
          {#each countryCodes as country}
            <option value={country.code}>{country.short} (+{country.code})</option>
          {/each}
        </select>
        <input
          type="tel"
          name="whatsapp_number_raw"
          bind:value={formData.whatsapp_number}
          class="phone-input"
          placeholder="8123456789"
          required
        />
      </div>
      <input type="hidden" name="country_code_hidden" value={formData.country_code} />
      {#if clientErrors.whatsapp_number}
        <div class="error-message">
          <Shield size={14} />
          <span>{clientErrors.whatsapp_number}</span>
        </div>
      {:else}
        <p class="helper-text">We'll send you a WhatsApp notification if needed</p>
      {/if}
    </div>

    <!-- Password -->
    <div class="form-group animate-in" style="animation-delay: 0.32s;">
      <div class="password-header">
        <label for="password" class="form-label">Password</label>
        <a href="/forgot-password" class="forgot-link">
          Forgot password?
        </a>
      </div>
      <Input
        type="password"
        name="password"
        id="password"
        placeholder="Enter your password"
        bind:value={formData.password}
        required
        showClear
        error={!!clientErrors.password}
        errorText={clientErrors.password}
      />
    </div>

    <!-- Remember me -->
    <div class="form-group animate-in" style="animation-delay: 0.4s;">
      <label class="checkbox-label">
        <input type="checkbox" class="checkbox" />
        <span>Remember me</span>
      </label>
    </div>

    <!-- Submit Button -->
    <div class="form-group animate-in" style="animation-delay: 0.48s;">
      <button
        type="submit"
        class="submit-button"
      >
        Login
        <ArrowRight size={18} style="margin-left: 6px;" />
      </button>
    </div>
  </form>

  <!-- Bottom links -->
  <div class="login-footer animate-in" style="animation-delay: 0.72s;">
    <p class="footer-text">Don't have an account?</p>
    <a href="/register" class="footer-link">
      Create an account
      <ArrowRight size={16} />
    </a>
  </div>

  <!-- Terms & Privacy -->
  <div class="terms-links animate-in" style="animation-delay: 0.8s;">
    <p class="terms-text">
      By logging in, you agree to our
      <a href="/" class="terms-link">Terms of Service</a>
      and
      <a href="/" class="terms-link">Privacy Policy</a>
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
    color: #251818;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
  }

  .login-subtitle {
    font-size: 15px;
    color: #584140;
    margin: 0;
    line-height: 1.6;
  }

  .error-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fef2f2;
    border: none;
    border-radius: 16px;
    color: #DC2626;
    font-size: 14px;
    font-weight: 500;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-label {
    font-size: 13px;
    font-weight: 600;
    color: #251818;
    margin-bottom: 6px;
    display: block;
  }

  .phone-input-group {
    display: flex;
    align-items: stretch;
    gap: 0;
    background: #f5dddb;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .phone-input-group.error {
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
    background: #fef2f2;
  }

  .country-selector {
    width: auto;
    min-width: 90px;
    padding: 12px 8px;
    border: none;
    border-right: 1px solid #fbe3e1;
    background: transparent;
    font: 14px 'Plus Jakarta Sans', sans-serif;
    color: #251818;
    cursor: pointer;
    transition: all 0.15s;
  }

  .phone-input {
    flex: 1;
    padding: 12px 16px;
    border: none;
    font: 14px 'Plus Jakarta Sans', sans-serif;
    color: #251818;
    background: transparent;
    transition: all 0.15s;
  }

  .country-selector:focus,
  .phone-input:focus {
    outline: none;
    box-shadow: inset 0 -2px 0 #ae2f34;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #EF4444;
    margin-top: 4px;
  }

  .helper-text {
    font-size: 12px;
    color: #9CA3AF;
    margin-top: 4px;
  }

  .password-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .forgot-link {
    font-size: 13px;
    font-weight: 600;
    color: #006b5f;
    text-decoration: none;
    transition: color 0.15s;
  }

  .forgot-link:hover {
    color: #14B8A6;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #6B7280;
  }

  .checkbox {
    width: 18px;
    height: 18px;
    accent-color: #ae2f34;
    cursor: pointer;
  }

  .submit-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #ae2f34, #FF6B6B);
    border: none;
    border-radius: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(174, 47, 52, 0.25);
  }

  .submit-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(174, 47, 52, 0.35);
  }

  .submit-button:active {
    transform: scale(0.98);
  }

  .login-footer {
    text-align: center;
    margin-top: 8px;
    padding-top: 16px;
  }

  .footer-text {
    font-size: 14px;
    color: #6B7280;
    margin: 0 0 8px;
  }

  .footer-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #ae2f34;
    text-decoration: none;
    transition: all 0.15s;
  }

  .footer-link:hover {
    transform: translateX(4px);
    color: #FF5252;
  }

  .terms-links {
    margin-top: 8px;
  }

  .terms-text {
    font-size: 12px;
    color: #9CA3AF;
    margin: 0;
    text-align: center;
  }

  .terms-link {
    color: #ae2f34;
    text-decoration: none;
  }

  .terms-link:hover {
    text-decoration: underline;
  }

  .animate-in {
    animation: slideIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
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
