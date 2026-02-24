-- ============================================================
-- Migration: allow "marketplace" as a valid notification type
-- ============================================================
-- PostgreSQL does not support ALTER TABLE ... ALTER CONSTRAINT,
-- so we must DROP the old check and ADD a new one.
-- This is a non-destructive, zero-downtime operation:
-- existing rows are unaffected; only future inserts/updates
-- are validated against the new constraint.
-- ============================================================

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'price',
    'weather',
    'system',
    'offer',
    'message',
    'marketplace'
  ));
