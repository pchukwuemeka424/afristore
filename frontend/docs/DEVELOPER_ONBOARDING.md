# AfriStore — developer onboarding

Monorepo layout:

- `backend/` — **Next.js** app serving **REST API** via Route Handlers (`/api/*`), Mongoose + **MongoDB**, JWT auth, payments webhooks, OpenAI helpers.
- `frontend/` — Next.js merchant UI + storefront (`/s/[slug]`).
- `frontend/shared` — optional shared types.

## Prerequisites

- Node.js 20+
- MongoDB — **Atlas** (recommended) or a local **mongod** install

## Local setup

1. From the **repository root**, install dependencies:

   ```bash
   npm install
   ```

2. Environment files:

   - **`backend/.env`** — `DATABASE_URL`, `JWT_SECRET`, and other server secrets (see `backend/.env` or examples in repo).
   - **`frontend/.env`** — `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3001`) and `NEXT_PUBLIC_STORE_BASE`.

   ```bash
   cp frontend/.env.example frontend/.env
   ```

3. Set `DATABASE_URL` in **`backend/.env`** (Atlas `mongodb+srv://...` or local `mongodb://127.0.0.1:27017/afristore`).

4. Seed **50 templates** (MongoDB creates collections on first write; no separate schema push):

   ```bash
   npm run db:seed
   ```

5. Run backend + frontend:

   ```bash
   npm run dev
   ```

   - **Backend API**: http://localhost:3001/api (e.g. http://localhost:3001/api/health)
   - **Web**: http://localhost:3000

6. Ensure `frontend/.env` has `NEXT_PUBLIC_API_URL=http://localhost:3001`.

## Architecture notes

- **Money fields**: Prices and order totals are stored as numbers (`Number` in Mongoose). For strict currency math, add a library at the application layer.
- **API surface**: Same paths as before (`/api/auth/login`, `/api/stores`, …) — only the server implementation moved from Nest to Next Route Handlers.
- **Payments**: Paystack webhook verifies the raw body and `x-paystack-signature`.
- **Coolify**: Deploy `backend` and `frontend` as separate services; see `frontend/coolify/README.md`.

## CI

`.github/workflows/ci.yml` runs against MongoDB, seeds templates, and builds both packages.
