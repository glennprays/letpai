<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { toast } from '$lib/stores/toast';
  import { login } from '$lib/services/auth';
  import { setUser, setToken } from '$lib/stores/auth';
  import { validatePhone, validatePassword } from '$lib/utils/validation';
  import { formatPhoneNumber } from '$lib/utils/format';
</script>

<div style="background: #FFFFFF; border: 1.5px solid #F0F0F0; border-radius: 24px; padding: 40px;">
  <h1
    style="font-size: 28px; font-weight: 800; color: #111827; text-align: center; margin: 0 0 8px; letter-spacing: -0.02em;"
  >
    Login
  </h1>

  <p style="font-size: 15px; color: #6B7280; text-align: center; margin: 0 0 32px;">
    Masuk ke akun Letpai Anda
  </p>

  <form
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
    <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 28px;">
      <div>
        <label
          style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;"
        >
          Nomor WhatsApp
        </label>
        <Input
          type="tel"
          name="whatsapp_number"
          placeholder="62xxxxxxxxxx"
          required
        />
      </div>

      <div>
        <label
          style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;"
        >
          Password
        </label>
        <Input type="password" name="password" placeholder="Masukkan password" required />
      </div>

      <div style="display: flex; align-items: center; justify-content: center;">
        <a
          href="/register"
          style="font-size: 14px; font-weight: 500; color: #FF6B6B; text-decoration: none;"
        >
          Belum punya akun? Daftar
        </a>
      </div>
    </div>

    <Button
      type="submit"
      variant="primary"
      size="default"
      style="width: 100%; font-size: 15px; padding: 13px 28px;"
    >
      Login
    </Button>
  </form>
</div>
