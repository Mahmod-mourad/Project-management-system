-- A minimal stand-in for the parts of Supabase's auth schema that scripts/
-- references, so CI can apply the whole schema to a plain PostgreSQL service
-- container.
--
-- Not part of the application, and never applied to a real database: Supabase
-- creates these tables itself, with many more columns. This covers only what
-- 02-profiles-projects-tasks.sql and 04-seed-demo-data.sql touch.
CREATE SCHEMA IF NOT EXISTS auth;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS auth.users (
  instance_id UUID,
  id UUID PRIMARY KEY,
  aud VARCHAR(255),
  role VARCHAR(255),
  email VARCHAR(255),
  encrypted_password VARCHAR(255),
  email_confirmed_at TIMESTAMPTZ,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS auth.identities (
  id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  identity_data JSONB NOT NULL,
  provider TEXT NOT NULL,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (provider_id, provider)
);
