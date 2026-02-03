-- PetCare Unified Migration Script v2
-- This script migrates the database to a Master-Table driven architecture for:
-- 1. Statuses (Appointment & Payment)
-- 2. User Roles
-- 3. Pet Management (Types, Breeds, Profiles)

SET search_path TO petcare;

-- 1. STATUS MASTER
CREATE TABLE IF NOT EXISTS status_master (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL,
    status_type VARCHAR(50) NOT NULL, -- 'appointment', 'payment'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO status_master (status_name, status_type)
VALUES 
    ('pending', 'appointment'),
    ('confirmed', 'appointment'),
    ('completed', 'appointment'),
    ('cancelled', 'appointment'),
    ('pending', 'payment'),
    ('completed', 'payment'),
    ('failed', 'payment')
ON CONFLICT DO NOTHING;

-- 2. USER ROLES
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO user_roles (role_name, description) VALUES 
    ('owner', 'Pet Owner'),
    ('provider', 'Service Provider'),
    ('admin', 'Administrator')
ON CONFLICT (role_name) DO NOTHING;

-- 3. PET MASTER DATA
CREATE TABLE IF NOT EXISTS pet_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO pet_types (name) 
VALUES ('Dog'), ('Cat'), ('Bird'), ('Rabbit'), ('Other') 
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS breeds (
    id SERIAL PRIMARY KEY,
    pet_type_id INTEGER NOT NULL REFERENCES pet_types(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    origin VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pet_type_id, name)
);

INSERT INTO breeds (pet_type_id, name, origin) 
VALUES 
    ((SELECT id FROM pet_types WHERE name = 'Dog'), 'Golden Retriever', 'Scotland'),
    ((SELECT id FROM pet_types WHERE name = 'Dog'), 'German Shepherd', 'Germany'),
    ((SELECT id FROM pet_types WHERE name = 'Dog'), 'French Bulldog', 'France'),
    ((SELECT id FROM pet_types WHERE name = 'Cat'), 'Siamese', 'Thailand'),
    ((SELECT id FROM pet_types WHERE name = 'Cat'), 'Maine Coon', 'United States'),
    ((SELECT id FROM pet_types WHERE name = 'Cat'), 'Persian', 'Iran')
ON CONFLICT DO NOTHING;

-- 4. PETS PROFILE TABLE
CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_type_id INTEGER NOT NULL REFERENCES pet_types(id),
    breed_id INTEGER REFERENCES breeds(id),
    name VARCHAR(100) NOT NULL,
    age INTEGER,
    weight DECIMAL(5, 2),
    medical_notes TEXT,
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. MIGRATE USERS TO ROLES
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'petcare' AND table_name = 'users' AND column_name = 'user_type') THEN
        ALTER TABLE users ADD COLUMN role_id INTEGER;
        
        UPDATE users SET role_id = (SELECT id FROM user_roles WHERE role_name = 'owner') WHERE user_type = 'owner';
        UPDATE users SET role_id = (SELECT id FROM user_roles WHERE role_name = 'provider') WHERE user_type = 'provider';
        UPDATE users SET role_id = (SELECT id FROM user_roles WHERE role_name = 'owner') WHERE role_id IS NULL;
        
        ALTER TABLE users DROP COLUMN user_type;
        ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;
        ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES user_roles(id);
    END IF;
END $$;

-- 6. MIGRATE APPOINTMENTS TO STATUS IDs
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'petcare' AND table_name = 'appointments' AND column_name = 'status' AND data_type = 'character varying') THEN
        -- Rename old column
        ALTER TABLE appointments RENAME COLUMN status TO status_legacy;
        ALTER TABLE appointments ADD COLUMN status INTEGER;
        
        -- Map legacy string statuses to new IDs
        UPDATE appointments SET status = (SELECT id FROM status_master WHERE status_name = 'pending' AND status_type = 'appointment') WHERE status_legacy = 'pending';
        UPDATE appointments SET status = (SELECT id FROM status_master WHERE status_name = 'confirmed' AND status_type = 'appointment') WHERE status_legacy = 'confirmed';
        UPDATE appointments SET status = (SELECT id FROM status_master WHERE status_name = 'completed' AND status_type = 'appointment') WHERE status_legacy = 'completed';
        UPDATE appointments SET status = (SELECT id FROM status_master WHERE status_name = 'cancelled' AND status_type = 'appointment') WHERE status_legacy = 'cancelled';
        
        UPDATE appointments SET status = (SELECT id FROM status_master WHERE status_name = 'pending' AND status_type = 'appointment') WHERE status IS NULL;
        
        ALTER TABLE appointments DROP COLUMN status_legacy;
        ALTER TABLE appointments ALTER COLUMN status SET NOT NULL;
        ALTER TABLE appointments ADD CONSTRAINT fk_appointments_status FOREIGN KEY (status) REFERENCES status_master(id);
    END IF;
END $$;

-- 7. MIGRATE PAYMENTS TO STATUS IDs
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'petcare' AND table_name = 'payments' AND column_name = 'status' AND data_type = 'character varying') THEN
        ALTER TABLE payments RENAME COLUMN status TO status_legacy;
        ALTER TABLE payments ADD COLUMN status INTEGER;
        
        UPDATE payments SET status = (SELECT id FROM status_master WHERE status_name = 'pending' AND status_type = 'payment') WHERE status_legacy = 'pending';
        UPDATE payments SET status = (SELECT id FROM status_master WHERE status_name = 'completed' AND status_type = 'payment') WHERE status_legacy = 'completed';
        UPDATE payments SET status = (SELECT id FROM status_master WHERE status_name = 'failed' AND status_type = 'payment') WHERE status_legacy = 'failed';
        
        UPDATE payments SET status = (SELECT id FROM status_master WHERE status_name = 'pending' AND status_type = 'payment') WHERE status IS NULL;
        
        ALTER TABLE payments DROP COLUMN status_legacy;
        ALTER TABLE payments ALTER COLUMN status SET NOT NULL;
        ALTER TABLE payments ADD CONSTRAINT fk_payments_status FOREIGN KEY (status) REFERENCES status_master(id);
    END IF;
END $$;

-- 8. ENSURE STRIPE FIELDS EXIST (If not already added)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'petcare' AND table_name = 'providers' AND column_name = 'stripe_account_id') THEN
        ALTER TABLE providers ADD COLUMN stripe_account_id VARCHAR(100);
        ALTER TABLE providers ADD COLUMN is_stripe_connected BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'petcare' AND table_name = 'payments' AND column_name = 'stripe_payment_intent_id') THEN
        ALTER TABLE payments ADD COLUMN stripe_payment_intent_id VARCHAR(100);
        ALTER TABLE payments ADD COLUMN stripe_client_secret VARCHAR(200);
    END IF;
END $$;
