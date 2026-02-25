-- Migration: Add row_status and deleted_at for Soft Delete and State Management
-- Date: 2026-02-23

SET search_path TO petcare;

-- Function to add columns and index to a table
DO $$ 
DECLARE 
    t text;
    tables_to_update text[] := ARRAY[
        'users', 'providers', 'pets', 'appointments', 'availability', 
        'service_types', 'reviews', 'tips', 'notifications', 'feedbacks',
        'provider_service_types', 'provider_photos', 'saved_providers',
        'pet_types', 'breeds', 'user_roles'
    ];
BEGIN
    FOREACH t IN ARRAY tables_to_update LOOP
        -- Add row_status column
        EXECUTE format('ALTER TABLE petcare.%I ADD COLUMN IF NOT EXISTS row_status varchar(1) DEFAULT ''a''', t);
        
        -- Add check constraint for row_status
        EXECUTE format('ALTER TABLE petcare.%I DROP CONSTRAINT IF EXISTS %I_row_status_check', t, t);
        EXECUTE format('ALTER TABLE petcare.%I ADD CONSTRAINT %I_row_status_check CHECK (row_status IN (''a'', ''i'', ''d'', ''v''))', t, t);
        
        -- Add deleted_at column
        EXECUTE format('ALTER TABLE petcare.%I ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone', t);
        
        -- Add index on row_status
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_row_status ON petcare.%I(row_status)', t, t);
    END LOOP;

    -- Rename base_price to hourly_rate in providers table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'petcare' AND table_name = 'providers' AND column_name = 'base_price') THEN
        ALTER TABLE petcare.providers RENAME COLUMN base_price TO hourly_rate;
    END IF;

    -- Add stripe columns to providers table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'petcare' AND table_name = 'providers' AND column_name = 'stripe_account_id') THEN
        ALTER TABLE petcare.providers ADD COLUMN stripe_account_id varchar(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'petcare' AND table_name = 'providers' AND column_name = 'is_stripe_connected') THEN
        ALTER TABLE petcare.providers ADD COLUMN is_stripe_connected boolean DEFAULT false;
    END IF;
END $$;

-- Update existing data to reflect is_active status if applicable
UPDATE petcare.users SET row_status = CASE WHEN is_active = false THEN 'i' ELSE 'a' END;
UPDATE petcare.providers SET row_status = CASE WHEN is_active = false THEN 'i' ELSE 'a' END;
UPDATE petcare.service_types SET row_status = CASE WHEN is_active = false THEN 'i' ELSE 'a' END;
UPDATE petcare.tips SET row_status = CASE WHEN is_active = false THEN 'i' ELSE 'a' END;
UPDATE petcare.pet_types SET row_status = CASE WHEN is_active = false THEN 'i' ELSE 'a' END;
