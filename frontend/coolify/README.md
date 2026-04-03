# Coolify deployment (AfriStore)

AfriStore deploys as **2 services** plus MongoDB:
- Backend (`backend`, Next.js API) on port `3001`
- Frontend (`frontend`, Next.js storefront) on port `3000`
- MongoDB (Atlas or managed database)

## Important env rule

Use service-level env files:
- `backend/.env`
- `frontend/.env`

## Service setup in Coolify

| Service | Build context | Dockerfile | Exposed port |
|---|---|---|---|
| Backend | repository root | `backend/Dockerfile` | `3001` |
| Frontend | repository root | `frontend/Dockerfile` | `3000` |

### Backend: logs still show `next start` or standalone warning

That output means the container is **not** using the image `CMD` (`node scripts/start-prod.cjs`). Fix **all** of the following on the **backend** service:

1. **Build pack:** **Dockerfile** (Coolify defaults to Nixpacks — switch it).
2. **Base directory:** **`/`** (repo root). The Dockerfile copies the monorepo root; a base of `/backend` alone will not match this Dockerfile’s `COPY` layout.
3. **Dockerfile path:** `backend/Dockerfile`.
4. **Start command:** **clear it** (empty). If Coolify has `next start -p 3001` or `npm start` saved from an old setup, it overrides the Dockerfile and you will keep seeing `next start`. Optional explicit value: `node scripts/start-prod.cjs` (working directory is the image default).
5. **Redeploy:** use **Rebuild** / disable “use cached image” so a new image is built from the current Git commit (otherwise an old layer can still contain the previous `package.json` scripts).

**Healthcheck (Coolify):** `http://127.0.0.1:3001/api/health` — use a plain URL, no shell or npm text in the field.

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

## Build reference (local parity)

From the **repository root**:

```bash
docker build -t afristore-backend -f backend/Dockerfile .
docker build -t afristore-frontend -f frontend/Dockerfile . \
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

**Correct Coolify setup (frontend service):**

1. **Domains:** only the apex, e.g. `https://acetchapp.link` (no `*.…` entry).
2. **Direction:** keep **Allow www & non-www** (or whatever you use for the apex).
3. **Redeploy** so the image includes the Traefik `LABEL`s from `frontend/Dockerfile` — they add a `HostRegexp` router for `*.acetchapp.link` (excludes `api` and `coolify` hosts) with TLS and no broken wildcard ACME.

**Cloudflare:** SSL mode **Full** (not Strict) is fine — the origin can use Traefik’s default certificate for that router.

**If you added a manual file** under `/data/coolify/proxy/dynamic/` for wildcards earlier, remove it to avoid duplicate routers, then `docker restart coolify-proxy`.

**Other apex domains:** edit the `traefik.http.routers.afristore-wildcard.rule` `LABEL` in `frontend/Dockerfile` so the host matches `NEXT_PUBLIC_STORE_BASE`.

**Server (Coolify → Servers → localhost → General):** set **Wildcard Domain** to `acetchapp.link` only — **no** `https://` prefix (that field expects a hostname, not a URL).

### Still “no available server” on `https://slug.yourdomain.com`?

1. **Redeploy the frontend app** with a **full rebuild** (not “use cached image”) so the latest `frontend/Dockerfile` `LABEL`s are in the image.
2. On the server: `docker inspect <frontend-container-name> --format '{{json .Config.Labels}}'` and confirm keys like `traefik.http.routers.afristore-wildcard.rule` exist. If they are **missing**, Coolify did not inherit image labels — open **Advanced → Custom Docker Labels** for the frontend service and paste the lines from `coolify/traefik-wildcard-labels.txt` (edit the domain if needed), then redeploy.
3. **DNS:** `*.acetchapp.link` must resolve to the same server as the apex.
4. `docker logs coolify-proxy --tail 30` — look for Traefik errors about `HostSNI` or duplicate routers.
