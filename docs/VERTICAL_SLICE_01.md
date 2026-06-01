# Vertical Slice 01: Core Supply Chain to Finance Workflow

This document outlines the first vertical slice to be built in the fresh `Upadhyay_ERP` repository. This slice proves the core data architecture is sound and that traceability is unbroken.

## The Chain

**GRN -> RM Lot -> Stock Ledger -> Batch -> QC -> FG Lot -> Dispatch -> Invoice -> Payment**

## Workflow Definitions

### 1. Inwarding & Inventory (GRN to RM Lot)
- **User Action**: Store Manager creates a GRN against a Supplier for an Ingredient.
- **System**: Generates `GRN-XXXX` securely via sequence.
- **User Action**: QA approves the GRN.
- **RPC Action (`approve_grn`)**:
  - Updates GRN status to `APPROVED`.
  - Creates `rm_lots` entry (qty, expiry, unit cost).
  - Creates `stock_ledger` IN entry linked to the Lot.

### 2. Manufacturing (Batch to FG Lot)
- **User Action**: Production Manager plans a Batch for a Recipe.
- **System**: Generates `BAT-XXXX` securely.
- **User Action**: Operator consumes RM Lots during the running batch.
- **RPC Action (`consume_batch_component`)**:
  - Validates `rm_lots.qty_remaining` >= consumption qty.
  - Inserts into `batch_components`.
  - Creates `stock_ledger` OUT entry for the RM lot.
  - Decrements `rm_lots.qty_remaining`.
- **User Action**: QA passes Batch QC.
- **RPC Action (`release_batch`)**:
  - Updates Batch to `COMPLETED`.
  - Creates `fg_lots` (qty produced).
  - Creates `stock_ledger` IN entry for FG Lot.

### 3. Fulfillment & Finance (Dispatch to Payment)
- **User Action**: Dispatch Manager ships FG Lots to a Customer.
- **RPC Action (`confirm_dispatch`)**:
  - Generates `DSP-XXXX`.
  - Validates `fg_lots.qty_remaining` >= dispatch qty.
  - Inserts `dispatches` and `dispatch_items`.
  - Creates `stock_ledger` OUT entry for FG Lots.
  - Decrements `fg_lots.qty_remaining`.
- **User Action**: Finance generates Invoice.
- **RPC Action (`generate_invoice`)**:
  - Generates `INV-XXXX`.
  - Links to `dispatch_id`.
- **User Action**: Finance posts Payment against Invoice.
- **RPC Action (`post_payment`)**:
  - Inserts into `payments`.
  - Updates `invoices.status` to `PAID` or `PARTIAL` based on amounts.

## Success Criteria
- No two users can generate the same GRN/Batch/Dispatch/Invoice number.
- No RM Lot can have negative remaining quantity.
- All actions have `created_by` audit trails.
- Deleting an Invoice is forbidden; only `status` changes or offsetting credit notes are allowed (if implemented).
