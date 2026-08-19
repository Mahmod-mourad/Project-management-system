# Project Management System

A multi-tenant project management application: a Next.js frontend and a NestJS API sharing one
pnpm workspace, backed by Supabase/PostgreSQL, with Docker Compose for local infrastructure and
GitHub Actions for build and test.

This README describes what is actually implemented. Every screen listed below is backed by an
endpoint that exists — there are no mock-data screens left in the repository.

## Status

| | |
| --- | --- |
| Frontend build | `pnpm build` passes — 10 routes |
| Backend build | `pnpm --filter erp-backend build` passes |
| Unit tests | 104 passing across 7 suites (frontend) + 21 across 4 suites (backend) |
| Integration / E2E | Written, needs a running API — not part of CI |
| Docker images | Frontend and backend images build from the repo root |
| Deployment | Pipeline is authored but has never run against a live host |

## What is implemented

**Backend (NestJS)** — modules with controllers, services, and DTOs:

- `auth` — registration, login, logout, profile, JWT guards
- `tenant` — tenant records and per-tenant stats
- `user` — user records scoped to a tenant
- `project` — project CRUD and stats
- `task` — task CRUD, filtering by project, grouping by status
- `notification` — notification records
- `supabase` — the shared data-access client

**Frontend (Next.js App Router)** — every screen goes through `lib/api-client.ts`:

- **Dashboard** (`/`) — project and task counts, completion rate, overdue tasks, and status
  breakdowns, all derived from the projects and tasks the API returns
- **Projects** (`/projects`) — list with search and status filter; create and edit
- **Project detail** (`/projects/[id]`) — one project with its stats from
  `GET /projects/:id/stats`, plus that project's task board
- **Tasks** (`/tasks`) — a board across to do, in progress, in review and completed. Moving a card
  patches the task's status optimistically and reverts if the request fails
- **Tenants** (`/admin/tenants`) — tenant list with per-tenant user, project and task counts, and
  tenant creation
- **Users** (`/users`), **Profile**, **Settings**, **Login**

An earlier version of this repository shipped seven more screens — companies, inventory, invoices,
sales, HR, reports and subscriptions. Between them they made zero API calls across 4,165 lines:
each one rendered a hardcoded array. They were removed rather than left in place looking real. The
backend has never had a module for any of them.

## Tech stack

**Frontend** — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, Socket.IO client
**Backend** — NestJS, TypeScript, Passport/JWT, Supabase JS, class-validator
**Data** — PostgreSQL 16, Redis 7, Supabase
**Tooling** — pnpm workspace, Jest, React Testing Library, Docker Compose, Nginx, GitHub Actions

## Getting started

Requires Node.js 22+ and pnpm 11 (`corepack enable` picks up the pinned version).

```bash
git clone https://github.com/Mahmod-mourad/Project-management-system.git
cd Project-management-system

pnpm install                      # installs both workspace packages
cp .env.local.example .env.local  # fill in the Supabase keys

pnpm dev                          # frontend on :3000
pnpm --filter erp-backend start:dev   # API on :3001
```

With Docker instead:

```bash
docker compose up -d              # postgres, redis, backend, frontend, nginx
```

## Tests

```bash
pnpm test              # frontend unit tests
pnpm test:coverage     # the same, with the coverage gate
pnpm test:backend      # NestJS service specs
pnpm test:integration  # needs the API running — see below
```

Unit tests are the only suite in CI. The integration and E2E suites in `__tests__/integration/`
and `__tests__/e2e/` make real HTTP calls, so they need the stack up first:

```bash
docker compose up -d
pnpm test:integration
```

Coverage thresholds are scoped to the modules that are actually tested — `lib/api-client.ts`,
`lib/validators.ts`, and `hooks/use-auth.tsx` — rather than a repo-wide number the suite could not
meet. Raise them as tests are added.

Backend specs run from `backend/` with ts-jest, because the Next.js SWC transform used at the root
does not enable the decorator support NestJS relies on.

## Project layout

```text
app/                 Next.js App Router routes
components/          UI components, grouped by feature
hooks/               React hooks, including the auth provider
lib/                 API client, validators, shared helpers
backend/src/         NestJS modules (auth, tenant, user, project, task, notification)
__tests__/           unit tests; integration/ and e2e/ run separately
supabase/            SQL initialization scripts
.github/workflows/   build and test on push; deploy is manual
```

## Deployment

`.github/workflows/deploy.yml` builds and pushes both images to Docker Hub and deploys over SSH.
It runs on `workflow_dispatch` only, because it needs `DOCKER_USERNAME`, `DOCKER_PASSWORD`, and a
`PRODUCTION_HOST` that do not exist yet. Treat it as pipeline configuration, not as evidence of a
running production deployment.

## License

UNLICENSED — personal project.
