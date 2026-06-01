# Upadhyay_ERP Schema Draft

## Schemas

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

## Phase 2 Tables

### iam

- users
- roles
- user_roles

### md

- products
- materials
- suppliers
- customers

### inv

- grns
- lots
- stock_movements

### mfg

- recipes
- recipe_versions
- recipe_bom_lines
- recipe_steps
- batches
- batch_consumption

### qa

- qc_specs
- qc_checks
- capas

### fin

- dispatches
- invoices
- payments

### log

- audit_events
- counters
- business_counters

## First RPCs Added

- log.next_business_no
- log.emit_audit
- inv.approve_grn
- mfg.create_batch
- mfg.start_batch
- mfg.complete_batch
- qa.release_batch_qc
- fin.confirm_dispatch
- fin.create_invoice_from_dispatch
- fin.post_payment
