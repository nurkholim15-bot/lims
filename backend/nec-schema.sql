--
-- PostgreSQL database dump
--

\restrict 23uqhX7FdZh1i1TubpVodXXNRQUbLa31CZmxRCspKo0HKoRV08ZUEED2ifVK204

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mecs, public', false);
CREATE SCHEMA IF NOT EXISTS mecs AUTHORIZATION admin_mecs;
SET ROLE admin_mecs;
SET default_tablespace = 'ts_data_mecs';
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: audit_testing_applications_on_create(); Type: FUNCTION; Schema: mecs; Owner: admin_mecs
--

CREATE OR REPLACE FUNCTION mecs.audit_testing_applications_on_create() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO testing_applications_audit (
        application_id,
        reg_number,
        application_date,
        status,
        created_user,
        ip_address,
        user_agent
    ) VALUES (
        NEW.id,
        NEW.reg_number,
        NEW.created_at,
        NEW.status,
        NEW.created_user,
        current_setting('app.ip_address', true),
        current_setting('app.user_agent', true)
    );
    
    RETURN NEW;
END;
$$;


--
-- Name: audit_testing_applications_status_change(); Type: FUNCTION; Schema: mecs; Owner: admin_mecs
--

CREATE OR REPLACE FUNCTION mecs.audit_testing_applications_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Hanya catat jika status berubah
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO testing_applications_audit (
            application_id,
            reg_number,
            application_date,
            status,
            created_user,
            ip_address,
            user_agent
        ) VALUES (
            NEW.id,
            NEW.reg_number,
            NEW.created_at,
            NEW.status,
            NEW.updated_user,
            current_setting('app.ip_address', true),
            current_setting('app.user_agent', true)
        );
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: create_monthly_notifications_partitions(date, date); Type: FUNCTION; Schema: mecs; Owner: admin_mecs
--

CREATE OR REPLACE FUNCTION mecs.create_monthly_notifications_partitions(start_date date, end_date date) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    curr_date DATE := date_trunc('month', start_date);
    partition_name TEXT;
BEGIN
    WHILE curr_date < end_date LOOP
        -- Format penamaan: notifications_YYYYMM
        partition_name := 'notifications_' || to_char(curr_date, 'YYYYMM');
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF notifications FOR VALUES FROM (%L) TO (%L)', 
            partition_name, curr_date, curr_date + interval '1 month');
        curr_date := curr_date + interval '1 month';
    END LOOP;
END;
$$;


--
-- Name: create_notifications_partitions(date, date); Type: FUNCTION; Schema: mecs; Owner: admin_mecs
--

CREATE OR REPLACE FUNCTION mecs.create_notifications_partitions(start_date date, end_date date) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    curr_date DATE := start_date;
    partition_name TEXT;
BEGIN
    WHILE curr_date < end_date LOOP
        partition_name := 'notifications_' || to_char(curr_date, 'YYYYMMDD');
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF notifications FOR VALUES FROM (%L) TO (%L)', 
            partition_name, curr_date, curr_date + interval '1 day');
        curr_date := curr_date + interval '1 day';
    END LOOP;
END;
$$;

SET default_table_access_method = heap;

