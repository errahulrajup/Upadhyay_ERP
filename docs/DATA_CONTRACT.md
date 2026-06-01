# Upadhyay_ERP Data Contract

This document defines the strict rules for all database interactions in `Upadhyay_ERP`.

## 1. Zero-Trust Frontend
- The frontend (`apps/web`) is never trusted to write directly to multiple tables in a single operation.
- **Rule**: If an action requires writing to more than one table (e.g., GRN creation + Stock Ledger), it **MUST** be performed via a backend RPC function (stored procedure) or a strict backend endpoint.
- Direct `supabase.from('table').insert()` is ONLY allowed for simple, single-table inserts (e.g., creating a master data record like a Customer).

## 2. Business Identifiers
- **Rule**: Business IDs (GRN numbers, Invoice numbers, Lot numbers, Batch IDs) must NEVER be generated on the client side (e.g., using `Math.random()` or JS date strings).
- **Enforcement**: All business IDs must be generated atomically by a database function or sequence to prevent duplicates.

## 3. Database Schema is the Source of Truth
- **Foreign Keys**: Every relationship must have a physical foreign key constraint in the database.
- **Soft Deletes**: Master data tables (Products, Users, Locations, Ingredients) must never be hard-deleted. They must use an `is_active` boolean.
  - Cascading deletes (`ON DELETE CASCADE`) are only allowed for purely child records (e.g., deleting a Batch component when the Batch is deleted).
  - Business records (Invoices, Dispatches) should use `ON DELETE RESTRICT` or `SET NULL`.
- **Audit Columns**: EVERY table (except simple joins) must have:
  - `created_at` (timestamptz DEFAULT now())
  - `updated_at` (timestamptz)
  - `created_by` (uuid REFERENCES auth.users)
  - `updated_by` (uuid REFERENCES auth.users)

## 4. Error Handling Contract
- Database constraints MUST throw explicit errors.
- The API wrapper MUST catch these errors, translate them into human-readable messages based on error codes (e.g., duplicate key = "This record already exists"), and display them via a unified toast/notification UI.
- **Rule**: Silent failures (`catch (e) { console.error(e) }`) are strictly banned.

## 5. Traceability Linkage
- No text-based lookups for trace.
- A batch must link to its components via UUID.
- An FG lot must link to its Batch via UUID.
- A Dispatch must link to FG lots via UUID.
- An Invoice must link to a Dispatch via UUID.
