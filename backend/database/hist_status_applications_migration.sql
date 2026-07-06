-- 1. Update table status_applications dengan field audit
ALTER TABLE "status_applications" 
ADD COLUMN "updated_at" timestamp with time zone,
ADD COLUMN "updated_user" varchar(30),
ADD COLUMN "deleted_at" timestamp with time zone,
ADD COLUMN "deleted_user" varchar(30);

-- 2. Buat table history hist_status_applications
CREATE TABLE "hist_status_applications" (
    "id" SERIAL PRIMARY KEY,
    "status_code" char(15),
    "desc" varchar(60),
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "created_user" varchar(30),
    "updated_user" varchar(30),
    "deleted_user" varchar(30)
);

-- 3. Buat index pada kolom status_code
CREATE INDEX "idx_hist_status_applications_status_code" ON "hist_status_applications" ("status_code");

-- 4. Buat function trigger untuk audit trail
CREATE OR REPLACE FUNCTION status_applications_audit_func()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO "hist_status_applications" (
            "status_code", "desc", "created_at", "updated_at", 
            "created_user", "updated_user"
        )
        VALUES (
            OLD."status_code", OLD."desc", OLD."created_at", NOW(), 
            OLD."created_user", CURRENT_USER
        );
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO "hist_status_applications" (
            "status_code", "desc", "created_at", "updated_at", "deleted_at",
            "created_user", "updated_user", "deleted_user"
        )
        VALUES (
            OLD."status_code", OLD."desc", OLD."created_at", OLD."updated_at", NOW(),
            OLD."created_user", OLD."updated_user", CURRENT_USER
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. Buat trigger pada table status_applications
CREATE TRIGGER trg_status_applications_audit
BEFORE UPDATE OR DELETE ON "status_applications"
FOR EACH ROW EXECUTE FUNCTION status_applications_audit_func();
