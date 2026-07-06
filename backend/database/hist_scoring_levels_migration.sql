-- 1. Tambahkan audit fields pada table scoring_levels
ALTER TABLE scoring_levels 
ADD COLUMN IF NOT EXISTS created_user varchar(30),
ADD COLUMN IF NOT EXISTS updated_user varchar(30),
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deleted_user varchar(30);

-- 2. Buat table history hist_scoring_levels
CREATE TABLE IF NOT EXISTS hist_scoring_levels (
    id bigserial PRIMARY KEY,
    sl_id bigint NOT NULL,
    level_group_code char(5),
    min_score numeric,
    max_score numeric,
    label varchar(100),
    description varchar(255),
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user varchar(30),
    updated_user varchar(30),
    deleted_at timestamp with time zone,
    deleted_user varchar(30)
);

-- 3. Buat index kolom sl_id
CREATE INDEX IF NOT EXISTS idx_hist_scoring_levels_sl_id ON hist_scoring_levels(sl_id);
