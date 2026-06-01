# Upadhyay_ERP First Vertical Slice

## Slice Name

Inventory to Cash Proof Slice

## Purpose

Prove that the fresh ERP architecture can safely handle the most important cross-module chain:

GRN -> RM Lot -> Stock Ledger -> Batch -> QC -> FG Lot -> Dispatch -> Invoice -> Payment

## Business Flow

### Step 1 - Create GRN

User:
Store Operator

Input:

- supplier
- material
- received quantity
- unit
- unit cost
- invoice number
- mfg date
- expiry date

System:

- generates GRN number
- saves GRN as QC_PENDING
- emits audit event

### Step 2 - Approve GRN

User:
QC

System transaction:

- validates GRN status
- blocks expired material unless override role exists
- creates RM lot
- creates stock IN movement
- updates GRN status to APPROVED
- emits audit event

RPC:

- `inv.approve_grn`

### Step 3 - Create Batch

User:
Production Planner or Manager

System:

- generates batch number
- links recipe version
- creates planned batch
- emits audit event

RPC:

- `mfg.create_batch`

### Step 4 - Start Batch

User:
Operator

System:

- validates status PLANNED
- updates status RUNNING
- records start_time
- emits audit event

RPC:

- `mfg.start_batch`

### Step 5 - Complete Batch

User:
Operator/Manager as per role matrix

System transaction:

- validates RUNNING status
- validates RM lot availability
- writes batch consumption
- creates stock OUT movements
- updates lot remaining quantities
- calculates structured batch cost
- updates actual quantity, rejection, yield
- updates batch status QC_HOLD
- emits audit event

RPC:

- `mfg.complete_batch`

### Step 6 - Batch QC

User:
QC

System transaction:

- validates batch status QC_HOLD
- validates analyst
- validates reviewer
- validates required result set
- blocks PASS if any required result fails
- creates QC check
- if PASS:
  - creates CoA number
  - creates FG lot linked to batch
  - updates batch status COMPLETED
- if FAIL:
  - updates batch status REJECTED
  - offers CAPA creation
- emits audit event

RPC:

- `qa.release_batch_qc`

### Step 7 - Dispatch FG

User:
Dispatch/Manager

System transaction:

- validates FG lot released and CoA issued
- validates available quantity
- creates dispatch
- creates FG stock OUT movement
- updates FG available quantity
- optionally creates invoice
- emits audit event

RPC:

- `fin.confirm_dispatch`

### Step 8 - Generate Invoice

User:
Accounts/Manager

System transaction:

- validates dispatch
- generates invoice number
- creates invoice
- links dispatch
- emits audit event

RPC:

- `fin.create_invoice_from_dispatch`

### Step 9 - Post Payment

User:
Accounts

System transaction:

- validates invoice
- blocks overpayment
- generates payment number
- creates payment
- updates invoice paid amount and status
- emits audit event

RPC:

- `fin.post_payment`

## Acceptance Criteria

- No business number comes from frontend Date.now.
- Every step has audit trail.
- Every critical step is transactional.
- Stock ledger and lot quantity match.
- Batch links to FG lot.
- FG lot links to dispatch.
- Dispatch links to invoice.
- Invoice links to payment.
- Traceability can go forward and backward.

## First Test Cases

1. Happy path from GRN to payment.
2. Expired GRN blocked.
3. Duplicate GRN number impossible.
4. Batch cannot complete without stock.
5. QC cannot PASS with failed result.
6. Dispatch cannot happen without CoA.
7. Payment cannot exceed invoice outstanding.
8. Any forced RPC failure leaves no partial state.

