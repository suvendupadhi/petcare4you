--
-- PostgreSQL database dump
--

\restrict WOrSELRVbsKp5hXjEwWz0WnOqsDOPGLhcuMQtM7diuYsKOrLEKT7jPpbpZXLvgd

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-09 19:20:30

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE postgres;
--
-- TOC entry 5311 (class 1262 OID 5)
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United Kingdom.1252';


ALTER DATABASE postgres OWNER TO postgres;

\unrestrict WOrSELRVbsKp5hXjEwWz0WnOqsDOPGLhcuMQtM7diuYsKOrLEKT7jPpbpZXLvgd
\connect postgres
\restrict WOrSELRVbsKp5hXjEwWz0WnOqsDOPGLhcuMQtM7diuYsKOrLEKT7jPpbpZXLvgd

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 5311
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- TOC entry 7 (class 2615 OID 18226)
-- Name: petcare; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA petcare;


ALTER SCHEMA petcare OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 227 (class 1259 OID 18271)
-- Name: appointments; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.appointments (
    id integer NOT NULL,
    owner_id integer NOT NULL,
    provider_id integer NOT NULL,
    appointment_date date NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    description text,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status integer NOT NULL,
    pet_id integer,
    pet_name character varying(100) DEFAULT 'Unknown'::character varying,
    pet_type character varying(50) DEFAULT 'Other'::character varying
);


ALTER TABLE petcare.appointments OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 18270)
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.appointments_id_seq OWNER TO postgres;

--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 226
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.appointments_id_seq OWNED BY petcare.appointments.id;


--
-- TOC entry 229 (class 1259 OID 18302)
-- Name: availabilities; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.availabilities (
    id integer CONSTRAINT availability_id_not_null NOT NULL,
    provider_id integer CONSTRAINT availability_provider_id_not_null NOT NULL,
    date date CONSTRAINT availability_date_not_null NOT NULL,
    start_time timestamp with time zone CONSTRAINT availability_start_time_not_null NOT NULL,
    end_time timestamp with time zone CONSTRAINT availability_end_time_not_null NOT NULL,
    is_booked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.availabilities OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 18301)
-- Name: availability_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.availability_id_seq OWNER TO postgres;

--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 228
-- Name: availability_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.availability_id_seq OWNED BY petcare.availabilities.id;


--
-- TOC entry 271 (class 1259 OID 18721)
-- Name: breeds; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.breeds (
    id integer NOT NULL,
    pet_type_id integer NOT NULL,
    name character varying(100) NOT NULL,
    origin character varying(100),
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.breeds OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 18720)
-- Name: breeds_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.breeds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.breeds_id_seq OWNER TO postgres;

--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 270
-- Name: breeds_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.breeds_id_seq OWNED BY petcare.breeds.id;


--
-- TOC entry 279 (class 1259 OID 26885)
-- Name: notifications; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reference_id character varying(100)
);


ALTER TABLE petcare.notifications OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 26884)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 278
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.notifications_id_seq OWNED BY petcare.notifications.id;


--
-- TOC entry 231 (class 1259 OID 18321)
-- Name: payments; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.payments (
    id integer NOT NULL,
    appointment_id integer NOT NULL,
    user_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50),
    transaction_id character varying(100),
    payment_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status integer NOT NULL,
    stripe_payment_intent_id character varying(100),
    stripe_client_secret character varying(200)
);


ALTER TABLE petcare.payments OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 18320)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.payments_id_seq OWNER TO postgres;

--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 230
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.payments_id_seq OWNED BY petcare.payments.id;


--
-- TOC entry 269 (class 1259 OID 18709)
-- Name: pet_types; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.pet_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.pet_types OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 18708)
-- Name: pet_types_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.pet_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.pet_types_id_seq OWNER TO postgres;

--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 268
-- Name: pet_types_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.pet_types_id_seq OWNED BY petcare.pet_types.id;


--
-- TOC entry 273 (class 1259 OID 18741)
-- Name: pets; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.pets (
    id integer NOT NULL,
    owner_id integer NOT NULL,
    pet_type_id integer NOT NULL,
    breed_id integer,
    name character varying(100) NOT NULL,
    age integer,
    weight numeric(5,2),
    medical_notes text,
    profile_image_url character varying(500),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.pets OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 18740)
-- Name: pets_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.pets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.pets_id_seq OWNER TO postgres;

--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 272
-- Name: pets_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.pets_id_seq OWNED BY petcare.pets.id;


--
-- TOC entry 277 (class 1259 OID 26856)
-- Name: provider_photos; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.provider_photos (
    id integer NOT NULL,
    provider_id integer NOT NULL,
    url character varying(500) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.provider_photos OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 26855)
-- Name: provider_photos_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.provider_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.provider_photos_id_seq OWNER TO postgres;

--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 276
-- Name: provider_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.provider_photos_id_seq OWNED BY petcare.provider_photos.id;


--
-- TOC entry 275 (class 1259 OID 18803)
-- Name: provider_services; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.provider_services (
    id integer NOT NULL,
    provider_id integer NOT NULL,
    service_type_id integer NOT NULL,
    price numeric(10,2) DEFAULT 0.00 NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.provider_services OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 18802)
-- Name: provider_services_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.provider_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.provider_services_id_seq OWNER TO postgres;

--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 274
-- Name: provider_services_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.provider_services_id_seq OWNED BY petcare.provider_services.id;


--
-- TOC entry 225 (class 1259 OID 18246)
-- Name: providers; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.providers (
    id integer NOT NULL,
    user_id integer NOT NULL,
    company_name character varying(200) NOT NULL,
    description text,
    hourly_rate numeric(10,2) DEFAULT 0.00,
    rating numeric(3,2) DEFAULT 5.00,
    review_count integer DEFAULT 0,
    address character varying(255),
    city character varying(100),
    latitude numeric(10,8),
    longitude numeric(11,8),
    profile_image_url character varying(500),
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    stripe_account_id character varying(100),
    is_stripe_connected boolean DEFAULT false
);


ALTER TABLE petcare.providers OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 18245)
-- Name: providers_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.providers_id_seq OWNER TO postgres;

--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 224
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.providers_id_seq OWNED BY petcare.providers.id;


