-- 11_rbac.sql
-- Upadhyay_ERP Phase 21: Role-Based Access Control (RBAC)
-- SAFE SQL: Using IF NOT EXISTS to prevent errors during multiple runs.

-- Note: In a real Supabase environment, users are managed in the `auth.users` schema.
-- We create a public wrapper table to link auth.users to our application roles.

CREATE TABLE IF NOT EXISTS app_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate the strict FSSAI/ERP roles
INSERT INTO app_roles (role_name, description) VALUES
    ('SUPER_ADMIN', 'Full system access and override privileges'),
    ('PURCHASE_MANAGER', 'Procurement, Suppliers, and GRN creation'),
    ('PRODUCTION_MANAGER', 'Recipe management, Master Scheduling, and Batches'),
    ('PRODUCTION_OPERATOR', 'Floor monitoring and Batch execution only'),
    ('QA_OFFICER', 'QC checks, HACCP logging, and FG Lot creation'),
    ('SANITATION_OFFICER', 'CIP logs and Hygiene tracking'),
    ('DISPATCH_MANAGER', 'Logistics, Vehicles, and FG Dispatch'),
    ('ACCOUNT_MANAGER', 'General Ledger, Invoicing, and Payroll viewing'),
    ('HR_MANAGER', 'Employee directory, Attendance, and Payroll processing'),
    ('HELPER', 'Basic access, self-service attendance only')
ON CONFLICT (role_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY, -- Links directly to auth.users.id
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role_id UUID REFERENCES app_roles(id),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Example RLS (Row Level Security) Implementation Pattern
-- We enable RLS on highly sensitive tables like `general_ledger`
ALTER TABLE general_ledger ENABLE ROW LEVEL SECURITY;

-- Policy: Only Account Managers or Super Admins can see the General Ledger
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'general_ledger' AND policyname = 'account_manager_select'
    ) THEN
        CREATE POLICY account_manager_select ON general_ledger
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM user_profiles up
                    JOIN app_roles ar ON up.role_id = ar.id
                    WHERE up.id = auth.uid() AND (ar.role_name IN ('SUPER_ADMIN', 'ACCOUNT_MANAGER'))
                )
            );
    END IF;
END
$$;
