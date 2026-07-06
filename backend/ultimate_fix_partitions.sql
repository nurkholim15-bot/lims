BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202601';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202601 RENAME TO asset_activity_logs_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202602';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202602 RENAME TO asset_activity_logs_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202603';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202603 RENAME TO asset_activity_logs_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202604';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202604 RENAME TO asset_activity_logs_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202605';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202605 RENAME TO asset_activity_logs_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202606';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202606 RENAME TO asset_activity_logs_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202607';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202607 RENAME TO asset_activity_logs_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202608';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202608 RENAME TO asset_activity_logs_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202609';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202609 RENAME TO asset_activity_logs_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202610';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202610 RENAME TO asset_activity_logs_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202611';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202611 RENAME TO asset_activity_logs_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs DETACH PARTITION lims.asset_activity_logs_202612';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_202612 RENAME TO asset_activity_logs_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202601';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202601 RENAME TO asset_handovers_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202602';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202602 RENAME TO asset_handovers_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202603';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202603 RENAME TO asset_handovers_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202604';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202604 RENAME TO asset_handovers_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202605';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202605 RENAME TO asset_handovers_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202606';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202606 RENAME TO asset_handovers_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202607';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202607 RENAME TO asset_handovers_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202608';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202608 RENAME TO asset_handovers_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202609';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202609 RENAME TO asset_handovers_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202610';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202610 RENAME TO asset_handovers_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202611';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202611 RENAME TO asset_handovers_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers DETACH PARTITION lims.asset_handovers_202612';
        EXECUTE 'ALTER TABLE lims.asset_handovers_202612 RENAME TO asset_handovers_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202601';
        EXECUTE 'ALTER TABLE lims.cash_advances_202601 RENAME TO cash_advances_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202602';
        EXECUTE 'ALTER TABLE lims.cash_advances_202602 RENAME TO cash_advances_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202603';
        EXECUTE 'ALTER TABLE lims.cash_advances_202603 RENAME TO cash_advances_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202604';
        EXECUTE 'ALTER TABLE lims.cash_advances_202604 RENAME TO cash_advances_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202605';
        EXECUTE 'ALTER TABLE lims.cash_advances_202605 RENAME TO cash_advances_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202606';
        EXECUTE 'ALTER TABLE lims.cash_advances_202606 RENAME TO cash_advances_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202607';
        EXECUTE 'ALTER TABLE lims.cash_advances_202607 RENAME TO cash_advances_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202608';
        EXECUTE 'ALTER TABLE lims.cash_advances_202608 RENAME TO cash_advances_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202609';
        EXECUTE 'ALTER TABLE lims.cash_advances_202609 RENAME TO cash_advances_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202610';
        EXECUTE 'ALTER TABLE lims.cash_advances_202610 RENAME TO cash_advances_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202611';
        EXECUTE 'ALTER TABLE lims.cash_advances_202611 RENAME TO cash_advances_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances DETACH PARTITION lims.cash_advances_202612';
        EXECUTE 'ALTER TABLE lims.cash_advances_202612 RENAME TO cash_advances_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202601';
        EXECUTE 'ALTER TABLE lims.invoices_202601 RENAME TO invoices_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202602';
        EXECUTE 'ALTER TABLE lims.invoices_202602 RENAME TO invoices_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202603';
        EXECUTE 'ALTER TABLE lims.invoices_202603 RENAME TO invoices_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202604';
        EXECUTE 'ALTER TABLE lims.invoices_202604 RENAME TO invoices_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202605';
        EXECUTE 'ALTER TABLE lims.invoices_202605 RENAME TO invoices_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202606';
        EXECUTE 'ALTER TABLE lims.invoices_202606 RENAME TO invoices_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202607';
        EXECUTE 'ALTER TABLE lims.invoices_202607 RENAME TO invoices_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202608';
        EXECUTE 'ALTER TABLE lims.invoices_202608 RENAME TO invoices_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202609';
        EXECUTE 'ALTER TABLE lims.invoices_202609 RENAME TO invoices_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202610';
        EXECUTE 'ALTER TABLE lims.invoices_202610 RENAME TO invoices_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202611';
        EXECUTE 'ALTER TABLE lims.invoices_202611 RENAME TO invoices_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices DETACH PARTITION lims.invoices_202612';
        EXECUTE 'ALTER TABLE lims.invoices_202612 RENAME TO invoices_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202601';
        EXECUTE 'ALTER TABLE lims.payments_202601 RENAME TO payments_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202602';
        EXECUTE 'ALTER TABLE lims.payments_202602 RENAME TO payments_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202603';
        EXECUTE 'ALTER TABLE lims.payments_202603 RENAME TO payments_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202604';
        EXECUTE 'ALTER TABLE lims.payments_202604 RENAME TO payments_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202605';
        EXECUTE 'ALTER TABLE lims.payments_202605 RENAME TO payments_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202606';
        EXECUTE 'ALTER TABLE lims.payments_202606 RENAME TO payments_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202607';
        EXECUTE 'ALTER TABLE lims.payments_202607 RENAME TO payments_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202608';
        EXECUTE 'ALTER TABLE lims.payments_202608 RENAME TO payments_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202609';
        EXECUTE 'ALTER TABLE lims.payments_202609 RENAME TO payments_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202610';
        EXECUTE 'ALTER TABLE lims.payments_202610 RENAME TO payments_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202611';
        EXECUTE 'ALTER TABLE lims.payments_202611 RENAME TO payments_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments DETACH PARTITION lims.payments_202612';
        EXECUTE 'ALTER TABLE lims.payments_202612 RENAME TO payments_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202601';
        EXECUTE 'ALTER TABLE lims.reimbursements_202601 RENAME TO reimbursements_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202602';
        EXECUTE 'ALTER TABLE lims.reimbursements_202602 RENAME TO reimbursements_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202603';
        EXECUTE 'ALTER TABLE lims.reimbursements_202603 RENAME TO reimbursements_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202604';
        EXECUTE 'ALTER TABLE lims.reimbursements_202604 RENAME TO reimbursements_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202605';
        EXECUTE 'ALTER TABLE lims.reimbursements_202605 RENAME TO reimbursements_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202606';
        EXECUTE 'ALTER TABLE lims.reimbursements_202606 RENAME TO reimbursements_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202607';
        EXECUTE 'ALTER TABLE lims.reimbursements_202607 RENAME TO reimbursements_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202608';
        EXECUTE 'ALTER TABLE lims.reimbursements_202608 RENAME TO reimbursements_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202609';
        EXECUTE 'ALTER TABLE lims.reimbursements_202609 RENAME TO reimbursements_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202610';
        EXECUTE 'ALTER TABLE lims.reimbursements_202610 RENAME TO reimbursements_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202611';
        EXECUTE 'ALTER TABLE lims.reimbursements_202611 RENAME TO reimbursements_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements DETACH PARTITION lims.reimbursements_202612';
        EXECUTE 'ALTER TABLE lims.reimbursements_202612 RENAME TO reimbursements_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202601';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202601 RENAME TO simulator_data_logs_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202602';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202602 RENAME TO simulator_data_logs_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202603';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202603 RENAME TO simulator_data_logs_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202604';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202604 RENAME TO simulator_data_logs_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202605';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202605 RENAME TO simulator_data_logs_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202606';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202606 RENAME TO simulator_data_logs_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202607';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202607 RENAME TO simulator_data_logs_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202608';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202608 RENAME TO simulator_data_logs_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202609';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202609 RENAME TO simulator_data_logs_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202610';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202610 RENAME TO simulator_data_logs_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202611';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202611 RENAME TO simulator_data_logs_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs DETACH PARTITION lims.simulator_data_logs_202612';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_202612 RENAME TO simulator_data_logs_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202601';
        EXECUTE 'ALTER TABLE lims.tester_applications_202601 RENAME TO tester_applications_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202602';
        EXECUTE 'ALTER TABLE lims.tester_applications_202602 RENAME TO tester_applications_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202603';
        EXECUTE 'ALTER TABLE lims.tester_applications_202603 RENAME TO tester_applications_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202604';
        EXECUTE 'ALTER TABLE lims.tester_applications_202604 RENAME TO tester_applications_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202605';
        EXECUTE 'ALTER TABLE lims.tester_applications_202605 RENAME TO tester_applications_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202606';
        EXECUTE 'ALTER TABLE lims.tester_applications_202606 RENAME TO tester_applications_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202607';
        EXECUTE 'ALTER TABLE lims.tester_applications_202607 RENAME TO tester_applications_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202608';
        EXECUTE 'ALTER TABLE lims.tester_applications_202608 RENAME TO tester_applications_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202609';
        EXECUTE 'ALTER TABLE lims.tester_applications_202609 RENAME TO tester_applications_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202610';
        EXECUTE 'ALTER TABLE lims.tester_applications_202610 RENAME TO tester_applications_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202611';
        EXECUTE 'ALTER TABLE lims.tester_applications_202611 RENAME TO tester_applications_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications DETACH PARTITION lims.tester_applications_202612';
        EXECUTE 'ALTER TABLE lims.tester_applications_202612 RENAME TO tester_applications_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202601';
        EXECUTE 'ALTER TABLE lims.testing_applications_202601 RENAME TO testing_applications_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202602';
        EXECUTE 'ALTER TABLE lims.testing_applications_202602 RENAME TO testing_applications_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202603';
        EXECUTE 'ALTER TABLE lims.testing_applications_202603 RENAME TO testing_applications_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202604';
        EXECUTE 'ALTER TABLE lims.testing_applications_202604 RENAME TO testing_applications_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202605';
        EXECUTE 'ALTER TABLE lims.testing_applications_202605 RENAME TO testing_applications_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202606';
        EXECUTE 'ALTER TABLE lims.testing_applications_202606 RENAME TO testing_applications_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202607';
        EXECUTE 'ALTER TABLE lims.testing_applications_202607 RENAME TO testing_applications_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202608';
        EXECUTE 'ALTER TABLE lims.testing_applications_202608 RENAME TO testing_applications_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202609';
        EXECUTE 'ALTER TABLE lims.testing_applications_202609 RENAME TO testing_applications_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202610';
        EXECUTE 'ALTER TABLE lims.testing_applications_202610 RENAME TO testing_applications_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202611';
        EXECUTE 'ALTER TABLE lims.testing_applications_202611 RENAME TO testing_applications_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications DETACH PARTITION lims.testing_applications_202612';
        EXECUTE 'ALTER TABLE lims.testing_applications_202612 RENAME TO testing_applications_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202601';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202601 RENAME TO testing_applications_audit_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202602';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202602 RENAME TO testing_applications_audit_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202603';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202603 RENAME TO testing_applications_audit_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202604';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202604 RENAME TO testing_applications_audit_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202605';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202605 RENAME TO testing_applications_audit_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202606';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202606 RENAME TO testing_applications_audit_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202607';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202607 RENAME TO testing_applications_audit_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202608';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202608 RENAME TO testing_applications_audit_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202609';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202609 RENAME TO testing_applications_audit_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202610';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202610 RENAME TO testing_applications_audit_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202611';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202611 RENAME TO testing_applications_audit_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit DETACH PARTITION lims.testing_applications_audit_202612';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_202612 RENAME TO testing_applications_audit_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202601';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202601 RENAME TO testing_aspect_scores_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202602';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202602 RENAME TO testing_aspect_scores_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202603';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202603 RENAME TO testing_aspect_scores_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202604';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202604 RENAME TO testing_aspect_scores_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202605';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202605 RENAME TO testing_aspect_scores_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202606';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202606 RENAME TO testing_aspect_scores_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202607';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202607 RENAME TO testing_aspect_scores_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202608';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202608 RENAME TO testing_aspect_scores_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202609';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202609 RENAME TO testing_aspect_scores_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202610';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202610 RENAME TO testing_aspect_scores_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202611';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202611 RENAME TO testing_aspect_scores_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores DETACH PARTITION lims.testing_aspect_scores_202612';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_202612 RENAME TO testing_aspect_scores_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202601';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202601 RENAME TO testing_equipments_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202602';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202602 RENAME TO testing_equipments_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202603';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202603 RENAME TO testing_equipments_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202604';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202604 RENAME TO testing_equipments_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202605';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202605 RENAME TO testing_equipments_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202606';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202606 RENAME TO testing_equipments_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202607';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202607 RENAME TO testing_equipments_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202608';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202608 RENAME TO testing_equipments_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202609';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202609 RENAME TO testing_equipments_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202610';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202610 RENAME TO testing_equipments_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202611';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202611 RENAME TO testing_equipments_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments DETACH PARTITION lims.testing_equipments_202612';
        EXECUTE 'ALTER TABLE lims.testing_equipments_202612 RENAME TO testing_equipments_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202601';
        EXECUTE 'ALTER TABLE lims.testing_plans_202601 RENAME TO testing_plans_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202602';
        EXECUTE 'ALTER TABLE lims.testing_plans_202602 RENAME TO testing_plans_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202603';
        EXECUTE 'ALTER TABLE lims.testing_plans_202603 RENAME TO testing_plans_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202604';
        EXECUTE 'ALTER TABLE lims.testing_plans_202604 RENAME TO testing_plans_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202605';
        EXECUTE 'ALTER TABLE lims.testing_plans_202605 RENAME TO testing_plans_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202606';
        EXECUTE 'ALTER TABLE lims.testing_plans_202606 RENAME TO testing_plans_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202607';
        EXECUTE 'ALTER TABLE lims.testing_plans_202607 RENAME TO testing_plans_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202608';
        EXECUTE 'ALTER TABLE lims.testing_plans_202608 RENAME TO testing_plans_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202609';
        EXECUTE 'ALTER TABLE lims.testing_plans_202609 RENAME TO testing_plans_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202610';
        EXECUTE 'ALTER TABLE lims.testing_plans_202610 RENAME TO testing_plans_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202611';
        EXECUTE 'ALTER TABLE lims.testing_plans_202611 RENAME TO testing_plans_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans DETACH PARTITION lims.testing_plans_202612';
        EXECUTE 'ALTER TABLE lims.testing_plans_202612 RENAME TO testing_plans_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202601';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202601 RENAME TO testing_pqc_ai_anomalies_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202602';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202602 RENAME TO testing_pqc_ai_anomalies_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202603';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202603 RENAME TO testing_pqc_ai_anomalies_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202604';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202604 RENAME TO testing_pqc_ai_anomalies_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202605';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202605 RENAME TO testing_pqc_ai_anomalies_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202606';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202606 RENAME TO testing_pqc_ai_anomalies_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202607';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202607 RENAME TO testing_pqc_ai_anomalies_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202608';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202608 RENAME TO testing_pqc_ai_anomalies_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202609';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202609 RENAME TO testing_pqc_ai_anomalies_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202610';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202610 RENAME TO testing_pqc_ai_anomalies_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202611';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202611 RENAME TO testing_pqc_ai_anomalies_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies DETACH PARTITION lims.testing_pqc_ai_anomalies_202612';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_202612 RENAME TO testing_pqc_ai_anomalies_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202601';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202601 RENAME TO testing_report_ais_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202602';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202602 RENAME TO testing_report_ais_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202603';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202603 RENAME TO testing_report_ais_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202604';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202604 RENAME TO testing_report_ais_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202605';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202605 RENAME TO testing_report_ais_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202606';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202606 RENAME TO testing_report_ais_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202607';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202607 RENAME TO testing_report_ais_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202608';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202608 RENAME TO testing_report_ais_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202609';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202609 RENAME TO testing_report_ais_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202610';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202610 RENAME TO testing_report_ais_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202611';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202611 RENAME TO testing_report_ais_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais DETACH PARTITION lims.testing_report_ais_202612';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_202612 RENAME TO testing_report_ais_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202601';
        EXECUTE 'ALTER TABLE lims.testing_results_202601 RENAME TO testing_results_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202602';
        EXECUTE 'ALTER TABLE lims.testing_results_202602 RENAME TO testing_results_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202603';
        EXECUTE 'ALTER TABLE lims.testing_results_202603 RENAME TO testing_results_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202604';
        EXECUTE 'ALTER TABLE lims.testing_results_202604 RENAME TO testing_results_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202605';
        EXECUTE 'ALTER TABLE lims.testing_results_202605 RENAME TO testing_results_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202606';
        EXECUTE 'ALTER TABLE lims.testing_results_202606 RENAME TO testing_results_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202607';
        EXECUTE 'ALTER TABLE lims.testing_results_202607 RENAME TO testing_results_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202608';
        EXECUTE 'ALTER TABLE lims.testing_results_202608 RENAME TO testing_results_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202609';
        EXECUTE 'ALTER TABLE lims.testing_results_202609 RENAME TO testing_results_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202610';
        EXECUTE 'ALTER TABLE lims.testing_results_202610 RENAME TO testing_results_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202611';
        EXECUTE 'ALTER TABLE lims.testing_results_202611 RENAME TO testing_results_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results DETACH PARTITION lims.testing_results_202612';
        EXECUTE 'ALTER TABLE lims.testing_results_202612 RENAME TO testing_results_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202601';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202601 RENAME TO testing_tool_availabilities_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202602';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202602 RENAME TO testing_tool_availabilities_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202603';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202603 RENAME TO testing_tool_availabilities_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202604';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202604 RENAME TO testing_tool_availabilities_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202605';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202605 RENAME TO testing_tool_availabilities_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202606';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202606 RENAME TO testing_tool_availabilities_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202607';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202607 RENAME TO testing_tool_availabilities_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202608';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202608 RENAME TO testing_tool_availabilities_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202609';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202609 RENAME TO testing_tool_availabilities_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202610';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202610 RENAME TO testing_tool_availabilities_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202611';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202611 RENAME TO testing_tool_availabilities_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities DETACH PARTITION lims.testing_tool_availabilities_202612';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_202612 RENAME TO testing_tool_availabilities_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202601';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202601 RENAME TO testing_tool_reservations_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202602';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202602 RENAME TO testing_tool_reservations_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202603';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202603 RENAME TO testing_tool_reservations_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202604';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202604 RENAME TO testing_tool_reservations_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202605';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202605 RENAME TO testing_tool_reservations_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202606';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202606 RENAME TO testing_tool_reservations_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202607';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202607 RENAME TO testing_tool_reservations_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202608';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202608 RENAME TO testing_tool_reservations_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202609';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202609 RENAME TO testing_tool_reservations_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202610';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202610 RENAME TO testing_tool_reservations_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202611';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202611 RENAME TO testing_tool_reservations_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations DETACH PARTITION lims.testing_tool_reservations_202612';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_202612 RENAME TO testing_tool_reservations_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202601';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202601 RENAME TO testing_tool_transactions_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202602';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202602 RENAME TO testing_tool_transactions_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202603';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202603 RENAME TO testing_tool_transactions_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202604';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202604 RENAME TO testing_tool_transactions_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202605';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202605 RENAME TO testing_tool_transactions_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202606';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202606 RENAME TO testing_tool_transactions_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202607';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202607 RENAME TO testing_tool_transactions_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202608';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202608 RENAME TO testing_tool_transactions_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202609';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202609 RENAME TO testing_tool_transactions_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202610';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202610 RENAME TO testing_tool_transactions_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202611';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202611 RENAME TO testing_tool_transactions_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions DETACH PARTITION lims.testing_tool_transactions_202612';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_202612 RENAME TO testing_tool_transactions_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202601';
        EXECUTE 'ALTER TABLE lims.travel_requests_202601 RENAME TO travel_requests_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202602';
        EXECUTE 'ALTER TABLE lims.travel_requests_202602 RENAME TO travel_requests_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202603';
        EXECUTE 'ALTER TABLE lims.travel_requests_202603 RENAME TO travel_requests_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202604';
        EXECUTE 'ALTER TABLE lims.travel_requests_202604 RENAME TO travel_requests_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202605';
        EXECUTE 'ALTER TABLE lims.travel_requests_202605 RENAME TO travel_requests_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202606';
        EXECUTE 'ALTER TABLE lims.travel_requests_202606 RENAME TO travel_requests_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202607';
        EXECUTE 'ALTER TABLE lims.travel_requests_202607 RENAME TO travel_requests_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202608';
        EXECUTE 'ALTER TABLE lims.travel_requests_202608 RENAME TO travel_requests_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202609';
        EXECUTE 'ALTER TABLE lims.travel_requests_202609 RENAME TO travel_requests_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202610';
        EXECUTE 'ALTER TABLE lims.travel_requests_202610 RENAME TO travel_requests_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202611';
        EXECUTE 'ALTER TABLE lims.travel_requests_202611 RENAME TO travel_requests_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests DETACH PARTITION lims.travel_requests_202612';
        EXECUTE 'ALTER TABLE lims.travel_requests_202612 RENAME TO travel_requests_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202601';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202601 RENAME TO asset_activity_logs_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202602';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202602 RENAME TO asset_activity_logs_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202603';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202603 RENAME TO asset_activity_logs_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202604';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202604 RENAME TO asset_activity_logs_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202605';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202605 RENAME TO asset_activity_logs_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202606';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202606 RENAME TO asset_activity_logs_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202607';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202607 RENAME TO asset_activity_logs_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202608';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202608 RENAME TO asset_activity_logs_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202609';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202609 RENAME TO asset_activity_logs_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202610';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202610 RENAME TO asset_activity_logs_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202611';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202611 RENAME TO asset_activity_logs_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc DETACH PARTITION lims.asset_activity_logs_arc_202612';
        EXECUTE 'ALTER TABLE lims.asset_activity_logs_arc_202612 RENAME TO asset_activity_logs_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202601';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202601 RENAME TO asset_handovers_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202602';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202602 RENAME TO asset_handovers_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202603';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202603 RENAME TO asset_handovers_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202604';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202604 RENAME TO asset_handovers_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202605';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202605 RENAME TO asset_handovers_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202606';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202606 RENAME TO asset_handovers_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202607';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202607 RENAME TO asset_handovers_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202608';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202608 RENAME TO asset_handovers_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202609';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202609 RENAME TO asset_handovers_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202610';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202610 RENAME TO asset_handovers_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202611';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202611 RENAME TO asset_handovers_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc DETACH PARTITION lims.asset_handovers_arc_202612';
        EXECUTE 'ALTER TABLE lims.asset_handovers_arc_202612 RENAME TO asset_handovers_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202601';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202601 RENAME TO cash_advances_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202602';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202602 RENAME TO cash_advances_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202603';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202603 RENAME TO cash_advances_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202604';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202604 RENAME TO cash_advances_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202605';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202605 RENAME TO cash_advances_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202606';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202606 RENAME TO cash_advances_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202607';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202607 RENAME TO cash_advances_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202608';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202608 RENAME TO cash_advances_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202609';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202609 RENAME TO cash_advances_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202610';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202610 RENAME TO cash_advances_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202611';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202611 RENAME TO cash_advances_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.cash_advances_arc DETACH PARTITION lims.cash_advances_arc_202612';
        EXECUTE 'ALTER TABLE lims.cash_advances_arc_202612 RENAME TO cash_advances_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202601';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202601 RENAME TO invoices_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202602';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202602 RENAME TO invoices_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202603';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202603 RENAME TO invoices_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202604';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202604 RENAME TO invoices_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202605';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202605 RENAME TO invoices_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202606';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202606 RENAME TO invoices_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202607';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202607 RENAME TO invoices_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202608';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202608 RENAME TO invoices_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202609';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202609 RENAME TO invoices_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202610';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202610 RENAME TO invoices_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202611';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202611 RENAME TO invoices_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.invoices_arc DETACH PARTITION lims.invoices_arc_202612';
        EXECUTE 'ALTER TABLE lims.invoices_arc_202612 RENAME TO invoices_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202601';
        EXECUTE 'ALTER TABLE lims.payments_arc_202601 RENAME TO payments_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202602';
        EXECUTE 'ALTER TABLE lims.payments_arc_202602 RENAME TO payments_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202603';
        EXECUTE 'ALTER TABLE lims.payments_arc_202603 RENAME TO payments_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202604';
        EXECUTE 'ALTER TABLE lims.payments_arc_202604 RENAME TO payments_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202605';
        EXECUTE 'ALTER TABLE lims.payments_arc_202605 RENAME TO payments_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202606';
        EXECUTE 'ALTER TABLE lims.payments_arc_202606 RENAME TO payments_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202607';
        EXECUTE 'ALTER TABLE lims.payments_arc_202607 RENAME TO payments_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202608';
        EXECUTE 'ALTER TABLE lims.payments_arc_202608 RENAME TO payments_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202609';
        EXECUTE 'ALTER TABLE lims.payments_arc_202609 RENAME TO payments_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202610';
        EXECUTE 'ALTER TABLE lims.payments_arc_202610 RENAME TO payments_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202611';
        EXECUTE 'ALTER TABLE lims.payments_arc_202611 RENAME TO payments_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.payments_arc DETACH PARTITION lims.payments_arc_202612';
        EXECUTE 'ALTER TABLE lims.payments_arc_202612 RENAME TO payments_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202601';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202601 RENAME TO reimbursements_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202602';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202602 RENAME TO reimbursements_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202603';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202603 RENAME TO reimbursements_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202604';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202604 RENAME TO reimbursements_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202605';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202605 RENAME TO reimbursements_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202606';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202606 RENAME TO reimbursements_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202607';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202607 RENAME TO reimbursements_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202608';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202608 RENAME TO reimbursements_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202609';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202609 RENAME TO reimbursements_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202610';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202610 RENAME TO reimbursements_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202611';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202611 RENAME TO reimbursements_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.reimbursements_arc DETACH PARTITION lims.reimbursements_arc_202612';
        EXECUTE 'ALTER TABLE lims.reimbursements_arc_202612 RENAME TO reimbursements_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202601';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202601 RENAME TO simulator_data_logs_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202602';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202602 RENAME TO simulator_data_logs_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202603';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202603 RENAME TO simulator_data_logs_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202604';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202604 RENAME TO simulator_data_logs_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202605';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202605 RENAME TO simulator_data_logs_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202606';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202606 RENAME TO simulator_data_logs_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202607';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202607 RENAME TO simulator_data_logs_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202608';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202608 RENAME TO simulator_data_logs_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202609';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202609 RENAME TO simulator_data_logs_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202610';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202610 RENAME TO simulator_data_logs_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202611';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202611 RENAME TO simulator_data_logs_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc DETACH PARTITION lims.simulator_data_logs_arc_202612';
        EXECUTE 'ALTER TABLE lims.simulator_data_logs_arc_202612 RENAME TO simulator_data_logs_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202601';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202601 RENAME TO tester_applications_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202602';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202602 RENAME TO tester_applications_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202603';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202603 RENAME TO tester_applications_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202604';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202604 RENAME TO tester_applications_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202605';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202605 RENAME TO tester_applications_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202606';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202606 RENAME TO tester_applications_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202607';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202607 RENAME TO tester_applications_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202608';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202608 RENAME TO tester_applications_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202609';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202609 RENAME TO tester_applications_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202610';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202610 RENAME TO tester_applications_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202611';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202611 RENAME TO tester_applications_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.tester_applications_arc DETACH PARTITION lims.tester_applications_arc_202612';
        EXECUTE 'ALTER TABLE lims.tester_applications_arc_202612 RENAME TO tester_applications_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202601';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202601 RENAME TO testing_applications_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202602';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202602 RENAME TO testing_applications_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202603';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202603 RENAME TO testing_applications_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202604';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202604 RENAME TO testing_applications_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202605';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202605 RENAME TO testing_applications_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202606';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202606 RENAME TO testing_applications_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202607';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202607 RENAME TO testing_applications_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202608';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202608 RENAME TO testing_applications_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202609';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202609 RENAME TO testing_applications_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202610';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202610 RENAME TO testing_applications_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202611';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202611 RENAME TO testing_applications_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_arc DETACH PARTITION lims.testing_applications_arc_202612';
        EXECUTE 'ALTER TABLE lims.testing_applications_arc_202612 RENAME TO testing_applications_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202601';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202601 RENAME TO testing_applications_audit_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202602';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202602 RENAME TO testing_applications_audit_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202603';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202603 RENAME TO testing_applications_audit_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202604';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202604 RENAME TO testing_applications_audit_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202605';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202605 RENAME TO testing_applications_audit_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202606';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202606 RENAME TO testing_applications_audit_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202607';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202607 RENAME TO testing_applications_audit_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202608';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202608 RENAME TO testing_applications_audit_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202609';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202609 RENAME TO testing_applications_audit_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202610';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202610 RENAME TO testing_applications_audit_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202611';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202611 RENAME TO testing_applications_audit_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc DETACH PARTITION lims.testing_applications_audit_arc_202612';
        EXECUTE 'ALTER TABLE lims.testing_applications_audit_arc_202612 RENAME TO testing_applications_audit_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202601';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202601 RENAME TO testing_aspect_scores_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202602';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202602 RENAME TO testing_aspect_scores_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202603';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202603 RENAME TO testing_aspect_scores_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202604';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202604 RENAME TO testing_aspect_scores_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202605';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202605 RENAME TO testing_aspect_scores_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202606';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202606 RENAME TO testing_aspect_scores_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202607';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202607 RENAME TO testing_aspect_scores_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202608';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202608 RENAME TO testing_aspect_scores_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202609';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202609 RENAME TO testing_aspect_scores_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202610';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202610 RENAME TO testing_aspect_scores_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202611';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202611 RENAME TO testing_aspect_scores_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc DETACH PARTITION lims.testing_aspect_scores_arc_202612';
        EXECUTE 'ALTER TABLE lims.testing_aspect_scores_arc_202612 RENAME TO testing_aspect_scores_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202601';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202601 RENAME TO testing_equipments_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202602';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202602 RENAME TO testing_equipments_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202603';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202603 RENAME TO testing_equipments_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202604';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202604 RENAME TO testing_equipments_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202605';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202605 RENAME TO testing_equipments_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202606';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202606 RENAME TO testing_equipments_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202607';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202607 RENAME TO testing_equipments_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202608';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202608 RENAME TO testing_equipments_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202609';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202609 RENAME TO testing_equipments_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202610';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202610 RENAME TO testing_equipments_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202611';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202611 RENAME TO testing_equipments_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc DETACH PARTITION lims.testing_equipments_arc_202612';
        EXECUTE 'ALTER TABLE lims.testing_equipments_arc_202612 RENAME TO testing_equipments_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202601';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202601 RENAME TO testing_plans_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202602';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202602 RENAME TO testing_plans_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202603';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202603 RENAME TO testing_plans_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202604';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202604 RENAME TO testing_plans_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202605';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202605 RENAME TO testing_plans_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202606';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202606 RENAME TO testing_plans_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202607';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202607 RENAME TO testing_plans_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202608';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202608 RENAME TO testing_plans_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202609';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202609 RENAME TO testing_plans_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202610';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202610 RENAME TO testing_plans_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202611';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202611 RENAME TO testing_plans_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_plans_arc DETACH PARTITION lims.testing_plans_arc_202612';
        EXECUTE 'ALTER TABLE lims.testing_plans_arc_202612 RENAME TO testing_plans_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202601';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202601 RENAME TO testing_pqc_ai_anomalies_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202602';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202602 RENAME TO testing_pqc_ai_anomalies_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202603';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202603 RENAME TO testing_pqc_ai_anomalies_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202604';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202604 RENAME TO testing_pqc_ai_anomalies_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202605';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202605 RENAME TO testing_pqc_ai_anomalies_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202606';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202606 RENAME TO testing_pqc_ai_anomalies_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202607';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202607 RENAME TO testing_pqc_ai_anomalies_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202608';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202608 RENAME TO testing_pqc_ai_anomalies_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202609';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202609 RENAME TO testing_pqc_ai_anomalies_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202610';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202610 RENAME TO testing_pqc_ai_anomalies_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202611';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202611 RENAME TO testing_pqc_ai_anomalies_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc DETACH PARTITION lims.testing_pqc_ai_anomalies_arc_202612';
        EXECUTE 'ALTER TABLE lims.testing_pqc_ai_anomalies_arc_202612 RENAME TO testing_pqc_ai_anomalies_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202601';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202601 RENAME TO testing_report_ais_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202602';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202602 RENAME TO testing_report_ais_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202603';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202603 RENAME TO testing_report_ais_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202604';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202604 RENAME TO testing_report_ais_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202605';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202605 RENAME TO testing_report_ais_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202606';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202606 RENAME TO testing_report_ais_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202607';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202607 RENAME TO testing_report_ais_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202608';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202608 RENAME TO testing_report_ais_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202609';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202609 RENAME TO testing_report_ais_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202610';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202610 RENAME TO testing_report_ais_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202611';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202611 RENAME TO testing_report_ais_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc DETACH PARTITION lims.testing_report_ais_arc_202612';
        EXECUTE 'ALTER TABLE lims.testing_report_ais_arc_202612 RENAME TO testing_report_ais_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202601';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202601 RENAME TO testing_results_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202602';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202602 RENAME TO testing_results_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202603';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202603 RENAME TO testing_results_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202604';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202604 RENAME TO testing_results_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202605';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202605 RENAME TO testing_results_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202606';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202606 RENAME TO testing_results_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202607';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202607 RENAME TO testing_results_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202608';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202608 RENAME TO testing_results_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202609';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202609 RENAME TO testing_results_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202610';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202610 RENAME TO testing_results_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202611';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202611 RENAME TO testing_results_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_results_arc DETACH PARTITION lims.testing_results_arc_202612';
        EXECUTE 'ALTER TABLE lims.testing_results_arc_202612 RENAME TO testing_results_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202601';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202601 RENAME TO testing_tool_availabilities_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202602';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202602 RENAME TO testing_tool_availabilities_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202603';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202603 RENAME TO testing_tool_availabilities_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202604';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202604 RENAME TO testing_tool_availabilities_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202605';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202605 RENAME TO testing_tool_availabilities_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202606';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202606 RENAME TO testing_tool_availabilities_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202607';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202607 RENAME TO testing_tool_availabilities_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202608';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202608 RENAME TO testing_tool_availabilities_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202609';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202609 RENAME TO testing_tool_availabilities_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202610';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202610 RENAME TO testing_tool_availabilities_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202611';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202611 RENAME TO testing_tool_availabilities_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc DETACH PARTITION lims.testing_tool_availabilities_arc_202612';
        EXECUTE 'ALTER TABLE lims.testing_tool_availabilities_arc_202612 RENAME TO testing_tool_availabilities_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202601';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202601 RENAME TO testing_tool_reservations_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202602';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202602 RENAME TO testing_tool_reservations_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202603';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202603 RENAME TO testing_tool_reservations_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202604';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202604 RENAME TO testing_tool_reservations_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202605';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202605 RENAME TO testing_tool_reservations_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202606';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202606 RENAME TO testing_tool_reservations_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202607';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202607 RENAME TO testing_tool_reservations_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202608';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202608 RENAME TO testing_tool_reservations_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202609';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202609 RENAME TO testing_tool_reservations_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202610';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202610 RENAME TO testing_tool_reservations_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202611';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202611 RENAME TO testing_tool_reservations_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc DETACH PARTITION lims.testing_tool_reservations_arc_202612';
        EXECUTE 'ALTER TABLE lims.testing_tool_reservations_arc_202612 RENAME TO testing_tool_reservations_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202601';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202601 RENAME TO testing_tool_transactions_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202602';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202602 RENAME TO testing_tool_transactions_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202603';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202603 RENAME TO testing_tool_transactions_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202604';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202604 RENAME TO testing_tool_transactions_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202605';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202605 RENAME TO testing_tool_transactions_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202606';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202606 RENAME TO testing_tool_transactions_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202607';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202607 RENAME TO testing_tool_transactions_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202608';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202608 RENAME TO testing_tool_transactions_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202609';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202609 RENAME TO testing_tool_transactions_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202610';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202610 RENAME TO testing_tool_transactions_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202611';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202611 RENAME TO testing_tool_transactions_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc DETACH PARTITION lims.testing_tool_transactions_arc_202612';
        EXECUTE 'ALTER TABLE lims.testing_tool_transactions_arc_202612 RENAME TO testing_tool_transactions_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202601') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202601';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202601 RENAME TO travel_requests_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202602') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202602';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202602 RENAME TO travel_requests_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202603') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202603';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202603 RENAME TO travel_requests_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202604') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202604';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202604 RENAME TO travel_requests_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202605') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202605';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202605 RENAME TO travel_requests_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202606') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202606';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202606 RENAME TO travel_requests_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202607') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202607';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202607 RENAME TO travel_requests_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202608') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202608';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202608 RENAME TO travel_requests_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202609') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202609';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202609 RENAME TO travel_requests_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202610') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202610';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202610 RENAME TO travel_requests_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202611') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202611';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202611 RENAME TO travel_requests_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202612') THEN
        -- Detach and rename
        EXECUTE 'ALTER TABLE lims.travel_requests_arc DETACH PARTITION lims.travel_requests_arc_202612';
        EXECUTE 'ALTER TABLE lims.travel_requests_arc_202612 RENAME TO travel_requests_arc_202612_old';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202601 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202601 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202601 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202601 PARTITION OF lims.invoices FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202601 PARTITION OF lims.payments FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202601 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202601 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202601 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202601 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202601 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202601 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202601 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202601 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202601 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202601 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202601 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202601 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202601 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202601 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202601 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202601 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202601 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202601 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202601 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202601 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202601 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202601 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202601 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202601 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202601 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202601 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202601 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202601 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202601 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202601 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202601 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202601 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202601 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202601 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202601 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202602 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202602 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202602 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202602 PARTITION OF lims.invoices FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202602 PARTITION OF lims.payments FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202602 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202602 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202602 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202602 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202602 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202602 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202602 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202602 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202602 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202602 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202602 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202602 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202602 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202602 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202602 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202602 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202602 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202602 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202602 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202602 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202602 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202602 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202602 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202602 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202602 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202602 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202602 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202602 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202602 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202602 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202602 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202602 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202602 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202602 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202602 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202603 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202603 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202603 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202603 PARTITION OF lims.invoices FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202603 PARTITION OF lims.payments FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202603 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202603 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202603 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202603 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202603 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202603 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202603 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202603 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202603 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202603 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202603 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202603 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202603 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202603 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202603 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202603 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202603 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202603 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202603 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202603 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202603 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202603 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202603 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202603 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202603 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202603 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202603 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202603 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202603 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202603 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202603 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202603 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202603 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202603 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202603 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202604 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202604 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202604 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202604 PARTITION OF lims.invoices FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202604 PARTITION OF lims.payments FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202604 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202604 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202604 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202604 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202604 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202604 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202604 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202604 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202604 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202604 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202604 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202604 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202604 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202604 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202604 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202604 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202604 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202604 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202604 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202604 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202604 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202604 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202604 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202604 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202604 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202604 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202604 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202604 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202604 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202604 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202604 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202604 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202604 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202604 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202604 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202605 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202605 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202605 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202605 PARTITION OF lims.invoices FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202605 PARTITION OF lims.payments FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202605 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202605 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202605 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202605 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202605 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202605 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202605 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202605 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202605 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202605 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202605 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202605 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202605 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202605 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202605 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202605 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202605 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202605 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202605 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202605 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202605 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202605 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202605 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202605 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202605 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202605 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202605 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202605 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202605 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202605 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202605 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202605 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202605 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202605 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202605 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202606 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202606 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202606 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202606 PARTITION OF lims.invoices FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202606 PARTITION OF lims.payments FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202606 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202606 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202606 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202606 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202606 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202606 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202606 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202606 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202606 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202606 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202606 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202606 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202606 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202606 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202606 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202606 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202606 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202606 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202606 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202606 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202606 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202606 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202606 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202606 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202606 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202606 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202606 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202606 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202606 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202606 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202606 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202606 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202606 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202606 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202606 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202607 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202607 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202607 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202607 PARTITION OF lims.invoices FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202607 PARTITION OF lims.payments FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202607 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202607 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202607 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202607 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202607 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202607 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202607 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202607 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202607 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202607 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202607 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202607 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202607 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202607 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202607 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202607 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202607 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202607 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202607 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202607 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202607 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202607 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202607 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202607 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202607 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202607 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202607 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202607 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202607 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202607 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202607 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202607 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202607 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202607 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202607 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202608 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202608 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202608 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202608 PARTITION OF lims.invoices FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202608 PARTITION OF lims.payments FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202608 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202608 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202608 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202608 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202608 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202608 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202608 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202608 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202608 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202608 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202608 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202608 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202608 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202608 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202608 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202608 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202608 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202608 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202608 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202608 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202608 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202608 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202608 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202608 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202608 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202608 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202608 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202608 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202608 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202608 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202608 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202608 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202608 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202608 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202608 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202609 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202609 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202609 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202609 PARTITION OF lims.invoices FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202609 PARTITION OF lims.payments FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202609 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202609 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202609 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202609 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202609 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202609 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202609 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202609 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202609 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202609 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202609 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202609 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202609 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202609 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202609 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202609 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202609 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202609 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202609 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202609 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202609 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202609 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202609 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202609 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202609 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202609 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202609 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202609 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202609 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202609 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202609 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202609 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202609 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202609 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202609 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202610 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202610 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202610 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202610 PARTITION OF lims.invoices FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202610 PARTITION OF lims.payments FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202610 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202610 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202610 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202610 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202610 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202610 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202610 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202610 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202610 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202610 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202610 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202610 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202610 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202610 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202610 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202610 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202610 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202610 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202610 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202610 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202610 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202610 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202610 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202610 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202610 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202610 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202610 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202610 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202610 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202610 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202610 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202610 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202610 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202610 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202610 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202611 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202611 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202611 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202611 PARTITION OF lims.invoices FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202611 PARTITION OF lims.payments FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202611 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202611 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202611 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202611 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202611 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202611 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202611 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202611 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202611 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202611 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202611 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202611 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202611 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202611 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202611 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202611 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202611 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202611 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202611 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202611 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202611 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202611 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202611 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202611 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202611 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202611 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202611 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202611 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202611 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202611 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202611 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202611 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202611 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202611 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202611 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202612 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202612 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202612 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202612 PARTITION OF lims.invoices FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202612 PARTITION OF lims.payments FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202612 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202612 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202612 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202612 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202612 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202612 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202612 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202612 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202612 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202612 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202612 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202612 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202612 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202612 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202612 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202612 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202612 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202612 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202612 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202612 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202612 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202612 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202612 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202612 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202612 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202612 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202612 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202612 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202612 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202612 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202612 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202612 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202612 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202612 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202612 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs SELECT * FROM lims.asset_activity_logs_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers SELECT * FROM lims.asset_handovers_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances SELECT * FROM lims.cash_advances_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices SELECT * FROM lims.invoices_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments SELECT * FROM lims.payments_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements SELECT * FROM lims.reimbursements_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs SELECT * FROM lims.simulator_data_logs_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications SELECT * FROM lims.tester_applications_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications SELECT * FROM lims.testing_applications_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit SELECT * FROM lims.testing_applications_audit_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores SELECT * FROM lims.testing_aspect_scores_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments SELECT * FROM lims.testing_equipments_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans SELECT * FROM lims.testing_plans_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies SELECT * FROM lims.testing_pqc_ai_anomalies_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais SELECT * FROM lims.testing_report_ais_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results SELECT * FROM lims.testing_results_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities SELECT * FROM lims.testing_tool_availabilities_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations SELECT * FROM lims.testing_tool_reservations_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions SELECT * FROM lims.testing_tool_transactions_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests SELECT * FROM lims.travel_requests_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_activity_logs_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_activity_logs_arc SELECT * FROM lims.asset_activity_logs_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_activity_logs_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'asset_handovers_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.asset_handovers_arc SELECT * FROM lims.asset_handovers_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.asset_handovers_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cash_advances_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.cash_advances_arc SELECT * FROM lims.cash_advances_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.cash_advances_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.invoices_arc SELECT * FROM lims.invoices_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.invoices_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.payments_arc SELECT * FROM lims.payments_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.payments_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reimbursements_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.reimbursements_arc SELECT * FROM lims.reimbursements_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.reimbursements_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'simulator_data_logs_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.simulator_data_logs_arc SELECT * FROM lims.simulator_data_logs_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.simulator_data_logs_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tester_applications_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.tester_applications_arc SELECT * FROM lims.tester_applications_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.tester_applications_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_arc SELECT * FROM lims.testing_applications_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_applications_audit_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_applications_audit_arc SELECT * FROM lims.testing_applications_audit_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_applications_audit_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_aspect_scores_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_aspect_scores_arc SELECT * FROM lims.testing_aspect_scores_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_aspect_scores_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_equipments_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_equipments_arc SELECT * FROM lims.testing_equipments_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_equipments_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_plans_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_plans_arc SELECT * FROM lims.testing_plans_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_plans_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_pqc_ai_anomalies_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_pqc_ai_anomalies_arc SELECT * FROM lims.testing_pqc_ai_anomalies_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_pqc_ai_anomalies_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_report_ais_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_report_ais_arc SELECT * FROM lims.testing_report_ais_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_report_ais_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_results_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_results_arc SELECT * FROM lims.testing_results_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_results_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_availabilities_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_availabilities_arc SELECT * FROM lims.testing_tool_availabilities_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_availabilities_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_reservations_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_reservations_arc SELECT * FROM lims.testing_tool_reservations_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_reservations_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'testing_tool_transactions_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.testing_tool_transactions_arc SELECT * FROM lims.testing_tool_transactions_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.testing_tool_transactions_arc_202612_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202601_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202601_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202601_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202602_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202602_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202602_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202603_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202603_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202603_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202604_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202604_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202604_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202605_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202605_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202605_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202606_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202606_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202606_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202607_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202607_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202607_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202608_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202608_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202608_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202609_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202609_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202609_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202610_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202610_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202610_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202611_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202611_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202611_old';
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'travel_requests_arc_202612_old') THEN
        -- Migrate data to the parent table (which routes to the new +07 partitions)
        EXECUTE 'INSERT INTO lims.travel_requests_arc SELECT * FROM lims.travel_requests_arc_202612_old';
        -- Drop the old detached table
        EXECUTE 'DROP TABLE lims.travel_requests_arc_202612_old';
    END IF;
END $$;

COMMIT;