# Build from `apps/web` context
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci 2>/dev/null || npm install

FROM node:20-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STORE_BASE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STORE_BASE=$NEXT_PUBLIC_STORE_BASE
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public && npm run build

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
# Plain HostRegexp; use \z end anchor (avoid `$` in Dockerfile). Do not escape backticks — Traefik needs `…` literals.
LABEL traefik.http.routers.afristore-wildcard.rule="HostRegexp(`^[a-z0-9-]+\\.acetchapp\\.link\\z`) && !Host(`api.acetchapp.link`) && !Host(`coolify.acetchapp.link`)"
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
