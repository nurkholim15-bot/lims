-- 1. Tambah field deleted_user ke table origins
ALTER TABLE "origins" ADD COLUMN "deleted_user" varchar(30);

-- 2. Buat table history hist_origins
CREATE TABLE "hist_origins" (
    "id" SERIAL PRIMARY KEY,
    "origin_code" varchar(5),
    "code" varchar(5),
    "name" varchar(60),
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "created_user" varchar(30),
    "updated_user" varchar(30),
    "deleted_user" varchar(30)
);

-- 3. Buat index pada kolom origin_code
CREATE INDEX "idx_hist_origins_origin_code" ON "hist_origins" ("origin_code");
