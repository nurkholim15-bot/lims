-- 1. Tambah kolom user_agent dan last_activity_at di tabel lims.user_sessions
ALTER TABLE lims.user_sessions ADD COLUMN IF NOT EXISTS user_agent VARCHAR(255) DEFAULT NULL;
ALTER TABLE lims.user_sessions ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- 2. Tambah kolom is_active dan idle_timeout_minutes di tabel lims.users & lims.hist_users
ALTER TABLE lims.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE lims.users ADD COLUMN IF NOT EXISTS idle_timeout_minutes INT DEFAULT NULL;

ALTER TABLE lims.hist_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE lims.hist_users ADD COLUMN IF NOT EXISTS idle_timeout_minutes INT DEFAULT NULL;

-- 3. Membuat tabel penyimpanan OTP sementara di schema lims
CREATE TABLE IF NOT EXISTS lims.otp_codes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES lims.users(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Index untuk mempercepat query pencocokan OTP
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_code ON lims.otp_codes(user_id, code);

-- 4. Pengisian Parameter Global (DML) ke tabel lims.global_parameters
-- A. Parameter untuk mengaktifkan Single-Session (true/false)
INSERT INTO lims.global_parameters (param_key, param_value, description, created_at, updated_at, created_user, updated_user)
VALUES (
    'SINGLE_SESSION_MODE', 
    'false', 
    'Menentukan apakah user hanya boleh memiliki satu sesi aktif (true) atau multi sesi (false).', 
    NOW(), NOW(), 'SYSTEM', 'SYSTEM'
) ON CONFLICT (param_key) DO UPDATE SET description = EXCLUDED.description;

-- B. Parameter untuk mengizinkan pengambilalihan sesi/force login (true/false)
INSERT INTO lims.global_parameters (param_key, param_value, description, created_at, updated_at, created_user, updated_user)
VALUES (
    'ALLOW_SESSION_TAKEOVER', 
    'true', 
    'Mengizinkan user mengambil alih sesi aktif lainnya saat login kembali jika bernilai true.', 
    NOW(), NOW(), 'SYSTEM', 'SYSTEM'
) ON CONFLICT (param_key) DO UPDATE SET description = EXCLUDED.description;

-- C. Parameter untuk waktu idle global default (dalam menit)
INSERT INTO lims.global_parameters (param_key, param_value, description, created_at, updated_at, created_user, updated_user)
VALUES (
    'DEFAULT_IDLE_TIMEOUT_MINUTES', 
    '30', 
    'Batas waktu idle sistem default dalam menit sebelum sesi ditutup otomatis.', 
    NOW(), NOW(), 'SYSTEM', 'SYSTEM'
) ON CONFLICT (param_key) DO UPDATE SET description = EXCLUDED.description;

-- D. Parameter Batas Maksimal Percobaan Login Salah
INSERT INTO lims.global_parameters (param_key, param_value, description, created_at, updated_at, created_user, updated_user)
VALUES (
    'LOGIN_MAX_ATTEMPTS', 
    '5', 
    'Jumlah maksimal percobaan login salah sebelum akun dikunci sementara.', 
    NOW(), NOW(), 'SYSTEM', 'SYSTEM'
) ON CONFLICT (param_key) DO UPDATE SET description = EXCLUDED.description;

-- E. Parameter Durasi Waktu Akun Dikunci (Menit)
INSERT INTO lims.global_parameters (param_key, param_value, description, created_at, updated_at, created_user, updated_user)
VALUES (
    'LOGIN_LOCKOUT_MINUTES', 
    '15', 
    'Durasi waktu (dalam menit) akun dikunci akibat salah password berturut-turut.', 
    NOW(), NOW(), 'SYSTEM', 'SYSTEM'
) ON CONFLICT (param_key) DO UPDATE SET description = EXCLUDED.description;
