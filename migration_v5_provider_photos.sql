-- Migration V5: Add Provider Photos Table
SET search_path TO petcare;

CREATE TABLE IF NOT EXISTS provider_photos (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by provider
CREATE INDEX IF NOT EXISTS idx_provider_photos_provider_id ON provider_photos(provider_id);
