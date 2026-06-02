-- 03_master_data.sql
-- Upadhyay_ERP Phase 12 & 13: Core Config and Master Data

-- 1. Site Settings (Prefixes, Company details)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(100) NOT NULL,
    gstin VARCHAR(15),
    fssai_no VARCHAR(20),
    grn_prefix VARCHAR(10) DEFAULT 'GRN-',
    batch_prefix VARCHAR(10) DEFAULT 'BAT-',
    dispatch_prefix VARCHAR(10) DEFAULT 'DSP-',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master: Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    contact_person VARCHAR(50),
    phone VARCHAR(20),
    gstin VARCHAR(15),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, BLACKLISTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Master: Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    contact_person VARCHAR(50),
    phone VARCHAR(20),
    gstin VARCHAR(15),
    shipping_address TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Master: Materials (Raw Materials & Packaging)
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g. RM-001
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) DEFAULT 'RM', -- RM (Raw Material), PM (Packaging Material)
    uom VARCHAR(10) DEFAULT 'KG', -- KG, LTR, PCS
    min_stock_level NUMERIC(10,3) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: In 01_schema_draft.sql we created a basic 'grn' table.
-- We must ALTER it to link to these new master tables using UUIDs instead of raw text.
-- Since Supabase is PostgreSQL, we can add foreign keys.

ALTER TABLE grn 
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id),
ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES materials(id);

-- -------------------------------------------------------------------------
-- ZERO-TRUST RPC FUNCTIONS FOR MASTER DATA AND GRN CREATION
-- -------------------------------------------------------------------------

-- A strict RPC to create a new GRN, ensuring it maps to valid Master Data.
CREATE OR REPLACE FUNCTION create_grn_strict(
    p_supplier_id UUID,
    p_material_id UUID,
    p_qty NUMERIC,
    p_rate NUMERIC,
    p_invoice_no VARCHAR,
    p_expected_expiry DATE,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_grn_id UUID;
    v_grn_no VARCHAR;
    v_prefix VARCHAR;
    v_count INT;
BEGIN
    -- 1. Validate Supplier
    IF NOT EXISTS (SELECT 1 FROM suppliers WHERE id = p_supplier_id AND status = 'ACTIVE') THEN
        RAISE EXCEPTION 'Invalid or inactive supplier ID';
    END IF;

    -- 2. Validate Material
    IF NOT EXISTS (SELECT 1 FROM materials WHERE id = p_material_id AND status = 'ACTIVE') THEN
        RAISE EXCEPTION 'Invalid or inactive material ID';
    END IF;

    -- 3. Generate Sequential GRN Number based on Settings
    SELECT grn_prefix INTO v_prefix FROM site_settings LIMIT 1;
    IF v_prefix IS NULL THEN v_prefix := 'GRN-'; END IF;
    
    SELECT count(*) + 1 INTO v_count FROM grn;
    v_grn_no := v_prefix || lpad(v_count::text, 4, '0');

    -- 4. Insert the GRN (Atomically)
    INSERT INTO grn (
        id, grn_no, supplier_id, material_id, supplier, status, date
    ) VALUES (
        gen_random_uuid(),
        v_grn_no,
        p_supplier_id,
        p_material_id,
        (SELECT name FROM suppliers WHERE id = p_supplier_id), -- Fallback for old schema column
        'PENDING_QC',
        CURRENT_DATE
    ) RETURNING id INTO v_grn_id;

    RETURN v_grn_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
