# AGENTS.md - Letpai Frontend Development

**This file provides guidance to AI agents when working with code in this repository.**

---

## Project Overview

Letpai is a bill splitting application with WhatsApp integration. Frontend built with SvelteKit 2 + Svelte 5 (runes) + Tailwind CSS v4, targeting youth (18-30) in Indonesia.

### Design Philosophy: Anti-AI Slop

**Core Principles:**
- ✅ **High contrast** - black/white with vibrant coral red (#FF6B6B) accents
- ✅ **Bold typography** - Space Grotesk at large sizes for impact
- ✅ **Angular edges** - sharp corners on cards, buttons (minimal border-radius: 4-8px)
- ✅ **Geometric shapes** - circles, squares, triangles as design elements
- ✅ **Strategic whitespace** - let elements breathe
- ✅ **Intentional asymmetry** - break the grid for visual interest
- ✅ **Punchy micro-interactions** - subtle but satisfying feedback (150-200ms)

**What We're AVOIDING:**
- ❌ Generic gradients (purple-to-pink, teal-to-blue fades)
- ❌ Soft drop shadows everywhere (only strategic use)
- ❌ Rounded corners on everything (use angular edges strategically)
- ❌ Corporate blue/green palettes (trust but boring)
- ❌ Skeleton loaders (use real content placeholders)
- ❌ AI-generated illustrations (use bold icons/typography instead)
- ❌ Subtle animations (use intentional, snappy transitions)
- ❌ Perfect symmetry (break the grid intentionally)
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

1. **Anti-AI Design Plan**: `docs/ANTI_AI_DESIGN_PLAN.md`
   - Complete anti-AI slop design philosophy
   - Design system (colors, typography, spacing, border radius)
   - Component specifications (Button, Badge, Card, Input, Toast)
   - Development phases (Phase 1-5)
   - Landing page design (hero + features grid)
   - Visual style guidelines (brutalist + vibrant)

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
// src/lib/constants/design.ts

export const colors = {
  // Primary - Coral Red (action-oriented)
  primary: {
    DEFAULT: '#FF6B6B',    // Coral red - bold, action-oriented
    hover: '#EE5A5A',
    contrast: '#CC4444',
  },
  
  // Secondary - Teal Blue (secondary actions)
  secondary: {
    DEFAULT: '#14B8A6',    // Teal blue
    hover: '#10A392',
  },
  
  // Accents
  accent: {
    purple: '#8B5CF6',
    yellow: '#F59E0B',
  },
  
  // Status Colors (high contrast)
  status: {
    pending: '#F59E0B',      // Yellow - attention
    submitted: '#3B82F6',    // Blue - in progress
    paid: '#10B981',         // Green - success
    rejected: '#EF4444',     // Red - needs action
  },
  
  // Neutral (high contrast)
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    }
  }
};
```

### Typography

**Font:** Space Grotesk (Google Fonts via @fontsource)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Fallbacks: system-ui, sans-serif

**Scale:**
```css
/* Display - Large amounts, hero text */
.display-1: 64px / 1.1    /* Total: Rp 500.000 */
.display-2: 48px / 1.2    /* Session name */

/* Headings */
.h1: 32px / 1.3         /* Page titles */
.h2: 24px / 1.4         /* Section titles */
.h3: 20px / 1.4         /* Card titles */

/* Body */
.body: 16px / 1.5       /* Default body text */
.body-sm: 14px / 1.5    /* Secondary text */
.caption: 12px / 1.5    /* Labels, badges */

