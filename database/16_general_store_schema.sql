-- Upadhyay ERP: Phase 31 General Store De-Mocking
-- Run this script in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS general_store_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'PACKAGING', 'SPARES', 'CONSUMABLES'
    qty DECIMAL(10,2) DEFAULT 0,
    uom VARCHAR(20) DEFAULT 'pcs',
    location VARCHAR(50),
    min_stock_level DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert dummy data if table is empty
INSERT INTO general_store_items (item_code, name, category, qty, uom, location, min_stock_level)
SELECT 'PM-1001', 'Glass Bottle 500ml', 'PACKAGING', 5000, 'pcs', 'AMB-01', 1000
WHERE NOT EXISTS (SELECT 1 FROM general_store_items WHERE item_code = 'PM-1001');

INSERT INTO general_store_items (item_code, name, category, qty, uom, location, min_stock_level)
SELECT 'SP-204', 'Pump Seal O-Ring', 'SPARES', 50, 'pcs', 'ENG-RACK-A', 10
WHERE NOT EXISTS (SELECT 1 FROM general_store_items WHERE item_code = 'SP-204');