--
-- TOC entry 281 (class 1259 OID 26908)
-- Name: saved_providers; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.saved_providers (
    id integer NOT NULL,
    user_id integer NOT NULL,
    provider_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.saved_providers OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 26907)
-- Name: saved_providers_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.saved_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.saved_providers_id_seq OWNER TO postgres;

--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 280
-- Name: saved_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.saved_providers_id_seq OWNED BY petcare.saved_providers.id;


--
-- TOC entry 263 (class 1259 OID 18627)
-- Name: service_types; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.service_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon_name character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.service_types OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 18626)
-- Name: service_types_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.service_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.service_types_id_seq OWNER TO postgres;

--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 262
-- Name: service_types_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.service_types_id_seq OWNED BY petcare.service_types.id;


--
-- TOC entry 265 (class 1259 OID 18665)
-- Name: status_master; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.status_master (
    id integer NOT NULL,
    status_name character varying(50) NOT NULL,
    status_type character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.status_master OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 18664)
-- Name: status_master_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.status_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.status_master_id_seq OWNER TO postgres;

--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 264
-- Name: status_master_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.status_master_id_seq OWNED BY petcare.status_master.id;


--
-- TOC entry 267 (class 1259 OID 18689)
-- Name: user_roles; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.user_roles (
    id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.user_roles OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 18688)
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.user_roles_id_seq OWNER TO postgres;

--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 266
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.user_roles_id_seq OWNED BY petcare.user_roles.id;


--
-- TOC entry 223 (class 1259 OID 18228)
-- Name: users; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone_number character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    role_id integer NOT NULL,
    address character varying(255),
    profile_image_url character varying(500)
);


ALTER TABLE petcare.users OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 18227)
-- Name: users_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.users_id_seq OWNER TO postgres;

--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.users_id_seq OWNED BY petcare.users.id;


--
-- TOC entry 5017 (class 2604 OID 18791)
-- Name: appointments id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments ALTER COLUMN id SET DEFAULT nextval('petcare.appointments_id_seq'::regclass);


--
-- TOC entry 5022 (class 2604 OID 18792)
-- Name: availabilities id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.availabilities ALTER COLUMN id SET DEFAULT nextval('petcare.availability_id_seq'::regclass);


--
-- TOC entry 5036 (class 2604 OID 18793)
-- Name: breeds id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.breeds ALTER COLUMN id SET DEFAULT nextval('petcare.breeds_id_seq'::regclass);


--
-- TOC entry 5047 (class 2604 OID 26888)
-- Name: notifications id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.notifications ALTER COLUMN id SET DEFAULT nextval('petcare.notifications_id_seq'::regclass);


--
-- TOC entry 5025 (class 2604 OID 18794)
-- Name: payments id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments ALTER COLUMN id SET DEFAULT nextval('petcare.payments_id_seq'::regclass);


--
-- TOC entry 5034 (class 2604 OID 18795)
-- Name: pet_types id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pet_types ALTER COLUMN id SET DEFAULT nextval('petcare.pet_types_id_seq'::regclass);


--
-- TOC entry 5038 (class 2604 OID 18796)
-- Name: pets id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pets ALTER COLUMN id SET DEFAULT nextval('petcare.pets_id_seq'::regclass);


--
-- TOC entry 5045 (class 2604 OID 26859)
-- Name: provider_photos id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_photos ALTER COLUMN id SET DEFAULT nextval('petcare.provider_photos_id_seq'::regclass);


--
-- TOC entry 5041 (class 2604 OID 18806)
-- Name: provider_services id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_services ALTER COLUMN id SET DEFAULT nextval('petcare.provider_services_id_seq'::regclass);


--
-- TOC entry 5009 (class 2604 OID 18797)
-- Name: providers id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.providers ALTER COLUMN id SET DEFAULT nextval('petcare.providers_id_seq'::regclass);


--
-- TOC entry 5050 (class 2604 OID 26911)
-- Name: saved_providers id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.saved_providers ALTER COLUMN id SET DEFAULT nextval('petcare.saved_providers_id_seq'::regclass);


--
-- TOC entry 5027 (class 2604 OID 18798)
-- Name: service_types id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.service_types ALTER COLUMN id SET DEFAULT nextval('petcare.service_types_id_seq'::regclass);


--
-- TOC entry 5030 (class 2604 OID 18799)
-- Name: status_master id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.status_master ALTER COLUMN id SET DEFAULT nextval('petcare.status_master_id_seq'::regclass);


--
-- TOC entry 5032 (class 2604 OID 18800)
-- Name: user_roles id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.user_roles ALTER COLUMN id SET DEFAULT nextval('petcare.user_roles_id_seq'::regclass);


--
-- TOC entry 5005 (class 2604 OID 18801)
-- Name: users id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.users ALTER COLUMN id SET DEFAULT nextval('petcare.users_id_seq'::regclass);


