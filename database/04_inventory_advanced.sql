-- 04_inventory_advanced.sql
-- Upadhyay_ERP Phase 14: Deep Inventory & Warehousing

-- 1. Storage Locations Master
CREATE TABLE IF NOT EXISTS storage_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g. LOC-COLD-01
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) DEFAULT 'AMBIENT', -- AMBIENT, COLD_ROOM, FG_BAY, QUARANTINE
    capacity_kg NUMERIC(10,3),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: We must alter 'lots' and 'fg_lots' to point to these physical storage locations
ALTER TABLE lots 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES storage_locations(id);

ALTER TABLE fg_lots 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES storage_locations(id);

-- 2. Stock Transfers Log
CREATE TABLE IF NOT EXISTS stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES lots(id),       -- For RM transfer
    fg_lot_id UUID REFERENCES fg_lots(id), -- For FG transfer
    from_location_id UUID REFERENCES storage_locations(id),
    to_location_id UUID REFERENCES storage_locations(id) NOT NULL,
    transfer_qty NUMERIC(10,3) NOT NULL,
    reason VARCHAR(255),
    transfer_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transferred_by UUID -- reference to users table eventually
);

-- -------------------------------------------------------------------------
-- ZERO-TRUST RPC FUNCTIONS FOR INVENTORY
-- -------------------------------------------------------------------------

-- A strict RPC to transfer RM lots between physical locations
CREATE OR REPLACE FUNCTION transfer_rm_stock(
    p_lot_id UUID,
    p_to_location_id UUID,
    p_reason VARCHAR,
    p_user_id UUID
)
RETURNS void AS $$
DECLARE
    v_current_loc UUID;
    v_qty NUMERIC;
BEGIN
    -- 1. Get current state of the Lot
    SELECT location_id, remaining_qty INTO v_current_loc, v_qty 
    FROM lots 
    WHERE id = p_lot_id FOR UPDATE;

    IF v_qty IS NULL THEN
        RAISE EXCEPTION 'Lot not found or inactive';
    END IF;

    IF v_current_loc = p_to_location_id THEN
        RAISE EXCEPTION 'Lot is already in the target location';
    END IF;

    -- 2. Ensure target location is valid
    IF NOT EXISTS (SELECT 1 FROM storage_locations WHERE id = p_to_location_id AND status = 'ACTIVE') THEN
        RAISE EXCEPTION 'Target storage location is invalid or inactive';
    END IF;

    -- 3. Update the Lot Location
    UPDATE lots 
    SET location_id = p_to_location_id 
    WHERE id = p_lot_id;

    -- 4. Log the Transfer
    INSERT INTO stock_transfers (
        id, lot_id, from_location_id, to_location_id, transfer_qty, reason, transferred_by
    ) VALUES (
        gen_random_uuid(), p_lot_id, v_current_loc, p_to_location_id, v_qty, p_reason, p_user_id
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
