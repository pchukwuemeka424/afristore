# Build context: the backend/ folder only.
# Coolify: set "Base directory" to backend (or /backend). Dockerfile = Dockerfile (this file).
# Local: docker build -f backend/Dockerfile backend/

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache wget
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

# With a backend-only build, standalone output is at .next/standalone/ (no /backend/ sub-dir).
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/scripts/start-prod.cjs ./scripts/start-prod.cjs

EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3001/health >/dev/null || exit 1

CMD ["node", "scripts/start-prod.cjs"]
