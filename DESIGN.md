# Letpai design: Ink & Receipt

The one source of truth for how Letpai looks, reads and behaves. Tokens live in
`src/lib/constants/design.ts` and are mirrored in the `@theme` block of
`src/app.css`; `tests/unit/tokens.test.ts` fails if they drift. Copy rules
live in [`docs/VOICE.md`](docs/VOICE.md). The reasoning behind the
direction is in [`design/BRIEF.md`](design/BRIEF.md) and
[`design/DECISION.md`](design/DECISION.md).

## The idea

Letpai is the friend who booked the table and is now, politely, collecting.
The interface is a calm navy-ink tool on a cool fog canvas. It has one loud colour
(coral, for the next action and money still owed) and one signature object:
the **torn receipt**. It should feel like a well-made receipt, not a SaaS dashboard.

## Principles

1. **Money first.** Every host screen leads with how much is still owed and by whom.
   Amounts use `text-amount` and `formatIDR` (`Rp 1.176.915`).
2. **One next action per screen.** Coral marks it. Everything else is ink, secondary or ghost.
3. **Space separates, lines don't.** Sections are split by surface level (fog → card → mist)
   and spacing. Hairlines only divide rows inside a list card (`divide-mist`).
4. **Show the person.** Names, initials avatars and formatted numbers
   (`formatWhatsappDisplay`, `+62 812-3456-7890`) instead of ids or raw digits.
5. **Say what happens next.** Empty, error and expired states explain the situation
   and offer the way out (retry, add, ask the host).
6. **Never decorate with the signature.** The perforated edge appears only on bill
   breakdowns, the logo and OG images. Lime appears at most once per screen (the Paid stamp).

## Colour

| Role | Token | Use |
| --- | --- | --- |
| Canvas | `fog` `#eff0f4` | Page background |
| Surface | `card` `#ffffff` | Cards, sheets, inputs |
| Inset | `mist` `#e3e5ed` | Identity panels, chips, skeletons, row dividers |
| Hairline | `hairline` `#d3d7e3` | Field outlines (as inset shadows), outline buttons |
| Text | `ink` `#1d2442` / `ink-soft` `#5d627e` | Body / secondary text |
| Link | `steel` `#3a5088` | Text links, focus rings |
| Accent | `coral` `#cf3a31`, `coral-ink`, `coral-tint` | Primary action, money owed, eyebrows |
| Highlight | `lime` `#d4f25c` | The Paid stamp only |
| Status | `pending`, `review`, `paid`, `rejected` (+ `-tint`) | Text on its tint, via `StatusPill` |
| WhatsApp | `whatsapp`, `chat-bg`, `chat-out` | WhatsApp actions and message previews |

Rules:

- No hex values in components. `tests/unit/hex-guard.test.ts` enforces it.
- Contact-group colours are user data (`groupColors`). They only ever paint a dot; text stays `ink-soft`.
- Status tones come from `src/lib/utils/status.ts`, never inline.

## Type

- **Display:** Bricolage Grotesque Variable, via `text-poster` (page titles on the host app and marketing).
- **UI:** Plus Jakarta Sans 400–800.
- Utilities in `app.css`: `text-poster`, `text-heading` (section and admin titles),
  `text-amount` (tabular money), `text-eyebrow` (small caps labels).
- Numbers that line up (money, phone numbers, counts) get `tabular-nums`.

## Shape and depth

| Token | Value | Use |
| --- | --- | --- |
| `rounded-field` | 12px | Inputs, menu items, inline notices |
| `rounded-card` | 16px | Cards and list cards |
| `rounded-sheet` | 24px | Modals, bottom sheets, identity panels, floating bars |
| `rounded-pill` | full | Buttons, chips, filters, tags |
| `shadow-raised` | ambient | Cards resting on fog |
| `shadow-float` | lifted | Hovered cards, auth card, tab bar |
| `shadow-pop` | floating | Menus, dialogs, the bulk-action bar |

All shadows are tinted with ink. Never pure black.

## Layout

- Mobile first. Check at 375px and 1280px.
- **Host app** (`(app)`): fog sidebar on desktop, a floating bottom tab bar on mobile, content at
  `max-w-2xl`–`max-w-4xl`, page titles in `text-poster`.
- **Admin** (`/admin`): an ink rail on desktop and an ink top bar with pill nav on mobile, so it never
  reads as the host app. Denser: `text-heading` titles, `max-w-5xl`.
- **Guests** (`/payment/*`): no marketing navbar, one receipt, three steps.
- Sticky filter bars sit on `bg-fog/95` with a backdrop blur.

## Components

Use these before writing markup. Each is demonstrated at `/dev/styleguide`
(set `LETPAI_STYLEGUIDE=1` outside dev).

| Need | Component |
| --- | --- |
| Actions | `ui/Button` (`primary` coral, `ink`, `secondary`, `ghost`, `destructive`, `whatsapp`; `href` makes it a link) |
| Overflow actions | `ui/Menu` (keyboard support, `side="top"` near the bottom edge) |
| Status | `ui/StatusPill` with a tone from `utils/status` |
| Fields | `ui/Input`, `ui/PhoneInput`, `ui/AmountInput`, `ui/OtpInput`, `ui/SearchInput`, `ui/Checkbox` (takes a row as children), `ui/Segmented` |
| Filters | `ui/Tabs` (pill filter with counts) |
| Dialogs | `ui/Modal` (sheet on mobile), `ui/ConfirmDialog`, `ui/RejectReasonModal`; never `window.confirm` |
| Feedback | `toast()` from `stores/toast` naming the person or thing; `ui/EmptyState` with art or an icon |
| Lists | A `Card padding="none"` or `<ul class="divide-y divide-mist rounded-card bg-card shadow-raised">` with rows `px-4 py-3 sm:px-5` |
| Art | `components/art` (receipt, satay, phone, coin, helmet, Paid stamp): flat, palette-only, `aria-hidden` |
| Account rows | `account/AccountGroup` + `account/AccountRow` |
| Admin | `admin/AdminHeader`, `admin/AdminAuthCard` |
| Legal | `legal/LegalPage` |

## Interaction

- 150–200 ms transitions. Buttons `active:scale-[0.98]`.
- Every interactive element has a visible `focus-visible` outline in `steel`.
- Touch targets are at least 44px (`min-h-11`, or 36–40px icons inside a 44px row).
- Destructive actions confirm in a dialog that names the thing, and say what survives
  ("They'll stay in past sessions").
- Server-rendered first paint: read user data from layout data during SSR, not only the client store.

## Brand assets

- Logo: the torn ticket, `layout/Logo` (`tone="light"` on ink).
- OG images and icons: `PW_CHANNEL=chrome node scripts/render-brand.mjs` renders `static/og/*.png`.
- Payment links use generic `noindex` SEO so WhatsApp previews never leak names or amounts.

## Checks

```bash
corepack pnpm check                 # types and Svelte diagnostics
npx vitest run                      # unit + component tests, token and hex guards
./tests/serve.sh                    # build, start mock API (:3000) and app (:4173)
PW_CHANNEL=chrome npx playwright test   # e2e on mobile (375) and desktop (1280)
```

Screenshots from the e2e run land in `tests/screenshots/current/{mobile,desktop}`.
