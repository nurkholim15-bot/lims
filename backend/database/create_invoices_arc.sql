-- DDL for invoices_arc table and its partitions

CREATE TABLE IF NOT EXISTS invoices_arc (
    id BIGINT,
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
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Example Partitions for the archive table
-- Partisi Invoices Arc Mei 2026
CREATE TABLE IF NOT EXISTS invoices_arc_202605 PARTITION OF invoices_arc
    FOR VALUES FROM ('2026-05-01 00:00:00') TO ('2026-06-01 00:00:00');

-- Partisi Invoices Arc Juni 2026
CREATE TABLE IF NOT EXISTS invoices_arc_202606 PARTITION OF invoices_arc
    FOR VALUES FROM ('2026-06-01 00:00:00') TO ('2026-07-01 00:00:00');

