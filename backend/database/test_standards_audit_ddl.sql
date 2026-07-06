-- 1. Drop existing PK and column id (if still exists)
ALTER TABLE mecs.test_standards DROP CONSTRAINT IF EXISTS test_standards_pkey CASCADE;
ALTER TABLE mecs.test_standards DROP COLUMN IF EXISTS id;

-- 2. Set 'code' as the new Primary Key
ALTER TABLE mecs.test_standards ADD PRIMARY KEY (code);

-- 3. Add deleted_user column
ALTER TABLE mecs.test_standards ADD COLUMN IF NOT EXISTS deleted_user VARCHAR(30);

-- 4. Create history table hist_test_standards
-- Menggunakan code (VARCHAR) sebagai referensi (bukan numeric id)
CREATE TABLE IF NOT EXISTS mecs.hist_test_standards (
    id SERIAL PRIMARY KEY,
    ts_code_ref VARCHAR(5) REFERENCES mecs.test_standards(code),
    code VARCHAR(5),
    name VARCHAR(60),
    description VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 5. Buat index pada kolom ts_code_ref
CREATE INDEX IF NOT EXISTS idx_hist_test_standards_code ON mecs.hist_test_standards(ts_code_ref);
