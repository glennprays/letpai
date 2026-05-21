<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { toast } from '$lib/stores/toast';
  import { register, verifyOTP } from '$lib/services/auth';
  import { setToken, setUser } from '$lib/stores/auth';
  import { validatePhone, validatePassword, validateOTP } from '$lib/utils/validation';
  import { formatPhoneNumber } from '$lib/utils/format';
  import { UserPlus, Shield, ArrowRight, CheckCircle2, Clock, RotateCw, AlertCircle } from 'lucide-svelte';

  const countryCodes = [
    { code: '62', label: 'ID (Indonesia)', short: 'ID' },
    { code: '1', label: 'US (USA)', short: 'US' },
    { code: '44', label: 'GB (UK)', short: 'GB' },
    { code: '61', label: 'AU (Australia)', short: 'AU' },
    { code: '65', label: 'SG (Singapore)', short: 'SG' },
    { code: '60', label: 'MY (Malaysia)', short: 'MY' },
  ];

  // Form state
  let currentStep = $state(1);
  let isLoading = $state(false);
  let formData = $state({
    country_code: '62',
    whatsapp_number: '',
    password: '',
    confirmPassword: '',
    otp: ['', '', '', '', '', ''],
  });

  // Validation errors
  let errors = $state({
    whatsapp_number: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const steps = [
    { id: 1, label: 'Account Info' },
    { id: 2, label: 'Verify OTP' },
  ];

  function validateStep1(): boolean {
    let isValid = true;
    errors = { whatsapp_number: '', password: '', confirmPassword: '', otp: '' };

    // Validate phone number
    const fullPhone = formData.country_code + formatPhoneNumber(formData.whatsapp_number);
    const phoneValidation = validatePhone(fullPhone);
    if (!phoneValidation.valid) {
      errors.whatsapp_number = phoneValidation.error || 'Invalid phone number';
      isValid = false;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error || 'Invalid password';
      isValid = false;
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    return isValid;
  }

  async function handleStep1Submit() {
    if (!validateStep1()) {
      return;
    }

    isLoading = true;
    const whatsapp_number = formData.country_code + formatPhoneNumber(formData.whatsapp_number);

    try {
      const response = await register({
        whatsapp_number,
        password: formData.password
      });

      if (response.success) {
        currentStep = 2;
        toast.success('OTP sent to your WhatsApp!');
      } else {
        toast.error(response.error?.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      isLoading = false;
    }
  }

  function validateStep2(): boolean {
    const otp = formData.otp.join('');
    const otpValidation = validateOTP(otp);

    if (!otpValidation.valid) {
      errors.otp = otpValidation.error || 'Invalid OTP';
      return false;
    }

    errors.otp = '';
    return true;
  }

  async function handleOTPSubmit() {
    if (!validateStep2()) {
      return;
    }

    isLoading = true;
    const whatsapp_number = formData.country_code + formatPhoneNumber(formData.whatsapp_number);
    const otp = formData.otp.join('');

    try {
      const response = await verifyOTP({ whatsapp_number, otp });

      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        toast.success('Account verified successfully!');

        // Invalidate all loads and redirect
        await invalidateAll();

        // Use setTimeout to ensure state is updated before navigation
        setTimeout(() => {
          goto('/dashboard', { replaceState: true });
        }, 100);
      } else {
        toast.error(response.error?.message || 'OTP verification failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      isLoading = false;
    }
  }

  async function resendOTP() {
    isLoading = true;
    const whatsapp_number = formData.country_code + formatPhoneNumber(formData.whatsapp_number);

    try {
      const response = await register({
        whatsapp_number,
        password: formData.password
      });

      if (response.success) {
        toast.success('OTP resent successfully!');
      } else {
        toast.error(response.error?.message || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
      console.error('Resend OTP error:', error);
    } finally {
      isLoading = false;
    }
  }

  function handleBack() {
    currentStep = 1;
  }

  function handleOTPInput(index: number, value: string) {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    formData.otp[index] = value;

    // Auto-focus next input
    if (value && index < 5) {
      const inputs = document.querySelectorAll('.otp-input');
      (inputs[index + 1] as HTMLInputElement)?.focus();
    }
  }

  function handleOTPKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !formData.otp[index] && index > 0) {
      const inputs = document.querySelectorAll('.otp-input');
      (inputs[index - 1] as HTMLInputElement)?.focus();
    }
  }

  function handleOTPPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    digits.split('').forEach((digit, i) => {
      if (i < 6) {
        formData.otp[i] = digit;
      }
    });

    // Focus the last filled input or the first empty one
    const nextEmptyIndex = formData.otp.findIndex(d => !d);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    const inputs = document.querySelectorAll('.otp-input');
    (inputs[focusIndex] as HTMLInputElement)?.focus();
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

      <!-- Phone Number -->
      <div class="form-group">
        <label class="form-label">WhatsApp Number</label>
        <div class="phone-input-group" class:error={!!errors.whatsapp_number}>
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
          />
        </div>
        {#if errors.whatsapp_number}
          <div class="error-message">
            <AlertCircle size={14} />
            <span>{errors.whatsapp_number}</span>
          </div>
        {:else}
          <p class="helper-text">We'll send you a WhatsApp notification for verification</p>
        {/if}
      </div>

      <!-- Password -->
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
          error={!!errors.password}
          errorText={errors.password}
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

      <!-- Confirm Password -->
      <div class="form-group">
        <Input
          type="password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          bind:value={formData.confirmPassword}
          required
          showClear
          error={!!errors.confirmPassword}
          errorText={errors.confirmPassword}
          leftIcon={Shield}
        />
      </div>

      <Button
        onclick={handleStep1Submit}
        variant="primary"
        size="default"
        class="submit-button"
        rightIcon={ArrowRight}
        loading={isLoading}
      >
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
        {#each formData.otp as digit, index}
          <input
            type="text"
            maxlength="1"
            class="otp-input"
            class:error={!!errors.otp}
            value={digit}
            oninput={(e) => handleOTPInput(index, (e.currentTarget as HTMLInputElement).value)}
            onkeydown={(e) => handleOTPKeyDown(e, index)}
            onpaste={handleOTPPaste}
          />
        {/each}
      </div>

      {#if errors.otp}
        <div class="error-message" style="justify-content: center; margin-top: 8px;">
          <AlertCircle size={14} />
          <span>{errors.otp}</span>
        </div>
      {/if}

      <!-- Timer info -->
      <div class="timer-info">
        <Clock size={16} style="color: #6B7280;" />
        <span>OTP is valid for 2 minutes</span>
      </div>

      <button class="resend-button" onclick={resendOTP} disabled={isLoading}>
        <RotateCw size={16} style="color: #FF6B6B;" />
        Resend OTP
      </button>

      <Button
        onclick={handleOTPSubmit}
        variant="primary"
        size="default"
        class="submit-button"
        rightIcon={ArrowRight}
        loading={isLoading}
      >
        Verify & Create Account
      </Button>

      <button class="back-button" onclick={handleBack}>
        Back to account info
      </button>
    </div>
  {/if}

  <!-- Bottom link -->
  <div class="register-footer">
    <p class="footer-text">Already have an account?</p>
    <a
      href="/login"
      class="footer-link"
    >
      Sign in
      <ArrowRight size={16} />
    </a>
  </div>

  <!-- Terms & Privacy -->
  <div class="terms-links">
    <p class="terms-text">
      By creating an account, you agree to our
      <a href="/" class="terms-link">Terms of Service</a>
      and
      <a href="/" class="terms-link">Privacy Policy</a>
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
    color: #251818;
    margin: 0 0 4px;
    letter-spacing: -0.02em;
  }

  .step-title p {
    font-size: 14px;
    color: #584140;
    margin: 0;
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
    transition: all 0.15s;
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
    color: #584140;
    margin-top: 4px;
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
    background: #f5dddb;
    border-radius: 16px;
    font-size: 15px;
    font-weight: 600;
    color: #251818;
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
    border: none;
    border-radius: 16px;
    background: #f5dddb;
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    transition: all 0.15s;
  }

  .otp-input:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(174, 47, 52, 0.2);
  }

  .otp-input.error {
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
    background: #fef2f2;
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
    border-radius: 16px;
  }

  .timer-info {
    color: #584140;
    background: #f5dddb;
    width: 100%;
  }

  .resend-button {
    color: #ae2f34;
    background: #f5dddb;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
  }

  .resend-button:hover:not(:disabled) {
    background: #fbe3e1;
    transform: translateY(-1px);
  }

  .resend-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    color: #251818;
  }

  .register-footer {
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
    .step-header {
      flex-direction: column;
      text-align: center;
    }

    .step-icon-circle {
      width: 48px;
      height: 48px;
    }

    .step-title h2 {
      font-size: 18px;
    }

    .country-selector {
      min-width: 80px;
      padding: 12px 6px;
      font-size: 13px;
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
