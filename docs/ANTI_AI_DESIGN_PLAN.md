# Letpai - Anti-AI Slop UI Design Plan

**Version:** 1.0  
**Date:** March 27, 2026  
**Status:** Planning Phase  

---

## Executive Summary

This document outlines the **anti-AI slop** design philosophy and implementation plan for Letpai - a bill splitting app targeting youth (18-30) in Indonesia. The goal is to create a distinctive, memorable, and vibrant UI that rejects generic AI-generated aesthetics.

---

## Design Vision

### Anti-AI Slop Philosophy

**What We're AVOIDING:**
- ❌ Generic gradients (purple-to-pink, teal-to-blue fades)
- ❌ Soft drop shadows everywhere (only strategic use)
- ❌ Rounded corners on everything (use angular edges strategically)
- ❌ Corporate blue/green palettes (trust but boring)
- ❌ Skeleton loaders (use real content placeholders)
- ❌ AI-generated illustrations (use bold icons/typography instead)
- ❌ Subtle animations (use intentional, snappy transitions)
- ❌ Perfect symmetry (break the grid intentionally)

**What We're EMBRACING:**
- ✅ **High contrast** - black/white with vibrant coral accents
- ✅ **Bold typography** - Space Grotesk at large sizes for impact
- ✅ **Angular edges** - sharp corners on cards, buttons (minimal border-radius: 4-8px)
- ✅ **Geometric shapes** - circles, squares, triangles as design elements
- ✅ **Strategic whitespace** - let elements breathe
- ✅ **Intentional asymmetry** - break the grid for visual interest
- ✅ **Punchy micro-interactions** - subtle but satisfying feedback
- ✅ **Real content** - actual text placeholders, not gray boxes

