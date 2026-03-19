# CLAUDE.md - Letpai Frontend Development

**This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.**

---

## Project Overview

Letpai is a bill splitting application with WhatsApp integration. Frontend built with SvelteKit 2 + Svelte 5 (runes) + Tailwind CSS v4.

### Tech Stack
- **Framework**: SvelteKit 2 (meta-framework for Svelte)
- **UI**: Svelte 5 with runes mode (reactive primitives)
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (Svelte)
- **TypeScript**: Full type safety
- **Package Manager**: pnpm
- **Deployment**: Vercel (adapter-auto)

---

## Development Context

### IMPORTANT: Read Brief Files First

Before starting any task, ALWAYS read these brief files to understand the context:

1. **Design System**: `~/.openclaw/workspace/letpai-design-context.md`
   - Brand colors (coral red, teal blue, purple)
   - Typography (Poppins, Inter, Roboto)
   - Component specifications (buttons, cards, badges, inputs, modals)
   - Responsive breakpoints
   - Spacing system (8px base)
   - Animation & transitions

2. **API Specification**: `~/.openclaw/workspace/letpai-api-context.md`
   - Complete API endpoints with request/response schemas
   - Error handling and rate limiting rules
   - Authentication flows

3. **Features Overview**: `docs/FEATURES.md`
   - MVP features (auth, contacts, sessions, payments, notifications)
   - Core flows and UX requirements
   - Implementation phases

4. **Database Schema**: `~/.openclaw/workspace/letpai-database-schema.md`
   - Understanding data structures for type definitions

### Context7 Integration

**ALWAYS use Context7 MCP server** for library/API documentation:
- SvelteKit docs, Svelte 5 runes
- TanStack Query for Svelte
- Tailwind CSS v4
- Up-to-date code examples

---

## Project Structure

### File-Based Routing (SvelteKit Conventions)

```
src/
├── routes/                  # File-based routing
│   ├── (app)/              # Route group: App layout (authenticated)
│   │   ├── dashboard/      # Dashboard page
│   │   ├── sessions/       # Sessions list/detail
│   │   │   ├── [id]/       # Dynamic route for session detail
│   │   │   └── +page.svelte
│   │   ├── contacts/       # Contact management
│   │   └── +layout.svelte  # App layout (nav, footer)
│   ├── (auth)/             # Route group: Auth layout (public)
│   │   ├── login/
│   │   ├── register/
│   │   └── +layout.svelte  # Auth layout (minimal)
│   ├── payment/            # Public payment page
│   │   └── [token]/        # Dynamic route for payment link
│   ├── +layout.svelte      # Root layout
│   ├── +error.svelte       # Error page
│   └── +page.svelte        # Home/landing page
├── lib/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base components (Button, Input, Card, Badge...)
│   │   ├── forms/         # Form components (LoginForm, SessionForm...)
│   │   └── layouts/       # Layout components (Sidebar, Navbar...)
│   ├── stores/            # Svelte stores (auth, theme, etc.)
│   ├── services/          # API clients, business logic
│   │   ├── api.ts         # API client base
│   │   ├── auth.ts        # Auth service
│   │   └── index.ts       # Service exports
│   ├── types/             # TypeScript types
│   │   ├── api.ts         # API request/response types
│   │   └── models.ts      # Domain models
│   ├── utils/             # Helper functions
│   │   ├── format.ts      # Formatters (currency, date)
│   │   └── validation.ts  # Validators
│   └── constants/         # Design tokens, endpoints
│       ├── colors.ts      # Brand colors
│       └── api.ts         # API endpoints
├── app.html               # HTML template
├── app.css                # Global styles (Tailwind directives)
└── app.d.ts               # Global type declarations
static/                    # Static assets
├── favicon.svg
└── robots.txt
```

### Route Groups

- `(app)/` - Authenticated pages with app shell (sidebar/header)
- `(auth)/` - Public auth pages (login, register)
- `payment/[token]/` - Public payment page (no auth required)

---

## Common Commands

```bash
# Development
pnpm dev              # Start dev server (http://localhost:5173)
pnpm dev -- --open    # Start and open in browser

# Building
pnpm build           # Production build
pnpm preview         # Preview production build locally

# Type Checking
pnpm check           # Run svelte-check (one-time)
pnpm check:watch     # Run svelte-check with watch mode

# Dependency Management
pnpm add <package>   # Add dependency
pnpm add -D <package> # Add dev dependency
```

---

## SvelteKit 2 + Svelte 5 (Runes Mode)

### Runes Syntax (Always Use)

```svelte
<script lang="ts">
  // Props (replaces export let)
  let { data, title } = $props();

  // Reactive state (replaces let:)
  let count = $state(0);
  let items = $state([]);

  // Derived values (replaces $:)
  let doubled = $derived(count * 2);

  // Side effects (replaces onDestroy)
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>

<button onclick={() => count++}>{count}</button>
```

### Load Functions (Data Fetching)

```ts
// +page.ts or +page.server.ts
export async function load({ fetch, depends, params }) {
  // Server load runs on server
  const response = await fetch('/api/sessions');
  const sessions = await response.json();
  return { sessions };
}
```

### Form Actions (Mutations)

```svelte
<!-- +page.svelte -->
<form method="POST" action="/sessions">
  <input name="name" />
  <button type="submit">Create</button>
</form>
```

```ts
// +page.server.ts
export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name');
    // Process form...
  }
};
```

---

## State Management

### Svelte Stores (Global State)

