-- Migration: Add performance indexes to lims.ai_model_registry
-- Reason: Table only has PK (id). Frequent queries filter by model_name and status.
-- Without indexes, full table scan occurs on every anomaly detection call.
-- Run once on the PostgreSQL server, e.g.:
--   psql -U <user> -d <db> -f migrate_ai_model_registry_indexes.sql

-- Index on model_name: used in WHERE model_name = 'pqc_KESUA'
-- and in UPDATE ... WHERE model_name = :model_name AND status = 'ACTIVE'
CREATE INDEX IF NOT EXISTS idx_ai_model_registry_model_name
    ON lims.ai_model_registry (model_name);

-- Index on status: used in WHERE status = 'ACTIVE' queries
CREATE INDEX IF NOT EXISTS idx_ai_model_registry_status
    ON lims.ai_model_registry (status);

-- Composite index: covers the most common combined query pattern
-- WHERE model_name = ? AND status = 'ACTIVE'
-- This is a covering index for the UPDATE (deactivate) and SELECT (get active model) patterns
CREATE INDEX IF NOT EXISTS idx_ai_model_registry_model_name_status
    ON lims.ai_model_registry (model_name, status);
