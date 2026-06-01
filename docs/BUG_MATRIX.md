# Master Bug Matrix (SVRERP Legacy)

This matrix documents the critical architectural and workflow failures identified in the old `D:\SVRERP` repository. These bugs are the primary drivers for the `Upadhyay_ERP` fresh rebuild.

## 1. Core Architectural Flaws
| ID | Domain | Severity | Description | Resolution Strategy in Fresh Repo |
|---|---|---|---|---|
| ARCH-01 | Global | Critical | Frontend directly writes to multiple tables using `supabase.from`. | All multi-table workflows must use RPCs. |
| ARCH-02 | Global | Critical | Missing database cascading foreign keys (`ON DELETE SET NULL` / `RESTRICT`). | Master data will use `is_active` soft deletes. FKs strictly enforced. |
| ARCH-03 | Global | High | Empty `catch (e)` blocks silently hide errors from the user. | Standardized API layer with global error handling and toast notifications. |
| ARCH-04 | Global | Critical | Business IDs (GRN No, Batch No, Invoice No) are generated in the frontend. | Use atomic counters via database RPC for all business IDs. |
| ARCH-05 | Global | Medium | Duplicate DB migrations across public/md schemas. | Unified, clean schema deployment. |

## 2. Supply Chain & Inventory
| ID | Domain | Severity | Description | Resolution Strategy in Fresh Repo |
|---|---|---|---|---|
| INV-01 | Inventory | High | Expiry calculations missing constraints; expired stock can be mistakenly approved. | Stricter database check constraints and RPC validation. |
| INV-02 | Inventory | High | GRN creation and Stock Ledger updates are not atomic. | RPC `approve_grn` to handle lot creation and ledger entry simultaneously. |
| INV-03 | Traceability | Critical | Traceability query fails due to missing ID linkages; relies on string matching. | Strict UUID foreign keys between GRN -> Lot -> Batch -> FG Lot. |

## 3. Manufacturing & QC
| ID | Domain | Severity | Description | Resolution Strategy in Fresh Repo |
|---|---|---|---|---|
| MFG-01 | Production | High | Batch components allow duplicate ingredients. | Unique constraint on `(batch_id, ingredient_id)`. |
| MFG-02 | Production | High | Batch completion updates `fg_lots` but sometimes fails to decrement RM `lots`. | Transactional `complete_batch` RPC. |
| MFG-03 | Production | Medium | Unlinked ingredients silently ignored during formula promotion. | Strong validation before promotion. |
| QC-01 | QC | Critical | CoA generation allows invalid/missing parameters. | Enforce QC approval state before CoA generation. |

## 4. Finance & Sales
| ID | Domain | Severity | Description | Resolution Strategy in Fresh Repo |
|---|---|---|---|---|
| FIN-01 | Accounts | High | Payment posting and Invoice status update are not atomic. | Transactional `post_payment` RPC. |
| FIN-02 | Dispatch | High | Dispatch confirmations can happen without deducting FG stock securely. | Transactional `confirm_dispatch` RPC. |

## 5. R&D and FSMS
| ID | Domain | Severity | Description | Resolution Strategy in Fresh Repo |
|---|---|---|---|---|
| RND-01 | R&D | Medium | Trial results can be marked COMPLETED without entering yield/pH. | Application-level + DB-level validation. |
| FSMS-01 | Compliance | High | Recall workflows use manual text matching for customers. | UUID linkages for Dispatch -> Customer -> Recall. |

---
**Status**: Frozen. No new bugs will be added unless identified in the legacy system during reference checks.
