-- 1. Modify cities table to include deleted_user (Sudah ada di model, tapi pastikan di DB)
ALTER TABLE mecs.cities ADD COLUMN IF NOT EXISTS deleted_user VARCHAR(30);

-- 2. Create history table hist_cities
-- Menggunakan city_code (VARCHAR) sebagai referensi (bukan numeric id)
CREATE TABLE IF NOT EXISTS mecs.hist_cities (
    id SERIAL PRIMARY KEY,
    city_code_ref VARCHAR(5) REFERENCES mecs.cities(city_code),
    city_code VARCHAR(5),
    city_name VARCHAR(60),
    province_code VARCHAR(5),
    gmt_offset INT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 3. Buat index pada kolom city_code_ref
CREATE INDEX IF NOT EXISTS idx_hist_cities_code ON mecs.hist_cities(city_code_ref);
