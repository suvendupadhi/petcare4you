 PetCare Services PostgreSQL Database Schema
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
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
    service_type_id INTEGER REFERENCES service_types(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider_id, service_type_id)
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

-- 13. Tips Table
CREATE TABLE IF NOT EXISTS tips (
    id SERIAL PRIMARY KEY,
    user_role_id INTEGER REFERENCES user_roles(id), -- Null means all roles
    service_type_id INTEGER REFERENCES service_types(id), -- Specific to a service
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
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
--INSERT INTO pet_types (name) 
--VALUES ('Dog'), ('Cat'), ('Bird'), ('Rabbit'), ('Other') 
--ON CONFLICT DO NOTHING;

INSERT INTO petcare.pet_types VALUES (1, 'Dog', '2026-02-02 17:54:47.047886+05:30', true);
INSERT INTO petcare.pet_types VALUES (2, 'Cat', '2026-02-02 17:54:47.047886+05:30', false);
INSERT INTO petcare.pet_types VALUES (3, 'Bird', '2026-02-02 17:54:47.047886+05:30', false);
INSERT INTO petcare.pet_types VALUES (4, 'Rabbit', '2026-02-02 17:54:47.047886+05:30', false);
INSERT INTO petcare.pet_types VALUES (5, 'Other', '2026-02-02 17:54:47.047886+05:30', false);

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
    ('Veterinary Care', 'Expert medical care and checkups', 'stethoscope'),
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

-- Passwords are stored in plain text (password for all is 'Password@1') --
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role_id)
VALUES 
('owner@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'John', 'Owner', '555-1234', 1),
('groomer@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'Jane', 'Groomer', '555-5678', 2);

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

-- Insert Tips
--INSERT INTO tips (user_role_id, service_type_id, title, content)
--VALUES 
--    (1, NULL, 'Pet Health Tip', 'Ensure your pet stays hydrated! Fresh water should always be available, especially after exercise.'),
--    (1, 1, 'Grooming Tip', 'Regular brushing helps prevent matting and keeps your pets coat healthy and shiny.'),
--    (1, 2, 'Vet Visit Tip', 'Keep a folder of your pets medical history and vaccination records for quick reference during vet visits.'),
--    (2, NULL, 'Business Tip', 'Respond to booking requests within 2 hours to increase your chance of confirmation by 40%.'),
--    (2, NULL, 'Profile Tip', 'Adding high-quality photos of your workplace builds trust with potential pet owners.'),
--    (2, 1, 'Pro Groomer Tip', 'Always check for skin irritations or lumps during grooming and inform the owner immediately.');
INSERT INTO tips VALUES (1, 1, NULL, 'Pet Health Tip', 'Ensure your pet stays hydrated! Fresh water should always be available, especially after exercise.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (2, 1, 1, 'Grooming Tip', 'Regular brushing helps prevent matting and keeps your pets coat healthy and shiny.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (3, 1, 2, 'Vet Visit Tip', 'Keep a folder of your pets medical history and vaccination records for quick reference during vet visits.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (4, 2, NULL, 'Business Tip', 'Respond to booking requests within 2 hours to increase your chance of confirmation by 40%.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (5, 2, NULL, 'Profile Tip', 'Adding high-quality photos of your workplace builds trust with potential pet owners.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (6, 2, 1, 'Pro Groomer Tip', 'Always check for skin irritations or lumps during grooming and inform the owner immediately.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (12, 2, 1, 'Safety Protocol', 'Sanitize all grooming tools between clients to prevent cross-contamination and maintain hygiene standards.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (11, 2, NULL, 'Marketing Strategy', 'Share before-and-after photos with owner permission to showcase your work on social media.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (10, 2, NULL, 'Customer Service', 'Send a follow-up message after each booking to gather feedback and improve your service quality.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (9, 1, 2, 'Medical Records', 'Take photos of vaccination certificates and store them digitally for easy access during emergencies.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (8, 1, 1, 'Coat Care Basics', 'Brush your pet at least twice a week to reduce shedding and distribute natural oils throughout their coat.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (7, 1, NULL, 'Nutrition Essentials', 'Feed your pet at consistent times each day to establish a healthy routine and prevent digestive issues.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (13, 1, NULL, 'Exercise Routine', 'Ensure your pet gets at least 30 minutes of physical activity daily to maintain a healthy weight and mental well-being.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (14, 1, 1, 'Dental Care Tip', 'Brush your pet''s teeth regularly using pet-safe toothpaste to prevent plaque buildup and bad breath.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (15, 1, 2, 'Vaccination Reminder', 'Stay up to date with your pet''s vaccination schedule to protect them from common infectious diseases.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (16, 2, NULL, 'Client Retention Tip', 'Offer loyalty discounts to repeat customers to encourage long-term relationships and steady bookings.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (17, 2, NULL, 'Scheduling Tip', 'Use automated reminders to reduce no-shows and keep your daily appointments organized.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (18, 2, 1, 'Advanced Grooming Tip', 'Always use breed-specific grooming techniques to ensure the best results and comfort for the pet.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (19, 2, NULL, 'Hygiene Standard', 'Maintain a clean workspace by disinfecting tables and drying areas after every session.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (20, 2, NULL, 'Online Presence', 'Keep your business profile updated with accurate service details and pricing information.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (21, 1, 1, 'Shedding Control', 'Use de-shedding tools during seasonal coat changes to minimize loose fur around your home.', true, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO tips VALUES (22, 1, NULL, 'Hydration Check', 'Monitor your pet''s water intake daily to quickly detect any unusual changes in behavior or health.', true, '2026-02-12 18:42:54.217953+05:30');
