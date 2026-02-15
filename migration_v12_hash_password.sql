-- PetCare Migration Script v12
-- Modify password_hash column to text type

SET search_path TO petcare;

ALTER TABLE petcare.users ALTER COLUMN password_hash TYPE text USING password_hash::text;
