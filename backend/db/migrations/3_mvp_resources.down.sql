-- Drop indexes
DROP INDEX IF EXISTS idx_bookings_signal_expires;

-- Revert payments foreign key
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_booking_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_booking_id_fkey 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- Revert bookings changes
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_resource_id_fkey;
ALTER TABLE bookings RENAME COLUMN resource_id TO asset_id;
ALTER TABLE bookings ADD CONSTRAINT bookings_asset_id_fkey 
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE RESTRICT;
ALTER TABLE bookings DROP COLUMN IF EXISTS total_amount;
ALTER TABLE bookings DROP COLUMN IF EXISTS signal_expires_at;
ALTER TABLE bookings DROP COLUMN IF EXISTS internal_notes;
ALTER TABLE bookings DROP COLUMN IF EXISTS notes;
ALTER TABLE bookings DROP COLUMN IF EXISTS customer_id;

-- Drop customer tag assignments
DROP TABLE IF EXISTS customer_tag_assignments;

-- Drop customer tags
DROP TABLE IF EXISTS customer_tags;

-- Drop customers
DROP TABLE IF EXISTS customers;

-- Drop blocks
DROP TABLE IF EXISTS blocks;
DROP TYPE IF EXISTS block_reason;

-- Drop availability rules
DROP TABLE IF EXISTS availability_rules;

-- Revert resources to assets
ALTER TABLE resources DROP COLUMN IF EXISTS buffer_after_minutes;
ALTER TABLE resources DROP COLUMN IF EXISTS buffer_before_minutes;
ALTER TABLE resources DROP COLUMN IF EXISTS terms;
ALTER TABLE resources DROP COLUMN IF EXISTS photos;
ALTER TABLE resources DROP COLUMN IF EXISTS resource_type;
ALTER TABLE resources RENAME TO assets;

-- Drop resource_type enum
DROP TYPE IF EXISTS resource_type;

-- Revert booking_status enum
ALTER TABLE bookings ALTER COLUMN status TYPE text;
DROP TYPE IF EXISTS booking_status;
CREATE TYPE booking_status AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED');
ALTER TABLE bookings ALTER COLUMN status TYPE booking_status USING status::booking_status;

-- Revert merchant columns
ALTER TABLE merchants DROP COLUMN IF EXISTS city;
ALTER TABLE merchants DROP COLUMN IF EXISTS address;
ALTER TABLE merchants DROP COLUMN IF EXISTS signal_auto_cancel;
ALTER TABLE merchants DROP COLUMN IF EXISTS signal_deadline_minutes;
ALTER TABLE merchants DROP COLUMN IF EXISTS signal_percentage;