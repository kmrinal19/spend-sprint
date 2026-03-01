# SpendSprint

Personal expense tracker — an offline-first PWA built with SvelteKit.

Parses Indian bank SMS from the clipboard, supports natural language input ("1.5k swiggy"), and stores everything on-device using IndexedDB. No cloud, no accounts, no subscriptions.

## Features

- **Clipboard SMS parsing** — paste bank SMS (HDFC, SBI, UBI, Axis, ICICI) and auto-extract amount, merchant, payment method
- **Natural language input** — type "500 swiggy" or "1.5k groceries yesterday"
- **Offline-first** — works entirely without internet, all data stays on-device
- **Dashboard** — category breakdown, spending trends, budget tracking, top merchants
- **Dark/light theme** — system-aware with manual toggle

## Tech Stack

- [SvelteKit](https://svelte.dev/) (Svelte 5) with static adapter
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- [Vite PWA](https://vite-pwa-org.netlify.app/) for service worker
- TypeScript

## Getting Started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run unit tests |
| `pnpm check` | Svelte/TypeScript type check |

## License

MIT
