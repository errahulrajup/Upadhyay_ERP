-- 10_dms_analytics.sql
-- Upadhyay_ERP Phase 20: DMS & Analytics
-- SAFE SQL: Using IF NOT EXISTS to prevent errors during multiple runs.

-- 1. Document Management System (DMS)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- CERTIFICATE, AUDIT_REPORT, AGREEMENT, MANUAL
    file_url TEXT NOT NULL, -- URL to Supabase Storage bucket
    version VARCHAR(20) DEFAULT '1.0',
    valid_from DATE,
    valid_until DATE,
    department VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED, EXPIRED
    uploaded_by UUID, -- References users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. System Audit Logs
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL, -- e.g. "BATCH_COMPLETED", "PO_APPROVED"
    entity_type VARCHAR(50) NOT NULL, -- e.g. "batches", "purchase_orders"
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    performed_by UUID, -- References users
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- SAFE RPC: Upload Document
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION upload_document(
    p_title VARCHAR,
    p_document_type VARCHAR,
    p_file_url TEXT,
    p_valid_from DATE,
    p_valid_until DATE,
    p_department VARCHAR
)
RETURNS UUID AS $$
DECLARE
    v_doc_id UUID;
BEGIN
    INSERT INTO documents (
        title, document_type, file_url, valid_from, valid_until, department
    ) VALUES (
        p_title, p_document_type, p_file_url, p_valid_from, p_valid_until, p_department
    ) RETURNING id INTO v_doc_id;

    RETURN v_doc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
