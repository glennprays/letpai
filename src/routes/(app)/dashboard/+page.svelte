<script lang="ts">
  import { goto } from '$app/navigation';
  import { formatIDR, formatRelativeTime } from '$lib/utils/format';
  import { Plus, RefreshCw, Inbox, Clock, CheckCircle2, XCircle } from 'lucide-svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let activeFilter = $state<'all' | 'active' | 'completed' | 'cancelled'>('all');
  let isLoading = $state(false);

  let filteredSessions = $derived(() => {
    if (!data.sessions || !Array.isArray(data.sessions)) return [];
    if (activeFilter === 'all') return data.sessions;
    return data.sessions.filter((s) => s.status === activeFilter);
  });

  function getStatusColor(status: string): string {
    if (status === 'active') return 'text-amber-600 bg-amber-50';
    if (status === 'completed') return 'text-emerald-600 bg-emerald-50';
    return 'text-red-600 bg-red-50';
  }

  function getStatusIcon(status: string) {
    if (status === 'active') return Clock;
    if (status === 'completed') return CheckCircle2;
    return XCircle;
  }

  function getProgressWidth(session: { paid_count: number; participant_count: number }): number {
    if (session.participant_count === 0) return 0;
    return Math.round((session.paid_count / session.participant_count) * 100);
  }

  function handleCardClick(sessionId: string) {
    goto(`/sessions/${sessionId}`);
  }

  function handleCreateSession() {
    goto('/sessions/new');
  }

  async function handleRetry() {
    isLoading = true;
    window.location.reload();
  }

  let filterCounts = $derived(() => {
    if (!data.sessions || !Array.isArray(data.sessions)) return { all: 0, active: 0, completed: 0, cancelled: 0 };
    return {
      all: data.sessions.length,
      active: data.sessions.filter((s) => s.status === 'active').length,
      completed: data.sessions.filter((s) => s.status === 'completed').length,
      cancelled: data.sessions.filter((s) => s.status === 'cancelled').length
    };
  });
</script>

