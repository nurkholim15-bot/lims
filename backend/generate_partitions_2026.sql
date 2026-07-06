-- ==========================================
-- PARTISI BULAN 01/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202601 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202601 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202601 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202601 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202601 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202601 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202601 PARTITION OF lims.invoices FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202601 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202601 PARTITION OF lims.payments FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202601 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202601 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202601 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202601 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202601 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202601 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202601 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202601 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202601 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202601 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202601 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202601 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202601 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202601 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202601 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202601 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202601 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202601 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202601 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202601 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202601 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202601 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202601 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202601 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202601 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202601 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202601 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202601 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202601 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202601 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202601 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-01-01 00:00:00+07') TO ('2026-02-01 00:00:00+07');


-- ==========================================
-- PARTISI BULAN 02/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202602 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202602 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202602 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202602 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202602 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202602 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202602 PARTITION OF lims.invoices FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202602 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202602 PARTITION OF lims.payments FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202602 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202602 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202602 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202602 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202602 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202602 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202602 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202602 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202602 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202602 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202602 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202602 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202602 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202602 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202602 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202602 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202602 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202602 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202602 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202602 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202602 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202602 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202602 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202602 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202602 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202602 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202602 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202602 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202602 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202602 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202602 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-02-01 00:00:00+07') TO ('2026-03-01 00:00:00+07');


-- ==========================================
-- PARTISI BULAN 03/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202603 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202603 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202603 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202603 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202603 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202603 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202603 PARTITION OF lims.invoices FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202603 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202603 PARTITION OF lims.payments FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202603 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202603 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202603 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202603 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202603 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202603 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202603 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202603 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202603 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202603 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202603 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202603 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202603 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202603 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202603 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202603 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202603 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202603 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202603 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202603 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202603 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202603 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202603 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202603 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202603 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202603 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202603 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202603 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202603 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202603 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202603 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-03-01 00:00:00+07') TO ('2026-04-01 00:00:00+07');


-- ==========================================
-- PARTISI BULAN 04/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202604 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202604 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202604 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202604 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202604 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202604 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202604 PARTITION OF lims.invoices FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202604 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202604 PARTITION OF lims.payments FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202604 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202604 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202604 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202604 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202604 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202604 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202604 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202604 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202604 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202604 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202604 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202604 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202604 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202604 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202604 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202604 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202604 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202604 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202604 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202604 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202604 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202604 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202604 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202604 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202604 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202604 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202604 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202604 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202604 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202604 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202604 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-04-01 00:00:00+07') TO ('2026-05-01 00:00:00+07');


-- ==========================================
-- PARTISI BULAN 05/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202605 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202605 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202605 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202605 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202605 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202605 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202605 PARTITION OF lims.invoices FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202605 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202605 PARTITION OF lims.payments FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202605 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202605 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202605 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202605 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202605 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202605 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202605 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202605 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202605 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202605 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202605 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202605 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202605 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202605 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202605 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202605 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202605 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202605 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202605 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202605 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202605 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202605 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202605 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202605 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202605 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202605 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202605 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202605 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202605 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202605 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202605 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-05-01 00:00:00+07') TO ('2026-06-01 00:00:00+07');


-- ==========================================
-- PARTISI BULAN 06/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202606 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202606 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202606 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202606 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202606 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202606 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202606 PARTITION OF lims.invoices FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202606 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202606 PARTITION OF lims.payments FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202606 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202606 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202606 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202606 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202606 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202606 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202606 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202606 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202606 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202606 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202606 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202606 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202606 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202606 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202606 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202606 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202606 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202606 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202606 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202606 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202606 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202606 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202606 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202606 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202606 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202606 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202606 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202606 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202606 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202606 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202606 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-06-01 00:00:00+07') TO ('2026-07-01 00:00:00+07');


-- ==========================================
-- PARTISI BULAN 07/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202607 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202607 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202607 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202607 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202607 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202607 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202607 PARTITION OF lims.invoices FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202607 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202607 PARTITION OF lims.payments FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202607 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202607 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202607 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202607 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202607 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202607 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202607 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202607 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202607 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202607 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202607 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202607 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202607 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202607 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202607 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202607 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202607 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202607 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202607 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202607 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202607 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202607 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202607 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202607 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202607 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202607 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202607 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202607 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202607 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202607 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202607 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-07-01 00:00:00+07') TO ('2026-08-01 00:00:00+07');


-- ==========================================
-- PARTISI BULAN 08/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202608 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202608 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202608 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202608 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202608 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202608 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202608 PARTITION OF lims.invoices FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202608 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202608 PARTITION OF lims.payments FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202608 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202608 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202608 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202608 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202608 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202608 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202608 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202608 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202608 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202608 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202608 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202608 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202608 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202608 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202608 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202608 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202608 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202608 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202608 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202608 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202608 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202608 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202608 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202608 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202608 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202608 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202608 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202608 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202608 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202608 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202608 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-08-01 00:00:00+07') TO ('2026-09-01 00:00:00+07');


