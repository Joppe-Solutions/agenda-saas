DROP INDEX IF EXISTS idx_bookings_status;
ALTER TABLE merchants DROP COLUMN IF EXISTS cancellation_refund_percentage;
ALTER TABLE merchants DROP COLUMN IF EXISTS cancellation_deadline_hours;