/* Numbers */
.mono: 16px / 1.4        /* Amounts, phone numbers */
```

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

### Border Radius (Brutalist)

```typescript
export const borderRadius = {
  none: '0',        // Brutalist edges
  sm: '4px',        // Minimal rounding
  DEFAULT: '8px',   // Standard
  lg: '12px',       // Cards (max we'll go)
  xl: '16px',       // Never use (too soft)
  full: '9999px',   // Badges only
};
```

**Rule:** Prefer `none` or `sm` for buttons, inputs. Use `default` or `lg` for cards only.

### Shadows (Strategic)

```typescript
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',  // Subtle depth
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  bold: '4px 4px 0 0 rgba(0, 0, 0, 1)',  // Brutalist offset shadow
};
```

**Rule:** Use `bold` shadow sparingly for emphasis. Default to `none` or `sm`.

---

## Component Specifications

### Button (Brutalist)

**Variants:**
1. **Primary** - Coral red background, white text, sharp corners (4px radius)
2. **Secondary** - Transparent, coral red border, coral red text
3. **Ghost** - Transparent, no border, gray text

**Sizes:**
- `sm`: 36px height, 12px padding
- `default`: 40px height, 16px padding
- `lg`: 48px height, 24px padding

**States:**
- Hover: Slightly darker shade (10%)
- Active: Scale down slightly (0.98)
- Disabled: 50% opacity, no pointer events
- Loading: Spinner icon, disabled state

**Example:**
```svelte
<!-- Primary button -->
<button class="bg-[#FF6B6B] hover:bg-[#EE5A5A] text-white 
           rounded-sm px-4 py-2 font-medium 
           transition-colors duration-150">
  Send Notifications
</button>

<!-- Secondary button -->
<button class="border-2 border-[#FF6B6B] text-[#FF6B6B] 
           hover:bg-[#FF6B6B] hover:text-white
           rounded-sm px-4 py-2 font-medium 
           transition-all duration-150">
  Cancel
</button>
```

### Badge (Status)

**Variants:**
- `pending`: Yellow background (#F59E0B), dark text
- `submitted`: Blue background (#3B82F6), white text
- `paid`: Green background (#10B981), white text
- `rejected`: Red background (#EF4444), white text

**Style:**
- Border radius: `full` (pill shape)
- Padding: 4px 12px
- Font: Space Grotesk Medium, 12px
- Uppercase text

**Example:**
```svelte
<span class="inline-flex items-center px-3 py-1 rounded-full 
            text-xs font-medium uppercase
            bg-[#10B981] text-white">
  Paid
</span>
```

### Card

**Style:**
- Background: White
- Border: 2px solid gray-200 (visible border, not shadow)
- Border radius: 12px (lg - max we'll go)
- Padding: 24px (lg)
- Hover: Border color changes to coral red (optional)

**Example:**
```svelte
<div class="bg-white border-2 border-gray-200 rounded-lg p-6 
           hover:border-[#FF6B6B] transition-colors duration-150">
  <h3 class="text-lg font-semibold mb-2">Session Name</h3>
  <p class="text-gray-600">Description...</p>
</div>
```

### Input

**Style:**
- Border: 2px solid gray-300
- Border radius: 4px (sm - minimal)
- Padding: 12px 16px
- Focus: Border coral red, no box-shadow (brutalist)
- Error: Border red-500

**Example:**
```svelte
<input type="text" 
       class="w-full border-2 border-gray-300 rounded-sm 
              px-4 py-3 font-medium
              focus:border-[#FF6B6B] focus:outline-none
              placeholder:text-gray-400
              transition-colors duration-150"
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
    secondary: 'border-2 border-[#FF6B6B] text-[#FF6B6B]',
    tertiary: 'bg-gray-200 text-gray-700'
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-6',
    lg: 'h-12 px-8 text-lg'
  };
</script>

<button
  class={cn('rounded-sm font-medium transition', variants[variant], sizes[size], className)}
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
- **FOLLOW** design system from `docs/ANTI_AI_DESIGN_PLAN.md`
- **MOBILE-FIRST** responsive design
- **REFERENCE** API spec from swagger.yaml before implementing endpoints
- **USE** TanStack Query for server state, Svelte stores for global state
- **TYPE** all components and API responses
- **NO EMOJIS** on UI - use Lucide icons instead
- **TEST** on mobile viewport (375px minimum)

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
