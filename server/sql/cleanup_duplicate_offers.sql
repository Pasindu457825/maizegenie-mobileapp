-- Cleanup duplicate offers (keep newest, delete older duplicates)
-- Run this as a superuser or with appropriate permissions

-- Step 1: Identify duplicate offers (same post & buyer, multiple offers)
SELECT post_id, buyer_id, COUNT(*) as offer_count
FROM offers
GROUP BY post_id, buyer_id
HAVING COUNT(*) > 1
ORDER BY offer_count DESC;

-- Step 2: Keep only the newest offer for each (post, buyer) combination
DELETE FROM offers
WHERE id NOT IN (
  SELECT DISTINCT ON (post_id, buyer_id) id
  FROM offers
  ORDER BY post_id, buyer_id, created_at DESC
);

-- Step 3: Verify cleanup
SELECT post_id, buyer_id, COUNT(*) as offer_count
FROM offers
GROUP BY post_id, buyer_id
HAVING COUNT(*) > 1
ORDER BY offer_count DESC;

-- Should return 0 rows if cleanup successful
