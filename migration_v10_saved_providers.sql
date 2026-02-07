-- Migration V10: Create saved_providers table
CREATE TABLE IF NOT EXISTS petcare.saved_providers (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    provider_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_providers_user FOREIGN KEY (user_id) REFERENCES petcare.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_providers_provider FOREIGN KEY (provider_id) REFERENCES petcare.providers(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_provider UNIQUE (user_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_providers_user_id ON petcare.saved_providers(user_id);
