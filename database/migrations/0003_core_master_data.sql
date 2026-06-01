-- Upadhyay_ERP core identity and master data tables

create table if not exists iam.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists iam.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  rank int not null,
  created_at timestamptz not null default now()
);

create table if not exists iam.user_roles (
  user_id uuid not null references iam.users(id) on delete cascade,
  role_id uuid not null references iam.roles(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists md.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category text,
  unit text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists md.materials (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text,
  unit text not null,
  allergen_flags jsonb not null default '{}'::jsonb,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists md.suppliers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  gstin text,
  contact_json jsonb not null default '{}'::jsonb,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists md.customers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  gstin text,
  contact_json jsonb not null default '{}'::jsonb,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into iam.roles(code, name, rank)
values
  ('ADMIN', 'Administrator', 100),
  ('MANAGER', 'Manager', 80),
  ('QC', 'Quality Control', 70),
  ('ACCOUNTS', 'Accounts', 60),
  ('OPERATOR', 'Operator', 40),
  ('VIEWER', 'Viewer', 10)
on conflict (code) do nothing;

