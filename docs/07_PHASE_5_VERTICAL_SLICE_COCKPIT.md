# Phase 5 Vertical Slice Cockpit

Date: 2026-06-01

## Goal

Build the first operational UI shell for the clean ERP vertical slice:

GRN -> RM Lot -> Stock Ledger -> Batch -> QC -> FG Lot -> Dispatch -> Invoice -> Payment

## Added

### Workflow State Model

File:

- `apps/web/src/verticalSlice.ts`

Includes:

- `VerticalSliceState`
- `WorkflowStep`
- default operational values
- validation function
- service-sequence runner

### Cockpit UI

File:

- `apps/web/src/main.tsx`

UI includes:

- editable planned quantity
- editable actual quantity
- editable reject quantity
- editable dispatch quantity
- editable invoice total
- editable payment amount
- analyst/reviewer fields
- validation error panel
- step status board
- cockpit run button

## Important Architecture Point

The cockpit does not directly write GRN, lot, batch, QC, dispatch, invoice, or payment tables.

It calls:

UI -> `runVerticalSlice` -> `FirstSliceService` -> `RpcClient`

Current adapter:

- `FakeRpcClient`

Future live adapter:

- `SupabaseRpcClient`

## Tests Added

File:

- `apps/web/src/verticalSlice.test.ts`

Tests:

- operational validation
- full service sequence order
- payment ID produced at end of slice

## Next Phase

Phase 6 should replace simulation-only cockpit with first real data screens:

- GRN form
- Batch form
- QC form
- Dispatch form
- Invoice/payment form

These screens should still call service methods only.

