-- Upadhyay ERP: Inventory Optimization Migration (Phase 28 - FIXED)
-- Run this script in your Supabase SQL Editor

-- 0. Ensure base tables exist before altering them
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'RAW_MATERIAL',
    uom VARCHAR(20) NOT NULL DEFAULT 'kg',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS storage_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity_kg DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Insert default storage locations if none exist
INSERT INTO storage_locations (code, name, type, capacity_kg)
SELECT 'AMB-01', 'Ambient Warehouse 1', 'AMBIENT', 50000
WHERE NOT EXISTS (SELECT 1 FROM storage_locations WHERE code = 'AMB-01');

INSERT INTO storage_locations (code, name, type, capacity_kg)
SELECT 'COLD-01', 'Cold Room Alpha', 'COLD_ROOM', 10000
WHERE NOT EXISTS (SELECT 1 FROM storage_locations WHERE code = 'COLD-01');

INSERT INTO storage_locations (code, name, type, capacity_kg)
SELECT 'FG-BAY', 'Finished Goods Bay', 'FG_BAY', 20000
WHERE NOT EXISTS (SELECT 1 FROM storage_locations WHERE code = 'FG-BAY');
