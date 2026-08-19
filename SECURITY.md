# Security

This is a multi-tenant application, so almost every question here is the same question: can one
tenant reach another tenant's data?

## What used to be wrong

Three defects that chained into a complete break of the tenant boundary. They are fixed; they are
written down because the fix only makes sense against them.

### 1. The tenant routes had no guard at all

`TenantController` carried no `@UseGuards` of any kind. Not authentication, not authorization.

```
GET    /api/v1/tenants       → every tenant on the platform, unauthenticated
DELETE /api/v1/tenants/:id   → deletes one, unauthenticated
```

### 2. Registration let the caller choose their tenant

```ts
@Post("register")                                  // public
register(@Body() registerDto: RegisterDto) {       // RegisterDto.tenant_id
  return this.authService.register(registerDto)
}
```

The tenant came from the request body. Combined with the listing above: read the tenant ids, pick
one, register into it. Every request afterwards passes the tenant guard honestly, because the
profile genuinely does belong to that tenant.

### 3. Any member could edit any user, and promote themselves

```ts
@Patch(":id")
update(@Param('id') id, @Req() req, @Body() updateUserDto: UpdateUserDto) {
  //                                     UpdateUserDto.role
  return this.userService.update(tenantId, id, updateUserDto)
}
```

Guarded by authentication and the tenant guard only. Nothing checked that the id being edited was
the caller's, and `role` went straight into the update. `PATCH /users/<my-own-id>` with
`{"role":"admin"}` was a promotion.

## How the boundary works now

**The tenant is taken from the authenticated profile, never from the request.** The `x-tenant-id`
header is client-supplied, so `TenantGuard` compares it against `profiles.tenant_id` on the row the
JWT names. A mismatch is a 403. Checking only that the tenant *exists* — which is what the guard did
before this repository's first pass — lets any signed-in user read any tenant by editing one header.

**Roles are read from the database, never from the token or the body.** `RolesGuard` reads
`profiles.role`. `PlatformAdminGuard` reads `profiles.is_platform_admin`. A caller can send either
field; nothing looks at what they send.

**Acting across tenants is a separate privilege from administering one.** `role` is scoped inside a
tenant: an `admin` runs their own company and can reach nothing outside it. `is_platform_admin`
covers the tenant routes themselves. No API path sets that column — it is granted in SQL — so a
tenant administrator cannot escalate into it.

**There is no public sign-up.** Adding a user is `POST /users`, restricted to an administrator of
the tenant, and the tenant comes from that administrator's session. The first administrator of a
tenant is seeded in SQL. A public endpoint that takes a tenant id is, by construction, a way into
somebody else's tenant.

**Self-edit and administration are different operations.** `PATCH /users/:id` allows your own row,
or any row if you are an administrator. `role` is stripped from the body for anyone who is not an
administrator, so sending it does nothing. Deleting is administrator-only and cannot be your own
account, which would otherwise leave a tenant with no administrator.

**Deleting a user matches before it destroys.** The profile delete is scoped by tenant and the row
count is checked before the Supabase auth account is removed. Previously the auth account was
deleted regardless, so a wrong id destroyed a working login and left the profile in place.

## Authentication

- Passwords are handled by Supabase GoTrue — bcrypt, never by this codebase. The API has no
  password column and no hashing of its own.
- The API issues its own JWT, signed with `JWT_SECRET`, carrying `sub`, `email` and `tenant_id`.
  `JwtStrategy.validate` then loads the profile fresh on every request, so a token cannot outlive
  the row it names or carry stale claims.
- Tokens expire on `JWT_EXPIRES_IN`, seven days by default.
- A 401 from any endpoint clears the client's stored session, including the cached user, so the
  next page load does not restore a signed-out user.

## Input

The global `ValidationPipe` runs with `whitelist` and `forbidNonWhitelisted`, so a body containing
a field no DTO declares is a 400 rather than a silently ignored — or silently applied — extra
column. That is what keeps `is_platform_admin` out of every write path.

Enum fields are validated with `@IsEnum`, and the database repeats the same lists as CHECK
constraints, so an invalid status cannot be stored even if a query bypassed the DTO.

## The service role key

The API holds `SUPABASE_SERVICE_ROLE_KEY`, which bypasses row level security. That is deliberate:
the tenant filter is a `.eq("tenant_id", …)` the service adds to every query, and it is the same
filter whether or not RLS is on.

It must never reach the browser. The frontend has no Supabase client and no Supabase key of any
kind; `lib/api-client.ts` is the only thing that makes a request, and it talks to the API.

RLS is enabled on every table with no permissive policies, so the anon and authenticated keys can
read nothing directly. The policies that used to be there read
`current_setting('app.current_tenant_id')`, a setting nothing in the codebase ever set — had RLS
applied to any request, every one would have failed. They were theatre.

## Known gaps

Worth stating plainly rather than implying they are handled.

- **No rate limiting** anywhere, including on sign-in.
- **No password reset.** The sign-in form used to link to one; the link went nowhere, so it is
  gone. An administrator setting a new password is the only recovery path.
- **No audit log.** There was a table for one, with nothing writing to it. It was dropped rather
  than left looking like a feature.
- **No CSRF token.** The token is sent as an `Authorization` header from JavaScript rather than as
  a cookie, so a cross-site form post cannot carry it, but there is no second layer.
- **Tokens are held in `localStorage`,** which is readable by any script on the page. An
  HttpOnly cookie would be stronger; that is a change to how the API issues sessions, not a
  configuration switch.
- **The API has never run against a live deployment.** It has been exercised locally against
  Supabase and in CI against PostgreSQL. Nothing here has been tested under real traffic.
