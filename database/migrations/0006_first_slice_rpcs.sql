-- Upadhyay_ERP first vertical-slice transactional RPCs

create or replace function log.emit_audit(
  actor uuid,
  action_name text,
  schema_name text,
  table_name text,
  row_id uuid,
  before_state jsonb default null,
  after_state jsonb default null
)
returns void
language plpgsql
as $$
begin
  insert into log.audit_events(actor_id, action, entity_schema, entity_table, entity_id, before_json, after_json)
  values (actor, action_name, schema_name, table_name, row_id, before_state, after_state);
end;
$$;

create or replace function inv.approve_grn(target_grn_id uuid, actor_id uuid)
returns uuid
language plpgsql
as $$
declare
  g inv.grns%rowtype;
  new_lot_id uuid;
  new_lot_no text;
begin
  select * into g from inv.grns where id = target_grn_id for update;
  if not found then
    raise exception 'GRN not found';
  end if;

  if g.status <> 'QC_PENDING' then
    raise exception 'Only QC_PENDING GRNs can be approved. Current status: %', g.status;
  end if;

  if g.expiry_date is not null and g.expiry_date < current_date then
    raise exception 'Expired material cannot be approved';
  end if;

  new_lot_no := log.next_business_no('RM_LOT', 'RML-', 6);

  insert into inv.lots(
    lot_no, grn_id, material_id, supplier_id, received_qty, remaining_qty,
    unit, unit_cost, mfg_date, expiry_date, qc_status
  )
  values (
    new_lot_no, g.id, g.material_id, g.supplier_id, g.received_qty, g.received_qty,
    g.unit, g.unit_cost, g.mfg_date, g.expiry_date, 'APPROVED'
  )
  returning id into new_lot_id;

  insert into inv.stock_movements(
    lot_id, movement_type, qty_change, reference_type, reference_id, created_by, notes
  )
  values (
    new_lot_id, 'IN', g.received_qty, 'GRN', g.id, actor_id, 'GRN approval stock in'
  );

  update inv.grns
  set status = 'APPROVED', approved_by = actor_id, approved_at = now(), updated_at = now()
  where id = g.id;

  perform log.emit_audit(actor_id, 'inv.approve_grn', 'inv', 'grns', g.id, to_jsonb(g), jsonb_build_object('status', 'APPROVED', 'lot_id', new_lot_id));

  return new_lot_id;
end;
$$;

create or replace function mfg.create_batch(
  target_product_id uuid,
  target_recipe_version_id uuid,
  planned_qty numeric,
  target_unit text,
  actor_id uuid
)
returns uuid
language plpgsql
as $$
declare
  new_batch_id uuid;
  new_batch_no text;
begin
  if planned_qty <= 0 then
    raise exception 'Planned quantity must be greater than zero';
  end if;

  new_batch_no := log.next_business_no('BATCH', 'BAT-', 6);

  insert into mfg.batches(batch_no, product_id, recipe_version_id, planned_qty, unit, status, created_by)
  values (new_batch_no, target_product_id, target_recipe_version_id, planned_qty, target_unit, 'PLANNED', actor_id)
  returning id into new_batch_id;

  perform log.emit_audit(actor_id, 'mfg.create_batch', 'mfg', 'batches', new_batch_id, null, jsonb_build_object('status', 'PLANNED', 'batch_no', new_batch_no));

  return new_batch_id;
end;
$$;

create or replace function mfg.start_batch(target_batch_id uuid, actor_id uuid)
returns void
language plpgsql
as $$
declare
  b mfg.batches%rowtype;
begin
  select * into b from mfg.batches where id = target_batch_id for update;
  if not found then
    raise exception 'Batch not found';
  end if;
  if b.status <> 'PLANNED' then
    raise exception 'Only PLANNED batches can be started. Current status: %', b.status;
  end if;

  update mfg.batches
  set status = 'RUNNING', start_time = now(), updated_at = now()
  where id = b.id;

  perform log.emit_audit(actor_id, 'mfg.start_batch', 'mfg', 'batches', b.id, to_jsonb(b), jsonb_build_object('status', 'RUNNING'));
end;
$$;

create or replace function mfg.complete_batch(
  target_batch_id uuid,
  actual_output_qty numeric,
  reject_output_qty numeric,
  actor_id uuid
)
returns void
language plpgsql
as $$
declare
  b mfg.batches%rowtype;
  line record;
  selected_lot inv.lots%rowtype;
  scaled_qty numeric;
  yield_value numeric;
