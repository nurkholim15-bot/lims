-- 1. Tambah field deleted_user ke table partners
ALTER TABLE "partners" ADD COLUMN "deleted_user" varchar(30);

-- 2. Buat table history hist_partners
CREATE TABLE "hist_partners" (
    "id" SERIAL PRIMARY KEY,
    "partner_code" varchar(5),
    "code" varchar(5),
    "name" varchar(60),
    "type_code" varchar(5),
    "category_code" varchar(5),
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "created_user" varchar(30),
    "updated_user" varchar(30),
    "deleted_user" varchar(30)
);

-- 3. Buat index pada kolom partner_code
CREATE INDEX "idx_hist_partners_partner_code" ON "hist_partners" ("partner_code");