```ts
// src/lib/stores/auth.ts
import { writable } from 'svelte/store';

interface AuthState {
  token: string | null;
  user: User | null;
}

export const auth = writable<AuthState>({
  token: null,
  user: null
});
```

### TanStack Query (Server State)

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  const { data, isLoading, error } = createQuery({
    queryKey: ['sessions'],
    queryFn: () => fetch('/api/sessions').then(r => r.json())
  });
</script>

{#if isLoading}
  <p>Loading...</p>
{:else if error}
  <p>Error: {error.message}</p>
{:else}
  {#each data.sessions as session}
    <SessionCard {session} />
  {/each}
{/if}
```

---

## Styling (Tailwind CSS v4)

### Design Tokens

Use design tokens from design system:

```ts
// src/lib/constants/colors.ts
export const colors = {
  primary: {
    DEFAULT: '#FF6B6B',    // Coral red
    hover: '#EE5A5A'
  },
  secondary: {
    DEFAULT: '#14B8A6',    // Teal blue
    hover: '#10A392'
  },
  // ... other colors
};
```

### Common Tailwind Patterns

```svelte
<!-- Primary Button -->
<button class="bg-[#FF6B6B] hover:bg-[#EE5A5A] text-white rounded-lg px-6 py-3">
  Create Session
</button>

<!-- Card -->
<div class="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
  <SessionCard />
</div>

<!-- Status Badge -->
<span class="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
  Paid
</span>
```

### Responsive (Mobile-First)

```svelte
<!-- Mobile: flex-col, Desktop: flex-row -->
<div class="flex flex-col md:flex-row gap-4">
  <!-- content -->
</div>
```

---

## API Integration

### API Client Setup

```ts
// src/lib/services/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function get(endpoint: string) {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}

export async function post(endpoint: string, data: unknown) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}
```

### Authentication

```ts
// Include JWT token in requests
const token = localStorage.getItem('token');
const response = await fetch('/api/sessions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Component Patterns

### Base Component (Button Example)

```svelte
<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts" generics="T extends React.ComponentType">
  import { cn } from '$lib/utils';

  let {
    variant = 'primary',
    size = 'md',
    class: className,
    children,
    ...props
  } = $props<T>();

  const variants = {
    primary: 'bg-[#FF6B6B] hover:bg-[#EE5A5A] text-white',
    secondary: 'border-2 border-[#14B8A6] text-[#14B8A6]',
    tertiary: 'bg-gray-200 text-gray-700'
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-6',
    lg: 'h-12 px-8 text-lg'
  };
</script>

<button
  class={cn('rounded-lg font-medium transition', variants[variant], sizes[size], className)}
  {...props}
>
  {@render children()}
</button>
```

### Page with Data Fetching

```svelte
<!-- src/routes/(app)/dashboard/+page.svelte -->
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import SessionCard from '$lib/components/ui/SessionCard.svelte';

  const { data, isLoading, error, refetch } = createQuery({
    queryKey: ['sessions'],
    queryFn: () => fetch('/api/sessions').then(r => r.json())
  });
</script>

<div class="container mx-auto p-4">
  <h1 class="text-3xl font-bold mb-6">My Sessions</h1>

  {#if isLoading}
    <p>Loading sessions...</p>
  {:else if error}
    <p class="text-red-500">Error loading sessions</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each data?.sessions || [] as session}
        <SessionCard {session} />
      {/each}
    </div>
  {/if}
</div>
```

---

## TypeScript Types

### API Types

```ts
// src/lib/types/api.ts
export interface Session {
  session_id: string;
  host_id: string;
  session_name: string;
  session_description?: string;
  created_at: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface CreateSessionRequest {
  session_name: string;
  session_description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

---

## Common Patterns

### Navigation

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  function navigateToSession(id: string) {
    goto(`/sessions/${id}`);
  }
</script>
```

### Error Handling

```svelte
<script lang="ts">
  import { toast } from '$lib/stores/toast';

  async function handleSubmit() {
    try {
      await createSession(data);
      toast.success('Session created!');
    } catch (error) {
      toast.error(error.message);
    }
  }
</script>
```

### Form Validation

```svelte
<script lang="ts">
  let name = $state('');
  let errors = $state({ name: '' });

  function validate() {
    errors.name = name.trim() ? '' : 'Name is required';
    return !errors.name;
  }
</script>

<input
  type="text"
  bind:value={name}
  class={errors.name ? 'border-red-500' : 'border-gray-300'}
/>
{#if errors.name}
  <p class="text-red-500 text-sm">{errors.name}</p>
{/if}
```

---

## Important Notes

- **ALWAYS** use runes syntax (`$props`, `$state`, `$derived`)
- **FOLLOW** design system from `letpai-design-context.md`
- **MOBILE-FIRST** responsive design
- **REFERENCE** API spec before implementing endpoints
- **USE** TanStack Query for server state, Svelte stores for global state
- **TYPE** all components and API responses
- **TEST** on mobile viewport (375px minimum)

---

## Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:3000  # Backend API URL
```

---

## Implementation Phases

For detailed implementation phases, see backend dev guide at:
`~/.openclaw/workspace/letpai-backend-dev-guide.md`

Frontend implementation aligns with backend phases:

1. **Phase 1**: Auth pages (login, register, OTP)
2. **Phase 2**: Dashboard + Session management
3. **Phase 3**: Contact management
4. **Phase 4**: Bill splitting UI
5. **Phase 5**: Payment page + Proof upload
6. **Phase 6**: Notifications + Polish
