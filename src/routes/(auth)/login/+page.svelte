<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import SocialLoginButton from '$lib/components/ui/SocialLoginButton.svelte';
  import { toast } from '$lib/stores/toast';
  import { login } from '$lib/services/auth';
  import { setUser, setToken } from '$lib/stores/auth';
  import { validatePhone, validatePassword } from '$lib/utils/validation';
  import { formatPhoneNumber } from '$lib/utils/format';
  import { Shield, Lock, ArrowRight } from 'lucide-svelte';
</script>

<div class="login-container">
  <!-- Header illustration -->
  <div class="login-illustration">
    <div class="icon-circle">
      <Shield size={32} style="color: #FF6B6B;" />
    </div>
  </div>

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

      const formData = new FormData(e.currentTarget);
      const whatsapp_number = formatPhoneNumber(formData.get('whatsapp_number') || '');
      const password = formData.get('password') || '';

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
          setToken(response.token);
          setUser(response.user);
          toast.success('Login berhasil!');
          goto('/dashboard');
        } else {
          toast.error('Login gagal. Silakan coba lagi.');
        }
      } catch (error) {
        toast.error('Terjadi kesalahan. Silakan coba lagi.');
        console.error(error);
      }
    }}
  >
    <div class="form-group animate-in" style="animation-delay: 0.24s;">
      <Input
        type="tel"
        name="whatsapp_number"
        label="Nomor WhatsApp"
        placeholder="62xxxxxxxxxx"
        required
        leftIcon={Lock}
        helperText="We'll send you a WhatsApp notification if needed"
      />
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

  <!-- Divider -->
  <div class="divider animate-in" style="animation-delay: 0.56s;">
    <span>or continue with</span>
  </div>

  <!-- Social login -->
  <div class="social-login animate-in" style="animation-delay: 0.64s;">
    <SocialLoginButton provider="google" onclick={() => console.log('Google login')} />
  </div>

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

  .login-illustration {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }

  .icon-circle {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: linear-gradient(135deg, #FFF5F5, #FFF);
    border: 1.5px solid #FFE5E5;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(255, 107, 107, 0.15);
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

  .submit-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
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
  }
</style>
