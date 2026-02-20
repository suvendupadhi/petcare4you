 PetCare Services PostgreSQL Database Schema
CREATE SCHEMA IF NOT EXISTS petcare;
SET search_path TO petcare;

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
    pet_type character varying(50) DEFAULT 'Other'::character varying,
    decline_reason text
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
-- TOC entry 5364 (class 0 OID 0)
-- Dependencies: 226
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.appointments_id_seq OWNED BY petcare.appointments.id;


--
-- TOC entry 297 (class 1259 OID 27770)
-- Name: availability; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.availability (
    id integer CONSTRAINT availability_id_not_null1 NOT NULL,
    provider_id integer CONSTRAINT availability_provider_id_not_null1 NOT NULL,
    date date CONSTRAINT availability_date_not_null1 NOT NULL,
    start_time timestamp with time zone CONSTRAINT availability_start_time_not_null1 NOT NULL,
    end_time timestamp with time zone CONSTRAINT availability_end_time_not_null1 NOT NULL,
    is_booked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.availability OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 27769)
-- Name: availability_id_seq1; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.availability_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.availability_id_seq1 OWNER TO postgres;

--
-- TOC entry 5365 (class 0 OID 0)
-- Dependencies: 296
-- Name: availability_id_seq1; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.availability_id_seq1 OWNED BY petcare.availability.id;


--
-- TOC entry 241 (class 1259 OID 18721)
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
-- TOC entry 240 (class 1259 OID 18720)
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
-- TOC entry 5366 (class 0 OID 0)
-- Dependencies: 240
-- Name: breeds_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.breeds_id_seq OWNED BY petcare.breeds.id;


--
-- TOC entry 247 (class 1259 OID 26885)
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
-- TOC entry 246 (class 1259 OID 26884)
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
-- TOC entry 5367 (class 0 OID 0)
-- Dependencies: 246
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.notifications_id_seq OWNED BY petcare.notifications.id;


--
-- TOC entry 229 (class 1259 OID 18321)
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
    stripe_client_secret character varying(200),
    invoice_pdf bytea
);


ALTER TABLE petcare.payments OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 18320)
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
-- TOC entry 5368 (class 0 OID 0)
-- Dependencies: 228
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.payments_id_seq OWNED BY petcare.payments.id;


--
-- TOC entry 239 (class 1259 OID 18709)
-- Name: pet_types; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.pet_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT false
);


ALTER TABLE petcare.pet_types OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 18708)
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
-- TOC entry 5369 (class 0 OID 0)
-- Dependencies: 238
-- Name: pet_types_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.pet_types_id_seq OWNED BY petcare.pet_types.id;


--
-- TOC entry 243 (class 1259 OID 18741)
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
-- TOC entry 242 (class 1259 OID 18740)
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
-- TOC entry 5370 (class 0 OID 0)
-- Dependencies: 242
-- Name: pets_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.pets_id_seq OWNED BY petcare.pets.id;


--
-- TOC entry 245 (class 1259 OID 26856)
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
-- TOC entry 244 (class 1259 OID 26855)
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
-- TOC entry 5371 (class 0 OID 0)
-- Dependencies: 244
-- Name: provider_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.provider_photos_id_seq OWNED BY petcare.provider_photos.id;


--
-- TOC entry 295 (class 1259 OID 27392)
-- Name: provider_service_types; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.provider_service_types (
    id integer NOT NULL,
    provider_id integer NOT NULL,
    service_type_id integer NOT NULL,
    price numeric(10,2) DEFAULT 0.00,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.provider_service_types OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 27391)
-- Name: provider_service_types_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.provider_service_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.provider_service_types_id_seq OWNER TO postgres;

--
-- TOC entry 5372 (class 0 OID 0)
-- Dependencies: 294
-- Name: provider_service_types_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.provider_service_types_id_seq OWNED BY petcare.provider_service_types.id;


--
-- TOC entry 225 (class 1259 OID 18246)
-- Name: providers; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.providers (
    id integer NOT NULL,
    user_id integer NOT NULL,
    company_name character varying(200) NOT NULL,
    description text NOT NULL,
    hourly_rate numeric(10,2) DEFAULT 0.00,
    rating numeric(3,2) DEFAULT 5.00,
    review_count integer DEFAULT 0,
    address character varying(500),
    city character varying(100) NOT NULL,
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
-- TOC entry 5373 (class 0 OID 0)
-- Dependencies: 224
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.providers_id_seq OWNED BY petcare.providers.id;


--
-- TOC entry 251 (class 1259 OID 26934)
-- Name: reviews; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.reviews (
    id integer NOT NULL,
    appointment_id integer NOT NULL,
    owner_id integer NOT NULL,
    provider_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE petcare.reviews OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 26933)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.reviews_id_seq OWNER TO postgres;

--
-- TOC entry 5374 (class 0 OID 0)
-- Dependencies: 250
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.reviews_id_seq OWNED BY petcare.reviews.id;


--
-- TOC entry 249 (class 1259 OID 26908)
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
-- TOC entry 248 (class 1259 OID 26907)
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
-- TOC entry 5375 (class 0 OID 0)
-- Dependencies: 248
-- Name: saved_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.saved_providers_id_seq OWNED BY petcare.saved_providers.id;


--
-- TOC entry 233 (class 1259 OID 18627)
-- Name: service_types; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.service_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon_name character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT false
);


