-- 08_finance.sql
-- Upadhyay_ERP Phase 18: Finance & Accounts
-- SAFE SQL: Using IF NOT EXISTS to prevent errors during multiple runs.

-- 1. Chart of Accounts (Ledger Heads Master)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) NOT NULL UNIQUE, -- e.g. 1000 for Cash, 2000 for AP, 4000 for Sales
    account_name VARCHAR(150) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Purchase Orders (To Suppliers)
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID REFERENCES suppliers(id) NOT NULL,
    total_amount NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, APPROVED, SENT, PARTIAL, COMPLETED
    expected_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID -- References users
);

-- Note: We link GRNs to POs to track fulfillment
ALTER TABLE grn
ADD COLUMN IF NOT EXISTS po_id UUID REFERENCES purchase_orders(id);

-- 3. Invoices (AR / AP)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL, -- SALES (AR), PURCHASE (AP)
    entity_id UUID NOT NULL, -- References customer_id OR supplier_id based on type
    total_amount NUMERIC(12,2) NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID, OVERDUE
    dispatch_id UUID REFERENCES dispatches(id), -- For Sales
    grn_id UUID REFERENCES grn(id), -- For Purchases
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. General Ledger (Double-Entry Log)
CREATE TABLE IF NOT EXISTS general_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_id UUID, -- Links to Invoice, Payment Receipt, etc.
    reference_type VARCHAR(50), -- INVOICE, PAYMENT, JOURNAL
    account_id UUID REFERENCES chart_of_accounts(id) NOT NULL,
    debit NUMERIC(12,2) DEFAULT 0,
    credit NUMERIC(12,2) DEFAULT 0,
    narration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- SAFE RPC: Post Journal Entry (Enforces Double-Entry Math)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION post_journal_entry(
    p_entries JSONB, -- Array of { account_id, debit, credit }
    p_reference_id UUID,
    p_reference_type VARCHAR,
    p_narration TEXT
)
RETURNS void AS $$
DECLARE
    v_entry JSONB;
    v_total_debit NUMERIC := 0;
    v_total_credit NUMERIC := 0;
BEGIN
    -- 1. Validate Debit/Credit Balance
    FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
    LOOP
        v_total_debit := v_total_debit + COALESCE((v_entry->>'debit')::NUMERIC, 0);
        v_total_credit := v_total_credit + COALESCE((v_entry->>'credit')::NUMERIC, 0);
    END LOOP;

    IF v_total_debit <> v_total_credit THEN
        RAISE EXCEPTION 'Journal entry unbalanced. Debits: %, Credits: %', v_total_debit, v_total_credit;
    END IF;

    -- 2. Insert Entries into GL
    FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
    LOOP
        INSERT INTO general_ledger (
            transaction_date, reference_id, reference_type, account_id, debit, credit, narration
        ) VALUES (
            CURRENT_DATE,
            p_reference_id,
            p_reference_type,
            (v_entry->>'account_id')::UUID,
            COALESCE((v_entry->>'debit')::NUMERIC, 0),
            COALESCE((v_entry->>'credit')::NUMERIC, 0),
            p_narration
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
