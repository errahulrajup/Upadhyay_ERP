-- Upadhyay_ERP logging and counter foundation

create table if not exists log.business_counters (
  counter_key text primary key,
  prefix text not null,
  next_val bigint not null default 1,
  padding int not null default 4,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists log.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_schema text not null,
  entity_table text not null,
  entity_id uuid,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

create or replace function log.next_business_no(
  target_key text,
  target_prefix text,
  target_padding int default 4
)
returns text
language plpgsql
as $$
declare
  allocated bigint;
  current_prefix text;
  current_padding int;
begin
  insert into log.business_counters(counter_key, prefix, next_val, padding)
  values (target_key, target_prefix, 2, target_padding)
  on conflict (counter_key)
  do update set
    next_val = log.business_counters.next_val + 1,
    updated_at = now()
  returning next_val - 1, prefix, padding
  into allocated, current_prefix, current_padding;

  return current_prefix || lpad(allocated::text, current_padding, '0');
end;
$$;

