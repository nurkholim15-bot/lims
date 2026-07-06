-- 1. Modify applicant_types table to include deleted_user
ALTER TABLE mecs.applicant_types ADD COLUMN IF NOT EXISTS deleted_user VARCHAR(30);

-- 2. Create history table hist_applicant_types
-- Menggunakan code (VARCHAR) sebagai referensi (bukan numeric id)
CREATE TABLE IF NOT EXISTS mecs.hist_applicant_types (
    id SERIAL PRIMARY KEY,
    app_type_code_ref VARCHAR(5) REFERENCES mecs.applicant_types(code),
    code VARCHAR(5),
    name VARCHAR(60),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 3. Buat index pada kolom app_type_code_ref
CREATE INDEX IF NOT EXISTS idx_hist_applicant_types_code ON mecs.hist_applicant_types(app_type_code_ref);
