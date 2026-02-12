-- PetCare Services PostgreSQL Database Schema
CREATE SCHEMA IF NOT EXISTS petcare;
SET search_path TO petcare;

-- 1. StatusMaster Table
CREATE TABLE IF NOT EXISTS status_master (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL,
    status_type VARCHAR(50) NOT NULL, -- 'appointment', 'payment'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. UserRoles Table
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PetTypes Table
CREATE TABLE IF NOT EXISTS pet_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Breeds Table
CREATE TABLE IF NOT EXISTS breeds (
    id SERIAL PRIMARY KEY,
    pet_type_id INTEGER NOT NULL REFERENCES pet_types(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    origin VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pet_type_id, name)
);

-- 5. ServiceType Table
CREATE TABLE IF NOT EXISTS service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    role_id INTEGER NOT NULL REFERENCES user_roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Pets Table
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

-- 8. Providers Table
CREATE TABLE IF NOT EXISTS providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    description TEXT,
    hourly_rate DECIMAL(10, 2) DEFAULT 0.00,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    review_count INTEGER DEFAULT 0,
    address VARCHAR(255),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    profile_image_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    stripe_account_id VARCHAR(255),
    is_stripe_connected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. ProviderPhotos Table
CREATE TABLE IF NOT EXISTS provider_photos (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. ProviderServiceTypes (Join Table)
CREATE TABLE IF NOT EXISTS provider_service_types (
    provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
    service_type_id INTEGER REFERENCES service_types(id) ON DELETE CASCADE,
    PRIMARY KEY (provider_id, service_type_id)
);

-- 10. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    provider_id INTEGER NOT NULL REFERENCES providers(id),
    pet_id INTEGER REFERENCES pets(id),
    appointment_date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status INTEGER NOT NULL REFERENCES status_master(id),
    pet_name VARCHAR(100), -- Optional if pet_id is provided
    pet_type VARCHAR(50), -- Optional if pet_id is provided
    description TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Availability Table
CREATE TABLE IF NOT EXISTS availability (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    status INTEGER NOT NULL REFERENCES status_master(id),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    stripe_payment_intent_id VARCHAR(255),
    stripe_client_secret VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_providers_city ON providers(city);
CREATE INDEX idx_appointments_owner ON appointments(owner_id);
CREATE INDEX idx_availability_provider ON availability(provider_id);

-- SAMPLE DATA
-- Insert Statuses
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

-- Insert User Roles
INSERT INTO user_roles (role_name, description)
VALUES 
    ('owner', 'Pet Owner'),
    ('provider', 'Service Provider'),
    ('admin', 'Administrator')
ON CONFLICT (role_name) DO NOTHING;

-- Insert Pet Types
INSERT INTO pet_types (name) 
VALUES ('Dog'), ('Cat'), ('Bird'), ('Rabbit'), ('Other') 
ON CONFLICT DO NOTHING;

-- Insert Breeds
INSERT INTO breeds (pet_type_id, name, origin) 
VALUES 
    (1, 'Golden Retriever', 'Scotland'),
    (1, 'German Shepherd', 'Germany'),
    (1, 'French Bulldog', 'France'),
    (2, 'Siamese', 'Thailand'),
    (2, 'Maine Coon', 'United States'),
    (2, 'Persian', 'Iran')
ON CONFLICT DO NOTHING;

-- Insert Service Types
INSERT INTO service_types (name, description, icon_name)
VALUES 
    ('Pet Grooming', 'Professional grooming services for your pets', 'scissors'),
    ('Veterinary Care', 'Expert medical care and checkups', 'stethoscop'),
    ('Dog Walking', 'Daily walks and exercise for dogs', 'dog'),
    ('Pet Boarding', 'Safe and comfortable stay for your pets', 'home'),
    ('Pet Training', 'Behavioral training and obedience classes', 'award'),
    ('Pet Daycare', 'Supervised daytime care and socialization', 'clock'),
    ('Pet Spa', 'Luxury treatments, massage, and relaxation', 'sparkles'),
    ('Nail Trimming', 'Professional paw care and nail clipping', 'paw-print'),
    ('Teeth Cleaning', 'Oral hygiene and dental care for pets', 'smile'),
    ('Pet Sitting', 'In-home care while owners are away', 'user'),
    ('Emergency Care', 'Urgent medical assistance and 24/7 support', 'heart-pulse'),
    ('Pet Photography', 'Professional photo sessions for your furry friends', 'camera')
ON CONFLICT (name) DO NOTHING;

-- Passwords are stored in plain text (password for all is 'password123')
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role_id)
VALUES 
('owner@example.com', 'password123', 'John', 'Owner', '555-1234', 1),
('groomer@example.com', 'password123', 'Jane', 'Groomer', '555-5678', 2);

INSERT INTO pets (owner_id, pet_type_id, breed_id, name, age)
VALUES (1, 1, 1, 'Buddy', 3);

INSERT INTO providers (user_id, company_name, description, hourly_rate, rating, review_count, address, city, is_verified)
VALUES 
(2, 'Paws & Claws Grooming', 'Top notch grooming services', 50.00, 4.8, 120, '123 Pet Lane', 'San Francisco', TRUE);

-- Link provider to service types
INSERT INTO provider_service_types (provider_id, service_type_id)
VALUES (1, 1), (1, 7), (1, 8); -- Grooming, Spa, Nail Trimming

INSERT INTO availability (provider_id, date, start_time, end_time, is_booked)
VALUES 
(1, CURRENT_DATE + INTERVAL '1 day', '2026-01-21 09:00:00+00', '2026-01-21 10:00:00+00', FALSE),
(1, CURRENT_DATE + INTERVAL '1 day', '2026-01-21 10:00:00+00', '2026-01-21 11:00:00+00', FALSE);
