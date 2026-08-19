# Architecture

Two applications and a database. The browser talks only to the API; the API talks only to Supabase.

```
browser ──HTTP──▶ Next.js (:3000)          the UI. No database access, no Supabase client.
   │
   └────HTTP──▶ NestJS (:3001/api/v1) ──▶ Supabase (PostgREST + GoTrue) ──▶ PostgreSQL
```

## Why the frontend has no Supabase client

It would need a key to use one. The anon key can only reach tables through row level security, and
the service role key bypasses RLS entirely — putting either in the browser means the tenant boundary
is enforced by the client, which is to say not enforced.

So the API holds the service role key, and every tenant filter is a `.eq("tenant_id", …)` it adds
itself. `lib/api-client.ts` is the only file in the frontend that makes a request, and every hook
goes through it.

## A request, end to end

`PATCH /api/v1/tasks/:id`, from a card dropped into a different column:

1. `hooks/use-tasks.ts` calls `apiClient.updateTask(id, { status })`.
2. The api-client request interceptor attaches `Authorization: Bearer <token>` and
   `x-tenant-id: <tenant>`, both from the session it holds.
3. `JwtAuthGuard` verifies the token and `JwtStrategy.validate` loads the profile row it names.
   That row — not the token, and not the header — is the caller's identity from here on.
4. `TenantGuard` compares `x-tenant-id` against `profile.tenant_id`. A mismatch is a 403. It then
   confirms the tenant exists and is active.
5. `ValidationPipe` turns the body into an `UpdateTaskDto`, rejecting unknown fields outright
   (`whitelist` and `forbidNonWhitelisted` are both on).
6. `TaskService.update` issues the Supabase query, scoped by both `tenant_id` and `id`.
7. The response comes back up. On failure the api-client response interceptor turns the axios error
   into a plain `Error` with the server's message, and the board reverts the card.

Step 4 is the whole multi-tenancy story. The header is client-supplied, so checking only that the
tenant exists would let any signed-in user read another tenant's data by changing one header. It
has to be checked against the authenticated profile, and it is.

## Authorization

Three levels, each answering a different question.

| Guard | Question | Source of truth |
| --- | --- | --- |
| `JwtAuthGuard` | Who are you? | the signed token, then the profile row it names |
| `TenantGuard` | Is this tenant yours? | `profiles.tenant_id` |
| `RolesGuard` | May you do this here? | `profiles.role` — `admin`, `manager`, `member` |
| `PlatformAdminGuard` | May you act across tenants? | `profiles.is_platform_admin` |

Every one of them reads the database row, never the request. A caller can send any role they like;
nothing looks at it.

`is_platform_admin` is separate from `role` on purpose. Creating, listing and deleting tenants
crosses the tenant boundary, so no role *inside* a tenant can authorise it — otherwise every
customer's administrator could read every other customer. Nothing in the API can set that column;
it is granted in SQL.

## Data access

`SupabaseService` wraps one client, built from `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Each
service asks it for a query.

Related rows come back through PostgREST's embedding rather than extra round trips:

```ts
.from("tasks").select(`
  *,
  project:projects(id, name),
  assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)
`)
```

That syntax resolves through foreign keys, which is why the schema's constraint names matter — see
the comments in `scripts/02-profiles-projects-tasks.sql`.

## The schema

`scripts/`, applied in order:

| | |
| --- | --- |
| `01-tenants-and-plans.sql` | `tenants`, `subscription_plans`, `subscriptions`, `usage_tracking` |
| `02-profiles-projects-tasks.sql` | `profiles`, `projects`, `project_members`, `tasks` |
| `03-notifications.sql` | `notifications`, and triggers on task assignment and project status |
| `04-seed-demo-data.sql` | a tenant, two accounts, two projects, five tasks |

Every table carries `tenant_id` and cascades from `tenants`. `profiles.id` is the Supabase auth
user's id, so the two are always created and deleted together.

RLS is enabled everywhere with no permissive policies. Since every request arrives on the service
role connection, which bypasses RLS, "nothing" is the correct answer for the anon and authenticated
keys — the tenant boundary lives in the service layer, and RLS is there so that a stray anon key
cannot go around it.

## Real-time

`NotificationGateway` is a Socket.IO gateway that verifies the same JWT on the handshake and joins
each socket to `user:<id>`, `tenant:<id>` and `project:<id>` rooms. `NotificationService.create`
writes the row and emits to the user's room. The database also writes notifications directly, from
the triggers in `03-notifications.sql`, so a task assigned by any path produces one.

## Frontend structure

- `app/` — routes. Each wraps its screen in `ProtectedRoute` and `DashboardLayout`.
- `components/<feature>/` — the screen for that feature.
- `hooks/use-<resource>.ts` — fetching, mutation and optimistic state for one resource.
- `lib/types.ts` — the shapes the API returns. The enums mirror the DTO enums, so a value that
  type-checks is a value the API accepts.
- `lib/api-client.ts` — every HTTP call, plus the two interceptors that attach the session and
  normalise errors.

A 401 from any request clears the session and sends the browser to `/login`. A 403 does not: the
token is fine, the account simply may not do that, and the screen shows the message.
