-- 1. Tambahkan field deleted_user pada table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_user varchar(30);

-- 2. Buat table history hist_users
CREATE TABLE IF NOT EXISTS hist_users (
    id bigserial PRIMARY KEY,
    user_id bigint NOT NULL,
    username varchar(30),
    password varchar(225),
    email varchar(30),
    phone varchar(30),
    role_id bigint,
    last_pwd_change timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_user varchar(30),
    updated_user varchar(30),
    deleted_at timestamp with time zone,
    deleted_user varchar(30)
);

-- 3. Buat index kolom user_id
CREATE INDEX IF NOT EXISTS idx_hist_users_user_id ON hist_users(user_id);
