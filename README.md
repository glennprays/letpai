# Letpai

> Split bills with friends via WhatsApp

Letpai is a bill splitting app that integrates with WhatsApp for seamless payment notifications and reminders. Create a session, add bill items, assign participants, and let everyone know what they owe — all through WhatsApp.

## Features

- **Auth** — WhatsApp number + OTP login, JWT sessions
- **Sessions** — Create bill-splitting sessions with multiple bill items
- **Smart Splits** — Per-item service charge & tax breakdown, fee-aware calculations
- **Contacts** — Manage contacts, create groups, bulk import
- **WhatsApp Notifications** — Payment reminders, session invites, per-participant messages
- **Public Payment Page** — Shareable payment links with bank details & proof upload
- **Admin Panel** — Team management, WhatsApp gateway control, template testing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2 |
| UI | Svelte 5 (runes mode) |
| Styling | Tailwind CSS v4 |
| State | TanStack Query (Svelte) |
| Language | TypeScript |
| Package Manager | pnpm |
| Deployment | Docker (adapter-node) |

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+

### Setup

```bash
# Clone
git clone https://github.com/glennprays/letpai.git
cd letpai

# Install
pnpm install

# Configure
cp .env.example .env.local
# Edit .env.local with your backend API URL

# Run
pnpm dev
```

### Docker

```bash
docker build -t letpai-frontend .
docker run -p 4001:3000 letpai-frontend
```

## Project Structure

```
src/
├── routes/           # SvelteKit file-based routing
│   ├── (app)/       # Authenticated pages
│   ├── (auth)/      # Login, Register, OTP
│   ├── (admin)/     # Admin panel
│   └── payment/     # Public payment page
├── lib/
│   ├── components/  # Reusable UI components
│   ├── services/    # API clients
│   ├── stores/      # Svelte stores
│   ├── types/       # TypeScript types
│   └── utils/       # Helpers (format, validation)
```

## License

Private — © 2025 Glenn Pray
