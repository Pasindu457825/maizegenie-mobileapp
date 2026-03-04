-- =============================================================================
-- MIGRATION: Add fuel_price and import_tax to maize_prices
-- Date: 2026-03-04
--
-- PURPOSE:
--   Extends maize_prices table to store fuel and import tax alongside
--   district-specific maize prices. This eliminates the need for a separate
--   global price_config table and enables district-level granularity for
--   price calculations.
--
-- CHANGES:
--   - Add fuel_price column (NUMERIC, Rs/liter)
--   - Add import_tax column (NUMERIC, percentage)
--   - Add updated_at column (TIMESTAMPTZ, for tracking updates)
--   - Rename 'created_at' behavior with updated_at to track modifications
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- Add new columns to maize_prices table
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE maize_prices
ADD COLUMN fuel_price NUMERIC(10, 2) DEFAULT NULL,
ADD COLUMN import_tax NUMERIC(5, 2) DEFAULT NULL,
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- Document the new columns
COMMENT ON COLUMN maize_prices.fuel_price   IS 'Fuel price for the week in Rs/liter (used in price calculation model).';
COMMENT ON COLUMN maize_prices.import_tax   IS 'Corn import tax percentage for the week (used in price calculation model).';
COMMENT ON COLUMN maize_prices.updated_at   IS 'Timestamp of last update (allows tracking modifications to records).';


-- ─────────────────────────────────────────────────────────────────────────────
-- Create an index on updated_at to optimize queries filtering by recent updates
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_maize_prices_updated_at
    ON maize_prices (updated_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- Update RLS policies if needed (existing policies should still work)
-- No changes needed - existing RLS policies already allow write access
-- ─────────────────────────────────────────────────────────────────────────────