ALTER TABLE petcare.service_types OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 18626)
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
-- TOC entry 5376 (class 0 OID 0)
-- Dependencies: 232
-- Name: service_types_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.service_types_id_seq OWNED BY petcare.service_types.id;


--
-- TOC entry 235 (class 1259 OID 18665)
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
-- TOC entry 234 (class 1259 OID 18664)
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
-- TOC entry 5377 (class 0 OID 0)
-- Dependencies: 234
-- Name: status_master_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.status_master_id_seq OWNED BY petcare.status_master.id;


--
-- TOC entry 235 (class 1259 OID 18665)
-- Name: system_configurations; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.system_configurations (
    id integer NOT NULL,
    config_key character varying(100) NOT NULL,
    config_value text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.system_configurations OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 18666)
-- Name: system_configurations_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.system_configurations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.system_configurations_id_seq OWNER TO postgres;

--
-- TOC entry 5378 (class 0 OID 0)
-- Dependencies: 236
-- Name: system_configurations_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.system_configurations_id_seq OWNED BY petcare.system_configurations.id;


--
-- TOC entry 253 (class 1259 OID 26967)
-- Name: tips; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.tips (
    id integer NOT NULL,
    user_role_id integer,
    service_type_id integer,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.tips OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 26966)
-- Name: tips_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.tips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.tips_id_seq OWNER TO postgres;

--
-- TOC entry 5378 (class 0 OID 0)
-- Dependencies: 252
-- Name: tips_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.tips_id_seq OWNED BY petcare.tips.id;


--
-- TOC entry 250 (class 1259 OID 27500)
-- Name: feedbacks; Type: TABLE; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.feedbacks (
    id integer NOT NULL,
    user_id integer NOT NULL,
    subject character varying(200) NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE petcare.feedbacks OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 27499)
-- Name: feedbacks_id_seq; Type: SEQUENCE; Schema: petcare; Owner: postgres
--

CREATE SEQUENCE petcare.feedbacks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE petcare.feedbacks_id_seq OWNER TO postgres;

--
-- TOC entry 5380 (class 0 OID 0)
-- Dependencies: 249
-- Name: feedbacks_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.feedbacks_id_seq OWNED BY petcare.feedbacks.id;


--
-- TOC entry 237 (class 1259 OID 18689)
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
-- TOC entry 236 (class 1259 OID 18688)
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
-- TOC entry 5379 (class 0 OID 0)
-- Dependencies: 236
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
    password_hash text NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone_number character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    role_id integer NOT NULL,
    address character varying(255),
    profile_image_url character varying(500),
    password_reset_token character varying(100),
    reset_token_expiry timestamp with time zone
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
-- TOC entry 5380 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: petcare; Owner: postgres
--

ALTER SEQUENCE petcare.users_id_seq OWNED BY petcare.users.id;


--
-- TOC entry 5047 (class 2604 OID 18791)
-- Name: appointments id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments ALTER COLUMN id SET DEFAULT nextval('petcare.appointments_id_seq'::regclass);


--
-- TOC entry 5085 (class 2604 OID 27773)
-- Name: availability id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.availability ALTER COLUMN id SET DEFAULT nextval('petcare.availability_id_seq1'::regclass);


--
-- TOC entry 5064 (class 2604 OID 18793)
-- Name: breeds id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.breeds ALTER COLUMN id SET DEFAULT nextval('petcare.breeds_id_seq'::regclass);


--
-- TOC entry 5071 (class 2604 OID 26888)
-- Name: notifications id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.notifications ALTER COLUMN id SET DEFAULT nextval('petcare.notifications_id_seq'::regclass);


--
-- TOC entry 5052 (class 2604 OID 18794)
-- Name: payments id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments ALTER COLUMN id SET DEFAULT nextval('petcare.payments_id_seq'::regclass);


--
-- TOC entry 5061 (class 2604 OID 18795)
-- Name: pet_types id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pet_types ALTER COLUMN id SET DEFAULT nextval('petcare.pet_types_id_seq'::regclass);