begin
  select * into b from mfg.batches where id = target_batch_id for update;
  if not found then
    raise exception 'Batch not found';
  end if;
  if b.status <> 'RUNNING' then
    raise exception 'Only RUNNING batches can be completed. Current status: %', b.status;
  end if;
  if actual_output_qty < 0 or reject_output_qty < 0 then
    raise exception 'Actual and reject quantities cannot be negative';
  end if;

  for line in
    select rbl.material_id, rbl.qty, rbl.unit
    from mfg.recipe_bom_lines rbl
    where rbl.recipe_version_id = b.recipe_version_id
    order by rbl.id
  loop
    scaled_qty := line.qty * b.planned_qty;

    select * into selected_lot
    from inv.lots
    where material_id = line.material_id
      and qc_status = 'APPROVED'
      and remaining_qty >= scaled_qty
      and (expiry_date is null or expiry_date >= current_date)
    order by expiry_date nulls last, created_at
    limit 1
    for update;

    if not found then
      raise exception 'No available approved lot for material % and qty %', line.material_id, scaled_qty;
    end if;

    insert into mfg.batch_consumption(batch_id, lot_id, material_id, planned_qty, actual_qty, unit, unit_cost)
    values (b.id, selected_lot.id, line.material_id, scaled_qty, scaled_qty, line.unit, selected_lot.unit_cost);

    update inv.lots
    set remaining_qty = remaining_qty - scaled_qty, updated_at = now()
    where id = selected_lot.id;

    insert into inv.stock_movements(lot_id, movement_type, qty_change, reference_type, reference_id, created_by, notes)
    values (selected_lot.id, 'OUT', -scaled_qty, 'BATCH', b.id, actor_id, 'Batch material consumption');
  end loop;

  yield_value := case when b.planned_qty > 0 then round((actual_output_qty / b.planned_qty) * 100, 4) else null end;

  update mfg.batches
  set actual_qty = actual_output_qty,
      reject_qty = reject_output_qty,
      yield_pct = yield_value,
      status = 'QC_HOLD',
      end_time = now(),
      updated_at = now()
  where id = b.id;

  perform log.emit_audit(actor_id, 'mfg.complete_batch', 'mfg', 'batches', b.id, to_jsonb(b), jsonb_build_object('status', 'QC_HOLD', 'actual_qty', actual_output_qty));
end;
$$;

create or replace function qa.release_batch_qc(
  target_batch_id uuid,
  verdict text,
  analyst_name text,
  reviewer_name text,
  result_payload jsonb,
  actor_id uuid
)
returns uuid
language plpgsql
as $$
declare
  b mfg.batches%rowtype;
  new_qc_id uuid;
  new_coa_no text;
  new_fg_lot_id uuid;
  total_cost numeric;
  unit_cost numeric;
  failed_count int;
begin
  select * into b from mfg.batches where id = target_batch_id for update;
  if not found then
    raise exception 'Batch not found';
  end if;
  if b.status <> 'QC_HOLD' then
    raise exception 'Only QC_HOLD batches can be released. Current status: %', b.status;
  end if;
  if verdict not in ('PASS', 'FAIL', 'HOLD') then
    raise exception 'Invalid QC verdict';
  end if;
  if coalesce(trim(analyst_name), '') = '' or coalesce(trim(reviewer_name), '') = '' then
    raise exception 'Analyst and reviewer are required';
  end if;
  if jsonb_typeof(result_payload) <> 'array' or jsonb_array_length(result_payload) = 0 then
    raise exception 'QC result payload must contain at least one result';
  end if;

  select count(*) into failed_count
  from jsonb_array_elements(result_payload) item
  where upper(coalesce(item->>'verdict', '')) = 'FAIL';

  if verdict = 'PASS' and failed_count > 0 then
    raise exception 'Cannot PASS QC when one or more parameters failed';
  end if;

  new_coa_no := case when verdict = 'PASS' then log.next_business_no('COA', 'COA-', 6) else null end;

  insert into qa.qc_checks(check_type, batch_id, overall_result, coa_no, coa_issued, analyst, reviewer, tested_by, results)
  values ('BATCH', b.id, verdict, new_coa_no, verdict = 'PASS', analyst_name, reviewer_name, actor_id, result_payload)
  returning id into new_qc_id;

  if verdict = 'PASS' then
    select coalesce(sum(actual_qty * unit_cost), 0) into total_cost
    from mfg.batch_consumption
    where batch_id = b.id;

    unit_cost := case when coalesce(b.actual_qty, 0) > 0 then round(total_cost / b.actual_qty, 4) else 0 end;

    insert into fin.fg_lots(fg_lot_no, batch_id, product_id, qty, available_qty, unit, unit_cost, coa_no, coa_issued, status)
    values (log.next_business_no('FG_LOT', 'FGL-', 6), b.id, b.product_id, b.actual_qty, b.actual_qty, b.unit, unit_cost, new_coa_no, true, 'RELEASED')
    returning id into new_fg_lot_id;

    update mfg.batches set status = 'COMPLETED', updated_at = now() where id = b.id;
  elsif verdict = 'FAIL' then
    update mfg.batches set status = 'REJECTED', updated_at = now() where id = b.id;
  end if;

  perform log.emit_audit(actor_id, 'qa.release_batch_qc', 'qa', 'qc_checks', new_qc_id, null, jsonb_build_object('verdict', verdict, 'fg_lot_id', new_fg_lot_id));

  return new_qc_id;
end;
$$;

