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

| Service | Base directory | Build | Exposed port |
|---|---|---|---|
| Backend | `backend` | **Nixpacks** (no Dockerfile in repo) | `3001` |
| Frontend | repository root | `frontend/Dockerfile` | `3000` |

### Backend (no Docker image — Nixpacks / Node)

The backend is deployed as a **normal Node app**, not a custom Docker image.

1. **Build pack:** **Nixpacks** (Coolify default).
2. **Base directory:** **`backend`**.
3. **Port / env:** Set **Network** port to **`3001`** and add **`PORT=3001`** in environment variables so Traefik and the app agree.
4. **Install / build / start** (if Coolify does not auto-detect): install in `backend`, run **`npm run build`**, then **`npm start`** (`package.json` uses `node scripts/start-prod.cjs`, which matches `output: 'standalone'` in Next.js).
5. **Healthcheck:** `http://127.0.0.1:3001/health` — plain URL only (no pasted shell/`npm` text).

Do **not** set a custom start command to `next start` for production; use **`npm start`** or **`node scripts/start-prod.cjs`** after a build.

### Backend: Traefik / browser shows “No available server”

That usually means the **proxy has no healthy upstream** (wrong port, failed healthcheck, or the app never listened).

1. **Application port** — Backend **Network** port and **`PORT`** env must both be **`3001`** (or both **`3000`** if you standardize on Coolify’s default — they must match).
2. **Healthcheck URL** — Prefer `http://127.0.0.1:3001/health` (or `…/api/health`). One plain URL; no env placeholders or pasted shell/`npm` text.
3. **Logs** — Confirm Next.js **Ready** and listening on **0.0.0.0**. Set **`HOSTNAME=0.0.0.0`** if the process only binds to localhost.
4. **Redeploy** after changing port or healthcheck so Traefik picks up a healthy target.

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

**Backend** (no Docker in repo — run Node locally):

```bash
npm run build -w backend && npm run start -w backend
```

**Frontend** image (from repository root):

```bash
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
