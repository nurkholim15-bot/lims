-- 1. Modify methodologies table to include deleted_user
ALTER TABLE mecs.methodologies ADD COLUMN IF NOT EXISTS deleted_user VARCHAR(30);

-- 2. Create history table hist_methodologies
-- Menggunakan code (VARCHAR) sebagai referensi (bukan numeric id)
CREATE TABLE IF NOT EXISTS mecs.hist_methodologies (
    id SERIAL PRIMARY KEY,
    method_code_ref VARCHAR(5) REFERENCES mecs.methodologies(code),
    code VARCHAR(5),
    name VARCHAR(60),
    test_type_code VARCHAR(5),
    scoring_level_code CHAR(5),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 3. Buat index pada kolom method_code_ref
CREATE INDEX IF NOT EXISTS idx_hist_methodologies_code ON mecs.hist_methodologies(method_code_ref);
