-- 1. Modify brands table to include deleted_user
ALTER TABLE mecs.brands ADD COLUMN IF NOT EXISTS deleted_user VARCHAR(30);

-- 2. Create history table hist_brands
-- Menggunakan code (VARCHAR) sebagai referensi (bukan numeric id)
CREATE TABLE IF NOT EXISTS mecs.hist_brands (
    id SERIAL PRIMARY KEY,
    brand_code_ref VARCHAR(5) REFERENCES mecs.brands(code),
    code VARCHAR(5),
    name VARCHAR(60),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 3. Buat index pada kolom brand_code_ref
CREATE INDEX IF NOT EXISTS idx_hist_brands_code ON mecs.hist_brands(brand_code_ref);