### Design Decisions (User-Confirmed)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Style** | Brutalist + Vibrant | Bold, high contrast, angular edges. Rejects generic 'startup' aesthetic. Think Spotify Wrapped energy. |
| **Primary Color** | Coral Red (#FF6B6B) | Bold, attention-grabbing. Good for CTAs like 'Send Notifications', 'Approve Payment'. Feels urgent and action-oriented. |
| **Typography** | Space Grotesk (everything) | Modern, geometric, balanced. Good for both headings and body. Creates nice hierarchy without being boring. |
| **Components** | shadcn-svelte (customized) | Accessible primitives, customize with brutalist touches. Faster than building from scratch. |
| **Icons** | Lucide | Modern, consistent, good variety. Clean line icons fit brutalist aesthetic. |
| **Animations** | Subtle/minimal | Snappy, not distracting. Fast transitions (150-200ms). |
| **Navigation** | Bottom nav only (mobile) | Mobile-first approach. No sidebar complexity. |
| **Landing Page** | Minimal | Just "Get Started" CTA. Redirect to login if not authenticated. |
| **Phase 1 Priority** | All-in | Design system + Auth + Dashboard + Create Session (complete flow). |

---

## Technical Stack

### Core Technologies
- **Framework:** SvelteKit 2 (file-based routing, SSR)
- **UI Layer:** Svelte 5 with runes (`$state`, `$props`, `$derived`, `$effect`)
- **Styling:** Tailwind CSS v4 (utility-first)
- **Components:** shadcn-svelte (accessible component primitives)
- **Icons:** lucide-svelte
- **State Management:** 
  - TanStack Query (server state)
  - Svelte stores (global client state)
- **Typography:** Space Grotesk (Google Fonts via @fontsource)

### Project Structure

```
letpai/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── ui/              # shadcn-svelte components (customized)
│   │   │       ├── button/
│   │   │       ├── input/
│   │   │       ├── badge/
│   │   │       ├── card/
│   │   │       ├── toast/
│   │   │       └── ...
│   │   ├── constants/
│   │   │   ├── design.ts         # Design tokens (colors, spacing, etc.)
│   │   │   └── api.ts            # API endpoints
│   │   ├── services/
│   │   │   ├── api.ts            # Base API client
│   │   │   ├── auth.ts           # Auth service
│   │   │   └── ...
│   │   ├── stores/
│   │   │   ├── auth.ts           # Auth store
│   │   │   └── toast.ts          # Toast notifications
│   │   ├── types/
│   │   │   ├── api.ts            # API types
│   │   │   └── models.ts         # Domain models
│   │   └── utils/
│   │       ├── format.ts         # Formatters (currency, date)
│   │       └── validation.ts     # Validators
│   ├── routes/
│   │   ├── (auth)/               # Auth route group (public)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── verify/
│   │   ├── (app)/                # App route group (authenticated)
│   │   │   ├── dashboard/
│   │   │   ├── sessions/
│   │   │   │   ├── [id]/
│   │   │   │   └── new/
│   │   │   ├── contacts/
│   │   │   └── profile/
│   │   ├── payment/
│   │   │   └── [token]/          # Public payment page
│   │   ├── +layout.svelte
│   │   ├── +page.svelte          # Redirect to login/dashboard
│   │   └── app.css
│   └── app.html
├── static/
│   └── fonts/                    # Space Grotesk (optional local)
├── tailwind.config.js            # Tailwind configuration
└── package.json
```

---

## Design System

### Color Palette

```typescript
// src/lib/constants/design.ts

export const colors = {
  // Primary - Coral Red (action-oriented)
  primary: {
    DEFAULT: '#FF6B6B',
    hover: '#EE5A5A',
    contrast: '#CC4444',
  },
  
  // Secondary - Teal Blue (secondary actions)
  secondary: {
    DEFAULT: '#14B8A6',
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

**Font:** Space Grotesk (Google Fonts)
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
.mono: 16px / 1.4        /* Amounts, phone numbers (Space Grotesk tabular nums */
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

### Toast

**Variants:**
- `success`: Green background
- `error`: Red background
- `warning`: Yellow background

**Style:**
- Position: Top center
- Border radius: 4px (sm)
- Animation: Slide down (150ms)
- Auto-dismiss: 3 seconds

---

## Page Layouts

### Mobile-First Navigation

**Bottom Nav (5 items):**
1. **Home** - Dashboard icon
2. **Sessions** - List icon
3. **New** - Plus icon (coral red, larger)
4. **Contacts** - Users icon
5. **Profile** - User icon

**Style:**
- Height: 64px
- Background: White
- Border top: 2px solid gray-200
- Active: Coral red icon + label
- Inactive: Gray icon + label

### Dashboard

**Layout:**
```
┌─────────────────────┐
│  Header (avatar)    │
├─────────────────────┤
│  Quick Stats        │
│  ┌───────┬───────┐  │
│  │ Owed  │ Owe   │  │
│  └───────┴───────┘  │
├─────────────────────┤
│  Sessions           │
│  ┌─────────────┐    │
│  │ Card        │    │
│  └─────────────┘    │
│  ┌─────────────┐    │
│  │ Card        │    │
│  └─────────────┘    │
└─────────────────────┘
│  [Bottom Nav]       │
└─────────────────────┘
```

### Landing Page

**Layout:**
```
┌─────────────────────┐
│  Logo               │
├─────────────────────┤
│  Hero Section       │
│  - Headline         │
│  - Subtext          │
│  - CTA Button       │
├─────────────────────┤
│  Features Grid      │
│  ┌───────┬───────┐  │
│  │ Icon  │ Icon  │  │
│  │ Text  │ Text  │  │
│  └───────┴───────┘  │
│  ┌───────┬───────┐  │
│  │ Icon  │ Icon  │  │
│  │ Text  │ Text  │  │
│  └───────┴───────┘  │
└─────────────────────┘
```

**Hero Section:**
- Headline: "Split bills effortlessly with friends" (h1, bold)
- Subtext: "WhatsApp notifications included. No app needed for participants."
- CTA Button: "Get Started" (primary, coral red, brutalist style)
- Redirects: Authenticated → /dashboard, Not auth → /login

**Features Grid (2x2):**
- Feature 1: Icon (Smartphone) + "Create sessions in seconds"
- Feature 2: Icon (MessageCircle) + "Automatic WhatsApp notifications"
- Feature 3: Icon (Camera) + "Track payments with proof upload"
- Feature 4: Icon (CheckCircle) + "Works for everyone (no app needed)"

**Style:**
- Background: White or light gray (#F8FAFC)
- Typography: Space Grotesk (bold for headline, regular for body)
- Icons: Lucide line icons (24px, coral red accent)
- Buttons: Coral red primary, brutalist style (sharp corners, bold)
- Responsive: Mobile-first (stack on mobile, grid on tablet/desktop)

### Session Card

**Content:**
- Session name (h3)
- Total amount (display-2, bold, coral red)
- Progress bar (green fill)
- Status badge (top right)
- Participant avatars (bottom)
- "2/4 paid" text

**Style:**
- Border: 2px solid gray-200
- Border radius: 12px
- Padding: 20px
- Hover: Border coral red

---

## Animation Guidelines

### Principles
- **Fast**: 150-200ms (snappy, not sluggish)
- **Intentional**: Every animation serves a purpose
- **Minimal**: Don't animate everything

### Transitions
```css
/* Default transition */
transition-all duration-150

/* Slower for modals */
transition-all duration-200

/* Fastest for hover states */
transition-colors duration-100
```

### Micro-interactions
- **Button hover**: Background color shift (10% darker)
- **Button active**: Scale down (0.98)
- **Card hover**: Border color change
- **Input focus**: Border color change
- **Toast enter**: Slide down from top
- **Modal open**: Fade in + scale (0.95 → 1)

---

## Development Phases

### Phase 1: Foundation (Week 1-2) ✅ PRIORITY

**Goal:** Complete design system + core auth flow + dashboard + create session

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

4. **Landing Page** ⭐
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

---

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

---

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

---

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

---

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

## Backend API Reference

**Base URL:** `http://localhost:3000/api/v1`

### Key Endpoints:

**Auth:**
- `POST /auth/register` - Register with OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/login` - Login
- `GET /auth/profile` - Get profile

**Sessions:**
- `GET /sessions` - List sessions
- `POST /sessions` - Create session
- `GET /sessions/:id` - Session details
- `POST /sessions/:id/participants` - Add participants
- `POST /sessions/:id/bills` - Add bill item
- `PUT /sessions/:id/calculate-splits` - Calculate splits
- `POST /sessions/:id/send-notifications` - Send notifications

**Payments:**
- `GET /payments/:participant_id/public` - Public payment page
- `POST /payments/:participant_id/submit` - Submit proof
- `POST /payments/:proof_id/approve` - Approve payment
- `POST /payments/:proof_id/reject` - Reject payment

**Contacts:**
- `GET /contacts` - List contacts
- `POST /contacts` - Create contact
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact

**Full API Spec:** `~/projects/letpai-backend/docs/swagger.yaml`

---

## File Naming Conventions

### Svelte Components
- PascalCase: `Button.svelte`, `SessionCard.svelte`
- Place in appropriate folder: `ui/`, `forms/`, `layouts/`

### TypeScript Files
- camelCase: `api.ts`, `authStore.ts`
- Descriptive: `formatCurrency.ts`, `validatePhone.ts`

### Route Files
- SvelteKit conventions: `+page.svelte`, `+layout.svelte`, `+page.ts`

---

## Git Workflow

### Branches
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fixes

### Commit Messages
```
type(scope): subject

feat(auth): add login page with brutalist styling
fix(button): correct hover state color
style(card): use visible borders instead of shadows
refactor(api): add error interceptor
```

---

## Questions for Future Consideration

1. **Dark Mode**: Save for Phase 5, but keep it in mind when designing components (use CSS variables)
2. **Brutalist Elements**: 
   - Thick borders (2px minimum)
   - Minimal border-radius (4-8px max)
   - Strategic use of offset shadows
   - Geometric shapes as decorative elements
3. **FAB Color**: Coral red (primary action color)
4. **Landing Page**: Redirect root to `/login` if not authenticated, `/dashboard` if authenticated

---

## Success Metrics

### Design Success
- [ ] Users can complete core flow in < 5 minutes
- [ ] Visual hierarchy is clear without explanation
- [ ] Status indicators are immediately understandable
- [ ] Mobile interactions feel native (44px touch targets)

### Technical Success
- [ ] First contentful paint < 1.5s
- [ ] Time to interactive < 3s
- [ ] Lighthouse score > 90
- [ ] Zero accessibility violations

---

## Resources

### Design Inspiration
- [Spotify Wrapped](https://wrapped.spotify.com) - Vibrant, bold, high contrast
- [Stripe Dashboard](https://stripe.com) - Clean data visualization
- [Vercel Dashboard](https://vercel.com) - Brutalist elements
- [Linear App](https://linear.app) - Modern, geometric

### Component Libraries
- [shadcn-svelte](https://www.shadcn-svelte.com/) - Base components
- [Lucide Icons](https://lucide.dev/) - Icon reference

### Typography
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) - Google Fonts

---

## Next Steps (When Ready to Implement)

1. Run dependency installation commands
2. Configure Tailwind with design tokens
3. Create AGENTS.md with this plan
4. Start Phase 1 tasks

---

**Document Status:** ✅ Complete - Ready for implementation  
**Last Updated:** March 27, 2026