--
-- TOC entry 5066 (class 2604 OID 18796)
-- Name: pets id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pets ALTER COLUMN id SET DEFAULT nextval('petcare.pets_id_seq'::regclass);


--
-- TOC entry 5069 (class 2604 OID 26859)
-- Name: provider_photos id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_photos ALTER COLUMN id SET DEFAULT nextval('petcare.provider_photos_id_seq'::regclass);


--
-- TOC entry 5081 (class 2604 OID 27395)
-- Name: provider_service_types id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_service_types ALTER COLUMN id SET DEFAULT nextval('petcare.provider_service_types_id_seq'::regclass);


--
-- TOC entry 5039 (class 2604 OID 18797)
-- Name: providers id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.providers ALTER COLUMN id SET DEFAULT nextval('petcare.providers_id_seq'::regclass);


--
-- TOC entry 5076 (class 2604 OID 26937)
-- Name: reviews id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.reviews ALTER COLUMN id SET DEFAULT nextval('petcare.reviews_id_seq'::regclass);


--
-- TOC entry 5074 (class 2604 OID 26911)
-- Name: saved_providers id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.saved_providers ALTER COLUMN id SET DEFAULT nextval('petcare.saved_providers_id_seq'::regclass);


--
-- TOC entry 5054 (class 2604 OID 18798)
-- Name: service_types id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.service_types ALTER COLUMN id SET DEFAULT nextval('petcare.service_types_id_seq'::regclass);


--
-- TOC entry 5057 (class 2604 OID 18799)
-- Name: status_master id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.status_master ALTER COLUMN id SET DEFAULT nextval('petcare.status_master_id_seq'::regclass);


--
-- TOC entry 5078 (class 2604 OID 26970)
-- Name: tips id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.tips ALTER COLUMN id SET DEFAULT nextval('petcare.tips_id_seq'::regclass);


--
-- TOC entry 5100 (class 2288 OID 0)
-- Name: feedbacks id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.feedbacks ALTER COLUMN id SET DEFAULT nextval('petcare.feedbacks_id_seq'::regclass);


--
-- TOC entry 5059 (class 2604 OID 18800)
-- Name: user_roles id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.user_roles ALTER COLUMN id SET DEFAULT nextval('petcare.user_roles_id_seq'::regclass);


--
-- TOC entry 5035 (class 2604 OID 18801)
-- Name: users id; Type: DEFAULT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.users ALTER COLUMN id SET DEFAULT nextval('petcare.users_id_seq'::regclass);


--
-- TOC entry 5328 (class 0 OID 18271)
-- Dependencies: 227
-- Data for Name: appointments; Type: TABLE DATA; Schema: petcare; Owner: postgres
--



--
-- TOC entry 5356 (class 0 OID 27770)
-- Dependencies: 297
-- Data for Name: availability; Type: TABLE DATA; Schema: petcare; Owner: postgres
--



--
-- TOC entry 5340 (class 0 OID 18721)
-- Dependencies: 241
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
-- TOC entry 5346 (class 0 OID 26885)
-- Dependencies: 247
-- Data for Name: notifications; Type: TABLE DATA; Schema: petcare; Owner: postgres
--



--
-- TOC entry 5330 (class 0 OID 18321)
-- Dependencies: 229
-- Data for Name: payments; Type: TABLE DATA; Schema: petcare; Owner: postgres
--



--
-- TOC entry 5338 (class 0 OID 18709)
-- Dependencies: 239
-- Data for Name: pet_types; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.pet_types VALUES (1, 'Dog', '2026-02-02 17:54:47.047886+05:30', true);
INSERT INTO petcare.pet_types VALUES (2, 'Cat', '2026-02-02 17:54:47.047886+05:30', false);
INSERT INTO petcare.pet_types VALUES (3, 'Bird', '2026-02-02 17:54:47.047886+05:30', false);
INSERT INTO petcare.pet_types VALUES (4, 'Rabbit', '2026-02-02 17:54:47.047886+05:30', false);
INSERT INTO petcare.pet_types VALUES (5, 'Other', '2026-02-02 17:54:47.047886+05:30', false);


--
-- TOC entry 5342 (class 0 OID 18741)
-- Dependencies: 243
-- Data for Name: pets; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.pets VALUES (1, 1, 1, 2, 'Tommy', 5, 30.00, '', '', '2026-02-02 21:38:08.489798+05:30', '2026-02-06 19:09:17.286631+05:30');


--
-- TOC entry 5344 (class 0 OID 26856)
-- Dependencies: 245
-- Data for Name: provider_photos; Type: TABLE DATA; Schema: petcare; Owner: postgres
--



