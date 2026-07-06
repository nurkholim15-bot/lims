-- 1. Modify locations table to include deleted_user (Sudah ada di model, tapi pastikan di DB)
ALTER TABLE mecs.locations ADD COLUMN IF NOT EXISTS deleted_user VARCHAR(30);

-- 2. Create history table hist_locations
-- Menggunakan code (VARCHAR) sebagai referensi (bukan numeric id)
CREATE TABLE IF NOT EXISTS mecs.hist_locations (
    id SERIAL PRIMARY KEY,
    location_code_ref VARCHAR(5) REFERENCES mecs.locations(code),
    code VARCHAR(5),
    name VARCHAR(60),
    test_type_code VARCHAR(5),
    city_code VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 3. Buat index pada kolom location_code_ref
CREATE INDEX IF NOT EXISTS idx_hist_locations_code ON mecs.hist_locations(location_code_ref);