--
-- Name: applicant_types; Type: TABLE; Schema: mecs; Owner: admin_mecs
--Nur Kholim

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.applicant_types (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


SET default_tablespace = '';
--
-- Name: provinces; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.provinces (
    province_code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    deleted_user character varying(30),
    PRIMARY KEY (province_code)
);


--
-- Name: cities; Type: TABLE; Schema: mecs; Owner: admin_mecs
-- moving

CREATE TABLE IF NOT EXISTS mecs.cities (
    city_code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    province_code character varying(5),
    gmt_offset integer DEFAULT 7,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    deleted_user character varying(30),
    PRIMARY KEY (city_code)
);


--
-- Name: master_asset_statuses; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.master_asset_statuses (
    asset_status_code character varying(10) NOT NULL,
    asset_status_name character varying(60) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    PRIMARY KEY (asset_status_code)
);


--
-- Name: brands; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.brands (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


--
-- Name: global_parameters; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.global_parameters (
    id bigint NOT NULL,
    param_key character varying(100) NOT NULL,
    param_value character varying(100),
    description character varying(225),
    PRIMARY KEY (id)
);


--
-- Name: global_parameters_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.global_parameters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: global_parameters_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.global_parameters_id_seq OWNED BY mecs.global_parameters.id;


--
-- Name: locations; Type: TABLE; Schema: mecs; Owner: admin_mecs
--moving

CREATE TABLE IF NOT EXISTS mecs.locations (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    city_code character varying(5),
    test_type_code character varying(5),
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


--
-- Name: master_testers; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.master_testers (
    tester_id character(5) NOT NULL,
    name character varying(60) NOT NULL,
    "position" character varying(20),
    methodology_code character varying(5),
    created_at timestamp with time zone,
    created_user character varying(30),
    PRIMARY KEY (tester_id)
);


--
-- Name: material_categories; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.material_categories (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


--
-- Name: menus; Type: TABLE; Schema: mecs; Owner: admin_mecs
--moving

CREATE TABLE IF NOT EXISTS mecs.menus (
    id bigint NOT NULL,
    parent_id bigint,
    title character varying(50),
    icon character varying(40),
    path character varying(60),
    "order" bigint,
    is_password boolean DEFAULT false,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (id)
);


--
-- Name: menus_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.menus_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: menus_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.menus_id_seq OWNED BY mecs.menus.id;


--
-- Name: methodologies; Type: TABLE; Schema: mecs; Owner: admin_mecs
--moving

CREATE TABLE IF NOT EXISTS mecs.methodologies (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    test_type_code character varying(5),
    scoring_level_code character(5) DEFAULT '00000'::bpchar,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


--
-- Name: models; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.models (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    brand_code character varying(5),
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


--
-- Name: notifications; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications (
    id integer CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
,

    CONSTRAINT notifications_pkey1 PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';


--
-- Name: notifications_id_seq1; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.notifications_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq1; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.notifications_id_seq1 OWNED BY mecs.notifications.id;


SET default_tablespace = '';
--
-- Name: notifications_202601; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202601 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202602; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202602 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202603; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202603 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202604; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202604 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202605; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202605 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202606; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202606 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202607; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202607 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202608; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202608 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202609; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202609 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202610; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202610 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202611; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202611 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202612; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202612 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202701; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202701 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202702; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202702 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202703; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202703 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202704; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202704 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202705; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202705 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202706; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202706 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202707; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202707 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202708; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202708 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202709; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202709 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202710; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202710 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202711; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202711 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: notifications_202712; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.notifications_202712 (
    id integer DEFAULT nextval('mecs.notifications_id_seq1'::regclass) CONSTRAINT notifications_id_not_null1 NOT NULL,
    user_id bigint,
    role_name text,
    title character varying(60),
    message character varying(225),
    is_read boolean DEFAULT false,
    link character varying(40),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT notifications_created_at_not_null NOT NULL,
    PRIMARY KEY (id, created_at)
);


--
-- Name: origins; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.origins (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


--
-- Name: partner_categories; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.partner_categories (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


--
-- Name: partner_types; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.partner_types (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


--
-- Name: partners; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.partners (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    type_code character varying(5),
    category_code character varying(5),
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


--
-- Name: registrations_counters; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.registrations_counters (
    id bigint NOT NULL,
    year bigint NOT NULL,
    current_val bigint NOT NULL,
    PRIMARY KEY (id)
);


--
-- Name: registrations_counters_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.registrations_counters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registrations_counters_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.registrations_counters_id_seq OWNED BY mecs.registrations_counters.id;


--
-- Name: role_menus; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.role_menus (
    role_id bigint NOT NULL,
    menu_id bigint NOT NULL,
    PRIMARY KEY (role_id, menu_id)
);


--
-- Name: roles; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.roles (
    id bigint NOT NULL,
    name character varying(40) NOT NULL,
    description character varying(60),
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (id)
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.roles_id_seq OWNED BY mecs.roles.id;


--
-- Name: scoring_aspects; Type: TABLE; Schema: mecs; Owner: admin_mecs
--moving

CREATE TABLE IF NOT EXISTS mecs.scoring_aspects (
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    methodology_code character varying(5),
    weight numeric,
    threshold numeric,
    description character varying(255),
    is_active boolean DEFAULT true,
    id bigint NOT NULL,
    test_type_code character varying(5),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp without time zone,
    PRIMARY KEY (code)
);


--
-- Name: scoring_aspects_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.scoring_aspects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scoring_aspects_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.scoring_aspects_id_seq OWNED BY mecs.scoring_aspects.id;


--
-- Name: scoring_levels; Type: TABLE; Schema: mecs; Owner: admin_mecs
--moving

CREATE TABLE IF NOT EXISTS mecs.scoring_levels (
    id bigint NOT NULL,
    min_score numeric NOT NULL,
    max_score numeric NOT NULL,
    label character varying(100) NOT NULL,
    methodologies_code character(5) DEFAULT '00000'::bpchar,
    level_group_code character(5) DEFAULT '00000'::bpchar,
    description character varying(255),
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    PRIMARY KEY (id)
);


--
-- Name: scoring_levels_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.scoring_levels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scoring_levels_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.scoring_levels_id_seq OWNED BY mecs.scoring_levels.id;


--
-- Name: scoring_sub_aspect_items; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.scoring_sub_aspect_items (
    id bigint NOT NULL,
    sub_aspect_code character varying(5) NOT NULL,
    name character varying(100) NOT NULL,
    score numeric,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    PRIMARY KEY (id)
);


--
-- Name: scoring_sub_aspect_items_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.scoring_sub_aspect_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scoring_sub_aspect_items_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.scoring_sub_aspect_items_id_seq OWNED BY mecs.scoring_sub_aspect_items.id;


--
-- Name: scoring_sub_aspects; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.scoring_sub_aspects (
    code character varying(5) NOT NULL,
    name character varying(100) NOT NULL,
    aspect_code character varying(50) NOT NULL,
    weight numeric,
    description character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp without time zone,
    is_simulator boolean DEFAULT false,
    id bigint NOT NULL,
    PRIMARY KEY (code)
);


--
-- Name: scoring_sub_aspects_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.scoring_sub_aspects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scoring_sub_aspects_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.scoring_sub_aspects_id_seq OWNED BY mecs.scoring_sub_aspects.id;


--
-- Name: simulator_data_logs; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.simulator_data_logs (
    id bigint NOT NULL,
    score numeric,
    machine_id character varying(60),
    notes character varying(200),
    is_used boolean DEFAULT false,
    used_by_application_id bigint,
    created_at timestamp with time zone,
    sub_aspect_code character varying(50),
    PRIMARY KEY (id)
);


--
-- Name: simulator_data_logs_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.simulator_data_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: simulator_data_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.simulator_data_logs_id_seq OWNED BY mecs.simulator_data_logs.id;


--
-- Name: status_applications; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.status_applications (
    status_code character(15) NOT NULL,
    "desc" character varying(60),
    created_user character varying(30),
    created_at timestamp with time zone,
    PRIMARY KEY (status_code)
);


--
-- Name: test_standards; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.test_standards (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    description character varying(100),
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


--
-- Name: test_types; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.test_types (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);



--
-- Name: tester_applications; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.tester_applications (
    id bigserial NOT NULL,
    application_id bigint,
    methodology_code character varying(5),
    tester_id character(5),
    "position" character varying(50),
    team_type character varying(10),
    role character varying(20),
    aspect_code character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_user character varying(30),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';


--
-- Name: tester_applications_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.tester_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tester_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.tester_applications_id_seq OWNED BY mecs.tester_applications.id;


--
-- Name: testing_applications; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_applications (
    id bigint CONSTRAINT testing_applications_id_not_null2 NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_reg_number_not_null1 NOT NULL,
    status character varying(15),
    partner_code character varying(5),
    applicant_category_code character varying(5),
    pic_name character varying(60),
    pic_email character varying(40),
    pic_phone character varying(20),
    request_letter_path character varying(100),
    test_standard_code character varying(5),
    is_docs_complete boolean,
    verification_notes character varying(1000),
    test_type_code character varying(5),
    test_types character varying(255),
    lab_scheduled_date timestamp with time zone,
    lab_location_code character varying(5),
    field_scheduled_date timestamp with time zone,
    field_location_code character varying(5),
    approval_notes character varying(1000),
    test_plan_doc_path character varying(225),
    methodology_code character varying(5),
    lab_methodology_code character varying(5),
    field_methodology_code character varying(5),
    final_score numeric,
    analysis_notes character varying(1000),
    final_status character varying(60),
    report_doc_path character varying(225),
    certificate_path character varying(225),
    certificate_num character varying(100),
    expiry_date timestamp with time zone,
    camunda_process_id character varying(100),
    tester_id character(5),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    aspects_passed boolean,
    aspect_failures jsonb,
    equipment_id integer
,

    CONSTRAINT testing_applications_pkey1 PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

DROP TRIGGER IF EXISTS trg_audit_testing_applications_on_create ON mecs.testing_applications;
CREATE TRIGGER trg_audit_testing_applications_on_create
    AFTER INSERT ON mecs.testing_applications
    FOR EACH ROW
    EXECUTE FUNCTION mecs.audit_testing_applications_on_create();

DROP TRIGGER IF EXISTS trg_audit_testing_applications_status_change ON mecs.testing_applications;
CREATE TRIGGER trg_audit_testing_applications_status_change
    AFTER UPDATE ON mecs.testing_applications
    FOR EACH ROW
    EXECUTE FUNCTION mecs.audit_testing_applications_status_change();


--
-- Name: testing_applications_id_seq2; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.testing_applications_id_seq2
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: testing_applications_id_seq2; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.testing_applications_id_seq2 OWNED BY mecs.testing_applications.id;


SET default_tablespace = '';
--
-- Name: testing_applications_202603; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_202603 (
    id bigint DEFAULT nextval('mecs.testing_applications_id_seq2'::regclass) CONSTRAINT testing_applications_id_not_null2 NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_reg_number_not_null1 NOT NULL,
    status character varying(15),
    partner_code character varying(5),
    applicant_category_code character varying(5),
    pic_name character varying(60),
    pic_email character varying(40),
    pic_phone character varying(20),
    request_letter_path character varying(100),
    test_standard_code character varying(5),
    is_docs_complete boolean,
    verification_notes character varying(1000),
    test_type_code character varying(5),
    test_types character varying(255),
    lab_scheduled_date timestamp with time zone,
    lab_location_code character varying(5),
    field_scheduled_date timestamp with time zone,
    field_location_code character varying(5),
    approval_notes character varying(1000),
    test_plan_doc_path character varying(225),
    methodology_code character varying(5),
    lab_methodology_code character varying(5),
    field_methodology_code character varying(5),
    final_score numeric,
    analysis_notes character varying(1000),
    final_status character varying(60),
    report_doc_path character varying(225),
    certificate_path character varying(225),
    certificate_num character varying(100),
    expiry_date timestamp with time zone,
    camunda_process_id character varying(100),
    tester_id character(5),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    aspects_passed boolean,
    aspect_failures jsonb,
    equipment_id integer,
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_202604; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_202604 (
    id bigint DEFAULT nextval('mecs.testing_applications_id_seq2'::regclass) CONSTRAINT testing_applications_id_not_null2 NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_reg_number_not_null1 NOT NULL,
    status character varying(15),
    partner_code character varying(5),
    applicant_category_code character varying(5),
    pic_name character varying(60),
    pic_email character varying(40),
    pic_phone character varying(20),
    request_letter_path character varying(100),
    test_standard_code character varying(5),
    is_docs_complete boolean,
    verification_notes character varying(1000),
    test_type_code character varying(5),
    test_types character varying(255),
    lab_scheduled_date timestamp with time zone,
    lab_location_code character varying(5),
    field_scheduled_date timestamp with time zone,
    field_location_code character varying(5),
    approval_notes character varying(1000),
    test_plan_doc_path character varying(225),
    methodology_code character varying(5),
    lab_methodology_code character varying(5),
    field_methodology_code character varying(5),
    final_score numeric,
    analysis_notes character varying(1000),
    final_status character varying(60),
    report_doc_path character varying(225),
    certificate_path character varying(225),
    certificate_num character varying(100),
    expiry_date timestamp with time zone,
    camunda_process_id character varying(100),
    tester_id character(5),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    aspects_passed boolean,
    aspect_failures jsonb,
    equipment_id integer,
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_202605; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_202605 (
    id bigint DEFAULT nextval('mecs.testing_applications_id_seq2'::regclass) CONSTRAINT testing_applications_id_not_null2 NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_reg_number_not_null1 NOT NULL,
    status character varying(15),
    partner_code character varying(5),
    applicant_category_code character varying(5),
    pic_name character varying(60),
    pic_email character varying(40),
    pic_phone character varying(20),
    request_letter_path character varying(100),
    test_standard_code character varying(5),
    is_docs_complete boolean,
    verification_notes character varying(1000),
    test_type_code character varying(5),
    test_types character varying(255),
    lab_scheduled_date timestamp with time zone,
    lab_location_code character varying(5),
    field_scheduled_date timestamp with time zone,
    field_location_code character varying(5),
    approval_notes character varying(1000),
    test_plan_doc_path character varying(225),
    methodology_code character varying(5),
    lab_methodology_code character varying(5),
    field_methodology_code character varying(5),
    final_score numeric,
    analysis_notes character varying(1000),
    final_status character varying(60),
    report_doc_path character varying(225),
    certificate_path character varying(225),
    certificate_num character varying(100),
    expiry_date timestamp with time zone,
    camunda_process_id character varying(100),
    tester_id character(5),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    aspects_passed boolean,
    aspect_failures jsonb,
    equipment_id integer,
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit (
    id bigint NOT NULL,
    application_id bigint NOT NULL,
    reg_number character varying(30) NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) NOT NULL,
    created_user character varying(30) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255)
,

    CONSTRAINT testing_applications_audit_pkey PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';


--
-- Name: testing_applications_audit_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.testing_applications_audit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: testing_applications_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.testing_applications_audit_id_seq OWNED BY mecs.testing_applications_audit.id;


SET default_tablespace = '';
--
-- Name: testing_applications_audit_202401; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202401 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202402; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202402 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202403; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202403 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202404; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202404 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202405; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202405 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202406; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202406 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202407; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202407 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202408; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202408 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202409; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202409 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202410; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202410 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202411; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202411 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202412; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202412 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202501; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202501 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202502; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202502 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202503; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202503 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202504; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202504 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202505; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202505 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202506; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202506 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202507; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202507 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202508; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202508 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202509; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202509 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202510; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202510 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202511; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202511 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202512; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202512 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202601; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202601 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202602; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202602 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202603; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202603 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202604; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202604 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202605; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202605 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202606; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202606 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202607; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202607 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202608; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202608 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202609; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202609 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202610; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202610 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202611; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202611 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_applications_audit_202612; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_applications_audit_202612 (
    id bigint DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass) CONSTRAINT testing_applications_audit_id_not_null NOT NULL,
    application_id bigint CONSTRAINT testing_applications_audit_application_id_not_null NOT NULL,
    reg_number character varying(30) CONSTRAINT testing_applications_audit_reg_number_not_null NOT NULL,
    application_date timestamp without time zone,
    status character varying(15) CONSTRAINT testing_applications_audit_status_not_null NOT NULL,
    created_user character varying(30) CONSTRAINT testing_applications_audit_created_user_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_applications_audit_created_at_not_null NOT NULL,
    ip_address character varying(45),
    user_agent character varying(255),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_equipments; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_equipments (
    id bigint NOT NULL,
    equipment_name character varying(100),
    category_code character varying(5),
    brand_code character varying(5),
    model_code character varying(5),
    variant_code character varying(5),
    origin_code character varying(5),
    batch_number character varying(60),
    technical_spec character varying(100),
    factory_spec_path character varying(100),
    quality_doc_path character varying(100),
    serial_no character varying(50),
    asset_status_code character varying(10),
    asset_location_code character varying(5),
    application_id bigint,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    CONSTRAINT testing_equipments_pkey PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';


--
-- Name: testing_equipments_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.testing_equipments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: testing_equipments_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.testing_equipments_id_seq OWNED BY mecs.testing_equipments.id;


--
-- Name: testing_plans; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_plans (
    id integer CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_user character varying(30)
,

    CONSTRAINT testing_plans_pkey1 PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';


--
-- Name: testing_plans_id_seq1; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.testing_plans_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: testing_plans_id_seq1; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.testing_plans_id_seq1 OWNED BY mecs.testing_plans.id;


--
-- Name: testing_plans_202601; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202601 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_plans_202602; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202602 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_plans_202603; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202603 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_plans_202604; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202604 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_plans_202605; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202605 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_plans_202606; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202606 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_plans_202607; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202607 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_plans_202608; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202608 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_plans_202609; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202609 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_plans_202610; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202610 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_plans_202611; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202611 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_plans_202612; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_plans_202612 (
    id integer DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass) CONSTRAINT testing_plans_id_not_null1 NOT NULL,
    application_id bigint CONSTRAINT testing_plans_application_id_not_null1 NOT NULL,
    aspect_code character varying(50),
    location_code character varying(5),
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT testing_plans_created_at_not_null NOT NULL,
    updated_user character varying(30),
    PRIMARY KEY (id, created_at)
);


--
-- Name: testing_results; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.testing_results (
    id bigint NOT NULL,
    application_id bigint,
    score numeric,
    notes character varying(500),
    created_at timestamp with time zone,
    photo_path character varying(255),
    aspect_score numeric,
    final_score numeric,
    sub_aspect_code character varying(5),
    aspect_code character varying(50),
    PRIMARY KEY (id)
);


--
-- Name: testing_results_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.testing_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: testing_results_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.testing_results_id_seq OWNED BY mecs.testing_results.id;


--
-- Name: testing_results_arc; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc (
    id bigint,
    application_id bigint,
    score numeric,
    notes character varying(500),
    created_at timestamp with time zone,
    photo_path character varying(255),
    aspect_score numeric,
    final_score numeric,
    sub_aspect_code character varying(5),
    aspect_code character varying(50),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';


--
-- Name: travel_requests; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.travel_requests (
    id serial NOT NULL,
    user_id integer,
    reg_number character varying(30),
    location_code character varying(5),
    purpose character varying(255),
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    estimated_budget numeric,
    status character varying(20) DEFAULT 'DRAFT'::character varying,
    notes character varying(500),
    created_user character varying(30),
    updated_user character varying(30),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    CONSTRAINT travel_requests_pkey PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

--
-- Name: reimbursements; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.reimbursements (
    id serial NOT NULL,
    travel_request_id integer,
    user_id integer,
    title character varying(100),
    date timestamp without time zone,
    amount numeric,
    receipt_path character varying(255),
    status character varying(20) DEFAULT 'PENDING'::character varying,
    notes character varying(500),
    created_user character varying(30),
    updated_user character varying(30),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    CONSTRAINT reimbursements_pkey PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

--
-- Name: testing_tools; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_tools (
    code character varying(10) NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(10) NOT NULL,
    min_stock integer DEFAULT 0,
    initial_stock integer DEFAULT 0,
    current_stock integer DEFAULT 0,
    location_code character varying(5),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);

--
-- Name: testing_tool_availabilities; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities (
    id bigserial NOT NULL,
    tool_code character varying(10) NOT NULL,
    date date NOT NULL,
    hour integer NOT NULL,
    status character varying(20) DEFAULT 'AVAILABLE'::character varying,
    booked_by integer,
    quantity integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

--
-- Name: testing_tool_reservations; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations (
    id bigserial NOT NULL,
    tool_code character varying(10) NOT NULL,
    user_id integer NOT NULL,
    application_id bigint,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    quantity integer DEFAULT 1,
    status character varying(20) DEFAULT 'BOOKED'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

--
-- Name: testing_aspect_scores; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores (
    id bigserial NOT NULL,
    application_id bigint,
    aspect_code character varying(50),
    score numeric,
    notes character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_user character varying(30),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';



--
-- Name: testing_tool_transactions; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions (
    id serial NOT NULL,
    tool_code character varying(10) NOT NULL,
    type character varying(10),
    quantity integer,
    reference_type character varying(20),
    reference_id integer,
    notes character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT testing_tool_transactions_pkey PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);


--
-- Name: testing_tool_transactions_arc; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc (
    id integer,
    tool_code character varying(10) NOT NULL,
    type character varying(10),
    quantity integer,
    reference_type character varying(20),
    reference_id integer,
    notes character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

--
-- Name: testing_tool_availabilities_arc; Type: TABLE; Schema: mecs; Owner: admin_mecs
--
SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc (
    id bigint,
    tool_code character varying(10) NOT NULL,
    date date NOT NULL,
    hour integer NOT NULL,
    status character varying(20),
    booked_by integer,
    quantity integer,
    created_at timestamp without time zone,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

--
-- Name: asset_activity_logs; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs (
    id serial NOT NULL,
    asset_id bigint,
    activity_type character varying(10),
    from_location character varying(5),
    to_location character varying(5),
    from_status character varying(5),
    to_status character varying(5),
    notes character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_user character varying(30),
    CONSTRAINT asset_activity_logs_pkey PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

--
-- Name: user_sessions; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

-- ============================================================
-- ARCHIVE TABLES (_arc)
-- ============================================================

--
-- Name: asset_activity_logs_arc; Type: TABLE; Schema: mecs; Owner: admin_mecs
--
SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_arc (
    id integer,
    asset_id bigint,
    activity_type character varying(10),
    from_location character varying(5),
    to_location character varying(5),
    from_status character varying(5),
    to_status character varying(5),
    notes character varying(255),
    created_at timestamp without time zone,
    created_user character varying(30),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

--
-- Name: reimbursements_arc; Type: TABLE; Schema: mecs; Owner: admin_mecs
--
SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.reimbursements_arc (
    id integer,
    travel_request_id integer,
    user_id integer,
    title character varying(100),
    date timestamp without time zone,
    amount numeric,
    receipt_path character varying(255),
    status character varying(20),
    notes character varying(500),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp without time zone,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

--
-- Name: testing_applications_arc; Type: TABLE; Schema: mecs; Owner: admin_mecs
--
SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_applications_arc (
    id bigint,
    reg_number character varying(30),
    status character varying(15),
    partner_code character varying(5),
    applicant_category_code character varying(5),
    pic_name character varying(60),
    pic_email character varying(40),
    pic_phone character varying(20),
    request_letter_path character varying(100),
    test_standard_code character varying(5),
    is_docs_complete boolean,
    verification_notes character varying(225),
    equipment_no integer,
    equipment_total integer,
    test_type_code character varying(5),
    approval_notes character varying(225),
    test_plan_doc_path character varying(225),
    methodology_code character varying(5),
    final_score double precision,
    analysis_notes character varying(225),
    final_status character varying(60),
    report_doc_path character varying(225),
    certificate_path character varying(225),
    certificate_num character varying(100),
    expiry_date timestamp without time zone,
    camunda_process_id character varying(100),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp without time zone,
    aspects_passed boolean,
    aspect_failures jsonb,
    equipment_id bigint,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

--
-- Name: testing_equipments_arc; Type: TABLE; Schema: mecs; Owner: admin_mecs
--
SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_arc (
    id bigint,
    equipment_name character varying(100),
    category_code character varying(5),
    brand_code character varying(5),
    model_code character varying(5),
    variant_code character varying(5),
    origin_code character varying(5),
    batch_number character varying(60),
    technical_spec character varying(100),
    factory_spec_path character varying(100),
    quality_doc_path character varying(100),
    serial_no character varying(50),
    asset_status_code character varying(10),
    asset_location_code character varying(5),
    application_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp without time zone,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

--
-- Name: notifications_arc; Type: TABLE; Schema: mecs; Owner: admin_mecs
--
SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.notifications_arc (
    id integer,
    user_id integer,
    role_name character varying(255),
    title character varying(255),
    message text,
    is_read boolean DEFAULT false,
    link character varying(255),
    created_at timestamp without time zone,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';

-- Create Indexes for notifications_arc
CREATE INDEX IF NOT EXISTS idx_notifications_arc_user_id ON mecs.notifications_arc (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_arc_role_name ON mecs.notifications_arc (role_name);

--
-- Name: travel_requests_arc; Type: TABLE; Schema: mecs; Owner: admin_mecs
--
SET default_tablespace = '';
CREATE TABLE IF NOT EXISTS mecs.travel_requests_arc (
    id integer,
    user_id integer,
    reg_number character varying(30),
    location_code character varying(5),
    purpose character varying(255),
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    estimated_budget double precision,
    status character varying(20),
    notes character varying(500),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp without time zone,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
SET default_tablespace = 'ts_data_mecs';
CREATE TABLE IF NOT EXISTS mecs.user_sessions (
    id bigint NOT NULL,
    user_id bigint,
    token character varying(225) NOT NULL,
    expires_at timestamp with time zone,
    ip_address character varying(30),
    created_at timestamp with time zone,
    PRIMARY KEY (id)
);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.user_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.user_sessions_id_seq OWNED BY mecs.user_sessions.id;


--
-- Name: users; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.users (
    id bigint NOT NULL,
    username character varying(30) NOT NULL,
    password character varying(225) NOT NULL,
    last_pwd_change timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    role_id bigint,
    created_user character varying(30),
    updated_user character varying(30),
    email character varying(30),
    phone character varying(30),
    PRIMARY KEY (id)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: mecs; Owner: admin_mecs
--

CREATE SEQUENCE IF NOT EXISTS mecs.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: mecs; Owner: admin_mecs
--

ALTER SEQUENCE mecs.users_id_seq OWNED BY mecs.users.id;


--
-- Name: variants; Type: TABLE; Schema: mecs; Owner: admin_mecs
--

CREATE TABLE IF NOT EXISTS mecs.variants (
    code character varying(5) NOT NULL,
    name character varying(60) NOT NULL,
    model_code character varying(5),
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    PRIMARY KEY (code)
);


--
-- Name: notifications_202601; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202601 FOR VALUES FROM ('2026-01-01 00:00:00') TO ('2026-02-01 00:00:00');


--
-- Name: notifications_202602; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202602 FOR VALUES FROM ('2026-02-01 00:00:00') TO ('2026-03-01 00:00:00');


--
-- Name: notifications_202603; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202603 FOR VALUES FROM ('2026-03-01 00:00:00') TO ('2026-04-01 00:00:00');


--
-- Name: notifications_202604; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202604 FOR VALUES FROM ('2026-04-01 00:00:00') TO ('2026-05-01 00:00:00');


--
-- Name: notifications_202605; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202605 FOR VALUES FROM ('2026-05-01 00:00:00') TO ('2026-06-01 00:00:00');


--
-- Name: notifications_202606; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202606 FOR VALUES FROM ('2026-06-01 00:00:00') TO ('2026-07-01 00:00:00');


--
-- Name: notifications_202607; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202607 FOR VALUES FROM ('2026-07-01 00:00:00') TO ('2026-08-01 00:00:00');


--
-- Name: notifications_202608; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202608 FOR VALUES FROM ('2026-08-01 00:00:00') TO ('2026-09-01 00:00:00');


--
-- Name: notifications_202609; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202609 FOR VALUES FROM ('2026-09-01 00:00:00') TO ('2026-10-01 00:00:00');


--
-- Name: notifications_202610; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202610 FOR VALUES FROM ('2026-10-01 00:00:00') TO ('2026-11-01 00:00:00');


--
-- Name: notifications_202611; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202611 FOR VALUES FROM ('2026-11-01 00:00:00') TO ('2026-12-01 00:00:00');


--
-- Name: notifications_202612; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202612 FOR VALUES FROM ('2026-12-01 00:00:00') TO ('2027-01-01 00:00:00');


--
-- Name: notifications_202701; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202701 FOR VALUES FROM ('2027-01-01 00:00:00') TO ('2027-02-01 00:00:00');


--
-- Name: notifications_202702; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202702 FOR VALUES FROM ('2027-02-01 00:00:00') TO ('2027-03-01 00:00:00');


--
-- Name: notifications_202703; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202703 FOR VALUES FROM ('2027-03-01 00:00:00') TO ('2027-04-01 00:00:00');


--
-- Name: notifications_202704; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202704 FOR VALUES FROM ('2027-04-01 00:00:00') TO ('2027-05-01 00:00:00');


--
-- Name: notifications_202705; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202705 FOR VALUES FROM ('2027-05-01 00:00:00') TO ('2027-06-01 00:00:00');


--
-- Name: notifications_202706; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202706 FOR VALUES FROM ('2027-06-01 00:00:00') TO ('2027-07-01 00:00:00');


--
-- Name: notifications_202707; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202707 FOR VALUES FROM ('2027-07-01 00:00:00') TO ('2027-08-01 00:00:00');


--
-- Name: notifications_202708; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202708 FOR VALUES FROM ('2027-08-01 00:00:00') TO ('2027-09-01 00:00:00');


--
-- Name: notifications_202709; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202709 FOR VALUES FROM ('2027-09-01 00:00:00') TO ('2027-10-01 00:00:00');


--
-- Name: notifications_202710; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202710 FOR VALUES FROM ('2027-10-01 00:00:00') TO ('2027-11-01 00:00:00');


--
-- Name: notifications_202711; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202711 FOR VALUES FROM ('2027-11-01 00:00:00') TO ('2027-12-01 00:00:00');


--
-- Name: notifications_202712; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ATTACH PARTITION mecs.notifications_202712 FOR VALUES FROM ('2027-12-01 00:00:00') TO ('2028-01-01 00:00:00');


--
-- Name: testing_applications_202603; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications ATTACH PARTITION mecs.testing_applications_202603 FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');


--
-- Name: testing_applications_202604; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications ATTACH PARTITION mecs.testing_applications_202604 FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');


--
-- Name: testing_applications_202605; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications ATTACH PARTITION mecs.testing_applications_202605 FOR VALUES FROM ('2026-05-05 00:00:00+07') TO ('2026-06-06 00:00:00+07');


--
-- Name: testing_applications_audit_202401; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202401 FOR VALUES FROM ('2024-01-01 00:00:00') TO ('2024-02-01 00:00:00');


--
-- Name: testing_applications_audit_202402; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202402 FOR VALUES FROM ('2024-02-01 00:00:00') TO ('2024-03-01 00:00:00');


--
-- Name: testing_applications_audit_202403; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202403 FOR VALUES FROM ('2024-03-01 00:00:00') TO ('2024-04-01 00:00:00');


--
-- Name: testing_applications_audit_202404; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202404 FOR VALUES FROM ('2024-04-01 00:00:00') TO ('2024-05-01 00:00:00');


--
-- Name: testing_applications_audit_202405; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202405 FOR VALUES FROM ('2024-05-01 00:00:00') TO ('2024-06-01 00:00:00');


--
-- Name: testing_applications_audit_202406; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202406 FOR VALUES FROM ('2024-06-01 00:00:00') TO ('2024-07-01 00:00:00');


--
-- Name: testing_applications_audit_202407; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202407 FOR VALUES FROM ('2024-07-01 00:00:00') TO ('2024-08-01 00:00:00');


--
-- Name: testing_applications_audit_202408; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202408 FOR VALUES FROM ('2024-08-01 00:00:00') TO ('2024-09-01 00:00:00');


--
-- Name: testing_applications_audit_202409; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202409 FOR VALUES FROM ('2024-09-01 00:00:00') TO ('2024-10-01 00:00:00');


--
-- Name: testing_applications_audit_202410; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202410 FOR VALUES FROM ('2024-10-01 00:00:00') TO ('2024-11-01 00:00:00');


--
-- Name: testing_applications_audit_202411; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202411 FOR VALUES FROM ('2024-11-01 00:00:00') TO ('2024-12-01 00:00:00');


--
-- Name: testing_applications_audit_202412; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202412 FOR VALUES FROM ('2024-12-01 00:00:00') TO ('2025-01-01 00:00:00');


--
-- Name: testing_applications_audit_202501; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202501 FOR VALUES FROM ('2025-01-01 00:00:00') TO ('2025-02-01 00:00:00');


--
-- Name: testing_applications_audit_202502; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202502 FOR VALUES FROM ('2025-02-01 00:00:00') TO ('2025-03-01 00:00:00');


--
-- Name: testing_applications_audit_202503; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202503 FOR VALUES FROM ('2025-03-01 00:00:00') TO ('2025-04-01 00:00:00');


--
-- Name: testing_applications_audit_202504; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202504 FOR VALUES FROM ('2025-04-01 00:00:00') TO ('2025-05-01 00:00:00');


--
-- Name: testing_applications_audit_202505; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202505 FOR VALUES FROM ('2025-05-01 00:00:00') TO ('2025-06-01 00:00:00');


--
-- Name: testing_applications_audit_202506; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202506 FOR VALUES FROM ('2025-06-01 00:00:00') TO ('2025-07-01 00:00:00');


--
-- Name: testing_applications_audit_202507; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202507 FOR VALUES FROM ('2025-07-01 00:00:00') TO ('2025-08-01 00:00:00');


--
-- Name: testing_applications_audit_202508; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202508 FOR VALUES FROM ('2025-08-01 00:00:00') TO ('2025-09-01 00:00:00');


--
-- Name: testing_applications_audit_202509; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202509 FOR VALUES FROM ('2025-09-01 00:00:00') TO ('2025-10-01 00:00:00');


--
-- Name: testing_applications_audit_202510; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202510 FOR VALUES FROM ('2025-10-01 00:00:00') TO ('2025-11-01 00:00:00');


--
-- Name: testing_applications_audit_202511; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202511 FOR VALUES FROM ('2025-11-01 00:00:00') TO ('2025-12-01 00:00:00');


--
-- Name: testing_applications_audit_202512; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202512 FOR VALUES FROM ('2025-12-01 00:00:00') TO ('2026-01-01 00:00:00');


--
-- Name: testing_applications_audit_202601; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202601 FOR VALUES FROM ('2026-01-01 00:00:00') TO ('2026-02-01 00:00:00');


--
-- Name: testing_applications_audit_202602; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202602 FOR VALUES FROM ('2026-02-01 00:00:00') TO ('2026-03-01 00:00:00');


--
-- Name: testing_applications_audit_202603; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202603 FOR VALUES FROM ('2026-03-01 00:00:00') TO ('2026-04-01 00:00:00');


--
-- Name: testing_applications_audit_202604; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202604 FOR VALUES FROM ('2026-04-01 00:00:00') TO ('2026-05-01 00:00:00');


--
-- Name: testing_applications_audit_202605; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202605 FOR VALUES FROM ('2026-05-01 00:00:00') TO ('2026-06-01 00:00:00');


--
-- Name: testing_applications_audit_202606; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202606 FOR VALUES FROM ('2026-06-01 00:00:00') TO ('2026-07-01 00:00:00');


--
-- Name: testing_applications_audit_202607; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202607 FOR VALUES FROM ('2026-07-01 00:00:00') TO ('2026-08-01 00:00:00');


--
-- Name: testing_applications_audit_202608; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202608 FOR VALUES FROM ('2026-08-01 00:00:00') TO ('2026-09-01 00:00:00');


--
-- Name: testing_applications_audit_202609; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202609 FOR VALUES FROM ('2026-09-01 00:00:00') TO ('2026-10-01 00:00:00');


--
-- Name: testing_applications_audit_202610; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202610 FOR VALUES FROM ('2026-10-01 00:00:00') TO ('2026-11-01 00:00:00');


--
-- Name: testing_applications_audit_202611; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202611 FOR VALUES FROM ('2026-11-01 00:00:00') TO ('2026-12-01 00:00:00');


--
-- Name: testing_applications_audit_202612; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ATTACH PARTITION mecs.testing_applications_audit_202612 FOR VALUES FROM ('2026-12-01 00:00:00') TO ('2027-01-01 00:00:00');


--
-- Name: testing_plans_202601; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202601 FOR VALUES FROM ('2026-01-01 00:00:00') TO ('2026-02-01 00:00:00');


--
-- Name: testing_plans_202602; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202602 FOR VALUES FROM ('2026-02-01 00:00:00') TO ('2026-03-01 00:00:00');


--
-- Name: testing_plans_202603; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202603 FOR VALUES FROM ('2026-03-01 00:00:00') TO ('2026-04-01 00:00:00');


--
-- Name: testing_plans_202604; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202604 FOR VALUES FROM ('2026-04-01 00:00:00') TO ('2026-05-01 00:00:00');


--
-- Name: testing_plans_202605; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202605 FOR VALUES FROM ('2026-05-01 00:00:00') TO ('2026-06-01 00:00:00');


--
-- Name: testing_plans_202606; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202606 FOR VALUES FROM ('2026-06-01 00:00:00') TO ('2026-07-01 00:00:00');


--
-- Name: testing_plans_202607; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202607 FOR VALUES FROM ('2026-07-01 00:00:00') TO ('2026-08-01 00:00:00');


--
-- Name: testing_plans_202608; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202608 FOR VALUES FROM ('2026-08-01 00:00:00') TO ('2026-09-01 00:00:00');


--
-- Name: testing_plans_202609; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202609 FOR VALUES FROM ('2026-09-01 00:00:00') TO ('2026-10-01 00:00:00');


--
-- Name: testing_plans_202610; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202610 FOR VALUES FROM ('2026-10-01 00:00:00') TO ('2026-11-01 00:00:00');


--
-- Name: testing_plans_202611; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202611 FOR VALUES FROM ('2026-11-01 00:00:00') TO ('2026-12-01 00:00:00');


--
-- Name: testing_plans_202612; Type: TABLE ATTACH; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ATTACH PARTITION mecs.testing_plans_202612 FOR VALUES FROM ('2026-12-01 00:00:00') TO ('2027-01-01 00:00:00');


--
-- Name: global_parameters id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.global_parameters ALTER COLUMN id SET DEFAULT nextval('mecs.global_parameters_id_seq'::regclass);


--
-- Name: menus id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.menus ALTER COLUMN id SET DEFAULT nextval('mecs.menus_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.notifications ALTER COLUMN id SET DEFAULT nextval('mecs.notifications_id_seq1'::regclass);


--
-- Name: registrations_counters id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.registrations_counters ALTER COLUMN id SET DEFAULT nextval('mecs.registrations_counters_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.roles ALTER COLUMN id SET DEFAULT nextval('mecs.roles_id_seq'::regclass);


--
-- Name: scoring_aspects id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_aspects ALTER COLUMN id SET DEFAULT nextval('mecs.scoring_aspects_id_seq'::regclass);


--
-- Name: scoring_levels id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_levels ALTER COLUMN id SET DEFAULT nextval('mecs.scoring_levels_id_seq'::regclass);


--
-- Name: scoring_sub_aspect_items id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_sub_aspect_items ALTER COLUMN id SET DEFAULT nextval('mecs.scoring_sub_aspect_items_id_seq'::regclass);


--
-- Name: scoring_sub_aspects id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_sub_aspects ALTER COLUMN id SET DEFAULT nextval('mecs.scoring_sub_aspects_id_seq'::regclass);


--
-- Name: simulator_data_logs id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.simulator_data_logs ALTER COLUMN id SET DEFAULT nextval('mecs.simulator_data_logs_id_seq'::regclass);


--
-- Name: tester_applications id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.tester_applications ALTER COLUMN id SET DEFAULT nextval('mecs.tester_applications_id_seq'::regclass);


--
-- Name: testing_applications id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications ALTER COLUMN id SET DEFAULT nextval('mecs.testing_applications_id_seq2'::regclass);


--
-- Name: testing_applications_audit id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_applications_audit ALTER COLUMN id SET DEFAULT nextval('mecs.testing_applications_audit_id_seq'::regclass);


--
-- Name: testing_equipments id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_equipments ALTER COLUMN id SET DEFAULT nextval('mecs.testing_equipments_id_seq'::regclass);


--
-- Name: testing_plans id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_plans ALTER COLUMN id SET DEFAULT nextval('mecs.testing_plans_id_seq1'::regclass);


--
-- Name: testing_results id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_results ALTER COLUMN id SET DEFAULT nextval('mecs.testing_results_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.user_sessions ALTER COLUMN id SET DEFAULT nextval('mecs.user_sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.users ALTER COLUMN id SET DEFAULT nextval('mecs.users_id_seq'::regclass);



SET default_tablespace = 'ts_index_mecs';

--
-- Name: applicant_types applicant_types_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: global_parameters global_parameters_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: master_testers master_testers_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: material_categories material_categories_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: methodologies methodologies_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: models models_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications notifications_pkey1; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202601 notifications_202601_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202602 notifications_202602_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202603 notifications_202603_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202604 notifications_202604_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202605 notifications_202605_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202606 notifications_202606_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202607 notifications_202607_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202608 notifications_202608_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202609 notifications_202609_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202610 notifications_202610_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202611 notifications_202611_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202612 notifications_202612_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202701 notifications_202701_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202702 notifications_202702_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202703 notifications_202703_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202704 notifications_202704_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202705 notifications_202705_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202706 notifications_202706_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202707 notifications_202707_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202708 notifications_202708_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202709 notifications_202709_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202710 notifications_202710_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202711 notifications_202711_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: notifications_202712 notifications_202712_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: origins origins_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: partner_categories partner_categories_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: partner_types partner_types_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: registrations_counters registrations_counters_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: role_menus role_menus_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: scoring_aspects scoring_aspects_name_key; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_aspects
    ADD CONSTRAINT scoring_aspects_name_key UNIQUE (name);


--
-- Name: scoring_aspects scoring_aspects_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: scoring_levels scoring_levels_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: scoring_sub_aspect_items scoring_sub_aspect_items_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: scoring_sub_aspects scoring_sub_aspects_name_key; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_sub_aspects
    ADD CONSTRAINT scoring_sub_aspects_name_key UNIQUE (name);


--
-- Name: scoring_sub_aspects scoring_sub_aspects_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: simulator_data_logs simulator_data_logs_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: status_applications status_applications_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: test_standards test_standards_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: test_types test_types_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: tester_applications tester_applications_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications testing_applications_pkey1; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_202603 testing_applications_2026_03_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_202604 testing_applications_2026_04_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_202605 testing_applications_2026_05_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit testing_applications_audit_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202401 testing_applications_audit_202401_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202402 testing_applications_audit_202402_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202403 testing_applications_audit_202403_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202404 testing_applications_audit_202404_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202405 testing_applications_audit_202405_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202406 testing_applications_audit_202406_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202407 testing_applications_audit_202407_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202408 testing_applications_audit_202408_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202409 testing_applications_audit_202409_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202410 testing_applications_audit_202410_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202411 testing_applications_audit_202411_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202412 testing_applications_audit_202412_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202501 testing_applications_audit_202501_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202502 testing_applications_audit_202502_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202503 testing_applications_audit_202503_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202504 testing_applications_audit_202504_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202505 testing_applications_audit_202505_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202506 testing_applications_audit_202506_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202507 testing_applications_audit_202507_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202508 testing_applications_audit_202508_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202509 testing_applications_audit_202509_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202510 testing_applications_audit_202510_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202511 testing_applications_audit_202511_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202512 testing_applications_audit_202512_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202601 testing_applications_audit_202601_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202602 testing_applications_audit_202602_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202603 testing_applications_audit_202603_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202604 testing_applications_audit_202604_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202605 testing_applications_audit_202605_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202606 testing_applications_audit_202606_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202607 testing_applications_audit_202607_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202608 testing_applications_audit_202608_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202609 testing_applications_audit_202609_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202610 testing_applications_audit_202610_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202611 testing_applications_audit_202611_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_applications_audit_202612 testing_applications_audit_202612_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_equipments testing_equipments_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans testing_plans_pkey1; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202601 testing_plans_y2026m01_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202602 testing_plans_y2026m02_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202603 testing_plans_y2026m03_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202604 testing_plans_y2026m04_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202605 testing_plans_y2026m05_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202606 testing_plans_y2026m06_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202607 testing_plans_y2026m07_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202608 testing_plans_y2026m08_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202609 testing_plans_y2026m09_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202610 testing_plans_y2026m10_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202611 testing_plans_y2026m11_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_plans_202612 testing_plans_y2026m12_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: testing_results testing_results_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: applicant_types uni_applicant_types_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.applicant_types
    ADD CONSTRAINT uni_applicant_types_name UNIQUE (name);


--
-- Name: brands uni_brands_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.brands
    ADD CONSTRAINT uni_brands_name UNIQUE (name);


--
-- Name: global_parameters uni_global_parameters_param_key; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.global_parameters
    ADD CONSTRAINT uni_global_parameters_param_key UNIQUE (param_key);


--
-- Name: locations uni_locations_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.locations
    ADD CONSTRAINT uni_locations_name UNIQUE (name);


--
-- Name: material_categories uni_material_categories_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.material_categories
    ADD CONSTRAINT uni_material_categories_name UNIQUE (name);


--
-- Name: methodologies uni_methodologies_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.methodologies
    ADD CONSTRAINT uni_methodologies_name UNIQUE (name);


--
-- Name: models uni_models_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.models
    ADD CONSTRAINT uni_models_name UNIQUE (name);


--
-- Name: origins uni_origins_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.origins
    ADD CONSTRAINT uni_origins_name UNIQUE (name);


--
-- Name: partner_categories uni_partner_categories_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.partner_categories
    ADD CONSTRAINT uni_partner_categories_name UNIQUE (name);


--
-- Name: partner_types uni_partner_types_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.partner_types
    ADD CONSTRAINT uni_partner_types_name UNIQUE (name);


--
-- Name: partners uni_partners_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.partners
    ADD CONSTRAINT uni_partners_name UNIQUE (name);


--
-- Name: roles uni_roles_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.roles
    ADD CONSTRAINT uni_roles_name UNIQUE (name);


--
-- Name: scoring_aspects uni_scoring_aspects_code; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_aspects
    ADD CONSTRAINT uni_scoring_aspects_code UNIQUE (code);


--
-- Name: scoring_sub_aspects uni_scoring_sub_aspects_code; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_sub_aspects
    ADD CONSTRAINT uni_scoring_sub_aspects_code UNIQUE (code);


--
-- Name: test_standards uni_test_standards_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.test_standards
    ADD CONSTRAINT uni_test_standards_name UNIQUE (name);


--
-- Name: test_types uni_test_types_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.test_types
    ADD CONSTRAINT uni_test_types_name UNIQUE (name);


--
-- Name: user_sessions uni_user_sessions_token; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.user_sessions
    ADD CONSTRAINT uni_user_sessions_token UNIQUE (token);


--
-- Name: users uni_users_username; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.users
    ADD CONSTRAINT uni_users_username UNIQUE (username);


--
-- Name: variants uni_variants_name; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.variants
    ADD CONSTRAINT uni_variants_name UNIQUE (name);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: variants variants_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--




--
-- Name: idx_applicant_types_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_applicant_types_deleted_at ON mecs.applicant_types USING btree (deleted_at);


--
-- Name: idx_brands_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_brands_deleted_at ON mecs.brands USING btree (deleted_at);


--
-- Name: idx_locations_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_locations_deleted_at ON mecs.locations USING btree (deleted_at);


--
-- Name: idx_material_categories_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_material_categories_deleted_at ON mecs.material_categories USING btree (deleted_at);


--
-- Name: idx_menus_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_menus_deleted_at ON mecs.menus USING btree (deleted_at);


--
-- Name: idx_methodologies_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_methodologies_deleted_at ON mecs.methodologies USING btree (deleted_at);


--
-- Name: idx_models_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_models_deleted_at ON mecs.models USING btree (deleted_at);


--
-- Name: idx_notifications_role_name; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_notifications_role_name ON ONLY mecs.notifications USING btree (role_name);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON ONLY mecs.notifications USING btree (user_id);


--
-- Name: idx_origins_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_origins_deleted_at ON mecs.origins USING btree (deleted_at);


--
-- Name: idx_partner_categories_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_partner_categories_deleted_at ON mecs.partner_categories USING btree (deleted_at);


--
-- Name: idx_partner_types_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_partner_types_deleted_at ON mecs.partner_types USING btree (deleted_at);


--
-- Name: idx_partners_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_partners_deleted_at ON mecs.partners USING btree (deleted_at);


--
-- Name: idx_registrations_counters_year; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_registrations_counters_year ON mecs.registrations_counters USING btree (year);


--
-- Name: idx_roles_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_roles_deleted_at ON mecs.roles USING btree (deleted_at);


--
-- Name: idx_scoring_aspects_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_scoring_aspects_deleted_at ON mecs.scoring_aspects USING btree (deleted_at);


--
-- Name: idx_scoring_aspects_methodology; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_scoring_aspects_methodology ON mecs.scoring_aspects USING btree (methodology_code);


--
-- Name: idx_scoring_aspects_methodology_code; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_scoring_aspects_methodology_code ON mecs.scoring_aspects USING btree (methodology_code);


--
-- Name: idx_scoring_levels_level_group_code; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_scoring_levels_level_group_code ON mecs.scoring_levels USING btree (level_group_code);


--
-- Name: idx_scoring_levels_methodologies_code; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_scoring_levels_methodologies_code ON mecs.scoring_levels USING btree (methodologies_code);


--
-- Name: idx_scoring_levels_methodology_code; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_scoring_levels_methodology_code ON mecs.scoring_levels USING btree (methodologies_code);


--
-- Name: idx_scoring_sub_aspect_items_sub_aspect_code; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_scoring_sub_aspect_items_sub_aspect_code ON mecs.scoring_sub_aspect_items USING btree (sub_aspect_code);


--
-- Name: idx_scoring_sub_aspects_aspect; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_scoring_sub_aspects_aspect ON mecs.scoring_sub_aspects USING btree (aspect_code);


--
-- Name: idx_scoring_sub_aspects_aspect_code; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_scoring_sub_aspects_aspect_code ON mecs.scoring_sub_aspects USING btree (aspect_code);


--
-- Name: idx_scoring_sub_aspects_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_scoring_sub_aspects_deleted_at ON mecs.scoring_sub_aspects USING btree (deleted_at);


--
-- Name: idx_simulator_data_logs_created_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_simulator_data_logs_created_at ON mecs.simulator_data_logs USING btree (created_at);


--
-- Name: idx_simulator_data_logs_is_used; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_simulator_data_logs_is_used ON mecs.simulator_data_logs USING btree (is_used);


--
-- Name: idx_simulator_data_logs_sub_aspect_code; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_simulator_data_logs_sub_aspect_code ON mecs.simulator_data_logs USING btree (sub_aspect_code);


--
-- Name: idx_test_standards_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_test_standards_deleted_at ON mecs.test_standards USING btree (deleted_at);


--
-- Name: idx_test_types_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_test_types_deleted_at ON mecs.test_types USING btree (deleted_at);


--
-- Name: idx_tester_applications_application_id; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_tester_applications_application_id ON mecs.tester_applications USING btree (application_id);


--
-- Name: idx_tester_applications_aspect_code; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_tester_applications_aspect_code ON mecs.tester_applications USING btree (aspect_code);


--
-- Name: idx_testing_applications_audit_application_id; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_testing_applications_audit_application_id ON ONLY mecs.testing_applications_audit USING btree (application_id);


--
-- Name: idx_testing_applications_audit_created_user; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_testing_applications_audit_created_user ON ONLY mecs.testing_applications_audit USING btree (created_user);


--
-- Name: idx_testing_applications_audit_status; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_testing_applications_audit_status ON ONLY mecs.testing_applications_audit USING btree (status);


--
-- Name: idx_testing_equipments_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_testing_equipments_deleted_at ON mecs.testing_equipments USING btree (deleted_at);


--
-- Name: idx_testing_equipments_equipment_name; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_testing_equipments_equipment_name ON mecs.testing_equipments USING btree (equipment_name);


--
-- Name: idx_testing_plans_app_id; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_testing_plans_app_id ON ONLY mecs.testing_plans USING btree (application_id);


--
-- Name: idx_testing_results_application_id; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_testing_results_application_id ON mecs.testing_results USING btree (application_id);


--
-- Name: idx_testing_results_aspect; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_testing_results_aspect ON mecs.testing_results USING btree (aspect_code);


--
-- Name: idx_testing_results_aspect_code; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_testing_results_aspect_code ON mecs.testing_results USING btree (aspect_code);


--
-- Name: idx_testing_results_sub_aspect; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_testing_results_sub_aspect ON mecs.testing_results USING btree (sub_aspect_code);


--
-- Name: idx_testing_results_sub_aspect_code; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_testing_results_sub_aspect_code ON mecs.testing_results USING btree (sub_aspect_code);


--
-- Name: idx_user_sessions_token; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON mecs.user_sessions USING btree (token);


--
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON mecs.user_sessions USING btree (user_id);


--
-- Name: idx_users_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON mecs.users USING btree (deleted_at);


--
-- Name: idx_variants_deleted_at; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS idx_variants_deleted_at ON mecs.variants USING btree (deleted_at);


--
-- Name: notifications_202601_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202601_role_name_idx ON mecs.notifications_202601 USING btree (role_name);


--
-- Name: notifications_202601_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202601_user_id_idx ON mecs.notifications_202601 USING btree (user_id);


--
-- Name: notifications_202602_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202602_role_name_idx ON mecs.notifications_202602 USING btree (role_name);


--
-- Name: notifications_202602_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202602_user_id_idx ON mecs.notifications_202602 USING btree (user_id);


--
-- Name: notifications_202603_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202603_role_name_idx ON mecs.notifications_202603 USING btree (role_name);


--
-- Name: notifications_202603_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202603_user_id_idx ON mecs.notifications_202603 USING btree (user_id);


--
-- Name: notifications_202604_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202604_role_name_idx ON mecs.notifications_202604 USING btree (role_name);


--
-- Name: notifications_202604_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202604_user_id_idx ON mecs.notifications_202604 USING btree (user_id);


--
-- Name: notifications_202605_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202605_role_name_idx ON mecs.notifications_202605 USING btree (role_name);


--
-- Name: notifications_202605_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202605_user_id_idx ON mecs.notifications_202605 USING btree (user_id);


--
-- Name: notifications_202606_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202606_role_name_idx ON mecs.notifications_202606 USING btree (role_name);


--
-- Name: notifications_202606_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202606_user_id_idx ON mecs.notifications_202606 USING btree (user_id);


--
-- Name: notifications_202607_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202607_role_name_idx ON mecs.notifications_202607 USING btree (role_name);


--
-- Name: notifications_202607_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202607_user_id_idx ON mecs.notifications_202607 USING btree (user_id);


--
-- Name: notifications_202608_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202608_role_name_idx ON mecs.notifications_202608 USING btree (role_name);


--
-- Name: notifications_202608_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202608_user_id_idx ON mecs.notifications_202608 USING btree (user_id);


--
-- Name: notifications_202609_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202609_role_name_idx ON mecs.notifications_202609 USING btree (role_name);


--
-- Name: notifications_202609_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202609_user_id_idx ON mecs.notifications_202609 USING btree (user_id);


--
-- Name: notifications_202610_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202610_role_name_idx ON mecs.notifications_202610 USING btree (role_name);


--
-- Name: notifications_202610_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202610_user_id_idx ON mecs.notifications_202610 USING btree (user_id);


--
-- Name: notifications_202611_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202611_role_name_idx ON mecs.notifications_202611 USING btree (role_name);


--
-- Name: notifications_202611_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202611_user_id_idx ON mecs.notifications_202611 USING btree (user_id);


--
-- Name: notifications_202612_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202612_role_name_idx ON mecs.notifications_202612 USING btree (role_name);


--
-- Name: notifications_202612_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202612_user_id_idx ON mecs.notifications_202612 USING btree (user_id);


--
-- Name: notifications_202701_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202701_role_name_idx ON mecs.notifications_202701 USING btree (role_name);


--
-- Name: notifications_202701_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202701_user_id_idx ON mecs.notifications_202701 USING btree (user_id);


--
-- Name: notifications_202702_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202702_role_name_idx ON mecs.notifications_202702 USING btree (role_name);


--
-- Name: notifications_202702_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202702_user_id_idx ON mecs.notifications_202702 USING btree (user_id);


--
-- Name: notifications_202703_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202703_role_name_idx ON mecs.notifications_202703 USING btree (role_name);


--
-- Name: notifications_202703_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202703_user_id_idx ON mecs.notifications_202703 USING btree (user_id);


--
-- Name: notifications_202704_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202704_role_name_idx ON mecs.notifications_202704 USING btree (role_name);


--
-- Name: notifications_202704_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202704_user_id_idx ON mecs.notifications_202704 USING btree (user_id);


--
-- Name: notifications_202705_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202705_role_name_idx ON mecs.notifications_202705 USING btree (role_name);


--
-- Name: notifications_202705_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202705_user_id_idx ON mecs.notifications_202705 USING btree (user_id);


--
-- Name: notifications_202706_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202706_role_name_idx ON mecs.notifications_202706 USING btree (role_name);


--
-- Name: notifications_202706_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202706_user_id_idx ON mecs.notifications_202706 USING btree (user_id);


--
-- Name: notifications_202707_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202707_role_name_idx ON mecs.notifications_202707 USING btree (role_name);


--
-- Name: notifications_202707_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202707_user_id_idx ON mecs.notifications_202707 USING btree (user_id);


--
-- Name: notifications_202708_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202708_role_name_idx ON mecs.notifications_202708 USING btree (role_name);


--
-- Name: notifications_202708_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202708_user_id_idx ON mecs.notifications_202708 USING btree (user_id);


--
-- Name: notifications_202709_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202709_role_name_idx ON mecs.notifications_202709 USING btree (role_name);


--
-- Name: notifications_202709_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202709_user_id_idx ON mecs.notifications_202709 USING btree (user_id);


--
-- Name: notifications_202710_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202710_role_name_idx ON mecs.notifications_202710 USING btree (role_name);


--
-- Name: notifications_202710_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202710_user_id_idx ON mecs.notifications_202710 USING btree (user_id);


--
-- Name: notifications_202711_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202711_role_name_idx ON mecs.notifications_202711 USING btree (role_name);


--
-- Name: notifications_202711_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202711_user_id_idx ON mecs.notifications_202711 USING btree (user_id);


--
-- Name: notifications_202712_role_name_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202712_role_name_idx ON mecs.notifications_202712 USING btree (role_name);


--
-- Name: notifications_202712_user_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS notifications_202712_user_id_idx ON mecs.notifications_202712 USING btree (user_id);


--
-- Name: testing_applications_audit_202401_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202401_application_id_idx ON mecs.testing_applications_audit_202401 USING btree (application_id);


--
-- Name: testing_applications_audit_202401_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202401_created_user_idx ON mecs.testing_applications_audit_202401 USING btree (created_user);


--
-- Name: testing_applications_audit_202401_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202401_status_idx ON mecs.testing_applications_audit_202401 USING btree (status);


--
-- Name: testing_applications_audit_202402_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202402_application_id_idx ON mecs.testing_applications_audit_202402 USING btree (application_id);


--
-- Name: testing_applications_audit_202402_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202402_created_user_idx ON mecs.testing_applications_audit_202402 USING btree (created_user);


--
-- Name: testing_applications_audit_202402_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202402_status_idx ON mecs.testing_applications_audit_202402 USING btree (status);


--
-- Name: testing_applications_audit_202403_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202403_application_id_idx ON mecs.testing_applications_audit_202403 USING btree (application_id);


--
-- Name: testing_applications_audit_202403_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202403_created_user_idx ON mecs.testing_applications_audit_202403 USING btree (created_user);


--
-- Name: testing_applications_audit_202403_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202403_status_idx ON mecs.testing_applications_audit_202403 USING btree (status);


--
-- Name: testing_applications_audit_202404_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202404_application_id_idx ON mecs.testing_applications_audit_202404 USING btree (application_id);


--
-- Name: testing_applications_audit_202404_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202404_created_user_idx ON mecs.testing_applications_audit_202404 USING btree (created_user);


--
-- Name: testing_applications_audit_202404_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202404_status_idx ON mecs.testing_applications_audit_202404 USING btree (status);


--
-- Name: testing_applications_audit_202405_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202405_application_id_idx ON mecs.testing_applications_audit_202405 USING btree (application_id);


--
-- Name: testing_applications_audit_202405_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202405_created_user_idx ON mecs.testing_applications_audit_202405 USING btree (created_user);


--
-- Name: testing_applications_audit_202405_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202405_status_idx ON mecs.testing_applications_audit_202405 USING btree (status);


--
-- Name: testing_applications_audit_202406_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202406_application_id_idx ON mecs.testing_applications_audit_202406 USING btree (application_id);


--
-- Name: testing_applications_audit_202406_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202406_created_user_idx ON mecs.testing_applications_audit_202406 USING btree (created_user);


--
-- Name: testing_applications_audit_202406_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202406_status_idx ON mecs.testing_applications_audit_202406 USING btree (status);


--
-- Name: testing_applications_audit_202407_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202407_application_id_idx ON mecs.testing_applications_audit_202407 USING btree (application_id);


--
-- Name: testing_applications_audit_202407_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202407_created_user_idx ON mecs.testing_applications_audit_202407 USING btree (created_user);


--
-- Name: testing_applications_audit_202407_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202407_status_idx ON mecs.testing_applications_audit_202407 USING btree (status);


--
-- Name: testing_applications_audit_202408_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202408_application_id_idx ON mecs.testing_applications_audit_202408 USING btree (application_id);


--
-- Name: testing_applications_audit_202408_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202408_created_user_idx ON mecs.testing_applications_audit_202408 USING btree (created_user);


--
-- Name: testing_applications_audit_202408_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202408_status_idx ON mecs.testing_applications_audit_202408 USING btree (status);


--
-- Name: testing_applications_audit_202409_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202409_application_id_idx ON mecs.testing_applications_audit_202409 USING btree (application_id);


--
-- Name: testing_applications_audit_202409_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202409_created_user_idx ON mecs.testing_applications_audit_202409 USING btree (created_user);


--
-- Name: testing_applications_audit_202409_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202409_status_idx ON mecs.testing_applications_audit_202409 USING btree (status);


--
-- Name: testing_applications_audit_202410_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202410_application_id_idx ON mecs.testing_applications_audit_202410 USING btree (application_id);


--
-- Name: testing_applications_audit_202410_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202410_created_user_idx ON mecs.testing_applications_audit_202410 USING btree (created_user);


--
-- Name: testing_applications_audit_202410_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202410_status_idx ON mecs.testing_applications_audit_202410 USING btree (status);


--
-- Name: testing_applications_audit_202411_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202411_application_id_idx ON mecs.testing_applications_audit_202411 USING btree (application_id);


--
-- Name: testing_applications_audit_202411_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202411_created_user_idx ON mecs.testing_applications_audit_202411 USING btree (created_user);


--
-- Name: testing_applications_audit_202411_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202411_status_idx ON mecs.testing_applications_audit_202411 USING btree (status);


--
-- Name: testing_applications_audit_202412_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202412_application_id_idx ON mecs.testing_applications_audit_202412 USING btree (application_id);


--
-- Name: testing_applications_audit_202412_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202412_created_user_idx ON mecs.testing_applications_audit_202412 USING btree (created_user);


--
-- Name: testing_applications_audit_202412_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202412_status_idx ON mecs.testing_applications_audit_202412 USING btree (status);


--
-- Name: testing_applications_audit_202501_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202501_application_id_idx ON mecs.testing_applications_audit_202501 USING btree (application_id);


--
-- Name: testing_applications_audit_202501_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202501_created_user_idx ON mecs.testing_applications_audit_202501 USING btree (created_user);


--
-- Name: testing_applications_audit_202501_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202501_status_idx ON mecs.testing_applications_audit_202501 USING btree (status);


--
-- Name: testing_applications_audit_202502_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202502_application_id_idx ON mecs.testing_applications_audit_202502 USING btree (application_id);


--
-- Name: testing_applications_audit_202502_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202502_created_user_idx ON mecs.testing_applications_audit_202502 USING btree (created_user);


--
-- Name: testing_applications_audit_202502_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202502_status_idx ON mecs.testing_applications_audit_202502 USING btree (status);


--
-- Name: testing_applications_audit_202503_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202503_application_id_idx ON mecs.testing_applications_audit_202503 USING btree (application_id);


--
-- Name: testing_applications_audit_202503_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202503_created_user_idx ON mecs.testing_applications_audit_202503 USING btree (created_user);


--
-- Name: testing_applications_audit_202503_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202503_status_idx ON mecs.testing_applications_audit_202503 USING btree (status);


--
-- Name: testing_applications_audit_202504_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202504_application_id_idx ON mecs.testing_applications_audit_202504 USING btree (application_id);


--
-- Name: testing_applications_audit_202504_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202504_created_user_idx ON mecs.testing_applications_audit_202504 USING btree (created_user);


--
-- Name: testing_applications_audit_202504_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202504_status_idx ON mecs.testing_applications_audit_202504 USING btree (status);


--
-- Name: testing_applications_audit_202505_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202505_application_id_idx ON mecs.testing_applications_audit_202505 USING btree (application_id);


--
-- Name: testing_applications_audit_202505_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202505_created_user_idx ON mecs.testing_applications_audit_202505 USING btree (created_user);


--
-- Name: testing_applications_audit_202505_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202505_status_idx ON mecs.testing_applications_audit_202505 USING btree (status);


--
-- Name: testing_applications_audit_202506_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202506_application_id_idx ON mecs.testing_applications_audit_202506 USING btree (application_id);


--
-- Name: testing_applications_audit_202506_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202506_created_user_idx ON mecs.testing_applications_audit_202506 USING btree (created_user);


--
-- Name: testing_applications_audit_202506_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202506_status_idx ON mecs.testing_applications_audit_202506 USING btree (status);


--
-- Name: testing_applications_audit_202507_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202507_application_id_idx ON mecs.testing_applications_audit_202507 USING btree (application_id);


--
-- Name: testing_applications_audit_202507_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202507_created_user_idx ON mecs.testing_applications_audit_202507 USING btree (created_user);


--
-- Name: testing_applications_audit_202507_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202507_status_idx ON mecs.testing_applications_audit_202507 USING btree (status);


--
-- Name: testing_applications_audit_202508_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202508_application_id_idx ON mecs.testing_applications_audit_202508 USING btree (application_id);


--
-- Name: testing_applications_audit_202508_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202508_created_user_idx ON mecs.testing_applications_audit_202508 USING btree (created_user);


--
-- Name: testing_applications_audit_202508_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202508_status_idx ON mecs.testing_applications_audit_202508 USING btree (status);


--
-- Name: testing_applications_audit_202509_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202509_application_id_idx ON mecs.testing_applications_audit_202509 USING btree (application_id);


--
-- Name: testing_applications_audit_202509_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202509_created_user_idx ON mecs.testing_applications_audit_202509 USING btree (created_user);


--
-- Name: testing_applications_audit_202509_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202509_status_idx ON mecs.testing_applications_audit_202509 USING btree (status);


--
-- Name: testing_applications_audit_202510_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202510_application_id_idx ON mecs.testing_applications_audit_202510 USING btree (application_id);


--
-- Name: testing_applications_audit_202510_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202510_created_user_idx ON mecs.testing_applications_audit_202510 USING btree (created_user);


--
-- Name: testing_applications_audit_202510_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202510_status_idx ON mecs.testing_applications_audit_202510 USING btree (status);


--
-- Name: testing_applications_audit_202511_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202511_application_id_idx ON mecs.testing_applications_audit_202511 USING btree (application_id);


--
-- Name: testing_applications_audit_202511_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202511_created_user_idx ON mecs.testing_applications_audit_202511 USING btree (created_user);


--
-- Name: testing_applications_audit_202511_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202511_status_idx ON mecs.testing_applications_audit_202511 USING btree (status);


--
-- Name: testing_applications_audit_202512_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202512_application_id_idx ON mecs.testing_applications_audit_202512 USING btree (application_id);


--
-- Name: testing_applications_audit_202512_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202512_created_user_idx ON mecs.testing_applications_audit_202512 USING btree (created_user);


--
-- Name: testing_applications_audit_202512_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202512_status_idx ON mecs.testing_applications_audit_202512 USING btree (status);


--
-- Name: testing_applications_audit_202601_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202601_application_id_idx ON mecs.testing_applications_audit_202601 USING btree (application_id);


--
-- Name: testing_applications_audit_202601_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202601_created_user_idx ON mecs.testing_applications_audit_202601 USING btree (created_user);


--
-- Name: testing_applications_audit_202601_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202601_status_idx ON mecs.testing_applications_audit_202601 USING btree (status);


--
-- Name: testing_applications_audit_202602_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202602_application_id_idx ON mecs.testing_applications_audit_202602 USING btree (application_id);


--
-- Name: testing_applications_audit_202602_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202602_created_user_idx ON mecs.testing_applications_audit_202602 USING btree (created_user);


--
-- Name: testing_applications_audit_202602_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202602_status_idx ON mecs.testing_applications_audit_202602 USING btree (status);


--
-- Name: testing_applications_audit_202603_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202603_application_id_idx ON mecs.testing_applications_audit_202603 USING btree (application_id);


--
-- Name: testing_applications_audit_202603_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202603_created_user_idx ON mecs.testing_applications_audit_202603 USING btree (created_user);


--
-- Name: testing_applications_audit_202603_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202603_status_idx ON mecs.testing_applications_audit_202603 USING btree (status);


--
-- Name: testing_applications_audit_202604_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202604_application_id_idx ON mecs.testing_applications_audit_202604 USING btree (application_id);


--
-- Name: testing_applications_audit_202604_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202604_created_user_idx ON mecs.testing_applications_audit_202604 USING btree (created_user);


--
-- Name: testing_applications_audit_202604_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202604_status_idx ON mecs.testing_applications_audit_202604 USING btree (status);


--
-- Name: testing_applications_audit_202605_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202605_application_id_idx ON mecs.testing_applications_audit_202605 USING btree (application_id);


--
-- Name: testing_applications_audit_202605_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202605_created_user_idx ON mecs.testing_applications_audit_202605 USING btree (created_user);


--
-- Name: testing_applications_audit_202605_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202605_status_idx ON mecs.testing_applications_audit_202605 USING btree (status);


--
-- Name: testing_applications_audit_202606_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202606_application_id_idx ON mecs.testing_applications_audit_202606 USING btree (application_id);


--
-- Name: testing_applications_audit_202606_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202606_created_user_idx ON mecs.testing_applications_audit_202606 USING btree (created_user);


--
-- Name: testing_applications_audit_202606_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202606_status_idx ON mecs.testing_applications_audit_202606 USING btree (status);


--
-- Name: testing_applications_audit_202607_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202607_application_id_idx ON mecs.testing_applications_audit_202607 USING btree (application_id);


--
-- Name: testing_applications_audit_202607_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202607_created_user_idx ON mecs.testing_applications_audit_202607 USING btree (created_user);


--
-- Name: testing_applications_audit_202607_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202607_status_idx ON mecs.testing_applications_audit_202607 USING btree (status);


--
-- Name: testing_applications_audit_202608_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202608_application_id_idx ON mecs.testing_applications_audit_202608 USING btree (application_id);


--
-- Name: testing_applications_audit_202608_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202608_created_user_idx ON mecs.testing_applications_audit_202608 USING btree (created_user);


--
-- Name: testing_applications_audit_202608_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202608_status_idx ON mecs.testing_applications_audit_202608 USING btree (status);


--
-- Name: testing_applications_audit_202609_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202609_application_id_idx ON mecs.testing_applications_audit_202609 USING btree (application_id);


--
-- Name: testing_applications_audit_202609_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202609_created_user_idx ON mecs.testing_applications_audit_202609 USING btree (created_user);


--
-- Name: testing_applications_audit_202609_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202609_status_idx ON mecs.testing_applications_audit_202609 USING btree (status);


--
-- Name: testing_applications_audit_202610_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202610_application_id_idx ON mecs.testing_applications_audit_202610 USING btree (application_id);


--
-- Name: testing_applications_audit_202610_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202610_created_user_idx ON mecs.testing_applications_audit_202610 USING btree (created_user);


--
-- Name: testing_applications_audit_202610_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202610_status_idx ON mecs.testing_applications_audit_202610 USING btree (status);


--
-- Name: testing_applications_audit_202611_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202611_application_id_idx ON mecs.testing_applications_audit_202611 USING btree (application_id);


--
-- Name: testing_applications_audit_202611_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202611_created_user_idx ON mecs.testing_applications_audit_202611 USING btree (created_user);


--
-- Name: testing_applications_audit_202611_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202611_status_idx ON mecs.testing_applications_audit_202611 USING btree (status);


--
-- Name: testing_applications_audit_202612_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202612_application_id_idx ON mecs.testing_applications_audit_202612 USING btree (application_id);


--
-- Name: testing_applications_audit_202612_created_user_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202612_created_user_idx ON mecs.testing_applications_audit_202612 USING btree (created_user);


--
-- Name: testing_applications_audit_202612_status_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_applications_audit_202612_status_idx ON mecs.testing_applications_audit_202612 USING btree (status);


--
-- Name: testing_plans_y2026m01_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m01_application_id_idx ON mecs.testing_plans_202601 USING btree (application_id);


--
-- Name: testing_plans_y2026m02_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m02_application_id_idx ON mecs.testing_plans_202602 USING btree (application_id);


--
-- Name: testing_plans_y2026m03_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m03_application_id_idx ON mecs.testing_plans_202603 USING btree (application_id);


--
-- Name: testing_plans_y2026m04_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m04_application_id_idx ON mecs.testing_plans_202604 USING btree (application_id);


--
-- Name: testing_plans_y2026m05_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m05_application_id_idx ON mecs.testing_plans_202605 USING btree (application_id);


--
-- Name: testing_plans_y2026m06_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m06_application_id_idx ON mecs.testing_plans_202606 USING btree (application_id);


--
-- Name: testing_plans_y2026m07_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m07_application_id_idx ON mecs.testing_plans_202607 USING btree (application_id);


--
-- Name: testing_plans_y2026m08_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m08_application_id_idx ON mecs.testing_plans_202608 USING btree (application_id);


--
-- Name: testing_plans_y2026m09_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m09_application_id_idx ON mecs.testing_plans_202609 USING btree (application_id);


--
-- Name: testing_plans_y2026m10_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m10_application_id_idx ON mecs.testing_plans_202610 USING btree (application_id);


--
-- Name: testing_plans_y2026m11_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m11_application_id_idx ON mecs.testing_plans_202611 USING btree (application_id);


--
-- Name: testing_plans_y2026m12_application_id_idx; Type: INDEX; Schema: mecs; Owner: admin_mecs
--

CREATE INDEX IF NOT EXISTS testing_plans_y2026m12_application_id_idx ON mecs.testing_plans_202612 USING btree (application_id);


--
-- Name: notifications_202601_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202601_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202601_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202602_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202602_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202602_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202603_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202603_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202603_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202604_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202604_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202604_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202605_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202605_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202605_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202606_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202606_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202606_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202607_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202607_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202607_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202608_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202608_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202608_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202609_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202609_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202609_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202610_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202610_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202610_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202611_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202611_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202611_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202612_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202612_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202612_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202701_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202701_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202701_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202702_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202702_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202702_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202703_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202703_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202703_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202704_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202704_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202704_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202705_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202705_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202705_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202706_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202706_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202706_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202707_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202707_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202707_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202708_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202708_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202708_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202709_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202709_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202709_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202710_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202710_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202710_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202711_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202711_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202711_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202712_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202712_role_name_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: notifications_202712_user_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_2026_03_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_2026_04_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_2026_05_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202401_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202401_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202401_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202401_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202402_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202402_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202402_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202402_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202403_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202403_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202403_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202403_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202404_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202404_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202404_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202404_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202405_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202405_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202405_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202405_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202406_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202406_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202406_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202406_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202407_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202407_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202407_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202407_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202408_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202408_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202408_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202408_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202409_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202409_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202409_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202409_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202410_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202410_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202410_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202410_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202411_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202411_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202411_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202411_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202412_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202412_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202412_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202412_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202501_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202501_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202501_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202501_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202502_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202502_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202502_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202502_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202503_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202503_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202503_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202503_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202504_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202504_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202504_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202504_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202505_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202505_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202505_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202505_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202506_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202506_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202506_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202506_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202507_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202507_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202507_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202507_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202508_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202508_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202508_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202508_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202509_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202509_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202509_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202509_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202510_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202510_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202510_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202510_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202511_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202511_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202511_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202511_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202512_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202512_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202512_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202512_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202601_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202601_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202601_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202601_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202602_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202602_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202602_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202602_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202603_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202603_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202603_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202603_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202604_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202604_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202604_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202604_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202605_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202605_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202605_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202605_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202606_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202606_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202606_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202606_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202607_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202607_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202607_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202607_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202608_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202608_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202608_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202608_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202609_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202609_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202609_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202609_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202610_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202610_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202610_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202610_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202611_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202611_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202611_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202611_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202612_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202612_created_user_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202612_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_applications_audit_202612_status_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m01_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m01_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m02_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m02_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m03_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m03_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m04_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m04_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m05_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m05_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m06_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m06_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m07_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m07_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m08_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m08_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m09_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m09_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m10_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m10_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m11_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m11_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m12_application_id_idx; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: testing_plans_y2026m12_pkey; Type: INDEX ATTACH; Schema: mecs; Owner: admin_mecs
--



--
-- Name: locations fk_locations_test_type; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.locations
    ADD CONSTRAINT fk_locations_test_type FOREIGN KEY (test_type_code) REFERENCES mecs.test_types(code);


--
-- Name: master_testers fk_master_testers_methodology; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.master_testers
    ADD CONSTRAINT fk_master_testers_methodology FOREIGN KEY (methodology_code) REFERENCES mecs.methodologies(code);


--
-- Name: methodologies fk_methodologies_test_type; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.methodologies
    ADD CONSTRAINT fk_methodologies_test_type FOREIGN KEY (test_type_code) REFERENCES mecs.test_types(code);


--
-- Name: models fk_models_brand; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.models
    ADD CONSTRAINT fk_models_brand FOREIGN KEY (brand_code) REFERENCES mecs.brands(code);


--
-- Name: partners fk_partners_category; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.partners
    ADD CONSTRAINT fk_partners_category FOREIGN KEY (category_code) REFERENCES mecs.partner_categories(code);


--
-- Name: partners fk_partners_type; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.partners
    ADD CONSTRAINT fk_partners_type FOREIGN KEY (type_code) REFERENCES mecs.partner_types(code);


--
-- Name: scoring_aspects fk_scoring_aspects_methodology; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_aspects
    ADD CONSTRAINT fk_scoring_aspects_methodology FOREIGN KEY (methodology_code) REFERENCES mecs.methodologies(code);


--
-- Name: scoring_sub_aspects fk_scoring_aspects_sub_aspects; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_sub_aspects
    ADD CONSTRAINT fk_scoring_aspects_sub_aspects FOREIGN KEY (aspect_code) REFERENCES mecs.scoring_aspects(code);


--
-- Name: scoring_aspects fk_scoring_aspects_test_type; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_aspects
    ADD CONSTRAINT fk_scoring_aspects_test_type FOREIGN KEY (test_type_code) REFERENCES mecs.test_types(code);


--
-- Name: scoring_sub_aspect_items fk_scoring_sub_aspect_items_sub_aspect; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_sub_aspect_items
    ADD CONSTRAINT fk_scoring_sub_aspect_items_sub_aspect FOREIGN KEY (sub_aspect_code) REFERENCES mecs.scoring_sub_aspects(code);


--
-- Name: tester_applications fk_tester_applications_methodology; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.tester_applications
    ADD CONSTRAINT fk_tester_applications_methodology FOREIGN KEY (methodology_code) REFERENCES mecs.methodologies(code);


--
-- Name: tester_applications fk_tester_applications_tester; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.tester_applications
    ADD CONSTRAINT fk_tester_applications_tester FOREIGN KEY (tester_id) REFERENCES mecs.master_testers(tester_id);


--
-- Name: testing_equipments fk_testing_equipments_brand; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_equipments
    ADD CONSTRAINT fk_testing_equipments_brand FOREIGN KEY (brand_code) REFERENCES mecs.brands(code);


--
-- Name: testing_equipments fk_testing_equipments_category; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_equipments
    ADD CONSTRAINT fk_testing_equipments_category FOREIGN KEY (category_code) REFERENCES mecs.material_categories(code);


--
-- Name: testing_equipments fk_testing_equipments_model; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_equipments
    ADD CONSTRAINT fk_testing_equipments_model FOREIGN KEY (model_code) REFERENCES mecs.models(code);


--
-- Name: testing_equipments fk_testing_equipments_origin; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_equipments
    ADD CONSTRAINT fk_testing_equipments_origin FOREIGN KEY (origin_code) REFERENCES mecs.origins(code);


--
-- Name: testing_equipments fk_testing_equipments_variant; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_equipments
    ADD CONSTRAINT fk_testing_equipments_variant FOREIGN KEY (variant_code) REFERENCES mecs.variants(code);


--
-- Name: testing_results fk_testing_results_aspect; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_results
    ADD CONSTRAINT fk_testing_results_aspect FOREIGN KEY (aspect_code) REFERENCES mecs.scoring_aspects(code);


--
-- Name: testing_results fk_testing_results_sub_aspect; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.testing_results
    ADD CONSTRAINT fk_testing_results_sub_aspect FOREIGN KEY (sub_aspect_code) REFERENCES mecs.scoring_sub_aspects(code);


--
-- Name: users fk_users_role; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.users
    ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES mecs.roles(id);


--
-- Name: variants fk_variants_model; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.variants
    ADD CONSTRAINT fk_variants_model FOREIGN KEY (model_code) REFERENCES mecs.models(code);


--
-- Name: scoring_aspects scoring_aspects_methodology_code_fkey; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_aspects
    ADD CONSTRAINT scoring_aspects_methodology_code_fkey FOREIGN KEY (methodology_code) REFERENCES mecs.methodologies(code);


--
-- Name: scoring_sub_aspects scoring_sub_aspects_aspect_code_fkey; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--

ALTER TABLE mecs.scoring_sub_aspects
    ADD CONSTRAINT scoring_sub_aspects_aspect_code_fkey FOREIGN KEY (aspect_code) REFERENCES mecs.scoring_aspects(code);


--
-- Name: provinces_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--


--
-- Name: cities_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--


--
-- Name: master_asset_statuses_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--


--
-- Name: testing_tools_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--


--
-- Name: testing_tool_transactions_pkey; Type: CONSTRAINT; Schema: mecs; Owner: admin_mecs
--


--
-- Name: cities fk_cities_province; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--
ALTER TABLE mecs.cities ADD CONSTRAINT fk_cities_province FOREIGN KEY (province_code) REFERENCES mecs.provinces(province_code);

--
-- Name: locations fk_locations_city; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--
ALTER TABLE mecs.locations ADD CONSTRAINT fk_locations_city FOREIGN KEY (city_code) REFERENCES mecs.cities(city_code);

--
-- Name: testing_tools fk_testing_tools_location; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--
ALTER TABLE mecs.testing_tools ADD CONSTRAINT fk_testing_tools_location FOREIGN KEY (location_code) REFERENCES mecs.locations(code);

--
-- Name: travel_requests fk_travel_requests_location; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--
ALTER TABLE mecs.travel_requests ADD CONSTRAINT fk_travel_requests_location FOREIGN KEY (location_code) REFERENCES mecs.locations(code);

--
-- Name: travel_requests fk_travel_requests_user; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--
ALTER TABLE mecs.travel_requests ADD CONSTRAINT fk_travel_requests_user FOREIGN KEY (user_id) REFERENCES mecs.users(id);

--
-- Name: reimbursements fk_reimbursements_user; Type: FK CONSTRAINT; Schema: mecs; Owner: admin_mecs
--
ALTER TABLE mecs.reimbursements ADD CONSTRAINT fk_reimbursements_user FOREIGN KEY (user_id) REFERENCES mecs.users(id);


-- ============================================================
-- 2026 PARTITIONS
-- ============================================================

-- travel_requests 202601-202612
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202601 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202602 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202603 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202604 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202605 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202606 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202607 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202608 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202609 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202610 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202611 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.travel_requests_202612 PARTITION OF mecs.travel_requests FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- reimbursements 202601-202612
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202601 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202602 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202603 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202604 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202605 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202606 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202607 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202608 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202609 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202610 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202611 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.reimbursements_202612 PARTITION OF mecs.reimbursements FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- testing_equipments 202601-202612
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202601 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202602 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202603 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202604 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202605 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202606 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202607 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202608 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202609 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202610 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202611 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.testing_equipments_202612 PARTITION OF mecs.testing_equipments FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- asset_activity_logs 202601-202612
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202601 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202602 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202603 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202604 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202605 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202606 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202607 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202608 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202609 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202610 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202611 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.asset_activity_logs_202612 PARTITION OF mecs.asset_activity_logs FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- testing_aspect_scores 202601-202612
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202601 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202602 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202603 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202604 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202605 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202606 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202607 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202608 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202609 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202610 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202611 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.testing_aspect_scores_202612 PARTITION OF mecs.testing_aspect_scores FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- tester_applications 202601-202612
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202601 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202602 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202603 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202604 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202605 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202606 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202607 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202608 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202609 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202610 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202611 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.tester_applications_202612 PARTITION OF mecs.tester_applications FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- testing_tool_reservations 202601-202612
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202601 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202602 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202603 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202604 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202605 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202606 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202607 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202608 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202609 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202610 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202611 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_reservations_202612 PARTITION OF mecs.testing_tool_reservations FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- testing_tool_availabilities 202601-202612 (partitioned by created_at)
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202601 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202602 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202603 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202604 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202605 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202606 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202607 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202608 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202609 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202610 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202611 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_202612 PARTITION OF mecs.testing_tool_availabilities FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- testing_tool_availabilities_arc 2026 partitions
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202601 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202602 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202603 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202604 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202605 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202606 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202607 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202608 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202609 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202610 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202611 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_availabilities_arc_202612 PARTITION OF mecs.testing_tool_availabilities_arc FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- PostgreSQL database dump complete
--

\unrestrict 23uqhX7FdZh1i1TubpVodXXNRQUbLa31CZmxRCspKo0HKoRV08ZUEED2ifVK204









-- testing_results_arc 2026 partitions
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202601 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202602 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202603 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202604 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202605 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202606 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202607 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202608 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202609 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202610 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202611 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.testing_results_arc_202612 PARTITION OF mecs.testing_results_arc FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- testing_tool_transactions_arc 2026 partitions
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202601 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202602 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202603 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202604 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202605 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202606 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202607 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202608 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202609 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202610 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202611 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_arc_202612 PARTITION OF mecs.testing_tool_transactions_arc FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- testing_tool_transactions 2026 partitions
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202601 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202602 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202603 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202604 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202605 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202606 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202607 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202608 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202609 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202610 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202611 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS mecs.testing_tool_transactions_202612 PARTITION OF mecs.testing_tool_transactions FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');
