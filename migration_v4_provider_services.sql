-- Migration to support individual service pricing for providers while preserving data
SET search_path TO petcare;

-- 1. Create the new provider_services table
CREATE TABLE IF NOT EXISTS provider_services (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    service_type_id INTEGER NOT NULL REFERENCES service_types(id) ON DELETE RESTRICT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, service_type_id)
);

-- 2. Migrate existing data from the join table
-- We use the provider's current hourly_rate as the default price for existing services
INSERT INTO provider_services (provider_id, service_type_id, price)
SELECT pst.provider_id, pst.service_type_id, p.hourly_rate
FROM provider_service_types pst
JOIN providers p ON pst.provider_id = p.id;

-- 3. Drop the old join table
DROP TABLE IF EXISTS provider_service_types;

-- 4. Create index for faster lookups
CREATE INDEX idx_provider_services_provider ON provider_services(provider_id);