--
-- TOC entry 5354 (class 0 OID 27392)
-- Dependencies: 295
-- Data for Name: provider_service_types; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.provider_service_types VALUES (13, 3, 3, 70.00, NULL, '2026-02-17 11:17:55.633404+05:30', '2026-02-17 11:17:55.633543+05:30');
INSERT INTO petcare.provider_service_types VALUES (14, 3, 11, 70.00, NULL, '2026-02-17 11:17:55.633908+05:30', '2026-02-17 11:17:55.633908+05:30');
INSERT INTO petcare.provider_service_types VALUES (15, 3, 8, 70.00, NULL, '2026-02-17 11:17:55.633909+05:30', '2026-02-17 11:17:55.63391+05:30');


--
-- TOC entry 5326 (class 0 OID 18246)
-- Dependencies: 225
-- Data for Name: providers; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.providers VALUES (2, 3, 'Mike Groomer', 'Professional pet grooming services for all breeds', 40.00, 4.10, 67, '654 Pet Plaza', 'Dallas', 40.05734700, -74.41453200, NULL, true, '2026-01-29 19:22:59.731048+05:30', '2026-01-29 19:22:59.731048+05:30', NULL, false);
INSERT INTO petcare.providers VALUES (1, 2, 'Paws & Claws Grooming', 'Top notch grooming services', 50.00, 4.80, 120, '123 Pet Lane', 'Tampa', 44.96804600, -94.42030700, NULL, true, '2026-01-20 19:53:08.130927+05:30', '2026-01-20 19:53:08.130927+05:30', NULL, false);
INSERT INTO petcare.providers VALUES (3, 5, 'Perfect Veterinary Clinic', 'Full-service veterinary care with 15 years of experience', 70.00, 5.00, 400, '456 Vet Lane', 'Tampa', NULL, NULL, NULL, true, '2026-01-20 19:53:08.13+05:30', '2026-02-17 11:17:55.628919+05:30', NULL, false);


--
-- TOC entry 5350 (class 0 OID 26934)
-- Dependencies: 251
-- Data for Name: reviews; Type: TABLE DATA; Schema: petcare; Owner: postgres
--



--
-- TOC entry 5348 (class 0 OID 26908)
-- Dependencies: 249
-- Data for Name: saved_providers; Type: TABLE DATA; Schema: petcare; Owner: postgres
--



--
-- TOC entry 5332 (class 0 OID 18627)
-- Dependencies: 233
-- Data for Name: service_types; Type: TABLE DATA; Schema: petcare; Owner: postgres
--
INSERT INTO petcare.service_types VALUES (1, 'Pet Grooming', 'Professional grooming services for your pets', 'scissors', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true);

