# Upadhyay_ERP

Fresh ERP restructure repository.

This repo is intentionally clean. It does not modify or depend on the old `D:\SVRERP` working tree. The old project is treated only as a reference source for requirements, bug evidence, and business workflow understanding.

## Program Rule

No messy legacy data, half-fixed migrations, or direct copy-paste architecture will be carried into this repo.

Upadhyay_ERP will be rebuilt with:

- Clean database contract
- Domain-based architecture
- Transactional business operations
- Atomic business numbering
- Strong audit trail
- Role-based access control
- Phase-wise testing and sign-off

## Repository Structure

- `apps/` - frontend and application entry points
- `packages/` - shared UI, API, domain, and utility packages
- `database/` - migrations, seed data, RLS, RPCs, and restore scripts
- `docs/` - architecture, process, implementation, testing, and migration docs
- `tools/` - scripts for validation, migration, audits, and test data

## First Delivery Goal

Build the first stable vertical slice:

GRN -> RM Lot -> Stock Ledger -> Batch -> QC -> FG Lot -> Dispatch -> Invoice -> Payment

## Current Status

- Phase 1 foundation: complete
- Phase 2 database contract: complete
- Phase 3 service layer: complete
- Phase 4 infrastructure adapter and workflow shell: complete
- Phase 5 vertical-slice cockpit: complete
- Phase 6 vertical-slice module cards: complete
- Phase 7 module form models: complete
- Phase 8 route-ready screen split: complete
