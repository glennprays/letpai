<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { toast } from '$lib/stores/toast';
  import { register, verifyOTP } from '$lib/services/auth';
  import { validatePhone, validatePassword, validateOTP } from '$lib/utils/validation';
  import { formatPhoneNumber } from '$lib/utils/format';
</script>

<div style="background: #FFFFFF; border: 1.5px solid #F0F0F0; border-radius: 24px; padding: 40px;">
  <h1
    style="font-size: 28px; font-weight: 800; color: #111827; text-align: center; margin: 0 0 8px; letter-spacing: -0.02em;"
  >
    Daftar
  </h1>

  <p style="font-size: 15px; color: #6B7280; text-align: center; margin: 0 0 32px;">
    Buat akun baru untuk mulai split bill
  </p>

  <!-- Step 1: Register -->
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
        toast.error(passwordValidation.error || 'Password minimal 8 karakter');
        return;
      }

      try {
        const response = await register({ whatsapp_number, password });

        if (response.success) {
          toast.success('OTP telah dikirim ke WhatsApp Anda!');
        } else {
          toast.error('Pendaftaran gagal. Silakan coba lagi.');
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
        <Input
          type="password"
          name="password"
          placeholder="Minimal 8 karakter"
          required
        />
      </div>
    </div>

    <Button
      type="submit"
      variant="primary"
      size="default"
      style="width: 100%; font-size: 15px; padding: 13px 28px;"
    >
      Daftar
    </Button>
  </form>
</div>
