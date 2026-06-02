-- Upadhyay ERP: Audit Gap Fixes Migration (Phase 1)
-- Run this script in your Supabase SQL Editor

-- 1. Inventory & Procurement (GRN Additions)
ALTER TABLE grns ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE grns ADD COLUMN IF NOT EXISTS vehicle_no VARCHAR(50);
ALTER TABLE grns ADD COLUMN IF NOT EXISTS invoice_no VARCHAR(100);

-- 2. Finance (Invoice Payments & Expenses)
CREATE TABLE IF NOT EXISTS invoice_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('BANK', 'CASH', 'UPI', 'CHEQUE', 'NEFT', 'RTGS')),
    reference_no VARCHAR(100),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- We assume 'expenses' table exists from earlier phases, if not let's ensure it does.
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    incurred_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Logistics & QC (COA and Holding Status on FG Lots)
ALTER TABLE fg_lots ADD COLUMN IF NOT EXISTS coa_issued BOOLEAN DEFAULT false;
ALTER TABLE fg_lots ADD COLUMN IF NOT EXISTS coa_no VARCHAR(100);
ALTER TABLE fg_lots ADD COLUMN IF NOT EXISTS holding_status VARCHAR(20) DEFAULT 'INCUBATION' CHECK (holding_status IN ('INCUBATION', 'MATURATION', 'RELEASED', 'QUARANTINE', 'HOLD'));

-- 4. Production & R&D (Auto QC Params)
CREATE TABLE IF NOT EXISTS recipe_qc_params (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    parameter_name VARCHAR(100) NOT NULL, -- e.g., 'pH', 'Brix', 'Moisture'
    min_value DECIMAL(10,2),
    max_value DECIMAL(10,2),
    uom VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Compliance (Allergen Matrix)
CREATE TABLE IF NOT EXISTS allergens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    severity VARCHAR(20) DEFAULT 'HIGH' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_allergens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES materials(id) ON DELETE CASCADE, -- Mapping to materials of type PRODUCT
    allergen_id UUID REFERENCES allergens(id) ON DELETE CASCADE,
    risk_type VARCHAR(50) DEFAULT 'CONTAINS' CHECK (risk_type IN ('CONTAINS', 'MAY_CONTAIN', 'PRODUCED_IN_SAME_FACILITY')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, allergen_id)
);

-- Note: Seed some common allergens
INSERT INTO allergens (name, severity) VALUES 
('Milk / Dairy', 'HIGH'),
('Peanuts', 'CRITICAL'),
('Tree Nuts', 'CRITICAL'),
('Soy', 'HIGH'),
('Wheat / Gluten', 'HIGH'),
('Eggs', 'HIGH'),
('Fish', 'HIGH'),
('Shellfish', 'CRITICAL')
ON CONFLICT DO NOTHING;