-- ==========================================
-- PARTISI BULAN 09/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202609 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202609 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202609 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202609 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202609 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202609 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202609 PARTITION OF lims.invoices FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202609 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202609 PARTITION OF lims.payments FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202609 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202609 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202609 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202609 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202609 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202609 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202609 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202609 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202609 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202609 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202609 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202609 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202609 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202609 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202609 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202609 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202609 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202609 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202609 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202609 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202609 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202609 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202609 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202609 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202609 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202609 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202609 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202609 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202609 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202609 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202609 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-09-01 00:00:00+07') TO ('2026-10-01 00:00:00+07');


-- ==========================================
-- PARTISI BULAN 10/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202610 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202610 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202610 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202610 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202610 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202610 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202610 PARTITION OF lims.invoices FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202610 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202610 PARTITION OF lims.payments FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202610 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202610 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202610 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202610 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202610 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202610 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202610 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202610 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202610 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202610 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202610 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202610 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202610 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202610 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202610 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202610 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202610 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202610 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202610 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202610 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202610 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202610 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202610 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202610 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202610 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202610 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202610 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202610 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202610 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202610 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202610 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-10-01 00:00:00+07') TO ('2026-11-01 00:00:00+07');


-- ==========================================
-- PARTISI BULAN 11/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202611 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202611 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202611 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202611 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202611 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202611 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202611 PARTITION OF lims.invoices FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202611 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202611 PARTITION OF lims.payments FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202611 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202611 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202611 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202611 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202611 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202611 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202611 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202611 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202611 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202611 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202611 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202611 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202611 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202611 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202611 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202611 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202611 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202611 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202611 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202611 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202611 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202611 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202611 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202611 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202611 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202611 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202611 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202611 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202611 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202611 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202611 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-11-01 00:00:00+07') TO ('2026-12-01 00:00:00+07');


-- ==========================================
-- PARTISI BULAN 12/2026 (Waktu Lokal / +07)
-- ==========================================

CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_202612 PARTITION OF lims.asset_activity_logs FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_activity_logs_arc_202612 PARTITION OF lims.asset_activity_logs_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_202612 PARTITION OF lims.asset_handovers FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.asset_handovers_arc_202612 PARTITION OF lims.asset_handovers_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_202612 PARTITION OF lims.cash_advances FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.cash_advances_arc_202612 PARTITION OF lims.cash_advances_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_202612 PARTITION OF lims.invoices FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.invoices_arc_202612 PARTITION OF lims.invoices_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_202612 PARTITION OF lims.payments FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.payments_arc_202612 PARTITION OF lims.payments_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_202612 PARTITION OF lims.reimbursements FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.reimbursements_arc_202612 PARTITION OF lims.reimbursements_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_202612 PARTITION OF lims.simulator_data_logs FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.simulator_data_logs_arc_202612 PARTITION OF lims.simulator_data_logs_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_202612 PARTITION OF lims.tester_applications FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.tester_applications_arc_202612 PARTITION OF lims.tester_applications_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_202612 PARTITION OF lims.testing_applications FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_arc_202612 PARTITION OF lims.testing_applications_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_202612 PARTITION OF lims.testing_applications_audit FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_applications_audit_arc_202612 PARTITION OF lims.testing_applications_audit_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_202612 PARTITION OF lims.testing_aspect_scores FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_aspect_scores_arc_202612 PARTITION OF lims.testing_aspect_scores_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_202612 PARTITION OF lims.testing_equipments FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_equipments_arc_202612 PARTITION OF lims.testing_equipments_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_202612 PARTITION OF lims.testing_plans FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_plans_arc_202612 PARTITION OF lims.testing_plans_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_202612 PARTITION OF lims.testing_pqc_ai_anomalies FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_pqc_ai_anomalies_arc_202612 PARTITION OF lims.testing_pqc_ai_anomalies_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_202612 PARTITION OF lims.testing_report_ais FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_report_ais_arc_202612 PARTITION OF lims.testing_report_ais_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_202612 PARTITION OF lims.testing_results FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_results_arc_202612 PARTITION OF lims.testing_results_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_202612 PARTITION OF lims.testing_tool_availabilities FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_availabilities_arc_202612 PARTITION OF lims.testing_tool_availabilities_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_202612 PARTITION OF lims.testing_tool_reservations FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_reservations_arc_202612 PARTITION OF lims.testing_tool_reservations_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_202612 PARTITION OF lims.testing_tool_transactions FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.testing_tool_transactions_arc_202612 PARTITION OF lims.testing_tool_transactions_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_202612 PARTITION OF lims.travel_requests FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');
CREATE TABLE IF NOT EXISTS lims.travel_requests_arc_202612 PARTITION OF lims.travel_requests_arc FOR VALUES FROM ('2026-12-01 00:00:00+07') TO ('2027-01-01 00:00:00+07');

