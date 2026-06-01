# Upadhyay_ERP Restructure Charter

Date: 2026-06-01

## Decision

The ERP program is renamed to `Upadhyay_ERP`.

The old `D:\SVRERP` project will not be used as the active implementation base. It will be used only as a reference for:

- Existing bugs
- Business workflows
- Module list
- Data requirements
- UI expectations
- Reports and audit evidence

## Why Fresh Repo

The previous implementation contains mixed schema paths, partial fixes, inconsistent migrations, frontend business logic, direct multi-table writes, and old data risks.

Fresh repo policy removes these risks:

- No accidental dependency on old broken migrations
- No hidden dirty worktree changes
- No legacy localStorage/fallback behavior
- No half-aligned frontend/backend contracts
- No carryover of corrupt test data

## Non-Negotiable Architecture Rules

1. Frontend cannot own critical multi-table business workflows.
2. Business IDs cannot be generated in frontend.
3. Every critical workflow must be transactional.
4. Every critical action must be auditable.
5. Schema is the contract.
6. Build and tests must pass at every phase gate.
7. Staging migration must be proven before production.

## Program Name

Official name:

`Upadhyay_ERP`

## First Vertical Slice

The first implementation slice will be:

GRN -> QC Approval -> RM Lot -> Stock Ledger -> Batch -> Batch QC -> FG Lot -> Dispatch -> Invoice -> Payment

This slice proves that inventory, production, quality, traceability, and finance are structurally correct before expanding to all modules.

