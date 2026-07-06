-- 1. Tambah field audit ke table user_sessions (Hard Delete Mode)
-- Hanya menambahkan created_user, updated_at, dan updated_user.
-- deleted_at dan deleted_user dihapus karena menggunakan hard delete (record langsung hilang).
ALTER TABLE "user_sessions" 
ADD COLUMN "created_user" varchar(30),
ADD COLUMN "updated_at" timestamp with time zone,
ADD COLUMN "updated_user" varchar(30);

-- 2. Pastikan tidak ada index deleted_at jika sebelumnya sudah dibuat
-- DROP INDEX IF EXISTS "idx_user_sessions_deleted_at";
