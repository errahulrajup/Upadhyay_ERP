# Phase 2 Database Contract

Date: 2026-06-01

## Goal

Convert the clean `Upadhyay_ERP` data contract into executable database structure for the first vertical slice.

## Scope Completed

### Schemas

Created domain schemas:

- iam
- md
- inv
- mfg
- qa
- fin
- rnd
- dms
- cms
- log

### Foundation Tables

Created:

- `log.business_counters`
- `log.audit_events`

### Identity and Master Data

Created:

- `iam.users`
- `iam.roles`
- `iam.user_roles`
- `md.products`
- `md.materials`
- `md.suppliers`
- `md.customers`

### Inventory

Created:

- `inv.grns`
- `inv.lots`
- `inv.stock_movements`

### Manufacturing

Created:

- `mfg.recipes`
- `mfg.recipe_versions`
- `mfg.recipe_bom_lines`
- `mfg.recipe_steps`
- `mfg.batches`
- `mfg.batch_consumption`

### Quality

Created:

- `qa.qc_checks`

### Finance

Created:

- `fin.fg_lots`
- `fin.dispatches`
- `fin.invoices`
- `fin.payments`

## RPCs Added

Foundation:

- `log.next_business_no`
- `log.emit_audit`

First vertical slice:

- `inv.approve_grn`
- `mfg.create_batch`
- `mfg.start_batch`
- `mfg.complete_batch`
- `qa.release_batch_qc`
- `fin.confirm_dispatch`
- `fin.create_invoice_from_dispatch`
- `fin.post_payment`

## Seed Data

Added deterministic reference seed:

- Users
- Roles
- Suppliers
- Materials
- Product
- Customer
- Recipe
- Recipe version
- BOM lines
- Recipe steps

## Data Quality Checks

Added first-slice checks for:

- FG lots without batch
- lot remaining quantity vs stock movement balance
- invoice paid amount vs payments
- CoA-issued QC checks without analyst/reviewer

## Design Decisions

1. Business numbers are generated through `log.next_business_no`.
2. Critical state changes emit audit events.
3. GRN approval creates RM lot and stock IN in one RPC.
4. Batch completion consumes lots and creates stock OUT in one RPC.
5. QC release blocks invalid CoA and creates FG lot in one RPC.
6. Dispatch deducts FG available quantity and creates stock OUT in one RPC.
7. Payment posting updates invoice status in one RPC.

## Phase 2 Gate Commands

```powershell
npm run db:check
npm run build
npm test
```

## Pending for Phase 3

- Add typed application API wrappers for these RPCs.
- Add UI workflow shell for first vertical slice.
- Add Supabase client boundary and env validation.
- Add generated TypeScript DB types after actual Supabase project is available.

