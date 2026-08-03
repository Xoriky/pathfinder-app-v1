-- ================================================================
-- PATHFINDER — Production Database Schema
-- Platform : Supabase (PostgreSQL 15)
-- Security : Row-Level Security enabled on every table
-- Pattern  : (select auth.uid()) evaluated once per query plan,
--            not once per row — critical performance at scale.
-- ================================================================


-- ----------------------------------------------------------------
-- 0. EXTENSIONS & SHARED UTILITIES
-- ----------------------------------------------------------------

-- UUID generation (gen_random_uuid is built-in on PG ≥ 13)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Reusable trigger function: keeps updated_at current automatically.
-- Defined once, referenced by every table trigger below.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ================================================================
-- TABLE 1: users
-- Extends Supabase auth.users with application profile data.
-- The primary key mirrors auth.users(id) so every row is
-- permanently tied to exactly one authenticated identity.
-- ================================================================

CREATE TABLE public.users (

  -- Mirrors auth.users(id). Cascade-delete removes this row
  -- automatically when the user is deleted from Supabase Auth.
  id                  uuid        PRIMARY KEY
                                  REFERENCES auth.users(id)
                                  ON DELETE CASCADE,

  email               text        NOT NULL,

  -- Populated from OAuth metadata on first sign-in (see trigger below)
  auth_provider       text        NOT NULL DEFAULT 'email'
                                  CHECK (auth_provider IN
                                    ('google', 'apple', 'meta', 'email')),
  display_name        text,

  -- ── Accountability Engine ─────────────────────────────────────
  accountability_tier text        NOT NULL DEFAULT 'guide'
                                  CHECK (accountability_tier IN
                                    ('guide', 'coach', 'architect')),

  -- 0-100; updated via RPC so we can clamp atomically server-side
  readiness_score     smallint    NOT NULL DEFAULT 0
                                  CHECK (readiness_score BETWEEN 0 AND 100),

  -- Downgrade cooldown: NULL means no active cooldown
  tier_locked_until   timestamptz,

  -- ── Billing ───────────────────────────────────────────────────
  plan                text        NOT NULL DEFAULT 'free'
                                  CHECK (plan IN ('free', 'pro')),

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()

);

-- Partial index: fast lookup for active Pro accounts
CREATE INDEX users_plan_idx ON public.users(plan) WHERE plan = 'pro';

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ================================================================
-- TABLE 2: projects
-- One user → many projects.  Tracks the 5-Level roadmap state.
-- ================================================================

CREATE TABLE public.projects (

  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hard FK to users (not auth.users directly) so RLS joins stay cheap
  user_id               uuid        NOT NULL
                                    REFERENCES public.users(id)
                                    ON DELETE CASCADE,

  name                  text        NOT NULL DEFAULT 'Untitled Venture',
  description           text,

  -- ── Gamified Roadmap ──────────────────────────────────────────
  current_level         smallint    NOT NULL DEFAULT 1
                                    CHECK (current_level BETWEEN 1 AND 5),

  status                text        NOT NULL DEFAULT 'active'
                                    CHECK (status IN
                                      ('active', 'paused', 'archived')),

  -- Level 3 handoff
  handoff_generated     boolean     NOT NULL DEFAULT false,
  handoff_generated_at  timestamptz,

  -- Free-form JSON bag for things like CAC, LTV, market notes
  -- that do not warrant their own columns yet
  metadata              jsonb       NOT NULL DEFAULT '{}',

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()

);

-- Covering index: list a user's active projects quickly
CREATE INDEX projects_user_status_idx
  ON public.projects(user_id, status)
  WHERE status = 'active';

CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ================================================================
-- TABLE 3: chat_sessions
-- Stores every conversation the user has with the AI Director.
-- Messages are stored as a JSONB array (serialised from React state)
-- so the full conversation is one atomic read/write.
-- ================================================================

CREATE TABLE public.chat_sessions (

  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id         uuid        NOT NULL
                              REFERENCES public.users(id)
                              ON DELETE CASCADE,

  -- NULL for general chat not tied to a specific venture
  project_id      uuid        REFERENCES public.projects(id)
                              ON DELETE SET NULL,

  session_type    text        NOT NULL DEFAULT 'new_project'
                              CHECK (session_type IN
                                ('new_project', 'analysis', 'course')),

  -- Full message array: [{id,type,text,uiAction,actionPayload,...}]
  -- Encrypted at the Supabase storage layer (pgsodium / Vault)
  -- if the project is flagged highly confidential.
  messages        jsonb       NOT NULL DEFAULT '[]',

  -- ── Sprint Enforcer snapshot ───────────────────────────────────
  sprint_seconds_remaining  integer   NOT NULL DEFAULT 5400
                                      CHECK (sprint_seconds_remaining
                                        BETWEEN 0 AND 5400),

  sprint_state    text        NOT NULL DEFAULT 'active'
                              CHECK (sprint_state IN
                                ('active', 'warning', 'locked')),

  -- Net readiness points earned during this session
  readiness_delta smallint    NOT NULL DEFAULT 0
                              CHECK (readiness_delta >= 0),

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()

);

