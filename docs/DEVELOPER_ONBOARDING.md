# AfriStore — developer onboarding

Monorepo layout:

- `backend/` — **Next.js** app serving **REST API** via Route Handlers (`/api/*`), Mongoose + **MongoDB**, JWT auth, payments webhooks, OpenAI helpers.
- `apps/web` — Next.js merchant UI + storefront (`/s/[slug]`).
- `packages/shared` — optional shared types.

## Prerequisites

- Node.js 20+
- Docker (for local MongoDB) or a MongoDB Atlas / hosted URI

## Local setup

1. Environment files:

   - **Root `.env`** — `DATABASE_URL`, `JWT_SECRET`, `OPENAI_*`, optional `BLOB_READ_WRITE_TOKEN`. Copy from `.env.example` and fill secrets.
   - **`npm run dev`** loads root `.env` automatically (via `dotenv-cli`) so the backend and web inherit the same secrets.
   - **`backend/.env`** — non-secret defaults (port, CORS). Keep `DATABASE_URL` here too if you run the backend without the monorepo root.
   - **`apps/web/.env`** — `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3001`) and `NEXT_PUBLIC_STORE_BASE`.

   ```bash
   cp .env.example .env
   cp apps/web/.env.example apps/web/.env
   ```

2. Start MongoDB:

   ```bash
   docker compose up -d mongo
   ```

3. Set `DATABASE_URL` in root `.env` (e.g. `mongodb://127.0.0.1:27017/afristore` or Atlas `mongodb+srv://...`).

4. Seed **50 templates** (MongoDB creates collections on first write; no separate schema push):

   ```bash
   npm run db:seed
   ```

5. Run backend + web:

   ```bash
   npm run dev
   ```

   - **Backend API**: http://localhost:3001/api (e.g. http://localhost:3001/api/health)
   - **Web**: http://localhost:3000

6. Ensure `apps/web/.env` has `NEXT_PUBLIC_API_URL=http://localhost:3001`.

## Architecture notes

- **Money fields**: Prices and order totals are stored as numbers (`Number` in Mongoose). For strict currency math, add a library at the application layer.
- **API surface**: Same paths as before (`/api/auth/login`, `/api/stores`, …) — only the server implementation moved from Nest to Next Route Handlers.
- **Payments**: Paystack webhook verifies the raw body and `x-paystack-signature`.
- **Coolify**: Deploy `backend` and `apps/web` as separate services; see `coolify/README.md`.

## CI

`.github/workflows/ci.yml` runs against MongoDB, seeds templates, and builds both packages.
