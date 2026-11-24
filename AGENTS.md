# AGENTS.md - Letpai frontend

Guidance for AI agents (and people) working in this repository.

## Project

Letpai splits bills and collects the money over WhatsApp. A host creates a session, adds people and
bill items, and Letpai sends each person their share with a payment link. Guests upload a transfer
screenshot; the host approves it or sends it back. Audience: 18–30 year olds in Indonesia. UI language:
English.

## Read first

1. **[`DESIGN.md`](DESIGN.md)**: the design system ("Ink & Receipt"): principles, tokens, layout, components, checks.
2. **[`docs/VOICE.md`](docs/VOICE.md)**: how Letpai writes, and the status vocabulary.
3. **Tokens:** `src/lib/constants/design.ts`, mirrored in the `@theme` block of `src/app.css`. Change both together.
4. **API:** `~/projects/letpai-backend/docs/swagger.yaml` and `~/projects/letpai-backend/docs/FRONTEND_INTEGRATION_GUIDE.md`.
   The backend contract is fixed from the frontend's side; adapt the UI, not the API.
5. **Features:** `docs/FEATURES.md`.

Use the Context7 MCP server for current SvelteKit, Svelte 5, Tailwind v4 and Playwright docs.

## Stack

- SvelteKit 2 with `adapter-node`, Svelte 5 in runes mode, TypeScript.
- Tailwind CSS v4 (tokens via `@theme`), `cn()` in `src/lib/utils/cn.ts` (tailwind-merge aware of our token names).
- Fonts: Bricolage Grotesque Variable (display) and Plus Jakarta Sans (UI), self-hosted via `@fontsource`.
- Icons: `lucide-svelte` only, 2px stroke. No emoji in the UI.
- Data: SvelteKit `load` functions and form actions call `src/lib/services/*`. TanStack Query is installed
  (`src/lib/queryClient.ts`) but pages don't use it today.
- Tests: Vitest + Testing Library (jsdom), Playwright e2e against a mock API.
- Package manager: pnpm (run as `corepack pnpm` if `pnpm` isn't on PATH).

## Routes

```
src/routes/
├── +page.svelte, about/          Marketing (public navbar)
├── (auth)/                       login, register (with OTP), forgot-password
├── (app)/                        Signed-in host app: sidebar (desktop) + bottom tab bar (mobile)
│   ├── dashboard/                Money still owed, sessions that need you
│   ├── sessions/                 List; new/ (two steps); [id]/ (queue + receipt); [id]/participants/[participantId]/
│   ├── contacts/                 Address book, groups, import, bulk actions
│   ├── profile/                  Identity; doubles as the "What do friends call you?" step for new accounts
│   └── settings/
├── payment/[token]/              Public guest payment page (no navbar, noindex)
├── admin/                        Control panel with its own ink chrome: login, setup, overview,
│                                 whatsapp, templates, admins (super admin), profile
├── dev/styleguide/               Component gallery (dev, or LETPAI_STYLEGUIDE=1)
└── +error.svelte
```

`src/lib/`: `components/{ui,art,layout,session,contacts,account,admin}`, `services/` (API calls and
pure list helpers), `stores/` (auth, toast), `utils/` (format, phone, status, seo, admin), `types/api.ts`,
`constants/design.ts`.

## Conventions

- **Runes only:** `$props`, `$state`, `$derived` (writable deriveds for optimistic lists), `$effect` sparingly.
  `$app/state` over `$app/stores` in new code.
- **Tokens, not values.** Use `bg-fog`, `text-ink`, `rounded-card`, `shadow-raised` and friends. Hex values in
  components fail `tests/unit/hex-guard.test.ts`.
- **Reuse primitives** from `src/lib/components/ui` (see the table in `DESIGN.md`). No `window.confirm`/`prompt`.
- **Copy** follows `docs/VOICE.md`; status labels come from `src/lib/utils/status.ts`.
- **Phone numbers** are stored as digits with country code (`6281234567890`). Show them with
  `formatWhatsappDisplay`, link with `whatsappChatLink`, validate with `validateWhatsappNumber`.
- **Money** is shown with `formatIDR`.
- **SSR first paint:** read the user from layout data (`page.data.user`) during SSR; the auth store fills on the client.
- **Accessibility:** a visible focus style on every control, 44px touch targets, labelled icon buttons,
  `aria-hidden` art, `role="alert"` for errors.
- **Mobile first.** Check 375px and 1280px.
- **CSP** is configured in `svelte.config.js` (`kit.csp`). Don't add inline scripts or handlers; don't
  spread rest props onto `<img>` (SSR adds inline handlers the CSP blocks).

## Commands

```bash
corepack pnpm dev            # http://localhost:5173
corepack pnpm build
corepack pnpm check          # svelte-check, must be 0 errors / 0 warnings
npx vitest run               # unit + component tests
./tests/serve.sh             # build + mock API on :3000 + app on :4173
PW_CHANNEL=chrome npx playwright test [file] --reporter=line
```

The mock API (`tests/mock-api.ts`, fixtures in `tests/fixtures/data.ts`) is stateful; e2e tests call
`resetApi()` before each test. Sign in with `loginAs(context, 'host' | 'empty' | 'admin' | 'broken')`
from `tests/e2e/helpers.ts`. `broken` makes data endpoints return 503 for error states.

## Environment

```bash
# .env.local
VITE_API_URL=http://localhost:3000/api/v1
```

## Commits

Conventional Commits (`feat(scope): subject`, imperative, lower case, no trailing period). Run
`check`, Vitest and the relevant Playwright specs before committing.
