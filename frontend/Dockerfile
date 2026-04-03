# Build context: repository root (`afristore/`), e.g.
# docker build -f frontend/Dockerfile . --build-arg NEXT_PUBLIC_API_URL=...
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY frontend/shared/package.json frontend/shared/package.json
COPY backend/package.json backend/package.json
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY frontend ./frontend
COPY backend ./backend
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STORE_BASE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STORE_BASE=$NEXT_PUBLIC_STORE_BASE
RUN mkdir -p frontend/public && npm run build -w frontend

FROM node:20-alpine AS runner
RUN apk add --no-cache wget
WORKDIR /app
ENV NODE_ENV=production

# Traefik (Coolify): do NOT list `*.yourdomain` in Coolify Domains — Traefik v3 rejects Host(`*.…`) for TLS
# (invalid HostSNI) and Let's Encrypt HTTP-01 cannot issue wildcard certs. These labels add HostRegexp
# routing + tls without certresolver (works with Cloudflare SSL "Full"). Edit the rule if apex ≠ acetchapp.link.
LABEL traefik.enable="true" \
  traefik.http.routers.afristore-wildcard.entrypoints="https,http" \
  traefik.http.routers.afristore-wildcard.priority="10000" \
  traefik.http.routers.afristore-wildcard.tls="true" \
  traefik.http.routers.afristore-wildcard.service="afristore-wildcard-svc" \
  traefik.http.services.afristore-wildcard-svc.loadbalancer.server.port="3000"
LABEL traefik.http.routers.afristore-wildcard.rule="HostRegexp(`^[a-z0-9-]+\\.acetchapp\\.link\\z`) && !Host(`api.acetchapp.link`) && !Host(`coolify.acetchapp.link`)"

COPY --from=build /app/frontend/.next/standalone ./
WORKDIR /app/frontend
COPY --from=build /app/frontend/.next/static ./.next/static
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
