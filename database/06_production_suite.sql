-- 06_production_suite.sql
-- Upadhyay_ERP Phase 16: Complete Production Suite
-- SAFE SQL: Using IF NOT EXISTS to prevent errors during multiple runs.

-- 1. Work Centers (Production Lines)
CREATE TABLE IF NOT EXISTS work_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g. LINE-01
    name VARCHAR(150) NOT NULL,
    capacity_per_hour NUMERIC(10,3),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Equipment & Machinery Master
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_center_id UUID REFERENCES work_centers(id),
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g. MIX-01
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50), -- BLENDER, FILLER, PACKER, etc.
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    status VARCHAR(20) DEFAULT 'OPERATIONAL', -- OPERATIONAL, UNDER_MAINTENANCE, BROKEN
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: We must link 'batches' to a work center
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS work_center_id UUID REFERENCES work_centers(id);

-- 3. Daily Production Logs (Shift Supervisor logs)
CREATE TABLE IF NOT EXISTS daily_production_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_center_id UUID REFERENCES work_centers(id) NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift VARCHAR(20) NOT NULL, -- SHIFT_A, SHIFT_B, SHIFT_C
    supervisor_id UUID, -- reference to users
    total_downtime_minutes INT DEFAULT 0,
    abnormalities_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Packaging Runs (Converting Bulk FG to SKU)
CREATE TABLE IF NOT EXISTS packaging_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bulk_fg_lot_id UUID REFERENCES fg_lots(id) NOT NULL,
    new_fg_lot_id UUID REFERENCES fg_lots(id), -- The output packaged lot
    work_center_id UUID REFERENCES work_centers(id),
    run_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    bulk_consumed_qty NUMERIC(10,3) NOT NULL,
    packs_produced INT NOT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- SAFE RPC: Execute Packaging Run
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION execute_packaging_run(
    p_bulk_lot_id UUID,
    p_consumed_qty NUMERIC,
    p_packs_produced INT,
    p_work_center_id UUID,
    p_new_lot_no VARCHAR,
    p_product_id UUID,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_available_bulk NUMERIC;
    v_new_lot_id UUID;
BEGIN
    -- 1. Check Bulk Lot Availability
    SELECT qty INTO v_available_bulk FROM fg_lots WHERE id = p_bulk_lot_id FOR UPDATE;
    IF v_available_bulk IS NULL OR v_available_bulk < p_consumed_qty THEN
        RAISE EXCEPTION 'Insufficient bulk quantity available.';
    END IF;

    -- 2. Deduct Bulk Qty
    UPDATE fg_lots 
    SET qty = qty - p_consumed_qty 
    WHERE id = p_bulk_lot_id;

    -- 3. Create New Packaged FG Lot
    INSERT INTO fg_lots (
        id, lot_no, product, qty, holding_status, location_id
    ) VALUES (
        gen_random_uuid(),
        p_new_lot_no,
        (SELECT name FROM erp_products WHERE id = p_product_id), -- Ideally reference ID, but keeping compatible with Phase 12 schema
        p_packs_produced, -- Store packs as qty, or ideally have separate pack tracking
        'RELEASED',
        NULL
    ) RETURNING id INTO v_new_lot_id;

    -- 4. Log the Run
    INSERT INTO packaging_runs (
        id, bulk_fg_lot_id, new_fg_lot_id, work_center_id, bulk_consumed_qty, packs_produced
    ) VALUES (
        gen_random_uuid(), p_bulk_lot_id, v_new_lot_id, p_work_center_id, p_consumed_qty, p_packs_produced
    );

    RETURN v_new_lot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
