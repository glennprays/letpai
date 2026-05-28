<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { formatIDR, formatRelativeTime } from '$lib/utils/format';
  import { Plus, RefreshCw, Inbox, Clock, CheckCircle2, XCircle } from 'lucide-svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let activeFilter = $state<'all' | 'active' | 'completed' | 'cancelled'>('all');
  let isRetrying = $state(false);

  const filteredSessions = $derived.by(() => {
    if (!data.sessions || !Array.isArray(data.sessions)) return [];
    if (activeFilter === 'all') return data.sessions;
    return data.sessions.filter((s) => s.status === activeFilter);
  });

  const filterCounts = $derived.by(() => {
    if (!data.sessions || !Array.isArray(data.sessions)) {
      return { all: 0, active: 0, completed: 0, cancelled: 0 };
    }
    return {
      all: data.sessions.length,
      active: data.sessions.filter((s) => s.status === 'active').length,
      completed: data.sessions.filter((s) => s.status === 'completed').length,
      cancelled: data.sessions.filter((s) => s.status === 'cancelled').length
    };
  });

  function getStatusColor(status: string): string {
    if (status === 'active') return 'text-[#92400E] bg-[#F59E0B]/15';
    if (status === 'completed') return 'text-[#047857] bg-[#10B981]/15';
    return 'text-[#991B1B] bg-[#EF4444]/15';
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
    isRetrying = true;
    try {
      await invalidateAll();
    } finally {
      isRetrying = false;
    }
  }
</script>