--
-- TOC entry 5281 (class 0 OID 18271)
-- Dependencies: 227
-- Data for Name: appointments; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.appointments VALUES (1, 3, 2, '2026-01-31', '2026-01-31 09:00:00+05:30', '2026-01-31 10:00:00+05:30', 'Kukur', 70.00, '2026-01-29 23:01:52.115378+05:30', '2026-01-30 19:01:56.695157+05:30', 4, NULL, 'Unknown', 'Other');
INSERT INTO petcare.appointments VALUES (2, 3, 7, '2026-02-03', '2026-02-03 09:00:00+05:30', '2026-02-03 10:00:00+05:30', 'Booking for Daycare', 45.00, '2026-01-31 20:44:30.582253+05:30', '2026-02-03 22:22:16.380621+05:30', 3, NULL, 'Unknown', 'Other');
INSERT INTO petcare.appointments VALUES (3, 3, 2, '2026-02-02', '2026-02-02 10:00:00+05:30', '2026-02-02 11:00:00+05:30', 'catty->Ragdoll is sick', 70.00, '2026-02-02 21:38:08.974606+05:30', '2026-02-03 23:55:23.299536+05:30', 1, 1, 'cattyy', 'Cat');
INSERT INTO petcare.appointments VALUES (4, 3, 7, '2026-02-02', '2026-02-02 13:30:00+05:30', '2026-02-02 14:30:00+05:30', 'Booking for General Service', 45.00, '2026-02-03 23:55:02.851071+05:30', '2026-02-04 12:55:08.160693+05:30', 4, 3, 'Dogiii', 'Dog');
INSERT INTO petcare.appointments VALUES (6, 3, 7, '2026-02-07', '2026-02-07 09:00:00+05:30', '2026-02-07 10:00:00+05:30', 'Booking for Pet Spa', 30.00, '2026-02-06 22:46:20.838193+05:30', '2026-02-09 17:29:11.79941+05:30', 4, 3, 'Dogiii', 'Dog');
INSERT INTO petcare.appointments VALUES (5, 3, 7, '2026-02-07', '2026-02-07 15:00:00+05:30', '2026-02-07 16:00:00+05:30', 'Booking for General Service', 30.00, '2026-02-04 17:41:06.254563+05:30', '2026-02-09 17:29:10.620766+05:30', 4, 3, 'Dogiii', 'Dog');
INSERT INTO petcare.appointments VALUES (9, 16, 9, '2026-02-09', '2026-02-09 12:00:00+05:30', '2026-02-09 13:00:00+05:30', 'Booking for Pet Daycare', 50.00, '2026-02-09 17:35:45.988277+05:30', '2026-02-09 17:35:45.988483+05:30', 1, 4, 'O1- pet', 'Dog');
INSERT INTO petcare.appointments VALUES (10, 3, 7, '2026-02-11', '2026-02-11 09:00:00+05:30', '2026-02-11 10:00:00+05:30', 'Booking for Emergency Care', 30.00, '2026-02-09 19:14:44.403995+05:30', '2026-02-09 19:17:55.522303+05:30', 2, 3, 'Dogiii', 'Dog');


--
-- TOC entry 5283 (class 0 OID 18302)
-- Dependencies: 229
-- Data for Name: availabilities; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.availabilities VALUES (35, 7, '2026-02-11', '2026-02-11 11:00:00+05:30', '2026-02-11 12:00:00+05:30', false, '2026-02-09 17:31:48.649551+05:30');
INSERT INTO petcare.availabilities VALUES (31, 9, '2026-02-09', '2026-02-09 12:00:00+05:30', '2026-02-09 13:00:00+05:30', true, '2026-02-09 16:24:31.186947+05:30');
INSERT INTO petcare.availabilities VALUES (36, 7, '2026-02-12', '2026-02-12 09:00:00+05:30', '2026-02-12 10:00:00+05:30', false, '2026-02-09 19:04:26.934766+05:30');
INSERT INTO petcare.availabilities VALUES (37, 7, '2026-02-12', '2026-02-12 10:00:00+05:30', '2026-02-12 11:00:00+05:30', false, '2026-02-09 19:04:41.154691+05:30');
INSERT INTO petcare.availabilities VALUES (34, 7, '2026-02-11', '2026-02-11 09:00:00+05:30', '2026-02-11 10:00:00+05:30', true, '2026-02-09 17:31:26.330883+05:30');
INSERT INTO petcare.availabilities VALUES (2, 1, '2026-01-30', '2026-01-30 15:30:00+05:30', '2026-01-30 16:30:00+05:30', false, '2026-01-20 19:53:08.130927+05:30');
INSERT INTO petcare.availabilities VALUES (3, 6, '2026-01-29', '2026-01-29 14:30:00+05:30', '2026-01-29 15:30:00+05:30', false, '2026-01-29 23:11:35.134857+05:30');
INSERT INTO petcare.availabilities VALUES (4, 6, '2026-02-01', '2026-02-01 09:00:00+05:30', '2026-02-01 10:00:00+05:30', false, '2026-01-30 00:10:33.837187+05:30');
INSERT INTO petcare.availabilities VALUES (6, 6, '2026-01-29', '2026-01-29 09:00:00+05:30', '2026-01-29 10:00:00+05:30', false, '2026-01-30 00:39:14.92751+05:30');
INSERT INTO petcare.availabilities VALUES (7, 6, '2026-01-30', '2026-01-30 09:00:00+05:30', '2026-01-30 10:00:00+05:30', false, '2026-01-30 08:42:44.445039+05:30');
INSERT INTO petcare.availabilities VALUES (1, 2, '2026-02-01', '2026-02-01 14:30:00+05:30', '2026-02-01 15:30:00+05:30', false, '2026-01-20 19:53:08.130927+05:30');
INSERT INTO petcare.availabilities VALUES (9, 2, '2026-01-31', '2026-01-31 09:00:00+05:30', '2026-01-31 10:00:00+05:30', true, '2026-01-30 18:27:43.019204+05:30');
INSERT INTO petcare.availabilities VALUES (12, 7, '2026-02-03', '2026-02-03 09:00:00+05:30', '2026-02-03 10:00:00+05:30', true, '2026-01-31 19:29:02.500174+05:30');
INSERT INTO petcare.availabilities VALUES (14, 7, '2026-02-02', '2026-02-02 13:30:00+05:30', '2026-02-02 14:30:00+05:30', true, '2026-02-02 20:33:41.225696+05:30');
INSERT INTO petcare.availabilities VALUES (10, 2, '2026-02-02', '2026-02-02 09:00:00+05:30', '2026-02-02 10:00:00+05:30', false, '2026-01-30 18:50:47.104409+05:30');
INSERT INTO petcare.availabilities VALUES (11, 2, '2026-02-02', '2026-02-02 10:00:00+05:30', '2026-02-02 11:00:00+05:30', true, '2026-01-30 18:51:50.142502+05:30');
INSERT INTO petcare.availabilities VALUES (27, 7, '2026-02-09', '2026-02-09 09:00:00+05:30', '2026-02-09 10:00:00+05:30', false, '2026-02-06 22:41:58.439325+05:30');
INSERT INTO petcare.availabilities VALUES (28, 7, '2026-02-10', '2026-02-10 09:00:00+05:30', '2026-02-10 10:00:00+05:30', false, '2026-02-06 22:42:02.094536+05:30');
INSERT INTO petcare.availabilities VALUES (30, 9, '2026-02-09', '2026-02-09 10:00:00+05:30', '2026-02-09 11:00:00+05:30', true, '2026-02-09 15:48:44.65393+05:30');
INSERT INTO petcare.availabilities VALUES (32, 9, '2026-02-09', '2026-02-09 13:00:00+05:30', '2026-02-09 14:00:00+05:30', false, '2026-02-09 16:24:43.97956+05:30');
INSERT INTO petcare.availabilities VALUES (33, 9, '2026-02-11', '2026-02-11 13:00:00+05:30', '2026-02-11 14:00:00+05:30', false, '2026-02-09 16:24:54.809186+05:30');
INSERT INTO petcare.availabilities VALUES (29, 9, '2026-02-09', '2026-02-09 14:30:00+05:30', '2026-02-09 22:30:00+05:30', true, '2026-02-09 15:48:14.126035+05:30');


