-- 1. Tabel provinces sudah memiliki field deleted_user (jika belum, jalankan ini)
-- ALTER TABLE "provinces" ADD COLUMN "deleted_user" varchar(30);

-- 2. Buat table history hist_provinces
CREATE TABLE "hist_provinces" (
    "id" SERIAL PRIMARY KEY,
    "province_code_ref" varchar(5),
    "province_code" varchar(5),
    "province_name" varchar(60),
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "created_user" varchar(30),
    "updated_user" varchar(30),
    "deleted_user" varchar(30)
);

-- 3. Buat index pada kolom province_code_ref
CREATE INDEX "idx_hist_provinces_province_code_ref" ON "hist_provinces" ("province_code_ref");
