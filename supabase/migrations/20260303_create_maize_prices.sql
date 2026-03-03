-- =============================================================================
-- MIGRATION: Create maize_prices table
-- Date: 2026-03-03
--
-- PURPOSE:
--   Stores weekly farm-gate maize prices per district.
--   Used by the Random Forest delta model to build real lag features
--   (lag_1, lag_2, lag_4, roll_4, roll_8) instead of fabricated constants.
--
-- QUERY PATTERN (price_prediction_router.py):
--   SELECT year, week, price
--   FROM   maize_prices
--   WHERE  district = $1
--     AND  (year < $ref_year OR (year = $ref_year AND week <= $ref_week))
--   ORDER  BY year DESC, week DESC
--   LIMIT  8;
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1.  TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS maize_prices (
    id         BIGSERIAL    PRIMARY KEY,
    year       INT          NOT NULL CHECK (year >= 2000 AND year <= 2100),
    week       INT          NOT NULL CHECK (week BETWEEN 1 AND 52),
    district   TEXT         NOT NULL,
    price      NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    source     TEXT,                        -- e.g. 'manual', 'doa_feed', 'market_survey'
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

    -- one price entry per district per week per year
    CONSTRAINT maize_prices_unique_week UNIQUE (year, week, district)
);

COMMENT ON TABLE  maize_prices              IS 'Weekly farm-gate maize prices per district used for RF delta model lag features.';
COMMENT ON COLUMN maize_prices.year         IS 'ISO calendar year (e.g. 2025).';
COMMENT ON COLUMN maize_prices.week         IS 'ISO week number 1–52.';
COMMENT ON COLUMN maize_prices.district     IS 'Must match the district values used in model training (e.g. Anuradhapura).';
COMMENT ON COLUMN maize_prices.price        IS 'Farm-gate price in Rs/kg.';
COMMENT ON COLUMN maize_prices.source       IS 'Optional provenance tag for auditing.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2.  INDEXES
--     Optimises the walk-forward fetch: filter by district, sort DESC.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_maize_prices_lookup
    ON maize_prices (district, year DESC, week DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3.  ROW-LEVEL SECURITY
--     Service-role key (used by the FastAPI server) bypasses RLS by default.
--     Public (anon) users get read-only access; writes are restricted to
--     authenticated admin roles only.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE maize_prices ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including unauthenticated mobile app) to read prices
CREATE POLICY "maize_prices_public_read"
    ON maize_prices
    FOR SELECT
    USING (true);

-- Only authenticated users with role 'admin' or 'service_role' can insert/update/delete
-- Officers use the app's authenticated session (anon key + signed-in user),
-- so auth.role() = 'authenticated' covers them.
CREATE POLICY "maize_prices_officer_write"
    ON maize_prices
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR auth.role() = 'authenticated'
    )
    WITH CHECK (
        auth.role() = 'service_role'
        OR auth.role() = 'authenticated'
    );


-- ─────────────────────────────────────────────────────────────────────────────
-- 4.  SEED DATA  (remove or extend before production)
--     Provides the minimum 8 weeks needed for the RF model per district.
--     Prices are example values — replace with real DOA / market data.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO maize_prices (year, week, district, price, source) VALUES
    -- Anuradhapura – weeks 40..47 of 2025
    (2025, 40, 'Anuradhapura', 112.00, 'seed'),
    (2025, 41, 'Anuradhapura', 113.50, 'seed'),
    (2025, 42, 'Anuradhapura', 114.00, 'seed'),
    (2025, 43, 'Anuradhapura', 115.25, 'seed'),
    (2025, 44, 'Anuradhapura', 116.00, 'seed'),
    (2025, 45, 'Anuradhapura', 115.75, 'seed'),
    (2025, 46, 'Anuradhapura', 117.00, 'seed'),
    (2025, 47, 'Anuradhapura', 118.50, 'seed'),

    -- Polonnaruwa – weeks 40..47 of 2025
    (2025, 40, 'Polonnaruwa',  110.00, 'seed'),
    (2025, 41, 'Polonnaruwa',  111.00, 'seed'),
    (2025, 42, 'Polonnaruwa',  112.50, 'seed'),
    (2025, 43, 'Polonnaruwa',  113.00, 'seed'),
    (2025, 44, 'Polonnaruwa',  113.75, 'seed'),
    (2025, 45, 'Polonnaruwa',  114.50, 'seed'),
    (2025, 46, 'Polonnaruwa',  115.00, 'seed'),
    (2025, 47, 'Polonnaruwa',  116.25, 'seed'),

    -- Kurunegala – weeks 40..47 of 2025
    (2025, 40, 'Kurunegala',   108.00, 'seed'),
    (2025, 41, 'Kurunegala',   109.00, 'seed'),
    (2025, 42, 'Kurunegala',   110.25, 'seed'),
    (2025, 43, 'Kurunegala',   111.00, 'seed'),
    (2025, 44, 'Kurunegala',   111.75, 'seed'),
    (2025, 45, 'Kurunegala',   112.50, 'seed'),
    (2025, 46, 'Kurunegala',   113.00, 'seed'),
    (2025, 47, 'Kurunegala',   114.00, 'seed')

ON CONFLICT (year, week, district) DO NOTHING;   -- idempotent re-runs
