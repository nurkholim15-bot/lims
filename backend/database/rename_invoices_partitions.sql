-- Migration script to rename invoices partitions to standard YYYYMM format

-- 1. Rename partition for May 2026
ALTER TABLE IF EXISTS invoices_y2026m05 RENAME TO invoices_202605;

-- 2. Rename partition for June 2026
ALTER TABLE IF EXISTS invoices_y2026m06 RENAME TO invoices_202606;

-- Notes: 
-- Because we are only renaming the tables, no DML (Data Manipulation Language) 
-- is required. The data inside these partitions remains completely intact, 
-- and PostgreSQL automatically updates the inheritance registry.
