# Project Management System

A multi-tenant project management application: a Next.js frontend and a NestJS API in one pnpm
workspace, with Supabase for the database and authentication.

Everything described here is implemented. Every screen is backed by an endpoint that exists, and
every endpoint is backed by a table the setup scripts create.

## Status

| | |
| --- | --- |
| Frontend | `pnpm build` passes — 10 routes, lint and `tsc --noEmit` clean |
| Backend | `pnpm --filter erp-backend build` passes, lint clean |
| Unit tests | 105 frontend across 7 suites, 45 backend across 8 |
| Schema | `scripts/` applies cleanly to an empty PostgreSQL, twice over — checked in CI |
| Integration / E2E | Written; need a running API, so they are not in CI |
| Deployment | None. There is no host, so there is no pipeline pretending to have one |

## What it does

A tenant is a company. Everyone signs in to exactly one, and every query is scoped to it.

- **Dashboard** — project and task counts, completion rate, overdue tasks, status breakdowns
- **Projects** — list with search and status filter, create, edit, per-project stats, and a team
- **Project detail** — one project's stats and its task board
- **Tasks** — a board across to do, in progress, in review and completed. Dragging a card patches
  the task optimistically and reverts if the request fails
- **Users** — everyone in the tenant. Administrators add, edit and remove; everyone else can edit
  their own row and nothing else
- **Tenants** — every tenant on the platform, with counts. Platform administrators only
- **Profile** — your own details
- **Settings** — the tenant you belong to, and its usage

An earlier version of this repository shipped seven more screens — companies, inventory, invoices,
sales, HR, reports and subscriptions. Between them they made zero API calls across 4,165 lines:
each rendered a hardcoded array. They were removed rather than left looking real. The backend has
never had a module for any of them.

## Stack

**Frontend** — Next.js 16 (App Router), React 19, TypeScript, Tailwind, Radix UI, Socket.IO client
**Backend** — NestJS 10, TypeScript, Passport/JWT, `@supabase/supabase-js`, class-validator
**Data** — PostgreSQL, through Supabase's REST endpoint. The API opens no database connection of
its own
**Tooling** — pnpm workspace, Jest, React Testing Library, Docker, GitHub Actions

## Getting started

Node.js 22 or newer, and pnpm 11 — `corepack enable` picks up the version pinned in
`package.json`.

### 1. A database

The API talks to Supabase. Locally that is the Supabase CLI, which runs the whole stack in Docker:

```bash
npx supabase init
npx supabase start        # prints the API URL and the service role key
```

A hosted Supabase project works the same way; take the URL and service role key from its settings.

### 2. The schema

`scripts/` holds four SQL files, applied in order:

```bash
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
make db-apply
```

`04-seed-demo-data.sql` creates a tenant with two accounts, both with the password
`DemoPassword123!`:

| Account | Role |
| --- | --- |
| `admin@demo.localhost` | tenant administrator, and platform administrator |
| `member@demo.localhost` | member |

There is no sign-up screen, and no public endpoint that creates one — see
[SECURITY.md](SECURITY.md) for why. A tenant's first administrator comes from SQL; every account
after that is added by an administrator from the Users screen.

### 3. The applications

```bash
pnpm install

cp .env.example .env.local                 # NEXT_PUBLIC_API_URL
cp backend/.env.example backend/.env       # Supabase URL, service role key, JWT secret

pnpm dev                                   # frontend on :3000
pnpm --filter erp-backend start:dev        # API on :3001, docs at /api/docs
```

With Docker instead — the database still has to be up separately:

```bash
docker compose up -d --build
```

## Tests

```bash
pnpm test              # frontend unit tests
pnpm test:ci           # the same, with the coverage gate
pnpm test:backend      # NestJS specs
pnpm test:integration  # needs the API running
```

Unit tests and the schema check are what CI runs. The suites in `__tests__/integration/` and
`__tests__/e2e/` make real HTTP calls, so they need the stack up first.

Coverage thresholds are per file, on the modules that are actually covered — `lib/api-client.ts`,
`lib/validators.ts` and `components/auth/auth-provider.tsx` — rather than a repo-wide number the
suite could not meet. Raise them as tests are added.

Backend specs run from `backend/` with ts-jest: the SWC transform Next.js uses at the root does not
enable the decorator metadata NestJS depends on.

## Layout

```text
app/                 Next.js App Router routes
components/          UI components, grouped by feature
hooks/               data-fetching hooks, one per resource
lib/                 API client, types, validators, helpers
backend/src/         NestJS modules: auth, tenant, user, project, task, notification
scripts/             the SQL that builds the database, in order
__tests__/           unit tests; integration/ and e2e/ run separately
.github/workflows/   build, lint, test, and apply the schema
```

## More

- [ARCHITECTURE.md](ARCHITECTURE.md) — how a request travels, and why the pieces are arranged this way
- [SECURITY.md](SECURITY.md) — the tenant boundary, and the holes that used to be in it

## License

UNLICENSED — personal project.
