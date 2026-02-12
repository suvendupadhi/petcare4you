-- Migration: Add Tips Table
-- Date: 2026-02-12

CREATE TABLE IF NOT EXISTS petcare.tips (
    id SERIAL PRIMARY KEY,
    user_role_id INTEGER REFERENCES petcare.user_roles(id),
    service_type_id INTEGER REFERENCES petcare.service_types(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Initial Tips
INSERT INTO petcare.tips (user_role_id, service_type_id, title, content)
VALUES 
    (1, NULL, 'Pet Health Tip', 'Ensure your pet stays hydrated! Fresh water should always be available, especially after exercise.'),
    (1, 1, 'Grooming Tip', 'Regular brushing helps prevent matting and keeps your pets coat healthy and shiny.'),
    (1, 2, 'Vet Visit Tip', 'Keep a folder of your pets medical history and vaccination records for quick reference during vet visits.'),
    (2, NULL, 'Business Tip', 'Respond to booking requests within 2 hours to increase your chance of confirmation by 40%.'),
    (2, NULL, 'Profile Tip', 'Adding high-quality photos of your workplace builds trust with potential pet owners.'),
    (2, 1, 'Pro Groomer Tip', 'Always check for skin irritations or lumps during grooming and inform the owner immediately.');
