-- A tenant you can sign in to.
--
-- Safe to run more than once: every statement upserts.
--
-- Users are seeded here rather than through the API because the API has no
-- public sign-up. POST /users requires an administrator of the tenant, so the
-- first administrator has to come from the database.
--
-- All demo accounts use the password: DemoPassword123!

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
ON CONFLICT (tenant_id, plan_id) DO NOTHING;

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
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '2a222222-2222-4222-a222-222222222201',
    'authenticated', 'authenticated',
    'sara@demo.localhost',
    crypt('DemoPassword123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sara Hassan"}',
    NOW(), NOW(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '2a222222-2222-4222-a222-222222222202',
    'authenticated', 'authenticated',
    'omar@demo.localhost',
    crypt('DemoPassword123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Omar Khaled"}',
    NOW(), NOW(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '2a222222-2222-4222-a222-222222222203',
    'authenticated', 'authenticated',
    'laila@demo.localhost',
    crypt('DemoPassword123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Laila Mostafa"}',
    NOW(), NOW(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '2a222222-2222-4222-a222-222222222204',
    'authenticated', 'authenticated',
    'youssef@demo.localhost',
    crypt('DemoPassword123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Youssef Adel"}',
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
  ),
  (
    gen_random_uuid(),
    '2a222222-2222-4222-a222-222222222201',
    '2a222222-2222-4222-a222-222222222201',
    '{"sub":"2a222222-2222-4222-a222-222222222201","email":"sara@demo.localhost","email_verified":true,"phone_verified":false}',
    'email', NOW(), NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    '2a222222-2222-4222-a222-222222222202',
    '2a222222-2222-4222-a222-222222222202',
    '{"sub":"2a222222-2222-4222-a222-222222222202","email":"omar@demo.localhost","email_verified":true,"phone_verified":false}',
    'email', NOW(), NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    '2a222222-2222-4222-a222-222222222203',
    '2a222222-2222-4222-a222-222222222203',
    '{"sub":"2a222222-2222-4222-a222-222222222203","email":"laila@demo.localhost","email_verified":true,"phone_verified":false}',
    'email', NOW(), NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    '2a222222-2222-4222-a222-222222222204',
    '2a222222-2222-4222-a222-222222222204',
    '{"sub":"2a222222-2222-4222-a222-222222222204","email":"youssef@demo.localhost","email_verified":true,"phone_verified":false}',
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
  ),
  (
    '2a222222-2222-4222-a222-222222222201',
    '11111111-1111-4111-a111-111111111111',
    'sara@demo.localhost', 'Sara Hassan', 'manager', 'Design',
    false
  ),
  (
    '2a222222-2222-4222-a222-222222222202',
    '11111111-1111-4111-a111-111111111111',
    'omar@demo.localhost', 'Omar Khaled', 'member', 'Engineering',
    false
  ),
  (
    '2a222222-2222-4222-a222-222222222203',
    '11111111-1111-4111-a111-111111111111',
    'laila@demo.localhost', 'Laila Mostafa', 'manager', 'Marketing',
    false
  ),
  (
    '2a222222-2222-4222-a222-222222222204',
    '11111111-1111-4111-a111-111111111111',
    'youssef@demo.localhost', 'Youssef Adel', 'manager', 'Engineering',
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
  ),
  (
    '77777777-7777-4777-a777-777777777701',
    '11111111-1111-4111-a111-111111111111',
    'E-commerce backend migration',
    'Move the order and inventory services to the new platform.',
    'on_hold', 'urgent',
    CURRENT_DATE - INTERVAL '4 weeks', CURRENT_DATE + INTERVAL '4 weeks',
    '2a222222-2222-4222-a222-222222222204'
  ),
  (
    '77777777-7777-4777-a777-777777777702',
    '11111111-1111-4111-a111-111111111111',
    'Q4 Marketing campaign',
    'Social and email push for the winter sale.',
    'completed', 'high',
    CURRENT_DATE - INTERVAL '10 weeks', CURRENT_DATE - INTERVAL '2 weeks',
    '2a222222-2222-4222-a222-222222222203'
  ),
  (
    '77777777-7777-4777-a777-777777777703',
    '11111111-1111-4111-a111-111111111111',
    'Customer onboarding revamp',
    'Shorten the path from sign-up to first value.',
    'in_progress', 'high',
    CURRENT_DATE - INTERVAL '2 weeks', CURRENT_DATE + INTERVAL '6 weeks',
    '2a222222-2222-4222-a222-222222222201'
  ),
  (
    '77777777-7777-4777-a777-777777777704',
    '11111111-1111-4111-a111-111111111111',
    'Reporting dashboard',
    'A single view of the metrics the team actually follows.',
    'in_progress', 'medium',
    CURRENT_DATE - INTERVAL '1 week', CURRENT_DATE + INTERVAL '4 weeks',
    '2a222222-2222-4222-a222-222222222204'
  ),
  (
    '77777777-7777-4777-a777-777777777705',
    '11111111-1111-4111-a111-111111111111',
    'Mobile app v2 discovery',
    'Research and scoping for the next major release.',
    'planning', 'low',
    CURRENT_DATE + INTERVAL '1 week', NULL,
    '2a222222-2222-4222-a222-222222222201'
  ),
  (
    '77777777-7777-4777-a777-777777777706',
    '11111111-1111-4111-a111-111111111111',
    'Legacy ERP cleanup',
    'Decommission the old ERP surfaced by the earlier schema.',
    'cancelled', 'low',
    CURRENT_DATE - INTERVAL '12 weeks', CURRENT_DATE - INTERVAL '1 week',
    '22222222-2222-4222-a222-222222222222'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_members (project_id, user_id) VALUES
  ('44444444-4444-4444-a444-444444444444', '22222222-2222-4222-a222-222222222222'),
  ('44444444-4444-4444-a444-444444444444', '33333333-3333-4333-a333-333333333333'),
  ('55555555-5555-4555-a555-555555555555', '22222222-2222-4222-a222-222222222222'),
  ('77777777-7777-4777-a777-777777777701', '2a222222-2222-4222-a222-222222222204'),
  ('77777777-7777-4777-a777-777777777701', '2a222222-2222-4222-a222-222222222202'),
  ('77777777-7777-4777-a777-777777777701', '22222222-2222-4222-a222-222222222222'),
  ('77777777-7777-4777-a777-777777777702', '2a222222-2222-4222-a222-222222222203'),
  ('77777777-7777-4777-a777-777777777702', '2a222222-2222-4222-a222-222222222201'),
  ('77777777-7777-4777-a777-777777777703', '2a222222-2222-4222-a222-222222222201'),
  ('77777777-7777-4777-a777-777777777703', '2a222222-2222-4222-a222-222222222202'),
  ('77777777-7777-4777-a777-777777777703', '33333333-3333-4333-a333-333333333333'),
  ('77777777-7777-4777-a777-777777777704', '2a222222-2222-4222-a222-222222222204'),
  ('77777777-7777-4777-a777-777777777704', '2a222222-2222-4222-a222-222222222202'),
  ('77777777-7777-4777-a777-777777777704', '2a222222-2222-4222-a222-222222222203'),
  ('77777777-7777-4777-a777-777777777705', '2a222222-2222-4222-a222-222222222201'),
  ('77777777-7777-4777-a777-777777777705', '2a222222-2222-4222-a222-222222222202'),
  ('77777777-7777-4777-a777-777777777706', '22222222-2222-4222-a222-222222222222')
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
   '22222222-2222-4222-a222-222222222222', CURRENT_DATE - INTERVAL '2 days'),
  ('66666666-6666-4666-a666-666666666606', '11111111-1111-4111-a111-111111111111', '44444444-4444-4444-a444-444444444444',
   'Implement the new header component', 'Header, navigation and footer from the component library.', 'in_progress', 'high',
   '2a222222-2222-4222-a222-222222222201', CURRENT_DATE + INTERVAL '1 week'),
  ('66666666-6666-4666-a666-666666666607', '11111111-1111-4111-a111-111111111111', '44444444-4444-4444-a444-444444444444',
   'Set up analytics event tracking', NULL, 'todo', 'medium',
   '2a222222-2222-4222-a222-222222222202', CURRENT_DATE + INTERVAL '2 weeks'),
  ('66666666-6666-4666-a666-666666666608', '11111111-1111-4111-a111-111111111111', '44444444-4444-4444-a444-444444444444',
   'Write the product page copy', NULL, 'in_review', 'medium',
   '2a222222-2222-4222-a222-222222222203', CURRENT_DATE + INTERVAL '4 days'),
  ('66666666-6666-4666-a666-666666666609', '11111111-1111-4111-a111-111111111111', '44444444-4444-4444-a444-444444444444',
   'Accessibility audit of the new pages', NULL, 'todo', 'high',
   NULL, CURRENT_DATE + INTERVAL '5 weeks'),
  ('66666666-6666-4666-a666-666666666610', '11111111-1111-4111-a111-111111111111', '55555555-5555-4555-a555-555555555555',
   'Define the MVP feature scope', NULL, 'in_progress', 'high',
   '2a222222-2222-4222-a222-222222222204', CURRENT_DATE + INTERVAL '1 week'),
  ('66666666-6666-4666-a666-666666666611', '11111111-1111-4111-a111-111111111111', '55555555-5555-4555-a555-555555555555',
   'Build the competitor feature matrix', NULL, 'todo', 'medium',
   '2a222222-2222-4222-a222-222222222202', CURRENT_DATE + INTERVAL '2 weeks'),
  ('66666666-6666-4666-a666-666666666612', '11111111-1111-4111-a111-111111111111', '55555555-5555-4555-a555-555555555555',
   'Sketch the first wireframes', NULL, 'todo', 'low',
   '2a222222-2222-4222-a222-222222222201', CURRENT_DATE + INTERVAL '3 weeks'),
  ('66666666-6666-4666-a666-666666666613', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777701',
   'Review the inventory API contract', NULL, 'in_review', 'urgent',
   '2a222222-2222-4222-a222-222222222204', CURRENT_DATE - INTERVAL '3 days'),
  ('66666666-6666-4666-a666-666666666614', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777701',
   'Payment provider integration spike', NULL, 'cancelled', 'high',
   '2a222222-2222-4222-a222-222222222202', CURRENT_DATE - INTERVAL '2 weeks'),
  ('66666666-6666-4666-a666-666666666615', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777701',
   'Migrate the order history endpoint', NULL, 'todo', 'medium',
   NULL, CURRENT_DATE + INTERVAL '6 weeks'),
  ('66666666-6666-4666-a666-666666666616', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777702',
   'Launch the email sequence', NULL, 'completed', 'high',
   '2a222222-2222-4222-a222-222222222203', CURRENT_DATE - INTERVAL '2 weeks'),
  ('66666666-6666-4666-a666-666666666617', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777702',
   'Publish the social content calendar', NULL, 'completed', 'medium',
   '2a222222-2222-4222-a222-222222222203', CURRENT_DATE - INTERVAL '3 weeks'),
  ('66666666-6666-4666-a666-666666666618', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777702',
   'Write the post-campaign report', NULL, 'in_review', 'medium',
   '2a222222-2222-4222-a222-222222222203', CURRENT_DATE - INTERVAL '5 days'),
  ('66666666-6666-4666-a666-666666666619', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777703',
   'Map the current onboarding funnel', 'Identify every step and drop-off before the revamp.', 'in_progress', 'high',
   '2a222222-2222-4222-a222-222222222201', CURRENT_DATE - INTERVAL '1 day'),
  ('66666666-6666-4666-a666-666666666620', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777703',
   'Draft the welcome checklist', NULL, 'completed', 'medium',
   '2a222222-2222-4222-a222-222222222201', CURRENT_DATE - INTERVAL '2 weeks'),
  ('66666666-6666-4666-a666-666666666621', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777703',
   'A/B test the invitation email', NULL, 'todo', 'medium',
   '2a222222-2222-4222-a222-222222222203', CURRENT_DATE + INTERVAL '1 week'),
  ('66666666-6666-4666-a666-666666666622', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777703',
   'Build the success metric dashboard', NULL, 'todo', 'low',
   NULL, CURRENT_DATE + INTERVAL '4 weeks'),
  ('66666666-6666-4666-a666-666666666623', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777704',
   'Choose the charting library', NULL, 'in_progress', 'medium',
   '2a222222-2222-4222-a222-222222222202', CURRENT_DATE + INTERVAL '3 days'),
  ('66666666-6666-4666-a666-666666666624', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777704',
   'Build the KPI widgets', NULL, 'todo', 'high',
   '2a222222-2222-4222-a222-222222222204', CURRENT_DATE + INTERVAL '2 weeks'),
  ('66666666-6666-4666-a666-666666666625', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777704',
   'Integrate the reporting API', NULL, 'in_review', 'high',
   '2a222222-2222-4222-a222-222222222202', CURRENT_DATE - INTERVAL '2 days'),
  ('66666666-6666-4666-a666-666666666626', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777705',
   'Run user research interviews', NULL, 'todo', 'medium',
   '2a222222-2222-4222-a222-222222222201', CURRENT_DATE + INTERVAL '3 weeks'),
  ('66666666-6666-4666-a666-666666666627', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777705',
   'Analyse the interview findings', NULL, 'todo', 'low',
   NULL, CURRENT_DATE + INTERVAL '5 weeks'),
  ('66666666-6666-4666-a666-666666666628', '11111111-1111-4111-a111-111111111111', '77777777-7777-4777-a777-777777777706',
   'Archive the legacy invoices', NULL, 'cancelled', 'low',
   NULL, CURRENT_DATE - INTERVAL '1 week')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- An inbox that is not empty on the first sign-in.
--
-- The triggers in 03-notifications.sql fire for the task inserts above, so a
-- fresh database already gets a "New task" notification per assigned task.
-- Those use random ids and cannot be upserted; these explicit rows use fixed
-- ids so re-running the script never duplicates them.
-- ---------------------------------------------------------------------------
INSERT INTO notifications (id, tenant_id, user_id, title, message, type, read, data, created_at) VALUES
  (
    '88888888-8888-4888-a888-888888888801',
    '11111111-1111-4111-a111-111111111111',
    '22222222-2222-4222-a222-222222222222',
    'Project on hold',
    'The E-commerce backend migration was put on hold pending the new vendor contract.',
    'warning', false,
    '{"type":"project_update","project_id":"77777777-7777-4777-a777-777777777701","project_name":"E-commerce backend migration","new_status":"on_hold"}',
    NOW() - INTERVAL '3 days'
  ),
  (
    '88888888-8888-4888-a888-888888888802',
    '11111111-1111-4111-a111-111111111111',
    '22222222-2222-4222-a222-222222222222',
    'New team member',
    'Sara Hassan was added to the Website redesign team.',
    'success', false,
    '{"type":"member_added","full_name":"Sara Hassan","project_name":"Website redesign"}',
    NOW() - INTERVAL '1 day'
  ),
  (
    '88888888-8888-4888-a888-888888888803',
    '11111111-1111-4111-a111-111111111111',
    '33333333-3333-4333-a333-333333333333',
    'New task',
    'You have been assigned "Audit the current pages".',
    'info', false,
    '{"type":"task_assigned","task_id":"66666666-6666-4666-a666-666666666601","task_title":"Audit the current pages"}',
    NOW() - INTERVAL '2 days'
  ),
  (
    '88888888-8888-4888-a888-888888888804',
    '11111111-1111-4111-a111-111111111111',
    '33333333-3333-4333-a333-333333333333',
    'Task due soon',
    '"Build the component library" is due in less than a week.',
    'warning', false,
    '{"type":"task_due","task_id":"66666666-6666-4666-a666-666666666602","task_title":"Build the component library"}',
    NOW() - INTERVAL '6 hours'
  ),
  (
    '88888888-8888-4888-a888-888888888805',
    '11111111-1111-4111-a111-111111111111',
    '33333333-3333-4333-a333-333333333333',
    'Task completed',
    'You completed "Audit the current pages".',
    'success', true,
    '{"type":"task_completed","task_id":"66666666-6666-4666-a666-666666666601","task_title":"Audit the current pages"}',
    NOW() - INTERVAL '2 weeks'
  ),
  (
    '88888888-8888-4888-a888-888888888806',
    '11111111-1111-4111-a111-111111111111',
    '2a222222-2222-4222-a222-222222222201',
    'New task',
    'You have been assigned "Map the current onboarding funnel".',
    'info', false,
    '{"type":"task_assigned","task_id":"66666666-6666-4666-a666-666666666619","task_title":"Map the current onboarding funnel"}',
    NOW() - INTERVAL '1 day'
  ),
  (
    '88888888-8888-4888-a888-888888888807',
    '11111111-1111-4111-a111-111111111111',
    '2a222222-2222-4222-a222-222222222201',
    'Project updated',
    'Customer onboarding revamp moved to in_progress.',
    'info', false,
    '{"type":"project_update","project_id":"77777777-7777-4777-a777-777777777703","project_name":"Customer onboarding revamp","new_status":"in_progress"}',
    NOW() - INTERVAL '4 days'
  ),
  (
    '88888888-8888-4888-a888-888888888808',
    '11111111-1111-4111-a111-111111111111',
    '2a222222-2222-4222-a222-222222222202',
    'New task',
    'You have been assigned "Integrate the reporting API".',
    'info', false,
    '{"type":"task_assigned","task_id":"66666666-6666-4666-a666-666666666625","task_title":"Integrate the reporting API"}',
    NOW() - INTERVAL '5 hours'
  ),
  (
    '88888888-8888-4888-a888-888888888809',
    '11111111-1111-4111-a111-111111111111',
    '2a222222-2222-4222-a222-222222222202',
    'Project updated',
    'Reporting dashboard moved to in_progress.',
    'info', true,
    '{"type":"project_update","project_id":"77777777-7777-4777-a777-777777777704","project_name":"Reporting dashboard","new_status":"in_progress"}',
    NOW() - INTERVAL '1 week'
  ),
  (
    '88888888-8888-4888-a888-888888888810',
    '11111111-1111-4111-a111-111111111111',
    '2a222222-2222-4222-a222-222222222203',
    'Overdue task',
    '"Write the post-campaign report" is overdue.',
    'error', false,
    '{"type":"task_overdue","task_id":"66666666-6666-4666-a666-666666666618","task_title":"Write the post-campaign report"}',
    NOW() - INTERVAL '3 hours'
  ),
  (
    '88888888-8888-4888-a888-888888888811',
    '11111111-1111-4111-a111-111111111111',
    '2a222222-2222-4222-a222-222222222203',
    'Milestone',
    'Q4 Marketing campaign was completed.',
    'success', false,
    '{"type":"project_update","project_id":"77777777-7777-4777-a777-777777777702","project_name":"Q4 Marketing campaign","new_status":"completed"}',
    NOW() - INTERVAL '1 week'
  ),
  (
    '88888888-8888-4888-a888-888888888812',
    '11111111-1111-4111-a111-111111111111',
    '2a222222-2222-4222-a222-222222222204',
    'New task',
    'You have been assigned "Review the inventory API contract".',
    'info', false,
    '{"type":"task_assigned","task_id":"66666666-6666-4666-a666-666666666613","task_title":"Review the inventory API contract"}',
    NOW() - INTERVAL '3 days'
  ),
  (
    '88888888-8888-4888-a888-888888888813',
    '11111111-1111-4111-a111-111111111111',
    '2a222222-2222-4222-a222-222222222204',
    'Project on hold',
    'E-commerce backend migration moved to on_hold.',
    'warning', true,
    '{"type":"project_update","project_id":"77777777-7777-4777-a777-777777777701","project_name":"E-commerce backend migration","new_status":"on_hold"}',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;
