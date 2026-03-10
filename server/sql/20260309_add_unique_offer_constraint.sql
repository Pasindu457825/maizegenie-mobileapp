-- Migration: Add unique constraint to prevent duplicate offers
-- This ensures only one offer per (post_id, buyer_id) combination

-- Check if constraint already exists
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'offers' 
  AND constraint_type = 'UNIQUE'
  AND constraint_name = 'unique_offer_per_post_buyer';

-- Add constraint if it doesn't exist (DROP old one first if it exists with different name)
ALTER TABLE offers
ADD CONSTRAINT unique_offer_per_post_buyer UNIQUE (post_id, buyer_id);

-- Note: If you get an error about existing duplicates, run cleanup_duplicate_offers.sql first
