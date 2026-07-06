-- ==========================================
-- MIGRATION: TESTING PACKAGES & BILLING
-- ==========================================

-- 1. Tabel Master Paket
CREATE TABLE IF NOT EXISTS testing_packages (
    id SERIAL PRIMARY KEY,
    package_code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price NUMERIC(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_user VARCHAR(30),
    updated_user VARCHAR(30)
);

-- 2. Tabel Hubungan Paket ke Metodologi (Many-to-Many)
CREATE TABLE IF NOT EXISTS package_methodologies (
    package_id INT REFERENCES testing_packages(id) ON DELETE CASCADE,
    methodology_code VARCHAR(5) REFERENCES methodologies(code) ON DELETE CASCADE,
    PRIMARY KEY (package_id, methodology_code)
);

-- 3. Update Tabel Metodologi (Tambahkan Harga Individu)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='methodologies' AND column_name='price') THEN
        ALTER TABLE methodologies ADD COLUMN price NUMERIC(15, 2) DEFAULT 0;
    END IF;
END $$;

-- 4. Update Tabel Testing Applications (Hubungkan ke Paket)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testing_applications' AND column_name='package_id') THEN
        ALTER TABLE testing_applications ADD COLUMN package_id INT REFERENCES testing_packages(id);
    END IF;
END $$;

-- 5. Tabel Invoice (Partitioned by Month)
CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL,
    application_id BIGINT,
    invoice_number VARCHAR(50) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    discount_amount NUMERIC(15, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    final_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'UNPAID',
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_user VARCHAR(30),
    PRIMARY KEY (id, created_at),
    UNIQUE (invoice_number, created_at)
) PARTITION BY RANGE (created_at);

-- Partisi Invoices Mei 2026
CREATE TABLE IF NOT EXISTS invoices_202605 PARTITION OF invoices
    FOR VALUES FROM ('2026-05-01 00:00:00') TO ('2026-06-01 00:00:00');

-- Partisi Invoices Juni 2026
CREATE TABLE IF NOT EXISTS invoices_202606 PARTITION OF invoices
    FOR VALUES FROM ('2026-06-01 00:00:00') TO ('2026-07-01 00:00:00');

-- 6. Tabel Pembayaran (Partitioned by Month)
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL,
    invoice_id BIGINT,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(30),
    evidence_path VARCHAR(225),
    notes TEXT,
    created_user VARCHAR(30),
    PRIMARY KEY (id, payment_date)
) PARTITION BY RANGE (payment_date);

-- Partisi Payments Mei 2026
CREATE TABLE IF NOT EXISTS payments_y2026m05 PARTITION OF payments
    FOR VALUES FROM ('2026-05-01 00:00:00') TO ('2026-06-01 00:00:00');

-- Partisi Payments Juni 2026
CREATE TABLE IF NOT EXISTS payments_y2026m06 PARTITION OF payments
    FOR VALUES FROM ('2026-06-01 00:00:00') TO ('2026-07-01 00:00:00');

-- 7. Tabel Riwayat Paket
CREATE TABLE IF NOT EXISTS hist_testing_packages (
    id SERIAL PRIMARY KEY,
    tp_id INT,
    package_code VARCHAR(10),
    name VARCHAR(100),
    description TEXT,
    base_price NUMERIC(15, 2),
    action_type VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_user VARCHAR(30)
);
