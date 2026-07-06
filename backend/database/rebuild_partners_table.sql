-- Migration script to rebuild partners, hist_partners, and update related tables
-- Goal: 
-- 1. Add ID as technical PK, remove Code in partners
-- 2. Add index for name in partners
-- 3. Update testing_applications and asset_handovers to use partner_id

BEGIN;

-- 1. Backup existing data
CREATE TEMP TABLE partners_backup AS SELECT * FROM partners;
CREATE TEMP TABLE hist_partners_backup AS SELECT * FROM hist_partners;

-- 2. Drop existing tables
DROP TABLE IF EXISTS hist_partners;
DROP TABLE IF EXISTS partners;

-- 3. Create new partners table
CREATE TABLE partners (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    type_code VARCHAR(5),
    alamat VARCHAR(225),
    city_code VARCHAR(5),
    pic_name VARCHAR(60),
    pic_email VARCHAR(40),
    pic_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_user VARCHAR(30)
);

-- 4. Migrate data to partners
INSERT INTO partners (
    name, type_code, alamat, city_code, pic_name, pic_email, pic_phone,
    created_at, updated_at, deleted_at, created_user, updated_user, deleted_user
)
SELECT 
    name, type_code, alamat, city_code, pic_name, pic_email, pic_phone,
    created_at, updated_at, deleted_at, created_user, updated_user, deleted_user
FROM partners_backup;

-- 5. Create indexes for partners
CREATE INDEX idx_partners_name ON partners(name);

-- 6. Create new hist_partners table
CREATE TABLE hist_partners (
    id BIGSERIAL PRIMARY KEY,
    partner_id BIGINT,
    name VARCHAR(60),
    type_code VARCHAR(5),
    alamat VARCHAR(225),
    city_code VARCHAR(5),
    pic_name VARCHAR(60),
    pic_email VARCHAR(40),
    pic_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_user VARCHAR(30)
);

-- 7. Migrate data to hist_partners
INSERT INTO hist_partners (
    partner_id, name, type_code, alamat, city_code, pic_name, pic_email, pic_phone,
    created_at, updated_at, created_user, updated_user, deleted_user
)
SELECT 
    p.id as partner_id, h.name, h.type_code, h.alamat, h.city_code, h.pic_name, h.pic_email, h.pic_phone,
    h.created_at, h.updated_at, h.created_user, h.updated_user, h.deleted_user
FROM hist_partners_backup h
LEFT JOIN partners p ON h.name = p.name;

CREATE INDEX idx_hist_partners_partner_id ON hist_partners(partner_id);

-- 8. Update testing_applications
ALTER TABLE testing_applications ADD COLUMN IF NOT EXISTS partner_id BIGINT;
UPDATE testing_applications t
SET partner_id = p_new.id
FROM partners_backup p_old
JOIN partners p_new ON p_old.name = p_new.name
WHERE t.partner_code = p_old.code;
ALTER TABLE testing_applications DROP COLUMN IF EXISTS partner_code;
CREATE INDEX IF NOT EXISTS idx_testing_applications_partner_id ON testing_applications(partner_id);

-- 9. Update asset_handovers
-- Check if table exists (handled by partitions usually but we check main)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'asset_handovers') THEN
        ALTER TABLE asset_handovers ADD COLUMN IF NOT EXISTS partner_id BIGINT;
        UPDATE asset_handovers h
        SET partner_id = p_new.id
        FROM partners_backup p_old
        JOIN partners p_new ON p_old.name = p_new.name
        WHERE h.partner_code = p_old.code;
        ALTER TABLE asset_handovers DROP COLUMN IF EXISTS partner_code;
        CREATE INDEX IF NOT EXISTS idx_asset_handovers_partner_id ON asset_handovers(partner_id);
    END IF;
END $$;

COMMIT;