INSERT INTO petcare.service_types VALUES (6, 'Pet Daycare', 'Supervised daytime care and socialization', 'clock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true);
INSERT INTO petcare.service_types VALUES (12, 'Pet Photography', 'Professional photo sessions for your furry friends', 'camera', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true);


--
-- Data for Name: system_configurations; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.system_configurations VALUES (1, 'hide_tips_management', 'false', 'If true, hide tips management for all users', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


--
-- TOC entry 5334 (class 0 OID 18665)
-- Dependencies: 235
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
-- TOC entry 5352 (class 0 OID 26967)
-- Dependencies: 253
-- Data for Name: tips; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.tips VALUES (1, 1, NULL, 'Pet Health Tip', 'Ensure your pet stays hydrated! Fresh water should always be available, especially after exercise.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (2, 1, 1, 'Grooming Tip', 'Regular brushing helps prevent matting and keeps your pets coat healthy and shiny.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (3, 1, 2, 'Vet Visit Tip', 'Keep a folder of your pets medical history and vaccination records for quick reference during vet visits.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (4, 2, NULL, 'Business Tip', 'Respond to booking requests within 2 hours to increase your chance of confirmation by 40%.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (5, 2, NULL, 'Profile Tip', 'Adding high-quality photos of your workplace builds trust with potential pet owners.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (11, 2, NULL, 'Marketing Strategy', 'Share before-and-after photos with owner permission to showcase your work on social media.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (10, 2, NULL, 'Customer Service', 'Send a follow-up message after each booking to gather feedback and improve your service quality.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (9, 1, 2, 'Medical Records', 'Take photos of vaccination certificates and store them digitally for easy access during emergencies.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (8, 1, 1, 'Coat Care Basics', 'Brush your pet at least twice a week to reduce shedding and distribute natural oils throughout their coat.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (7, 1, NULL, 'Nutrition Essentials', 'Feed your pet at consistent times each day to establish a healthy routine and prevent digestive issues.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (13, 1, NULL, 'Exercise Routine', 'Ensure your pet gets at least 30 minutes of physical activity daily to maintain a healthy weight and mental well-being.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (14, 1, 1, 'Dental Care Tip', 'Brush your pet''s teeth regularly using pet-safe toothpaste to prevent plaque buildup and bad breath.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (15, 1, 2, 'Vaccination Reminder', 'Stay up to date with your pet''s vaccination schedule to protect them from common infectious diseases.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (16, 2, NULL, 'Client Retention Tip', 'Offer loyalty discounts to repeat customers to encourage long-term relationships and steady bookings.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (17, 2, NULL, 'Scheduling Tip', 'Use automated reminders to reduce no-shows and keep your daily appointments organized.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (18, 2, 1, 'Advanced Grooming Tip', 'Always use breed-specific grooming techniques to ensure the best results and comfort for the pet.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (19, 2, NULL, 'Hygiene Standard', 'Maintain a clean workspace by disinfecting tables and drying areas after every session.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (20, 2, NULL, 'Online Presence', 'Keep your business profile updated with accurate service details and pricing information.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (21, 1, 1, 'Shedding Control', 'Use de-shedding tools during seasonal coat changes to minimize loose fur around your home.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (22, 1, NULL, 'Hydration Check', 'Monitor your pet''s water intake daily to quickly detect any unusual changes in behavior or health.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (6, 2, 1, 'Pro Groomer Tip', 'Always check for skin irritations or lumps during grooming and inform the owner immediately.', false, '2026-02-12 18:42:54.217953+05:30');
INSERT INTO petcare.tips VALUES (12, 2, 1, 'Safety Protocol', 'Sanitize all grooming tools between clients to prevent cross-contamination and maintain hygiene standards.', false, '2026-02-12 18:42:54.217953+05:30');


--
-- TOC entry 5336 (class 0 OID 18689)
-- Dependencies: 237
-- Data for Name: user_roles; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.user_roles VALUES (1, 'owner', 'Pet Owner', '2026-02-02 17:49:02.650574+05:30');
INSERT INTO petcare.user_roles VALUES (2, 'provider', 'Service Provider', '2026-02-02 17:49:02.650574+05:30');
INSERT INTO petcare.user_roles VALUES (3, 'admin', 'Administrator', '2026-02-02 17:49:02.650574+05:30');
INSERT INTO petcare.user_roles VALUES (4, 'superadmin', 'Super Administrator', '2026-02-17 10:51:27.986359+05:30');


--
-- TOC entry 5324 (class 0 OID 18228)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: petcare; Owner: postgres
--

INSERT INTO petcare.users VALUES (3, 'mike.groomer@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'Mike', 'Wilson', '+14567898913', true, '2026-01-29 07:02:40.675341+05:30', '2026-02-15 13:29:40.91289+05:30', 1, '', NULL);
INSERT INTO petcare.users VALUES (4, 'sarah.owner@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'Sarah', 'Johnson', '+14567898904', true, '2026-01-29 17:59:49.79671+05:30', '2026-01-29 17:59:49.79671+05:30', 1, NULL, NULL);
INSERT INTO petcare.users VALUES (2, 'groomer@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'Jane', 'Groomer', '+14567898902', true, '2026-01-20 19:53:08.130927+05:30', '2026-01-20 19:53:08.130927+05:30', 2, NULL, NULL);
INSERT INTO petcare.users VALUES (5, 'dr.emily@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'Dr Emily', 'Brown', '+14567898905', true, '2026-01-29 17:59:49.79671+05:30', '2026-01-29 17:59:49.79671+05:30', 2, NULL, NULL);
INSERT INTO petcare.users VALUES (1, 'owner@example.com', '$2a$11$1wK0iVqAkXbH6CeLcprc/OH91/vT2vy9lDnc8HR7PgxL1CCXnBLjO', 'John', 'Owner', '+14567898911', true, '2026-01-20 19:53:08.130927+05:30', '2026-01-20 19:53:08.130927+05:30', 1, NULL, NULL);


--
-- TOC entry 5381 (class 0 OID 0)
-- Dependencies: 226
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.appointments_id_seq', 13, true);


--
-- TOC entry 5382 (class 0 OID 0)
-- Dependencies: 296
-- Name: availability_id_seq1; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.availability_id_seq1', 2, true);


--
-- TOC entry 5383 (class 0 OID 0)
-- Dependencies: 240
-- Name: breeds_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.breeds_id_seq', 9, true);


--
-- TOC entry 5384 (class 0 OID 0)
-- Dependencies: 246
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.notifications_id_seq', 31, true);


--
-- TOC entry 5385 (class 0 OID 0)
-- Dependencies: 228
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.payments_id_seq', 1, false);


--
-- TOC entry 5386 (class 0 OID 0)
-- Dependencies: 238
-- Name: pet_types_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.pet_types_id_seq', 5, true);


--
-- TOC entry 5387 (class 0 OID 0)
-- Dependencies: 242
-- Name: pets_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.pets_id_seq', 6, true);


--
-- TOC entry 5388 (class 0 OID 0)
-- Dependencies: 244
-- Name: provider_photos_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.provider_photos_id_seq', 1, false);


--
-- TOC entry 5389 (class 0 OID 0)
-- Dependencies: 294
-- Name: provider_service_types_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.provider_service_types_id_seq', 15, true);


--
-- TOC entry 5390 (class 0 OID 0)
-- Dependencies: 224
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.providers_id_seq', 15, true);


--
-- TOC entry 5391 (class 0 OID 0)
-- Dependencies: 250
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.reviews_id_seq', 1, true);


--
-- TOC entry 5392 (class 0 OID 0)
-- Dependencies: 248
-- Name: saved_providers_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.saved_providers_id_seq', 3, true);


--
-- TOC entry 5393 (class 0 OID 0)
-- Dependencies: 232
-- Name: service_types_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.service_types_id_seq', 12, true);


--
-- TOC entry 5394 (class 0 OID 0)
-- Dependencies: 234
-- Name: status_master_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.status_master_id_seq', 14, true);


--
-- TOC entry 5395 (class 0 OID 0)
-- Dependencies: 252
-- Name: tips_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.tips_id_seq', 22, true);


--
-- TOC entry 5396 (class 0 OID 0)
-- Dependencies: 236
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.user_roles_id_seq', 3, true);


--
-- TOC entry 5397 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: petcare; Owner: postgres
--

SELECT pg_catalog.setval('petcare.users_id_seq', 26, true);


--
-- TOC entry 5101 (class 2606 OID 18290)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 5150 (class 2606 OID 27782)
-- Name: availability availability_pkey1; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.availability
    ADD CONSTRAINT availability_pkey1 PRIMARY KEY (id);


--
-- TOC entry 5122 (class 2606 OID 18734)
-- Name: breeds breeds_pet_type_id_name_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.breeds
    ADD CONSTRAINT breeds_pet_type_id_name_key UNIQUE (pet_type_id, name);


--
-- TOC entry 5124 (class 2606 OID 18732)
-- Name: breeds breeds_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.breeds
    ADD CONSTRAINT breeds_pkey PRIMARY KEY (id);


--
-- TOC entry 5133 (class 2606 OID 26899)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5104 (class 2606 OID 18334)
-- Name: payments payments_appointment_id_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments
    ADD CONSTRAINT payments_appointment_id_key UNIQUE (appointment_id);


--
-- TOC entry 5106 (class 2606 OID 18332)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5118 (class 2606 OID 18719)
-- Name: pet_types pet_types_name_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pet_types
    ADD CONSTRAINT pet_types_name_key UNIQUE (name);


--
-- TOC entry 5120 (class 2606 OID 18717)
-- Name: pet_types pet_types_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pet_types
    ADD CONSTRAINT pet_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5126 (class 2606 OID 18754)
-- Name: pets pets_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pets
    ADD CONSTRAINT pets_pkey PRIMARY KEY (id);


--
-- TOC entry 5129 (class 2606 OID 26867)
-- Name: provider_photos provider_photos_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_photos
    ADD CONSTRAINT provider_photos_pkey PRIMARY KEY (id);


--
-- TOC entry 5146 (class 2606 OID 27405)
-- Name: provider_service_types provider_service_types_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_service_types
    ADD CONSTRAINT provider_service_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5148 (class 2606 OID 27407)
-- Name: provider_service_types provider_service_types_provider_id_service_type_id_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_service_types
    ADD CONSTRAINT provider_service_types_provider_id_service_type_id_key UNIQUE (provider_id, service_type_id);


--
-- TOC entry 5097 (class 2606 OID 18262)
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- TOC entry 5099 (class 2606 OID 18264)
-- Name: providers providers_user_id_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.providers
    ADD CONSTRAINT providers_user_id_key UNIQUE (user_id);


--
-- TOC entry 5140 (class 2606 OID 26950)
-- Name: reviews reviews_appointment_id_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.reviews
    ADD CONSTRAINT reviews_appointment_id_key UNIQUE (appointment_id);


--
-- TOC entry 5142 (class 2606 OID 26948)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5136 (class 2606 OID 26917)
-- Name: saved_providers saved_providers_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.saved_providers
    ADD CONSTRAINT saved_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 5108 (class 2606 OID 18640)
-- Name: service_types service_types_name_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.service_types
    ADD CONSTRAINT service_types_name_key UNIQUE (name);


--
-- TOC entry 5110 (class 2606 OID 18638)
-- Name: service_types service_types_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5112 (class 2606 OID 18674)
-- Name: status_master status_master_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.status_master
    ADD CONSTRAINT status_master_pkey PRIMARY KEY (id);


--
-- TOC entry 5144 (class 2606 OID 26979)
-- Name: tips tips_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.tips
    ADD CONSTRAINT tips_pkey PRIMARY KEY (id);


--
-- TOC entry 5200 (class 2606 OID 27508)
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);


--
-- TOC entry 5138 (class 2606 OID 26919)
-- Name: saved_providers uk_user_provider; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.saved_providers
    ADD CONSTRAINT uk_user_provider UNIQUE (user_id, provider_id);


--
-- TOC entry 5114 (class 2606 OID 18699)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

CREATE TABLE petcare.system_configurations (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE petcare.system_configurations OWNER TO postgres;

CREATE SEQUENCE petcare.system_configurations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE petcare.system_configurations_id_seq OWNER TO postgres;

ALTER TABLE SEQUENCE petcare.system_configurations_id_seq OWNED BY petcare.system_configurations.id;

ALTER TABLE ONLY petcare.system_configurations ALTER COLUMN id SET DEFAULT nextval('petcare.system_configurations_id_seq'::regclass);

ALTER TABLE ONLY petcare.system_configurations
    ADD CONSTRAINT system_configurations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY petcare.system_configurations
    ADD CONSTRAINT system_configurations_key_key UNIQUE (key);

INSERT INTO petcare.system_configurations (id, key, value, description) VALUES (1, 'hide_tips_management', 'false', 'If true, Tips Management will be hidden for all users');


--
-- TOC entry 5116 (class 2606 OID 18701)
-- Name: user_roles user_roles_role_name_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.user_roles
    ADD CONSTRAINT user_roles_role_name_key UNIQUE (role_name);


--
-- TOC entry 5092 (class 2606 OID 18244)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5094 (class 2606 OID 18242)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5102 (class 1259 OID 18347)
-- Name: idx_appointments_owner; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_appointments_owner ON petcare.appointments USING btree (owner_id);


--
-- TOC entry 5130 (class 1259 OID 26906)
-- Name: idx_notifications_is_read; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON petcare.notifications USING btree (is_read);


--
-- TOC entry 5131 (class 1259 OID 26905)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON petcare.notifications USING btree (user_id);


--
-- TOC entry 5127 (class 1259 OID 26873)
-- Name: idx_provider_photos_provider_id; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_provider_photos_provider_id ON petcare.provider_photos USING btree (provider_id);


--
-- TOC entry 5095 (class 1259 OID 18346)
-- Name: idx_providers_city; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_providers_city ON petcare.providers USING btree (city);


--
-- TOC entry 5134 (class 1259 OID 26930)
-- Name: idx_saved_providers_user_id; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_saved_providers_user_id ON petcare.saved_providers USING btree (user_id);


--
-- TOC entry 5089 (class 1259 OID 18345)
-- Name: idx_users_email; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_users_email ON petcare.users USING btree (email);


--
-- TOC entry 5090 (class 1259 OID 27418)
-- Name: idx_users_phone_number; Type: INDEX; Schema: petcare; Owner: postgres
--

CREATE INDEX idx_users_phone_number ON petcare.users USING btree (phone_number);


--
-- TOC entry 5153 (class 2606 OID 18291)
-- Name: appointments appointments_owner_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments
    ADD CONSTRAINT appointments_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES petcare.users(id);


--
-- TOC entry 5154 (class 2606 OID 18296)
-- Name: appointments appointments_provider_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments
    ADD CONSTRAINT appointments_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES petcare.providers(id);


--
-- TOC entry 5175 (class 2606 OID 27783)
-- Name: availability availability_provider_id_fkey1; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.availability
    ADD CONSTRAINT availability_provider_id_fkey1 FOREIGN KEY (provider_id) REFERENCES petcare.providers(id) ON DELETE CASCADE;


--
-- TOC entry 5160 (class 2606 OID 18735)
-- Name: breeds breeds_pet_type_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.breeds
    ADD CONSTRAINT breeds_pet_type_id_fkey FOREIGN KEY (pet_type_id) REFERENCES petcare.pet_types(id) ON DELETE CASCADE;


--
-- TOC entry 5155 (class 2606 OID 26879)
-- Name: appointments fk_appointments_pet; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments
    ADD CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id) REFERENCES petcare.pets(id) ON DELETE SET NULL;


--
-- TOC entry 5156 (class 2606 OID 18676)
-- Name: appointments fk_appointments_status; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.appointments
    ADD CONSTRAINT fk_appointments_status FOREIGN KEY (status) REFERENCES petcare.status_master(id);


--
-- TOC entry 5165 (class 2606 OID 26900)
-- Name: notifications fk_notifications_user; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.notifications
    ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES petcare.users(id) ON DELETE CASCADE;


--
-- TOC entry 5157 (class 2606 OID 18682)
-- Name: payments fk_payments_status; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments
    ADD CONSTRAINT fk_payments_status FOREIGN KEY (status) REFERENCES petcare.status_master(id);


--
-- TOC entry 5166 (class 2606 OID 26925)
-- Name: saved_providers fk_saved_providers_provider; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.saved_providers
    ADD CONSTRAINT fk_saved_providers_provider FOREIGN KEY (provider_id) REFERENCES petcare.providers(id) ON DELETE CASCADE;


--
-- TOC entry 5167 (class 2606 OID 26920)
-- Name: saved_providers fk_saved_providers_user; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.saved_providers
    ADD CONSTRAINT fk_saved_providers_user FOREIGN KEY (user_id) REFERENCES petcare.users(id) ON DELETE CASCADE;


--
-- TOC entry 5151 (class 2606 OID 18703)
-- Name: users fk_users_role; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.users
    ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES petcare.user_roles(id);


--
-- TOC entry 5158 (class 2606 OID 18335)
-- Name: payments payments_appointment_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments
    ADD CONSTRAINT payments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES petcare.appointments(id) ON DELETE CASCADE;


--
-- TOC entry 5159 (class 2606 OID 18340)
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES petcare.users(id);


--
-- TOC entry 5161 (class 2606 OID 18765)
-- Name: pets pets_breed_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pets
    ADD CONSTRAINT pets_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES petcare.breeds(id);


--
-- TOC entry 5162 (class 2606 OID 18755)
-- Name: pets pets_owner_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pets
    ADD CONSTRAINT pets_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES petcare.users(id) ON DELETE CASCADE;


--
-- TOC entry 5163 (class 2606 OID 18760)
-- Name: pets pets_pet_type_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.pets
    ADD CONSTRAINT pets_pet_type_id_fkey FOREIGN KEY (pet_type_id) REFERENCES petcare.pet_types(id);


--
-- TOC entry 5164 (class 2606 OID 26868)
-- Name: provider_photos provider_photos_provider_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_photos
    ADD CONSTRAINT provider_photos_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES petcare.providers(id) ON DELETE CASCADE;


--
-- TOC entry 5173 (class 2606 OID 27408)
-- Name: provider_service_types provider_service_types_provider_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_service_types
    ADD CONSTRAINT provider_service_types_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES petcare.providers(id) ON DELETE CASCADE;


--
-- TOC entry 5174 (class 2606 OID 27413)
-- Name: provider_service_types provider_service_types_service_type_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.provider_service_types
    ADD CONSTRAINT provider_service_types_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES petcare.service_types(id) ON DELETE CASCADE;


--
-- TOC entry 5152 (class 2606 OID 18265)
-- Name: providers providers_user_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.providers
    ADD CONSTRAINT providers_user_id_fkey FOREIGN KEY (user_id) REFERENCES petcare.users(id) ON DELETE CASCADE;


--
-- TOC entry 5168 (class 2606 OID 26951)
-- Name: reviews reviews_appointment_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.reviews
    ADD CONSTRAINT reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES petcare.appointments(id) ON DELETE CASCADE;


--
-- TOC entry 5169 (class 2606 OID 26956)
-- Name: reviews reviews_owner_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.reviews
    ADD CONSTRAINT reviews_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES petcare.users(id);


--
-- TOC entry 5170 (class 2606 OID 26961)
-- Name: reviews reviews_provider_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.reviews
    ADD CONSTRAINT reviews_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES petcare.providers(id) ON DELETE CASCADE;


--
-- TOC entry 5171 (class 2606 OID 26985)
-- Name: tips tips_service_type_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.tips
    ADD CONSTRAINT tips_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES petcare.service_types(id);


--
-- TOC entry 5172 (class 2606 OID 26980)
-- Name: tips tips_user_role_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.tips
    ADD CONSTRAINT tips_user_role_id_fkey FOREIGN KEY (user_role_id) REFERENCES petcare.user_roles(id);


--
-- TOC entry 5250 (class 2606 OID 27513)
-- Name: feedbacks feedbacks_user_id_fkey; Type: FK CONSTRAINT; Schema: petcare; Owner: postgres
--

ALTER TABLE ONLY petcare.feedbacks
    ADD CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES petcare.users(id) ON DELETE CASCADE;


