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

## Storefront subdomains (`slug.yourdomain.com`)

**Do not** add `https://*.yourdomain.com` or `http://*.yourdomain.com` in Coolify **Domains** for the web app. Coolify generates Traefik rules with `Host(\`*.domain\`)`, which Traefik v3 rejects for TLS (`HostSNI` error), and Let’s Encrypt **HTTP-01** cannot issue wildcard certificates — you get 503 / “no available server”.

**Correct Coolify setup (web service):**

1. **Domains:** only the apex, e.g. `https://acetchapp.link` (no `*.…` entry).
2. **Direction:** keep **Allow www & non-www** (or whatever you use for the apex).
3. **Redeploy** so the image includes the Traefik `LABEL`s from `apps/web/Dockerfile` — they add a `HostRegexp` router for `*.acetchapp.link` (excludes `api` and `coolify` hosts) with TLS and no broken wildcard ACME.

**Cloudflare:** SSL mode **Full** (not Strict) is fine — the origin can use Traefik’s default certificate for that router.

**If you added a manual file** under `/data/coolify/proxy/dynamic/` for wildcards earlier, remove it to avoid duplicate routers, then `docker restart coolify-proxy`.

**Other apex domains:** edit the `traefik.http.routers.afristore-wildcard.rule` `LABEL` in `apps/web/Dockerfile` so the host matches `NEXT_PUBLIC_STORE_BASE`.

**Server (Coolify → Servers → localhost → General):** set **Wildcard Domain** to `acetchapp.link` only — **no** `https://` prefix (that field expects a hostname, not a URL).

### Still “no available server” on `https://slug.yourdomain.com`?

1. **Redeploy the web app** with a **full rebuild** (not “use cached image”) so the latest `apps/web/Dockerfile` `LABEL`s are in the image.
2. On the server: `docker inspect <web-container-name> --format '{{json .Config.Labels}}'` and confirm keys like `traefik.http.routers.afristore-wildcard.rule` exist. If they are **missing**, Coolify did not inherit image labels — open **Advanced → Custom Docker Labels** for the web service and paste the lines from `coolify/traefik-wildcard-labels.txt` (edit the domain if needed), then redeploy.
3. **DNS:** `*.acetchapp.link` must resolve to the same server as the apex.
4. `docker logs coolify-proxy --tail 30` — look for Traefik errors about `HostSNI` or duplicate routers.
