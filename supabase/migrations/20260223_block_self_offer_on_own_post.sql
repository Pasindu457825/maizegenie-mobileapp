-- =============================================================================
-- MIGRATION: Block farmer self-offer at DB level
-- Date: 2026-02-23
--
-- BUSINESS RULE:
--   A user must NEVER be able to insert an offer on a post they own.
--   i.e.  offers.buyer_id  ≠  posts.farmer_id  (for the matching post_id)
--
-- WHY DB-LEVEL ENFORCEMENT IS MANDATORY
-- ──────────────────────────────────────
-- Frontend guards (hiding the button, checking isFarmer) are client-side code.
-- Any authenticated user can bypass the app entirely and call the Supabase
-- REST/PostgREST endpoint directly with a valid JWT:
--
--   curl -X POST https://<project>.supabase.co/rest/v1/offers \
--     -H "Authorization: Bearer <farmer-jwt>" \
--     -H "Content-Type: application/json" \
--     -d '{"post_id":"...","buyer_id":"...","offer_price_per_kg":50}'
--
-- Without an RLS WITH CHECK clause, this INSERT would succeed even though
-- the farmer owns the post.  The DB is the last line of defence and must
-- enforce every security invariant independently of the client layer.
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- Drop the old INSERT policy that only checked buyer_id = auth.uid()
-- (policy name may differ; adjust if your original name was different)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "buyers_insert_own_offers" ON offers;
DROP POLICY IF EXISTS "insert own offer"          ON offers;   -- alternate name


-- ─────────────────────────────────────────────────────────────────────────────
-- New INSERT policy:
--   1. buyer_id must equal the authenticated user's UID (ownership check)
--   2. The post being targeted must NOT be owned by the same UID (self-offer block)
--
-- The EXISTS sub-query reads from `posts` which is SELECT-accessible by
-- authenticated users ("read posts" SELECT policy), so the planner can
-- resolve the join correctly inside the policy check.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "insert own offer"
ON offers
FOR INSERT
TO authenticated
WITH CHECK (
  -- caller must be the buyer listed on the row
  buyer_id = auth.uid()

  -- caller must NOT be the farmer who posted the post
  AND NOT EXISTS (
    SELECT 1
    FROM   posts
    WHERE  posts.id         = offers.post_id
    AND    posts.farmer_id  = auth.uid()
  )
);
