-- Upadhyay ERP: Consolidated DB Repair Migration
-- Run this script in your Supabase SQL Editor to align all tables and columns!

-- 1. Alter Suppliers
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS contact_person VARCHAR(50);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS gstin VARCHAR(15);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';

-- 2. Alter Materials
ALTER TABLE materials ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE;

-- 3. Alter Recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS name VARCHAR(150);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS base_qty NUMERIC(10,3) DEFAULT 1000;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';

-- 4. Alter Invoices to add missing columns from 08_finance.sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS type VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS grn_id UUID REFERENCES grn(id);
ALTER TABLE invoices ALTER COLUMN dispatch_id DROP NOT NULL;

-- Populate invoice_number from invoice_no for existing records
UPDATE invoices SET invoice_number = invoice_no WHERE invoice_number IS NULL;

-- 5. Create HRMS & Production tables if they don't exist
CREATE TABLE IF NOT EXISTS production_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_no VARCHAR(100) NOT NULL,
    work_center VARCHAR(100),
    reading_type VARCHAR(100) NOT NULL,
    reading_value VARCHAR(100) NOT NULL,
    remarks TEXT,
    logged_by UUID,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    join_date DATE,
    base_salary DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'PRESENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    pay_period VARCHAR(50) NOT NULL,
    base_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    allowances DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    net_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'PROCESSED',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, pay_period)
);

-- 6. Create Finance tables if they don't exist
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) NOT NULL UNIQUE,
    account_name VARCHAR(150) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID REFERENCES suppliers(id) NOT NULL,
    total_amount NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT',
    expected_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

CREATE TABLE IF NOT EXISTS general_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_id UUID,
    reference_type VARCHAR(50),
    account_id UUID REFERENCES chart_of_accounts(id) NOT NULL,
    debit NUMERIC(12,2) DEFAULT 0,
    credit NUMERIC(12,2) DEFAULT 0,
    narration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Compliance tables if they don't exist
CREATE TABLE IF NOT EXISTS haccp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_point VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('COMPLIANT', 'DEVIATION', 'PENDING')),
    reading_value VARCHAR(100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    operator_id UUID,
    remarks TEXT
);

CREATE TABLE IF NOT EXISTS capa_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capa_no VARCHAR(100) NOT NULL UNIQUE,
    source VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    owner VARCHAR(100),
    description TEXT,
    action_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Note: We drop constraint first to avoid duplicate if table exists
ALTER TABLE IF EXISTS product_recalls DROP CONSTRAINT IF EXISTS product_recalls_severity_check;

CREATE TABLE IF NOT EXISTS product_recalls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recall_no VARCHAR(100) NOT NULL UNIQUE,
    affected_lot VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('CLASS_I', 'CLASS_II', 'CLASS_III', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    reason TEXT,
    initiated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rnd_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    author VARCHAR(100),
    objective TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create DMS tables if they don't exist
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    valid_from DATE,
    valid_until DATE,
    department VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed basic employees if table is empty
INSERT INTO employees (employee_code, name, department, role, base_salary)
SELECT 'EMP-1001', 'Rahul Upadhyay', 'Management', 'CEO', 150000.00
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP-1001');

INSERT INTO employees (employee_code, name, department, role, base_salary)
SELECT 'EMP-1002', 'Vikram Singh', 'Production', 'Shift Lead', 45000.00
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP-1002');
