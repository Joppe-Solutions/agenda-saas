-- Migration: Transform to appointment scheduling system
-- This converts the booking system from resource-based to service-based

-- 1. Create new enum types
CREATE TYPE business_category AS ENUM (
  'BEAUTY',
  'HEALTH',
  'WELLNESS',
  'EDUCATION',
  'SERVICES',
  'PET'
);

-- 2. Rename niche to business_category in merchants
ALTER TABLE merchants 
  DROP CONSTRAINT IF EXISTS merchants_niche_check;
  
ALTER TABLE merchants 
  ADD COLUMN IF NOT EXISTS business_category business_category DEFAULT 'SERVICES';

UPDATE merchants SET business_category = 
  CASE 
    WHEN niche::text = 'FISHING' THEN 'SERVICES'::business_category
    WHEN niche::text = 'SPORTS' THEN 'SERVICES'::business_category
    WHEN niche::text = 'TOURISM' THEN 'SERVICES'::business_category
    ELSE 'SERVICES'::business_category
  END;

-- 3. Add new merchant fields
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0891B2';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS require_deposit BOOLEAN DEFAULT TRUE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS deposit_percentage INTEGER DEFAULT 50;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS deposit_deadline_minutes INTEGER DEFAULT 120;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS auto_confirm_on_payment BOOLEAN DEFAULT TRUE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS allow_online_payment BOOLEAN DEFAULT TRUE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS enable_reminders BOOLEAN DEFAULT TRUE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS reminder_hours_before INTEGER DEFAULT 24;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS enable_loyalty BOOLEAN DEFAULT FALSE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS points_per_real INTEGER DEFAULT 1;

-- Rename old columns for backwards compatibility
ALTER TABLE merchants RENAME COLUMN signal_percentage TO deposit_percentage_old;
ALTER TABLE merchants RENAME COLUMN signal_deadline_minutes TO deposit_deadline_minutes_old;
ALTER TABLE merchants RENAME COLUMN signal_auto_cancel TO auto_confirm_on_payment_old;

-- 4. Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT DEFAULT '#0891B2',
  "order" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_categories_merchant_id ON service_categories(merchant_id);

-- 5. Rename resources to services and adapt
ALTER TABLE resources RENAME TO services;

-- Add new columns to services
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE services ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS require_deposit BOOLEAN DEFAULT TRUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(12, 2);
ALTER TABLE services ADD COLUMN IF NOT EXISTS deposit_percentage INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS allow_staff_selection BOOLEAN DEFAULT TRUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS max_concurrent_bookings INTEGER DEFAULT 1;

-- Rename columns in services
ALTER TABLE services RENAME COLUMN base_price TO price;
ALTER TABLE services RENAME COLUMN resource_type TO legacy_type;

-- Remove pricing_type (services always have fixed duration/price)
ALTER TABLE services DROP COLUMN IF EXISTS pricing_type;

-- Set duration from old column if exists
UPDATE services SET duration_minutes = COALESCE(duration_minutes, 60);

-- 6. Create staff_members table
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo TEXT,
  bio TEXT,
  active BOOLEAN DEFAULT TRUE,
  commission_percentage NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_members_merchant_id ON staff_members(merchant_id);

-- 7. Create staff_services junction table (many-to-many)
CREATE TABLE IF NOT EXISTS staff_services (
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (staff_id, service_id)
);

-- 8. Create staff_availability table
DROP TABLE IF EXISTS availability_rules;
CREATE TABLE staff_availability (
  id UUID PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, day_of_week, start_time)
);

CREATE INDEX idx_staff_availability_staff_id ON staff_availability(staff_id);

-- 9. Create staff_blocks table (time off)
DROP TABLE IF EXISTS blocks;
CREATE TYPE block_reason AS ENUM ('day_off', 'vacation', 'holiday', 'other');

CREATE TABLE staff_blocks (
  id UUID PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason block_reason NOT NULL DEFAULT 'other',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_blocks_staff_id ON staff_blocks(staff_id);
CREATE INDEX idx_staff_blocks_time_range ON staff_blocks(staff_id, start_time, end_time);

-- 10. Update bookings table
ALTER TABLE bookings RENAME COLUMN resource_id TO service_id;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'PIX';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS loyalty_points_earned INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
ALTER TABLE bookings RENAME COLUMN signal_expires_at TO deposit_expires_at;

-- Remove people_count (not needed for appointments)
ALTER TABLE bookings DROP COLUMN IF EXISTS people_count;

-- Add index for staff-based queries
CREATE INDEX IF NOT EXISTS idx_bookings_staff_date ON bookings(staff_id, booking_date) WHERE staff_id IS NOT NULL;

-- 11. Update customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_spent NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_visit DATE;

-- 12. Clean up old enum types
DROP TYPE IF EXISTS niche;
DROP TYPE IF EXISTS resource_type;

-- 13. Update notifications table
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_booking_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_booking_id_fkey 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- 14. Insert default service categories for existing merchants
INSERT INTO service_categories (id, merchant_id, name, "order", active)
SELECT 
  gen_random_uuid(),
  m.id,
  'Serviços',
  0,
  TRUE
FROM merchants m
WHERE NOT EXISTS (
  SELECT 1 FROM service_categories sc WHERE sc.merchant_id = m.id
);

-- 15. Create a default staff member for each merchant (for existing services)
INSERT INTO staff_members (id, merchant_id, name, active)
SELECT 
  gen_random_uuid(),
  m.id,
  m.business_name || ' - Profissional',
  TRUE
FROM merchants m
WHERE NOT EXISTS (
  SELECT 1 FROM staff_members sm WHERE sm.merchant_id = m.id
);

-- 16. Link existing services to the default staff member
INSERT INTO staff_services (staff_id, service_id)
SELECT 
  sm.id,
  s.id
FROM services s
JOIN merchants m ON s.merchant_id = m.id
JOIN staff_members sm ON sm.merchant_id = m.id
WHERE NOT EXISTS (
  SELECT 1 FROM staff_services ss WHERE ss.service_id = s.id
);

-- 17. Create default availability for staff members (Mon-Fri 9-18)
INSERT INTO staff_availability (id, staff_id, day_of_week, start_time, end_time)
SELECT 
  gen_random_uuid(),
  sm.id,
  d.dow,
  '09:00'::TIME,
  '18:00'::TIME
FROM staff_members sm
CROSS JOIN (SELECT generate_series(1, 5) AS dow) d
WHERE NOT EXISTS (
  SELECT 1 FROM staff_availability sa WHERE sa.staff_id = sm.id
);