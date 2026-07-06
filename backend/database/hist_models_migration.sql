-- 1. Tambah field deleted_user ke table models
ALTER TABLE "models" ADD COLUMN "deleted_user" varchar(30);

-- 2. Buat table history hist_models
CREATE TABLE "hist_models" (
    "id" SERIAL PRIMARY KEY,
    "model_code" varchar(5),
    "code" varchar(5),
    "name" varchar(60),
    "brand_code" varchar(5),
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "created_user" varchar(30),
    "updated_user" varchar(30),
    "deleted_user" varchar(30)
);

-- 3. Buat index pada kolom model_code
CREATE INDEX "idx_hist_models_model_code" ON "hist_models" ("model_code");
