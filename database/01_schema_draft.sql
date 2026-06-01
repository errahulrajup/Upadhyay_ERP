-- ==============================================================================
-- Upadhyay_ERP - First Vertical Slice Schema
-- Domain: Supply Chain (Inventory, Logistics) & Manufacturing (Production, QC)
-- Traceability Chain: GRN -> RM Lot -> Stock Ledger -> Batch -> QC -> FG Lot -> Dispatch -> Invoice -> Payment
-- ==============================================================================

-- 1. Base Users & Roles
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Master Data (Ingredients, Products, Suppliers, Customers)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    uom TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    uom TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Inventory & GRN (Raw Materials)
CREATE SEQUENCE IF NOT EXISTS grn_number_seq;

CREATE TABLE IF NOT EXISTS grn (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_no TEXT UNIQUE NOT NULL DEFAULT 'GRN-' || nextval('grn_number_seq'),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    received_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'PENDING_QC', -- PENDING_QC, APPROVED, REJECTED
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES app_users(id)
);

CREATE TABLE IF NOT EXISTS rm_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_id UUID NOT NULL REFERENCES grn(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    lot_no TEXT NOT NULL,
    qty_received NUMERIC NOT NULL,
    qty_remaining NUMERIC NOT NULL,
    unit_cost NUMERIC NOT NULL,
    expiry_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'QUARANTINE', -- QUARANTINE, APPROVED, EXPIRED
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Stock Ledger
CREATE TABLE IF NOT EXISTS stock_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES rm_lots(id) ON DELETE RESTRICT,
    fg_lot_id UUID, -- References FG Lot (added later in this file)
    txn_type TEXT NOT NULL, -- IN, OUT, ADJ
    qty NUMERIC NOT NULL,
    reference_type TEXT NOT NULL, -- GRN, BATCH, DISPATCH
    reference_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES app_users(id)
);

-- 5. Production (Batches)
CREATE SEQUENCE IF NOT EXISTS batch_number_seq;

CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_no TEXT UNIQUE NOT NULL DEFAULT 'BAT-' || nextval('batch_number_seq'),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'PLANNED', -- PLANNED, RUNNING, COMPLETED, CANCELLED
    expected_yield NUMERIC,
    actual_yield NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES app_users(id)
);

CREATE TABLE IF NOT EXISTS batch_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    rm_lot_id UUID NOT NULL REFERENCES rm_lots(id) ON DELETE RESTRICT,
    qty_consumed NUMERIC NOT NULL,
    UNIQUE(batch_id, rm_lot_id) -- Prevents duplicate lot entry per batch
);

-- 6. QC & Finished Goods
CREATE TABLE IF NOT EXISTS fg_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    lot_no TEXT UNIQUE NOT NULL,
    qty_produced NUMERIC NOT NULL,
    qty_remaining NUMERIC NOT NULL,
    qc_status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PASS, FAIL
    coa_no TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stock_ledger ADD CONSTRAINT fk_fg_lot FOREIGN KEY (fg_lot_id) REFERENCES fg_lots(id) ON DELETE RESTRICT;

-- 7. Sales, Dispatch & Finance
CREATE SEQUENCE IF NOT EXISTS dispatch_number_seq;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq;

CREATE TABLE IF NOT EXISTS dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_no TEXT UNIQUE NOT NULL DEFAULT 'DSP-' || nextval('dispatch_number_seq'),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, SHIPPED, DELIVERED
    dispatch_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES app_users(id)
);

CREATE TABLE IF NOT EXISTS dispatch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_id UUID NOT NULL REFERENCES dispatches(id) ON DELETE CASCADE,
    fg_lot_id UUID NOT NULL REFERENCES fg_lots(id) ON DELETE RESTRICT,
    qty NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no TEXT UNIQUE NOT NULL DEFAULT 'INV-' || nextval('invoice_number_seq'),
    dispatch_id UUID NOT NULL REFERENCES dispatches(id) ON DELETE RESTRICT,
    total_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    amount NUMERIC NOT NULL,
    payment_mode TEXT NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES app_users(id)
);

-- ==============================================================================
-- RPC Functions for Transactional Integrity
-- ==============================================================================

-- Example RPC: Approve GRN (Creates Lot + Stock Ledger IN)
-- CREATE OR REPLACE FUNCTION approve_grn(p_grn_id UUID, p_user_id UUID) RETURNS VOID ...
