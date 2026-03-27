<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { toast } from '$lib/stores/toast';
  import { register, verifyOTP } from '$lib/services/auth';
  import { validatePhone, validatePassword, validateOTP } from '$lib/utils/validation';
  import { formatPhoneNumber } from '$lib/utils/format';
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
  <div class="w-full max-w-md">
    <div class="bg-white border-2 border-gray-200 rounded-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2 text-center">
        Daftar
      </h1>
      
      <p class="text-center text-gray-600 mb-8">
        Buat akun baru untuk mulai split bill
      </p>

      <!-- Step 1: Register -->
      <form class="space-y-6" onsubmit={async (e) => {
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
      }}>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
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
            <label class="block text-sm font-medium text-gray-700 mb-2">
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
          class="w-full"
        >
          Daftar
        </Button>
      </form>
    </div>
  </div>
</div>
