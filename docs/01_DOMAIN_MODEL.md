# Upadhyay_ERP Domain Model

## Domains

### Platform

- Auth
- Admin
- Roles
- Audit
- System health
- DMS
- CMS

### Master Data

- Products
- Materials
- Suppliers
- Customers
- Work centers
- Equipment
- Recipes

### Supply Chain

- GRN
- RM lots
- Stock ledger
- Storage
- FG store
- Logistics
- Sales returns

### Manufacturing

- Recipe versions
- Batch planning
- Batch execution
- RM consumption
- Yield
- Costing
- Packaging

### Quality and Food Safety

- GRN QC
- Batch QC
- CoA
- FSMS
- HACCP
- PRP
- SOP
- Allergen
- Recall
- CAPA
- Compliance audits

### Finance

- Dispatch
- Invoices
- Payments
- Expenses
- Cost postings
- Reconciliation

### RND

- Ingredients
- Formulas
- Trials
- Lab notebook
- Product validation
- Formula promotion to production recipe

## Integration Chain

GRN -> RM Lot -> Stock Ledger -> Batch Consumption -> Batch -> QC -> FG Lot -> Dispatch -> Invoice -> Payment

## Traceability Chain

Supplier -> GRN -> RM Lot -> Batch -> FG Lot -> Customer Dispatch -> Recall

