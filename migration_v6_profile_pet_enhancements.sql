-- Migration V6: Enhance User Profile
SET search_path TO petcare;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);
