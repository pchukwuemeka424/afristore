# AfriStore

AfriStore is an Africa-focused commerce platform that helps entrepreneurs launch and run online stores quickly.  
It includes a **Next.js backend** (`backend`), **Next.js web app** (`apps/web`), and **MongoDB** data layer.

## What the project is about

AfriStore is built for founders, SMEs, creators, and local businesses across Africa who want:
- faster store setup,
- mobile-first buying experiences,
- simple operations without heavy technical overhead.

The platform is designed to reduce the barrier to digital commerce by combining storefront management, catalog tools, order flow, and deployment-friendly architecture.

## Core features

- Multi-store capable architecture with public and store-scoped APIs.
- Product and store management built on MongoDB + Mongoose.
- Authentication and token-based access for protected operations.
- Template-driven store setup with seed data for quick launch.
- Analytics endpoints for store performance summaries.
- Production-ready deployment path for Coolify and managed MongoDB (Atlas).

## How this helps Africans

- **Lower startup cost:** merchants can launch faster with fewer engineering resources.
- **Mobile-first access:** supports how most African customers and merchants access the internet.
- **Local business digitization:** helps informal and small businesses move online.
- **Scalable growth path:** starts simple and can scale to multiple stores and domains.
- **Ecosystem compatibility:** integrates with deployment and cloud tools used by African startups.

## Quick start (development)

See [docs/DEVELOPER_ONBOARDING.md](docs/DEVELOPER_ONBOARDING.md) for full onboarding.

```bash
docker compose up -d mongo
npm run db:seed
npm run dev
```

Environment files are service-scoped:
- `backend/.env`
- `apps/web/.env`

- **API**: http://localhost:3001/api  
- **Web**: http://localhost:3000  

## Repository layout

| Path | Purpose |
|------|---------|
| `backend/` | Next.js API (Mongoose, auth, webhooks, AI) |
| `apps/web` | Next.js dashboard + storefront |
| `packages/shared` | Shared types (optional) |
| `coolify/` | Deployment notes |

## License

Proprietary — adjust for your product.
