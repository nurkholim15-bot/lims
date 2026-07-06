-- Script untuk mengecek ketersediaan partisi tahunan (Jan-Des)
-- Input: mecs.CheckQueue
-- Output: mecs.Listpartisi

DO $$ 
DECLARE 
    -- INPUT: Tentukan tahun yang ingin dicek di sini
    target_year TEXT := '2026'; 
    
    rec_table RECORD;
    partition_name TEXT;
    month_suffix TEXT;
    is_exists BOOLEAN;
BEGIN
    -- 1. Siapkan tabel input jika belum ada
    CREATE TABLE IF NOT EXISTS mecs.CheckQueue (
        table_name TEXT PRIMARY KEY
    );

    -- 2. Siapkan tabel output
    CREATE TABLE IF NOT EXISTS mecs.Listpartisi (
        TableName TEXT,
        Partition TEXT,
        Available CHAR(1)
    );
    
    -- Bersihkan hasil pencatatan sebelumnya
    TRUNCATE mecs.Listpartisi;

    -- 3. Loop melalui setiap tabel di mecs.CheckQueue
    FOR rec_table IN SELECT table_name FROM mecs.CheckQueue LOOP
        
        -- 4. Loop bulan 01 sampai 12
        FOR m IN 1..12 LOOP
            month_suffix := to_char(m, 'FM00');
            partition_name := rec_table.table_name || '_' || target_year || month_suffix;
            
            -- Cek apakah tabel partisi tersebut ada di database
            SELECT EXISTS (
                SELECT 1 
                FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'mecs' AND c.relname = partition_name
            ) INTO is_exists;
            
            -- 5. Masukkan hasil ke tabel Listpartisi
            INSERT INTO mecs.Listpartisi (TableName, Partition, Available)
            VALUES (
                rec_table.table_name, 
                partition_name, 
                CASE WHEN is_exists THEN 'Y' ELSE 'N' END
            );
        END LOOP;
        
    END LOOP;
    
    RAISE NOTICE 'Pengecekan selesai untuk tahun %. Saldo hasil di mecs.Listpartisi', target_year;
END $$;