<div class="min-h-screen bg-gray-50/50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <header class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 tracking-tight">Sessions</h1>
        <p class="text-sm text-gray-500 mt-1">Manage your bill splitting sessions</p>
      </div>
      <button
        onclick={handleCreateSession}
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#FF5252] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2"
      >
        <Plus class="w-4 h-4" />
        <span class="hidden sm:inline">New Session</span>
      </button>
    </header>

    {#if data.error}
      <!-- Error State -->
      <div class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <XCircle class="w-6 h-6 text-red-500" />
        </div>
        <h2 class="text-lg font-medium text-gray-900 mb-2">Failed to load</h2>
        <p class="text-sm text-gray-500 text-center max-w-sm mb-6">{data.error}</p>
        <button
          onclick={handleRetry}
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {#if isLoading}
            <RefreshCw class="w-4 h-4 animate-spin" />
          {:else}
            <RefreshCw class="w-4 h-4" />
          {/if}
          Try again
        </button>
      </div>
    {:else}
      <!-- Stats Overview -->
      {#if data.stats}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <!-- Active -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock class="w-5 h-5 text-amber-600" />
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500">Active</p>
                <p class="text-2xl font-semibold text-gray-900">{data.stats.active_sessions}</p>
              </div>
            </div>
          </div>

          <!-- Completed -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 class="w-5 h-5 text-emerald-600" />
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500">Completed</p>
                <p class="text-2xl font-semibold text-gray-900">{data.stats.completed_sessions}</p>
              </div>
            </div>
          </div>

          <!-- Pending -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-500">Pending</p>
                <p class="text-2xl font-semibold text-gray-900">{data.stats.pending_payments}</p>
                {#if data.stats.total_pending > 0}
                  <p class="text-xs text-gray-400">{formatIDR(data.stats.total_pending)}</p>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Filter Tabs -->
      <div class="flex items-center gap-1 mb-6 overflow-x-auto">
        <button
          onclick={() => activeFilter = 'all'}
          class="px-4 py-3 text-sm font-medium rounded-lg transition-colors min-h-[44px]"
          class:bg-gray-900={activeFilter === 'all'}
          class:text-white={activeFilter === 'all'}
          class:text-gray-600={activeFilter !== 'all'}
          class:hover:bg-gray-100={activeFilter !== 'all'}
        >
          All <span class="ml-1.5 text-gray-400">{filterCounts().all}</span>
        </button>
        <button
          onclick={() => activeFilter = 'active'}
          class="px-4 py-3 text-sm font-medium rounded-lg transition-colors min-h-[44px]"
          class:bg-gray-900={activeFilter === 'active'}
          class:text-white={activeFilter === 'active'}
          class:text-gray-600={activeFilter !== 'active'}
          class:hover:bg-gray-100={activeFilter !== 'active'}
        >
          Active <span class="ml-1.5 text-gray-400">{filterCounts().active}</span>
        </button>
        <button
          onclick={() => activeFilter = 'completed'}
          class="px-4 py-3 text-sm font-medium rounded-lg transition-colors min-h-[44px]"
          class:bg-gray-900={activeFilter === 'completed'}
          class:text-white={activeFilter === 'completed'}
          class:text-gray-600={activeFilter !== 'completed'}
          class:hover:bg-gray-100={activeFilter !== 'completed'}
        >
          Completed <span class="ml-1.5 text-gray-400">{filterCounts().completed}</span>
        </button>
        <button
          onclick={() => activeFilter = 'cancelled'}
          class="px-4 py-3 text-sm font-medium rounded-lg transition-colors min-h-[44px]"
          class:bg-gray-900={activeFilter === 'cancelled'}
          class:text-white={activeFilter === 'cancelled'}
          class:text-gray-600={activeFilter !== 'cancelled'}
          class:hover:bg-gray-100={activeFilter !== 'cancelled'}
        >
          Cancelled <span class="ml-1.5 text-gray-400">{filterCounts().cancelled}</span>
        </button>
      </div>

      <!-- Sessions List -->
      {#if filteredSessions().length === 0}
        <!-- Empty State -->
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Inbox class="w-7 h-7 text-gray-400" />
          </div>
          <h2 class="text-lg font-medium text-gray-900 mb-1">No sessions yet</h2>
          <p class="text-sm text-gray-500 mb-6">Create your first session to start splitting bills</p>
          <button
            onclick={handleCreateSession}
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B6B] text-white text-sm font-medium rounded-lg hover:bg-[#FF5252] transition-colors"
          >
            <Plus class="w-4 h-4" />
            Create session
          </button>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each filteredSessions() as session (session.session_id)}
            <div
              onclick={() => handleCardClick(session.session_id)}
              class="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-[#FF6B6B] hover:shadow-sm transition-all duration-200"
            >
              <!-- Status & Time -->
              <div class="flex items-center justify-between mb-3">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md {getStatusColor(session.status)}">
                  <svelte:component this={getStatusIcon(session.status)} class="w-3.5 h-3.5" />
                  {session.status}
                </span>
                <span class="text-xs text-gray-400">{formatRelativeTime(session.created_at)}</span>
              </div>

              <!-- Name -->
              <h3 class="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                {session.session_name}
              </h3>

              <!-- Description -->
              {#if session.session_description}
                <p class="text-sm text-gray-500 mb-4 line-clamp-2">
                  {session.session_description}
                </p>
              {/if}

              <!-- Amount -->
              <div class="text-xl font-semibold text-gray-900 mb-4">
                {formatIDR(session.total_amount)}
              </div>

              <!-- Progress -->
              <div class="space-y-2">
                <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gray-900 rounded-full transition-all duration-300"
                    style="width: {getProgressWidth(session)}%"
                  ></div>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>{session.paid_count} of {session.participant_count} paid</span>
                  <span>{getProgressWidth(session)}%</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
