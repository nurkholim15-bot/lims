-- 1. Modify material_categories table to include deleted_user
ALTER TABLE mecs.material_categories ADD COLUMN IF NOT EXISTS deleted_user VARCHAR(30);

-- 2. Create history table hist_material_categories
-- Menggunakan code (VARCHAR) sebagai referensi (bukan numeric id)
CREATE TABLE IF NOT EXISTS mecs.hist_material_categories (
    id SERIAL PRIMARY KEY,
    mc_code_ref VARCHAR(5) REFERENCES mecs.material_categories(code),
    code VARCHAR(5),
    name VARCHAR(60),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 3. Buat index pada kolom mc_code_ref
CREATE INDEX IF NOT EXISTS idx_hist_material_categories_code ON mecs.hist_material_categories(mc_code_ref);
