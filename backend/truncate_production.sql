-- =================================================================================
-- SCRIPT TRUNCATE TRANSAKSIONAL (PERSIAPAN GO-LIVE PRODUCTION)
-- =================================================================================
-- Script ini HANYA menghapus riwayat transaksi/testing yang dibuat selama masa trial/dev.
-- Master data seperti User, Role, Parameter, Brand, dan Aspek akan TETAP AMAN.
-- =================================================================================

-- 1. MENGHAPUS SEMUA DATA TRANSAKSIONAL (TABEL UTAMA & PARTISI TERKAIT)
-- Menggunakan RESTART IDENTITY untuk mengembalikan ID (Auto Increment) kembali ke 1.
-- Menggunakan CASCADE untuk otomatis menghapus semua Foreign Key anak jika terhubung.
TRUNCATE TABLE 
    lims.testing_applications,
    lims.testing_applications_audit,
    lims.testing_plans,
    lims.testing_aspect_scores,
    lims.tester_applications,
    lims.testing_equipments,
    lims.testing_report_ais,
    lims.testing_pqc_ai_anomalies,
    lims.testing_results,
    lims.travel_requests,
    lims.reimbursements,
    lims.cash_advances,
    lims.invoices,
    lims.payments,
    lims.asset_handovers,
    lims.asset_activity_logs,
    lims.testing_tool_availabilities,
    lims.testing_tool_reservations,
    lims.testing_tool_transactions,
    lims.user_activity_logs,
    lims.simulator_data_logs,
    
    -- [MASTER DATA TAMBAHAN YANG IKUT DI-TRUNCATE KARENA BUKAN DATA RIIL]
    lims.testing_tools,
    lims.master_asset_statuses,
    lims.brands,
    lims.variants,
    lims.master_testers,
    lims.test_types,
    lims.cities,
    lims.locations,
    lims.methodologies,
    lims.partner_types,
    lims.status_applications,
    lims.scoring_aspects,
    lims.scoring_sub_aspects,
    lims.scoring_sub_aspect_items,
    lims.scoring_levels,
    lims.ocr_score_mappings
RESTART IDENTITY CASCADE;


-- 2. MENGHAPUS DATA ARSIP (ARC) JIKA SEBELUMNYA SUDAH ADA
TRUNCATE TABLE 
    lims.testing_applications_arc,
    lims.testing_applications_audit_arc,
    lims.testing_plans_arc,
    lims.testing_aspect_scores_arc,
    lims.tester_applications_arc,
    lims.testing_equipments_arc,
    lims.testing_report_ais_arc,
    lims.testing_pqc_ai_anomalies_arc,
    lims.testing_results_arc,
    lims.travel_requests_arc,
    lims.reimbursements_arc,
    lims.cash_advances_arc,
    lims.invoices_arc,
    lims.payments_arc,
    lims.asset_handovers_arc,
    lims.asset_activity_logs_arc,
    lims.testing_tool_availabilities_arc,
    lims.testing_tool_reservations_arc,
    lims.testing_tool_transactions_arc,
    lims.user_activity_logs_arc,
    lims.simulator_data_logs_arc,
    
    -- [ARSIP MASTER DATA/HISTORY TAMBAHAN YANG IKUT DI-TRUNCATE]
    lims.hist_brands,
    lims.hist_variants,
    lims.hist_master_testers,
    lims.hist_test_types,
    lims.hist_cities,
    lims.hist_locations,
    lims.hist_methodologies,
    lims.hist_partner_types,
    lims.hist_status_applications,
    lims.hist_master_asset_statuses,
    lims.hist_package_active_aspects,
    lims.hist_package_active_sub_aspects
RESTART IDENTITY CASCADE;


-- 3. ME-RESET NOMOR URUT / SURAT OTOMATIS
-- Tabel ini menyimpan angka penomoran dokumen pendaftaran, perjalanan dinas, dsb.
-- Dikosongkan agar di hari pertama Production, pendaftaran dimulai dari No: ...0001
TRUNCATE TABLE 
    lims.registrations_counters,
    lims.reimbursement_counters,
    lims.travel_request_counters,
    lims.cash_advance_counters
RESTART IDENTITY CASCADE;


-- =================================================================================
-- DAFTAR DATA SISTEM INTI YANG DIPERTAHANKAN / DITRANSFER KE PRODUCTION
-- (TIDAK MASUK DALAM TRUNCATE DI ATAS)
-- =================================================================================
/*
    Data Akses & Konfigurasi: 
    - users
    - roles
    - role_menus
    - menus
    - global_parameters
    - otp_codes
    
    (Dan seluruh tabel history "hist_*" yang terkait dengan tabel konfigurasi di atas).
    
    Tabel-tabel di atas otomatis TERBAWA dan AMAN karena tidak masuk dalam daftar TRUNCATE.
*/
