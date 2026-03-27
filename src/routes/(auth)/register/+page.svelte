<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import SocialLoginButton from '$lib/components/ui/SocialLoginButton.svelte';
  import ProgressStepper from '$lib/components/ui/ProgressStepper.svelte';
  import { toast } from '$lib/stores/toast';
  import { register, verifyOTP } from '$lib/services/auth';
  import { validatePhone, validatePassword, validateOTP } from '$lib/utils/validation';
  import { formatPhoneNumber } from '$lib/utils/format';
  import { UserPlus, Mail, Shield, ArrowRight, CheckCircle2, Clock, RotateCw } from 'lucide-svelte';

  let currentStep = $state(1);
  let formData = $state({
    whatsapp_number: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    email: '',
    otp: '',
  });

  let otpSent = $state(false);
  let countdown = $state(60);
  let countdownInterval = $state<NodeJS.Timeout | null>(null);

  const steps = [
    { id: 1, label: 'Account Info' },
    { id: 2, label: 'Personal Info' },
    { id: 3, label: 'Verify OTP' },
  ];

  function startCountdown() {
    otpSent = true;
    countdown = 60;

    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownInterval!);
        countdownInterval = null;
      }
    }, 1000);
  }

  async function handleStep1Submit() {
    const phoneValidation = validatePhone(formData.whatsapp_number);
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
      const response = await register({ whatsapp_number: formData.whatsapp_number, password: formData.password });

      if (response.success) {
        startCountdown();
        currentStep = 2;
        toast.success('Account created! Let\'s add some details.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error(error);
    }
  }

  async function handleStep2Submit() {
    // Email is optional, so no strict validation
    currentStep = 3;
  }

  async function handleOTPSubmit() {
    const otpValidation = validateOTP(formData.otp);

    if (!otpValidation.valid) {
      toast.error(otpValidation.error || 'OTP tidak valid');
      return;
    }

    try {
      const response = await verifyOTP({ whatsapp_number: formData.whatsapp_number, otp: formData.otp });

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
    if (countdown > 0) return;

    try {
      const response = await register({
        whatsapp_number: formData.whatsapp_number,
        password: formData.password,
      });

      if (response.success) {
        startCountdown();
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

  function getStepsProgress() {
    return Math.round(((currentStep - 1) / (steps.length - 1)) * 100);
  }

  $: passwordStrength = calculatePasswordStrength(formData.password);

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
  <!-- Progress stepper -->
  <ProgressStepper steps={steps} currentStep={currentStep} />

  <!-- Progress bar -->
  <div class="progress-bar-container">
    <div class="progress-bar" style="width: {getStepsProgress()}%"></div>
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
        <Input
          type="tel"
          label="WhatsApp Number"
          placeholder="62xxxxxxxxxx"
          bind:value={formData.whatsapp_number}
          required
          helperText="We'll send you a WhatsApp notification for verification"
          leftIcon={UserPlus}
        />
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

  <!-- Step 2: Personal Info -->
  {#if currentStep === 2}
    <div class="step-content animate-in">
      <div class="step-header">
        <div class="step-icon-circle">
          <Mail size={28} style="color: #14B8A6;" />
        </div>
        <div class="step-title">
          <h2>Personal Info</h2>
          <p>Tell us a bit about yourself (optional)</p>
        </div>
      </div>

      <div class="form-group">
        <Input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          bind:value={formData.full_name}
          helperText="This helps us personalize your experience"
          leftIcon={UserPlus}
        />
      </div>

      <div class="form-group">
        <Input
          type="email"
          label="Email Address (Optional)"
          placeholder="john@example.com"
          bind:value={formData.email}
          helperText="For account recovery and updates"
          leftIcon={Mail}
        />
      </div>

      <div class="button-group">
        <Button onclick={handleBack} variant="secondary" size="default">
          Back
        </Button>
        <Button onclick={handleStep2Submit} variant="primary" size="default" rightIcon={ArrowRight}>
          Continue
        </Button>
      </div>
    </div>
  {/if}

  <!-- Step 3: Verify OTP -->
  {#if currentStep === 3}
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
        <span>{formData.whatsapp_number}</span>
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

      <!-- Timer -->
      {#if countdown > 0}
        <div class="timer-display">
          <Clock size={16} style="color: #6B7280;" />
          <span>Resend in {countdown}s</span>
        </div>
      {:else}
        <button class="resend-button" onclick={resendOTP}>
          <RotateCw size={16} style="color: #FF6B6B;" />
          Resend OTP
        </button>
      {/if}

      <Button onclick={handleOTPSubmit} variant="primary" size="default" class="submit-button" rightIcon={ArrowRight}>
        Verify & Create Account
      </Button>

      <button class="back-button" onclick={handleBack}>
        Back to account info
      </button>
    </div>
  {/if}

  <!-- Divider -->
  <div class="divider">
    <span>or continue with</span>
  </div>

  <!-- Social login -->
  <div class="social-login">
    <SocialLoginButton provider="google" onclick={() => console.log('Google login')} />
  </div>

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

  .timer-display,
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

  .timer-display {
    color: #6B7280;
    background: #FAFAFA;
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

  .button-group {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .button-group button {
    flex: 1;
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

  .divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 8px 0;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #F0F0F0;
  }

  .divider span {
    font-size: 13px;
    font-weight: 600;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .social-login {
    display: flex;
    flex-direction: column;
    gap: 12px;
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

    .button-group {
      flex-direction: column;
    }
  }
</style>
