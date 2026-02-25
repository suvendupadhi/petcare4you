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

-- CREATE ALL SEQUENCES FIRST
CREATE SEQUENCE petcare.user_roles_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.users_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.pet_types_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.breeds_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.pets_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.providers_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.service_types_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.provider_service_types_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.provider_photos_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.appointments_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.availability_id_seq1 AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.status_master_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.payments_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.reviews_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.saved_providers_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.notifications_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.tips_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.feedbacks_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE petcare.system_configurations_id_seq AS integer START WITH 1 INCREMENT BY 1;

-- User Roles
CREATE TABLE petcare.user_roles (
    id integer PRIMARY KEY DEFAULT nextval('petcare.user_roles_id_seq'),
    role_name character varying(50) NOT NULL UNIQUE,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.user_roles_id_seq OWNED BY petcare.user_roles.id;
CREATE INDEX idx_user_roles_row_status ON petcare.user_roles(row_status);

-- Users
CREATE TABLE petcare.users (
    id integer PRIMARY KEY DEFAULT nextval('petcare.users_id_seq'),
    email character varying(255) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone_number character varying(20),
    address character varying(255),
    profile_image_url character varying(500),
    password_reset_token character varying(100),
    reset_token_expiry timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone,
    role_id integer NOT NULL REFERENCES petcare.user_roles(id)
);
ALTER SEQUENCE petcare.users_id_seq OWNED BY petcare.users.id;
CREATE INDEX idx_users_email ON petcare.users(email);
CREATE INDEX idx_users_phone_number ON petcare.users(phone_number);
CREATE INDEX idx_users_row_status ON petcare.users(row_status);

-- Pet Types
CREATE TABLE petcare.pet_types (
    id integer PRIMARY KEY DEFAULT nextval('petcare.pet_types_id_seq'),
    name character varying(50) NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.pet_types_id_seq OWNED BY petcare.pet_types.id;
CREATE INDEX idx_pet_types_row_status ON petcare.pet_types(row_status);

-- Breeds
CREATE TABLE petcare.breeds (
    id integer PRIMARY KEY DEFAULT nextval('petcare.breeds_id_seq'),
    pet_type_id integer NOT NULL REFERENCES petcare.pet_types(id),
    name character varying(100) NOT NULL,
    origin character varying(100),
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone,
    UNIQUE(pet_type_id, name)
);
ALTER SEQUENCE petcare.breeds_id_seq OWNED BY petcare.breeds.id;
CREATE INDEX idx_breeds_row_status ON petcare.breeds(row_status);

-- Pets
CREATE TABLE petcare.pets (
    id integer PRIMARY KEY DEFAULT nextval('petcare.pets_id_seq'),
    owner_id integer NOT NULL REFERENCES petcare.users(id),
    pet_type_id integer NOT NULL REFERENCES petcare.pet_types(id),
    breed_id integer REFERENCES petcare.breeds(id),
    name character varying(100) NOT NULL,
    age integer,
    weight numeric(5,2),
    medical_notes text,
    profile_image_url character varying(500),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.pets_id_seq OWNED BY petcare.pets.id;
CREATE INDEX idx_pets_row_status ON petcare.pets(row_status);

-- Providers
CREATE TABLE petcare.providers (
    id integer PRIMARY KEY DEFAULT nextval('petcare.providers_id_seq'),
    user_id integer NOT NULL UNIQUE REFERENCES petcare.users(id),
    company_name character varying(200) NOT NULL,
    description text,
    hourly_rate numeric(10,2),
    rating numeric(3,2),
    total_bookings integer DEFAULT 0,
    review_count integer DEFAULT 0,
    address character varying(255),
    city character varying(100),
    latitude numeric(10,8),
    longitude numeric(11,8),
    service_area_description text,
    is_verified boolean DEFAULT false,
    stripe_account_id character varying(100),
    is_stripe_connected boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    profile_image_url character varying(500),
    banner_image_url character varying(500),
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.providers_id_seq OWNED BY petcare.providers.id;
CREATE INDEX idx_providers_city ON petcare.providers(city);
CREATE INDEX idx_providers_row_status ON petcare.providers(row_status);

-- Service Types
CREATE TABLE petcare.service_types (
    id integer PRIMARY KEY DEFAULT nextval('petcare.service_types_id_seq'),
    name character varying(100) NOT NULL UNIQUE,
    description text,
    icon_name character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.service_types_id_seq OWNED BY petcare.service_types.id;
CREATE INDEX idx_service_types_row_status ON petcare.service_types(row_status);

-- Provider Service Types & Pricing
CREATE TABLE petcare.provider_service_types (
    id integer PRIMARY KEY DEFAULT nextval('petcare.provider_service_types_id_seq'),
    provider_id integer NOT NULL,
    service_type_id integer NOT NULL,
    price numeric(10,2) DEFAULT 0.00,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
    --UNIQUE(provider_id, service_type_id)
);
ALTER SEQUENCE petcare.provider_service_types_id_seq OWNED BY petcare.provider_service_types.id;
CREATE INDEX idx_provider_service_types_row_status ON petcare.provider_service_types(row_status);

-- Provider Photos
CREATE TABLE petcare.provider_photos (
    id integer PRIMARY KEY DEFAULT nextval('petcare.provider_photos_id_seq'),
    provider_id integer NOT NULL REFERENCES petcare.providers(id),
    url character varying(500) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.provider_photos_id_seq OWNED BY petcare.provider_photos.id;
CREATE INDEX idx_provider_photos_provider_id ON petcare.provider_photos(provider_id);

-- Appointments
CREATE TABLE petcare.appointments (
    id integer PRIMARY KEY DEFAULT nextval('petcare.appointments_id_seq'),
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
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.appointments_id_seq OWNED BY petcare.appointments.id;
CREATE INDEX idx_appointments_owner ON petcare.appointments(owner_id);
CREATE INDEX idx_appointments_row_status ON petcare.appointments(row_status);

-- Availability Slots
CREATE TABLE petcare.availability (
    id integer PRIMARY KEY DEFAULT nextval('petcare.availability_id_seq1'),
    provider_id integer NOT NULL REFERENCES petcare.providers(id),
    date date NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    is_booked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.availability_id_seq1 OWNED BY petcare.availability.id;
CREATE INDEX idx_availability_row_status ON petcare.availability(row_status);

-- Status Master
CREATE TABLE petcare.status_master (
    id integer PRIMARY KEY DEFAULT nextval('petcare.status_master_id_seq'),
    status_name character varying(50) NOT NULL,
    status_type character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.status_master_id_seq OWNED BY petcare.status_master.id;
CREATE INDEX idx_status_master_row_status ON petcare.status_master(row_status);

-- Payments & Invoices
CREATE TABLE petcare.payments (
    id integer PRIMARY KEY DEFAULT nextval('petcare.payments_id_seq'),
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
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.payments_id_seq OWNED BY petcare.payments.id;
CREATE INDEX idx_payments_row_status ON petcare.payments(row_status);

-- Reviews & Ratings
CREATE TABLE petcare.reviews (
    id integer PRIMARY KEY DEFAULT nextval('petcare.reviews_id_seq'),
    appointment_id integer NOT NULL UNIQUE REFERENCES petcare.appointments(id),
    owner_id integer NOT NULL REFERENCES petcare.users(id),
    provider_id integer NOT NULL REFERENCES petcare.providers(id),
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.reviews_id_seq OWNED BY petcare.reviews.id;
CREATE INDEX idx_reviews_row_status ON petcare.reviews(row_status);

-- Saved/Favorite Providers
CREATE TABLE petcare.saved_providers (
    id integer PRIMARY KEY DEFAULT nextval('petcare.saved_providers_id_seq'),
    user_id integer NOT NULL REFERENCES petcare.users(id),
    provider_id integer NOT NULL REFERENCES petcare.providers(id),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone,
    UNIQUE(user_id, provider_id)
);
ALTER SEQUENCE petcare.saved_providers_id_seq OWNED BY petcare.saved_providers.id;
CREATE INDEX idx_saved_providers_user_id ON petcare.saved_providers(user_id);
CREATE INDEX idx_saved_providers_row_status ON petcare.saved_providers(row_status);

-- Notifications
CREATE TABLE petcare.notifications (
    id integer PRIMARY KEY DEFAULT nextval('petcare.notifications_id_seq'),
    user_id integer NOT NULL REFERENCES petcare.users(id),
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    reference_id character varying(100),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.notifications_id_seq OWNED BY petcare.notifications.id;
CREATE INDEX idx_notifications_user_id ON petcare.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON petcare.notifications(is_read);
CREATE INDEX idx_notifications_row_status ON petcare.notifications(row_status);

-- Tips & Best Practices
CREATE TABLE petcare.tips (
    id integer PRIMARY KEY DEFAULT nextval('petcare.tips_id_seq'),
    user_role_id integer REFERENCES petcare.user_roles(id),
    service_type_id integer REFERENCES petcare.service_types(id),
    title character varying(200) NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.tips_id_seq OWNED BY petcare.tips.id;
CREATE INDEX idx_tips_row_status ON petcare.tips(row_status);

-- Feedback & Support
CREATE TABLE petcare.feedbacks (
    id integer PRIMARY KEY DEFAULT nextval('petcare.feedbacks_id_seq'),
    user_id integer NOT NULL REFERENCES petcare.users(id),
    subject character varying(200) NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.feedbacks_id_seq OWNED BY petcare.feedbacks.id;
CREATE INDEX idx_feedbacks_row_status ON petcare.feedbacks(row_status);

-- System Configuration
CREATE TABLE petcare.system_configurations (
    id integer PRIMARY KEY DEFAULT nextval('petcare.system_configurations_id_seq'),
    config_key character varying(100) NOT NULL UNIQUE,
    config_value text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    row_status character varying(1) DEFAULT 'a' CHECK (row_status IN ('a', 'i', 'd', 'v')),
    deleted_at timestamp with time zone
);
ALTER SEQUENCE petcare.system_configurations_id_seq OWNED BY petcare.system_configurations.id;
CREATE INDEX idx_system_configurations_row_status ON petcare.system_configurations(row_status);

-- ============================================================================
-- SEED DATA - Production Ready
-- ============================================================================

-- User Roles
INSERT INTO petcare.user_roles (id, role_name, description, created_at) VALUES
(1, 'superadmin', 'Super Administrator', CURRENT_TIMESTAMP),
(2, 'admin', 'Administrator', CURRENT_TIMESTAMP),
(3, 'provider', 'Service Provider', CURRENT_TIMESTAMP),
(4, 'owner', 'Pet Owner', CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.user_roles_id_seq', 4, true);

-- Users (with bcrypt hashed passwords - $2a$11$DujVJ3ROGNB62kf5zs6Npu57kwYpxkMAb7.frND1FHWWrU7X/bMeq - Password@123)
INSERT INTO petcare.users (id, email, password_hash, first_name, last_name, phone_number, role_id, created_at, updated_at) VALUES
(1, 'superadmin@petcare4u.com', '$2a$11$DujVJ3ROGNB62kf5zs6Npu57kwYpxkMAb7.frND1FHWWrU7X/bMeq', 'Super', 'Admin', '+14567898901', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'systemdmin@petcare4u.com', '$2a$11$DujVJ3ROGNB62kf5zs6Npu57kwYpxkMAb7.frND1FHWWrU7X/bMeq', 'System', 'Admin', '+14567898903', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'groomer@serviceprovider.com', '$2a$11$DujVJ3ROGNB62kf5zs6Npu57kwYpxkMAb7.frND1FHWWrU7X/bMeq', 'Jane', 'Groomer', '+14567898904', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'daycare@serviceprovider.com', '$2a$11$DujVJ3ROGNB62kf5zs6Npu57kwYpxkMAb7.frND1FHWWrU7X/bMeq', 'Mike', 'Daycare', '+145678989053', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'owner@petowner.com', '$2a$11$DujVJ3ROGNB62kf5zs6Npu57kwYpxkMAb7.frND1FHWWrU7X/bMeq', 'John', 'Owner', '+14567898915', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'sarah.owner@petowner.com', '$2a$11$DujVJ3ROGNB62kf5zs6Npu57kwYpxkMAb7.frND1FHWWrU7X/bMeq', 'Sarah', 'Owner', '+14567898907', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.users_id_seq', 6, true);

-- Pet Types
INSERT INTO petcare.pet_types (id, name, row_status, created_at) VALUES
(1, 'Dog', 'a', CURRENT_TIMESTAMP),
(2, 'Cat','i', CURRENT_TIMESTAMP),
(3, 'Bird','i', CURRENT_TIMESTAMP),
(4, 'Rabbit','i', CURRENT_TIMESTAMP),
(5, 'Other','i', CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.pet_types_id_seq', 5, true);

-- Breeds
INSERT INTO petcare.breeds (id, pet_type_id, name, origin, description, created_at) VALUES
(1, 1, 'German Shepherd', 'Germany', NULL, CURRENT_TIMESTAMP),
(2, 1, 'Golden Retriever', 'Scotland', NULL, CURRENT_TIMESTAMP),
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
(1, 5, 1, 2, 'Tommy', 5, 30.00, '', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.pets_id_seq', 1, true);

-- Service Types
INSERT INTO petcare.service_types (id, name, description, icon_name, row_status, created_at, updated_at) VALUES
(1, 'Pet Grooming', 'Professional grooming services for your pets', 'scissors', 'a', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Pet Daycare', 'Supervised daytime care and socialization', 'clock', 'a', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Pet Photography', 'Professional photo sessions for your furry friends', 'camera', 'a', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(4, 'Veterinary Care', 'Expert medical care and checkups', 'stethoscop', 'i', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(5, 'Dog Walking', 'Daily walks and exercise for dogs', 'dog', 'i', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(6, 'Pet Boarding', 'Safe and comfortable stay for your pets', 'home', 'i', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(7, 'Pet Training', 'Behavioral training and obedience classes', 'award', 'i', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(8, 'Pet Spa', 'Luxury treatments, massage, and relaxation', 'sparkles', 'i', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(9, 'Nail Trimming', 'Professional paw care and nail clipping', 'paw-print', 'i', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(10, 'Teeth Cleaning', 'Oral hygiene and dental care for pets', 'smile', 'i', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(11, 'Pet Sitting', 'In-home care while owners are away', 'user', 'i', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
,(12, 'Emergency Care', 'Urgent medical assistance and 24/7 support', 'heart-pulse', 'i', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.service_types_id_seq', 12, true);

-- Providers
INSERT INTO petcare.providers (id, user_id, company_name, description, hourly_rate, rating, total_bookings, review_count, address, city, latitude, longitude, is_verified, row_status, created_at, updated_at) VALUES
(1, 3, 'Jane''s Grooming', 'Professional grooming services for all breeds', 40.00, 4.80, 120, 15, '123 Pet Lane', 'Tampa', 44.96804600, -94.42030700, true, 'a', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 4, 'Mike''s Daycare', 'Supervised daytime care and socialization', 35.00, 4.50, 85, 8, '456 Play Street', 'Tampa', 44.97804600, -94.43030700, true, 'a', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.providers_id_seq', 2, true);

-- Provider Service Types (Pricing)
INSERT INTO petcare.provider_service_types (id, provider_id, service_type_id, price, description, created_at, updated_at) VALUES
(1, 3, 1, 40.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 3, 3, 40.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 4, 2, 40.00, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.provider_service_types_id_seq', 3, true);
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
INSERT INTO petcare.tips (id, user_role_id, service_type_id, title, content, created_at) VALUES
(1, 1, NULL, 'Pet Health Tip', 'Ensure your pet stays hydrated! Fresh water should always be available, especially after exercise.', CURRENT_TIMESTAMP),
(2, 1, 1, 'Grooming Tip', 'Regular brushing helps prevent matting and keeps your pets coat healthy and shiny.', CURRENT_TIMESTAMP),
(3, 1, 2, 'Vet Visit Tip', 'Keep a folder of your pets medical history and vaccination records for quick reference during vet visits.', CURRENT_TIMESTAMP),
(4, 2, NULL, 'Business Tip', 'Respond to booking requests within 2 hours to increase your chance of confirmation by 40%.', CURRENT_TIMESTAMP),
(5, 2, NULL, 'Profile Tip', 'Adding high-quality photos of your workplace builds trust with potential pet owners.', CURRENT_TIMESTAMP),
(6, 2, 1, 'Pro Groomer Tip', 'Always check for skin irritations or lumps during grooming and inform the owner immediately.', CURRENT_TIMESTAMP),
(7, 1, NULL, 'Nutrition Essentials', 'Feed your pet at consistent times each day to establish a healthy routine and prevent digestive issues.', CURRENT_TIMESTAMP),
(8, 1, 1, 'Coat Care Basics', 'Brush your pet at least twice a week to reduce shedding and distribute natural oils throughout their coat.', CURRENT_TIMESTAMP),
(9, 1, 2, 'Medical Records', 'Take photos of vaccination certificates and store them digitally for easy access during emergencies.', CURRENT_TIMESTAMP),
(10, 2, NULL, 'Customer Service', 'Send a follow-up message after each booking to gather feedback and improve your service quality.', CURRENT_TIMESTAMP),
(11, 2, NULL, 'Marketing Strategy', 'Share before-and-after photos with owner permission to showcase your work on social media.', CURRENT_TIMESTAMP),
(12, 2, 1, 'Safety Protocol', 'Sanitize all grooming tools between clients to prevent cross-contamination and maintain hygiene standards.', CURRENT_TIMESTAMP),
(13, 1, NULL, 'Exercise Routine', 'Ensure your pet gets at least 30 minutes of physical activity daily to maintain a healthy weight and mental well-being.', CURRENT_TIMESTAMP),
(14, 1, 1, 'Dental Care Tip', 'Brush your pet''s teeth regularly using pet-safe toothpaste to prevent plaque buildup and bad breath.', CURRENT_TIMESTAMP),
(15, 1, 2, 'Vaccination Reminder', 'Stay up to date with your pet''s vaccination schedule to protect them from common infectious diseases.', CURRENT_TIMESTAMP),
(16, 2, NULL, 'Client Retention Tip', 'Offer loyalty discounts to repeat customers to encourage long-term relationships and steady bookings.', CURRENT_TIMESTAMP),
(17, 2, NULL, 'Scheduling Tip', 'Use automated reminders to reduce no-shows and keep your daily appointments organized.', CURRENT_TIMESTAMP),
(18, 2, 1, 'Advanced Grooming Tip', 'Always use breed-specific grooming techniques to ensure the best results and comfort for the pet.', CURRENT_TIMESTAMP),
(19, 2, NULL, 'Hygiene Standard', 'Maintain a clean workspace by disinfecting tables and drying areas after every session.', CURRENT_TIMESTAMP),
(20, 2, NULL, 'Online Presence', 'Keep your business profile updated with accurate service details and pricing information.', CURRENT_TIMESTAMP),
(21, 1, 1, 'Shedding Control', 'Use de-shedding tools during seasonal coat changes to minimize loose fur around your home.', CURRENT_TIMESTAMP),
(22, 1, NULL, 'Hydration Check', 'Monitor your pet''s water intake daily to quickly detect any unusual changes in behavior or health.', CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.tips_id_seq', 22, true);

-- System Configuration
INSERT INTO petcare.system_configurations (id, config_key, config_value, description, created_at, updated_at) VALUES
(1, 'hide_tips_management', 'true', 'If true, tips management will be hidden for all users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT pg_catalog.setval('petcare.system_configurations_id_seq', 1, true);
