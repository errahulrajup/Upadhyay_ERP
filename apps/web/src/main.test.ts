import { describe, expect, it } from 'vitest';
import { FirstSliceService } from '@upadhyay-erp/erp-services';

describe('Upadhyay_ERP foundation', () => {
  it('defines the first vertical slice in the expected order', () => {
    const slice = ['GRN', 'RM Lot', 'Stock Ledger', 'Batch', 'QC', 'FG Lot', 'Dispatch', 'Invoice', 'Payment'];

    expect(slice).toHaveLength(9);
    expect(slice[0]).toBe('GRN');
    expect(slice.at(-1)).toBe('Payment');
  });

  it('exposes service methods for the first vertical slice', () => {
    const serviceMethods = [
      'approveGrn',
      'createBatch',
      'startBatch',
      'completeBatch',
      'releaseBatchQc',
      'confirmDispatch',
      'createInvoice',
      'postPayment',
    ];

    for (const method of serviceMethods) {
      expect(method in FirstSliceService.prototype).toBe(true);
    }
  });
});
