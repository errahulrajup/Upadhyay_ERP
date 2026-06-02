-- 09_hrms.sql
-- Upadhyay_ERP Phase 19: HRMS & Payroll
-- SAFE SQL: Using IF NOT EXISTS to prevent errors during multiple runs.

-- 1. Employee Master Directory
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. EMP-001
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    designation VARCHAR(100),
    joining_date DATE NOT NULL,
    base_salary NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, ON_LEAVE, TERMINATED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Daily Attendance Logs
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    punch_in TIMESTAMP WITH TIME ZONE,
    punch_out TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'PRESENT', -- PRESENT, ABSENT, HALF_DAY
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- 3. Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- SICK, CASUAL, EARNED
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approved_by UUID, -- References users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payroll Records (Salary Slips)
CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) NOT NULL,
    pay_period VARCHAR(20) NOT NULL, -- e.g. "2026-05"
    base_pay NUMERIC(12,2) DEFAULT 0,
    allowances NUMERIC(12,2) DEFAULT 0,
    deductions NUMERIC(12,2) DEFAULT 0,
    net_pay NUMERIC(12,2) GENERATED ALWAYS AS (base_pay + allowances - deductions) STORED,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, PROCESSED, PAID
    payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, pay_period)
);

-- -------------------------------------------------------------------------
-- SAFE RPC: Process Payroll for Employee
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_payroll(
    p_employee_id UUID,
    p_pay_period VARCHAR,
    p_allowances NUMERIC,
    p_deductions NUMERIC
)
RETURNS UUID AS $$
DECLARE
    v_base_salary NUMERIC;
    v_payroll_id UUID;
BEGIN
    -- 1. Get Base Salary
    SELECT base_salary INTO v_base_salary 
    FROM employees 
    WHERE id = p_employee_id AND status = 'ACTIVE';

    IF v_base_salary IS NULL THEN
        RAISE EXCEPTION 'Employee not found or inactive.';
    END IF;

    -- 2. Create Payroll Record
    INSERT INTO payroll_records (
        employee_id, pay_period, base_pay, allowances, deductions, status
    ) VALUES (
        p_employee_id, p_pay_period, v_base_salary, p_allowances, p_deductions, 'PROCESSED'
    )
    ON CONFLICT (employee_id, pay_period) 
    DO UPDATE SET 
        base_pay = EXCLUDED.base_pay,
        allowances = EXCLUDED.allowances,
        deductions = EXCLUDED.deductions,
        status = 'PROCESSED'
    RETURNING id INTO v_payroll_id;

    RETURN v_payroll_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
