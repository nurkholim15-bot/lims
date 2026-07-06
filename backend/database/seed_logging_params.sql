-- Script untuk inisialisasi parameter logging di global_parameters
-- Jalankan di database PostgreSQL Anda

INSERT INTO mecs.global_parameters (param_key, param_value, description) VALUES 
('API_LOG_PATH', 'D:/MECS/logs/api_traffic.log', 'Path untuk log trafik API (Req/Res)'),
('DB_LOG_PATH', 'D:/MECS/logs/db_query.log', 'Path untuk log Query SQL'),
('TRACE_LEVEL', '1', 'Level detail log API (1: High, 2: Med, 3: Low)')
ON CONFLICT (param_key) DO UPDATE SET 
    param_value = EXCLUDED.param_value,
    description = EXCLUDED.description;
