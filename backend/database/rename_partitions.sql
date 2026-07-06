-- DDL untuk memperbaiki penamaan tabel partisi (rename table)
-- Pastikan dijalankan di schema yang sesuai (default: lims atau public)

DO $$ 
BEGIN 
    -- Rename tabel payments_yYYYYmMM menjadi payments_YYYYMM
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'lims' AND table_name = 'payments_y2026m06') THEN
        ALTER TABLE lims.payments_y2026m06 RENAME TO payments_202606;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments_y2026m06') THEN
        ALTER TABLE public.payments_y2026m06 RENAME TO payments_202606;
    END IF;

    -- Rename tabel invoices_yYYYYmMM menjadi invoices_YYYYMM (jika ada)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'lims' AND table_name = 'invoices_y2026m06') THEN
        ALTER TABLE lims.invoices_y2026m06 RENAME TO invoices_202606;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices_y2026m06') THEN
        ALTER TABLE public.invoices_y2026m06 RENAME TO invoices_202606;
    END IF;
END $$;
