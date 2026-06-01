# Phase 3 ERP Service Layer

Date: 2026-06-01

## Goal

Create the application boundary that prevents frontend screens from directly owning critical multi-table ERP workflows.

## Packages Added

### `@upadhyay-erp/core`

Purpose:

- Shared `Result<T>` type
- App error codes
- Error normalization
- User-safe error messages
- ID helpers

Important files:

- `packages/core/src/result.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/ids.ts`

### `@upadhyay-erp/erp-services`

Purpose:

- Typed RPC client contract
- First vertical-slice service
- Frontend-safe validation before RPC call
- One application method per transactional business operation

Important files:

- `packages/erp-services/src/rpcClient.ts`
- `packages/erp-services/src/firstSliceService.ts`
- `packages/erp-services/src/types.ts`

## Service Methods

First vertical slice:

- `approveGrn`
- `createBatch`
- `startBatch`
- `completeBatch`
- `releaseBatchQc`
- `confirmDispatch`
- `createInvoice`
- `postPayment`

## Design Rules Enforced

1. UI calls service methods.
2. Service methods call RPCs.
3. UI does not directly write critical tables.
4. Invalid business actions are blocked before RPC call when possible.
5. RPC/database errors are normalized before reaching UI.

## Current RPC Client Status

`MissingRpcClient` is intentionally used in the web app until the Supabase project is attached.

This keeps Phase 3 honest:

- service boundary exists
- app compiles
- tests run
- no fake direct table writes are introduced

## Next Phase

Phase 4 should add a real infrastructure adapter:

- Supabase client wrapper
- environment validation
- typed RPC adapter
- first vertical-slice UI forms

