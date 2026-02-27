-- =============================================================================
-- MIGRATION: Add updated_at column to posts table
-- Date: 2026-02-27
--
-- CHANGES:
--   1. Add updated_at (timestamptz) to posts, defaulting to created_at
--      so existing rows get a sensible initial value.
--   2. Add a trigger to keep updated_at current on every UPDATE
--      (failsafe — the application layer also sets it explicitly).
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1.  ADD COLUMN (safe: IF NOT EXISTS)
--     Default to created_at so existing rows are not left with NULL.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Back-fill existing rows: set updated_at = created_at where still equal
-- to the column default (i.e. they have never been updated).
UPDATE posts
SET    updated_at = created_at
WHERE  updated_at IS NOT DISTINCT FROM now();


-- ─────────────────────────────────────────────────────────────────────────────
-- 2.  TRIGGER — auto-set updated_at on every UPDATE
--     Uses the moddatetime extension (enabled by default in Supabase) or
--     falls back to a plain trigger function.
-- ─────────────────────────────────────────────────────────────────────────────

-- Create a reusable trigger function if it doesn't already exist
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Attach trigger to posts (drop first to avoid duplicate)
DROP TRIGGER IF EXISTS trg_posts_set_updated_at ON posts;

CREATE TRIGGER trg_posts_set_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
