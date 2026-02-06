-- Migration V9: Create notifications table in petcare schema
CREATE TABLE IF NOT EXISTS petcare.notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- e.g., 'Booking', 'Cancellation', 'StatusChange'
    reference_id VARCHAR(100), -- e.g., AppointmentId
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES petcare.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON petcare.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON petcare.notifications(is_read);

-- Ensure the column exists if the table was already created without it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='petcare' AND table_name='notifications' AND column_name='reference_id') THEN
        ALTER TABLE petcare.notifications ADD COLUMN reference_id VARCHAR(100);
    END IF;
END $$;
