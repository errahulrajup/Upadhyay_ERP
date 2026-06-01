# Phase 6 Vertical Slice Modules

Date: 2026-06-01

## Goal

Split the cockpit into module-shaped screens while keeping the same safe service boundary.

## Added

File:

- `apps/web/src/VerticalSliceModules.tsx`

Module cards:

- GRN Approval
- Batch Planning
- Batch Execution
- QC Release
- Dispatch
- Invoice and Payment
- Slice Controller

## Architecture Rule

The module cards do not call database tables.

Flow remains:

UI module -> `runVerticalSlice` -> `FirstSliceService` -> `RpcClient` -> SQL RPC

## Why This Matters

This is the first UI structure that resembles real ERP screens, but it remains simulation-safe. When live Supabase is attached, each module can be expanded into a full screen without changing the business boundary.

## Tests Added

File:

- `apps/web/src/VerticalSliceModules.test.tsx`

Coverage:

- first-slice step list contract
- default state readiness

## Next Phase

Phase 7 should add real data-entry models for each module:

- GRN form model
- Batch form model
- QC form model
- Dispatch form model
- Invoice/payment form model

Each model should have validation tests before adding live persistence.

