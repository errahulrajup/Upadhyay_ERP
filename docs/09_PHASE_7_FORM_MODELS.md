# Phase 7 Module Form Models

Date: 2026-06-01

## Goal

Add independent form models and validation rules for each first-slice module before live persistence.

## Added

File:

- `apps/web/src/formModels.ts`

Form models:

- `GrnForm`
- `BatchForm`
- `BatchCompletionForm`
- `QcForm`
- `DispatchForm`
- `InvoicePaymentForm`
- `VerticalSliceForms`

## Validation Rules

GRN:

- GRN ID required
- supplier required
- material required
- received quantity greater than zero
- unit cost cannot be negative
- expiry date required
- expired material blocked

Batch:

- product required
- recipe version required
- planned quantity greater than zero
- unit required

Completion:

- actual quantity cannot be negative
- reject quantity cannot be negative
- reject quantity cannot exceed actual quantity

QC:

- analyst required
- reviewer required
- at least one result required
- PASS path cannot include failed QC result

Dispatch:

- customer required
- dispatch quantity greater than zero

Finance:

- invoice total cannot be negative
- payment amount greater than zero
- payment cannot exceed invoice total

## Tests Added

File:

- `apps/web/src/formModels.test.ts`

Coverage:

- state/form mapping
- expired material block
- impossible completion block
- overpayment block
- default forms pass validation

## Next Phase

Phase 8 should turn the form models into independent route-ready screen components:

- `GrnApprovalScreen`
- `BatchPlanningScreen`
- `BatchExecutionScreen`
- `QcReleaseScreen`
- `DispatchScreen`
- `FinanceScreen`

