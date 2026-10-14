# Hotel SaaS Frontend

A multi-tenant hotel management SaaS platform frontend built with [Next.js](https://nextjs.org), [shadcn/ui](https://ui.shadcn.com), and [Redux Toolkit Query](https://redux-toolkit.js.org/rtk-query/overview).

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, Turbopack)
- **UI**: shadcn/ui (Base UI primitives) + Tailwind CSS 4 + Lucide icons
- **Data fetching**: RTK Query (Redux Toolkit) with tag-based cache invalidation
- **Forms**: react-hook-form + zod validation
- **Auth**: JWT stored in cookies (`auth_token`), tenant context in cookies (`tenant_context`)
- **State**: Redux Toolkit (auth + tenant slices)
- **Theming**: next-themes (light/dark/system)

## Project Setup

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend proxies `/api/v1/*` to the backend (see `next.config.ts` rewrites), so no CORS setup is needed in development.

## Environment Variables

```env
# API base URL. Use "/api/v1" to go through the Next.js proxy,
# or an absolute URL (requires the backend to enable CORS).
NEXT_PUBLIC_API_BASE_URL=/api/v1

# Cookie names (defaults shown)
NEXT_PUBLIC_AUTH_TOKEN_COOKIE=auth_token
NEXT_PUBLIC_TENANT_COOKIE=tenant_context
```

## Architecture

```
app/
├── (public)/          # Unauthenticated routes (login, register)
├── (private)/         # Authenticated routes (dashboard, rooms, bookings, tenants)
│   └── layout.tsx     # App shell with sidebar + auth guard
├── layout.tsx         # Root layout (providers, theme, fonts)
components/
├── ui/                # shadcn/ui components (Base UI primitives)
├── auth/              # Login / register forms
├── app-sidebar.tsx    # Desktop sidebar + mobile nav + user menu
├── tenant-switcher.tsx# Hotel (tenant) context switcher
└── stat-card.tsx
features/
├── api/               # RTK Query endpoints (auth, tenants, rooms, bookings)
├── auth/              # Auth slice + AuthProvider (session restore via GET /auth/me)
└── tenant/            # Tenant context slice (persisted to cookie)
hooks.ts               # useAppDispatch / useAppSelector
lib/                   # Cookie helpers + formatting utilities
store.ts               # Redux store (api + auth + tenant)
types/models.ts        # Shared TypeScript interfaces
```

### Key patterns

- **Token in cookies**: `lib/cookies.ts` reads/writes the JWT. The RTK Query `baseQuery` injects `Authorization: Bearer <token>` and `x-tenant-id` headers on every request from cookies.
- **Session restore**: on mount, `AuthProvider` calls `GET /api/v1/auth/me` when a token cookie exists. Expired/invalid tokens are cleared automatically.
- **Tenant context**: the current hotel is stored in Redux and mirrored to the `tenant_context` cookie. All room/booking queries are scoped by the `x-tenant-id` header.
- **Forms**: every form uses `react-hook-form` with `zodResolver` and a zod schema that mirrors the backend DTO validation.
- **Toasts**: `ToastProvider` exposes a `useToast()` hook for success/error feedback on mutations.

## Available Scripts

```bash
pnpm dev       # Start dev server (Turbopack)
pnpm build     # Production build
pnpm start     # Start production server
pnpm lint      # ESLint
```

## API

See the [backend README](../hotel-saas-backend/README.md) for the full endpoint reference. The frontend consumes:

| Endpoint | Used by |
|----------|---------|
| `POST /auth/register` | Register page |
| `POST /auth/login` | Login page |
| `GET /auth/me` | Session restore |
| `GET/POST /tenants` | Hotels page, tenant switcher |
| `GET/POST/PATCH/DELETE /rooms` | Rooms page, booking form |
| `GET/POST /bookings`, `PATCH /bookings/:id/cancel` | Bookings page, dashboard |

