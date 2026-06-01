# AGENTS.md - Letpai Frontend Development

**This file provides guidance to AI agents when working with code in this repository.**

---

## Project Overview

Letpai is a bill splitting application with WhatsApp integration. Frontend built with SvelteKit 2 + Svelte 5 (runes) + Tailwind CSS v4, targeting youth (18-30) in Indonesia.

### Design Philosophy: The Social Ledger

Most financial apps feel like spreadsheets — cold, rigid, utilitarian. Letpai treats bill splitting as a social event, not a transaction. The aesthetic is **high-end editorial**: intentional asymmetry, tonal depth, generous whitespace, and a warm Coral/Teal/Purple palette layered over a soft brownish-cream canvas.

**Core Principles:**
- ✅ **Tonal layering** — boundaries come from background-color shifts between surface tiers, not from gray lines
- ✅ **Editorial typography** — Plus Jakarta Sans, large display sizes for monetary values (money should feel significant)
- ✅ **Generous radii** — `rounded-2xl`/`rounded-3xl` (24–32px) on cards, `rounded-2xl` on buttons, `rounded-full` on pills
- ✅ **Soft ambient depth** — tinted, low-opacity shadows for floating elements only; tonal layering for everything else
- ✅ **Signature gradient** — 135° `#ae2f34` → `#FF6B6B` reserved for primary CTAs and hero/marketing sections
- ✅ **Intentional asymmetry** — break the grid in editorial sections; treat whitespace as first-class
- ✅ **Snappy micro-interactions** — 150–200ms transitions, distinct hover/focus/active states
- ✅ **Lucide icons only** — 2px stroke, no emojis, no AI-generated illustrations

**What We're AVOIDING:**
- ❌ 1px solid borders for sectioning content (use surface-tier shifts instead)
- ❌ Pure-black drop shadows (always tint with `on-surface` `#251818`)
- ❌ Sharp corners (`rounded-sm` 4px only in narrow utility contexts)
- ❌ Gradients on cards, list items, or backgrounds (reserve the signature gradient)
- ❌ Hard-coded hex values outside design tokens (always pull from `design.ts` / `app.css`)
- ❌ `text-gray-*` utilities (use `text-[#251818]` `on-surface` or `text-[#584140]` `on-surface-variant`)
- ❌ Corporate blue/green palettes (trust but boring)
- ❌ Emojis on UI (use Lucide icons instead)

### Tech Stack
- **Framework**: SvelteKit 2 (meta-framework for Svelte)
- **UI**: Svelte 5 with runes mode (reactive primitives)
- **Styling**: Tailwind CSS v4 (utility-first)
- **Components**: shadcn-svelte (accessible component primitives, customized with brutalist touches)
- **Icons**: lucide-svelte (no emojis in UI)
- **State Management**: 
  - TanStack Query (server state)
  - Svelte stores (global client state)
- **Typography**: Space Grotesk (Google Fonts via @fontsource)
- **Package Manager**: pnpm

---

## Development Context

### IMPORTANT: Read Brief Files First

Before starting any task, ALWAYS read these brief files to understand the context:

1. **Design Tokens (Source of Truth)**: `src/lib/constants/design.ts` and `src/app.css`
   - Canonical color palette (primary/secondary/tertiary, Social Ledger surfaces, on-surface)
   - Spacing, radii, shadows
   - Tailwind v4 `@theme` directive in `app.css` mirrors the TS tokens — both must stay in sync
   - Reference these — do not invent ad-hoc values in components

2. **API Specification**: `~/projects/letpai-backend/docs/swagger.yaml`
   - Complete API endpoints with request/response schemas
   - Error handling and rate limiting rules
   - All features for MVP v1.0

3. **Frontend Integration Guide**: `~/projects/letpai-backend/docs/FRONTEND_INTEGRATION_GUIDE.md`
   - API base URL: `http://localhost:3000/api/v1`
   - Authentication flows (register, login, OTP)
   - Core features (contacts, sessions, payments, notifications)
   - UI/UX vision and technical notes

### Context7 Integration

**ALWAYS use Context7 MCP server** for library/API documentation:
- SvelteKit docs, Svelte 5 runes
- TanStack Query for Svelte
- Tailwind CSS v4
- shadcn-svelte
- Up-to-date code examples

---

