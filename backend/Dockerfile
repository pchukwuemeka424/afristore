# Build context: repository root (`afristore/`), e.g.
# docker build -f backend/Dockerfile .
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
RUN npm run build -w backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

COPY --from=build /app/backend/.next/standalone ./
WORKDIR /app/backend
COPY --from=build /app/backend/.next/static ./.next/static

EXPOSE 3001
CMD ["node", "server.js"]
