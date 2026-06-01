-- Upadhyay_ERP first vertical-slice manufacturing, quality, and finance tables

create table if not exists mfg.recipes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references md.products(id) on delete restrict,
  recipe_code text not null unique,
  name text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'ACTIVE', 'INACTIVE')),
  active_version_id uuid,
  created_by uuid references iam.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mfg.recipe_versions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references mfg.recipes(id) on delete cascade,
  version_no int not null check (version_no > 0),
  output_qty numeric(14, 4) not null check (output_qty > 0),
  output_unit text not null,
  expected_loss_pct numeric(8, 4) not null default 0 check (expected_loss_pct >= 0),
  labor_rate_per_hour numeric(14, 4) not null default 0 check (labor_rate_per_hour >= 0),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'APPROVED', 'ARCHIVED')),
  approved_by uuid references iam.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (recipe_id, version_no)
);

alter table mfg.recipes
  add constraint recipes_active_version_fk
  foreign key (active_version_id) references mfg.recipe_versions(id) on delete set null;

create table if not exists mfg.recipe_bom_lines (
  id uuid primary key default gen_random_uuid(),
  recipe_version_id uuid not null references mfg.recipe_versions(id) on delete cascade,
  material_id uuid not null references md.materials(id) on delete restrict,
  qty numeric(14, 4) not null check (qty > 0),
  unit text not null,
  tolerance_pct numeric(8, 4) not null default 0 check (tolerance_pct >= 0),
  unique (recipe_version_id, material_id)
);

create table if not exists mfg.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_version_id uuid not null references mfg.recipe_versions(id) on delete cascade,
  step_no int not null check (step_no > 0),
  name text not null,
  instruction text,
  target_json jsonb not null default '{}'::jsonb,
  unique (recipe_version_id, step_no)
);

create table if not exists mfg.batches (
  id uuid primary key default gen_random_uuid(),
  batch_no text not null unique,
  product_id uuid not null references md.products(id) on delete restrict,
  recipe_version_id uuid not null references mfg.recipe_versions(id) on delete restrict,
  planned_qty numeric(14, 4) not null check (planned_qty > 0),
  actual_qty numeric(14, 4) check (actual_qty is null or actual_qty >= 0),
  reject_qty numeric(14, 4) check (reject_qty is null or reject_qty >= 0),
  yield_pct numeric(8, 4),
  unit text not null,
  status text not null default 'PLANNED'
    check (status in ('PLANNED', 'RUNNING', 'QC_HOLD', 'COMPLETED', 'REJECTED', 'CANCELLED')),
  start_time timestamptz,
  end_time timestamptz,
  created_by uuid references iam.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mfg.batch_consumption (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references mfg.batches(id) on delete restrict,
  lot_id uuid not null references inv.lots(id) on delete restrict,
  material_id uuid not null references md.materials(id) on delete restrict,
  planned_qty numeric(14, 4) not null check (planned_qty >= 0),
  actual_qty numeric(14, 4) not null check (actual_qty > 0),
  unit text not null,
  unit_cost numeric(14, 4) not null default 0 check (unit_cost >= 0),
  created_at timestamptz not null default now(),
  unique (batch_id, lot_id, material_id)
);

create table if not exists qa.qc_checks (
  id uuid primary key default gen_random_uuid(),
  check_type text not null check (check_type in ('GRN', 'BATCH')),
  batch_id uuid references mfg.batches(id) on delete restrict,
  grn_id uuid references inv.grns(id) on delete restrict,
  lot_id uuid references inv.lots(id) on delete restrict,
  overall_result text not null check (overall_result in ('PASS', 'FAIL', 'HOLD')),
  coa_no text unique,
  coa_issued boolean not null default false,
  analyst text,
  reviewer text,
  tested_by uuid references iam.users(id) on delete set null,
  tested_at timestamptz not null default now(),
  results jsonb not null default '[]'::jsonb,
  remarks text,
  created_at timestamptz not null default now(),
  constraint qc_target_present check (batch_id is not null or grn_id is not null or lot_id is not null)
);

create table if not exists fin.fg_lots (
  id uuid primary key default gen_random_uuid(),
  fg_lot_no text not null unique,
  batch_id uuid not null references mfg.batches(id) on delete restrict,
  product_id uuid not null references md.products(id) on delete restrict,
  qty numeric(14, 4) not null check (qty > 0),
  available_qty numeric(14, 4) not null check (available_qty >= 0),
  unit text not null,
  unit_cost numeric(14, 4) not null default 0 check (unit_cost >= 0),
  coa_no text,
  coa_issued boolean not null default false,
  status text not null default 'RELEASED' check (status in ('HOLD', 'RELEASED', 'DISPATCHED', 'CANCELLED')),
  created_at timestamptz not null default now()
);

alter table inv.stock_movements
  add constraint stock_movements_fg_lot_fk
  foreign key (fg_lot_id) references fin.fg_lots(id) on delete restrict;

create table if not exists fin.dispatches (
  id uuid primary key default gen_random_uuid(),
  dispatch_no text not null unique,
  customer_id uuid not null references md.customers(id) on delete restrict,
  fg_lot_id uuid not null references fin.fg_lots(id) on delete restrict,
  qty numeric(14, 4) not null check (qty > 0),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'CONFIRMED', 'INVOICED', 'CANCELLED')),
  dispatched_at timestamptz,
  approved_by uuid references iam.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists fin.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  dispatch_id uuid not null references fin.dispatches(id) on delete restrict,
  customer_id uuid not null references md.customers(id) on delete restrict,
  total numeric(14, 4) not null check (total >= 0),
  paid_amount numeric(14, 4) not null default 0 check (paid_amount >= 0),
  status text not null default 'UNPAID' check (status in ('UNPAID', 'PARTIAL', 'PAID', 'CANCELLED')),
  invoice_date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint invoice_paid_lte_total check (paid_amount <= total)
);

create table if not exists fin.payments (
  id uuid primary key default gen_random_uuid(),
  payment_no text not null unique,
  invoice_id uuid not null references fin.invoices(id) on delete restrict,
  amount numeric(14, 4) not null check (amount > 0),
  mode text not null check (mode in ('BANK', 'CASH', 'UPI', 'CHEQUE', 'NEFT', 'RTGS', 'OTHER')),
  reference text,
  notes text,
  payment_date date not null default current_date,
  recorded_by uuid references iam.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_batches_status on mfg.batches(status);
create index if not exists idx_consumption_batch on mfg.batch_consumption(batch_id);
create index if not exists idx_qc_batch on qa.qc_checks(batch_id);
create index if not exists idx_fg_lots_batch on fin.fg_lots(batch_id);
create index if not exists idx_dispatches_fg_lot on fin.dispatches(fg_lot_id);
create index if not exists idx_payments_invoice on fin.payments(invoice_id);

