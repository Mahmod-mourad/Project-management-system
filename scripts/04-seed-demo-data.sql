-- A tenant you can sign in to.
--
-- Safe to run more than once: every statement upserts.
--
-- Users are seeded here rather than through the API because the API has no
-- public sign-up. POST /users requires an administrator of the tenant, so the
-- first administrator has to come from the database.
--
-- Both demo accounts use the password: DemoPassword123!

INSERT INTO subscription_plans (name, description, price, max_users, max_storage_gb, features) VALUES
  ('Starter',      'For a small team getting started', 49.00,   5,  10, '["projects", "tasks", "email_support"]'),
  ('Professional', 'For a growing company',           149.00,  25,  50, '["projects", "tasks", "reports", "priority_support"]'),
  ('Enterprise',   'For a large organisation',        499.00, NULL, 500, '["projects", "tasks", "reports", "api_access", "dedicated_support"]')
ON CONFLICT (name) DO NOTHING;

-- Fixed ids so the rows below can reference each other without a lookup.
--
-- They are readable but still valid version 4 UUIDs — the "4" in the third
-- group and the "a" in the fourth are required. A tidier-looking
-- 11111111-1111-1111-1111-111111111111 is not a UUID by RFC 4122, and while
-- Postgres accepts it, the API's @IsUUID() validators reject it, so seeded ids
-- could not be sent back to any endpoint that takes one.
INSERT INTO tenants (id, name, domain, status) VALUES
  ('11111111-1111-4111-a111-111111111111', 'Demo Company', 'demo.localhost', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO subscriptions (tenant_id, plan_id, status)
SELECT '11111111-1111-4111-a111-111111111111', id, 'active'
FROM subscription_plans WHERE name = 'Professional'
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Demo accounts.
--
-- GoTrue hashes passwords with bcrypt, which is what crypt(..., gen_salt('bf'))
-- produces, so these rows are indistinguishable from accounts created through
-- the API. The identities row is what lets GoTrue find the account by email; a
-- user without one cannot sign in.
--
-- confirmation_token, recovery_token, email_change and email_change_token_new
-- are set to the empty string rather than left NULL. They are nullable columns,
-- but GoTrue scans them into plain Go strings, so a NULL fails the whole query
-- with "converting NULL to string is unsupported" and every sign-in answers 500.
-- The four columns not listed here already default to ''.
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-a222-222222222222',
    'authenticated', 'authenticated',
    'admin@demo.localhost',
    crypt('DemoPassword123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Admin"}',
    NOW(), NOW(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-4333-a333-333333333333',
    'authenticated', 'authenticated',
    'member@demo.localhost',
    crypt('DemoPassword123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Member"}',
    NOW(), NOW(),
    '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    '22222222-2222-4222-a222-222222222222',
    '22222222-2222-4222-a222-222222222222',
    '{"sub":"22222222-2222-4222-a222-222222222222","email":"admin@demo.localhost","email_verified":true,"phone_verified":false}',
    'email', NOW(), NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    '33333333-3333-4333-a333-333333333333',
    '33333333-3333-4333-a333-333333333333',
    '{"sub":"33333333-3333-4333-a333-333333333333","email":"member@demo.localhost","email_verified":true,"phone_verified":false}',
    'email', NOW(), NOW(), NOW()
  )
ON CONFLICT (provider_id, provider) DO NOTHING;

-- The profile is what the API reads. An auth account without one fails every
-- request it makes, so the two are always created together.
INSERT INTO profiles (id, tenant_id, email, full_name, role, department, is_platform_admin) VALUES
  (
    '22222222-2222-4222-a222-222222222222',
    '11111111-1111-4111-a111-111111111111',
    'admin@demo.localhost', 'Demo Admin', 'admin', 'Operations',
    -- One platform administrator, so the tenants screen has somebody who can
    -- reach it. Nothing in the API can grant this.
    true
  ),
  (
    '33333333-3333-4333-a333-333333333333',
    '11111111-1111-4111-a111-111111111111',
    'member@demo.localhost', 'Demo Member', 'member', 'Engineering',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- A project with a team and some tasks, so the dashboard is not empty on the
-- first sign-in.
INSERT INTO projects (id, tenant_id, name, description, status, priority, start_date, end_date, manager_id) VALUES
  (
    '44444444-4444-4444-a444-444444444444',
    '11111111-1111-4111-a111-111111111111',
    'Website redesign',
    'Rebuild the marketing site on the new design system.',
    'in_progress', 'high',
    CURRENT_DATE - INTERVAL '3 weeks', CURRENT_DATE + INTERVAL '5 weeks',
    '22222222-2222-4222-a222-222222222222'
  ),
  (
    '55555555-5555-4555-a555-555555555555',
    '11111111-1111-4111-a111-111111111111',
    'Mobile app',
    'First release of the companion app.',
    'planning', 'medium',
    CURRENT_DATE + INTERVAL '2 weeks', NULL,
    '22222222-2222-4222-a222-222222222222'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_members (project_id, user_id) VALUES
  ('44444444-4444-4444-a444-444444444444', '22222222-2222-4222-a222-222222222222'),
  ('44444444-4444-4444-a444-444444444444', '33333333-3333-4333-a333-333333333333'),
  ('55555555-5555-4555-a555-555555555555', '22222222-2222-4222-a222-222222222222')
ON CONFLICT (project_id, user_id) DO NOTHING;

INSERT INTO tasks (id, tenant_id, project_id, title, description, status, priority, assignee_id, due_date) VALUES
  ('66666666-6666-4666-a666-666666666601', '11111111-1111-4111-a111-111111111111', '44444444-4444-4444-a444-444444444444',
   'Audit the current pages', 'List every page and what replaces it.', 'completed', 'medium',
   '33333333-3333-4333-a333-333333333333', CURRENT_DATE - INTERVAL '1 week'),
  ('66666666-6666-4666-a666-666666666602', '11111111-1111-4111-a111-111111111111', '44444444-4444-4444-a444-444444444444',
   'Build the component library', NULL, 'in_progress', 'high',
   '33333333-3333-4333-a333-333333333333', CURRENT_DATE + INTERVAL '1 week'),
  ('66666666-6666-4666-a666-666666666603', '11111111-1111-4111-a111-111111111111', '44444444-4444-4444-a444-444444444444',
   'Migrate the blog', NULL, 'todo', 'low',
   NULL, CURRENT_DATE + INTERVAL '3 weeks'),
  ('66666666-6666-4666-a666-666666666604', '11111111-1111-4111-a111-111111111111', '55555555-5555-4555-a555-555555555555',
   'Pick the navigation pattern', NULL, 'todo', 'medium',
   '22222222-2222-4222-a222-222222222222', CURRENT_DATE + INTERVAL '2 weeks'),
  -- Deliberately past due, so the dashboard's overdue count is not always zero.
  ('66666666-6666-4666-a666-666666666605', '11111111-1111-4111-a111-111111111111', '44444444-4444-4444-a444-444444444444',
   'Write the launch checklist', NULL, 'in_review', 'urgent',
   '22222222-2222-4222-a222-222222222222', CURRENT_DATE - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;
