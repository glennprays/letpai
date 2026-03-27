<script lang="ts">
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import { Smartphone, MessageCircle, Camera, CheckCircle } from 'lucide-svelte';
  import { initAuth } from '$lib/stores/auth';
  
  // Check auth status on load
  $effect(() => {
    if ($user.isAuthenticated) {
      goto('/dashboard');
    }
  });

  function handleGetStarted() {
    goto('/login');
  }
</script>

<div class="min-h-screen bg-white flex flex-col">
  <header class="px-4 py-6">
    <div class="max-w-md mx-auto">
      <h1 class="text-4xl font-bold text-gray-900">
        Letpai
      </h1>
    </div>
  </header>

  <main class="flex-1 px-4">
    <div class="max-w-md mx-auto">
      <!-- Hero Section -->
      <section class="py-12 text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Split bills effortlessly with friends
        </h2>
        
        <p class="text-lg text-gray-600 mb-8">
          WhatsApp notifications included. No app needed for participants.
        </p>
        
        <Button
          variant="primary"
          size="lg"
          onclick={handleGetStarted}
          class="w-full max-w-sm mx-auto"
        >
          Get Started
        </Button>
      </section>

      <!-- Features Grid -->
      <section class="py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Feature 1 -->
          <div class="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#FF6B6B] transition-colors">
            <Smartphone class="h-10 w-10 text-[#FF6B6B]" />
            <h3 class="text-lg font-semibold text-gray-900">
              Create sessions in seconds
            </h3>
          </div>

          <!-- Feature 2 -->
          <div class="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#FF6B6B] transition-colors">
            <MessageCircle class="h-10 w-10 text-[#FF6B6B]" />
            <h3 class="text-lg font-semibold text-gray-900">
              Automatic WhatsApp notifications
            </h3>
          </div>

          <!-- Feature 3 -->
          <div class="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#FF6B6B] transition-colors">
            <Camera class="h-10 w-10 text-[#FF6B6B]" />
            <h3 class="text-lg font-semibold text-gray-900">
              Track payments with proof upload
            </h3>
          </div>

          <!-- Feature 4 -->
          <div class="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#FF6B6B] transition-colors">
            <CheckCircle class="h-10 w-10 text-[#FF6B6B]" />
            <h3 class="text-lg font-semibold text-gray-900">
              Works for everyone (no app needed)
            </h3>
          </div>
        </div>
      </section>
    </div>
  </main>

  <footer class="px-4 py-6 text-center text-gray-500 text-sm">
    <p>© 2026 Letpai. All rights reserved.</p>
  </footer>
</div>
