-- Upadhyay_ERP first-slice data quality checks

-- FG lots must always link to a batch.
select id, fg_lot_no
from fin.fg_lots
where batch_id is null;

-- Lot remaining quantity must match movement balance.
select
  l.id,
  l.lot_no,
  l.remaining_qty,
  coalesce(sum(sm.qty_change), 0) as movement_balance
from inv.lots l
left join inv.stock_movements sm on sm.lot_id = l.id
group by l.id, l.lot_no, l.remaining_qty
having l.remaining_qty <> coalesce(sum(sm.qty_change), 0);

-- Invoice paid amount must match payment sum.
select
  i.id,
  i.invoice_no,
  i.paid_amount,
  coalesce(sum(p.amount), 0) as payment_sum
from fin.invoices i
left join fin.payments p on p.invoice_id = i.id
group by i.id, i.invoice_no, i.paid_amount
having i.paid_amount <> coalesce(sum(p.amount), 0);

-- CoA-issued QC checks must have analyst and reviewer.
select id, coa_no
from qa.qc_checks
where coa_issued = true
  and (coalesce(trim(analyst), '') = '' or coalesce(trim(reviewer), '') = '');

