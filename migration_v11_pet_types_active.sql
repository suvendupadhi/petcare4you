-- PetCare Migration Script v11
-- Add is_active column to pet_types table

SET search_path TO petcare;

-- 1. Add is_active column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'petcare' AND table_name = 'pet_types' AND column_name = 'is_active') THEN
        ALTER TABLE pet_types ADD COLUMN is_active BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
