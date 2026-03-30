<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { toast } from '$lib/stores/toast';
  import { register, verifyOTP } from '$lib/services/auth';
  import { validatePhone, validatePassword, validateOTP } from '$lib/utils/validation';
  import { formatPhoneNumber } from '$lib/utils/format';
  import { UserPlus, Mail, Shield, ArrowRight, CheckCircle2, Clock, RotateCw } from 'lucide-svelte';

  const countryCodes = [
    { code: '62', label: 'ID (Indonesia)', short: 'ID' },
    { code: '1', label: 'US (USA)', short: 'US' },
    { code: '44', label: 'GB (UK)', short: 'GB' },
    { code: '61', label: 'AU (Australia)', short: 'AU' },
    { code: '65', label: 'SG (Singapore)', short: 'SG' },
    { code: '60', label: 'MY (Malaysia)', short: 'MY' },
  ];

  let currentStep = $state(1);
  let formData = $state({
    country_code: '62',
    whatsapp_number: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const steps = [
    { id: 1, label: 'Account Info' },
    { id: 2, label: 'Verify OTP' },
  ];

  async function handleStep1Submit() {
    const whatsapp_number = formData.country_code + formatPhoneNumber(formData.whatsapp_number);
    const phoneValidation = validatePhone(whatsapp_number);
    const passwordValidation = validatePassword(formData.password);

    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error || 'Nomor WhatsApp tidak valid');
      return;
    }

    if (!passwordValidation.valid) {
      toast.error(passwordValidation.error || 'Password tidak valid');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    try {
      const response = await register({ whatsapp_number, password: formData.password });

      if (response.success) {
        otpSent = true;
        currentStep = 2;
        toast.success('Account created! Please verify your OTP.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error(error);
    }
  }

  async function handleOTPSubmit() {
    const whatsapp_number = formData.country_code + formatPhoneNumber(formData.whatsapp_number);
    const otpValidation = validateOTP(formData.otp);

    if (!otpValidation.valid) {
      toast.error(otpValidation.error || 'OTP tidak valid');
      return;
    }

    try {
      const response = await verifyOTP({ whatsapp_number, otp: formData.otp });

      if (response.success) {
        toast.success('Registration successful!');
        goto('/login');
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error(error);
    }
  }

  async function resendOTP() {
    const whatsapp_number = formData.country_code + formatPhoneNumber(formData.whatsapp_number);

    try {
      const response = await register({
        whatsapp_number,
        password: formData.password,
      });

      if (response.success) {
        toast.success('OTP sent successfully!');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
      console.error(error);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  const passwordStrength = $derived(calculatePasswordStrength(formData.password));

  function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
    if (!password) return { score: 0, label: 'Enter password', color: '#9CA3AF' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 33, label: 'Weak', color: '#EF4444' };
    if (score <= 4) return { score: 66, label: 'Medium', color: '#F59E0B' };
    return { score: 100, label: 'Strong', color: '#10B981' };
  }
</script>

<div class="register-container">
  <!-- Progress bar -->
  <div class="progress-bar-container">
    <div class="progress-bar" style="width: {currentStep === 1 ? '50%' : '100%'}"></div>
  </div>

  <!-- Step 1: Account Info -->
  {#if currentStep === 1}
    <div class="step-content animate-in">
      <div class="step-header">
        <div class="step-icon-circle">
          <UserPlus size={28} style="color: #FF6B6B;" />
        </div>
        <div class="step-title">
          <h2>Create Account</h2>
          <p>Let's get you started with your account details</p>
        </div>
       </div>

      <div class="form-group">
        <label style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; display: block;">
          Full Name
        </label>
        <input
          type="text"
          bind:value={formData.full_name}
          class="text-input"
          placeholder="John Doe"
          required
          style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 500; color: #374151; background: white;"
        />
      </div>

      <div class="form-group">
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
          We'll send you a WhatsApp notification for verification
        </p>
      </div>

      <div class="form-group">
        <Input
          type="password"
          label="Password"
          placeholder="Create a strong password"
          bind:value={formData.password}
          required
          showClear
          showCount
          maxLength={20}
          helperText="Use 8+ characters with a mix of letters, numbers & symbols"
        />

        <!-- Password strength indicator -->
        {#if formData.password}
          <div class="password-strength">
            <div class="strength-bar">
              <div class="strength-fill" style="width: {passwordStrength.score}%; background: {passwordStrength.color};"></div>
            </div>
            <span class="strength-label" style="color: {passwordStrength.color};">
              {passwordStrength.label}
            </span>
          </div>
        {/if}
      </div>

      <div class="form-group">
        <Input
          type="password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          bind:value={formData.confirmPassword}
          required
          error={formData.confirmPassword && formData.password !== formData.confirmPassword}
          errorText={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
          showClear
          leftIcon={Shield}
        />
      </div>

      <Button onclick={handleStep1Submit} variant="primary" size="default" class="submit-button" rightIcon={ArrowRight}>
        Continue
      </Button>
    </div>
  {/if}

  <!-- Step 2: Verify OTP -->
  {#if currentStep === 2}
    <div class="step-content animate-in">
      <div class="step-header">
        <div class="step-icon-circle">
          <CheckCircle2 size={28} style="color: #10B981;" />
        </div>
        <div class="step-title">
          <h2>Verify Your Account</h2>
          <p>Enter the 6-digit code sent to your WhatsApp</p>
        </div>
      </div>

      <!-- Phone display -->
      <div class="phone-display">
        <Shield size={16} style="color: #FF6B6B;" />
        <span>{formData.country_code}{formData.whatsapp_number}</span>
      </div>

      <!-- OTP Input -->
      <div class="otp-container">
        {#each [1, 2, 3, 4, 5, 6] as index}
          <input
            type="text"
            maxlength="1"
            class="otp-input"
            oninput={(e) => {
              const input = e.target as HTMLInputElement;
              if (input.value.length === 1) {
                const nextInput = input.nextElementSibling as HTMLInputElement;
                if (nextInput) nextInput.focus();
              }
              formData.otp = Array.from(document.querySelectorAll('.otp-input')).map((i) => (i as HTMLInputElement).value).join('');
            }}
            onkeydown={(e) => {
              if (e.key === 'Backspace') {
                const input = e.target as HTMLInputElement;
                if (input.value === '') {
                  const prevInput = input.previousElementSibling as HTMLInputElement;
                  if (prevInput) prevInput.focus();
                }
              }
            }}
          />
        {/each}
      </div>

      <!-- Timer info -->
      <div class="timer-info">
        <Clock size={16} style="color: #6B7280;" />
        <span>OTP is active for 2 minutes</span>
      </div>

      <button class="resend-button" onclick={resendOTP}>
        <RotateCw size={16} style="color: #FF6B6B;" />
        Resend OTP
      </button>

      <Button onclick={handleOTPSubmit} variant="primary" size="default" class="submit-button" rightIcon={ArrowRight}>
        Verify & Create Account
      </Button>

      <button class="back-button" onclick={handleBack}>
        Back to account info
      </button>
    </div>
  {/if}

  <!-- Bottom link -->
  <div class="register-footer">
    <p style="font-size: 14px; color: #6B7280; margin: 0 0 8px;">
      Already have an account?
    </p>
    <a
      href="/login"
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
      Sign in
      <ArrowRight size={16} />
    </a>
  </div>

  <!-- Terms & Privacy -->
  <div class="terms-links">
    <p style="font-size: 12px; color: #9CA3AF; margin: 0; text-align: center;">
      By creating an account, you agree to our
      <a href="/" style="color: #FF6B6B; text-decoration: none;">Terms of Service</a>
      and
      <a href="/" style="color: #FF6B6B; text-decoration: none;">Privacy Policy</a>
    </p>
  </div>
</div>

<style>
  .register-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .progress-bar-container {
    width: 100%;
    height: 4px;
    background: #F3F4F6;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 24px;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #FF6B6B, #14B8A6);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .step-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 8px;
  }

  .step-icon-circle {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: linear-gradient(135deg, #FFF5F5, #FFF);
    border: 1.5px solid #FFE5E5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .step-title h2 {
    font-size: 20px;
    font-weight: 800;
    color: #111827;
    margin: 0 0 4px;
    letter-spacing: -0.02em;
  }

  .step-title p {
    font-size: 14px;
    color: #6B7280;
    margin: 0;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
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

  .text-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #D1D5DB;
    border-radius: 12px;
    font: 14px 'Plus Jakarta Sans', sans-serif;
    color: #374151;
    background: white;
    transition: border-color 0.15s;
  }

  .text-input:focus {
    outline: none;
    border-color: #FF6B6B;
  }

  .password-strength {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
  }

  .strength-bar {
    flex: 1;
    height: 4px;
    background: #F3F4F6;
    border-radius: 2px;
    overflow: hidden;
  }

  .strength-fill {
    height: 100%;
    transition: all 0.3s ease;
  }

  .strength-label {
    font-size: 12px;
    font-weight: 600;
  }

  .phone-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #FAFAFA;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    text-align: center;
    justify-content: center;
  }

  .otp-container {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin: 16px 0;
  }

  .otp-input {
    width: 48px;
    height: 56px;
    border: 1.5px solid #F0F0F0;
    border-radius: 12px;
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    transition: all 0.15s;
  }

  .otp-input:focus {
    outline: none;
    border-color: #FF6B6B;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.12);
  }

  @media (max-width: 640px) {
    .otp-input {
      width: 40px;
      height: 48px;
      font-size: 20px;
    }
  }

  .timer-info,
  .resend-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    padding: 12px;
    margin: 16px 0;
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
  }

  .resend-button:hover {
    background: #FFE5E5;
    transform: translateY(-1px);
  }

  .submit-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }

  .back-button {
    background: none;
    border: none;
    color: #6B7280;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    margin-top: 12px;
    transition: color 0.15s;
  }

  .back-button:hover {
    color: #111827;
  }

  .register-footer {
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
    .step-header {
      flex-direction: column;
      text-align: center;
    }

    .step-icon-circle {
      width: 48px;
      height: 48px;
    }

    .otp-input {
      width: 40px;
      height: 48px;
      font-size: 20px;
    }

    .otp-container {
      gap: 6px;
    }

    .country-selector {
      min-width: 80px;
      padding: 12px 6px;
      font-size: 13px;
    }

    .step-title h2 {
      font-size: 18px;
    }
  }

  @media (max-width: 375px) {
    .register-container {
      gap: 20px;
    }

    .step-content {
      gap: 16px;
    }

    .otp-input {
      width: 36px;
      height: 44px;
      font-size: 18px;
    }

    .otp-container {
      gap: 4px;
    }
  }
</style>
