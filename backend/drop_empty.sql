DO $$
DECLARE
    rec RECORD;
    cnt INTEGER;
BEGIN
    FOR rec IN 
        SELECT c.relname, n.nspname 
        FROM pg_class c 
        JOIN pg_namespace n ON c.relnamespace = n.oid 
        WHERE n.nspname = 'lims' AND c.relname ~ '_(20260[6-9]|20261[0-2])$' AND c.relkind = 'r'
    LOOP
        EXECUTE format('SELECT count(*) FROM %I.%I', rec.nspname, rec.relname) INTO cnt;
        IF cnt = 0 THEN
            EXECUTE format('DROP TABLE %I.%I', rec.nspname, rec.relname);
            RAISE NOTICE 'Dropped empty partition %', rec.relname;
        ELSE
            RAISE NOTICE 'Skipped non-empty partition % (rows: %)', rec.relname, cnt;
        END IF;
    END LOOP;
END;
$$;