-- 1. Add deleted_at and deleted_user to master_testers
ALTER TABLE master_testers ADD COLUMN deleted_at timestamp with time zone;
ALTER TABLE master_testers ADD COLUMN deleted_user varchar(30);
ALTER TABLE master_testers ADD COLUMN updated_at timestamp with time zone;
ALTER TABLE master_testers ADD COLUMN updated_user varchar(30);

-- 2. Create hist_master_testers table
CREATE TABLE hist_master_testers (
    id bigserial PRIMARY KEY,
    mt_id char(5) NOT NULL, -- mt_id refers to tester_id in master_testers
    name varchar(60) NOT NULL,
    position varchar(20),
    methodology_code char(5),
    created_at timestamp with time zone,
    created_user varchar(30),
    updated_at timestamp with time zone,
    updated_user varchar(30),
    deleted_at timestamp with time zone,
    deleted_user varchar(30)
);

-- 3. Create index on mt_id
CREATE INDEX idx_hist_master_testers_mt_id ON hist_master_testers(mt_id);
