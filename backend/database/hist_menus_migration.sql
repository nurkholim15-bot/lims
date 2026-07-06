-- 1. Tambahkan field deleted_user pada table menus
ALTER TABLE menus ADD COLUMN IF NOT EXISTS deleted_user varchar(30);

-- 2. Buat table history hist_menus
CREATE TABLE IF NOT EXISTS hist_menus (
    id bigserial PRIMARY KEY,
    menu_id bigint NOT NULL,
    parent_id bigint,
    title varchar(50),
    icon varchar(40),
    path varchar(60),
    "order" integer,
    is_password boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user varchar(30),
    updated_user varchar(30),
    deleted_at timestamp with time zone,
    deleted_user varchar(30)
);

-- 3. Buat index kolom menu_id
CREATE INDEX IF NOT EXISTS idx_hist_menus_menu_id ON hist_menus(menu_id);
