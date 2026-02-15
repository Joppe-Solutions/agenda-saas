-- Rollback migration: appointment system to resource system

-- This is a destructive rollback - data will be lost

-- 1. Restore old enum types
CREATE TYPE niche AS ENUM ('FISHING', 'SPORTS', 'TOURISM', 'SERVICES');
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

-- 2. Drop new tables
DROP TABLE IF EXISTS staff_services;
DROP TABLE IF EXISTS staff_blocks;
DROP TABLE IF EXISTS staff_availability;
DROP TABLE IF EXISTS staff_members;
DROP TABLE IF EXISTS service_categories;

-- 3. Restore resources table
ALTER TABLE services RENAME TO resources;
ALTER TABLE resources RENAME COLUMN price TO base_price;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS resource_type resource_type DEFAULT 'OTHER';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'FULL_DAY';

-- 4. Restore merchants columns
ALTER TABLE merchants DROP COLUMN IF EXISTS business_category;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS niche niche DEFAULT 'SERVICES';

-- 5. Restore bookings
ALTER TABLE bookings RENAME COLUMN service_id TO resource_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS staff_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_method;
ALTER TABLE bookings DROP COLUMN IF EXISTS loyalty_points_earned;
ALTER TABLE bookings DROP COLUMN IF EXISTS reminder_sent_at;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS people_count INTEGER DEFAULT 1;

-- 6. Drop new enum types
DROP TYPE IF EXISTS business_category;
DROP TYPE IF EXISTS block_reason;

-- Note: This rollback does not restore all data - it's structural only