--
-- TOC entry 5295 (class 0 OID 18721)
-- Dependencies: 271
-- Data for Name: breeds; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.breeds VALUES (1, 1, 'Golden Retriever', 'Scotland', NULL, '2026-02-02 17:55:02.629687+05:30');
INSERT INTO petcare.breeds VALUES (2, 1, 'German Shepherd', 'Germany', NULL, '2026-02-02 17:55:02.629687+05:30');
INSERT INTO petcare.breeds VALUES (3, 1, 'French Bulldog', 'France', NULL, '2026-02-02 17:55:02.629687+05:30');
INSERT INTO petcare.breeds VALUES (4, 2, 'Siamese', 'Thailand', NULL, '2026-02-02 17:55:02.629687+05:30');
INSERT INTO petcare.breeds VALUES (5, 2, 'Maine Coon', 'United States', NULL, '2026-02-02 17:55:02.629687+05:30');
INSERT INTO petcare.breeds VALUES (6, 2, 'Persian', 'Iran', NULL, '2026-02-02 17:55:02.629687+05:30');
INSERT INTO petcare.breeds VALUES (7, 1, 'Labrador Retriever', 'Canada', 'Friendly and active', '2026-02-02 21:23:50.528535+05:30');
INSERT INTO petcare.breeds VALUES (8, 1, 'Poodle', 'Germany/France', 'Intelligent and elegant', '2026-02-02 21:23:50.528535+05:30');
INSERT INTO petcare.breeds VALUES (9, 2, 'Ragdoll', 'United States', 'Docile and affectionate', '2026-02-02 21:23:50.528535+05:30');


--
-- TOC entry 5303 (class 0 OID 26885)
-- Dependencies: 279
-- Data for Name: notifications; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.notifications VALUES (1, 14, 'New Booking Request', 'You have a new booking request for Dogiii on Feb 07, 2026.', 'Booking', true, '2026-02-06 22:46:20.88878', '0');
INSERT INTO petcare.notifications VALUES (2, 3, 'Booking Confirmed', 'Your booking for Dogiii on Feb 07, 2026 has been confirmed.', 'StatusChange', true, '2026-02-06 23:06:28.365059', '6');
INSERT INTO petcare.notifications VALUES (3, 17, 'New Booking Request', 'You have a new booking request for O1- pet on Feb 09, 2026.', 'Booking', true, '2026-02-09 15:55:52.295526', '0');
INSERT INTO petcare.notifications VALUES (4, 16, 'Booking Confirmed', 'Your booking for O1- pet on Feb 09, 2026 has been confirmed.', 'StatusChange', true, '2026-02-09 16:23:35.234673', '7');
INSERT INTO petcare.notifications VALUES (16, 17, 'New Booking Request', 'You have a new booking request for O1- pet on Feb 09, 2026.', 'Booking', true, '2026-02-09 17:35:46.081244', '9');
INSERT INTO petcare.notifications VALUES (17, 14, 'New Booking Request', 'You have a new booking request for Dogiii on Feb 11, 2026.', 'Booking', true, '2026-02-09 19:14:44.695563', '10');
INSERT INTO petcare.notifications VALUES (19, 3, 'Booking Confirmed', 'Your booking for Dogiii on Feb 11, 2026 has been confirmed.', 'StatusChange', false, '2026-02-09 19:17:55.522373', '10');
INSERT INTO petcare.notifications VALUES (18, 3, 'Booking Confirmed', 'Your booking for Dogiii on Feb 11, 2026 has been confirmed.', 'StatusChange', true, '2026-02-09 19:17:55.522458', '10');


--
-- TOC entry 5285 (class 0 OID 18321)
-- Dependencies: 231
-- Data for Name: payments; Type: TABLE DATA; Schema: petcare; Owner: postgres
--



--
-- TOC entry 5293 (class 0 OID 18709)
-- Dependencies: 269
-- Data for Name: pet_types; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.pet_types VALUES (1, 'Dog', '2026-02-02 17:54:47.047886+05:30');
INSERT INTO petcare.pet_types VALUES (2, 'Cat', '2026-02-02 17:54:47.047886+05:30');
INSERT INTO petcare.pet_types VALUES (3, 'Bird', '2026-02-02 17:54:47.047886+05:30');
INSERT INTO petcare.pet_types VALUES (4, 'Rabbit', '2026-02-02 17:54:47.047886+05:30');
INSERT INTO petcare.pet_types VALUES (5, 'Other', '2026-02-02 17:54:47.047886+05:30');


--
-- TOC entry 5297 (class 0 OID 18741)
-- Dependencies: 273
-- Data for Name: pets; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.pets VALUES (1, 3, 2, 4, 'PrettyCat', 5, 20.00, '', '', '2026-02-02 21:38:08.489798+05:30', '2026-02-06 19:09:17.286631+05:30');
INSERT INTO petcare.pets VALUES (3, 3, 1, 1, 'Dogiii', 5, 29.00, '', 'file:///var/mobile/Containers/Data/Application/2A5E6771-7F2D-4283-9518-7E935E87FFA2/Library/Caches/ExponentExperienceData/@anonymous/petcare-services-9922dc7c-ec84-4f25-ab7d-5a9f90ed4bde/ImagePicker/1390948C-C618-4625-A159-9B6FCA6D06FA.jpg', '2026-02-03 23:55:02.451908+05:30', '2026-02-07 18:04:59.087332+05:30');
INSERT INTO petcare.pets VALUES (4, 16, 1, 8, 'O1- pet', 0, 0.00, '', '', '2026-02-09 15:39:33.641141+05:30', '2026-02-09 15:39:33.641208+05:30');


