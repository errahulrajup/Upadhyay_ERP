-- Upadhyay ERP: Phase 30 HR & Production De-Mocking
-- Run this script in your Supabase SQL Editor

-- 1. Production Logs Table
CREATE TABLE IF NOT EXISTS production_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_no VARCHAR(100) NOT NULL,
    work_center VARCHAR(100),
    reading_type VARCHAR(100) NOT NULL,
    reading_value VARCHAR(100) NOT NULL,
    remarks TEXT,
    logged_by UUID REFERENCES auth.users(id),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Employees Table
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

-- 3. Attendance Logs Table
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

-- 4. Payroll Records Table
CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    pay_period VARCHAR(50) NOT NULL, -- e.g. '2026-06'
    base_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    allowances DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    net_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'PROCESSED',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, pay_period)
);

-- Insert dummy employees for presentation if none exist
INSERT INTO employees (employee_code, name, department, role, base_salary)
SELECT 'EMP-1001', 'Rahul Upadhyay', 'Management', 'CEO', 150000.00
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP-1001');

INSERT INTO employees (employee_code, name, department, role, base_salary)
SELECT 'EMP-1002', 'Vikram Singh', 'Production', 'Shift Lead', 45000.00
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = 'EMP-1002');
