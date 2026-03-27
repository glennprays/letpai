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

<div class="flex items-center justify-center min-h-screen bg-gray-50 px-4">
  <div class="w-full max-w-md">
    <div class="bg-white border-2 border-gray-200 rounded-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2 text-center">
        Login
      </h1>
      
      <p class="text-center text-gray-600 mb-8">
        Masuk ke akun Letpai Anda
      </p>

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
              placeholder="Masukkan password"
              required
            />
          </div>

          <div class="flex items-center justify-between">
            <a href="/register" class="text-sm text-[#FF6B6B] hover:underline">
              Belum punya akun? Daftar
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="default"
          class="w-full"
        >
          Login
        </Button>
      </form>
    </div>
  </div>
</div>