<div class="min-h-screen">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <header class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-[#251818] tracking-tight">Sessions</h1>
        <p class="text-sm text-[#584140] mt-1">Manage your bill splitting sessions</p>
      </div>
      <button
        onclick={handleCreateSession}
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] text-white text-sm font-medium rounded-2xl hover:opacity-95 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f7]"
      >
        <Plus class="w-4 h-4" />
        <span class="hidden sm:inline">New Session</span>
      </button>
    </header>

    {#if data.error}
      <!-- Error State -->
      <div class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 bg-[#EF4444]/15 rounded-full flex items-center justify-center mb-4">
          <XCircle class="w-6 h-6 text-[#991B1B]" />
        </div>
        <h2 class="text-lg font-medium text-[#251818] mb-2">Failed to load</h2>
        <p class="text-sm text-[#584140] text-center max-w-sm mb-6">{data.error}</p>
        <button
          onclick={handleRetry}
          disabled={isRetrying}
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#251818] bg-white rounded-2xl shadow-[0_1px_3px_rgba(37,24,24,0.04)] hover:bg-[#fff0ef] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
        >
          <RefreshCw class={isRetrying ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
          Try again
        </button>
      </div>
    {:else}
      <!-- Stats Overview -->
      {#if data.stats}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <!-- Active -->
          <div class="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-[#F59E0B]/15 rounded-2xl flex items-center justify-center">
                <Clock class="w-5 h-5 text-[#92400E]" />
              </div>
              <div class="flex-1">
                <p class="text-sm text-[#584140]">Active</p>
                <p class="text-2xl font-semibold text-[#251818]">{data.stats.active_sessions}</p>
              </div>
            </div>
          </div>

          <!-- Completed -->
          <div class="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-[#10B981]/15 rounded-2xl flex items-center justify-center">
                <CheckCircle2 class="w-5 h-5 text-[#047857]" />
              </div>
              <div class="flex-1">
                <p class="text-sm text-[#584140]">Completed</p>
                <p class="text-2xl font-semibold text-[#251818]">{data.stats.completed_sessions}</p>
              </div>
            </div>
          </div>

          <!-- Pending -->
          <div class="bg-white rounded-3xl p-5 shadow-[0_1px_3px_rgba(37,24,24,0.04)]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-[#EF4444]/15 rounded-2xl flex items-center justify-center">
                <svg class="w-5 h-5 text-[#991B1B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm text-[#584140]">Pending</p>
                <p class="text-2xl font-semibold text-[#251818]">{data.stats.pending_payments}</p>
                {#if data.stats.total_pending > 0}
                  <p class="text-xs text-[#584140]">{formatIDR(data.stats.total_pending)}</p>
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
          class="px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]"
          class:bg-[#251818]={activeFilter === 'all'}
          class:text-white={activeFilter === 'all'}
          class:text-[#584140]={activeFilter !== 'all'}
          class:hover:bg-[#fff0ef]={activeFilter !== 'all'}
        >
          All <span class="ml-1.5 opacity-60">{filterCounts.all}</span>
        </button>
        <button
          onclick={() => activeFilter = 'active'}
          class="px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]"
          class:bg-[#251818]={activeFilter === 'active'}
          class:text-white={activeFilter === 'active'}
          class:text-[#584140]={activeFilter !== 'active'}
          class:hover:bg-[#fff0ef]={activeFilter !== 'active'}
        >
          Active <span class="ml-1.5 opacity-60">{filterCounts.active}</span>
        </button>
        <button
          onclick={() => activeFilter = 'completed'}
          class="px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]"
          class:bg-[#251818]={activeFilter === 'completed'}
          class:text-white={activeFilter === 'completed'}
          class:text-[#584140]={activeFilter !== 'completed'}
          class:hover:bg-[#fff0ef]={activeFilter !== 'completed'}
        >
          Completed <span class="ml-1.5 opacity-60">{filterCounts.completed}</span>
        </button>
        <button
          onclick={() => activeFilter = 'cancelled'}
          class="px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]"
          class:bg-[#251818]={activeFilter === 'cancelled'}
          class:text-white={activeFilter === 'cancelled'}
          class:text-[#584140]={activeFilter !== 'cancelled'}
          class:hover:bg-[#fff0ef]={activeFilter !== 'cancelled'}
        >
          Cancelled <span class="ml-1.5 opacity-60">{filterCounts.cancelled}</span>
        </button>
      </div>

      <!-- Sessions List -->
      {#if filteredSessions.length === 0}
        <!-- Empty State -->
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-14 h-14 bg-[#fff0ef] rounded-full flex items-center justify-center mb-4">
            <Inbox class="w-7 h-7 text-[#584140]" />
          </div>
          <h2 class="text-lg font-medium text-[#251818] mb-1">No sessions yet</h2>
          <p class="text-sm text-[#584140] mb-6">Create your first session to start splitting bills</p>
          <button
            onclick={handleCreateSession}
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] text-white text-sm font-medium rounded-2xl hover:opacity-95 active:scale-[0.98] transition-all duration-150"
          >
            <Plus class="w-4 h-4" />
            Create session
          </button>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each filteredSessions as session (session.session_id)}
            {@const StatusIcon = getStatusIcon(session.status)}
            <div
              role="button"
              tabindex="0"
              onclick={() => handleCardClick(session.session_id)}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(session.session_id); } }}
              class="bg-white rounded-2xl p-5 cursor-pointer hover:bg-[#fff0ef] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f7]"
            >
              <!-- Status & Time -->
              <div class="flex items-center justify-between mb-3">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full {getStatusColor(session.status)}">
                  <StatusIcon class="w-3.5 h-3.5" />
                  {session.status}
                </span>
                <span class="text-xs text-[#584140]">{formatRelativeTime(session.created_at)}</span>
              </div>

              <!-- Name -->
              <h3 class="text-base font-semibold text-[#251818] mb-1 line-clamp-1">
                {session.title}
              </h3>

              <!-- Description -->
              {#if session.description}
                <p class="text-sm text-[#584140] mb-4 line-clamp-2">
                  {session.description}
                </p>
              {/if}

              <!-- Amount -->
              <div class="text-xl font-semibold text-[#251818] mb-4">
                {formatIDR(session.total_amount)}
              </div>

              <!-- Live Split tracker: gradient (tertiary purple → secondary teal)
                   marks the paid portion; the remainder is a softer surface tier
                   so the split between paid and pending reads clearly. -->
              <div class="space-y-2">
                <div class="h-2 bg-[#f5dddb] rounded-full overflow-hidden relative">
                  <div
                    class="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#842bd2] to-[#14B8A6]"
                    style="width: {getProgressWidth(session)}%"
                  ></div>
                </div>
                <div class="flex items-center justify-between text-xs text-[#584140]">
                  <span>{session.paid_count} of {session.participant_count} paid</span>
                  <span class="font-medium text-[#251818]">{getProgressWidth(session)}%</span>
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
