-- =============================================================
-- SCRIPT DDL: AUDIT TRAIL MASTER TESTERS (TANPA KOLOM ID)
-- =============================================================

-- 1. Modifikasi tabel master_testers
-- Menambahkan kolom updated_at, updated_user, dan deleted_user
ALTER TABLE mecs.master_testers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE mecs.master_testers ADD COLUMN IF NOT EXISTS updated_user VARCHAR(30);
ALTER TABLE mecs.master_testers ADD COLUMN IF NOT EXISTS deleted_user VARCHAR(30);

-- 2. Buat tabel history hist_master_testers
-- Menggunakan tester_id (CHAR(5)) sebagai referensi utama (bukan numeric id)
CREATE TABLE IF NOT EXISTS mecs.hist_master_testers (
    id SERIAL PRIMARY KEY,
    tester_id_ref CHAR(5) REFERENCES mecs.master_testers(tester_id),
    tester_id CHAR(5),
    name VARCHAR(60),
    position VARCHAR(20),
    methodology_code CHAR(5),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 3. Buat index kolom tester_id_ref
CREATE INDEX IF NOT EXISTS idx_hist_master_testers_ref ON mecs.hist_master_testers(tester_id_ref);
