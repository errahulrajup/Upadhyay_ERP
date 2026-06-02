-- Upadhyay ERP: Phase 29 System-Wide De-Mocking
-- Run this script in your Supabase SQL Editor

-- 1. HACCP Logs Table
CREATE TABLE IF NOT EXISTS haccp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_point VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('COMPLIANT', 'DEVIATION', 'PENDING')),
    reading_value VARCHAR(100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    operator_id UUID REFERENCES auth.users(id),
    remarks TEXT
);

-- 2. CAPA Records Table
CREATE TABLE IF NOT EXISTS capa_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capa_no VARCHAR(100) NOT NULL UNIQUE,
    source VARCHAR(255) NOT NULL, -- e.g., 'CCP-2 Deviation', 'Audit Finding'
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    owner VARCHAR(100),
    description TEXT,
    action_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Product Recalls Table
CREATE TABLE IF NOT EXISTS product_recalls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recall_no VARCHAR(100) NOT NULL UNIQUE,
    affected_lot VARCHAR(100) NOT NULL, -- Can refer to fg_lots.lot_no
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    reason TEXT,
    initiated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. R&D Trials (Draft Recipes)
CREATE TABLE IF NOT EXISTS rnd_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    author VARCHAR(100),
    objective TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insert some initial seed data for presentation purposes
INSERT INTO rnd_trials (name, status, author, objective) VALUES 
('Experimental Mango Juice V4', 'DRAFT', 'Dr. Sharma', 'Testing extended shelf life'),
('Low Sugar Apple Base', 'PENDING_APPROVAL', 'J. Doe', 'Sugar reduction by 30%');

INSERT INTO haccp_logs (control_point, status, reading_value, remarks) VALUES 
('CCP-1: Pasteurization', 'COMPLIANT', '92 C', 'Normal operation'),
('CCP-2: Metal Detection', 'DEVIATION', 'Tripped', 'Fe particle found');

INSERT INTO capa_records (capa_no, source, status, owner, description) VALUES 
('CAPA-41', 'CCP-2 Deviation', 'OPEN', 'QA Lead', 'Investigate source of iron filings in line 2');

INSERT INTO product_recalls (recall_no, affected_lot, status, severity, reason) VALUES 
('REC-26-002', 'FG-BAT-400', 'ACTIVE', 'HIGH', 'Customer complaint regarding sour taste');
