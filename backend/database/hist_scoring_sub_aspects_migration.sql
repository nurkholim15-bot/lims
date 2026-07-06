-- 1. Tambahkan field deleted_user pada table scoring_sub_aspects
ALTER TABLE scoring_sub_aspects ADD COLUMN IF NOT EXISTS deleted_user varchar(30);

-- 2. Buat table history hist_scoring_sub_aspects
CREATE TABLE IF NOT EXISTS hist_scoring_sub_aspects (
    id bigserial PRIMARY KEY,
    ssa_id varchar(5) NOT NULL,
    code varchar(5),
    name varchar(100),
    aspect_code varchar(50),
    description varchar(255),
    weight numeric,
    is_simulator boolean,
    is_active boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user varchar(30),
    updated_user varchar(30),
    deleted_user varchar(30)
);

-- 3. Buat index kolom ssa_id
CREATE INDEX IF NOT EXISTS idx_hist_scoring_sub_aspects_ssa_id ON hist_scoring_sub_aspects(ssa_id);