create or replace function fin.confirm_dispatch(
  target_customer_id uuid,
  target_fg_lot_id uuid,
  dispatch_qty numeric,
  actor_id uuid
)
returns uuid
language plpgsql
as $$
declare
  fg fin.fg_lots%rowtype;
  new_dispatch_id uuid;
begin
  if dispatch_qty <= 0 then
    raise exception 'Dispatch quantity must be greater than zero';
  end if;

  select * into fg from fin.fg_lots where id = target_fg_lot_id for update;
  if not found then
    raise exception 'FG lot not found';
  end if;
  if fg.status <> 'RELEASED' or not fg.coa_issued then
    raise exception 'Only CoA-issued released FG lots can be dispatched';
  end if;
  if fg.available_qty < dispatch_qty then
    raise exception 'Insufficient FG quantity';
  end if;

  insert into fin.dispatches(dispatch_no, customer_id, fg_lot_id, qty, status, dispatched_at, approved_by)
  values (log.next_business_no('DISPATCH', 'DSP-', 6), target_customer_id, fg.id, dispatch_qty, 'CONFIRMED', now(), actor_id)
  returning id into new_dispatch_id;

  update fin.fg_lots
  set available_qty = available_qty - dispatch_qty,
      status = case when available_qty - dispatch_qty = 0 then 'DISPATCHED' else status end
  where id = fg.id;

  insert into inv.stock_movements(fg_lot_id, movement_type, qty_change, reference_type, reference_id, created_by, notes)
  values (fg.id, 'OUT', -dispatch_qty, 'DISPATCH', new_dispatch_id, actor_id, 'FG dispatch');

  perform log.emit_audit(actor_id, 'fin.confirm_dispatch', 'fin', 'dispatches', new_dispatch_id, null, jsonb_build_object('fg_lot_id', fg.id, 'qty', dispatch_qty));

  return new_dispatch_id;
end;
$$;

create or replace function fin.create_invoice_from_dispatch(
  target_dispatch_id uuid,
  invoice_total numeric,
  actor_id uuid
)
returns uuid
language plpgsql
as $$
declare
  d fin.dispatches%rowtype;
  new_invoice_id uuid;
begin
  if invoice_total < 0 then
    raise exception 'Invoice total cannot be negative';
  end if;

  select * into d from fin.dispatches where id = target_dispatch_id for update;
  if not found then
    raise exception 'Dispatch not found';
  end if;
  if d.status not in ('CONFIRMED', 'INVOICED') then
    raise exception 'Dispatch must be CONFIRMED before invoice';
  end if;

  insert into fin.invoices(invoice_no, dispatch_id, customer_id, total, status)
  values (log.next_business_no('INVOICE', 'INV-', 6), d.id, d.customer_id, invoice_total, case when invoice_total = 0 then 'PAID' else 'UNPAID' end)
  returning id into new_invoice_id;

  update fin.dispatches set status = 'INVOICED' where id = d.id;

  perform log.emit_audit(actor_id, 'fin.create_invoice_from_dispatch', 'fin', 'invoices', new_invoice_id, null, jsonb_build_object('dispatch_id', d.id, 'total', invoice_total));

  return new_invoice_id;
end;
$$;

create or replace function fin.post_payment(
  target_invoice_id uuid,
  payment_amount numeric,
  payment_mode text,
  payment_reference text,
  payment_notes text,
  actor_id uuid
)
returns uuid
language plpgsql
as $$
declare
  inv fin.invoices%rowtype;
  new_payment_id uuid;
  new_paid numeric;
  new_status text;
begin
  if payment_amount <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;
  if payment_mode not in ('BANK', 'CASH', 'UPI', 'CHEQUE', 'NEFT', 'RTGS', 'OTHER') then
    raise exception 'Invalid payment mode';
  end if;

  select * into inv from fin.invoices where id = target_invoice_id for update;
  if not found then
    raise exception 'Invoice not found';
  end if;
  if inv.status = 'CANCELLED' then
    raise exception 'Cannot post payment to cancelled invoice';
  end if;
  if inv.paid_amount + payment_amount > inv.total then
    raise exception 'Payment exceeds outstanding amount';
  end if;

  insert into fin.payments(payment_no, invoice_id, amount, mode, reference, notes, recorded_by)
  values (log.next_business_no('PAYMENT', 'PAY-', 6), inv.id, payment_amount, payment_mode, payment_reference, payment_notes, actor_id)
  returning id into new_payment_id;

  new_paid := inv.paid_amount + payment_amount;
  new_status := case
    when new_paid = inv.total then 'PAID'
    when new_paid > 0 then 'PARTIAL'
    else 'UNPAID'
  end;

  update fin.invoices set paid_amount = new_paid, status = new_status where id = inv.id;

  perform log.emit_audit(actor_id, 'fin.post_payment', 'fin', 'payments', new_payment_id, null, jsonb_build_object('invoice_id', inv.id, 'amount', payment_amount));

  return new_payment_id;
end;
$$;

