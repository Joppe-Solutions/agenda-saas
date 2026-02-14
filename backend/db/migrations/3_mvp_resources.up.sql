-- Resource Types (templates)
CREATE TYPE resource_type AS ENUM (
  'BOAT',
  'SPORTS_COURT', 
  'CONSULTING_ROOM',
  'EVENT_SPACE',
  'EQUIPMENT',
  'PROFESSIONAL',
  'VACATION_RENTAL',
  'OTHER'
);

-- Booking Status (extended)
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
DROP TYPE IF EXISTS booking_status;
CREATE TYPE booking_status AS ENUM (
  'pending_payment',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

-- Add signal config to merchants
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS signal_percentage INTEGER DEFAULT 50;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS signal_deadline_minutes INTEGER DEFAULT 120;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS signal_auto_cancel BOOLEAN DEFAULT TRUE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS city TEXT;

-- Rename assets to resources and add fields
ALTER TABLE assets RENAME TO resources;

ALTER TABLE resources ADD COLUMN IF NOT EXISTS resource_type resource_type DEFAULT 'OTHER';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS terms TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS buffer_before_minutes INTEGER DEFAULT 0;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS buffer_after_minutes INTEGER DEFAULT 0;

-- Availability Rules
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 60,
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(resource_id, day_of_week, start_time)
);

CREATE INDEX idx_availability_rules_resource_id ON availability_rules(resource_id);

-- Blocks (maintenance, vacation, weather, etc.)
CREATE TYPE block_reason AS ENUM ('maintenance', 'vacation', 'weather', 'other');

CREATE TABLE blocks (
  id UUID PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason block_reason NOT NULL DEFAULT 'other',
  notes TEXT,
  recurring JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blocks_resource_id ON blocks(resource_id);
CREATE INDEX idx_blocks_time_range ON blocks(resource_id, start_time, end_time);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  document TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(merchant_id, phone)
);

CREATE INDEX idx_customers_merchant_id ON customers(merchant_id);

-- Customer Tags
CREATE TABLE customer_tags (
  id UUID PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#FFB800',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_tags_merchant_id ON customer_tags(merchant_id);

-- Customer Tag Assignments
CREATE TABLE customer_tag_assignments (
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, tag_id)
);

-- Update bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS signal_expires_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2);

-- Update bookings foreign key
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_asset_id_fkey;
ALTER TABLE bookings RENAME COLUMN asset_id TO resource_id;
ALTER TABLE bookings ADD CONSTRAINT bookings_resource_id_fkey 
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT;

-- Update payments foreign key  
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_booking_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_booking_id_fkey 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- Create index for signal expiration job
CREATE INDEX idx_bookings_signal_expires ON bookings(status, signal_expires_at) 
  WHERE status = 'pending_payment' AND signal_expires_at IS NOT NULL;