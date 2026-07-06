-- 1. Modify test_types table to include deleted_user
ALTER TABLE mecs.test_types ADD COLUMN IF NOT EXISTS deleted_user VARCHAR(30);

-- 2. Create history table hist_test_types
-- Using test_type_code (referencing test_types.code) instead of id
CREATE TABLE IF NOT EXISTS mecs.hist_test_types (
    id SERIAL PRIMARY KEY,
    test_type_code VARCHAR(5) REFERENCES mecs.test_types(code),
    code VARCHAR(5),
    name VARCHAR(60),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 3. Create index for test_type_code in history table
CREATE INDEX IF NOT EXISTS idx_hist_test_types_code ON mecs.hist_test_types(test_type_code);
