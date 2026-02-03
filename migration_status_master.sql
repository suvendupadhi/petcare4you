-- Migration script to introduce status_master table and update appointments/payments to use status IDs

SET search_path TO petcare;

-- 1. Create status_master table
CREATE TABLE IF NOT EXISTS status_master (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL,
    status_type VARCHAR(50) NOT NULL, -- 'appointment', 'payment'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert default statuses
INSERT INTO status_master (status_name, status_type) VALUES 
('pending', 'appointment'),   -- ID 1
('confirmed', 'appointment'), -- ID 2
('completed', 'appointment'), -- ID 3
('cancelled', 'appointment'), -- ID 4
('pending', 'payment'),       -- ID 5
('completed', 'payment'),     -- ID 6
('failed', 'payment')         -- ID 7
ON CONFLICT DO NOTHING;

-- 3. Update appointments table
-- Add temporary column
ALTER TABLE appointments ADD COLUMN status_id INTEGER;

-- Migrate data
UPDATE appointments SET status_id = 1 WHERE status = 'pending';
UPDATE appointments SET status_id = 2 WHERE status = 'confirmed';
UPDATE appointments SET status_id = 3 WHERE status = 'completed';
UPDATE appointments SET status_id = 4 WHERE status = 'cancelled';

-- Default to pending if unknown
UPDATE appointments SET status_id = 1 WHERE status_id IS NULL;

-- Drop old column and rename new one
ALTER TABLE appointments DROP COLUMN status;
ALTER TABLE appointments RENAME COLUMN status_id TO status;
ALTER TABLE appointments ALTER COLUMN status SET NOT NULL;
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_status FOREIGN KEY (status) REFERENCES status_master(id);

-- 4. Update payments table
-- Add temporary column
ALTER TABLE payments ADD COLUMN status_id INTEGER;

-- Migrate data
UPDATE payments SET status_id = 5 WHERE status = 'pending';
UPDATE payments SET status_id = 6 WHERE status = 'completed';
UPDATE payments SET status_id = 7 WHERE status = 'failed';

-- Default to pending if unknown
UPDATE payments SET status_id = 5 WHERE status_id IS NULL;

-- Drop old column and rename new one
ALTER TABLE payments DROP COLUMN status;
ALTER TABLE payments RENAME COLUMN status_id TO status;
ALTER TABLE payments ALTER COLUMN status SET NOT NULL;
ALTER TABLE payments ADD CONSTRAINT fk_payments_status FOREIGN KEY (status) REFERENCES status_master(id);
