-- 1. Modify variants table to include deleted_user
ALTER TABLE mecs.variants ADD COLUMN IF NOT EXISTS deleted_user VARCHAR(30);

-- 2. Create history table hist_variants
-- Menggunakan code (VARCHAR) sebagai referensi (bukan numeric id)
CREATE TABLE IF NOT EXISTS mecs.hist_variants (
    id SERIAL PRIMARY KEY,
    variant_code_ref VARCHAR(5) REFERENCES mecs.variants(code),
    code VARCHAR(5),
    name VARCHAR(60),
    model_code VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 3. Buat index pada kolom variant_code_ref
CREATE INDEX IF NOT EXISTS idx_hist_variants_code ON mecs.hist_variants(variant_code_ref);
