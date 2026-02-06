-- Migration V7: Ensure Pet CRUD tables exist
SET search_path TO petcare;

-- 1. PetTypes Table (already in init, but ensuring here)
CREATE TABLE IF NOT EXISTS pet_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Breeds Table
CREATE TABLE IF NOT EXISTS breeds (
    id SERIAL PRIMARY KEY,
    pet_type_id INTEGER NOT NULL REFERENCES pet_types(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    origin VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pet_type_id, name)
);

-- 3. Pets Table
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

-- Insert Sample Pet Types if they don't exist
INSERT INTO pet_types (name) 
VALUES ('Dog'), ('Cat'), ('Bird'), ('Rabbit'), ('Other') 
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Breeds if they don't exist
INSERT INTO breeds (pet_type_id, name, origin) 
VALUES 
    ((SELECT id FROM pet_types WHERE name = 'Dog' LIMIT 1), 'Golden Retriever', 'Scotland'),
    ((SELECT id FROM pet_types WHERE name = 'Dog' LIMIT 1), 'German Shepherd', 'Germany'),
    ((SELECT id FROM pet_types WHERE name = 'Cat' LIMIT 1), 'Siamese', 'Thailand'),
    ((SELECT id FROM pet_types WHERE name = 'Cat' LIMIT 1), 'Maine Coon', 'United States')
ON CONFLICT (pet_type_id, name) DO NOTHING;
