-- =====================================================================
-- RAG SCHEMA INITIALIZATION SCRIPT FOR LIMS DATABASE
-- Run this script in pgAdmin using an administrator/superuser account.
-- =====================================================================

-- 1. Enable pgvector extension (if not already active)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create documents metadata table
CREATE TABLE IF NOT EXISTS lims.documents (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'processing'
);

-- 3. Create document_chunks vector table
CREATE TABLE IF NOT EXISTS lims.document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INT REFERENCES lims.documents(id) ON DELETE CASCADE,
    page_number INT,
    content TEXT NOT NULL,
    embedding vector(768)
);

-- 4. Grant full DML permissions to the application user 'lims_app'
GRANT ALL PRIVILEGES ON TABLE lims.documents TO lims_app;
GRANT ALL PRIVILEGES ON TABLE lims.document_chunks TO lims_app;

-- 5. Grant sequence usage permissions so the application user can perform inserts
GRANT USAGE, SELECT ON SEQUENCE lims.documents_id_seq TO lims_app;
GRANT USAGE, SELECT ON SEQUENCE lims.document_chunks_id_seq TO lims_app;

-- Verification Queries
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
SELECT table_name FROM information_schema.tables WHERE table_schema = 'lims' AND table_name IN ('documents', 'document_chunks');
