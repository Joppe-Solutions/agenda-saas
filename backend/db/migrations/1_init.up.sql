CREATE TYPE niche AS ENUM ('FISHING', 'SPORTS', 'TOURISM', 'SERVICES');
CREATE TYPE pricing_type AS ENUM ('FULL_DAY', 'HOURLY');
CREATE TYPE booking_status AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED');

CREATE TABLE merchants (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  niche niche NOT NULL,
  whatsapp_number TEXT NOT NULL,
  pix_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assets (
  id UUID PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
  pricing_type pricing_type NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  people_count INTEGER NOT NULL CHECK (people_count > 0),
  status booking_status NOT NULL,
  deposit_amount NUMERIC(12, 2) NOT NULL CHECK (deposit_amount >= 0),
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assets_merchant_id ON assets(merchant_id);
CREATE INDEX idx_bookings_asset_date ON bookings(asset_id, booking_date);
CREATE INDEX idx_bookings_merchant_id ON bookings(merchant_id);
