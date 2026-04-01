<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { toast } from '$lib/stores/toast';
  import { sendResetLink } from '$lib/services/auth';
  import { validatePhone } from '$lib/utils/validation';
  import { formatPhoneNumber } from '$lib/utils/format';
  import { Lock, ArrowRight, CheckCircle2, Mail, Clock, RotateCw } from 'lucide-svelte';

  const countryCodes = [
    { code: '62', label: 'ID (Indonesia)', short: 'ID' },
    { code: '1', label: 'US (USA)', short: 'US' },
    { code: '44', label: 'GB (UK)', short: 'GB' },
    { code: '61', label: 'AU (Australia)', short: 'AU' },
    { code: '65', label: 'SG (Singapore)', short: 'SG' },
    { code: '60', label: 'MY (Malaysia)', short: 'MY' },
  ];

  let step = $state(1); // 1: enter phone, 2: success
  let formData = $state({
    country_code: '62',
    whatsapp_number: '',
  });
  let isSubmitted = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();

    const whatsapp_number = formData.country_code + formatPhoneNumber(formData.whatsapp_number);
    const phoneValidation = validatePhone(whatsapp_number);

    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error || 'Nomor WhatsApp tidak valid');
      return;
    }

    try {
      const response = await sendResetLink({ whatsapp_number });

      if (response.success) {
        isSubmitted = true;
        step = 2;
        toast.success('Reset link sent successfully!');
      } else {
        toast.error('Failed to send reset link');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error(error);
    }
  }

  async function handleResend() {
    const whatsapp_number = formData.country_code + formatPhoneNumber(formData.whatsapp_number);

    try {
      const response = await sendResetLink({ whatsapp_number });

      if (response.success) {
        toast.success('Reset link sent again!');
      }
    } catch (error) {
      toast.error('Failed to resend reset link');
      console.error(error);
    }
  }
</script>

<div class="forgot-password-container">
  <!-- Step 1: Enter phone -->
  {#if step === 1}
    <div class="step-content animate-in">
      <!-- Header illustration -->
      <div class="illustration animate-in" style="animation-delay: 0.08s;">
        <div class="icon-circle-large">
          <Lock size={40} style="color: #FF6B6B;" />
        </div>
      </div>

      <!-- Title and subtitle -->
      <div class="header animate-in" style="animation-delay: 0.16s;">
        <h1>Forgot Password?</h1>
        <p>No worries! Enter your WhatsApp number and we'll send you a link to reset your password.</p>
      </div>

      <!-- Form -->
      <form onsubmit={handleSubmit}>
        <div class="form-group animate-in" style="animation-delay: 0.24s;">
          <label style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; display: block;">
            WhatsApp Number
          </label>
          <div class="phone-input-group">
            <select class="country-selector" bind:value={formData.country_code}>
              {#each countryCodes as country}
                <option value={country.code}>{country.short} (+{country.code})</option>
              {/each}
            </select>
            <input
              type="tel"
              bind:value={formData.whatsapp_number}
              class="phone-input"
              placeholder="8123456789"
              required
              style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500; color: #374151; background: white;"
            />
          </div>
          <p style="font-size: 12px; color: #9CA3AF; margin-top: 6px; line-height: 1.5;">
            We'll send reset link to your WhatsApp
          </p>
        </div>

        <div class="button-group animate-in" style="animation-delay: 0.32s;">
          <Button
            type="button"
            variant="secondary"
            size="default"
            onclick={() => goto('/login')}
          >
            Back to Login
          </Button>
          <Button type="submit" variant="primary" size="default" rightIcon={ArrowRight}>
            Send Reset Link
          </Button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Step 2: Success -->
  {#if step === 2}
    <div class="success-content animate-in">
      <!-- Success illustration -->
      <div class="success-illustration">
        <div class="icon-circle-large success">
          <CheckCircle2 size={48} style="color: #10B981;" />
        </div>
      </div>

      <!-- Title and subtitle -->
      <div class="header">
        <h1>Check Your WhatsApp</h1>
        <p>We've sent a password reset link to</p>
        <div class="phone-display">
          <Mail size={16} style="color: #FF6B6B;" />
          <span>{formData.country_code}{formData.whatsapp_number}</span>
        </div>
      </div>

      <!-- Helpful tips -->
      <div class="tips-section">
        <div class="tip-item">
          <Mail size={16} style="color: #6B7280;" />
          <span>Check your WhatsApp messages for the reset link</span>
        </div>
        <div class="tip-item">
          <Clock size={16} style="color: #6B7280;" />
          <span>The link will expire in 1 hour</span>
        </div>
      </div>

      <!-- Timer info -->
      <div class="timer-info">
        <Clock size={16} style="color: #6B7280;" />
        <span>Reset link is active for 2 minutes</span>
      </div>

      <button class="resend-button" onclick={handleResend}>
        <RotateCw size={16} style="color: #FF6B6B;" />
        Resend Reset Link
      </button>

      <Button variant="primary" size="default" onbuttonclick={() => goto('/login')} class="submit-button" rightIcon={ArrowRight}>
        Back to Login
      </Button>

      <!-- Help section -->
      <div class="help-section">
        <p style="font-size: 14px; color: #6B7280; margin: 0 0 12px; text-align: center;">
          Didn't receive the link?
        </p>
        <div class="help-links">
          <a
            href="/contact"
            style="
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              font-weight: 600;
              color: #FF6B6B;
              text-decoration: none;
              transition: color 0.15s;
            "
            onmouseenter={(e) => (e.currentTarget.style.color = '#FF5252')}
            onmouseleave={(e) => (e.currentTarget.style.color = '#FF6B6B')}
          >
            <Mail size={16} />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .forgot-password-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .step-content,
  .success-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .illustration {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }

  .success-illustration {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .icon-circle-large {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    background: linear-gradient(135deg, #FFF5F5, #FFF);
    border: 1.5px solid #FFE5E5;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 32px rgba(255, 107, 107, 0.2);
  }

  .icon-circle-large.success {
    background: linear-gradient(135deg, #DCFCE7, #FFF);
    border-color: #BBF7D0;
    box-shadow: 0 12px 32px rgba(16, 185, 129, 0.2);
  }

  .header {
    text-align: center;
  }

  .header h1 {
    font-size: 26px;
    font-weight: 800;
    color: #111827;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
  }

  .header p {
    font-size: 15px;
    color: #6B7280;
    margin: 0 0 16px;
    line-height: 1.6;
  }

  .phone-display {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: #FAFAFA;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
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

  .button-group {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .button-group button {
    flex: 1;
  }

  .tips-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: #FAFAFA;
    border-radius: 16px;
  }

  .tip-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #374151;
  }

  .timer-info,
  .resend-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 20px;
    border-radius: 12px;
  }

  .timer-info {
    color: #6B7280;
    background: #FAFAFA;
    width: 100%;
  }

  .resend-button {
    color: #FF6B6B;
    background: #FFF5F5;
    border: 1.5px solid #FFE5E5;
    cursor: pointer;
    transition: all 0.15s;
    width: 100%;
  }

  .resend-button:hover {
    background: #FFE5E5;
    transform: translateY(-1px);
  }

  .submit-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    margin-top: 8px;
  }

  .help-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #F0F0F0;
  }

  .help-links {
    display: flex;
    justify-content: center;
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
    .icon-circle-large {
      width: 64px;
      height: 64px;
    }

    .header h1 {
      font-size: 22px;
    }

    .header p {
      font-size: 14px;
    }

    .button-group {
      flex-direction: column;
    }
  }
</style>
