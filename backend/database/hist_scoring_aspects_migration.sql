-- 1. Tambahkan field deleted_user pada table scoring_aspects
ALTER TABLE scoring_aspects ADD COLUMN IF NOT EXISTS deleted_user varchar(30);

-- 2. Buat table history hist_scoring_aspects
CREATE TABLE IF NOT EXISTS hist_scoring_aspects (
    id bigserial PRIMARY KEY,
    sa_id varchar(50) NOT NULL,
    code varchar(50),
    name varchar(100),
    description varchar(255),
    weight numeric,
    threshold numeric,
    methodology_code varchar(5),
    test_type_code varchar(5),
    is_active boolean,
    is_used boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user varchar(30),
    updated_user varchar(30),
    deleted_user varchar(30)
);

-- 3. Buat index kolom sa_id
CREATE INDEX IF NOT EXISTS idx_hist_scoring_aspects_sa_id ON hist_scoring_aspects(sa_id);
