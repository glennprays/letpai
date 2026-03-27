<script lang="ts">
  import { User } from 'lucide-svelte';
  import { user } from '$lib/stores/auth';
</script>

<div class="min-h-screen flex flex-col">
  <main class="flex-1">
    {@render children()}
  </main>
  
  {#if $user}
    <footer class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200">
      <nav class="max-w-md mx-auto px-4">
        <ul class="flex items-center justify-around h-16">
          <li>
            <a 
              href="/" 
              class="flex flex-col items-center gap-1 text-gray-600 hover:text-[#FF6B6B] transition-colors"
            >
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 012-2h-2v-9a2 2 0 00-2z"></path>
              </svg>
              <span class="text-xs">Home</span>
            </a>
          </li>
          
          <li>
            <a 
              href="/sessions" 
              class="flex flex-col items-center gap-1 text-gray-600 hover:text-[#FF6B6B] transition-colors"
            >
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2zM9 3a1 1 0 011 1v1a1 1 0 011 1h6a1 1 0 011-1v-1a1 1 0 01-1h-6a1 1 0 01-1z"></path>
              </svg>
              <span class="text-xs">Sessions</span>
            </a>
          </li>
          
          <li>
            <a 
              href="/contacts" 
              class="flex flex-col items-center gap-1 text-gray-600 hover:text-[#FF6B6B] transition-colors"
            >
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2a4 4 0 004 4h2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a2 2 0 00-2-2h-3.17M15.63 14c4.83 0-8.74-3.85-9.42-8.72a3 3 0 01-4.2-1.2l-.93-.5a.5.5 0 01-.8-.36L14 9.07a3 3 0 01-2.29-3.94l-.4-2.7a3 3 0 01-2.2-2.52l-.2-1a3 3 0 01-4.14-2.26L11 4.8a3 3 0 01-3.33-2.26L6.64 8.8a3 3 0 01-3.33 2.26L5.13 9.2a3 3 0 01-1.67 2.27l-.52.6a3 3 0 01-1.94-1.62l-.4-.2a3 3 0 01-3.33-1.2l-.2-1a3 3 0 01-3.33-1.2zM4 14a1 1 0 011 1v1a1 1 0 011-1h6a1 1 0 011-1v-1a1 1 0 01-1-1h-6a1 1 0 01-1-1z"></path>
              </svg>
              <span class="text-xs">Contacts</span>
            </a>
          </li>
          
          <li>
            <a 
              href="/profile" 
              class="flex flex-col items-center gap-1 text-gray-600 hover:text-[#FF6B6B] transition-colors"
            >
              <User class="h-6 w-6" />
              <span class="text-xs">Profile</span>
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  {/if}
</div>
