<script lang="ts">
  import { Card } from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { toast } from '$lib/stores/toast';
  import { API_ENDPOINTS } from '$lib/constants/api';
  import { formatCurrency } from '$lib/utils/format';
</script>

<div class="px-4 py-8">
  <h1 class="text-3xl font-bold text-gray-900 mb-6">
    Dashboard
  </h1>

  <!-- Quick Stats -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    <!-- Owed Card -->
    <Card class="text-center">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-gray-600">
          Dibayar ke saya
        </h2>
        <div class="text-3xl font-bold text-[#10B981]">
          Rp 500.000
        </div>
        <p class="text-sm text-gray-500">
          dari 2 sessions
        </p>
      </div>
    </Card>

    <!-- Owe Card -->
    <Card class="text-center">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-gray-600">
          Saya harus bayar
        </h2>
        <div class="text-3xl font-bold text-[#EF4444]">
          Rp 250.000
        </div>
        <p class="text-sm text-gray-500">
          ke 1 session
        </p>
      </div>
    </Card>
  </div>

  <!-- Filter Tabs -->
  <div class="flex gap-2 mb-4">
    <button
      class="px-4 py-2 border-2 border-transparent bg-[#FF6B6B] text-white rounded-sm font-medium"
      onclick={() => toast.success('Filter: Active')}
    >
      Active
    </button>
    <button
      class="px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-sm font-medium hover:border-[#FF6B6B] hover:text-[#FF6B6B]"
      onclick={() => toast.success('Filter: Completed')}
    >
      Completed
    </button>
    <button
      class="px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-sm font-medium hover:border-[#FF6B6B] hover:text-[#FF6B6B]"
      onclick={() => toast.success('Filter: Cancelled')}
    >
      Cancelled
    </button>
  </div>

  <!-- Session List -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
    <!-- Session 1 -->
    <Card>
      <div class="flex justify-between items-start mb-3">
        <h3 class="text-lg font-semibold text-gray-900">
          Makan Siang
        </h3>
        <Badge variant="active">Active</Badge>
      </div>
      
      <p class="text-gray-600 mb-3">
        Makan bareng teman kantor
      </p>
      
      <div class="text-2xl font-bold text-[#FF6B6B] mb-4">
        Rp 500.000
      </div>

      <div class="mb-3">
        <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div class="bg-[#10B981] h-2 rounded-full" style="width: 50%"></div>
        </div>
        <p class="text-sm text-gray-600">
          2/4 paid (50%)
        </p>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex -space-x-2">
          <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
        <div class="text-sm text-gray-500">
          Created 2 hari yang lalu
        </div>
      </div>
    </Card>

    <!-- Session 2 -->
    <Card>
      <div class="flex justify-between items-start mb-3">
        <h3 class="text-lg font-semibold text-gray-900">
          Liburan Bali
        </h3>
        <Badge variant="paid">Completed</Badge>
      </div>
      
      <p class="text-gray-600 mb-3">
        Liburan bareng keluarga
      </p>
      
      <div class="text-2xl font-bold text-gray-400 mb-4">
        Rp 1.500.000
      </div>

      <div class="mb-3">
        <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div class="bg-[#10B981] h-2 rounded-full" style="width: 100%"></div>
        </div>
        <p class="text-sm text-gray-600">
          4/4 paid (100%)
        </p>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex -space-x-2">
          <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
        <div class="text-sm text-gray-500">
          Created 5 hari yang lalu
        </div>
      </div>
    </Card>

    <!-- New Session Card -->
    <Card class="flex items-center justify-center py-12 border-dashed border-gray-400 hover:border-[#FF6B6B] cursor-pointer">
      <div class="text-center">
        <div class="h-12 w-12 bg-[#FF6B6B] rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path d="M12 5v14a2 2 0 002-2h0a2 2 0 00-2 2V5a2 2 0 002 2h2z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Buat Session Baru
        </h3>
        <p class="text-sm text-gray-600">
          Mulai split bill dengan teman
        </p>
      </div>
    </Card>
  </div>
</div>
