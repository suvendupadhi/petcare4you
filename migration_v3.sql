-- PetCare Migration Script v3
-- 1. Ensure PetId exists in Appointments
-- 2. Make PetName and PetType nullable in Appointments
-- 3. Add more pet master data if missing

SET search_path TO petcare;

-- 1. Ensure PetId exists and has foreign key
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'petcare' AND table_name = 'appointments' AND column_name = 'pet_id') THEN
        ALTER TABLE appointments ADD COLUMN pet_id INTEGER REFERENCES pets(id);
    END IF;
END $$;

-- 2. Make PetName and PetType nullable
ALTER TABLE appointments ALTER COLUMN pet_name DROP NOT NULL;
ALTER TABLE appointments ALTER COLUMN pet_type DROP NOT NULL;

-- 3. Update sample breeds if needed
INSERT INTO breeds (pet_type_id, name, origin, description) 
VALUES 
    ((SELECT id FROM pet_types WHERE name = 'Dog'), 'Labrador Retriever', 'Canada', 'Friendly and active'),
    ((SELECT id FROM pet_types WHERE name = 'Dog'), 'Poodle', 'Germany/France', 'Intelligent and elegant'),
    ((SELECT id FROM pet_types WHERE name = 'Cat'), 'Ragdoll', 'United States', 'Docile and affectionate')
ON CONFLICT (pet_type_id, name) DO NOTHING;