## File-Based Routing (SvelteKit Conventions)

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
│   └── +page.svelte        # Landing page (with redirect logic)
├── lib/
│   ├── components/         # Reusable UI components
│   │   └── ui/            # shadcn-svelte components (customized)
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
│       ├── design.ts      # Design tokens (colors, spacing, etc.)
│       └── api.ts         # API endpoints
├── app.html               # HTML template
├── app.css                # Global styles (Tailwind directives)
└── app.d.ts               # Global type declarations
static/                    # Static assets
├── favicon.svg
└── robots.txt
```

### Route Groups

- `(app)/` - Authenticated pages with app shell (bottom nav)
- `(auth)/` - Public auth pages (login, register)
- `payment/[token]/` - Public payment page (no auth required)

---

## Design System

### Color Palette

```typescript
// src/lib/constants/design.ts — Social Ledger palette

export const colors = {
  // Primary - Coral Red (gradient pair: deep → bright)
  primary: {
    DEFAULT: '#FF6B6B',   // Coral red (gradient top)
    hover:   '#EE5A5A',
    contrast:'#CC4444',
    deep:    '#ae2f34',   // Deep coral (gradient base, hover-emphasis text)
  },

  // Secondary - Teal Blue
  secondary: {
    DEFAULT: '#14B8A6',
    hover:   '#10A392',
    deep:    '#006b5f',
    light:   '#6df5e1',
  },

  // Tertiary - Purple (premium/settled states)
  tertiary: { DEFAULT: '#842bd2' },

  // Status Colors (functional only — never decorative)
  status: {
    pending:   '#F59E0B',
    submitted: '#3B82F6',
    paid:      '#10B981',
    rejected:  '#EF4444',
  },

  // Social Ledger Surfaces (tonal layering, lightest → darkest)
  surfaces: {
    surface:          '#fff8f7',  // Canvas / page background
    containerLow:     '#fff0ef',  // Section backgrounds
    containerLowest:  '#ffffff',  // Cards that need to "pop"
    container:        '#ffe9e7',  // Elevated sections
    containerHigh:    '#fbe3e1',  // Hover states
    containerHighest: '#f5dddb',  // Sunken inputs
    dim:              '#ecd5d3',  // Subdued backgrounds
  },

  // On-Surface (text/icon colors)
  onSurface: {
    DEFAULT: '#251818',  // Primary text
    variant: '#584140',  // Secondary/label text
  },

  outline: { variant: '#e0bfbd' },  // Ghost borders only (15% opacity for a11y)
};
```

**Token discipline:** never hard-code hex values in components when a token exists. The `@theme` block in `src/app.css` mirrors these so Tailwind utilities like `bg-surface`, `text-on-surface`, `rounded-xl` resolve correctly.

### Typography

**Font:** Plus Jakarta Sans (Google Fonts via @fontsource)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- Fallbacks: system-ui, sans-serif

**Scale (editorial — money should feel significant):**
```css
/* Display - Monetary values, hero totals */
.display-1: 48px / 1.2  /* tight tracking, weight 700 */
.display-2: 36px / 1.2

/* Headings */
.h1: 32px / 1.2   weight 700  letter-spacing -0.02em
.h2: 24px / 1.3   weight 600  letter-spacing -0.01em
.h3: 18px / 1.4   weight 600