--
-- TOC entry 5301 (class 0 OID 26856)
-- Dependencies: 277
-- Data for Name: provider_photos; Type: TABLE DATA; Schema: petcare; Owner: postgres
--



--
-- TOC entry 5299 (class 0 OID 18803)
-- Dependencies: 275
-- Data for Name: provider_services; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.provider_services VALUES (1, 1, 1, 50.00, NULL, '2026-02-03 14:16:26.192429+05:30', '2026-02-03 14:16:26.192429+05:30');
INSERT INTO petcare.provider_services VALUES (2, 6, 1, 40.00, NULL, '2026-02-03 14:16:26.192429+05:30', '2026-02-03 14:16:26.192429+05:30');
INSERT INTO petcare.provider_services VALUES (3, 2, 2, 70.00, NULL, '2026-02-03 14:16:26.192429+05:30', '2026-02-03 14:16:26.192429+05:30');
INSERT INTO petcare.provider_services VALUES (9, 7, 7, 45.00, '', '2026-02-05 21:49:25.821734+05:30', '2026-02-06 11:30:05.51179+05:30');
INSERT INTO petcare.provider_services VALUES (11, 7, 6, 30.00, NULL, '2026-02-06 11:31:39.283755+05:30', '2026-02-06 11:31:39.283756+05:30');
INSERT INTO petcare.provider_services VALUES (12, 7, 3, 30.00, NULL, '2026-02-06 11:31:39.283765+05:30', '2026-02-06 11:31:39.283765+05:30');
INSERT INTO petcare.provider_services VALUES (20, 8, 3, 10.00, '', '2026-02-06 12:05:29.262601+05:30', '2026-02-06 12:05:29.262601+05:30');
INSERT INTO petcare.provider_services VALUES (21, 8, 11, 50.00, NULL, '2026-02-06 12:12:52.961035+05:30', '2026-02-06 12:12:52.961035+05:30');
INSERT INTO petcare.provider_services VALUES (22, 7, 11, 30.00, NULL, '2026-02-06 21:57:57.491905+05:30', '2026-02-06 21:57:57.491906+05:30');
INSERT INTO petcare.provider_services VALUES (23, 9, 3, 50.00, NULL, '2026-02-09 15:44:01.384925+05:30', '2026-02-09 15:44:01.384925+05:30');
INSERT INTO petcare.provider_services VALUES (25, 9, 10, 50.00, NULL, '2026-02-09 15:44:01.38502+05:30', '2026-02-09 15:44:01.385021+05:30');
INSERT INTO petcare.provider_services VALUES (26, 9, 4, 50.00, NULL, '2026-02-09 15:47:09.847227+05:30', '2026-02-09 15:47:09.847228+05:30');
INSERT INTO petcare.provider_services VALUES (24, 9, 6, 20.00, '', '2026-02-09 15:44:01.38502+05:30', '2026-02-09 15:47:34.697511+05:30');
INSERT INTO petcare.provider_services VALUES (27, 9, 11, 35.00, '', '2026-02-09 15:49:43.290851+05:30', '2026-02-09 15:49:43.290852+05:30');


--
-- TOC entry 5279 (class 0 OID 18246)
-- Dependencies: 225
-- Data for Name: providers; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.providers VALUES (8, 15, 'Test Business', '', 50.00, 5.00, 0, 'Business Address', 'City', 0.00000000, 0.00000000, NULL, false, '2026-02-06 11:46:59.014167+05:30', '2026-02-06 12:12:52.961012+05:30', NULL, false);
INSERT INTO petcare.providers VALUES (1, 1, 'Paws & Claws Grooming', 'Top notch grooming services', 50.00, 4.80, 120, '123 Pet Lane', 'San Francisco', 44.96804600, -94.42030700, NULL, true, '2026-01-20 19:53:08.130927+05:30', '2026-01-20 19:53:08.130927+05:30', NULL, false);
INSERT INTO petcare.providers VALUES (6, 5, 'Mike Groomer', 'Professional pet grooming services for all breeds', 40.00, 4.10, 67, '654 Pet Plaza', 'New Jercy', 40.05734700, -74.41453200, NULL, true, '2026-01-29 19:22:59.731048+05:30', '2026-01-29 19:22:59.731048+05:30', NULL, false);
INSERT INTO petcare.providers VALUES (2, 6, 'Dr. Emily Brown', 'Full-service veterinary care with 15 years of experience', 70.00, 4.90, 127, '321 Animal Road', 'San Francisco', 41.96804700, 44.96804500, NULL, true, '2026-01-29 19:03:33.947821+05:30', '2026-01-29 19:03:33.947821+05:30', NULL, false);
INSERT INTO petcare.providers VALUES (9, 17, 'Businesses 1', '', 50.00, 5.00, 0, 'Business Address', 'Tampa', 0.00000000, 0.00000000, NULL, false, '2026-02-09 15:44:01.384796+05:30', '2026-02-09 15:47:09.841266+05:30', NULL, false);
INSERT INTO petcare.providers VALUES (7, 14, 'Happy Tails Daycare', 'Happy Tails Daycare', 30.00, 5.00, 0, '456 Dog Avenue', 'Tampa', 0.00000000, 0.00000000, '/uploads/provider_7_639062552013904817.jpg', true, '2026-01-31 19:25:46.590553+05:30', '2026-02-09 17:33:21.401572+05:30', NULL, false);


--
-- TOC entry 5305 (class 0 OID 26908)
-- Dependencies: 281
-- Data for Name: saved_providers; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.saved_providers VALUES (1, 3, 7, '2026-02-07 21:33:58.489428+05:30');
INSERT INTO petcare.saved_providers VALUES (2, 16, 9, '2026-02-09 15:55:30.317672+05:30');