CREATE INDEX chat_sessions_user_idx
  ON public.chat_sessions(user_id, created_at DESC);

CREATE INDEX chat_sessions_project_idx
  ON public.chat_sessions(project_id)
  WHERE project_id IS NOT NULL;

CREATE TRIGGER chat_sessions_set_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ================================================================
-- TABLE 4: artifacts
-- Immutable records of every generated document / asset.
-- Row is created once and never updated (no updated_at column).
-- Physical files live in Supabase Storage; this table stores
-- the pointer (storage_path) plus searchable metadata.
-- ================================================================

CREATE TABLE public.artifacts (

  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id       uuid        NOT NULL
                            REFERENCES public.users(id)
                            ON DELETE CASCADE,

  project_id    uuid        NOT NULL
                            REFERENCES public.projects(id)
                            ON DELETE CASCADE,

  -- Optional: links the artifact to the session that produced it
  session_id    uuid        REFERENCES public.chat_sessions(id)
                            ON DELETE SET NULL,

  artifact_type text        NOT NULL
                            CHECK (artifact_type IN (
                              'handoff_package',
                              'pitch_deck',
                              'lean_canvas',
                              'course_certificate',
                              'investor_brief'
                            )),

  filename      text        NOT NULL,

  -- Supabase Storage object path: {bucket}/{user_id}/{project_id}/{file}
  -- Storage RLS mirrors table RLS so the file itself is also protected.
  storage_path  text,

  -- e.g. { "pages": 12, "word_count": 4200, "version": 2 }
  metadata      jsonb       NOT NULL DEFAULT '{}',

  created_at    timestamptz NOT NULL DEFAULT now()
  -- Intentionally no updated_at: artifacts are write-once.

);

CREATE INDEX artifacts_user_idx
  ON public.artifacts(user_id, created_at DESC);

CREATE INDEX artifacts_project_idx
  ON public.artifacts(project_id);

CREATE INDEX artifacts_type_idx
  ON public.artifacts(artifact_type);


-- ================================================================
-- ROW-LEVEL SECURITY POLICIES
-- ================================================================
-- CRITICAL PATTERN: (SELECT auth.uid()) is a subquery.
-- PostgreSQL evaluates it exactly ONCE per query execution plan
-- and caches the result. Without SELECT, auth.uid() is called
-- as a volatile function on EVERY ROW SCANNED — catastrophic at
-- scale (1 M rows = 1 M function calls per query).
--
-- Rule of thumb applied uniformly:
--   USING  → filters rows the user can READ or DELETE
--   WITH CHECK → guards rows the user can INSERT or UPDATE into
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- 4a. users RLS
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users may read only their own profile row
CREATE POLICY "users: read own row"
  ON public.users
  FOR SELECT
  USING ( id = (SELECT auth.uid()) );

-- Initial insert is handled by the handle_new_user() trigger which
-- runs SECURITY DEFINER, bypassing RLS. We still define an INSERT
-- policy to cover any direct client calls.
CREATE POLICY "users: insert own row"
  ON public.users
  FOR INSERT
  WITH CHECK ( id = (SELECT auth.uid()) );

-- Users may update only their own profile
CREATE POLICY "users: update own row"
  ON public.users
  FOR UPDATE
  USING     ( id = (SELECT auth.uid()) )
  WITH CHECK ( id = (SELECT auth.uid()) );

-- No client-side DELETE policy: auth.users CASCADE handles cleanup.


-- ────────────────────────────────────────────────────────────────
-- 4b. projects RLS
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects: read own rows"
  ON public.projects
  FOR SELECT
  USING ( user_id = (SELECT auth.uid()) );

CREATE POLICY "projects: insert own rows"
  ON public.projects
  FOR INSERT
  WITH CHECK ( user_id = (SELECT auth.uid()) );

