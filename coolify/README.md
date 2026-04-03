# Coolify deployment (AfriStore)

AfriStore deploys as **2 services** plus MongoDB:
- Backend (`backend`, Next.js API) on port `3001`
- Web (`apps/web`, Next.js storefront) on port `3000`
- MongoDB (Atlas or managed database)

## Important env rule

This project now uses only service-level env files:
- `backend/.env`
- `apps/web/.env`

Do **not** rely on repo root `.env` for deployment.

## Service setup in Coolify

| Service | Build context | Dockerfile | Exposed port |
|---|---|---|---|
| Backend | `backend` | `backend/Dockerfile` | `3001` |
| Web | `apps/web` | `apps/web/Dockerfile` | `3000` |

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

### Web (`apps/web/.env`)
- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- `NEXT_PUBLIC_STORE_BASE=shop.yourdomain.com`

## Build reference (local parity)

```bash
docker build -t afristore-backend -f backend/Dockerfile backend
docker build -t afristore-web -f apps/web/Dockerfile apps/web \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --build-arg NEXT_PUBLIC_STORE_BASE=shop.yourdomain.com
```

## Post-deploy

Run seeding once after first backend deploy (if templates are missing):

```bash
npm run db:seed -w backend
```

`NEXT_PUBLIC_API_URL` must be the public HTTPS backend URL (no trailing slash).
