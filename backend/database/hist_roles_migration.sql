-- 1. Tambahkan kolom deleted_user ke tabel roles
ALTER TABLE mecs.roles ADD COLUMN IF NOT EXISTS deleted_user VARCHAR(30);

-- 2. Buat tabel histori hist_roles
CREATE TABLE IF NOT EXISTS mecs.hist_roles (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    name VARCHAR(40),
    description VARCHAR(60),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 3. Buat index pada kolom role_id
CREATE INDEX IF NOT EXISTS idx_hist_roles_role_id ON mecs.hist_roles(role_id);