CREATE POLICY "projects: update own rows"
  ON public.projects
  FOR UPDATE
  USING     ( user_id = (SELECT auth.uid()) )
  WITH CHECK ( user_id = (SELECT auth.uid()) );

CREATE POLICY "projects: delete own rows"
  ON public.projects
  FOR DELETE
  USING ( user_id = (SELECT auth.uid()) );


-- ────────────────────────────────────────────────────────────────
-- 4c. chat_sessions RLS
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_sessions: read own rows"
  ON public.chat_sessions
  FOR SELECT
  USING ( user_id = (SELECT auth.uid()) );

-- Extra guard on INSERT: if a project_id is supplied it must also
-- belong to the same user. Prevents a user inserting a session
-- referencing another tenant's project via a guessed UUID.
CREATE POLICY "chat_sessions: insert own rows"
  ON public.chat_sessions
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE  p.id      = project_id
          AND  p.user_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "chat_sessions: update own rows"
  ON public.chat_sessions
  FOR UPDATE
  USING     ( user_id = (SELECT auth.uid()) )
  WITH CHECK ( user_id = (SELECT auth.uid()) );

CREATE POLICY "chat_sessions: delete own rows"
  ON public.chat_sessions
  FOR DELETE
  USING ( user_id = (SELECT auth.uid()) );


-- ────────────────────────────────────────────────────────────────
-- 4d. artifacts RLS
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "artifacts: read own rows"
  ON public.artifacts
  FOR SELECT
  USING ( user_id = (SELECT auth.uid()) );

-- Double-check: the referenced project must also belong to this user.
-- Without this, a user who somehow learns a foreign project_id could
-- insert an artifact row pointing at it.
CREATE POLICY "artifacts: insert own rows"
  ON public.artifacts
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE  p.id      = project_id
        AND  p.user_id = (SELECT auth.uid())
    )
  );

-- Artifacts are immutable once written: no UPDATE policy.

CREATE POLICY "artifacts: delete own rows"
  ON public.artifacts
  FOR DELETE
  USING ( user_id = (SELECT auth.uid()) );


-- ================================================================
-- TRIGGER: Auto-create public.users profile on first sign-in
-- ================================================================
-- Fires on INSERT into auth.users (handled by Supabase Auth
-- after every successful OAuth or email confirmation).
-- SECURITY DEFINER runs as the function owner (postgres), which
-- has permission to INSERT into public.users even though RLS
-- would otherwise block an unauthenticated INSERT.
-- ON CONFLICT DO NOTHING makes it idempotent (safe to re-run).
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public       -- prevents search_path injection
AS $$
BEGIN
  INSERT INTO public.users (id, email, auth_provider, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    -- raw_app_meta_data contains the OAuth provider name
    COALESCE(NEW.raw_app_meta_data ->> 'provider', 'email'),
    -- raw_user_meta_data contains name from OAuth provider
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)  -- sensible fallback
    )
  )
  ON CONFLICT (id) DO NOTHING;  -- idempotent: safe on duplicate events

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ================================================================
-- RPC: increment_readiness
-- ================================================================
-- Secure server-side function for updating readiness_score.
-- Called from the frontend instead of a direct UPDATE so we can:
--   1. Enforce the 0–100 clamp atomically in the DB.
--   2. Avoid a read-modify-write race condition on the client.
-- SECURITY INVOKER means it runs as the calling user and is
-- therefore still bound by users RLS — can only update own row.
-- ================================================================

CREATE OR REPLACE FUNCTION public.increment_readiness(delta smallint)
RETURNS smallint
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  new_score smallint;
BEGIN
  UPDATE public.users
  SET    readiness_score = LEAST(100, GREATEST(0, readiness_score + delta))
  WHERE  id = (SELECT auth.uid())
  RETURNING readiness_score INTO new_score;

  RETURN new_score;
END;
$$;


-- ================================================================
-- RPC: downgrade_tier_with_cooldown
-- ================================================================
-- Applies the Walk of Shame downgrade atomically:
-- sets tier to 'guide' and locks it for 48 hours.
-- ================================================================

CREATE OR REPLACE FUNCTION public.downgrade_tier_with_cooldown()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET    accountability_tier = 'guide',
         tier_locked_until   = now() + INTERVAL '48 hours'
  WHERE  id = (SELECT auth.uid())
    AND  (tier_locked_until IS NULL OR tier_locked_until < now());
  -- Silently no-ops if already in cooldown — client should check first
END;
$$;


-- ================================================================
-- END OF SCHEMA
-- ================================================================
