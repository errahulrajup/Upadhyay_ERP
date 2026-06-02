-- 05_recipe_engine.sql
-- Upadhyay_ERP Phase 15: R&D & Recipe Engine
-- SAFE SQL: Using IF NOT EXISTS to prevent errors during multiple runs.

-- 1. Finished Goods Master Catalog
CREATE TABLE IF NOT EXISTS erp_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g. FG-AJ-01
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    uom VARCHAR(10) DEFAULT 'LTR',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Recipe (Formula Header)
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES erp_products(id) NOT NULL,
    version VARCHAR(10) DEFAULT 'v1.0',
    name VARCHAR(150) NOT NULL,
    base_qty NUMERIC(10,3) NOT NULL, -- e.g. recipe is for 1000 LTR batch
    is_locked BOOLEAN DEFAULT FALSE, -- Once true, it cannot be edited, only copied to a new version
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Recipe Inputs (Bill of Materials)
CREATE TABLE IF NOT EXISTS recipe_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) NOT NULL, -- Links to Phase 12 materials
    required_qty NUMERIC(10,3) NOT NULL, -- qty required per base_qty of recipe
    step_sequence INT DEFAULT 1, -- which process step this is added in
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Recipe Process Steps
CREATE TABLE IF NOT EXISTS recipe_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    step_sequence INT NOT NULL,
    instruction TEXT NOT NULL,
    duration_minutes INT,
    temp_requirement VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recipe_id, step_sequence)
);

-- 5. Recipe QC Parameters (Tests required after batch finishes)
CREATE TABLE IF NOT EXISTS recipe_qc_params (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    parameter_name VARCHAR(100) NOT NULL, -- e.g. "pH Level"
    min_value NUMERIC(10,3),
    max_value NUMERIC(10,3),
    test_method VARCHAR(100),
    is_critical BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- SAFE RPC: Lock Recipe
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION lock_recipe(p_recipe_id UUID)
RETURNS void AS $$
BEGIN
    -- Check if inputs and steps exist before allowing lock
    IF NOT EXISTS (SELECT 1 FROM recipe_inputs WHERE recipe_id = p_recipe_id) THEN
        RAISE EXCEPTION 'Cannot lock recipe: No ingredients defined.';
    END IF;

    UPDATE recipes 
    SET is_locked = TRUE 
    WHERE id = p_recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
