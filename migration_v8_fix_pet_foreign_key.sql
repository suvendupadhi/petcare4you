-- Migration V8: Fix Pet Foreign Key Constraint in Appointments
SET search_path TO petcare;

-- Drop the existing constraint if it exists (standard name fk_appointments_pet or similar)
-- In our postgres-init.sql it was created without an explicit name, so Postgres auto-names it.
-- However, EF Core expects it to be named correctly or we can use the one from the error message.
-- The error message specifically named it "fk_appointments_pet".

ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS fk_appointments_pet;

-- Re-add the constraint with ON DELETE SET NULL
ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_pet 
FOREIGN KEY (pet_id) 
REFERENCES pets(id) 
ON DELETE SET NULL;
