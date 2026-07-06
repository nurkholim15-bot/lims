-- DDL for payments_arc table and its partitions

CREATE TABLE IF NOT EXISTS payments_arc (
    id BIGINT,
    invoice_id BIGINT,
    payment_date TIMESTAMP NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(30),
    evidence_path VARCHAR(225),
    notes TEXT,
    created_user VARCHAR(30),
    PRIMARY KEY (id, payment_date)
) PARTITION BY RANGE (payment_date);

-- Example Partitions for the archive table
-- Partisi Payments Arc Mei 2026
CREATE TABLE IF NOT EXISTS payments_arc_202605 PARTITION OF payments_arc
    FOR VALUES FROM ('2026-05-01 00:00:00') TO ('2026-06-01 00:00:00');

-- Partisi Payments Arc Juni 2026
CREATE TABLE IF NOT EXISTS payments_arc_202606 PARTITION OF payments_arc
    FOR VALUES FROM ('2026-06-01 00:00:00') TO ('2026-07-01 00:00:00');