--
-- TOC entry 5287 (class 0 OID 18627)
-- Dependencies: 263
-- Data for Name: service_types; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.service_types VALUES (1, 'Pet Grooming', 'Professional grooming services for your pets', 'scissors', '2026-02-01 10:42:09.937027+05:30', '2026-02-01 10:42:09.937027+05:30');
INSERT INTO petcare.service_types VALUES (2, 'Veterinary Care', 'Expert medical care and checkups', 'stethoscop', '2026-02-01 10:42:09.937027+05:30', '2026-02-01 10:42:09.937027+05:30');
INSERT INTO petcare.service_types VALUES (3, 'Dog Walking', 'Daily walks and exercise for dogs', 'dog', '2026-02-01 10:42:09.937027+05:30', '2026-02-01 10:42:09.937027+05:30');
INSERT INTO petcare.service_types VALUES (4, 'Pet Boarding', 'Safe and comfortable stay for your pets', 'home', '2026-02-01 10:42:09.937027+05:30', '2026-02-01 10:42:09.937027+05:30');
INSERT INTO petcare.service_types VALUES (5, 'Pet Training', 'Behavioral training and obedience classes', 'award', '2026-02-01 10:42:09.937027+05:30', '2026-02-01 10:42:09.937027+05:30');
INSERT INTO petcare.service_types VALUES (6, 'Pet Daycare', 'Supervised daytime care and socialization', 'clock', '2026-02-01 11:11:49.541482+05:30', '2026-02-01 11:11:49.541482+05:30');
INSERT INTO petcare.service_types VALUES (7, 'Pet Spa', 'Luxury treatments, massage, and relaxation', 'sparkles', '2026-02-01 11:11:49.541482+05:30', '2026-02-01 11:11:49.541482+05:30');
INSERT INTO petcare.service_types VALUES (8, 'Nail Trimming', 'Professional paw care and nail clipping', 'paw-print', '2026-02-01 11:11:49.541482+05:30', '2026-02-01 11:11:49.541482+05:30');
INSERT INTO petcare.service_types VALUES (9, 'Teeth Cleaning', 'Oral hygiene and dental care for pets', 'smile', '2026-02-01 11:11:49.541482+05:30', '2026-02-01 11:11:49.541482+05:30');
INSERT INTO petcare.service_types VALUES (10, 'Pet Sitting', 'In-home care while owners are away', 'user', '2026-02-01 11:11:49.541482+05:30', '2026-02-01 11:11:49.541482+05:30');
INSERT INTO petcare.service_types VALUES (11, 'Emergency Care', 'Urgent medical assistance and 24/7 support', 'heart-pulse', '2026-02-01 11:11:49.541482+05:30', '2026-02-01 11:11:49.541482+05:30');
INSERT INTO petcare.service_types VALUES (12, 'Pet Photography', 'Professional photo sessions for your furry friends', 'camera', '2026-02-01 11:11:49.541482+05:30', '2026-02-01 11:11:49.541482+05:30');


--
-- TOC entry 5289 (class 0 OID 18665)
-- Dependencies: 265
-- Data for Name: status_master; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.status_master VALUES (1, 'pending', 'appointment', '2026-02-02 15:51:33.597558+05:30');
INSERT INTO petcare.status_master VALUES (2, 'confirmed', 'appointment', '2026-02-02 15:51:33.597558+05:30');
INSERT INTO petcare.status_master VALUES (3, 'completed', 'appointment', '2026-02-02 15:51:33.597558+05:30');
INSERT INTO petcare.status_master VALUES (4, 'cancelled', 'appointment', '2026-02-02 15:51:33.597558+05:30');
INSERT INTO petcare.status_master VALUES (5, 'pending', 'payment', '2026-02-02 15:51:33.597558+05:30');
INSERT INTO petcare.status_master VALUES (6, 'completed', 'payment', '2026-02-02 15:51:33.597558+05:30');
INSERT INTO petcare.status_master VALUES (7, 'failed', 'payment', '2026-02-02 15:51:33.597558+05:30');
INSERT INTO petcare.status_master VALUES (8, 'pending', 'appointment', '2026-02-02 19:25:30.623149+05:30');
INSERT INTO petcare.status_master VALUES (9, 'confirmed', 'appointment', '2026-02-02 19:25:30.623149+05:30');
INSERT INTO petcare.status_master VALUES (10, 'completed', 'appointment', '2026-02-02 19:25:30.623149+05:30');
INSERT INTO petcare.status_master VALUES (11, 'cancelled', 'appointment', '2026-02-02 19:25:30.623149+05:30');
INSERT INTO petcare.status_master VALUES (12, 'pending', 'payment', '2026-02-02 19:25:30.623149+05:30');
INSERT INTO petcare.status_master VALUES (13, 'completed', 'payment', '2026-02-02 19:25:30.623149+05:30');
INSERT INTO petcare.status_master VALUES (14, 'failed', 'payment', '2026-02-02 19:25:30.623149+05:30');


--
-- TOC entry 5291 (class 0 OID 18689)
-- Dependencies: 267
-- Data for Name: user_roles; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.user_roles VALUES (1, 'owner', 'Pet Owner', '2026-02-02 17:49:02.650574+05:30');
INSERT INTO petcare.user_roles VALUES (2, 'provider', 'Service Provider', '2026-02-02 17:49:02.650574+05:30');
INSERT INTO petcare.user_roles VALUES (3, 'admin', 'Administrator', '2026-02-02 17:49:02.650574+05:30');


