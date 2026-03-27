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

  <main class="flex-1">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Hero Section with Diagonal Split -->
      <section class="py-12 md:py-16 relative overflow-hidden">
        <!-- Diagonal split background -->
        <div class="absolute inset-0 z-0">
          <!-- Coral red top-left -->
          <div class="absolute top-0 left-0 w-1/2 h-full bg-[#FF6B6B]" style="clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%)"></div>
          <!-- White bottom-right -->
          <div class="absolute bottom-0 right-0 w-1/2 h-full bg-white" style="clip-path: polygon(0 100%, 100% 100%, 100% 0, 0 0)"></div>
        </div>

        <!-- Content with floating circles -->
        <div class="relative z-10 max-w-6xl mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <!-- Left Column: Text Content -->
            <div class="space-y-6">
              <h2 class="text-6xl font-bold text-gray-900 mb-4" style="font-size: 64px; line-height: 1.1;">
                Split bills effortlessly<br />with friends
              </h2>
              
              <p class="text-lg text-gray-600 mb-8">
                WhatsApp notifications included. No app needed for participants.
              </p>
              
              <Button
                variant="primary"
                size="lg"
                onclick={handleGetStarted}
                class="w-full max-w-xs mx-auto shadow-bold"
              >
                Get Started
              </Button>

              <p class="text-sm text-gray-500 mt-4">
                Ready to split your first bill?
              </p>
            </div>

            <!-- Right Column: Visual Element -->
            <div class="relative">
              <!-- Floating circles decoration -->
              <div class="absolute top-4 right-8 w-32 h-32 bg-[#14B8A6] rounded-full opacity-20"></div>
              <div class="absolute bottom-12 right-4 w-20 h-20 bg-[#14B8A6] rounded-full opacity-30"></div>
              <div class="absolute top-1/2 right-1/4 w-16 h-16 bg-[#14B8A6] rounded-full opacity-40"></div>
              
              <!-- Phone mockup or abstract graphic -->
              <div class="relative mt-12">
                <div class="w-full max-w-sm mx-auto border-4 border-gray-300 rounded-2xl p-8 bg-white">
                  <div class="space-y-3">
                    <div class="h-2 w-8 bg-gray-200 rounded-full mx-auto"></div>
                    <div class="h-2 w-12 bg-gray-200 rounded-full mx-auto"></div>
                    <div class="h-2 w-16 bg-gray-200 rounded-full mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section: Bento Grid -->
      <section class="py-16 bg-gray-50">
        <div class="max-w-6xl mx-auto px-4">
          <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Letpai?
          </h3>

          <!-- Bento Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Feature 1: Extra Large Card -->
            <div class="md:col-span-2 row-span-2 bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-[#FF6B6B] transition-all duration-150">
              <div class="flex items-start gap-4 mb-4">
                <div class="bg-[#14B8A6] p-3 rounded-full">
                  <MessageCircle class="h-8 w-8 text-white" />
                </div>
                <div class="flex-1">
                  <h4 class="text-xl font-bold text-gray-900 mb-2">
                    WhatsApp Integration
                  </h4>
                  <p class="text-gray-600">
                    Participants receive instant notifications with payment links. No app installation needed.
                  </p>
                </div>
              </div>
              
              <div class="border-t-2 border-gray-200 pt-4">
                <p class="text-sm text-gray-500">
                  Automatic messages · Payment tracking · One-tap access
                </p>
              </div>
            </div>

            <!-- Feature 2: Small Card -->
            <div class="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#FF6B6B] transition-all duration-150">
              <div class="flex items-start gap-3 mb-3">
                <div class="bg-[#FF6B6B] p-2.5 rounded-full">
                  <Smartphone class="h-6 w-6 text-white" />
                </div>
                <div class="flex-1">
                  <h4 class="text-lg font-bold text-gray-900 mb-1">
                    Create in Seconds
                  </h4>
                  <p class="text-sm text-gray-600">
                    Quick setup, add bills, done.
                  </p>
                </div>
              </div>
            </div>

            <!-- Feature 3: Small Card -->
            <div class="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#FF6B6B] transition-all duration-150">
              <div class="flex items-start gap-3 mb-3">
                <div class="bg-[#FF6B6B] p-2.5 rounded-full">
                  <Camera class="h-6 w-6 text-white" />
                </div>
                <div class="flex-1">
                  <h4 class="text-lg font-bold text-gray-900 mb-1">
                    Proof Upload
                  </h4>
                  <p class="text-sm text-gray-600">
                    Easy photo capture and submission.
                  </p>
                </div>
              </div>
            </div>

            <!-- Feature 4: Small Card -->
            <div class="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#FF6B6B] transition-all duration-150">
              <div class="flex items-start gap-3 mb-3">
                <div class="bg-[#FF6B6B] p-2.5 rounded-full">
                  <CheckCircle class="h-6 w-6 text-white" />
                </div>
                <div class="flex-1">
                  <h4 class="text-lg font-bold text-gray-900 mb-1">
                    No App Needed
                  </h4>
                  <p class="text-sm text-gray-600">
                    Everyone can pay via link.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="py-16 bg-white">
        <div class="max-w-6xl mx-auto px-4">
          <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h3>

          <!-- 3 Horizontal Cards with Arrows -->
          <div class="flex flex-col md:flex-row gap-8 items-center justify-center">
            <!-- Step 1 -->
            <div class="flex-1 max-w-sm">
              <div class="bg-white border-2 border-gray-200 rounded-lg p-6 text-center relative">
                <div class="absolute -top-3 -left-3 w-8 h-8 bg-[#FF6B6B] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  01
                </div>
                <div class="mb-4">
                  <div class="bg-[#FF6B6B] p-3 rounded-full w-12 h-12 mx-auto mb-3">
                    <Smartphone class="h-6 w-6 text-white" />
                  </div>
                </div>
                <h4 class="text-lg font-bold text-gray-900 mb-2">
                  Create Session
                </h4>
                <p class="text-sm text-gray-600">
                  Add participants and bills
                </p>
              </div>
            </div>

            <!-- Arrow -->
            <div class="hidden md:flex items-center justify-center">
              <div class="bg-gray-200 rounded-full p-1">
                <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path d="M9 5l7-7 7v11a2 2 0 012-2h-2v-9a2 2 0 00-2z"></path>
                </svg>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="flex-1 max-w-sm">
              <div class="bg-white border-2 border-gray-200 rounded-lg p-6 text-center relative">
                <div class="absolute -top-3 -left-3 w-8 h-8 bg-[#14B8A6] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  02
                </div>
                <div class="mb-4">
                  <div class="bg-[#14B8A6] p-3 rounded-full w-12 h-12 mx-auto mb-3">
                    <MessageCircle class="h-6 w-6 text-white" />
                  </div>
                </div>
                <h4 class="text-lg font-bold text-gray-900 mb-2">
                  Send via WhatsApp
                </h4>
                <p class="text-sm text-gray-600">
                  One-click notifications
                </p>
              </div>
            </div>

            <!-- Arrow -->
            <div class="hidden md:flex items-center justify-center">
              <div class="bg-gray-200 rounded-full p-1">
                <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path d="M9 5l7-7 7v11a2 2 0 012-2h-2v-9a2 2 0 00-2z"></path>
                </svg>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="flex-1 max-w-sm">
              <div class="bg-white border-2 border-gray-200 rounded-lg p-6 text-center relative">
                <div class="absolute -top-3 -left-3 w-8 h-8 bg-[#14B8A6] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  03
                </div>
                <div class="mb-4">
                  <div class="bg-[#14B8A6] p-3 rounded-full w-12 h-12 mx-auto mb-3">
                    <Camera class="h-6 w-6 text-white" />
                  </div>
                </div>
                <h4 class="text-lg font-bold text-gray-900 mb-2">
                  Track Payments
                </h4>
                <p class="text-sm text-gray-600">
                  Real-time status updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="px-4 py-8 bg-gray-900 text-white">
        <div class="max-w-6xl mx-auto">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <!-- Logo and Tagline -->
            <div>
              <h2 class="text-2xl font-bold mb-1">
                Letpai
              </h2>
              <p class="text-gray-400 text-sm">
                Split bills, not friendships
              </p>
            </div>

            <!-- Links -->
            <div class="flex items-center gap-6 text-sm">
              <a href="/about" class="text-gray-300 hover:text-white transition-colors">
                About
              </a>
              <a href="/privacy" class="text-gray-300 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="/terms" class="text-gray-300 hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>

          <!-- Copyright -->
          <div class="border-t-2 border-gray-700 mt-6 pt-4 text-center text-xs text-gray-400">
            <p>© 2026 Letpai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  </main>
</div>
