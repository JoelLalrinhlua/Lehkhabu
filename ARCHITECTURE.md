# Lehkhabu — Project Architecture Notes

## Monorepo Structure

```
LehkhabuX/
├── frontend-admin/   React/Vite — Admin dashboard (Supabase-driven)
├── frontend-user/    React/Vite — User-facing app   (Supabase-driven)
├── backend-api/      Python/FastAPI — REST API (kept for future use / not currently called by frontends)
├── backend-ai/       Python/FastAPI — AI service (Phase 2 skeleton, not yet active)
└── shared/           Shared type definitions & utilities
```

## Data Layer

Both frontends communicate **directly with Supabase** (PostgreSQL + Auth + Storage + Realtime).

- No backend-api requests are made by either frontend in the current architecture.
- `backend-api/` is production-quality and security-hardened (JWT auth, rate limiting, CORS),
  but is currently **not deployed**. It exists for future REST API use cases (e.g. server-side
  payment webhook handling, heavy computation, third-party integrations).
- `backend-ai/` is a Phase 2 skeleton for AI-powered features (recommendations, summarization).

## Running Locally

```
# Admin dashboard
cd frontend-admin && npm run dev     # http://localhost:5174

# User app
cd frontend-user  && npm run dev     # http://localhost:5173
```

## Key Environment Variables

Both frontends require a `.env` file:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Security Architecture

- **Admin access** is gated by the `admin_accounts` table — NOT by `users.role`.
  Any user with a matching active email in `admin_accounts` is granted admin UI access.
- **Author roles** are set server-side via the `admin_set_user_role` Supabase RPC function
  to prevent client-side role escalation.
- **RLS** is enabled on all tables. Admin UI queries work via the anon key because
  the `users` table has a public SELECT policy (`qual: true`).
