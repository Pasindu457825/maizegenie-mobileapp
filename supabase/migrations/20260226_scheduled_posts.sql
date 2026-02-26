-- =============================================================================
-- MIGRATION: Scheduled Post Publishing Support
-- Date: 2026-02-26
--
-- CHANGES:
--   1. Add publish_at (timestamptz, nullable) to posts
--   2. Add visible (boolean, default true) to posts
--   3. Extend status check to allow 'scheduled'
--   4. Update RLS policies:
--        SELECT — active/sold visible to all; scheduled only to owner
--        UPDATE — farmers can update active OR scheduled own posts
--        DELETE — farmers can delete active OR scheduled own posts
--   5. Add auto-publish function + scheduled trigger via pg_cron (optional)
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1.  ADD COLUMNS (safe: IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS publish_at  TIMESTAMPTZ   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS visible     BOOLEAN       NOT NULL DEFAULT TRUE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2.  EXTEND STATUS CHECK CONSTRAINT to allow 'scheduled'
--     Drop the old check (if it exists) and recreate with 3 values.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM   pg_constraint
    WHERE  conrelid = 'posts'::regclass
    AND    contype  = 'c'                -- check constraint
    AND    pg_get_constraintdef(oid) ILIKE '%active%' -- targets the status column
  LOOP
    EXECUTE format('ALTER TABLE posts DROP CONSTRAINT %I', r.conname);
  END LOOP;
END
$$;

ALTER TABLE posts
  ADD CONSTRAINT posts_status_check
  CHECK (status IN ('active', 'sold', 'scheduled'));


-- ─────────────────────────────────────────────────────────────────────────────
-- 3.  SELECT policy — replaces the old "everyone_can_read_active_posts"
--
--     Rules:
--       a) Any authenticated user can see active or sold posts
--       b) A farmer can ALSO see their own scheduled (not-yet-visible) posts
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "everyone_can_read_active_posts"   ON posts;
DROP POLICY IF EXISTS "read_visible_and_own_scheduled"   ON posts;

CREATE POLICY "read_visible_and_own_scheduled"
ON posts
FOR SELECT
TO authenticated
USING (
  -- Anyone can see active or sold posts
  status IN ('active', 'sold')
  OR
  -- Owner can always see their own scheduled posts
  (status = 'scheduled' AND farmer_id = auth.uid())
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4.  UPDATE policy — farmers can edit active OR scheduled own posts
--     (Replaces the strict "active only" rule so publishNow() works.)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "farmer_update_own_active_post"              ON posts;
DROP POLICY IF EXISTS "farmer_update_own_active_or_scheduled_post" ON posts;

CREATE POLICY "farmer_update_own_active_or_scheduled_post"
ON posts
FOR UPDATE
TO authenticated
USING (
  farmer_id = auth.uid()
  AND status IN ('active', 'scheduled')
)
WITH CHECK (
  farmer_id = auth.uid()   -- cannot transfer ownership
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5.  DELETE policy — farmers can delete active OR scheduled own posts
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "farmer_delete_own_active_post"              ON posts;
DROP POLICY IF EXISTS "farmer_delete_own_active_or_scheduled_post" ON posts;

CREATE POLICY "farmer_delete_own_active_or_scheduled_post"
ON posts
FOR DELETE
TO authenticated
USING (
  farmer_id = auth.uid()
  AND status IN ('active', 'scheduled')
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 6.  AUTO-PUBLISH FUNCTION
--     Called from a pg_cron job OR manually via RPC to flip
--     scheduled posts whose publish_at <= NOW() to active.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auto_publish_scheduled_posts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE posts
  SET
    status     = 'active',
    visible    = TRUE,
    publish_at = NULL          -- clear once published
  WHERE
    status     = 'scheduled'
    AND publish_at IS NOT NULL
    AND publish_at <= NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7.  OPTIONAL: Schedule auto_publish via pg_cron (every 5 minutes)
--     Only runs if pg_cron extension is available.
--     Comment this block out if your Supabase plan does not support pg_cron.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'auto-publish-scheduled-posts',
      '*/5 * * * *',
      'SELECT auto_publish_scheduled_posts()'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- pg_cron not available; auto-publish will be triggered client-side
  NULL;
END;
$$;
