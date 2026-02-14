ALTER TABLE merchants ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS mercado_pago_access_token TEXT;

ALTER TABLE assets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS qr_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS copy_paste_code TEXT;

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'PIX',
  provider TEXT NOT NULL,
  provider_payment_id TEXT NOT NULL,
  qr_code TEXT,
  copy_paste_code TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_id ON payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
