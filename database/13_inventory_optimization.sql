-- Upadhyay ERP: Inventory Optimization Migration (Phase 28)
-- Run this script in your Supabase SQL Editor

-- 1. Add reorder_level to materials table
ALTER TABLE materials ADD COLUMN IF NOT EXISTS reorder_level DECIMAL(10,2) DEFAULT 0.00;

-- 2. Create stock_adjustments table for reconciliation (audits)
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id UUID NOT NULL, -- Refers to either rm_lots or fg_lots
    lot_type VARCHAR(20) CHECK (lot_type IN ('RM', 'FG')),
    old_qty DECIMAL(10,2) NOT NULL,
    new_qty DECIMAL(10,2) NOT NULL,
    reason VARCHAR(100) NOT NULL, -- e.g., 'SHRINKAGE', 'DAMAGED', 'COUNT_ERROR'
    remarks TEXT,
    adjusted_by UUID REFERENCES auth.users(id),
    adjusted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: In a production Supabase instance, you would want to add foreign keys for lot_id,
-- but since it can point to two different tables (Polymorphic), we rely on application logic 
-- or create separate tables/columns. For simplicity, we use lot_type to distinguish.