/* Body */
.body-lg:  18px / 1.6   weight 400
.body:     16px / 1.6   weight 400
.body-sm:  14px / 1.5   weight 400
.caption:  12px / 1.5   weight 500
```

**Color rule:** primary text uses `text-[#251818]` (`on-surface`); secondary/labels use `text-[#584140]` (`on-surface-variant`). Never `text-gray-*`.

### Spacing System (8px base)

```typescript
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};
```

### Border Radius (Social Ledger — generous & friendly)

Tailwind v4 radii are wired in `src/app.css`:

```css
--radius-sm:      4px;   /* narrow utility contexts only (inline tags, code chips) */
--radius-icon:   14px;   /* icon containers, small avatars */
--radius-default:18px;   /* small buttons, chips */
--radius-card:   20px;   /* small cards, list items */
--radius-lg:     24px;   /* standard cards, modals */
--radius-xl:     28px;   /* hero/feature cards */
--radius-full:  100px;   /* pills, badges, circular buttons */
```

**Rules:**
- Cards: `rounded-2xl` (24px) or `rounded-3xl` (28–32px) — never less.
- Buttons: `rounded-2xl` standard; `rounded-full` for icon-only/pill buttons.
- Inputs: `rounded-2xl`. Pills/badges: `rounded-full`.
- **Forbidden**: sharp corners (`rounded-none`) anywhere user-facing. `rounded-sm` only for inline tags or code chips.

### Shadows & Depth (Social Ledger)

Depth is conveyed primarily through **tonal layering** (stacking surface tiers), not shadows. Shadows are reserved for genuinely floating elements.

```css
/* Cards — subtle ambient */
box-shadow: 0 1px 3px rgba(37, 24, 24, 0.04);

/* Cards on hover — slightly more lift */
box-shadow: 0 10px 30px rgba(37, 24, 24, 0.06);

/* Modals / dropdowns / FABs — diffused, low-opacity */
box-shadow: 0 24px 48px -4px rgba(37, 24, 24, 0.12);
```

**Rules:**
- Shadow color must be tinted with `on-surface` `#251818` — **never pure black**.
- Opacity ≤ 12% always.
- Default to no shadow + a surface-tier shift. Only add a shadow when the element genuinely floats.
- **Forbidden**: brutalist offset shadows (`4px 4px 0 #000`), pure-black drop shadows, heavy opacity (> 12%).

---

## Component Specifications

### Button (Social Ledger)

**Variants:**
1. **Primary** — signature gradient `from-[#ae2f34] to-[#FF6B6B]`, white text, `rounded-2xl`. Used for the highest-intent action on a screen.
2. **Secondary** — `bg-[#6df5e1]` (secondary container) with `text-[#006b5f]` (on-secondary-container). No border.
3. **Ghost** — text-only `text-[#ae2f34]`, hover shifts to `bg-[#fbe3e1]` (surface-container-high).

**Sizes:**
- `sm`: 36px height, 14px horizontal padding
- `default`: 44px height (matches mobile touch target), 20px horizontal padding
- `lg`: 52px height, 28px horizontal padding

**States:**
- Hover: gradient deepens / secondary darkens by ~5%
- Active: scale down to 0.98
- Disabled: 50% opacity, `pointer-events: none`
- Loading: spinner, disabled state

**Example:**
```svelte
<!-- Primary CTA -->
<button class="bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] text-white
               rounded-2xl px-5 h-11 font-semibold
               hover:opacity-95 active:scale-[0.98]
               transition duration-150">
  Send Notifications
</button>

<!-- Secondary -->
<button class="bg-[#6df5e1] text-[#006b5f]
               rounded-2xl px-5 h-11 font-semibold
               hover:bg-[#4fdbc8] transition duration-150">
  Cancel
</button>
```

### Badge (Status)

**Variants** — low-opacity background tint + saturated text for sophistication:
- `pending`: `bg-[#F59E0B]/15 text-[#92400E]`
- `submitted`: `bg-[#3B82F6]/15 text-[#1E40AF]`
- `paid`: `bg-[#10B981]/15 text-[#047857]`
- `rejected`: `bg-[#EF4444]/15 text-[#991B1B]`

**Style:** `rounded-full`, padding `px-3 py-1`, Plus Jakarta Sans Medium 12px, **not uppercase** (editorial feel).

```svelte
<span class="inline-flex items-center px-3 py-1 rounded-full
             text-xs font-medium
             bg-[#10B981]/15 text-[#047857]">
  Paid
</span>
```

### Card

**Style:**
- Background: `bg-white` (surface-container-lowest) for cards that need to "pop", or `bg-[#fff0ef]` (surface-container-low) for sectioning
- **No 1px borders.** Distinguish from background via surface-tier shift
- Border radius: `rounded-2xl` (24px) or `rounded-3xl` (28px) for hero cards
- Subtle ambient shadow on lift-able cards: `shadow-[0_1px_3px_rgba(37,24,24,0.04)]`
- Padding: 24px (`p-6`) min, 32px (`p-8`) for content-heavy cards
- Hover: shift to `bg-[#fff0ef]` or add ambient shadow

```svelte
<div class="bg-white rounded-3xl p-8
            shadow-[0_1px_3px_rgba(37,24,24,0.04)]
            hover:shadow-[0_10px_30px_rgba(37,24,24,0.06)]
            transition duration-150">
  <h3 class="text-xl font-semibold mb-2 text-[#251818]">Session Name</h3>
  <p class="text-[#584140]">Description…</p>
</div>
```

### Input ("Sunken" surface)

**Style:**
- Background: `bg-[#f5dddb]` (surface-container-highest) — feels recessed
- **No solid border.** Focus state uses a 2px `secondary` underline or soft `primary` glow
- Border radius: `rounded-2xl`
- Padding: `px-4 py-3`
- Text color: `text-[#251818]`, placeholder: `text-[#584140]`

```svelte
<input type="text"
       class="w-full bg-[#f5dddb] rounded-2xl
              px-4 py-3 font-medium text-[#251818]
              placeholder:text-[#584140]
              focus:outline-none focus:ring-2 focus:ring-[#ae2f34]/30
              transition duration-150"
       placeholder="Session name" />
```

---

## API Integration

### API Client Setup

```typescript
// src/lib/services/api.ts

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

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

```typescript
// Include JWT token in requests
const token = localStorage.getItem('token');
const response = await fetch('/api/sessions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

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
  {#each data?.sessions || [] as session}
    <SessionCard {session} />
  {/each}
{/if}
```

---

## Styling (Tailwind CSS v4)

### Design Tokens

Use design tokens from design system:

```ts
// src/lib/constants/design.ts
export const colors = {
  primary: {
    DEFAULT: '#FF6B6B',    // Coral red
    hover: '#EE5A5A'
  },
  // ... other colors
};
```

### Common Tailwind Patterns

```svelte
<!-- Primary CTA (signature gradient) -->
<button class="bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] text-white
               rounded-2xl px-5 h-11 font-semibold
               hover:opacity-95 active:scale-[0.98] transition duration-150">
  Create Session
</button>

<!-- Card (tonal layering + ambient shadow on hover) -->
<div class="bg-white rounded-3xl p-6
            shadow-[0_1px_3px_rgba(37,24,24,0.04)]
            hover:shadow-[0_10px_30px_rgba(37,24,24,0.06)] transition">
  <SessionCard />
</div>

<!-- Status Badge (low-opacity tint) -->
<span class="px-3 py-1 rounded-full text-xs font-medium
             bg-[#10B981]/15 text-[#047857]">
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
    primary:   'bg-gradient-to-br from-[#ae2f34] to-[#FF6B6B] text-white hover:opacity-95',
    secondary: 'bg-[#6df5e1] text-[#006b5f] hover:bg-[#4fdbc8]',
    ghost:     'text-[#ae2f34] hover:bg-[#fbe3e1]',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-5',
    lg: 'h-13 px-7 text-lg'
  };
</script>

<button
  class={cn('rounded-2xl font-semibold transition duration-150 active:scale-[0.98]',
            variants[variant], sizes[size], className)}
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

- **ALWAYS** use runes syntax (`$props`, `$state`, `$derived`, `$effect`)
- **FOLLOW** the Social Ledger design system — tokens from `src/lib/constants/design.ts` + `src/app.css`
- **NO HARD-CODED HEX** values outside design tokens
- **MOBILE-FIRST** responsive design
- **REFERENCE** API spec from `~/projects/letpai-backend/docs/swagger.yaml` before implementing endpoints
- **USE** TanStack Query for server state, Svelte stores for global state
- **TYPE** all components and API responses
- **NO EMOJIS** on UI — use Lucide icons (2px stroke)
- **TEST** on mobile viewport (375px minimum) and desktop (1280px)

---

## Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:3000  # Backend API URL
```

---

## Development Phases

### Phase 1: Foundation + Landing (Week 1-2) ✅ CURRENT

**Goal:** Complete design system + landing page + core auth flow + dashboard + create session

**Tasks:**
1. **Setup & Configuration**
   - [ ] Install dependencies: shadcn-svelte, lucide-svelte, @fontsource/space-grotesk
   - [ ] Configure Tailwind with Space Grotesk + design tokens
   - [ ] Create design.ts constants file
   - [ ] Setup app.css with Tailwind directives

2. **Base Components** (Customize shadcn-svelte)
   - [ ] Button (brutalist style: sharp corners, bold borders)
   - [ ] Input (minimal border-radius, visible borders)
   - [ ] Badge (pill-shaped status indicators)
   - [ ] Card (bordered, not shadowed)
   - [ ] Toast (top-center, snappy)
   - [ ] Avatar (circular, geometric)
   - [ ] Progress bar (geometric, bold colors)

3. **Layout Components**
   - [ ] Bottom navigation (mobile)
   - [ ] App shell (with bottom nav + auth check)
   - [ ] Auth layout (minimal, centered)

4. **Landing Page**
   - [ ] Hero section with value prop ("Split bills effortlessly with friends")
   - [ ] "Get Started" CTA button (coral red, brutalist style)
   - [ ] Quick features section (3-4 highlights with Lucide icons)
   - [ ] WhatsApp integration highlight
   - [ ] Smart redirect logic (authenticated → dashboard, not auth → login)
   - [ ] Minimal, fast-loading, brutalist styling
   - [ ] Mobile-responsive layout

5. **Auth Flow**
   - [ ] Login page (phone + password)
   - [ ] Register page (phone + password + OTP)
   - [ ] OTP verification page
   - [ ] Auth service + store
   - [ ] Protected routes middleware

6. **Dashboard**
   - [ ] Quick stats cards (owed/owe)
   - [ ] Session list with cards
   - [ ] Filter tabs (active/completed/cancelled)
   - [ ] Pull-to-refresh (TanStack Query)

7. **Create Session Flow** (Multi-step wizard)
   - [ ] Step 1: Session info (name, description, currency)
   - [ ] Step 2: Add participants (contact list, search, manual add)
   - [ ] Step 3: Add bills (item list, add form)
   - [ ] Step 4: Review & send notifications

8. **API Integration**
   - [ ] Base API client with auth interceptors
   - [ ] TanStack Query setup
   - [ ] Error handling + toast notifications

**Deliverable:** User can visit landing page, register, login, view dashboard, create session, add participants, add bills, and send notifications.

### Phase 2: Session Management (Week 3)

**Goal:** Complete session detail view + payment tracking

**Tasks:**
1. **Session Detail Page**
   - [ ] Session info section
   - [ ] Participants list with status badges
   - [ ] Bill items breakdown
   - [ ] Payment progress visualization
   - [ ] Bulk actions (approve/reject)

2. **Contact Management**
   - [ ] Contact list with groups
   - [ ] Add/edit/delete contacts
   - [ ] Contact groups CRUD
   - [ ] Search and filter

3. **Reminder System**
   - [ ] Individual reminder button
   - [ ] Bulk reminder
   - [ ] Rate limit countdown display

### Phase 3: Payments (Week 4)

**Goal:** Public payment page + proof upload

**Tasks:**
1. **Public Payment Page**
   - [ ] Bill details display
   - [ ] Upload proof interface
   - [ ] Camera capture + file upload
   - [ ] Preview + submit
   - [ ] Status display (pending/submitted/paid/rejected)

2. **Payment Proof Upload**
   - [ ] Image compression
   - [ ] Preview before submit
   - [ ] Upload progress indicator

3. **Host Payment Review**
   - [ ] View uploaded proofs
   - [ ] Approve/reject with reason
   - [ ] Bulk approve/reject

### Phase 4: Polish & Optimize (Week 5)

**Goal:** UX improvements + performance

**Tasks:**
1. **UX Improvements**
   - [ ] Empty states with illustrations
   - [ ] Loading states (skeleton → real content)
   - [ ] Error states with retry
   - [ ] Success celebrations (confetti on payment approval?)

2. **Performance**
   - [ ] Image lazy loading
   - [ ] Code splitting by route
   - [ ] Prefetching on hover
   - [ ] Optimistic updates

3. **Accessibility**
   - [ ] ARIA labels
   - [ ] Keyboard navigation
   - [ ] Focus management
   - [ ] Screen reader testing

4. **Testing**
   - [ ] Component tests (vitest)
   - [ ] E2E tests (playwright)
   - [ ] Mobile testing (iOS Safari, Android Chrome)

### Phase 5: Advanced Features (Week 6+)

**Goal:** Dark mode + PWA + advanced features

**Tasks:**
1. **Dark Mode**
   - [ ] Color scheme toggle
   - [ ] Persist preference
   - [ ] System preference detection

2. **PWA Features**
   - [ ] Service worker
   - [ ] Offline support
   - [ ] Push notifications
   - [ ] Add to home screen

3. **Advanced Features**
   - [ ] Quick split (one-step session creation)
   - [ ] Session templates
   - [ ] Export to PDF/Excel
   - [ ] Analytics dashboard

---

## Questions for Future Consideration

1. **Offline Support**: What should work without internet?
2. **Deep Linking**: Handle WhatsApp deep links to specific sessions?
3. **Push Notifications**: Beyond WhatsApp, browser push notifications?
4. **Multi-currency**: Display formatting for different currencies?
5. **Accessibility**: Screen reader support, keyboard navigation?

---

**End of Guide**

This document provides vision and direction. Specific implementation details (colors, components, exact APIs) should be referenced from `docs/ANTI_AI_DESIGN_PLAN.md` and decided by the implementing developer based on this guidance.