--
-- TOC entry 5277 (class 0 OID 18228)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.users VALUES (3, 'suvendu@example.com', 'password123', 'Suvendu', 'Padhi', '555-0203', true, '2026-01-29 07:02:40.675341+05:30', '2026-02-07 18:06:48.624119+05:30', 1, '', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400');
INSERT INTO petcare.users VALUES (16, 'o1@owner.com', 'password123', 'Pet', 'Owner1', '3456123421', true, '2026-02-09 15:37:00.744023+05:30', '2026-02-09 15:39:56.581059+05:30', 1, 'Add1', '');
INSERT INTO petcare.users VALUES (17, 'b1@business.com', 'password123', 'Business ', 'Ownwer1', '', true, '2026-02-09 15:44:01.156123+05:30', '2026-02-09 15:44:01.156123+05:30', 2, NULL, NULL);
INSERT INTO petcare.users VALUES (1, 'owner@example.com', 'password123', 'John', 'Owner', '555-1234', true, '2026-01-20 19:53:08.130927+05:30', '2026-01-20 19:53:08.130927+05:30', 1, NULL, NULL);
INSERT INTO petcare.users VALUES (4, 'sarah.owner@example.com', 'password123', 'Sarah', 'Johnson', '555-0102', true, '2026-01-29 17:59:49.79671+05:30', '2026-01-29 17:59:49.79671+05:30', 1, NULL, NULL);
INSERT INTO petcare.users VALUES (11, 'arvind@gmail.com', 'password123', 'Arvind', 'Swaminathan', '(555) 234-5671', true, '2026-01-30 21:50:46.807722+05:30', '2026-01-30 21:50:46.807722+05:30', 1, NULL, NULL);
INSERT INTO petcare.users VALUES (2, 'groomer@example.com', 'password123', 'Jane', 'Groomer', '555-5678', true, '2026-01-20 19:53:08.130927+05:30', '2026-01-20 19:53:08.130927+05:30', 2, NULL, NULL);
INSERT INTO petcare.users VALUES (5, 'dr.emily@example.com', 'password123', 'Dr Emily', 'Brown', '555-0201', true, '2026-01-29 17:59:49.79671+05:30', '2026-01-29 17:59:49.79671+05:30', 2, NULL, NULL);
INSERT INTO petcare.users VALUES (6, 'mike.groomer@example.com', 'password123', 'Mike', 'Wilson', '555-0202', true, '2026-01-29 17:59:49.79671+05:30', '2026-01-29 17:59:49.79671+05:30', 2, NULL, NULL);
INSERT INTO petcare.users VALUES (14, 'business@htd.com', 'password123', 'David', 'Smith', '', true, '2026-01-31 19:25:25.544176+05:30', '2026-01-31 19:25:25.544176+05:30', 2, NULL, NULL);
INSERT INTO petcare.users VALUES (15, 'test@test.com', 'password123', 'test businss', 'Owner', '', true, '2026-02-06 11:46:42.156734+05:30', '2026-02-06 11:46:42.156734+05:30', 2, NULL, NULL);


--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 226
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.appointments_id_seq', 10, true);


--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 228
-- Name: availability_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.availability_id_seq', 37, true);


--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 270
-- Name: breeds_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.breeds_id_seq', 9, true);


--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 278
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.notifications_id_seq', 19, true);


--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 230
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.payments_id_seq', 1, false);


--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 268
-- Name: pet_types_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.pet_types_id_seq', 5, true);


--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 272
-- Name: pets_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.pets_id_seq', 4, true);


--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 276
-- Name: provider_photos_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.provider_photos_id_seq', 1, false);


--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 274
-- Name: provider_services_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.provider_services_id_seq', 27, true);


--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 224
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.providers_id_seq', 9, true);


--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 280
-- Name: saved_providers_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.saved_providers_id_seq', 2, true);


--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 262
-- Name: service_types_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.service_types_id_seq', 12, true);


--
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 264
-- Name: status_master_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.status_master_id_seq', 14, true);


--
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 266
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.user_roles_id_seq', 6, true);


--
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.users_id_seq', 17, true);


--
-- TOC entry 5063 (class 2606 OID 18290)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 5066 (class 2606 OID 18314)
-- Name: availabilities availability_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.availabilities
    ADD CONSTRAINT availability_pkey PRIMARY KEY (id);


--
-- TOC entry 5087 (class 2606 OID 18734)
-- Name: breeds breeds_pet_type_id_name_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.breeds
    ADD CONSTRAINT breeds_pet_type_id_name_key UNIQUE (pet_type_id, name);


--
-- TOC entry 5089 (class 2606 OID 18732)
-- Name: breeds breeds_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.breeds
    ADD CONSTRAINT breeds_pkey PRIMARY KEY (id);


--
-- TOC entry 5103 (class 2606 OID 26899)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5069 (class 2606 OID 18334)
-- Name: payments payments_appointment_id_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments
    ADD CONSTRAINT payments_appointment_id_key UNIQUE (appointment_id);


--
-- TOC entry 5071 (class 2606 OID 18332)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5083 (class 2606 OID 18719)
-- Name: pet_types pet_types_name_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pet_types
    ADD CONSTRAINT pet_types_name_key UNIQUE (name);


--
-- TOC entry 5085 (class 2606 OID 18717)
-- Name: pet_types pet_types_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pet_types
    ADD CONSTRAINT pet_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5091 (class 2606 OID 18754)
-- Name: pets pets_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pets
    ADD CONSTRAINT pets_pkey PRIMARY KEY (id);


--
-- TOC entry 5099 (class 2606 OID 26867)
-- Name: provider_photos provider_photos_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_photos
    ADD CONSTRAINT provider_photos_pkey PRIMARY KEY (id);


--
-- TOC entry 5094 (class 2606 OID 18817)
-- Name: provider_services provider_services_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_services
    ADD CONSTRAINT provider_services_pkey PRIMARY KEY (id);


--
-- TOC entry 5096 (class 2606 OID 18819)
-- Name: provider_services provider_services_provider_id_service_type_id_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_services
    ADD CONSTRAINT provider_services_provider_id_service_type_id_key UNIQUE (provider_id, service_type_id);


--
-- TOC entry 5059 (class 2606 OID 18262)
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 18264)
-- Name: providers providers_user_id_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.providers
    ADD CONSTRAINT providers_user_id_key UNIQUE (user_id);


--
-- TOC entry 5106 (class 2606 OID 26917)
-- Name: saved_providers saved_providers_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.saved_providers
    ADD CONSTRAINT saved_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 5073 (class 2606 OID 18640)
-- Name: service_types service_types_name_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.service_types
    ADD CONSTRAINT service_types_name_key UNIQUE (name);


--
-- TOC entry 5075 (class 2606 OID 18638)
-- Name: service_types service_types_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5077 (class 2606 OID 18674)
-- Name: status_master status_master_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.status_master
    ADD CONSTRAINT status_master_pkey PRIMARY KEY (id);


--
-- TOC entry 5108 (class 2606 OID 26919)
-- Name: saved_providers uk_user_provider; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.saved_providers
    ADD CONSTRAINT uk_user_provider UNIQUE (user_id, provider_id);


--
-- TOC entry 5079 (class 2606 OID 18699)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5081 (class 2606 OID 18701)
-- Name: user_roles user_roles_role_name_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.user_roles
    ADD CONSTRAINT user_roles_role_name_key UNIQUE (role_name);


