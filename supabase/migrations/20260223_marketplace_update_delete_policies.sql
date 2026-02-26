-- =============================================================================
-- MIGRATION: Marketplace Update / Delete — Secure RLS Policies
-- Date: 2026-02-23
--
-- BUSINESS RULES ENCODED HERE:
--   • Buyer  can UPDATE  their OWN offer   only when status = 'pending'
--   • Buyer  can DELETE  their OWN offer   only when status = 'pending'
--   • Farmer can UPDATE  their OWN post    only when status = 'active'
--   • Farmer can DELETE  their OWN post    only when status = 'active'
--
-- OFFER ORPHAN STRATEGY: CASCADE DELETE
--   When a farmer deletes an active post, all its offers are automatically
--   deleted via the FK cascade (set below).  This is the correct behaviour
--   because:
--     - Restricting the delete would trap farmers whose post received only
--       rejected offers, forcing them to manually delete every offer first.
--     - Cascade guarantees no orphaned offer rows ever exist in the DB.
--     - The status guard (active only) already prevents deleting a "sold"
--       post, so the accepted-deal row can never be wiped by accident.
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1.  FK CASCADE — ensure offers are cleaned up when a post is deleted
--     Run this only if the FK was created WITHOUT ON DELETE CASCADE.
--     Safe to re-run: IF EXISTS prevents duplicate constraint errors.
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop the old FK (name may differ; adjust if your constraint has a custom name)
ALTER TABLE offers
  DROP CONSTRAINT IF EXISTS offers_post_id_fkey;

-- Re-create FK with CASCADE
ALTER TABLE offers
  ADD CONSTRAINT offers_post_id_fkey
  FOREIGN KEY (post_id)
  REFERENCES posts(id)
  ON DELETE CASCADE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2.  OFFERS — UPDATE policy
--     Only the buyer who created the offer can update it,
--     and ONLY while the offer is still pending.
--
--     USING  clause  = which rows the user is allowed to "see" for UPDATE
--     WITH CHECK clause = the new row state must ALSO pass these conditions
--                         (prevents a buyer from e.g. changing buyer_id)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "buyer_update_own_pending_offer" ON offers;

CREATE POLICY "buyer_update_own_pending_offer"
ON offers
FOR UPDATE
TO authenticated
USING (
  buyer_id = auth.uid()       -- caller owns this offer
  AND status = 'pending'      -- offer has not been actioned yet
)
WITH CHECK (
  buyer_id = auth.uid()       -- new row must still belong to caller
  AND status = 'pending'      -- status cannot be self-escalated by buyer
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3.  OFFERS — DELETE policy
--     Only the buyer who created the offer can delete it,
--     and ONLY while the offer is still pending.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "buyer_delete_own_pending_offer" ON offers;

CREATE POLICY "buyer_delete_own_pending_offer"
ON offers
FOR DELETE
TO authenticated
USING (
  buyer_id = auth.uid()
  AND status = 'pending'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4.  POSTS — UPDATE policy
--     Farmers can update their own posts, but ONLY while the post is active.
--     This blocks edits to sold posts at the DB level.
--
--     WITH CHECK does NOT re-restrict status so that:
--       a) acceptOffer() can still flip status → 'sold' via its own policy
--       b) The farmer can update any field on their active post
--     We keep WITH CHECK bound to farmer_id only to prevent ownership theft.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "farmer_update_own_active_post" ON posts;

CREATE POLICY "farmer_update_own_active_post"
ON posts
FOR UPDATE
TO authenticated
USING (
  farmer_id = auth.uid()
  AND status = 'active'
)
WITH CHECK (
  farmer_id = auth.uid()      -- cannot transfer ownership
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5.  POSTS — DELETE policy
--     Farmers can delete their own active posts.
--     Sold posts cannot be deleted — the transaction record must be preserved.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "farmer_delete_own_active_post" ON posts;

CREATE POLICY "farmer_delete_own_active_post"
ON posts
FOR DELETE
TO authenticated
USING (
  farmer_id = auth.uid()
  AND status = 'active'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 6.  Sanity-check: existing policies still in force
--
--     These policies are from the previous migration and must stay intact:
--       • "farmers_insert_own_posts"           — INSERT on posts
--       • "everyone_can_read_active_posts"      — SELECT on posts
--       • "buyers_insert_own_offers"            — INSERT on offers
--       • "farmer_update_offer_status"          — UPDATE on offers (accept/reject)
--
--     No changes needed; listing only for documentation clarity.
-- ─────────────────────────────────────────────────────────────────────────────
