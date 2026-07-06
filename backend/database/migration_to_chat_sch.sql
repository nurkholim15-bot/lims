-- =========================================================================
-- SCRIPT MIGRASI TABEL CHATBOT DARI SCHEMA public KE chat_sch
-- Jalankan script ini pada database chatbot_db di pgAdmin
-- =========================================================================

-- 1. Pastikan skema chat_sch sudah terbuat
CREATE SCHEMA IF NOT EXISTS chat_sch;

-- 2. Pindahkan tabel utama dari public ke chat_sch
ALTER TABLE IF EXISTS public.user_social_accounts SET SCHEMA chat_sch;
ALTER TABLE IF EXISTS public.documents SET SCHEMA chat_sch;
ALTER TABLE IF EXISTS public.document_chunks SET SCHEMA chat_sch;
ALTER TABLE IF EXISTS public.agent_chats SET SCHEMA chat_sch;

-- Note: Pada PostgreSQL 11+, memindahkan tabel induk partisi (agent_chats) 
-- secara otomatis akan memindahkan semua tabel partisinya ke skema baru. 
-- Baris di bawah ini bertindak sebagai pengaman jika ada partisi yang terpisah.
ALTER TABLE IF EXISTS public.agent_chats_202606 SET SCHEMA chat_sch;
ALTER TABLE IF EXISTS public.agent_chats_202607 SET SCHEMA chat_sch;
ALTER TABLE IF EXISTS public.agent_chats_202608 SET SCHEMA chat_sch;

-- 3. Pindahkan sequence dari public ke chat_sch
-- Di PostgreSQL, pemindahan skema tabel tidak otomatis memindahkan sequence bawaan SERIAL.
-- Kita harus memindahkannya secara manual agar sequence tetap sejalan dengan tabelnya.
ALTER SEQUENCE IF EXISTS public.user_social_accounts_id_seq SET SCHEMA chat_sch;
ALTER SEQUENCE IF EXISTS public.documents_id_seq SET SCHEMA chat_sch;
ALTER SEQUENCE IF EXISTS public.document_chunks_id_seq SET SCHEMA chat_sch;
ALTER SEQUENCE IF EXISTS public.agent_chats_id_seq SET SCHEMA chat_sch;
