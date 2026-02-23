-- ============================================================================
-- PetCare Services - Production Database Schema & Seed Data
-- PostgreSQL 15+
-- ============================================================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS petcare;
SET search_path TO petcare;

-- ============================================================================
-- TABLES & SEQUENCES
-- ============================================================================

-- User Roles
CREATE TABLE petcare.user_roles (
    id integer PRIMARY KEY,
    role_name character varying(50) NOT NULL UNIQUE,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.user_roles_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.user_roles_id_seq OWNED BY petcare.user_roles.id;

-- Users
CREATE TABLE petcare.users (
    id integer PRIMARY KEY,
    email character varying(255) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone_number character varying(20),
    is_active boolean DEFAULT true,
    address character varying(255),
    profile_image_url character varying(500),
    password_reset_token character varying(100),
    reset_token_expiry timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    role_id integer NOT NULL REFERENCES petcare.user_roles(id)
);

CREATE SEQUENCE petcare.users_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.users_id_seq OWNED BY petcare.users.id;
CREATE INDEX idx_users_email ON petcare.users(email);
CREATE INDEX idx_users_phone_number ON petcare.users(phone_number);

-- Pet Types
CREATE TABLE petcare.pet_types (
    id integer PRIMARY KEY,
    name character varying(50) NOT NULL UNIQUE,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.pet_types_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.pet_types_id_seq OWNED BY petcare.pet_types.id;

-- Breeds
CREATE TABLE petcare.breeds (
    id integer PRIMARY KEY,
    pet_type_id integer NOT NULL REFERENCES petcare.pet_types(id),
    name character varying(100) NOT NULL,
    origin character varying(100),
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pet_type_id, name)
);

CREATE SEQUENCE petcare.breeds_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.breeds_id_seq OWNED BY petcare.breeds.id;

-- Pets
CREATE TABLE petcare.pets (
    id integer PRIMARY KEY,
    owner_id integer NOT NULL REFERENCES petcare.users(id),
    pet_type_id integer NOT NULL REFERENCES petcare.pet_types(id),
    breed_id integer REFERENCES petcare.breeds(id),
    name character varying(100) NOT NULL,
    age integer,
    weight numeric(5,2),
    medical_notes text,
    profile_image_url character varying(500),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.pets_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.pets_id_seq OWNED BY petcare.pets.id;

-- Providers
CREATE TABLE petcare.providers (
    id integer PRIMARY KEY,
    user_id integer NOT NULL UNIQUE REFERENCES petcare.users(id),
    company_name character varying(200) NOT NULL,
    description text,
    base_price numeric(10,2),
    rating numeric(3,2),
    total_bookings integer DEFAULT 0,
    address character varying(255),
    city character varying(100),
    latitude numeric(10,8),
    longitude numeric(11,8),
    service_area_description text,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    banner_image_url character varying(500),
    is_active boolean DEFAULT false
);

CREATE SEQUENCE petcare.providers_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.providers_id_seq OWNED BY petcare.providers.id;
CREATE INDEX idx_providers_city ON petcare.providers(city);

-- Service Types
CREATE TABLE petcare.service_types (
    id integer PRIMARY KEY,
    name character varying(100) NOT NULL UNIQUE,
    description text,
    icon character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.service_types_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.service_types_id_seq OWNED BY petcare.service_types.id;

-- Provider Service Types & Pricing
CREATE TABLE petcare.provider_service_types (
    id integer PRIMARY KEY,
    provider_id integer NOT NULL REFERENCES petcare.providers(id),
    service_type_id integer NOT NULL REFERENCES petcare.service_types(id),
    price numeric(10,2) DEFAULT 0.00,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, service_type_id)
);

CREATE SEQUENCE petcare.provider_service_types_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.provider_service_types_id_seq OWNED BY petcare.provider_service_types.id;

-- Provider Photos
CREATE TABLE petcare.provider_photos (
    id integer PRIMARY KEY,
    provider_id integer NOT NULL REFERENCES petcare.providers(id),
    url character varying(500) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.provider_photos_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.provider_photos_id_seq OWNED BY petcare.provider_photos.id;
CREATE INDEX idx_provider_photos_provider_id ON petcare.provider_photos(provider_id);

-- Appointments
CREATE TABLE petcare.appointments (
    id integer PRIMARY KEY,
    owner_id integer NOT NULL REFERENCES petcare.users(id),
    provider_id integer NOT NULL REFERENCES petcare.providers(id),
    pet_id integer REFERENCES petcare.pets(id),
    pet_name character varying(100) DEFAULT 'Unknown',
    pet_type character varying(50) DEFAULT 'Other',
    appointment_date date NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    description text,
    total_price numeric(10,2) NOT NULL,
    status integer NOT NULL,
    decline_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.appointments_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.appointments_id_seq OWNED BY petcare.appointments.id;
CREATE INDEX idx_appointments_owner ON petcare.appointments(owner_id);

-- Availability Slots
CREATE TABLE petcare.availability (
    id integer PRIMARY KEY,
    provider_id integer NOT NULL REFERENCES petcare.providers(id),
    date date NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    is_booked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.availability_id_seq1 AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.availability_id_seq1 OWNED BY petcare.availability.id;

-- Status Master
CREATE TABLE petcare.status_master (
    id integer PRIMARY KEY,
    status_name character varying(50) NOT NULL,
    status_type character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.status_master_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.status_master_id_seq OWNED BY petcare.status_master.id;

-- Payments & Invoices
CREATE TABLE petcare.payments (
    id integer PRIMARY KEY,
    appointment_id integer NOT NULL UNIQUE REFERENCES petcare.appointments(id),
    user_id integer NOT NULL REFERENCES petcare.users(id),
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50),
    transaction_id character varying(100),
    stripe_payment_intent_id character varying(100),
    stripe_client_secret character varying(200),
    invoice_pdf bytea,
    status integer NOT NULL,
    payment_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.payments_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.payments_id_seq OWNED BY petcare.payments.id;

-- Reviews & Ratings
CREATE TABLE petcare.reviews (
    id integer PRIMARY KEY,
    appointment_id integer NOT NULL UNIQUE REFERENCES petcare.appointments(id),
    owner_id integer NOT NULL REFERENCES petcare.users(id),
    provider_id integer NOT NULL REFERENCES petcare.providers(id),
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.reviews_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.reviews_id_seq OWNED BY petcare.reviews.id;

-- Saved/Favorite Providers
CREATE TABLE petcare.saved_providers (
    id integer PRIMARY KEY,
    user_id integer NOT NULL REFERENCES petcare.users(id),
    provider_id integer NOT NULL REFERENCES petcare.providers(id),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider_id)
);

CREATE SEQUENCE petcare.saved_providers_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.saved_providers_id_seq OWNED BY petcare.saved_providers.id;
CREATE INDEX idx_saved_providers_user_id ON petcare.saved_providers(user_id);

-- Notifications
CREATE TABLE petcare.notifications (
    id integer PRIMARY KEY,
    user_id integer NOT NULL REFERENCES petcare.users(id),
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    reference_id character varying(100),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.notifications_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.notifications_id_seq OWNED BY petcare.notifications.id;
CREATE INDEX idx_notifications_user_id ON petcare.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON petcare.notifications(is_read);

-- Tips & Best Practices
CREATE TABLE petcare.tips (
    id integer PRIMARY KEY,
    user_role_id integer REFERENCES petcare.user_roles(id),
    service_type_id integer REFERENCES petcare.service_types(id),
    title character varying(200) NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.tips_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.tips_id_seq OWNED BY petcare.tips.id;

-- Feedback & Support
CREATE TABLE petcare.feedbacks (
    id integer PRIMARY KEY,
    user_id integer NOT NULL REFERENCES petcare.users(id),
    subject character varying(200) NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.feedbacks_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.feedbacks_id_seq OWNED BY petcare.feedbacks.id;

-- System Configuration
CREATE TABLE petcare.system_configurations (
    id integer PRIMARY KEY,
    config_key character varying(100) NOT NULL UNIQUE,
    config_value text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE petcare.system_configurations_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE petcare.system_configurations_id_seq OWNED BY petcare.system_configurations.id;

-- ============================================================================
-- SEED DATA - Production Ready
-- ============================================================================

-- User Roles
INSERT INTO petcare.user_roles (id, role_name, description, created_at) VALUES
(1, 'owner', 'Pet Owner', CURRENT_TIMESTAMP),
(2, 'provider', 'Service Provider', CURRENT_TIMESTAMP),
(3, 'admin', 'Administrator', CURRENT_TIMESTAMP),
(4, 'superadmin', 'Super Administrator', CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.user_roles_id_seq', 4, true);

-- Users (with bcrypt hashed passwords - test/test@123)
INSERT INTO petcare.users (id, email, password_hash, first_name, last_name, phone_number, is_active, role_id, created_at, updated_at) VALUES
(0, 'superadmin@petcare.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'Super', 'Admin', '+14567898900', true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'owner@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'John', 'Owner', '+14567898911', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'groomer@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'Jane', 'Groomer', '+14567898902', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'mike.groomer@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'Mike', 'Wilson', '+14567898913', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'sarah.owner@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'Sarah', 'Johnson', '+14567898904', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'dr.emily@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'Dr Emily', 'Brown', '+14567898905', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.users_id_seq', 6, true);

-- Pet Types
INSERT INTO petcare.pet_types (id, name, is_active, created_at) VALUES
(1, 'Dog', true, CURRENT_TIMESTAMP),
(2, 'Cat', false, CURRENT_TIMESTAMP),
(3, 'Bird', false, CURRENT_TIMESTAMP),
(4, 'Rabbit', false, CURRENT_TIMESTAMP),
(5, 'Other', false, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.pet_types_id_seq', 5, true);

-- Breeds
INSERT INTO petcare.breeds (id, pet_type_id, name, origin, description, created_at) VALUES
(1, 1, 'Golden Retriever', 'Scotland', NULL, CURRENT_TIMESTAMP),
(2, 1, 'German Shepherd', 'Germany', NULL, CURRENT_TIMESTAMP),
(3, 1, 'French Bulldog', 'France', NULL, CURRENT_TIMESTAMP),
(4, 2, 'Siamese', 'Thailand', NULL, CURRENT_TIMESTAMP),
(5, 2, 'Maine Coon', 'United States', NULL, CURRENT_TIMESTAMP),
(6, 2, 'Persian', 'Iran', NULL, CURRENT_TIMESTAMP),
(7, 1, 'Labrador Retriever', 'Canada', 'Friendly and active', CURRENT_TIMESTAMP),
(8, 1, 'Poodle', 'Germany/France', 'Intelligent and elegant', CURRENT_TIMESTAMP),
(9, 2, 'Ragdoll', 'United States', 'Docile and affectionate', CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.breeds_id_seq', 9, true);

-- Pets
INSERT INTO petcare.pets (id, owner_id, pet_type_id, breed_id, name, age, weight, medical_notes, profile_image_url, created_at, updated_at) VALUES
(1, 1, 1, 2, 'Tommy', 5, 30.00, '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.pets_id_seq', 1, true);

-- Service Types
INSERT INTO petcare.service_types (id, name, description, icon, is_active, created_at, updated_at) VALUES
(1, 'Pet Grooming', 'Professional grooming services for your pets', 'scissors', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Pet Daycare', 'Supervised daytime care and socialization', 'clock', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 'Pet Photography', 'Professional photo sessions for your furry friends', 'camera', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(2, 'Veterinary Care', 'Expert medical care and checkups', 'stethoscop', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(3, 'Dog Walking', 'Daily walks and exercise for dogs', 'dog', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(4, 'Pet Boarding', 'Safe and comfortable stay for your pets', 'home', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(5, 'Pet Training', 'Behavioral training and obedience classes', 'award', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(7, 'Pet Spa', 'Luxury treatments, massage, and relaxation', 'sparkles', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(8, 'Nail Trimming', 'Professional paw care and nail clipping', 'paw-print', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(9, 'Teeth Cleaning', 'Oral hygiene and dental care for pets', 'smile', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(10, 'Pet Sitting', 'In-home care while owners are away', 'user', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(11, 'Emergency Care', 'Urgent medical assistance and 24/7 support', 'heart-pulse', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.service_types_id_seq', 12, true);

-- Providers
INSERT INTO petcare.providers (id, user_id, company_name, description, base_price, rating, total_bookings, address, city, latitude, longitude, is_verified, is_active, created_at, updated_at) VALUES
(1, 2, 'Paws & Claws Grooming', 'Top notch grooming services', 50.00, 4.80, 120, '123 Pet Lane', 'Tampa', 44.96804600, -94.42030700, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 3, 'Mike Groomer', 'Professional pet grooming services for all breeds', 40.00, 4.10, 67, '654 Pet Plaza', 'Dallas', 40.05734700, -74.41453200, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 5, 'Perfect Veterinary Clinic', 'Full-service veterinary care with 15 years of experience', 70.00, 5.00, 400, '456 Vet Lane', 'Tampa', NULL, NULL, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.providers_id_seq', 3, true);

-- Provider Service Types (Pricing)
INSERT INTO petcare.provider_service_types (id, provider_id, service_type_id, price, description, created_at, updated_at) VALUES
(13, 3, 3, 70.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 3, 11, 70.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 3, 8, 70.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.provider_service_types_id_seq', 15, true);

-- Status Master
INSERT INTO petcare.status_master (id, status_name, status_type, created_at) VALUES
(1, 'pending', 'appointment', CURRENT_TIMESTAMP),
(2, 'confirmed', 'appointment', CURRENT_TIMESTAMP),
(3, 'completed', 'appointment', CURRENT_TIMESTAMP),
(4, 'cancelled', 'appointment', CURRENT_TIMESTAMP),
(5, 'pending', 'payment', CURRENT_TIMESTAMP),
(6, 'completed', 'payment', CURRENT_TIMESTAMP),
(7, 'failed', 'payment', CURRENT_TIMESTAMP),
(8, 'pending', 'appointment', CURRENT_TIMESTAMP),
(9, 'confirmed', 'appointment', CURRENT_TIMESTAMP),
(10, 'completed', 'appointment', CURRENT_TIMESTAMP),
(11, 'cancelled', 'appointment', CURRENT_TIMESTAMP),
(12, 'pending', 'payment', CURRENT_TIMESTAMP),
(13, 'completed', 'payment', CURRENT_TIMESTAMP),
(14, 'failed', 'payment', CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.status_master_id_seq', 14, true);

-- Tips & Best Practices
INSERT INTO petcare.tips (id, user_role_id, service_type_id, title, content, is_active, created_at) VALUES
(1, 1, NULL, 'Pet Health Tip', 'Ensure your pet stays hydrated! Fresh water should always be available, especially after exercise.', false, CURRENT_TIMESTAMP),
(2, 1, 1, 'Grooming Tip', 'Regular brushing helps prevent matting and keeps your pets coat healthy and shiny.', false, CURRENT_TIMESTAMP),
(3, 1, 2, 'Vet Visit Tip', 'Keep a folder of your pets medical history and vaccination records for quick reference during vet visits.', false, CURRENT_TIMESTAMP),
(4, 2, NULL, 'Business Tip', 'Respond to booking requests within 2 hours to increase your chance of confirmation by 40%.', false, CURRENT_TIMESTAMP),
(5, 2, NULL, 'Profile Tip', 'Adding high-quality photos of your workplace builds trust with potential pet owners.', false, CURRENT_TIMESTAMP),
(6, 2, 1, 'Pro Groomer Tip', 'Always check for skin irritations or lumps during grooming and inform the owner immediately.', false, CURRENT_TIMESTAMP),
(7, 1, NULL, 'Nutrition Essentials', 'Feed your pet at consistent times each day to establish a healthy routine and prevent digestive issues.', false, CURRENT_TIMESTAMP),
(8, 1, 1, 'Coat Care Basics', 'Brush your pet at least twice a week to reduce shedding and distribute natural oils throughout their coat.', false, CURRENT_TIMESTAMP),
(9, 1, 2, 'Medical Records', 'Take photos of vaccination certificates and store them digitally for easy access during emergencies.', false, CURRENT_TIMESTAMP),
(10, 2, NULL, 'Customer Service', 'Send a follow-up message after each booking to gather feedback and improve your service quality.', false, CURRENT_TIMESTAMP),
(11, 2, NULL, 'Marketing Strategy', 'Share before-and-after photos with owner permission to showcase your work on social media.', false, CURRENT_TIMESTAMP),
(12, 2, 1, 'Safety Protocol', 'Sanitize all grooming tools between clients to prevent cross-contamination and maintain hygiene standards.', false, CURRENT_TIMESTAMP),
(13, 1, NULL, 'Exercise Routine', 'Ensure your pet gets at least 30 minutes of physical activity daily to maintain a healthy weight and mental well-being.', false, CURRENT_TIMESTAMP),
(14, 1, 1, 'Dental Care Tip', 'Brush your pet''s teeth regularly using pet-safe toothpaste to prevent plaque buildup and bad breath.', false, CURRENT_TIMESTAMP),
(15, 1, 2, 'Vaccination Reminder', 'Stay up to date with your pet''s vaccination schedule to protect them from common infectious diseases.', false, CURRENT_TIMESTAMP),
(16, 2, NULL, 'Client Retention Tip', 'Offer loyalty discounts to repeat customers to encourage long-term relationships and steady bookings.', false, CURRENT_TIMESTAMP),
(17, 2, NULL, 'Scheduling Tip', 'Use automated reminders to reduce no-shows and keep your daily appointments organized.', false, CURRENT_TIMESTAMP),
(18, 2, 1, 'Advanced Grooming Tip', 'Always use breed-specific grooming techniques to ensure the best results and comfort for the pet.', false, CURRENT_TIMESTAMP),
(19, 2, NULL, 'Hygiene Standard', 'Maintain a clean workspace by disinfecting tables and drying areas after every session.', false, CURRENT_TIMESTAMP),
(20, 2, NULL, 'Online Presence', 'Keep your business profile updated with accurate service details and pricing information.', false, CURRENT_TIMESTAMP),
(21, 1, 1, 'Shedding Control', 'Use de-shedding tools during seasonal coat changes to minimize loose fur around your home.', false, CURRENT_TIMESTAMP),
(22, 1, NULL, 'Hydration Check', 'Monitor your pet''s water intake daily to quickly detect any unusual changes in behavior or health.', false, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.tips_id_seq', 22, true);

-- System Configuration
INSERT INTO petcare.system_configurations (id, config_key, config_value, description, is_active, created_at, updated_at) VALUES
(1, 'hide_tips_management', 'true', 'If true, tips management will be hidden for all users', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.system_configurations_id_seq', 1, true);

-- ============================================================================
-- VERIFY INSTALLATION
-- ============================================================================
-- Run the following queries to verify the database setup:
-- SELECT COUNT(*) as user_count FROM petcare.users;
-- SELECT COUNT(*) as provider_count FROM petcare.providers;
-- SELECT COUNT(*) as pet_count FROM petcare.pets;
-- SELECT * FROM petcare.user_roles;
-- SELECT * FROM petcare.service_types;
-- ============================================================================
-- SELECT TABLES
-- ============================================================================
--SELECT id, owner_id, provider_id, pet_id, pet_name, pet_type, appointment_date, start_time, end_time, description, total_price, status, decline_reason, created_at, updated_at
--FROM petcare.appointments;
--SELECT id, provider_id, "date", start_time, end_time, is_booked, created_at
--FROM petcare.availability;
--SELECT id, pet_type_id, "name", origin, description, created_at
--FROM petcare.breeds;
--SELECT id, user_id, subject, message, created_at
--FROM petcare.feedbacks;
--SELECT id, user_id, title, message, "type", reference_id, is_read, created_at
--FROM petcare.notifications;
--SELECT id, appointment_id, user_id, amount, payment_method, transaction_id, stripe_payment_intent_id, stripe_client_secret, invoice_pdf, status, payment_date, created_at
--FROM petcare.payments;
--SELECT id, "name", is_active, created_at
--FROM petcare.pet_types;
--SELECT id, owner_id, pet_type_id, breed_id, "name", age, weight, medical_notes, profile_image_url, created_at, updated_at
--FROM petcare.pets;
--SELECT id, provider_id, url, description, created_at
--FROM petcare.provider_photos;
--SELECT id, provider_id, service_type_id, price, description, created_at, updated_at
--FROM petcare.provider_service_types;
--SELECT id, user_id, company_name, description, base_price, rating, total_bookings, address, city, latitude, longitude, service_area_description, is_verified, created_at, updated_at, banner_image_url, is_active
--FROM petcare.providers;
--SELECT id, appointment_id, owner_id, provider_id, rating, "comment", created_at
--FROM petcare.reviews;
--SELECT id, user_id, provider_id, created_at
--FROM petcare.saved_providers;
--SELECT id, "name", description, icon, is_active, created_at, updated_at
--FROM petcare.service_types;
--SELECT id, status_name, status_type, created_at
--FROM petcare.status_master;
--SELECT id, config_key, config_value, description, is_active, created_at, updated_at
--FROM petcare.system_configurations;
--SELECT id, user_role_id, service_type_id, title, "content", is_active, created_at
--FROM petcare.tips;
--SELECT id, role_name, description, created_at
--FROM petcare.user_roles;
--SELECT id, email, password_hash, first_name, last_name, phone_number, is_active, address, profile_image_url, password_reset_token, reset_token_expiry, created_at, updated_at, role_id
--FROM petcare.users;
