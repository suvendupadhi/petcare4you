CREATE KEYSPACE IF NOT EXISTS petcare
WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 1}
AND DURABLE_WRITES = true;

USE petcare;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email text,
    password_hash text,
    first_name text,
    last_name text,
    phone_number text,
    user_type text,
    is_active boolean,
    created_at timestamp,
    updated_at timestamp
) WITH CLUSTERING ORDER BY (id ASC);

CREATE TABLE IF NOT EXISTS users_by_email (
    email text PRIMARY KEY,
    user_id UUID
);

CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY,
    user_id UUID,
    company_name text,
    description text,
    service_type text,
    hourly_rate decimal,
    rating decimal,
    review_count int,
    address text,
    city text,
    latitude decimal,
    longitude decimal,
    profile_image_url text,
    is_verified boolean,
    created_at timestamp,
    updated_at timestamp
);

CREATE TABLE IF NOT EXISTS providers_by_user (
    user_id UUID PRIMARY KEY,
    provider_id UUID,
    company_name text
);

CREATE TABLE IF NOT EXISTS providers_by_city (
    city text,
    service_type text,
    id UUID,
    company_name text,
    rating decimal,
    hourly_rate decimal,
    PRIMARY KEY ((city, service_type), rating, id)
) WITH CLUSTERING ORDER BY (rating DESC, id ASC);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY,
    owner_id UUID,
    provider_id UUID,
    appointment_date timestamp,
    start_time timestamp,
    end_time timestamp,
    status text,
    pet_name text,
    pet_type text,
    description text,
    total_price decimal,
    created_at timestamp,
    updated_at timestamp
);

CREATE TABLE IF NOT EXISTS appointments_by_owner (
    owner_id UUID,
    created_at timestamp,
    id UUID,
    provider_id UUID,
    appointment_date timestamp,
    status text,
    pet_name text,
    PRIMARY KEY ((owner_id), created_at, id)
) WITH CLUSTERING ORDER BY (created_at DESC, id ASC);

CREATE TABLE IF NOT EXISTS appointments_by_provider (
    provider_id UUID,
    appointment_date timestamp,
    id UUID,
    owner_id UUID,
    status text,
    pet_name text,
    start_time timestamp,
    PRIMARY KEY ((provider_id, appointment_date), id)
) WITH CLUSTERING ORDER BY (id ASC);

CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY,
    provider_id UUID,
    date timestamp,
    start_time timestamp,
    end_time timestamp,
    is_booked boolean,
    created_at timestamp
);

CREATE TABLE IF NOT EXISTS availability_by_provider (
    provider_id UUID,
    date timestamp,
    id UUID,
    start_time timestamp,
    end_time timestamp,
    is_booked boolean,
    PRIMARY KEY ((provider_id), date, id)
) WITH CLUSTERING ORDER BY (date ASC, id ASC);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY,
    appointment_id UUID,
    user_id UUID,
    amount decimal,
    status text,
    payment_method text,
    transaction_id text,
    payment_date timestamp,
    created_at timestamp
);

CREATE TABLE IF NOT EXISTS payments_by_user (
    user_id UUID,
    payment_date timestamp,
    id UUID,
    appointment_id UUID,
    amount decimal,
    status text,
    PRIMARY KEY ((user_id), payment_date, id)
) WITH CLUSTERING ORDER BY (payment_date DESC, id ASC);

CREATE INDEX IF NOT EXISTS ON users (email);
CREATE INDEX IF NOT EXISTS ON providers (user_id);
CREATE INDEX IF NOT EXISTS ON appointments (owner_id);
CREATE INDEX IF NOT EXISTS ON appointments (provider_id);
