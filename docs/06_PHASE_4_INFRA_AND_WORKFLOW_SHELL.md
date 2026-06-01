# Phase 4 Infrastructure Adapter and Workflow Shell

Date: 2026-06-01

## Goal

Attach a clean infrastructure boundary without introducing old direct-table workflow behavior.

## Added

### `@upadhyay-erp/infra`

Files:

- `packages/infra/src/env.ts`
- `packages/infra/src/supabaseRpcClient.ts`
- `packages/infra/src/fakeRpcClient.ts`

Purpose:

- validate runtime env
- provide Supabase-like RPC adapter shape
- provide fake RPC client for local simulation

### Web Workflow Shell

The web app now has:

- service layer status panel
- live/simulation mode message
- first vertical-slice simulation button
- workflow log for GRN -> Payment service calls

## Current Mode

Default mode is simulation because live Supabase credentials are not attached.

This is intentional. The UI exercises the same `FirstSliceService` methods that live mode will use, but with `FakeRpcClient`.

## Live Mode Requirements

To connect live mode:

1. Set env values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Add actual Supabase client dependency.
3. Instantiate `SupabaseRpcClient`.
4. Pass it into `FirstSliceService`.
5. Run migrations against staging.
6. Smoke test `inv.approve_grn` first.

## Safety Rule

No UI form may write directly to critical tables.

Allowed:

- UI -> `FirstSliceService` -> `RpcClient` -> SQL RPC

Not allowed:

- UI -> direct insert/update into GRN, lot, batch, QC, dispatch, invoice, or payment tables

## Phase 4 Gate Commands

```powershell
npm install
npm run build
npm test
npm run db:check
```

