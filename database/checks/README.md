# Data Quality Checks

Checks will be added before each migration phase closes.

Required checks:

- orphan FG lots
- stock movement vs lot remaining quantity
- invoice paid amount vs payments
- batches without recipe version
- QC pass without required result set
- missing audit events for critical state transitions

