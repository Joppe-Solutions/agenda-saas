ALTER TABLE merchants ADD COLUMN cancellation_deadline_hours INTEGER DEFAULT 24;
ALTER TABLE merchants ADD COLUMN cancellation_refund_percentage INTEGER DEFAULT 0;

CREATE INDEX idx_bookings_status ON bookings(status);
