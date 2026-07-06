-- ======================================================================
-- SCRIPT UNTUK MENGUBAH testing_report_ais_arc MENJADI TABEL PARTISI
-- ======================================================================

BEGIN;

-- 1. Ganti nama tabel lama (yang bukan partisi) sebagai backup (jika sudah ada data)
ALTER TABLE IF EXISTS lims.testing_report_ais_arc RENAME TO testing_report_ais_arc_old;
ALTER INDEX IF EXISTS lims.testing_report_ais_arc_pkey RENAME TO testing_report_ais_arc_old_pkey;
ALTER INDEX IF EXISTS lims.idx_testing_report_ais_arc_application_id RENAME TO idx_testing_report_ais_arc_old_application_id;

-- 2. Buat ulang tabel testing_report_ais_arc dengan spesifikasi PARTITION BY RANGE
CREATE TABLE lims.testing_report_ais_arc (
    id bigint not null,
    application_id bigint not null,
    report_ai text,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone,
    created_user character varying(30),
    updated_user character varying(30),
    deleted_at timestamp with time zone,
    deleted_user character varying(30)
) PARTITION BY RANGE (created_at);

-- 3. Tambahkan Primary Key (Perlu menyertakan kunci partisi yaitu created_at)
ALTER TABLE lims.testing_report_ais_arc ADD CONSTRAINT testing_report_ais_arc_pkey PRIMARY KEY (id, created_at);

-- 4. Tambahkan Index untuk mempercepat query
CREATE INDEX idx_testing_report_ais_arc_application_id ON lims.testing_report_ais_arc USING btree (application_id);

-- (Opsional) 5. Pindahkan data dari tabel lama ke tabel partisi jika sebelumnya sudah ada datanya
-- Jika tabel _old ada dan memiliki record, Anda bisa mengeksekusi INSERT INTO ... SELECT ini
-- Pastikan partisi bulanan sudah dibuat terlebih dahulu (lewat script generate_partitions_2026.sql atau fitur SYNC)
-- INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_old;

COMMIT;
