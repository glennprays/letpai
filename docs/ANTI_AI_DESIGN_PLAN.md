# Letpai - Anti-AI Slop UI Design Plan

**Version:** 1.0  
**Date:** March 27, 2026  
**Status:** Planning Phase  

---

## Executive Summary

This document outlines the **modern, polished design** philosophy and implementation plan for Letpai - a bill splitting app targeting youth (18-30) in Indonesia. The goal is to create a clean, approachable, and vibrant UI that feels contemporary and user-friendly.

---

## Design Vision

### Modern, Polished Design Philosophy

**What We're AVOIDING:**
- ❌ Generic gradients (purple-to-pink, teal-to-blue fades)
- ❌ Excessive drop shadows everywhere
- ❌ Ultra-sharp brutalist edges on everything
- ❌ Corporate blue/green palettes (trust but boring)
- ❌ Skeleton loaders (use real content placeholders)
- ❌ AI-generated illustrations (use bold icons/typography instead)
- ❌ Overly subtle animations (make them purposeful)
- ❌ Cluttered, busy layouts

**What We're EMBRACING:**
- ✅ **Clean, high contrast** - white backgrounds with vibrant coral accents
- ✅ **Modern typography** - Plus Jakarta Sans for a friendly, professional feel
- ✅ **Rounded, approachable design** - soft corners (14-24px) for cards, pill-shaped buttons (100px)
- ✅ **Subtle depth** - soft colored shadows with lift effects on hover
- ✅ **Strategic whitespace** - let elements breathe with generous padding
- ✅ **Modern grid layouts** - bento-style grids with balanced proportions
- ✅ **Purposeful micro-interactions** - smooth lift and color transitions (150-200ms)
- ✅ **Real content** - actual text placeholders, not gray boxes

