-- ==============================================================================
-- Upadhyay_ERP - Core Transactional RPCs
-- These functions replace the direct multi-table inserts previously done by the frontend.
-- ==============================================================================

-- 1. Approve GRN & Update Inventory
CREATE OR REPLACE FUNCTION approve_grn(
    p_grn_id UUID,
    p_user_id UUID
) RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_grn RECORD;
    v_new_lot_id UUID;
    -- Mocking ingredient variables for demo. A real GRN would have items in a grn_items table,
    -- but per our schema draft, we link ingredient_id at the lot level.
BEGIN
    -- 1. Check GRN exists and is pending
    SELECT * INTO v_grn FROM grn WHERE id = p_grn_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'GRN not found';
    END IF;
    
    IF v_grn.status != 'PENDING_QC' THEN
        RAISE EXCEPTION 'GRN is not in PENDING_QC state';
    END IF;

    -- 2. Update GRN status
    UPDATE grn SET status = 'APPROVED' WHERE id = p_grn_id;

    -- Note: In a complete implementation, we loop through 'grn_items'. 
    -- Assuming a simplified creation for the prototype.
    -- The frontend will call a batch RPC if multiple lots are received.
END;
$$;

-- 2. Complete Batch & Generate FG Lot
CREATE OR REPLACE FUNCTION complete_batch(
    p_batch_id UUID,
    p_fg_qty NUMERIC,
    p_user_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_batch RECORD;
    v_new_fg_lot_id UUID;
    v_lot_no TEXT;
BEGIN
    -- 1. Lock batch record
    SELECT * INTO v_batch FROM batches WHERE id = p_batch_id FOR UPDATE;
    IF v_batch.status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Batch is already completed.';
    END IF;

    -- 2. Generate FG Lot Number (format FG-BAT-{short-id})
    v_lot_no := 'FG-' || v_batch.batch_no;

    -- 3. Create FG Lot
    INSERT INTO fg_lots (
        batch_id, product_id, lot_no, qty_produced, qty_remaining, qc_status
    )
    SELECT 
        p_batch_id, 
        recipes.product_id, 
        v_lot_no, 
        p_fg_qty, 
        p_fg_qty, 
        'PENDING'
    FROM recipes WHERE id = v_batch.recipe_id
    RETURNING id INTO v_new_fg_lot_id;

    -- 4. Update Batch Status
    UPDATE batches SET 
        status = 'COMPLETED',
        actual_yield = p_fg_qty
    WHERE id = p_batch_id;

    -- 5. Add Stock Ledger IN entry for FG
    INSERT INTO stock_ledger (
        fg_lot_id, txn_type, qty, reference_type, reference_id, created_by
    ) VALUES (
        v_new_fg_lot_id, 'IN', p_fg_qty, 'BATCH', p_batch_id, p_user_id
    );

    -- 6. (RM Lot deduction should happen progressively via consume_batch_component RPC)
END;
$$;

-- 3. Confirm Dispatch
CREATE OR REPLACE FUNCTION confirm_dispatch(
    p_dispatch_id UUID,
    p_user_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_dispatch RECORD;
    v_item RECORD;
    v_fg_lot RECORD;
BEGIN
    -- Lock dispatch
    SELECT * INTO v_dispatch FROM dispatches WHERE id = p_dispatch_id FOR UPDATE;
    
    IF v_dispatch.status != 'DRAFT' THEN
        RAISE EXCEPTION 'Dispatch is already confirmed or shipped.';
    END IF;

    -- Loop through dispatch items
    FOR v_item IN SELECT * FROM dispatch_items WHERE dispatch_id = p_dispatch_id LOOP
        -- Lock FG lot
        SELECT * INTO v_fg_lot FROM fg_lots WHERE id = v_item.fg_lot_id FOR UPDATE;
        
        IF v_fg_lot.qty_remaining < v_item.qty THEN
            RAISE EXCEPTION 'Insufficient stock in lot % (Requested: %, Available: %)', 
                v_fg_lot.lot_no, v_item.qty, v_fg_lot.qty_remaining;
        END IF;

        -- Deduct from lot
        UPDATE fg_lots 
        SET qty_remaining = qty_remaining - v_item.qty
        WHERE id = v_item.fg_lot_id;

        -- Create stock ledger OUT
        INSERT INTO stock_ledger (
            fg_lot_id, txn_type, qty, reference_type, reference_id, created_by
        ) VALUES (
            v_item.fg_lot_id, 'OUT', v_item.qty, 'DISPATCH', p_dispatch_id, p_user_id
        );
    END LOOP;

    -- Update dispatch status
    UPDATE dispatches SET 
        status = 'SHIPPED',
        dispatch_date = now()
    WHERE id = p_dispatch_id;
END;
$$;
