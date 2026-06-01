# Upadhyay_ERP Database Infrastructure

This directory contains the database schema, RPC functions, policies, and seed data for the fresh ERP rebuild.

## Directory Structure
- `01_schema_draft.sql`: The primary schema definitions for the current phase (First Vertical Slice).
- `migrations/`: (To be added) Forward-only migration scripts once production is live.
- `seeds/`: Initial data required for staging and tests (roles, master data).

## Database Principles

1. **Transactional Integrity**: Business actions spanning multiple tables must be wrapped in PostgreSQL functions (`RPCs`).
2. **Row Level Security (RLS)**: Every table must have RLS enabled. Policies will restrict read/write access based on the user's role defined in `auth.users` metadata or an `app_users` table.
3. **Soft Deletes**: Use `is_active` for master tables. No hard deletes for trace records.
4. **Data Types**: 
    - Use `UUID` for all primary keys.
    - Use `TIMESTAMPTZ` for all timestamps.
    - Use `NUMERIC` for financial or quantity data.

## Deployment Strategy
Before running on production, all schemas MUST be dry-run against a staging database containing a snapshot of production data.
