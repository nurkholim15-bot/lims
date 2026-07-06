-- =====================================================================
-- SCRIPT MIGRASI TABEL PARTISI BULANAN: lims.ai_model_registry
-- PostgreSQL Database Partitioning (Monthly)
-- =====================================================================

-- 1. Ganti nama tabel lama sebagai cadangan (backup)
ALTER TABLE lims.ai_model_registry RENAME TO ai_model_registry_old;

-- 2. Hapus indeks lama yang menempel pada tabel lama
DROP INDEX IF EXISTS lims.idx_ai_model_registry_model_name;
DROP INDEX IF EXISTS lims.idx_ai_model_registry_status;
DROP INDEX IF EXISTS lims.idx_ai_model_registry_model_name_status;

-- 3. Buat tabel utama baru dengan skema partisi RANGE pada kolom 'trained_at'
-- Catatan: Kunci primer harus menyertakan kolom partisi (id, trained_at)
CREATE TABLE lims.ai_model_registry (
    id SERIAL,
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    accuracy_score NUMERIC(5, 4),
    f1_score NUMERIC(5, 4),
    trained_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    model_path VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    PRIMARY KEY (id, trained_at)
) PARTITION BY RANGE (trained_at);

-- 4. Buat sub-tabel partisi bulanan untuk Tahun 2026
CREATE TABLE lims.ai_model_registry_202601 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE lims.ai_model_registry_202602 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE lims.ai_model_registry_202603 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE lims.ai_model_registry_202604 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE lims.ai_model_registry_202605 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE lims.ai_model_registry_202606 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE lims.ai_model_registry_202607 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE lims.ai_model_registry_202608 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE lims.ai_model_registry_202609 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE lims.ai_model_registry_202610 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE lims.ai_model_registry_202611 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE lims.ai_model_registry_202612 PARTITION OF lims.ai_model_registry FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');

-- Partisi DEFAULT untuk menampung data sebelum 2026 atau setelah 2026
CREATE TABLE lims.ai_model_registry_default PARTITION OF lims.ai_model_registry DEFAULT;

-- 5. Migrasikan seluruh data historis dari tabel lama ke tabel baru
INSERT INTO lims.ai_model_registry (id, model_name, version, accuracy_score, f1_score, trained_at, model_path, status)
SELECT id, model_name, version, accuracy_score, f1_score, trained_at, model_path, status 
FROM lims.ai_model_registry_old;

-- 6. Sinkronkan nilai sequence AUTO_INCREMENT (SERIAL) dengan ID terbesar yang telah disalin
SELECT setval('lims.ai_model_registry_id_seq', COALESCE((SELECT MAX(id) FROM lims.ai_model_registry), 1), true);

-- 7. Buat kembali indeks performa pada tabel utama baru
-- Indeks ini akan otomatis dibuat ulang pada setiap sub-tabel partisi
CREATE INDEX idx_ai_model_registry_model_name ON lims.ai_model_registry (model_name);
CREATE INDEX idx_ai_model_registry_status ON lims.ai_model_registry (status);
CREATE INDEX idx_ai_model_registry_model_name_status ON lims.ai_model_registry (model_name, status);

-- 8. [PILIHAN] Jalankan jika migrasi data dipastikan telah sukses 100%
-- DROP TABLE lims.ai_model_registry_old;