### Design Decisions (User-Confirmed)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Style** | Modern + Polished | Clean, approachable, rounded design with soft shadows. Contemporary feel that's user-friendly and trustworthy. |
| **Primary Color** | Coral Red (#FF6B6B) | Bold, attention-grabbing. Good for CTAs like 'Send Notifications', 'Approve Payment'. Warm and inviting yet action-oriented. |
| **Typography** | Plus Jakarta Sans (everything) | Modern, friendly, professional. Excellent readability with good character. Perfect for headings and body text. |
| **Components** | shadcn-svelte (customized) | Accessible primitives, customize with modern rounded touches. Faster than building from scratch. |
| **Icons** | Lucide | Modern, consistent, good variety. Clean line icons fit the polished aesthetic. |
| **Animations** | Purposeful/smooth | Lift effects, color transitions, subtle scaling. Fast transitions (150-200ms). |
| **Navigation** | Bottom nav only (mobile) | Mobile-first approach. No sidebar complexity. |
| **Landing Page** | Comprehensive | Hero section, features grid, how it works, CTA banner, footer. Full landing experience. |
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
- **Typography:** Plus Jakarta Sans (Google Fonts)

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
  │   └── fonts/                    # Plus Jakarta Sans (optional local)
├── tailwind.config.js            # Tailwind configuration
└── package.json
```

---

## Design System

### Color Palette

```typescript
// src/lib/constants/design.ts

export const colors = {
  // Primary - Coral Red (action-oriented, warm and inviting)
  primary: {
    DEFAULT: '#FF6B6B',
    hover: '#FF5252',  // Slightly darker for hover
    shadow: 'rgba(255, 107, 107, 0.35)',  // For colored shadows
  },

  // Secondary - Teal Blue (secondary actions, complementary)
  secondary: {
    DEFAULT: '#14B8A6',
    hover: '#10A392',
    shadow: 'rgba(20, 184, 166, 0.1)',
  },

  // WhatsApp Special
  whatsapp: {
    DEFAULT: '#25D366',
    hover: '#1EBE59',
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

  // Text Colors (from landing page)
  text: {
    primary: '#111827',       // Near black - headings
    secondary: '#6B7280',     // Medium gray - body
    tertiary: '#9CA3AF',      // Light gray - labels, secondary
    muted: '#334155',         // Dark gray - footer
  },

  // Background Colors
  background: {
    white: '#FFFFFF',
    light: '#FAFAFA',        // Very light gray for sections
    dark: '#0F172A',         // Dark blue/black for footer
    black: '#111827',        // For CTA banner
  },

  // Border Colors
  border: {
    light: '#F0F0F0',        // Light gray for card borders
    default: '#E5E7EB',
    dark: '#1E293B',         // For footer separator
  },

  // Neutral (for reference)
  neutral: {
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
};
```

### Typography

**Font:** Plus Jakarta Sans (Google Fonts)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extra-bold)
- Fallbacks: system-ui, sans-serif
- Import: `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap`

**Scale:**
```css
/* Display - Hero text */
.display-hero: clamp(40px, 4.5vw, 62px) / 1.08  /* Main hero heading */
.display-section: clamp(26px, 3vw, 38px) / 1.2  /* Section titles */

/* Headings */
.h1: clamp(22px, 2.8vw, 34px) / 1.2            /* Page titles, CTA banner */
.h2: 20px / 1.4                                 /* Card titles, feature headings */
.h3: 17px / 1.4                                 /* Small card headings */

/* Body */
.body: 17px / 1.7                                /* Hero subtext, body text */
.body-sm: 15px / 1.65                            /* Feature descriptions */
.body-xs: 14px / 1.6                             /* Secondary body text */

/* Labels & UI */
.caption: 13px / 1                                /* Small labels, hints */
.label: 12px / 1                                 /* Badges, footers */
.label-sm: 11px / 1                              /* Small labels, step numbers */

/* Button Text */
.btn-lg: 16px / 1                                /* Large buttons */
.btn-default: 15px / 1                            /* Default buttons */
.btn-sm: 14px / 1                                /* Small buttons */

/* Nav Text */
.nav: 14px / 1                                   /* Navigation links */
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

### Border Radius (Modern, Rounded)

```typescript
export const borderRadius = {
  none: '0',           // For special cases (rare)
  sm: '4px',           // Minimal rounding (rare use)
  icon: '14px',        // Icon bubbles, small elements
  DEFAULT: '18px',     // Standard rounded corners
  card: '20px',        // Cards, feature cards
  lg: '24px',          // Large sections, containers
  xl: '28px',          // Extra large containers
  full: '100px',       // Buttons (pill shape), badges
};
```

**Rule:**
- Buttons: `100px` (pill shape)
- Cards: `20px` (default)
- Icon bubbles: `14px`
- Large sections: `28-32px`
- Badges: `100px` (pill shape)

### Shadows (Modern, Soft)

```typescript
export const shadows = {
  none: 'none',

  // Button shadows (colored, with lift effect)
  button: '0 4px 14px rgba(255, 107, 107, 0.35)',           // Primary button
  buttonHover: '0 6px 20px rgba(255, 107, 107, 0.4)',      // Primary button hover
  buttonSecondary: '0 4px 14px rgba(20, 184, 166, 0.2)',    // Secondary button

  // Card shadows (subtle, with colored tints)
  card: 'none',                                           // Default: no shadow, border only
  cardHover: '0 8px 32px rgba(255, 107, 107, 0.1)',        // Card hover with coral tint
  cardHoverSecondary: '0 8px 32px rgba(20, 184, 166, 0.1)', // Card hover with teal tint

  // Icon bubbles (colored shadow)
  iconBubble: '0 4px 12px rgba(255, 107, 107, 0.44)',       // Coral icon bubble

  // Large cards/mockups
  mockup: '0 20px 60px rgba(0, 0, 0, 0.08)',                // Phone mockup, large cards
};
```

**Rule:**
- Use colored shadows for buttons and hover states
- Cards have no default shadow (border only)
- Hover states get a lift effect with colored shadow
- Large components get subtle black shadows

---

## Component Specifications

### Button (Modern, Pill-Shaped)

**Variants:**
1. **Primary** - Coral red background, white text, pill-shaped (100px radius), colored shadow
2. **WhatsApp** - Green (#25D366) background, white text, pill-shaped, for WhatsApp actions
3. **Secondary** - Transparent or white background, coral border, coral text
4. **Ghost** - Transparent, no border, gray text

**Sizes:**
- `sm`: 32px height, 10px padding
- `default`: 40px height, 16px padding
- `lg`: 48px height, 24px padding

**States:**
- Hover: Background darkens slightly (FF6B6B → FF5252), lift effect (translateY(-1px)), shadow increases
- Active: Scale down slightly (0.98)
- Disabled: 50% opacity, no pointer events
- Loading: Spinner icon, disabled state

**Example:**
```svelte
<!-- Primary button (coral, pill-shaped) -->
<button class="bg-[#FF6B6B] hover:bg-[#FF5252] text-white
           rounded-full px-7 py-3.5 font-bold
           shadow-[0_4px_14px_rgba(255,107,107,0.35)]
           hover:shadow-[0_6px_20px_rgba(255,107,107,0.4)]
           hover:-translate-y-px
           transition-all duration-150">
  Get Started
</button>

<!-- WhatsApp button (green, pill-shaped) -->
<button class="bg-[#25D366] hover:bg-[#1EBE59] text-white
           rounded-full px-4 py-3 font-bold
           transition-colors duration-150">
  Notify all via WhatsApp
</button>

<!-- Ghost button -->
<a href="/about" class="text-gray-500 font-medium hover:text-gray-900
              transition-colors duration-150">
  About
</a>
```

### Badge (Status)

**Variants:**
- `pending`: Light yellow background (#FEF2F2), red text (#EF4444), or dark yellow for pending
- `submitted`: Light green background (#DCFCE7), green text (#16A34A), or light blue
- `paid`: Light green background (#DCFCE7), green text (#16A34A)
- `rejected`: Light red background (#FEF2F2), red text (#EF4444)

**Style:**
- Border radius: `full` (pill shape - 100px)
- Padding: 3px 10px or 5px 12px (depending on context)
- Font: Plus Jakarta Sans Bold, 11-12px
- Uppercase text (for labels), sentence case (for status)
- Background and text colors match (lighter bg, darker text)

**Example:**
```svelte
<!-- Status badge (paid) -->
<span class="px-[5px] py-[3px] rounded-full text-xs font-bold
            bg-[#DCFCE7] text-[#16A34A]">
  Paid
</span>

<!-- Status badge (pending) -->
<span class="px-[5px] py-[3px] rounded-full text-xs font-bold
            bg-[#FEF2F2] text-[#EF4444]">
  Pending
</span>

<!-- Label badge -->
<span class="px-[5px] py-[3px] rounded-[100px] bg-white border-[1.5px] border-[#F0F0F0]
            text-xs font-semibold text-gray-500">
  Automatic messages
</span>
```

### Card

**Style:**
- Background: White or gradient (for featured cards)
- Border: 1.5px solid #F0F0F0 (visible light border, no default shadow)
- Border radius: 20px (card) or 18px (small cards)
- Padding: 28px (default) or 32px (large)
- Hover: Border color changes to coral red, colored shadow, lift effect
- Icon bubbles: 48px × 48px, 14px border-radius

**Example:**
```svelte
<!-- Feature card -->
<div class="bg-white border-[1.5px] border-[#f0f0f0] rounded-[20px] p-7
           hover:border-[#ff6b6b] hover:shadow-[0_8px_32px_rgba(255,107,107,0.1)]
           hover:-translate-y-[2px]
           transition-all duration-200">
  <div class="w-12 h-12 rounded-[14px] bg-[#FF6B6B] flex items-center justify-center mb-4">
    <MessageCircle size={24} color="#fff" />
  </div>
  <h3 class="text-base font-bold text-gray-900 mb-2">Feature Title</h3>
  <p class="text-sm text-gray-500 leading-[1.65]">Description...</p>
</div>

<!-- Large featured card with gradient -->
<div class="bg-gradient-to-br from-[#FFF5F5] to-white rounded-[20px] p-8">
  <!-- Content -->
</div>
```

### Input

**Style:**
- Border: 2px solid gray-300
- Border radius: 8-12px (sm to default)
- Padding: 12px 16px
- Focus: Border coral red, subtle colored shadow or no shadow (clean look)
- Error: Border red-500
- Font: Plus Jakarta Sans Medium

**Example:**
```svelte
<input type="text"
       class="w-full border-2 border-gray-300 rounded-[8px]
              px-4 py-3 font-medium
              focus:border-[#FF6B6B] focus:outline-none
              placeholder:text-gray-400
              transition-colors duration-150"
       placeholder="Session name" />
```

### Toast

**Variants:**
- `success`: Light green background (#DCFCE7), green text (#16A34A)
- `error`: Light red background (#FEF2F2), red text (#EF4444)
- `warning`: Light yellow background (#FEF3C7), yellow text (#D97706)

**Style:**
- Position: Top center
- Border radius: 12px (lg)
- Padding: 16px
- Shadow: Subtle shadow
- Animation: Slide down (200ms)
- Auto-dismiss: 3 seconds

---

## Page Layouts

### Mobile-First Navigation

**Bottom Nav (5 items):**
1. **Home** - Dashboard icon
2. **Sessions** - List icon
3. **New** - Plus icon (coral red, larger, pill-shaped or rounded)
4. **Contacts** - Users icon
5. **Profile** - User icon

**Style:**
- Height: 64px
- Background: White
- Border top: 1.5px solid #F0F0F0 (light gray)
- Active: Coral red icon + label
- Inactive: Gray icon + label
- FAB (New button): Pill-shaped or rounded, coral red, elevated

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
┌─────────────────────────────────┐
│  Sticky Header (Logo + Nav)    │
├─────────────────────────────────┤
│  Hero Section                  │
│  - Animated headline           │
│  - Phone mockup card           │
│  - CTA button (pill)           │
├─────────────────────────────────┤
│  Why Letpai Section            │
│  - Section title               │
│  - Bento grid (WhatsApp + 4)  │
├─────────────────────────────────┤
│  How It Works Section          │
│  - Section title               │
│  - 3 step cards (connected)   │
├─────────────────────────────────┤
│  CTA Banner                    │
│  - Dark background             │
│  - CTA button (pill)           │
├─────────────────────────────────┤
│  Footer                        │
│  - Brand + links               │
│  - Gradient top accent         │
└─────────────────────────────────┘
```

**Hero Section:**
- Headline: "Split bills effortlessly with friends" (animated word-by-word, gradient text on last word)
- Subtext: "WhatsApp notifications included. No app needed for participants — just a link and they're done."
- CTA Button: "Get Started" (primary, coral red, pill-shaped, with shadow)
- Phone mockup: Interactive card showing session details with participants and WhatsApp button
- Redirects: Authenticated → /dashboard, Not auth → /login

**Why Letpai Section (Bento Grid):**
- Large card: WhatsApp Integration (coral icon bubble, feature description, tags)
- Small cards: Create in Seconds, Proof Upload, No App Needed, Real-time Dashboard
- Background: Light gray (#FAFAFA), rounded corners

**How It Works Section:**
- 3 step cards: Create Session → Send via WhatsApp → Track Payments
- Connected with gradient line
- Icon bubbles: Coral (step 1), Teal (steps 2-3)
- Step numbers: Small, uppercase, gray

**CTA Banner:**
- Dark background (#111827)
- Decorative circles (coral and teal tints)
- Text: "Ready to split your first bill?"
- CTA: "Get Started Free" (coral, pill-shaped, lift effect)

**Footer:**
- Dark blue background (#0F172A)
- Gradient top accent line (coral to teal)
- 4 columns: Brand, Product, Company, Legal
- Clean, organized layout

**Style:**
- Background: White (#FFFFFF) or light gray (#FAFAFA) for sections
- Typography: Plus Jakarta Sans (800 for headings, 500-700 for body)
- Icons: Lucide line icons (20-26px, coral red or teal accent)
- Buttons: Coral red primary, pill-shaped (100px), colored shadows, lift effect
- Cards: White background, 1.5px light border, 20px rounded corners
- Hover: Border color change, colored shadow, lift effect
- Responsive: Mobile-first (stack on mobile, grid on tablet/desktop)
- Max width: 1200px for content

### Session Card

**Content:**
- Session name (h3 or h2, bold, gray-900)
- Total amount (display style, bold, coral red or gray-900)
- Progress bar (coral or green fill, rounded)
- Status badge (top right, pill-shaped)
- Participant avatars (circular, overlapping)
- Payment status (e.g., "2/4 paid")

**Style:**
- Background: White
- Border: 1.5px solid #F0F0F0 (light gray)
- Border radius: 20px
- Padding: 24px
- Hover: Border color changes to coral red, colored shadow, lift effect
- Shadow: None by default, appears on hover

---

## Animation Guidelines

### Principles
- **Fast**: 150-200ms (smooth, not sluggish)
- **Intentional**: Every animation serves a purpose
- **Subtle**: Enhance UX without being distracting

### Transitions
```css
/* Default transition */
transition-all duration-150

/* Slower for modals/cards */
transition-all duration-200

/* Fastest for hover states */
transition-colors duration-100
```

### Micro-interactions
- **Button hover**: Background darkens (#FF6B6B → #FF5252), lift up (-2px), shadow increases
- **Button active**: Scale down (0.98)
- **Card hover**: Border color to coral, colored shadow appears, lift up (-2px)
- **Input focus**: Border color to coral
- **Hero words**: Animate in (slide up + fade in, staggered delay)
- **Toast enter**: Slide down from top
- **Modal open**: Fade in + scale (0.95 → 1)

---

## Development Phases

### Phase 1: Foundation (Week 1-2) ✅ PRIORITY

**Goal:** Complete design system + core auth flow + dashboard + create session

**Tasks:**
1. **Setup & Configuration**
    - [ ] Install dependencies: shadcn-svelte, lucide-svelte
    - [ ] Configure Tailwind with Plus Jakarta Sans + design tokens
    - [ ] Create design.ts constants file
    - [ ] Setup app.css with Tailwind v4 directives

2. **Base Components** (Customize shadcn-svelte)
    - [ ] Button (pill-shaped, colored shadows, lift effect)
    - [ ] Input (rounded, visible borders, clean focus)
    - [ ] Badge (pill-shaped status indicators)
    - [ ] Card (bordered, rounded, hover lift effect)
    - [ ] Toast (top-center, smooth)
    - [ ] Avatar (circular, modern)
    - [ ] Progress bar (rounded, bold colors)

3. **Layout Components**
    - [ ] Bottom navigation (mobile)
    - [ ] App shell (with bottom nav + auth check)
    - [ ] Auth layout (minimal, centered)

4. **Landing Page** ⭐
    - [ ] Hero section with animated headline
    - [ ] "Get Started" CTA button (coral red, pill-shaped, colored shadow)
    - [ ] Phone mockup card with session preview
    - [ ] Why Letpai section (bento grid)
    - [ ] How It Works section (3 step cards with connector)
    - [ ] CTA banner (dark background)
    - [ ] Footer with gradient accent
    - [ ] Smart redirect logic (authenticated → dashboard, not auth → login)
    - [ ] Modern, polished styling
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

feat(auth): add login page with modern styling
fix(button): correct hover state color and lift effect
style(card): use visible borders and hover lift effect
refactor(api): add error interceptor
```

---

## Questions for Future Consideration

1. **Dark Mode**: Save for Phase 5, but keep it in mind when designing components (use CSS variables)
2. **Modern Design Elements**:
    - Soft, colored shadows with lift effects
    - Rounded corners (14-24px for cards, 100px for buttons)
    - Pill-shaped buttons and badges
    - Subtle border (1.5px) on cards
3. **FAB Color**: Coral red (primary action color)
4. **Landing Page**: Redirect root to `/login` if not authenticated, `/dashboard` if authenticated
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
- [Linear App](https://linear.app) - Modern, clean, polished
- [Stripe Dashboard](https://stripe.com) - Clean data visualization
- [Vercel Dashboard](https://vercel.com) - Modern aesthetic
- [Notion](https://notion.so) - Clean typography and spacing

### Component Libraries
- [shadcn-svelte](https://www.shadcn-svelte.com/) - Base components
- [Lucide Icons](https://lucide.dev/) - Icon reference

### Typography
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) - Google Fonts

---

## Next Steps (When Ready to Implement)

1. Run dependency installation commands
2. Configure Tailwind with design tokens
3. Create AGENTS.md with this plan
4. Start Phase 1 tasks

---

**Document Status:** ✅ Complete - Ready for implementation  
**Last Updated:** March 27, 2026
