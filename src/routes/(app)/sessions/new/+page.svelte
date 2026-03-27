<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { toast } from '$lib/stores/toast';
  import { validateRequired } from '$lib/utils/validation';

  // Step management
  let currentStep = $state(1);
  const totalSteps = 4;

  // Form state
  let sessionName = $state('');
  let sessionDescription = $state('');
  let currency = $state('IDR');
  
  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  async function handleSubmit() {
    try {
      toast.success('Session berhasil dibuat!');
      goto('/dashboard');
    } catch (error) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
      console.error(error);
    }
  }
</script>

<div class="px-4 py-8">
  <div class="max-w-md mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">
      Buat Session Baru
    </h1>

    <!-- Step Indicator -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-2">
        <div class={currentStep >= 1 ? 'bg-[#FF6B6B] text-white' : 'bg-gray-200 text-gray-600'}>
          1
        </div>
        <div class="w-8 h-0.5 bg-gray-200"></div>
        <div class={currentStep >= 2 ? 'bg-[#FF6B6B] text-white' : 'bg-gray-200 text-gray-600'}>
          2
        </div>
        <div class="w-8 h-0.5 bg-gray-200"></div>
        <div class={currentStep >= 3 ? 'bg-[#FF6B6B] text-white' : 'bg-gray-200 text-gray-600'}>
          3
        </div>
        <div class="w-8 h-0.5 bg-gray-200"></div>
        <div class={currentStep >= 4 ? 'bg-[#FF6B6B] text-white' : 'bg-gray-200 text-gray-600'}>
          4
        </div>
      </div>
      <div class="text-sm text-gray-600">
        Step {currentStep} of {totalSteps}
      </div>
    </div>

    <!-- Step 1: Session Info -->
    {#if currentStep === 1}
      <Card>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nama Session <span class="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Makan Siang"
              value={sessionName}
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              class="w-full border-2 border-gray-300 rounded-sm px-4 py-3 font-medium focus:border-[#FF6B6B] focus:outline-none placeholder:text-gray-400 transition-colors duration-150"
              placeholder="Deskripsi opsional..."
              rows="3"
              bind:value={sessionDescription}
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mata Uang
            </label>
            <select
              class="w-full border-2 border-gray-300 rounded-sm px-4 py-3 font-medium focus:border-[#FF6B6B] focus:outline-none transition-colors duration-150"
              bind:value={currency}
            >
              <option value="IDR">IDR - Rupiah</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>

          <div class="flex justify-between">
            <div class="text-sm text-gray-500">
              <span class="text-red-500">*</span> Wajib diisi
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <Button
            variant="ghost"
            onclick={() => goto('/dashboard')}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onclick={nextStep}
            disabled={!sessionName.trim()}
          >
            Lanjut
          </Button>
        </div>
      </Card>
    {/if}

    <!-- Step 2: Add Participants -->
    {#if currentStep === 2}
      <Card>
        <div class="space-y-4">
          <div class="text-center py-8">
            <svg class="h-16 w-16 mx-auto text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2a4 4 0 004 4h2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Tambah Peserta
            </h3>
            <p class="text-gray-600 mb-6">
              Pilih peserta dari kontak atau tambah manual
            </p>
            
            <div class="space-y-3">
              <Button
                variant="secondary"
                onclick={() => toast.success('Fitur ini segera hadir')}
              >
                Dari Kontak
              </Button>
              <Button
                variant="secondary"
                onclick={() => toast.success('Fitur ini segera hadir')}
              >
                Tambah Manual
              </Button>
            </div>

            <p class="text-sm text-gray-500 text-center">
              {currentStep} peserta dipilih
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <Button
            variant="ghost"
            onclick={previousStep}
          >
            Kembali
          </Button>
          <Button
            variant="primary"
            onclick={nextStep}
            disabled
          >
            Lanjut
          </Button>
        </div>
      </Card>
    {/if}

    <!-- Step 3: Add Bills -->
    {#if currentStep === 3}
      <Card>
        <div class="space-y-4">
          <div class="text-center py-8">
            <svg class="h-16 w-16 mx-auto text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path d="M12 1v22a2 2 0 002-2h0a2 2 0 00-2 2V3a2 2 0 002 2h2z"></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Tambah Bill
            </h3>
            <p class="text-gray-600 mb-6">
              Masukkan item pembayaran
            </p>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nama Item
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Nasi goreng"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah
                </label>
                <Input
                  type="number"
                  placeholder="0"
                />
              </div>

              <Button
                variant="secondary"
                onclick={() => toast.success('Bill ditambahkan')}
              >
                + Tambah Bill Lain
              </Button>
            </div>

            <div class="border-t-2 border-gray-200 pt-4 mt-4">
              <div class="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total:</span>
                <span class="text-[#FF6B6B]">Rp 0</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <Button
            variant="ghost"
            onclick={previousStep}
          >
            Kembali
          </Button>
          <Button
            variant="primary"
            onclick={nextStep}
            disabled
          >
            Lanjut
          </Button>
        </div>
      </Card>
    {/if}

    <!-- Step 4: Review -->
    {#if currentStep === 4}
      <Card>
        <div class="space-y-6">
          <div class="text-center">
            <svg class="h-16 w-16 mx-auto text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 0020-10h-3.64a1 1 0 01-1.94-1.2l-.93-.5a.5.5 0 01-.8-.36L14 9.07a3 3 0 01-2.29-3.94l-.4-2.7a3 3 0 01-2.2-2.52l-.2-1a3 3 0 01-4.14-2.26L11 4.8a3 3 0 01-3.33-2.26L6.64 8.8a3 3 0 01-3.33 2.26L5.13 9.2a3 3 0 01-1.67 2.27l-.52.6a3 3 0 01-1.94-1.62l-.4-.2a3 3 0 01-3.33-1.2l-.2-1a3 3 0 01-3.33-1.2zM4 14a1 1 0 011 1v1a1 1 0 011-1h6a1 1 0 011-1v-1a1 1 0 01-1-1h-6a1 1 0 01-1-1z"></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Review & Kirim Notifikasi
            </h3>
          </div>

          <div class="space-y-4">
            <div class="border-2 border-gray-200 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-2">
                {sessionName || 'Session Tanpa Nama'}
              </h4>
              <p class="text-sm text-gray-600 mb-2">
                {sessionDescription || 'Tidak ada deskripsi'}
              </p>
              
              <div class="flex justify-between py-2 border-t-2 border-gray-200">
                <span class="font-semibold">Total:</span>
                <span class="text-2xl font-bold text-[#FF6B6B]">Rp 0</span>
              </div>
            </div>

            <div class="border-2 border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-gray-900">Mata Uang:</span>
                <span class="text-gray-600">{currency}</span>
              </div>
              
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-gray-900">Peserta:</span>
                <span class="text-gray-600">0 orang</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="font-semibold text-gray-900">Bill:</span>
                <span class="text-gray-600">0 item</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <Button
            variant="ghost"
            onclick={previousStep}
          >
            Edit
          </Button>
          <Button
            variant="primary"
            onclick={handleSubmit}
          >
            Kirim Notifikasi
          </Button>
        </div>
      </Card>
    {/if}
  </div>
</div>
