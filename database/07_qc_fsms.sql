-- 07_qc_fsms.sql
-- Upadhyay_ERP Phase 17: QC & FSMS
-- SAFE SQL: Using IF NOT EXISTS to prevent errors during multiple runs.

-- 1. Batch QC Checks Log
CREATE TABLE IF NOT EXISTS qc_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES batches(id) NOT NULL,
    analyst_id UUID, -- References users
    reviewer_id UUID, -- References users
    test_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verdict VARCHAR(20) NOT NULL, -- PASS, FAIL, HOLD
    remarks TEXT
);

-- Note: In a real system, you'd have a child table qc_check_results linking to recipe_qc_params.
-- We keep it simple here with a JSONB column to store individual parameter readings.
ALTER TABLE qc_checks 
ADD COLUMN IF NOT EXISTS readings JSONB;

-- 2. HACCP Logs (Daily CCP checks)
CREATE TABLE IF NOT EXISTS haccp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ccp_name VARCHAR(100) NOT NULL, -- e.g. Pasteurizer Temp
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reading_value VARCHAR(50) NOT NULL,
    is_compliant BOOLEAN NOT NULL,
    checked_by UUID, -- References users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SOP Register
CREATE TABLE IF NOT EXISTS sop_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sop_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. SOP-HYG-01
    title VARCHAR(200) NOT NULL,
    department VARCHAR(50),
    version VARCHAR(10) DEFAULT 'v1.0',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    last_reviewed_date DATE,
    next_review_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Training Matrix
CREATE TABLE IF NOT EXISTS training_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    training_topic VARCHAR(100) NOT NULL, -- e.g. Personal Hygiene, Allergen Control
    training_date DATE NOT NULL,
    trainer_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'COMPLETED', -- COMPLETED, PENDING
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- SAFE RPC: Submit Batch QC
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_batch_qc(
    p_batch_id UUID,
    p_verdict VARCHAR,
    p_readings JSONB,
    p_remarks TEXT,
    p_new_fg_lot_no VARCHAR,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_qc_id UUID;
    v_fg_lot_id UUID;
    v_batch_qty NUMERIC;
    v_product_name VARCHAR;
BEGIN
    -- 1. Insert QC Check Log
    INSERT INTO qc_checks (
        id, batch_id, analyst_id, verdict, readings, remarks
    ) VALUES (
        gen_random_uuid(), p_batch_id, p_user_id, p_verdict, p_readings, p_remarks
    ) RETURNING id INTO v_qc_id;

    -- 2. If PASS, Complete the Batch and Create FG Lot
    IF p_verdict = 'PASS' THEN
        -- Get Batch Details
        SELECT planned_qty, product INTO v_batch_qty, v_product_name 
        FROM batches WHERE id = p_batch_id;

        -- Create FG Lot (Assuming 100% yield for simplicity, normally use actual_yield)
        INSERT INTO fg_lots (
            id, lot_no, product, qty, holding_status
        ) VALUES (
            gen_random_uuid(), p_new_fg_lot_no, v_product_name, v_batch_qty, 'INCUBATION'
        ) RETURNING id INTO v_fg_lot_id;

        -- Update Batch Status
        UPDATE batches SET status = 'COMPLETED' WHERE id = p_batch_id;
    
    ELSIF p_verdict = 'FAIL' THEN
        -- Update Batch Status
        UPDATE batches SET status = 'REJECTED' WHERE id = p_batch_id;
    END IF;

    RETURN v_qc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
