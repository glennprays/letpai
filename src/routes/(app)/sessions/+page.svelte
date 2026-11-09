<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';

  type SessionStatus = 'pending' | 'submitted' | 'paid' | 'rejected' | 'active' | 'completed' | 'cancelled';
  import Button from '$lib/components/ui/Button.svelte';
  import { goto } from '$app/navigation';
  import { get } from '$lib/services/api';
  import { API_ENDPOINTS } from '$lib/constants/api';
  import { formatCurrency, formatRelativeTime } from '$lib/utils/format';
  import type { SessionsResponse } from '$lib/types/api';

  type StatusFilter = 'active' | 'completed' | 'cancelled';

  let status = $state<StatusFilter>('active');

  const sessionsQuery = createQuery(() => ({
    queryKey: ['sessions', status],
    queryFn: () => get(`${API_ENDPOINTS.SESSIONS}?status=${status}`) as Promise<SessionsResponse>,
  }));

  const tabs: StatusFilter[] = ['active', 'completed', 'cancelled'];

  const sessions = $derived.by(() => {
    const d = sessionsQuery.data?.data;
    if (Array.isArray(d)) return d;
    return d?.sessions ?? sessionsQuery.data?.sessions ?? [];
  });
</script>

<div class="px-4 py-8">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Sessions</h1>
    <Button size="sm" onclick={() => goto('/sessions/new')}>Buat Session</Button>
  </div>

  <!-- Filter Tabs -->
  <div class="flex gap-2 mb-4">
    {#each tabs as tab}
      <button
        class="px-4 py-2 rounded-sm text-sm font-medium transition-colors
          {status === tab ? 'bg-[#FF6B6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
        onclick={() => (status = tab)}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    {/each}
  </div>

  {#if sessionsQuery.isLoading}
    <p class="text-gray-500">Memuat session…</p>
  {:else if sessionsQuery.error}
    <p class="text-red-500">Gagal memuat session: {sessionsQuery.error.message}</p>
  {:else if sessions.length > 0}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each sessions as session (session.session_id)}
        <Card onclick={() => goto(`/sessions/${session.session_id}`)}>
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-lg font-semibold text-gray-900">{session.title}</h3>
            <Badge variant={session.status as SessionStatus}>{session.status}</Badge>
          </div>
          {#if session.description}
            <p class="text-sm text-gray-600 mb-2">{session.description}</p>
          {/if}
          <div class="flex items-center justify-between text-sm">
            <span class="font-bold text-gray-900">{formatCurrency(session.total_amount)}</span>
            <span class="text-gray-500">{session.paid_count}/{session.participant_count} bayar</span>
          </div>
          <p class="text-xs text-gray-400 mt-2">{formatRelativeTime(session.created_at)}</p>
        </Card>
      {/each}
    </div>
  {:else}
    <p class="text-gray-500">Belum ada session dengan status ini.</p>
  {/if}
</div>
