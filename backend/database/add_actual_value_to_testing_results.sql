-- =========================================================================================
-- MIGRATION SCRIPT: Penambahan Kolom actual_value pada tabel testing_results
-- Database: PostgreSQL (Schema: lims)
-- Deskripsi:
-- 1. DDL: Menambahkan kolom actual_value bertipe NUMERIC(15, 4) pada partitioned table
--         lims.testing_results dan lims.testing_results_arc.
-- 2. DML: Melakukan backfill data historis dari kolom score ke actual_value.
-- 3. DDL: Membuat B-Tree index pada kolom actual_value untuk optimasi pencarian & analitik.
-- =========================================================================================

-- -----------------------------------------------------------------------------------------
-- 1. DDL: Tambahkan Kolom actual_value pada Tabel Induk
-- (PostgreSQL versi 11+ otomatis menyebarkan kolom ini ke seluruh partisi anak)
-- -----------------------------------------------------------------------------------------
ALTER TABLE lims.testing_results 
ADD COLUMN IF NOT EXISTS actual_value NUMERIC(15, 4);

ALTER TABLE lims.testing_results_arc 
ADD COLUMN IF NOT EXISTS actual_value NUMERIC(15, 4);

-- -----------------------------------------------------------------------------------------
-- 2. DML: Backfill Data Historis (Agar Data Lama Tetap Konsisten)
-- -----------------------------------------------------------------------------------------
UPDATE lims.testing_results 
SET actual_value = score 
WHERE actual_value IS NULL;

UPDATE lims.testing_results_arc 
SET actual_value = score 
WHERE actual_value IS NULL;

-- -----------------------------------------------------------------------------------------
-- 3. DDL: Pembuatan Index untuk Pencarian & Analisis Cepat
-- -----------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_testing_results_actual_value 
ON lims.testing_results (actual_value);

CREATE INDEX IF NOT EXISTS idx_testing_results_arc_actual_value 
ON lims.testing_results_arc (actual_value);

-- Selesai
