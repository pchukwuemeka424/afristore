# Coolify deployment (AfriStore)

AfriStore deploys as **2 services** plus MongoDB:
- Backend (`backend`, Next.js API) on port `3001`
- Frontend (`frontend`, Next.js storefront) on port `3000`
- MongoDB (Atlas or managed database)

There are **no Dockerfiles in this repo**. Use **Nixpacks** (or equivalent Node build) for both apps on Coolify.

## Important env rule

Use service-level env files:
- `backend/.env`
- `frontend/.env`

## Service setup in Coolify

| Service | Base directory | Build | Exposed port |
|---|---|---|---|
| Backend | `backend` | **Nixpacks** | `3001` |
| Frontend | `frontend` | **Nixpacks** | `3000` |

### Backend (Nixpacks / Node)

1. **Build pack:** **Nixpacks** (Coolify default).
2. **Base directory:** **`backend`**.
3. **Port / env:** **Network** port **`3001`** and **`PORT=3001`** in environment variables.
4. **Build / start:** **`npm run build`**, then **`npm start`** (uses `node scripts/start-prod.cjs` for `output: 'standalone'`).
5. **Healthcheck:** `http://127.0.0.1:3001/health` — plain URL only.

Do **not** use **`next start`** as the production command; use **`npm start`** after a build.

### Frontend (Nixpacks / Node)

1. **Build pack:** **Nixpacks**.
2. **Base directory:** **`frontend`**.
3. **Build-time env:** set **`NEXT_PUBLIC_API_URL`** and **`NEXT_PUBLIC_STORE_BASE`** in Coolify (same values as `frontend/.env`).
4. **Port / env:** **Network** port **`3000`** and **`PORT=3000`** if needed.
5. **Build / start:** **`npm run build`**, then **`npm start`** (or whatever Nixpacks detects for Next.js).

### Subdomain routing (`slug.yourdomain.com`)

Coolify’s wildcard domain entries can break Traefik v3 TLS. Use **apex-only** in **Domains** (e.g. `https://acetchapp.link`, no `*.…`).

Add Traefik routing via **Coolify → frontend service → Advanced → custom labels** (field name may say “Docker labels” in the UI). Copy from **`frontend/coolify/traefik-wildcard-labels.txt`** and edit the domain to match **`NEXT_PUBLIC_STORE_BASE`**.

If subdomains still return 503, confirm those labels are present on the running service and that DNS `*.yourdomain` points at the server.

### Backend: “No available server” / unhealthy

1. **Port** — **`PORT`** and Coolify **Network** port must match (usually **`3001`** for the API).
2. **Healthcheck** — `http://127.0.0.1:3001/health` (plain URL; fix any garbled field in the UI).
3. **Bind address** — production launcher sets **`HOSTNAME=0.0.0.0`**; if you bypass it, ensure the process listens on all interfaces.

## Required environment variables

### Backend (`backend/.env`)
- `DATABASE_URL=mongodb+srv://...` (Atlas URI)
- `JWT_SECRET=<long-random-secret>`
- `CORS_ORIGIN=https://shop.yourdomain.com`
- `STORE_BASE_DOMAIN=shop.yourdomain.com`

Optional backend integrations:
- `PAYSTACK_SECRET_KEY`
- `COOLIFY_API_URL`, `COOLIFY_TOKEN`, `COOLIFY_PROJECT_UUID`, `COOLIFY_ENVIRONMENT_UUID`
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `DNS_CNAME_TARGET`

### Frontend (`frontend/.env`)
- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- `NEXT_PUBLIC_STORE_BASE=shop.yourdomain.com`

## Build reference (local)

From the **repository root**:

```bash
npm run build -w backend && npm run start -w backend
npm run build -w frontend && npm run start -w frontend
```

## Post-deploy

Run seeding once after first backend deploy (if templates are missing):

```bash
npm run db:seed -w backend
```

`NEXT_PUBLIC_API_URL` must be the public HTTPS backend URL (no trailing slash).

## Cloudflare / TLS

For the wildcard router, **SSL mode Full** (not Strict) is often enough when the origin uses Traefik’s certificate for that route.

**Server (Coolify → Servers):** **Wildcard Domain** should be the hostname only (e.g. `acetchapp.link`), not a full `https://` URL.