--
-- TOC entry 5054 (class 2606 OID 18244)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5056 (class 2606 OID 18242)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5064 (class 1259 OID 18347)
-- Name: idx_appointments_owner; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_appointments_owner ON petcare.appointments USING btree (owner_id);


--
-- TOC entry 5067 (class 1259 OID 18348)
-- Name: idx_availability_provider; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_availability_provider ON petcare.availabilities USING btree (provider_id);


--
-- TOC entry 5100 (class 1259 OID 26906)
-- Name: idx_notifications_is_read; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON petcare.notifications USING btree (is_read);


--
-- TOC entry 5101 (class 1259 OID 26905)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON petcare.notifications USING btree (user_id);


--
-- TOC entry 5097 (class 1259 OID 26873)
-- Name: idx_provider_photos_provider_id; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_provider_photos_provider_id ON petcare.provider_photos USING btree (provider_id);


--
-- TOC entry 5092 (class 1259 OID 18830)
-- Name: idx_provider_services_provider; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_provider_services_provider ON petcare.provider_services USING btree (provider_id);


--
-- TOC entry 5057 (class 1259 OID 18346)
-- Name: idx_providers_city; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_providers_city ON petcare.providers USING btree (city);


--
-- TOC entry 5104 (class 1259 OID 26930)
-- Name: idx_saved_providers_user_id; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_saved_providers_user_id ON petcare.saved_providers USING btree (user_id);


--
-- TOC entry 5052 (class 1259 OID 18345)
-- Name: idx_users_email; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_users_email ON petcare.users USING btree (email);


--
-- TOC entry 5111 (class 2606 OID 18291)
-- Name: appointments appointments_owner_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments
    ADD CONSTRAINT appointments_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES petcare.users(id);


--
-- TOC entry 5112 (class 2606 OID 18296)
-- Name: appointments appointments_provider_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments
    ADD CONSTRAINT appointments_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES petcare.providers(id);


--
-- TOC entry 5115 (class 2606 OID 18315)
-- Name: availabilities availability_provider_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.availabilities
    ADD CONSTRAINT availability_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES petcare.providers(id) ON DELETE CASCADE;


--
-- TOC entry 5119 (class 2606 OID 18735)
-- Name: breeds breeds_pet_type_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.breeds
    ADD CONSTRAINT breeds_pet_type_id_fkey FOREIGN KEY (pet_type_id) REFERENCES petcare.pet_types(id) ON DELETE CASCADE;


--
-- TOC entry 5113 (class 2606 OID 26879)
-- Name: appointments fk_appointments_pet; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments
    ADD CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id) REFERENCES petcare.pets(id) ON DELETE SET NULL;


--
-- TOC entry 5114 (class 2606 OID 18676)
-- Name: appointments fk_appointments_status; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments
    ADD CONSTRAINT fk_appointments_status FOREIGN KEY (status) REFERENCES petcare.status_master(id);


--
-- TOC entry 5126 (class 2606 OID 26900)
-- Name: notifications fk_notifications_user; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.notifications
    ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES petcare.users(id) ON DELETE CASCADE;


--
-- TOC entry 5116 (class 2606 OID 18682)
-- Name: payments fk_payments_status; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments
    ADD CONSTRAINT fk_payments_status FOREIGN KEY (status) REFERENCES petcare.status_master(id);


--
-- TOC entry 5127 (class 2606 OID 26925)
-- Name: saved_providers fk_saved_providers_provider; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.saved_providers
    ADD CONSTRAINT fk_saved_providers_provider FOREIGN KEY (provider_id) REFERENCES petcare.providers(id) ON DELETE CASCADE;


--
-- TOC entry 5128 (class 2606 OID 26920)
-- Name: saved_providers fk_saved_providers_user; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.saved_providers
    ADD CONSTRAINT fk_saved_providers_user FOREIGN KEY (user_id) REFERENCES petcare.users(id) ON DELETE CASCADE;


--
-- TOC entry 5109 (class 2606 OID 18703)
-- Name: users fk_users_role; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.users
    ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES petcare.user_roles(id);


--
-- TOC entry 5117 (class 2606 OID 18335)
-- Name: payments payments_appointment_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments
    ADD CONSTRAINT payments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES petcare.appointments(id) ON DELETE CASCADE;


--
-- TOC entry 5118 (class 2606 OID 18340)
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES petcare.users(id);


--
-- TOC entry 5120 (class 2606 OID 18765)
-- Name: pets pets_breed_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pets
    ADD CONSTRAINT pets_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES petcare.breeds(id);


--
-- TOC entry 5121 (class 2606 OID 18755)
-- Name: pets pets_owner_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pets
    ADD CONSTRAINT pets_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES petcare.users(id) ON DELETE CASCADE;


--
-- TOC entry 5122 (class 2606 OID 18760)
-- Name: pets pets_pet_type_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pets
    ADD CONSTRAINT pets_pet_type_id_fkey FOREIGN KEY (pet_type_id) REFERENCES petcare.pet_types(id);


--
-- TOC entry 5125 (class 2606 OID 26868)
-- Name: provider_photos provider_photos_provider_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_photos
    ADD CONSTRAINT provider_photos_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES petcare.providers(id) ON DELETE CASCADE;


--
-- TOC entry 5123 (class 2606 OID 18820)
-- Name: provider_services provider_services_provider_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_services
    ADD CONSTRAINT provider_services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES petcare.providers(id) ON DELETE CASCADE;


--
-- TOC entry 5124 (class 2606 OID 18825)
-- Name: provider_services provider_services_service_type_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_services
    ADD CONSTRAINT provider_services_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES petcare.service_types(id) ON DELETE RESTRICT;


--
-- TOC entry 5110 (class 2606 OID 18265)
-- Name: providers providers_user_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.providers
    ADD CONSTRAINT providers_user_id_fkey FOREIGN KEY (user_id) REFERENCES petcare.users(id) ON DELETE CASCADE;


-- Completed on 2026-02-09 19:20:32

--
-- PostgreSQL database dump complete
--

\unrestrict WOrSELRVbsKp5hXjEwWz0WnOqsDOPGLhcuMQtM7diuYsKOrLEKT7jPpbpZXLvgd

