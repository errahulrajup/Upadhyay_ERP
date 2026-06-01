-- Upadhyay_ERP inventory tables

create table if not exists inv.grns (
  id uuid primary key default gen_random_uuid(),
  grn_no text not null unique,
  supplier_id uuid not null references md.suppliers(id) on delete restrict,
  material_id uuid not null references md.materials(id) on delete restrict,
  received_qty numeric(14, 4) not null check (received_qty > 0),
  unit text not null,
  unit_cost numeric(14, 4) not null default 0 check (unit_cost >= 0),
  invoice_no text,
  mfg_date date,
  expiry_date date,
  status text not null default 'QC_PENDING'
    check (status in ('DRAFT', 'QC_PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  rejected_reason text,
  created_by uuid references iam.users(id) on delete set null,
  approved_by uuid references iam.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grn_expiry_after_mfg check (
    mfg_date is null or expiry_date is null or expiry_date >= mfg_date
  )
);

create table if not exists inv.lots (
  id uuid primary key default gen_random_uuid(),
  lot_no text not null unique,
  grn_id uuid references inv.grns(id) on delete restrict,
  material_id uuid not null references md.materials(id) on delete restrict,
  supplier_id uuid references md.suppliers(id) on delete restrict,
  received_qty numeric(14, 4) not null check (received_qty > 0),
  remaining_qty numeric(14, 4) not null check (remaining_qty >= 0),
  unit text not null,
  unit_cost numeric(14, 4) not null default 0 check (unit_cost >= 0),
  mfg_date date,
  expiry_date date,
  qc_status text not null default 'APPROVED' check (qc_status in ('PENDING', 'APPROVED', 'REJECTED')),
  storage_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inv.stock_movements (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid references inv.lots(id) on delete restrict,
  fg_lot_id uuid,
  movement_type text not null check (movement_type in ('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER')),
  qty_change numeric(14, 4) not null,
  reference_type text not null,
  reference_id uuid,
  notes text,
  created_by uuid references iam.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint movement_has_target check (lot_id is not null or fg_lot_id is not null),
  constraint movement_qty_not_zero check (qty_change <> 0)
);

create index if not exists idx_grns_status on inv.grns(status);
create index if not exists idx_lots_material on inv.lots(material_id);
create index if not exists idx_lots_expiry on inv.lots(expiry_date);
create index if not exists idx_stock_movements_lot on inv.stock_movements(lot_id);
create index if not exists idx_stock_movements_reference on inv.stock_movements(reference_type, reference_id);

